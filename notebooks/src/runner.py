"""Bucle maestro: modelo → balanceo → optimizador → pliegue externo.

Cada trabajo (una combinación en un pliegue externo) es independiente. Se reparten entre procesos con joblib y cada
modelo usa un solo hilo, así que el tiempo por evaluación es comparable entre optimizadores.

Cada trabajo guarda su resultado en `runs/partes/` apenas termina. Si la corrida se interrumpe, al relanzarla
salta lo que ya está hecho. `consolidar` junta las partes en:

- `runs/master.parquet`: una fila por combinación y pliegue, con hiperparámetros, métricas externas, tiempos y semilla.
- `runs/trazas.parquet`: una fila por evaluación de cada búsqueda (curvas de desempeño en cualquier momento).
- `runs/diversidad.parquet`: diversidad genética por generación del algoritmo genético.
- `runs/oof/<combinación>.npz`: predicciones fuera de pliegue (etiquetas y probabilidades), para DeLong, calibración,
  Cliff y bootstrap sin reentrenar.
"""
import argparse
import json
import pickle
import time
from functools import lru_cache

import numpy as np
import pandas as pd
from joblib import Parallel, delayed, parallel_config

from . import balancing, config, cv, data, evaluate, models
from .search import OPTIMIZADORES, TODOS
from .search.base import Evaluador

# Orden de lanzamiento: lo más caro primero, para que los procesos terminen parejo.
COSTO = ["Random Forest", "XGBoost", "KNN", "SVM RBF", "SVR RBF", "Árbol de decisión", "Regresión logística",
         "Lasso", "Ridge", "Naive Bayes"]
SIN_BALANCEO = "—"


def combinaciones(tareas=("clf", "reg"), modelos=None, balanceos=None, optimizadores=None):
    """Combinaciones aplicables y las no aplicables por separado.

    Returns:
        (aplicables, no_aplicables): listas de diccionarios con tarea, modelo, balanceo y optimizador.
    """
    aplicables, no_aplicables = [], []
    for tarea in tareas:
        for modelo in models.MODELOS[tarea]:
            if modelos and modelo not in modelos:
                continue
            bals = balancing.BALANCEOS if tarea == "clf" else [SIN_BALANCEO]
            for bal in bals:
                if balanceos and tarea == "clf" and bal not in balanceos:
                    continue
                for opt in (optimizadores or OPTIMIZADORES):
                    if opt not in TODOS:
                        raise ValueError(f"Optimizador desconocido: {opt}. Opciones: {list(TODOS)}")
                    c = {"tarea": tarea, "modelo": modelo, "balanceo": bal, "optimizador": opt}
                    (aplicables if balancing.aplica(modelo, bal) else no_aplicables).append(c)
    return aplicables, no_aplicables


def id_corrida(c):
    """Identificador legible y apto para nombre de archivo."""
    limpio = lambda s: "".join(ch if ch.isalnum() else "_" for ch in s.lower())
    return "__".join(limpio(c[k]) for k in ("tarea", "modelo", "balanceo", "optimizador"))


@lru_cache(maxsize=1)
def _base():
    return data.cargar()


