"""Espacios de búsqueda comunes a los cuatro optimizadores.

Cada hiperparámetro se describe con una tupla:

- ``("float", bajo, alto, log)``
- ``("int", bajo, alto, log)``
- ``("cat", (opción1, opción2, ...))``

Todos los optimizadores pasan por `decodificar`, que lleva un punto del cubo unitario [0, 1]^d al espacio real.
La grilla toma los centros de celdas del cubo, la búsqueda aleatoria muestrea el cubo uniforme y el genético
evoluciona genomas en el cubo. Optuna usa las mismas tuplas con sus `suggest_*`. Así los cuatro buscan en
exactamente el mismo espacio, con las mismas escalas logarítmicas para C, alpha y la tasa de aprendizaje.
"""
import math
from itertools import product

import numpy as np


def _valor(spec, u):
    """Valor real de un hiperparámetro para u en [0, 1]."""
    tipo = spec[0]
    u = min(max(float(u), 0.0), 1.0)
    if tipo == "cat":
        opciones = spec[1]
        return opciones[min(int(u * len(opciones)), len(opciones) - 1)]
    _, bajo, alto, log = spec
    if log:
        x = math.exp(math.log(bajo) + u * (math.log(alto) - math.log(bajo)))
    else:
        x = bajo + u * (alto - bajo)
    if tipo == "int":
        return int(min(max(round(x), bajo), alto))
    if tipo == "float":
        return float(min(max(x, bajo), alto))
    raise ValueError(f"Tipo de hiperparámetro desconocido: {tipo}")


def decodificar(espacio, u):
    """Convierte un vector u del cubo unitario en un diccionario de hiperparámetros."""
    if len(u) != len(espacio):
        raise ValueError(f"El vector tiene {len(u)} entradas y el espacio {len(espacio)}")
    return {nombre: _valor(spec, ui) for (nombre, spec), ui in zip(espacio.items(), u)}


def _niveles_max(spec):
    """Cuántos valores distintos puede tomar un hiperparámetro en la grilla."""
    if spec[0] == "cat":
        return len(spec[1])
    if spec[0] == "int":
        return spec[2] - spec[1] + 1
    return 10**9


def niveles_grilla(espacio, presupuesto):
    """Reparte el presupuesto entre los hiperparámetros: el producto de niveles no pasa de `presupuesto`.

    Sube de a uno el nivel del hiperparámetro que tenga menos, mientras el producto quepa. Con muchos
    hiperparámetros, varios quedan en un solo valor (el centro del rango): es la debilidad conocida de la
    grilla frente a la búsqueda aleatoria (Bergstra y Bengio, 2012).
    """
    niveles = {n: 1 for n in espacio}
    while True:
        candidatos = sorted((niveles[n], n) for n, s in espacio.items() if niveles[n] < _niveles_max(s))
        subio = False
        for actual, n in candidatos:
            total = math.prod(niveles.values()) // actual * (actual + 1)
            if total <= presupuesto:
                niveles[n] += 1
                subio = True
                break
        if not subio:
            return niveles


def grilla(espacio, presupuesto):
    """Puntos de la grilla, tomados en los centros de celda del cubo unitario. Sin repetidos."""
    niveles = niveles_grilla(espacio, presupuesto)
    ejes = [[(i + 0.5) / niveles[n] for i in range(niveles[n])] for n in espacio]
    puntos, vistos = [], set()
    for u in product(*ejes):
        p = decodificar(espacio, u)
        clave = clave_params(p)
        if clave not in vistos:
            vistos.add(clave)
            puntos.append(p)
    return puntos


def aleatorios(espacio, n, semilla):
    """n puntos uniformes en el cubo unitario, decodificados."""
    rng = np.random.default_rng(semilla)
    return [decodificar(espacio, rng.random(len(espacio))) for _ in range(n)]


def sugerir_optuna(trial, espacio):
    """Traduce el espacio a llamadas `trial.suggest_*` de Optuna."""
    params = {}
    for nombre, spec in espacio.items():
        if spec[0] == "cat":
            params[nombre] = trial.suggest_categorical(nombre, list(spec[1]))
        elif spec[0] == "int":
            params[nombre] = trial.suggest_int(nombre, spec[1], spec[2], log=spec[3])
        else:
            params[nombre] = trial.suggest_float(nombre, spec[1], spec[2], log=spec[3])
    return params


def clave_params(params):
    """Clave inmutable de un diccionario de hiperparámetros, para detectar evaluaciones repetidas."""
    return tuple(sorted((k, round(v, 12) if isinstance(v, float) else v) for k, v in params.items()))
