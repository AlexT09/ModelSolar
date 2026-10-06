"""Particiones de la validación anidada por bloques espaciales.

Un bloque de 5° × 5° cae entero en entrenamiento o en prueba. Con partición aleatoria, plantas vecinas quedan a
los dos lados y el error sale optimista (Roberts et al., 2017; Ploton et al., 2020).
"""
import numpy as np
from sklearn.model_selection import StratifiedGroupKFold

from . import config


def externas(y_clf, grupos, k=config.K_EXTERNO, semilla=config.SEED):
    """Pliegues externos: solo miden. Se estratifica por clase para que la clase Baja (3 %) aparezca en cada prueba.

    Clasificación y regresión usan los mismos pliegues, así los resultados de las dos tareas son comparables.

    Returns:
        Lista de pares (índices de entrenamiento, índices de prueba).
    """
    cv = StratifiedGroupKFold(n_splits=k, shuffle=True, random_state=semilla)
    return list(cv.split(np.zeros(len(y_clf)), y_clf, grupos))


def internas(y_clf_tr, grupos_tr, k=config.K_INTERNO, semilla=config.SEED):
    """Pliegues internos sobre el entrenamiento de un pliegue externo. Eligen hiperparámetros.

    Se calculan una vez por pliegue externo y los comparten los cuatro optimizadores, de modo que todos
    evalúan cada candidato con exactamente las mismas particiones.
    """
    cv = StratifiedGroupKFold(n_splits=k, shuffle=True, random_state=semilla)
    return list(cv.split(np.zeros(len(y_clf_tr)), y_clf_tr, grupos_tr))
