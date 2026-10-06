# Plan para cumplir la guía completa (entrega siguiente)

Escrito el 5 de octubre de 2026, después de la exposición. Parte de la revisión contra la guía (`Entregable2MachineLearningProject (2).pdf`). Lo que ya está hecho y lo que falta sale de esa revisión. Para retomarlo en una sesión nueva, leer este archivo, `resumen_sesion.md` y la sección 9 de `contexto_proyecto_aptitud_solar.md`.

## Pendiente aparte: minería de datos de la tecnología de las plantas

Queda pendiente la minería de datos de la tecnología de las 16 plantas colombianas: si tienen seguidor solar o estructura fija, la potencia DC (MWp) frente a la AC, y si los paneles son bifaciales. Se empezó con dos investigadores y se detuvo para ahorrar uso. Hoy ninguna planta tiene el montaje confirmado y solo 3 tienen la potencia DC con fuente (Bosques Solares de los Llanos 4 y 5, Sunnorte). La tabla está en `proceso/plantas_colombia.csv`, columnas `dc_MWp` y `montaje`. Explicaría el 16 % de la varianza que está entre plantas.

## Lo que ya cumple

- EDA mejorado (7.1), con las correcciones de E1 y E2.
- Validación anidada real (3.2): por bloques en la base mundial, y por zona y tiempo en Colombia.
- Preprocesamiento dentro de `Pipeline` y semilla única (42).
- Métricas base: F1 macro, AUC, kappa, RMSE y MAE, con desviación entre pliegues externos.

## Avance (5 de octubre de 2026, sesión de implementación)

Fase 1 hecha:
- `proceso/src/`: `config.py`, `data.py`, `cv.py`, `models.py`, `balancing.py`, `evaluate.py`, `runner.py` y `search/` (`espacio.py`, `base.py`, `grid_random.py`, `bayes_optuna.py`, `genetic_deap.py`).
- Pruebas en `proceso/tests/test_src.py`: 12 pasan. Comprueban que los bloques no se parten, que SMOTE solo remuestrea en `fit`, que la grilla cabe en el presupuesto y que cada optimizador gasta exactamente el presupuesto.
- Lanzador `proceso/correr_experimento.py`, que se puede interrumpir y relanzar. Guarda cada combinación y pliegue en `runs/partes/`, y `consolidar` arma `runs/master.parquet`, `runs/trazas.parquet`, `runs/diversidad.parquet` y `runs/oof/*.npz`.
- `environment.yml` regenerado, porque el anterior empezaba con el texto de una advertencia de conda. Se instalaron `scikit-posthocs`, `arch`, `pyarrow`, `faiss-cpu`, `memory_profiler` y `pytest`.

Decisiones tomadas con el piloto de tiempos (pliegue interno de 31 mil filas):
- KNN por fuerza bruta con distancia euclidiana: 0.28 s frente a 4.7 s del KD-Tree, con el mismo F1.
- Regresión logística con saga y `tol=1e-3`: 0.6 s frente a 5.4 s, con el mismo F1.
- Random Forest acotado a 200 árboles y XGBoost a 300.
- El presupuesto inicial daba unas 224 horas-núcleo; con estos cambios se estiman unas 80.
- Los cuatro optimizadores evalúan en el mismo cubo unitario, con los mismos pliegues internos y un solo hilo por modelo, así el tiempo por evaluación es comparable.
- La grilla gasta menos de 30 evaluaciones cuando el producto de niveles no cabe (por ejemplo, 24 en el árbol). Se reporta así.

Fases 2 a 7, estado al 5 de octubre, 3:30 a. m.:
- **Corrida completa lanzada** a las 3:00 con `lanzar_corrida.ps1`: las 136 combinaciones aplicables (680 trabajos) y después el halving. Estimado: termina hacia las 9:30. Log en `runs/log_140.txt`.
- **Cadena posterior lanzada** con `lanzar_despues.ps1`: espera a que termine lo anterior, corre la sensibilidad a la semilla (Random Forest, XGBoost y SVM, semillas 7 y 2026) y ejecuta el cuaderno computacional con la máquina libre. Al terminar escribe `runs/despues_listo.txt`.
- **Cuadernos escritos y probados con los datos del piloto**: `Experimento_1_Diseno` a `Experimento_7_Interpretabilidad`. Falta volver a ejecutarlos con la corrida completa y escribir sus secciones de interpretación.
- **Módulos nuevos**: `search/halving.py` (multi-fidelidad, η = 3), `stats.py` (Friedman, Nemenyi, DeLong, Holm, Cliff, BCa por bloques, MCS, DM-HLN, Clark-West, GW, Moran, curva de Hilbert), `explain.py` (SHAP y LIME), `computacional.py` (escalamiento, exponente empírico, KNN con FAISS) y `analisis.py`. Hay 20 pruebas en `tests/` y todas pasan.
- **Jupyter Book**: `ml presentación/myst.yml` e `index.md`, con su propia tabla de contenidos. Se construye localmente con `jupyter-book build --html` desde `ml presentación/`. No se tocó el `myst.yml` de la raíz ni el workflow, y no se publicó nada.
- Todas las referencias nuevas con DOI se verificaron con Crossref.

