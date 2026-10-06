"""Optimización computacional: complejidad empírica y versiones optimizadas de cada modelo.

Para cada modelo se mide el tiempo de entrenamiento e inferencia al variar n (filas) y p (variables) y se ajusta
t ≈ a · n^b en escala log-log. El exponente b se contrasta con la complejidad teórica. Las mediciones deben correr
con la máquina libre: si hay otros procesos pesados, los tiempos no sirven.
"""
import time
import tracemalloc

import numpy as np
import pandas as pd
from sklearn.base import clone

from . import config


def cronometrar(funcion, repeticiones=3):
    """Mediana de `repeticiones` ejecuciones, en segundos. La mediana resiste mejor una ejecución interrumpida."""
    tiempos = []
    for _ in range(repeticiones):
        t0 = time.perf_counter()
        funcion()
        tiempos.append(time.perf_counter() - t0)
    return float(np.median(tiempos))


def memoria_pico(funcion):
    """Pico de memoria asignada por Python durante la llamada, en MB (tracemalloc).

    No ve la memoria que reservan bibliotecas en C fuera del asignador de Python (parte de XGBoost y FAISS),
    así que es una cota inferior.
    """
    tracemalloc.start()
    try:
        funcion()
        _, pico = tracemalloc.get_traced_memory()
    finally:
        tracemalloc.stop()
    return pico / 2**20


def escalamiento(estimador, X, y, tamanos, X_pred=None, repeticiones=3, semilla=config.SEED):
    """Tiempos de entrenamiento e inferencia para cada tamaño de muestra.

    Returns:
        DataFrame con n, segundos de entrenamiento y segundos de inferencia (sobre `X_pred`, fijo).
    """
    rng = np.random.default_rng(semilla)
    X_pred = X[:2000] if X_pred is None else X_pred
    filas = []
    for n in tamanos:
        i = rng.choice(len(X), n, replace=False)
        m = clone(estimador)
        t_fit = cronometrar(lambda: m.fit(X[i], y[i]), repeticiones)
        t_pred = cronometrar(lambda: m.predict(X_pred), repeticiones)
        filas.append({"n": n, "t_entrenamiento": t_fit, "t_inferencia": t_pred})
    return pd.DataFrame(filas)


def exponente(n, t):
    """Pendiente b de log t = log a + b log n, por mínimos cuadrados, y su R²."""
    x, y = np.log(np.asarray(n, float)), np.log(np.maximum(np.asarray(t, float), 1e-6))
    b, a = np.polyfit(x, y, 1)
    r2 = 1 - np.sum((y - (a + b * x)) ** 2) / np.sum((y - y.mean()) ** 2)
    return float(b), float(r2)


class KNNFaiss:
    """KNN de clasificación con búsqueda de vecinos en FAISS (Johnson et al., 2021).

    `exacto=True` usa `IndexFlatL2` (fuerza bruta en C++ con SIMD); `exacto=False` usa `IndexHNSWFlat`, una búsqueda
    aproximada por grafos (Malkov y Yashunin, 2020) que cambia algo de exactitud por velocidad.
    """

    def __init__(self, n_neighbors=15, exacto=True, m_hnsw=32):
        self.n_neighbors, self.exacto, self.m_hnsw = n_neighbors, exacto, m_hnsw

    def get_params(self, deep=True):
        return {"n_neighbors": self.n_neighbors, "exacto": self.exacto, "m_hnsw": self.m_hnsw}

    def set_params(self, **p):
        for k, v in p.items():
            setattr(self, k, v)
        return self

    def fit(self, X, y):
        import faiss
        X = np.ascontiguousarray(X, dtype="float32")
        d = X.shape[1]
        self.indice_ = faiss.IndexFlatL2(d) if self.exacto else faiss.IndexHNSWFlat(d, self.m_hnsw)
        self.indice_.add(X)
        self.y_ = np.asarray(y)
        self.classes_ = np.unique(self.y_)
        return self

    def predict(self, X):
        _, vecinos = self.indice_.search(np.ascontiguousarray(X, dtype="float32"), self.n_neighbors)
        votos = self.y_[vecinos]
        return np.array([np.bincount(v, minlength=len(self.classes_)).argmax() for v in votos])
