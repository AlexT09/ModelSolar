"""Algoritmo genético con DEAP (Fortin et al., 2012).

Codificación: cada individuo es un vector en el cubo unitario [0, 1]^d que `decodificar` lleva al espacio real,
el mismo que usan los otros optimizadores.

Operadores:
- Selección por torneo de tamaño 3.
- Cruce BLX-α con α = 0.5 (`cxBlend`, Eshelman y Schaffer, 1993), con probabilidad 0.7.
- Mutación gaussiana con σ = 0.15 por gen, probabilidad por gen 1/d y probabilidad por individuo 0.3.
- Elitismo: el mejor individuo pasa intacto a la siguiente generación.
- Población: presupuesto // 5 (6 con el presupuesto de 30), para tener al menos 4 generaciones.

Diversidad genética por generación: distancia euclidiana media entre pares de individuos, dividida por √d para
que quede entre 0 y 1, y número de individuos distintos después de decodificar.
"""
import random
from itertools import combinations

import numpy as np
from deap import base, creator, tools

from .base import PresupuestoAgotado
from .espacio import clave_params, decodificar

if not hasattr(creator, "AptitudMax"):
    creator.create("AptitudMax", base.Fitness, weights=(1.0,))
    creator.create("Individuo", list, fitness=creator.AptitudMax)

P_CRUCE, P_MUTACION, SIGMA, TORNEO, ALFA = 0.7, 0.3, 0.15, 3, 0.5
MAX_GENERACIONES = 50


def _recortar(ind):
    ind[:] = [min(max(g, 0.0), 1.0) for g in ind]
    return ind


def _diversidad(poblacion, espacio, generacion):
    d = len(espacio)
    dist = [np.linalg.norm(np.subtract(a, b)) / np.sqrt(d) for a, b in combinations(poblacion, 2)]
    distintos = len({clave_params(decodificar(espacio, ind)) for ind in poblacion})
    aptitudes = [ind.fitness.values[0] for ind in poblacion if ind.fitness.valid]
    return {"generacion": generacion, "distancia_media": float(np.mean(dist)) if dist else 0.0,
            "distintos": distintos, "mejor": max(aptitudes) if aptitudes else np.nan,
            "media": float(np.mean([a for a in aptitudes if np.isfinite(a)])) if aptitudes else np.nan}


def buscar_genetico(evaluador, espacio, semilla):
    """Evoluciona hasta gastar el presupuesto en evaluaciones distintas.

    Returns:
        Diccionario con la diversidad por generación (`diversidad`) y el número de generaciones.
    """
    rng = random.Random(semilla)
    d = len(espacio)
    tb = base.Toolbox()
    tb.register("individuo", tools.initIterate, creator.Individuo, lambda: [rng.random() for _ in range(d)])
    tb.register("seleccionar", tools.selTournament, tournsize=TORNEO)
    tamano = max(4, evaluador.presupuesto // 5)

    generacion, registro = 0, []

    def evaluar(ind):
        ind.fitness.values = (evaluador(decodificar(espacio, ind), extra={"generacion": generacion}),)

    poblacion = [tb.individuo() for _ in range(tamano)]
    actual = poblacion
    estado = random.getstate()
    random.seed(semilla)  # cxBlend y mutGaussian usan el módulo random global
    try:
        for ind in poblacion:
            evaluar(ind)
        registro.append(_diversidad(poblacion, espacio, generacion))
        while evaluador.queda and generacion < MAX_GENERACIONES:
            generacion += 1
            elite = tools.selBest(poblacion, 1)[0]
            hijos = [creator.Individuo(ind) for ind in tb.seleccionar(poblacion, tamano - 1)]
            for a, b in zip(hijos[::2], hijos[1::2]):
                if rng.random() < P_CRUCE:
                    tools.cxBlend(a, b, ALFA)
                    del a.fitness.values, b.fitness.values
            for h in hijos:
                if rng.random() < P_MUTACION:
                    tools.mutGaussian(h, mu=0.0, sigma=SIGMA, indpb=1.0 / d)
                    if h.fitness.valid:
                        del h.fitness.values
                _recortar(h)
            actual = [elite] + hijos
            for h in hijos:
                if not h.fitness.valid:
                    evaluar(h)
            poblacion = actual
            registro.append(_diversidad(poblacion, espacio, generacion))
    except PresupuestoAgotado:
        # el individuo pedido ya no cabe; la última generación queda con los que alcanzaron a evaluarse
        registro.append(_diversidad([i for i in actual if i.fitness.valid], espacio, generacion))
    finally:
        random.setstate(estado)
    return {"diversidad": registro, "generaciones": generacion}