Cambio a las 3:45 a. m.: con 15 procesos quedaba 1 GB de RAM libre, así que se relanzó todo con 10 procesos (338 de 680 trabajos ya hechos). Estimado nuevo: la corrida termina hacia las 11:30 y la cadena posterior hacia las 14:00.

### Orden acordado con el usuario para lo que sigue

1. Terminar lo principal: la corrida, volver a ejecutar los 7 cuadernos con todos los resultados, escribir sus interpretaciones con literatura, actualizar el Resumen final y la presentación.
2. Después, y no antes: organizar todos los archivos del repositorio ModelSolar para que quede presentable. Notas para ese paso:
   - Mover figuras, CSV de resultados y datos de `proceso/` a subcarpetas obliga a actualizar las rutas en los cuadernos, en `src/config.py` y en los builders. No hacerlo mientras corra el experimento.
   - En la raíz de `ml presentación/` están los archivos de las entregas 1 y 2, la guía y el paper. Van a subcarpetas.
   - En la raíz del repositorio: `README.md` tiene el formato roto; `data/`, `outputs/` y `src/` están vacías; `deploy.yml`, `deploy1.yml` y `deploy2.yml` son idénticos y los tres publican en cada push. Cambiar los workflows es decisión del usuario.
   - No mover nada de `Proyecto Integrador Pipelines/`, porque su CI depende de esa ruta.
3. Al final: pasar humanizer por toda la prosa (cuadernos, `.md`, `.tex`).

## Lo que falta, por fases

Se aplica a la base mundial, que es la tarea del enunciado. La base de Colombia queda como análisis complementario.

### Fase 1. Código modular y tabla maestra (base de todo lo demás)

- Estructura `src/` con `data.py`, `cv.py`, `models.py`, `balancing.py`, `search/` (grid, random, optuna, deap, halving), `evaluate.py`, `stats.py` y `explain.py`, con docstrings. Es la arquitectura de la sección 6 del contexto.
- Bucle maestro modelo → balanceo → optimizador → pliegue externo, que guarde cada corrida en `runs/master.parquet`: modelo, balanceo, optimizador, hiperparámetros, métricas por pliegue, tiempo y semilla.
- Guardar las predicciones fuera de pliegue de cada combinación. Con ellas se calculan DeLong, la calibración, Cliff y el bootstrap sin reentrenar.
- Actualizar `environment.yml` (incluye `pypdf`) y verificar `optuna`, `deap`, `imbalanced-learn`, `shap`, `lime`, `scikit-posthocs` y `arch`.

### Fase 2. Las 140 combinaciones

- Modelos que faltan: árbol de decisión, Random Forest y XGBoost, en clasificación y regresión.
- Balanceo: SMOTE y ADASYN con `imblearn.pipeline.Pipeline`, solo dentro del pliegue de entrenamiento. Aplicar `class_weight` a todos los que lo admiten, y para los que no (KNN, Naive Bayes, XGBoost) usar `sample_weight` o declararlo como no aplicable.
- Optimizadores con el mismo presupuesto, unas 30 evaluaciones por combinación:
  - Grid.
  - Random.
  - Bayesiano con Optuna (TPE). Hay que declarar el modelo sustituto y la función de adquisición.
  - Genético con DEAP. Hay que declarar selección, cruce, mutación, elitismo y población, y registrar la diversidad genética por generación.
- Multi-fidelidad: `HalvingRandomSearchCV` o `HyperbandPruner` de Optuna, con factor de reducción de 3.
- Presupuesto estimado: unos 51,000 ajustes en clasificación. Paralelizar por pliegue y combinación. Usar `hist` en XGBoost con parada temprana solo en el pliegue interno. SVM con kernel en submuestra.

### Fase 3. Comparación de optimizadores

- Métrica externa, tiempo total y tiempo por evaluación, y número de evaluaciones.
- Curvas de desempeño en cualquier momento (mejor valor hasta la evaluación t).
- Estabilidad ante semillas.
- Demostrar con números si el bayesiano y el genético son más eficientes que grid y random.

### Fase 4. Optimización computacional (sección 4)

- Complejidad O(·) de entrenamiento e inferencia de cada modelo, contrastada con tiempos medidos al variar n y p (exponente empírico).
- Técnicas por modelo:
  - KNN: fuerza bruta frente a KD-Tree o Ball-Tree frente a FAISS.
  - Ridge y Lasso: SAGA.
  - Naive Bayes: `partial_fit`.
  - XGBoost: `hist` frente a `exact`, y GPU si hay.
  - SVM: SGD o LinearSVC.
- `n_jobs` y backends de joblib, y perfilado con cProfile o memory_profiler.
- Tabla del modelo estándar frente al optimizado: complejidad, tiempo de entrenamiento, tiempo de inferencia, memoria y cambio en el desempeño.

### Fase 5. Evaluación completa (sección 5)

