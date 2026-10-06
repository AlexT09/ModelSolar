# ModelSolar: Repositorio Unificado de Machine Learning

**Universidad del Norte**  
**Pregrado en Ciencia de Datos**  
**Machine Learning** - Profesor: Dr. Lihki Rubio  
**Autores:** Jesús David Arévalo Montilla, Enmanuel David Díaz Molinares, Alex David Terán Meza  

---

## Descripción General

Este repositorio centraliza y unifica todas las entregas, tareas y proyectos de la asignatura de **Machine Learning**, estructurado en dos grandes áreas: el **Proyecto Final de Aptitud Solar Fotovoltaica** (investigación, modelado combinatorio, pipelines y despliegue) y las **Tareas del Semestre** (PIDAA, data leakage y clasificador bayesiano).

---

## Estructura del Repositorio

```text
ModelSolar/
│
├── ml presentación/                          # PROYECTO FINAL: INVESTIGACIÓN Y ENTREGABLES
│   ├── index.md                              # Portada y metadatos de Jupyter Book
│   ├── myst.yml                              # Configuración de compilación MyST
│   ├── Dataset_Mundial_Final(2).csv          # Base cruda de la literatura mundial
│   ├── contexto_proyecto_aptitud_solar.md    # Formulación del problema
│   │
│   ├── proceso/                              # Cuadernos reproducibles y código activo
│   │   ├── dataset_eda_corregido.csv         # Base limpia estructurada en bloques de 5°
│   │   ├── EDA_Corregido(Entregable 3).ipynb # Limpieza espacial y análisis exploratorio
│   │   ├── Benchmark_Modelos_Base.ipynb      # Modelos preliminares del curso
│   │   ├── Experimento_1_Diseno.ipynb        # Diseño del experimento de 140 combinaciones
│   │   ├── Experimento_2_Clasificacion.ipynb # 112 modelos de clasificación (ROC, calibración)
│   │   ├── Experimento_3_Regresion.ipynb     # 28 modelos de regresión y análisis de residuos
│   │   ├── Experimento_4_Optimizadores.ipynb # Comparación de optimizadores (curvas anytime)
│   │   ├── Experimento_5_Computacional.ipynb # Complejidad O(·), FAISS, SAGA y aceleraciones
│   │   ├── Experimento_6_Estadistica.ipynb   # Friedman, Nemenyi CD, DeLong, MCS, Diebold-Mariano
│   │   ├── Experimento_7_Interpretabilidad.ipynb # Explicabilidad TreeSHAP y contraste LIME
│   │   ├── Resumen_Final.ipynb               # CUADERNO SÍNTESIS EJECUTADO (Cuadros 1 a 8)
│   │   ├── Resumen_final.md                  # Informe técnico consolidado
│   │   ├── Clima_a_Generacion_Colombia.ipynb # Construcción de la base XM + Open-Meteo
│   │   └── Benchmark_Colombia.ipynb          # Modelos predictivos en generación real
│   │
│   └── exposicion/                           # Presentación oral del proyecto
│       ├── main.tex                          # Diapositivas en LaTeX Beamer (conferencia)
│       ├── figuras/                          # Gráficos y diagramas incluidos en la presentación
│       └── guiones/                          # Guion detallado por diapositiva
│
├── Proyecto Integrador Pipelines/            # ARQUITECTURA DE INTEGRACIÓN Y DESPLIEGUE
│   ├── app/                                  # Servicio de inferencia con FastAPI
│   ├── data/                                 # Datos de entrenamiento del servicio (heart.csv)
│   ├── docker/                               # Contenedores Docker (app y jupyter)
│   ├── k8s/                                  # Manifiestos de despliegue en Kubernetes
│   ├── notebooks/                            # Cuadernos de cross-validation y data leakage
│   ├── tests/                                # Suite de pruebas de la API y modelo
│   └── README.md                             # Documentación de infraestructura y CI/CD
│
├── tareas/                                   # TAREAS ACADÉMICAS DEL SEMESTRE
│   ├── tarea_1_pidaa_eda/                    # Tarea 1: EDA en PySpark y Scikit-learn
│   │   ├── EDA.ipynb                         # Cuaderno de benchmarking Spark vs Sklearn
│   │   ├── muestra_inspeccion_300.csv        # Muestra inspeccionada
│   │   ├── metricas_sklearn.json             # Métricas comparadas
│   │   └── figuras/                          # Matrices de confusión y curvas ROC
│   │
│   ├── tarea_2_pipelines_fuga/               # Tarea 2: Demostración y mitigación de data leakage
│   │   ├── 1_model_leakage_demo.ipynb        # Demostración del sesgo inducido por data leakage
│   │   └── 2_model_pipeline_cv.ipynb         # Pipelines de Scikit-learn libres de data leakage
│   │
│   └── tarea_3_clasificador_bayesiano/       # Tarea 3: Modelos bayesianos en Heart Disease
│       ├── tarea3.ipynb                      # Cuaderno final ejecutado (GaussianNB vs Logística)
│       ├── clasificador_bayesiano.md         # Documento conceptual de análisis bayesiano
│       └── documentaci_n_del_dataset_cleveland_heart_disease.md # Diccionario de datos
│
├── notebooks/                                # Cuadernos complementarios de apoyo
│   └── Entregable 1 Proyecto/                # Versión final de entrega del EDA Solar
│       └── EDA.ipynb
│
├── environment.yml                           # Entorno reproducible Conda
└── README.md                                 # Este documento
```

---

## Instrucciones de Reproducción

### 1. Entorno de Ejecución

Para reproducir los cuadernos localmente:

```powershell
conda env create -f environment.yml
conda activate solarpv-eda
python -m ipykernel install --user --name solarpv-eda --display-name "Python (solarpv-eda)"
```

### 2. Resultados Consolidados y Entregables

- **Cuaderno Síntesis:** [`ml presentación/proceso/Resumen_Final.ipynb`](ml%20presentación/proceso/Resumen_Final.ipynb) (contiene los Cuadros 1 a 8 ejecutados con todas sus figuras y métricas).
- **Informe Técnico:** [`ml presentación/proceso/Resumen_final.md`](ml%20presentación/proceso/Resumen_final.md) (documento consolidado de metodología y resultados).
- **Diapositivas:** [`ml presentación/exposicion/main.tex`](ml%20presentación/exposicion/main.tex) (presentación oral en LaTeX Beamer).
- **Libro Web Interactivo:** Publicado vía GitHub Pages con la totalidad de los capítulos navegables.
