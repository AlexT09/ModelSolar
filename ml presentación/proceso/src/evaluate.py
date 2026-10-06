"""Métricas del bucle interno (para elegir) y del externo (para reportar).

Clasificación: se elige con F1 macro, que pesa igual las tres clases; la exactitud premiaría ignorar la clase Baja (3 %).
Regresión: se elige con RMSE, que castiga más los errores grandes, los que cruzan de una clase a otra (contexto §5.7).
"""
import numpy as np
from sklearn.metrics import (accuracy_score, balanced_accuracy_score, brier_score_loss, cohen_kappa_score, f1_score,
                             mean_absolute_error, mean_squared_error, precision_score, r2_score, recall_score,
                             roc_auc_score)

ETIQUETAS = [0, 1, 2]


def puntaje_interno(tarea, y, pred):
    """Mayor es mejor en los dos casos: F1 macro, o RMSE con signo negativo."""
    if tarea == "clf":
        return f1_score(y, pred, average="macro")
    return -float(np.sqrt(mean_squared_error(y, pred)))


def ece(y, proba, bins=15):
    """Error de calibración esperado, versión de máxima confianza (Guo et al., 2017).

    Agrupa las predicciones por su probabilidad máxima y promedia |exactitud − confianza| pesado por el tamaño del grupo.
    """
    conf = proba.max(1)
    acierto = proba.argmax(1) == y
    bordes = np.linspace(0, 1, bins + 1)
    total = 0.0
    for a, b in zip(bordes[:-1], bordes[1:]):
        en = (conf > a) & (conf <= b)
        if en.any():
            total += en.mean() * abs(acierto[en].mean() - conf[en].mean())
    return float(total)


def brier_multiclase(y, proba):
    """Brier multiclase: promedio sobre clases del Brier uno contra el resto."""
    return float(np.mean([brier_score_loss(y == c, proba[:, c]) for c in ETIQUETAS]))


def metricas_clf(y, pred, proba):
    """Métricas externas de clasificación. `proba` puede ser None si el modelo no da probabilidades."""
    m = {"f1_macro": f1_score(y, pred, average="macro"), "exactitud": accuracy_score(y, pred),
         "exactitud_bal": balanced_accuracy_score(y, pred),
         "precision_macro": precision_score(y, pred, average="macro", zero_division=0),
         "recall_macro": recall_score(y, pred, average="macro", zero_division=0),
         "f1_baja": f1_score(y, pred, labels=[0], average="macro", zero_division=0),
         "recall_baja": recall_score(y, pred, labels=[0], average="macro", zero_division=0),
         "kappa_cuad": cohen_kappa_score(y, pred, weights="quadratic")}
    if proba is not None:
        m.update(auc_ovr=roc_auc_score(y, proba, multi_class="ovr", average="macro", labels=ETIQUETAS),
                 brier=brier_multiclase(y, proba), ece=ece(y, proba))
    return m


def metricas_reg(y, pred):
    """Métricas externas de regresión."""
    return {"r2": r2_score(y, pred), "rmse": float(np.sqrt(mean_squared_error(y, pred))),
            "mae": mean_absolute_error(y, pred)}