- Matriz de confusión, curva ROC y tabla de métricas para cada modelo, no solo para el mejor.
- Calibración: diagrama de confiabilidad, Brier y ECE. Recalibrar con Platt o isotónica y mostrar el efecto.
- Regresión:
  - Gráfico con entrenamiento, validación y prueba.
  - Pruebas de White, BDS, ACF y Ljung-Box, más el histograma y la normalidad de los residuos.
  - Como los datos no son temporales, los residuos se ordenan por una curva espacial (Hilbert o Morton), y se complementa con el I de Moran (sección 5.8 del contexto).
- Interpretabilidad: SHAP global y local (dos observaciones, una acertada y una con error alto), y LIME frente a SHAP en XGBoost.
- Robustez: media y desviación por combinación, y sensibilidad a semillas en RF, XGB, el genético y SVM.

### Fase 6. Estadística formal (sección 6)

- Clasificación:
  - Friedman.
  - Nemenyi con diagrama CD, por niveles (7 modelos, 4 balanceos, 4 optimizadores).
  - DeLong uno contra el resto en los finalistas, con Holm o BH.
  - Delta de Cliff e intervalo bootstrap BCa.
- Regresión: MCS, Giacomini-White o Clark-West según el anidamiento, Diebold-Mariano con HLN y bootstrap estacionario, y d de Cohen.
- Tamaño del efecto en todos los casos.
- Considerar CV externa repetida 2×5 (N = 10) para darle potencia a Nemenyi.

### Fase 7. Entregables (sección 7)

- Jupyter Book con `_toc.yml`, reusando el `myst.yml` del repositorio, que ya publica en GitHub Pages con cada push a `main`.
- Actualizar la presentación con la comparación de métodos de optimización.

## Orden sugerido y por qué

1. Fase 1: sin la tabla maestra y las predicciones fuera de pliegue, todo lo demás se repite.
2. Fase 2, primero con un subconjunto (2 modelos, 2 balanceos, 4 optimizadores) para medir tiempos y fijar el presupuesto.
3. Fases 3, 5 y 6, que salen de la tabla maestra.
4. Fase 4.
5. Fase 7.
6. La minería de datos de la tecnología de las plantas, cuando sobre tiempo.

## Decisión del 5 de octubre: alcance de las bases y sección de la base nueva

- El experimento de 140 combinaciones se corre solo sobre la **base mundial**. No se repite sobre Colombia.
- Hay que escribir una sección (en el Resumen final, el libro y la presentación) que cuente la **base nueva**: dados los resultados con la base anterior, se construyó una base propia. Debe incluir:
  1. **Motivo.** Con el índice del dataset, el modelo termina apoyándose casi solo en la longitud, y el clima da R² 0.20 con bloques espaciales y cercano a 0 dentro de cada región. El índice se calcula solo con el terreno.
  2. **Objetivo.** Mejorar el análisis: que la predicción no dependa de la longitud y que el objetivo sea generación real (factor de capacidad diario).
  3. **Pipeline de construcción**, paso a paso: fuentes consideradas (ONS, XM, Chile, IDEAM, CENACE) y elección de XM; generación horaria y capacidad diaria; clima de Open-Meteo; coordenadas verificadas (9 del dataset y 7 de GEM); exclusión del arranque; resultado de 16 plantas, 6 zonas y 8,589 días planta.
  4. **Validación**: por zonas y prueba temporal, intervalos remuestreando plantas, línea base física.
  5. **Resultados ya obtenidos**: Benchmark_Colombia (Lasso, R² dentro de planta 0.469; clasificación de día con F1 0.572 y AUC 0.765).
  6. **Limitación**: la tecnología de las plantas (seguidor o fija, DC frente a AC) sigue pendiente.
- Fuentes: `proceso/Clima_a_Generacion_Colombia.ipynb`, `proceso/Benchmark_Colombia.ipynb`, `proceso/tabla_diaria_colombia.csv`, `proceso/plantas_colombia.csv`.

## Línea nueva (5 de octubre): modelo de capacidad solar con bases de plantas de todo el mundo

Idea del equipo, fuera del experimento de 140 combinaciones:
- **Paso 1, exploración de fuentes** de plantas solares de todos los países posibles: generación por planta, capacidad, coordenadas, y en lo posible el **modelo de paneles** y su tecnología.
- **Paso 2, tabla de especificaciones**: con el modelo de panel (potencia, eficiencia, coeficiente de temperatura, bifacial, seguidor o fija, DC/AC) se arma una tabla que se une a cada planta.
- **Paso 3, modelo**: estimar la capacidad o generación solar con clima y especificaciones, entrenar con muchos países y **predecir en datos no vistos** (países fuera, incluida Colombia), con validación dejando un país fuera.
- **Pendiente de definir**: cómo entra la base mundial del índice de aptitud (terreno) y si se suman variables como el viento (enfría el panel y baja la temperatura de celda).
- Riesgos: la mayoría de fuentes abiertas es agregada por país o mensual; hay que filtrar las que dan datos por planta. Los modelos de panel rara vez están publicados.
- Estado: exploración de fuentes lanzada en segundo plano; resultado en `resumen_de_sesion/exploracion_fuentes_plantas.md`.
