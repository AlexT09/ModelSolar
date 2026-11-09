"""Las cuatro estrategias de balanceo y el pipeline que las aplica sin fuga.

- ``ninguno``: los datos tal cual.
- ``smote``: SMOTE (Chawla et al., 2002) crea puntos sintéticos de la clase minoritaria interpolando entre vecinos.
- ``adasyn``: ADASYN (He et al., 2008) crea más sintéticos donde la minoritaria es más difícil de aprender.
- ``class_weight``: no crea datos; pesa cada clase por el inverso de su frecuencia en la función de pérdida.

SMOTE y ADASYN van dentro de un `imblearn.pipeline.Pipeline` (Lemaître et al., 2017): el muestreo ocurre solo
en `fit`, es decir, solo con el entrenamiento del pliegue. Validación y prueba nunca ven puntos sintéticos.
Se escala antes de remuestrear porque los dos métodos buscan vecinos por distancia euclidiana.
"""
from imblearn.over_sampling import ADASYN, SMOTE
from imblearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.utils.class_weight import compute_sample_weight

from . import config

BALANCEOS = ["ninguno", "smote", "adasyn", "class_weight"]

# Modelos con `class_weight` nativo.
CON_CLASS_WEIGHT = {"Regresión logística", "Árbol de decisión", "Random Forest", "SVM RBF"}
# Sin el parámetro, pero aceptan `sample_weight` en `fit`: es la misma ponderación por el inverso de la frecuencia.
CON_SAMPLE_WEIGHT = {"Naive Bayes", "XGBoost"}
# KNN no minimiza una pérdida que se pueda ponderar. Se declara no aplicable en vez de inventar un equivalente.
NO_APLICA = {("KNN", "class_weight")}


def aplica(modelo, balanceo):
    """False si la combinación modelo-balanceo no tiene sentido y se registra como no aplicable."""
    return (modelo, balanceo) not in NO_APLICA


def construir(estimador, modelo, balanceo, semilla=config.SEED):
    """Pipeline imputar → escalar → (remuestrear) → modelo. Cada paso se ajusta solo con el entrenamiento.

    Returns:
        El pipeline. El último paso se llama ``m``, así los hiperparámetros se fijan como ``m__<nombre>``.
    """
    if not aplica(modelo, balanceo):
        raise ValueError(f"{modelo} con {balanceo} no aplica")
    pasos = [("imp", SimpleImputer(strategy="median")), ("esc", StandardScaler())]
    if balanceo == "smote":
        pasos.append(("bal", SMOTE(random_state=semilla)))
    elif balanceo == "adasyn":
        pasos.append(("bal", ADASYN(random_state=semilla)))
    elif balanceo == "class_weight" and modelo in CON_CLASS_WEIGHT:
        estimador = estimador.set_params(class_weight="balanced")
    pasos.append(("m", estimador))
    return Pipeline(pasos)


def argumentos_fit(modelo, balanceo, y_tr):
    """Argumentos extra de `fit`: el peso por muestra para Naive Bayes y XGBoost con ``class_weight``."""
    if balanceo == "class_weight" and modelo in CON_SAMPLE_WEIGHT:
        return {"m__sample_weight": compute_sample_weight("balanced", y_tr)}
    return {}
