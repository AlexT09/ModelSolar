"""Evaluador común: puntúa un candidato con los pliegues internos y lleva la traza.

Los cuatro optimizadores llaman al mismo evaluador, que:

- ajusta el pipeline completo dentro de cada pliegue interno (imputar, escalar y remuestrear solo con su entrenamiento);
- cuenta el presupuesto en evaluaciones distintas: un candidato repetido sale del caché y no gasta presupuesto;
- registra puntaje, tiempo y error de cada evaluación, para las curvas de desempeño en cualquier momento.
"""
import time
from dataclasses import dataclass, field

import numpy as np
from sklearn.base import clone

from .. import balancing, evaluate
from .espacio import clave_params


def _estratificada(y, fraccion, rng, tarea):
    """Índices de una submuestra; estratificada por clase en clasificación, para no perder la clase Baja."""
    if fraccion >= 1.0:
        return np.arange(len(y))
    if tarea != "clf":
        return rng.choice(len(y), max(1, int(len(y) * fraccion)), replace=False)
    partes = []
    for c in np.unique(y):
        de_c = np.flatnonzero(y == c)
        partes.append(rng.choice(de_c, min(len(de_c), max(6, int(len(de_c) * fraccion))), replace=False))
    return np.concatenate(partes)  # al menos 6 por clase: SMOTE y ADASYN necesitan 5 vecinos


class PresupuestoAgotado(Exception):
    """Se pidió una evaluación nueva cuando ya no queda presupuesto."""


@dataclass
class Evaluador:
    """Evalúa candidatos sobre el entrenamiento de un pliegue externo.

    Attributes:
        pipe: pipeline base (sin hiperparámetros fijados).
        tarea: "clf" o "reg".
        modelo, balanceo: para los argumentos de `fit` (peso por muestra).
        X, y: entrenamiento del pliegue externo.
        internas: pliegues internos, iguales para todos los optimizadores.
        presupuesto: evaluaciones distintas permitidas.
    """
    pipe: object
    tarea: str
    modelo: str
    balanceo: str
    X: np.ndarray
    y: np.ndarray
    internas: list
    presupuesto: int
    traza: list = field(default_factory=list)
    _cache: dict = field(default_factory=dict)

    @property
    def usadas(self):
        return len(self._cache)

    @property
    def queda(self):
        return self.usadas < self.presupuesto

    def __call__(self, params, extra=None):
        """Puntaje medio en los pliegues internos (mayor es mejor). Los fallos valen -inf y quedan anotados."""
        clave = clave_params(params)
        if clave in self._cache:
            return self._cache[clave]
        if not self.queda:
            raise PresupuestoAgotado
        t0, error = time.perf_counter(), None
        try:
            puntajes = []
            for tr, va in self.internas:
                p = clone(self.pipe).set_params(**{f"m__{k}": v for k, v in params.items()})
                p.fit(self.X[tr], self.y[tr], **balancing.argumentos_fit(self.modelo, self.balanceo, self.y[tr]))
                puntajes.append(evaluate.puntaje_interno(self.tarea, self.y[va], p.predict(self.X[va])))
            puntaje = float(np.mean(puntajes))
        except Exception as e:  # se registra: un candidato inválido no debe tumbar la búsqueda
            puntaje, error = float("-inf"), f"{type(e).__name__}: {e}"[:300]
        self._cache[clave] = puntaje
        self.traza.append({"evaluacion": self.usadas, "puntaje": puntaje, "segundos": time.perf_counter() - t0,
                           "params": dict(params), "error": error, "fraccion": 1.0, **(extra or {})})
        return puntaje

    def baja_fidelidad(self, params, fraccion, semilla, extra=None):
        """Puntaje entrenando con una fracción estratificada del entrenamiento de cada pliegue interno.

        La validación interna se usa completa. No entra al caché ni al conteo de evaluaciones completas; el
        optimizador multi-fidelidad lleva su propio costo en evaluaciones completas equivalentes.
        """
        rng = np.random.default_rng(semilla)
        t0, error = time.perf_counter(), None
        try:
            puntajes = []
            for tr, va in self.internas:
                sub = _estratificada(self.y[tr], fraccion, rng, self.tarea)
                tr_f = tr[sub]
                p = clone(self.pipe).set_params(**{f"m__{k}": v for k, v in params.items()})
                p.fit(self.X[tr_f], self.y[tr_f], **balancing.argumentos_fit(self.modelo, self.balanceo, self.y[tr_f]))
                puntajes.append(evaluate.puntaje_interno(self.tarea, self.y[va], p.predict(self.X[va])))
            puntaje = float(np.mean(puntajes))
        except Exception as e:
            puntaje, error = float("-inf"), f"{type(e).__name__}: {e}"[:300]
        self.traza.append({"evaluacion": len(self.traza) + 1, "puntaje": puntaje, "segundos": time.perf_counter() - t0,
                           "params": dict(params), "error": error, "fraccion": fraccion, **(extra or {})})
        return puntaje

    def mejor(self):
        """Hiperparámetros y puntaje del mejor candidato evaluado con todos los datos (fidelidad completa)."""
        validos = [t for t in self.traza if np.isfinite(t["puntaje"]) and t.get("fraccion", 1.0) == 1.0]
        if not validos:
            raise RuntimeError(f"Ningún candidato válido para {self.modelo}/{self.balanceo}: {self.traza[-1]['error']}")
        t = max(validos, key=lambda t: t["puntaje"])
        return t["params"], t["puntaje"]
