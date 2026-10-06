"""Lectura de la tabla maestra y de las predicciones fuera de pliegue, para los cuadernos de resultados.

Para mostrar "el mejor" de cada modelo se elige la combinación de balanceo y optimizador con mejor puntaje del bucle
interno, no del externo. Elegir con la prueba externa y reportar esa misma prueba volvería a meter el sesgo de
selección que la validación anidada quita (Cawley y Talbot, 2010).
"""
import json

import numpy as np
import pandas as pd
from sklearn.calibration import calibration_curve
from sklearn.isotonic import IsotonicRegression
from sklearn.linear_model import LogisticRegression

from . import config, data, runner

CLAVES = ["tarea", "modelo", "balanceo", "optimizador"]


def cargar(incluir_halving=False):
    """(maestra, resumen) solo con combinaciones completas (los 5 pliegues externos).

    El halving no es parte de las 140 combinaciones; se excluye salvo que se pida, para que no compita al elegir
    el mejor caso de cada modelo ni entre en los promedios por balanceo.
    """
    maestra = pd.read_parquet(config.MAESTRA)
    if not incluir_halving:
        maestra = maestra[maestra.optimizador != "halving"]
    res = runner.resumen(maestra)
    res = res[res.pliegues == config.K_EXTERNO].reset_index(drop=True)
    completas = res[CLAVES].apply(tuple, axis=1)
    maestra = maestra[maestra[CLAVES].apply(tuple, axis=1).isin(set(completas))].reset_index(drop=True)
    return maestra, res


def mejores_por_modelo(res, tarea):
    """Una fila por modelo: la combinación con mejor puntaje interno medio."""
    r = res[res.tarea == tarea]
    return r.loc[r.groupby("modelo").puntaje_interno.idxmax()].set_index("modelo", drop=False).rename_axis(None)


def oof(fila):
    """Predicciones fuera de pliegue de una combinación (fila con tarea, modelo, balanceo y optimizador)."""
    c = {k: fila[k] for k in CLAVES} if not isinstance(fila, dict) else fila
    z = np.load(config.OOF / f"{runner.id_corrida(c)}.npz")
    return {k: z[k] for k in z.files}


def params_por_pliegue(maestra, fila):
    """Hiperparámetros elegidos en cada pliegue externo, para ver si son estables."""
    m = maestra
    for k in CLAVES:
        m = m[m[k] == fila[k]]
    return pd.DataFrame([{"pliegue": p, **json.loads(s)} for p, s in zip(m.pliegue, m.params)]).set_index("pliegue")


def recalibrar_cruzado(proba, y, pliegue, metodo="isotonica"):
    """Recalibra probabilidades fuera de pliegue sin fuga: el calibrador de cada pliegue se ajusta con los otros cuatro.

    Uno contra el resto por clase y renormalizado. Platt ajusta una sigmoide (Platt, 1999); la isotónica, una función
    monótona por tramos (Zadrozny y Elkan, 2002), más flexible pero más propensa a sobreajustar con pocos datos.
    """
    salida = np.zeros_like(proba)
    for k in np.unique(pliegue):
        tr, te = pliegue != k, pliegue == k
        for c in range(proba.shape[1]):
            yc = (y[tr] == c).astype(int)
            if metodo == "isotonica":
                cal = IsotonicRegression(out_of_bounds="clip", y_min=0, y_max=1).fit(proba[tr, c], yc)
                salida[te, c] = cal.predict(proba[te, c])
            else:
                cal = LogisticRegression().fit(proba[tr, c].reshape(-1, 1), yc)
                salida[te, c] = cal.predict_proba(proba[te, c].reshape(-1, 1))[:, 1]
    suma = salida.sum(1, keepdims=True)
    return np.where(suma > 0, salida / np.where(suma > 0, suma, 1), 1 / proba.shape[1])


def confiabilidad(y, proba, bins=10):
    """Puntos del diagrama de confiabilidad con la confianza máxima: (confianza media, exactitud) por grupo."""
    conf = proba.max(1)
    acierto = (proba.argmax(1) == y).astype(int)
    frac, media = calibration_curve(acierto, conf, n_bins=bins, strategy="quantile")
    return media, frac


def base():
    return data.cargar()
