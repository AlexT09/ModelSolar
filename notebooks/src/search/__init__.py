"""Los optimizadores, con la misma firma: ``buscar(evaluador, espacio, semilla) -> dict``.

`OPTIMIZADORES` son los cuatro obligatorios del enunciado. `MULTIFIDELIDAD` es el recomendado; se corre aparte,
pidiéndolo por nombre, porque no forma parte de las 140 combinaciones.
"""
from .bayes_optuna import buscar_optuna
from .genetic_deap import buscar_genetico
from .grid_random import buscar_aleatoria, buscar_grilla
from .halving import buscar_halving

OPTIMIZADORES = {"grilla": buscar_grilla, "aleatoria": buscar_aleatoria, "bayesiana": buscar_optuna,
                 "genetica": buscar_genetico}
MULTIFIDELIDAD = {"halving": buscar_halving}
TODOS = {**OPTIMIZADORES, **MULTIFIDELIDAD}
