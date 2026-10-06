"""Halving sucesivo: el método multi-fidelidad (Jamieson y Talwalkar, 2016; Li et al., 2018).

Idea: evaluar muchos candidatos con pocos datos, quedarse con el mejor tercio, darles el triple de datos y repetir.
Es una sola rama de Hyperband.

- Fidelidad: fracción de filas del entrenamiento de cada pliegue interno, estratificada por clase. Se elige el tamaño
  de muestra y no el número de árboles porque sirve igual para los 7 modelos, también los que no tienen árboles.
- Factor de reducción η = 3, el valor que recomiendan Li et al. (2018).
- Rondas: 1/9, 1/3 y todos los datos. Con presupuesto 30 salen 90 candidatos iniciales, 30 en la segunda ronda y
  10 en la última: 90/9 + 30/3 + 10 = 30 evaluaciones completas equivalentes, el mismo presupuesto de los otros
  optimizadores, pero mirando 90 candidatos en vez de 30.

Supuesto que puede fallar: que el orden de los candidatos con 1/9 de los datos se parezca al orden con todos. En modelos
cuyo mejor hiperparámetro depende del tamaño de muestra (k de KNN, profundidad de los árboles) puede no cumplirse.
"""
import math

from .espacio import aleatorios

ETA = 3


def plan_rondas(presupuesto, eta=ETA, rondas=3):
    """Candidatos y fracción por ronda, con el mayor número inicial cuyo costo quepa en el presupuesto."""
    fracciones = [eta ** -(rondas - 1 - i) for i in range(rondas)]
    n0 = eta ** (rondas - 1)
    while True:
        siguiente = n0 + eta ** (rondas - 1)
        costo = sum(math.ceil(siguiente / eta**i) * f for i, f in enumerate(fracciones))
        if costo > presupuesto:
            break
        n0 = siguiente
    return [(math.ceil(n0 / eta**i), f) for i, f in enumerate(fracciones)]


def buscar_halving(evaluador, espacio, semilla):
    """Halving sucesivo sobre candidatos aleatorios. La última ronda usa el evaluador normal (datos completos)."""
    plan = plan_rondas(evaluador.presupuesto)
    vivos = aleatorios(espacio, plan[0][0], semilla)
    costo = 0.0
    for ronda, (n, fraccion) in enumerate(plan):
        vivos = vivos[:n]
        if fraccion < 1.0:
            puntajes = [evaluador.baja_fidelidad(p, fraccion, semilla + ronda, extra={"ronda": ronda}) for p in vivos]
        else:
            puntajes = [evaluador(p, extra={"ronda": ronda}) for p in vivos]
        costo += len(vivos) * fraccion
        orden = sorted(range(len(vivos)), key=lambda i: puntajes[i], reverse=True)
        vivos = [vivos[i] for i in orden]
    return {"plan": plan, "costo_equivalente": costo, "candidatos_iniciales": plan[0][0]}
