"""Carga de la base limpia del EDA corregido.

La limpieza (centinelas, duplicados, transformaciones circulares) ya se hizo en
`EDA_Corregido(Entregable 3).ipynb`; aquí solo se lee el resultado y se valida.
"""
from dataclasses import dataclass

import numpy as np
import pandas as pd

from . import config


@dataclass(frozen=True)
class Base:
    """Matrices listas para modelar.

    Attributes:
        X: predictoras, (n, 15). Puede tener vacíos en `log_dist_to_road`; se imputan dentro del pipeline.
        y_clf: clase codificada 0 = Baja, 1 = Media, 2 = Alta.
        y_reg: índice continuo de aptitud.
        grupos: bloque espacial de 5° × 5° de cada fila.
        tabla: el DataFrame original, para análisis posteriores (región, coordenadas).
    """
    X: np.ndarray
    y_clf: np.ndarray
    y_reg: np.ndarray
    grupos: np.ndarray
    tabla: pd.DataFrame


def cargar(ruta=config.DATOS) -> Base:
    """Lee `dataset_eda_corregido.csv` y valida columnas y clases.

    Raises:
        ValueError: si falta una columna o aparece una clase desconocida.
    """
    tabla = pd.read_csv(ruta)
    faltan = set(config.VARIABLES + [config.GRUPO, config.OBJETIVO_CLF, config.OBJETIVO_REG]) - set(tabla.columns)
    if faltan:
        raise ValueError(f"Faltan columnas en {ruta}: {sorted(faltan)}")
    codigos = pd.Categorical(tabla[config.OBJETIVO_CLF], categories=config.CLASES).codes
    if (codigos < 0).any():
        raise ValueError(f"Clases fuera de {config.CLASES}: {tabla.loc[codigos < 0, config.OBJETIVO_CLF].unique()}")
    return Base(X=tabla[config.VARIABLES].to_numpy(dtype=float), y_clf=codigos.astype(int),
                y_reg=tabla[config.OBJETIVO_REG].to_numpy(dtype=float),
                grupos=tabla[config.GRUPO].astype(str).to_numpy(), tabla=tabla)
