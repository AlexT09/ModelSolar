"""Interpretabilidad: SHAP global y local, y comparación LIME frente a SHAP.

SHAP reparte la predicción entre las variables con valores de Shapley (Lundberg y Lee, 2017); en árboles se calcula
exacto y rápido con TreeSHAP (Lundberg et al., 2020). LIME ajusta un modelo lineal alrededor de una observación con
perturbaciones (Ribeiro et al., 2016). Si las dos explicaciones coinciden en una observación, la explicación es más
creíble; donde divergen suele haber interacciones fuertes o una frontera de clase cerca.

Las explicaciones se calculan sobre las variables ya imputadas y estandarizadas, que es lo que ve el modelo. Los pasos
de SMOTE y ADASYN no intervienen al transformar: imblearn los salta fuera de `fit`.
"""
import numpy as np
from scipy import stats as st

from . import config


def separar(pipe):
    """(transformador, modelo): todos los pasos menos el último, y el último."""
    return pipe[:-1], pipe[-1]


def valores_shap(pipe, X, nombres, fondo=None, semilla=config.SEED):
    """Explicación SHAP para las filas de X.

    Usa TreeExplainer en árboles, bosques y XGBoost; en el resto, el explicador por permutación con un fondo de
    hasta 200 filas (más fondo no cambia mucho el resultado y multiplica el costo).
    """
    import shap
    trans, modelo = separar(pipe)
    Xt = trans.transform(X)
    nombre = type(modelo).__name__
    if any(t in nombre for t in ("Tree", "Forest", "XGB")):
        exp = shap.TreeExplainer(modelo)(Xt)
    else:
        f = modelo.predict_proba if hasattr(modelo, "predict_proba") else modelo.predict
        base = trans.transform(fondo) if fondo is not None else Xt
        rng = np.random.default_rng(semilla)
        base = base[rng.choice(len(base), min(200, len(base)), replace=False)]
        exp = shap.Explainer(f, base, algorithm="permutation", seed=semilla)(Xt)
    exp.feature_names = list(nombres)
    return exp


def lime_vs_shap(pipe, X_fondo, x, nombres, clase, valores_shap_x, k=5, semilla=config.SEED):
    """Explica una observación con LIME y la compara con su explicación SHAP.

    Args:
        valores_shap_x: vector SHAP de la misma observación y clase (longitud = número de variables).
        clase: índice de la clase explicada (en regresión, None).

    Returns:
        Pesos de LIME por variable, correlación de Spearman entre las dos atribuciones y cuántas de las k variables
        más importantes comparten.
    """
    from lime.lime_tabular import LimeTabularExplainer
    trans, modelo = separar(pipe)
    fondo = trans.transform(X_fondo)
    xt = trans.transform(np.atleast_2d(x))[0]
    regresion = clase is None
    explicador = LimeTabularExplainer(fondo, feature_names=list(nombres), mode="regression" if regresion else "classification",
                                      discretize_continuous=False, random_state=semilla)
    f = modelo.predict if regresion else modelo.predict_proba
    e = explicador.explain_instance(xt, f, num_features=len(nombres), labels=None if regresion else (clase,))
    mapa = dict(e.as_map()[1 if regresion else clase])
    pesos = np.array([mapa.get(i, 0.0) for i in range(len(nombres))])
    rho = st.spearmanr(pesos, valores_shap_x).statistic
    top = lambda v: set(np.argsort(-np.abs(v))[:k])
    return {"lime": dict(zip(nombres, pesos)), "spearman": float(rho),
            f"coinciden_top{k}": len(top(pesos) & top(np.asarray(valores_shap_x)))}
