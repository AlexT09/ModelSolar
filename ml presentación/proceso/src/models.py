"""Los 7 modelos de clasificación y los 7 de regresión, con sus espacios de búsqueda.

Rangos adaptados de Probst, Boulesteix y Bischl (2019), que midieron qué hiperparámetros conviene ajustar y en
qué rangos para árboles, bosques, XGBoost, SVM, kNN y modelos lineales regularizados. Para el SVM se sigue además
la guía de Hsu, Chang y Lin (2003): C y gamma en escala logarítmica. Los rangos se recortan donde el costo
de cómputo lo exige (número de árboles), y se dice en cada caso.
"""
import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin, RegressorMixin
from sklearn.calibration import CalibratedClassifierCV
from sklearn.linear_model import Lasso, LogisticRegression, Ridge
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.svm import SVC, SVR
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from xgboost import XGBClassifier, XGBRegressor

from . import config


class _SVMSubmuestra(BaseEstimator):
    """SVM con kernel RBF entrenado en una submuestra del entrenamiento.

    Expone C, gamma y epsilon como parámetros propios para que los cuatro optimizadores los nombren igual.
    En clasificación la submuestra es estratificada, para no perder la clase Baja.
    """

    def __init__(self, C=1.0, gamma="scale", epsilon=0.1, n=config.N_SUBMUESTRA_SVM, probability=False,
                 class_weight=None, random_state=config.SEED):
        self.C, self.gamma, self.epsilon, self.n = C, gamma, epsilon, n
        self.probability, self.class_weight, self.random_state = probability, class_weight, random_state

    def _indices(self, y):
        rng = np.random.default_rng(self.random_state)
        if len(y) <= self.n:
            return np.arange(len(y))
        if not isinstance(self, ClassifierMixin):
            return rng.choice(len(y), self.n, replace=False)
        idx = []
        for c in np.unique(y):
            de_c = np.flatnonzero(y == c)
            k = max(1, int(round(self.n * len(de_c) / len(y))))
            idx.append(rng.choice(de_c, min(k, len(de_c)), replace=False))
        return np.concatenate(idx)

    def predict(self, X):
        return self.est_.predict(X)


class SVCSubmuestra(ClassifierMixin, _SVMSubmuestra):
    """Con ``probability=True`` las probabilidades salen de un escalado de Platt con 5 pliegues (Platt, 1999), que es lo que
    hacía ``SVC(probability=True)``, deprecado en scikit-learn 1.9."""

    def fit(self, X, y):
        i = self._indices(np.asarray(y))
        svc = SVC(kernel="rbf", C=self.C, gamma=self.gamma, class_weight=self.class_weight, random_state=self.random_state)
        if self.probability:
            svc = CalibratedClassifierCV(svc, method="sigmoid", cv=5, ensemble=False)
        self.est_ = svc.fit(X[i], y[i])
        self.classes_ = self.est_.classes_
        return self

    def predict_proba(self, X):
        return self.est_.predict_proba(X)


class SVRSubmuestra(RegressorMixin, _SVMSubmuestra):
    def fit(self, X, y):
        i = self._indices(np.asarray(y))
        self.est_ = SVR(kernel="rbf", C=self.C, gamma=self.gamma, epsilon=self.epsilon).fit(X[i], y[i])
        return self


