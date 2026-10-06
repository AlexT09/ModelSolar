"""Configuración única del experimento: semilla, rutas, variables y presupuesto.

Todo lo que otro módulo necesita fijar sale de aquí, para que una sola semilla se propague a numpy,
scikit-learn, imbalanced-learn, XGBoost, Optuna y DEAP.
"""
from pathlib import Path

SEED = 42

PROCESO = Path(__file__).resolve().parent.parent
DATOS = PROCESO / "dataset_eda_corregido.csv"
RUNS = PROCESO / "runs"
PARTES = RUNS / "partes"
MAESTRA = RUNS / "master.parquet"
TRAZAS = RUNS / "trazas.parquet"
OOF = RUNS / "oof"

# Las 15 predictoras del EDA corregido (contexto §8.5). Lat/lon se mantienen; la ablación sin ellas ya está en el benchmark base.
VARIABLES = ["latitude", "longitude", "elevation", "slope", "curvature", "aspect_sin", "aspect_cos", "is_flat",
             "wind_sin", "wind_cos", "log_dist_to_road", "ambient_temperature", "humidity", "wind_speed", "ghi"]
CLASES = ["Baja", "Media", "Alta"]          # orden natural del índice
GRUPO = "spatial_block"                     # bloques de 5° × 5°
OBJETIVO_CLF = "solar_aptittude_class"      # el nombre trae la errata del dataset original
OBJETIVO_REG = "solar_aptitude"

# Validación anidada (contexto §5.3): 5 pliegues externos que solo miden y 3 internos que eligen.
K_EXTERNO = 5
K_INTERNO = 3

# Mismo presupuesto para los cuatro optimizadores (contexto §5.6): B evaluaciones por pliegue externo.
PRESUPUESTO = 30

# El SVM con kernel crece entre O(n²) y O(n³); se entrena en una submuestra estratificada del entrenamiento.
N_SUBMUESTRA_SVM = 5000
