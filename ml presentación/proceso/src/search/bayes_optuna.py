"""Optimización bayesiana con Optuna (Akiba et al., 2019).

Modelo sustituto: TPE, *Tree-structured Parzen Estimator* (Bergstra et al., 2011). En vez de modelar p(y | x) como un
proceso gaussiano, TPE parte las evaluaciones en buenas (el mejor cuantil gamma) y malas, y estima dos densidades,
l(x) para las buenas y g(x) para las malas.

Función de adquisición: mejora esperada (EI). Con TPE, maximizar EI equivale a maximizar l(x) / g(x); Optuna
toma 24 candidatos de l(x) y se queda con el de mayor cociente.

Las primeras 10 evaluaciones son aleatorias (valor por defecto de `n_startup_trials`), para que el sustituto tenga
de dónde aprender. El pipeline se arma de nuevo en cada prueba, así que el preprocesamiento sigue dentro del pliegue.
"""
import optuna

from .base import PresupuestoAgotado
from .espacio import sugerir_optuna

optuna.logging.set_verbosity(optuna.logging.WARNING)


def buscar_optuna(evaluador, espacio, semilla):
    """TPE hasta gastar el presupuesto en evaluaciones distintas.

    En espacios con enteros o categorías Optuna puede proponer un punto ya visto; sale del caché, no gasta
    presupuesto y se le devuelve a Optuna el mismo puntaje. Se corta a 5 veces el presupuesto en pruebas totales.
    """
    estudio = optuna.create_study(direction="maximize", sampler=optuna.samplers.TPESampler(seed=semilla))

    def objetivo(trial):
        puntaje = evaluador(sugerir_optuna(trial, espacio), extra={"trial": trial.number})
        return max(puntaje, -1e9)  # un candidato fallido (-inf) se le pasa a TPE como muy malo, no como prueba rota

    tope = 5 * evaluador.presupuesto
    while evaluador.queda and len(estudio.trials) < tope:
        try:
            estudio.optimize(objetivo, n_trials=1)
        except PresupuestoAgotado:
            break
    return {"pruebas_totales": len(estudio.trials)}