def estimador(tarea, nombre, semilla=config.SEED):
    """Instancia nueva del modelo, con la semilla propagada y un solo hilo.

    Un hilo por modelo porque el paralelismo va por pliegue externo y combinación (ver `runner`); así además el
    tiempo por evaluación es comparable entre optimizadores.

    Dos decisiones de costo medidas en el piloto (pliegue interno de 31 mil filas, mismo F1):
    - KNN por fuerza bruta con distancia euclidiana: 0.28 s frente a 4.7 s del KD-Tree con 15 variables, donde los
      árboles de búsqueda pierden eficacia. La comparación completa de algoritmos va en la sección computacional.
    - Regresión logística con saga y tolerancia 1e-3: 0.6 s frente a 5.4 s con 1e-4.
    """
    fabricas = {
        "clf": {
            "KNN": lambda: KNeighborsClassifier(algorithm="brute", n_jobs=1),
            "Naive Bayes": lambda: GaussianNB(),
            "Regresión logística": lambda: LogisticRegression(solver="saga", tol=1e-3, max_iter=1000,
                                                              random_state=semilla),
            "Árbol de decisión": lambda: DecisionTreeClassifier(random_state=semilla),
            "Random Forest": lambda: RandomForestClassifier(n_jobs=1, random_state=semilla),
            "XGBoost": lambda: XGBClassifier(tree_method="hist", n_jobs=1, random_state=semilla, verbosity=0),
            "SVM RBF": lambda: SVCSubmuestra(random_state=semilla),
        },
        "reg": {
            "KNN": lambda: KNeighborsRegressor(algorithm="brute", n_jobs=1),
            "Ridge": lambda: Ridge(random_state=semilla),
            "Lasso": lambda: Lasso(max_iter=10000, random_state=semilla),
            "Árbol de decisión": lambda: DecisionTreeRegressor(random_state=semilla),
            "Random Forest": lambda: RandomForestRegressor(n_jobs=1, random_state=semilla),
            "XGBoost": lambda: XGBRegressor(tree_method="hist", n_jobs=1, random_state=semilla, verbosity=0),
            "SVR RBF": lambda: SVRSubmuestra(random_state=semilla),
        },
    }
    return fabricas[tarea][nombre]()


MODELOS = {
    "clf": ["KNN", "Naive Bayes", "Regresión logística", "Árbol de decisión", "Random Forest", "XGBoost", "SVM RBF"],
    "reg": ["KNN", "Ridge", "Lasso", "Árbol de decisión", "Random Forest", "XGBoost", "SVR RBF"],
}

# La distancia queda fija en euclidiana: en el piloto Manhattan dio el mismo F1 (0.788 frente a 0.793) y es 16 veces más lenta.
_KNN = {"n_neighbors": ("int", 1, 60, True), "weights": ("cat", ("uniform", "distance"))}
_ARBOL = {"max_depth": ("int", 1, 30, False), "min_samples_leaf": ("int", 1, 60, True),
          "min_samples_split": ("int", 2, 60, True), "max_features": ("float", 0.1, 1.0, False)}
# Probst et al. muestran que el número de árboles casi no se gana ajustándolo (más es mejor); se acota a 200 por costo.
# En el piloto, 150 árboles con la mitad de las filas dieron el mismo F1 que 300 con todas (0.897 frente a 0.897).
_BOSQUE = {"n_estimators": ("int", 50, 200, False), "max_features": ("float", 0.1, 1.0, False),
           "min_samples_leaf": ("int", 1, 50, True), "max_samples": ("float", 0.1, 1.0, False)}
_XGB = {"n_estimators": ("int", 50, 300, False), "learning_rate": ("float", 2**-10, 1.0, True),
        "max_depth": ("int", 1, 15, False), "min_child_weight": ("float", 1.0, 2**7, True),
        "subsample": ("float", 0.1, 1.0, False), "colsample_bytree": ("float", 0.1, 1.0, False)}
_SVM = {"C": ("float", 2**-5, 2**10, True), "gamma": ("float", 2**-10, 2**3, True)}

ESPACIOS = {
    "clf": {
        "KNN": _KNN,
        "Naive Bayes": {"var_smoothing": ("float", 1e-12, 1.0, True)},
        # l1_ratio 0 es L2 y 1 es L1: cubre "regresión logística L1/L2" del enunciado.
        "Regresión logística": {"C": ("float", 2**-10, 2**10, True), "l1_ratio": ("cat", (0.0, 1.0))},
        "Árbol de decisión": _ARBOL,
        "Random Forest": _BOSQUE,
        "XGBoost": _XGB,
        "SVM RBF": _SVM,
    },
    "reg": {
        "KNN": _KNN,
        "Ridge": {"alpha": ("float", 2**-10, 2**10, True)},
        "Lasso": {"alpha": ("float", 1e-6, 1.0, True)},
        "Árbol de decisión": _ARBOL,
        "Random Forest": _BOSQUE,
        "XGBoost": _XGB,
        "SVR RBF": {**_SVM, "epsilon": ("float", 1e-3, 0.2, True)},
    },
}

# Cambios que solo se aplican al reentrenar el ganador con todo el entrenamiento externo.
# El SVM busca sin probabilidades (el F1 solo usa la predicción) y al final las calcula para AUC, Brier y ECE.
FINAL = {("clf", "SVM RBF"): {"probability": True}}