def correr_pliegue(c, k, semilla=config.SEED, presupuesto=config.PRESUPUESTO, carpeta=config.PARTES):
    """Busca hiperparámetros en el entrenamiento del pliegue externo k, reentrena y mide en su prueba.

    Returns:
        Ruta del archivo de la parte guardada.
    """
    destino = carpeta / f"{id_corrida(c)}__s{semilla}__f{k}.pkl"
    if destino.exists():
        return destino
    b = _base()
    tarea, modelo, bal = c["tarea"], c["modelo"], c["balanceo"]
    y = b.y_clf if tarea == "clf" else b.y_reg
    tr, te = cv.externas(b.y_clf, b.grupos, semilla=semilla)[k]
    bal_pipe = "ninguno" if bal == SIN_BALANCEO else bal
    pipe = balancing.construir(models.estimador(tarea, modelo, semilla), modelo, bal_pipe, semilla)
    ev = Evaluador(pipe=pipe, tarea=tarea, modelo=modelo, balanceo=bal_pipe, X=b.X[tr], y=y[tr],
                   internas=cv.internas(b.y_clf[tr], b.grupos[tr], semilla=semilla), presupuesto=presupuesto)

    t0 = time.perf_counter()
    extra = TODOS[c["optimizador"]](ev, models.ESPACIOS[tarea][modelo], semilla)
    t_busqueda = time.perf_counter() - t0
    mejores, puntaje_interno = ev.mejor()

    final = {**mejores, **models.FINAL.get((tarea, modelo), {})}
    t0 = time.perf_counter()
    ajustado = pipe.set_params(**{f"m__{p}": v for p, v in final.items()})
    ajustado.fit(b.X[tr], y[tr], **balancing.argumentos_fit(modelo, bal_pipe, y[tr]))
    t_refit = time.perf_counter() - t0
    t0 = time.perf_counter()
    pred = ajustado.predict(b.X[te])
    proba = ajustado.predict_proba(b.X[te]) if tarea == "clf" else None
    t_pred = time.perf_counter() - t0
    metricas = evaluate.metricas_clf(y[te], pred, proba) if tarea == "clf" else evaluate.metricas_reg(y[te], pred)

    parte = {**c, "pliegue": k, "semilla": semilla, "presupuesto": presupuesto, "params": mejores,
             "puntaje_interno": puntaje_interno, "evaluaciones": ev.usadas, **metricas,
             "t_busqueda": t_busqueda, "t_refit": t_refit, "t_prediccion": t_pred,
             "t_por_evaluacion": float(np.mean([t["segundos"] for t in ev.traza])),
             "fallidas": sum(t["error"] is not None for t in ev.traza),
             "traza": ev.traza, "diversidad": extra.get("diversidad"),
             "extra": {k2: v for k2, v in extra.items() if k2 != "diversidad"},
             "idx_prueba": te, "pred": pred, "proba": proba}
    carpeta.mkdir(parents=True, exist_ok=True)
    temporal = destino.with_suffix(".tmp")
    with open(temporal, "wb") as f:
        pickle.dump(parte, f)
    temporal.replace(destino)  # escritura atómica: una parte a medias nunca queda con el nombre final
    return destino


def correr(combos, n_jobs=15, semilla=config.SEED, presupuesto=config.PRESUPUESTO, carpeta=config.PARTES):
    """Lanza todos los trabajos pendientes en paralelo. Devuelve las rutas de las partes."""
    trabajos = [(c, k) for c in combos for k in range(config.K_EXTERNO)]
    trabajos.sort(key=lambda t: COSTO.index(t[0]["modelo"]))
    with parallel_config(backend="loky", inner_max_num_threads=1):
        return Parallel(n_jobs=n_jobs, verbose=10)(
            delayed(correr_pliegue)(c, k, semilla, presupuesto, carpeta) for c, k in trabajos)


def consolidar(carpeta=config.PARTES, semilla=config.SEED):
    """Junta las partes en la tabla maestra, las trazas, la diversidad y las predicciones fuera de pliegue."""
    partes = [pickle.load(open(p, "rb")) for p in sorted(carpeta.glob(f"*__s{semilla}__f*.pkl"))]
    if not partes:
        raise FileNotFoundError(f"No hay partes con semilla {semilla} en {carpeta}")
    claves = ["tarea", "modelo", "balanceo", "optimizador"]
    filas, trazas, diversidad = [], [], []
    for p in partes:
        filas.append({k: v for k, v in p.items() if k not in ("traza", "diversidad", "idx_prueba", "pred", "proba",
                                                             "params", "extra")}
                     | {"params": json.dumps(p["params"], ensure_ascii=False), "extra": json.dumps(p["extra"])})
        for t in p["traza"]:
            trazas.append({**{k: p[k] for k in claves + ["pliegue"]}, **{k: v for k, v in t.items() if k != "params"},
                           "params": json.dumps(t["params"], ensure_ascii=False)})
        for g in p["diversidad"] or []:
            diversidad.append({**{k: p[k] for k in claves + ["pliegue"]}, **g})
    config.RUNS.mkdir(exist_ok=True)
    maestra = pd.DataFrame(filas)
    maestra.to_parquet(config.MAESTRA, index=False)
    pd.DataFrame(trazas).to_parquet(config.TRAZAS, index=False)
    if diversidad:
        pd.DataFrame(diversidad).to_parquet(config.RUNS / "diversidad.parquet", index=False)
    _guardar_oof(partes, claves)
    return maestra


def _guardar_oof(partes, claves):
    config.OOF.mkdir(parents=True, exist_ok=True)
    n = len(_base().y_clf)
    por_combo = {}
    for p in partes:
        por_combo.setdefault(id_corrida({k: p[k] for k in claves}), []).append(p)
    for nombre, grupo in por_combo.items():
        if len(grupo) < config.K_EXTERNO:
            continue  # combinación incompleta: sus predicciones no cubren toda la base
        pred = np.full(n, np.nan)
        proba = np.full((n, 3), np.nan) if grupo[0]["proba"] is not None else None
        pliegue = np.full(n, -1)
        for p in grupo:
            pred[p["idx_prueba"]] = p["pred"]
            pliegue[p["idx_prueba"]] = p["pliegue"]
            if proba is not None:
                proba[p["idx_prueba"]] = p["proba"]
        np.savez_compressed(config.OOF / f"{nombre}.npz", pred=pred, pliegue=pliegue,
                            **({"proba": proba} if proba is not None else {}))


def tabla_partes(carpeta=config.PARTES):
    """Campos escalares de todas las partes, de todas las semillas (para la sensibilidad a la semilla)."""
    fuera = ("traza", "diversidad", "idx_prueba", "pred", "proba", "params", "extra")
    filas = []
    for p in sorted(carpeta.glob("*.pkl")):
        with open(p, "rb") as f:
            parte = pickle.load(f)
        filas.append({k: v for k, v in parte.items() if k not in fuera} | {"params": json.dumps(parte["params"], ensure_ascii=False)})
    return pd.DataFrame(filas)


def resumen(maestra):
    """Una fila por combinación: media y desviación estándar de cada métrica entre pliegues externos."""
    claves = ["tarea", "modelo", "balanceo", "optimizador"]
    numericas = [c for c in maestra.select_dtypes("number").columns if c not in ("pliegue", "semilla", "presupuesto")]
    g = maestra.groupby(claves)[numericas]
    return g.mean().join(g.std(), rsuffix="_de").join(maestra.groupby(claves).size().rename("pliegues")).reset_index()


def main():
    """Línea de comandos. Se llama desde `correr_experimento.py`, no con ``python -m src.runner``: si el módulo corre
    como ``__main__``, los procesos de joblib no pueden reconstruir sus funciones."""
    ap = argparse.ArgumentParser(description="Corre las combinaciones modelo × balanceo × optimizador.")
    ap.add_argument("--tareas", nargs="+", default=["clf", "reg"])
    ap.add_argument("--modelos", nargs="+")
    ap.add_argument("--balanceos", nargs="+")
    ap.add_argument("--optimizadores", nargs="+")
    ap.add_argument("--n-jobs", type=int, default=15)
    ap.add_argument("--semilla", type=int, default=config.SEED)
    ap.add_argument("--presupuesto", type=int, default=config.PRESUPUESTO)
    a = ap.parse_args()
    combos, na = combinaciones(a.tareas, a.modelos, a.balanceos, a.optimizadores)
    print(f"{len(combos)} combinaciones aplicables, {len(na)} no aplicables, {len(combos) * config.K_EXTERNO} trabajos",
          flush=True)
    t0 = time.time()
    correr(combos, a.n_jobs, a.semilla, a.presupuesto)
    print(f"Listo en {(time.time() - t0) / 60:.1f} min", flush=True)
    consolidar(semilla=a.semilla)
