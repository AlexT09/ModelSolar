# Resumen del Proyecto

Este apartado consolida todo el trabajo, desde la recolección de datos hasta el benchmarking y los siete experimentos. Las cifras corresponden a la ejecución de octubre de 2026.

| Cuaderno | Qué hace |
|---|---|
| `EDA_Corregido(Entregable 3).ipynb` | Limpia y explora la base mundial y genera `dataset_eda_corregido.csv`. |
| `Benchmark_Modelos_Base.ipynb` | Corre los modelos base sobre la base mundial. |
| `Clima_a_Generacion_Colombia.ipynb` | Construye la base de generación real de Colombia y prueba modelos preliminares. |
| `Benchmark_Colombia.ipynb` | Corre los modelos base sobre los datos de Colombia. |
| `Experimentos_1_a_7.ipynb` | Detallan el diseño, clasificación, regresión, optimizadores, rendimiento computacional, pruebas estadísticas e interpretabilidad. |
| `Resumen_Final.ipynb` | Cuaderno de síntesis con la ejecución completa y figuras. |

## 1. La pregunta original y cómo evolucionó

Arrancamos queriendo predecir la aptitud de un sitio para albergar una planta solar usando datos climáticos globales. Tomamos el dataset de Mantilla-Guerra et al. (2026), que trae un índice de aptitud solar (`solar_aptitude`). Al revisar la fórmula del paper, nos dimos cuenta de que el índice se calcula solo con variables de terreno (pendiente, orientación, sombreado y curvatura). El clima no influye. Esto nos obligó a dividir el proyecto en dos caminos:
1. Modelar el índice topográfico del dataset global para evaluar su generalización espacial.
2. Construir una base propia con generación real de plantas colombianas para ver cuánto influye realmente el clima.

## 2. Los datos recolectados

Juntamos información de cinco fuentes: el dataset base de Mantilla-Guerra (con potencial solar y datos topográficos), el Global Energy Monitor (para coordenadas y nombres), XM (el operador eléctrico en Colombia, para tener la generación real hora a hora), y Open-Meteo (para la radiación, nubosidad, viento, temperatura y humedad).

El proceso de limpieza fue riguroso. En la base mundial quitamos filas rotas, reparamos más de mil duplicados y resolvimos vacíos que eran sistemáticos. Esto nos dejó con 57,976 plantas y 15 predictoras. Para Colombia, armamos una serie con 8,589 días-planta provenientes de 16 plantas con coordenadas verificadas.

![Pipeline del EDA](fig_pipeline_eda_mundial.png)

![Pipeline de la base de Colombia](fig_pipeline_clima.png)

![EDA de la base de Colombia](fig_eda_base_colombia.png) 

## 3. El problema oculto del índice global

El hallazgo central del EDA es que el índice casi no correlaciona con la pendiente, a pesar de que esta es el 40% de su fórmula. En cambio, tiene una correlación de +0.58 con la longitud. Vimos que un modelo entrenado en dos continentes tiene un R² negativo cuando predice en un tercer continente. Esto indica que el índice captura principalmente el bloque o lote de procesamiento (por ejemplo, el bloque europeo) en lugar de una regla topográfica universal.

Por esta razón, tuvimos que evaluar todo usando bloques espaciales de 5° × 5°. Partir los datos al azar mezclaba plantas vecinas y daba métricas muy optimistas. 

## 4. Diseño experimental

Con la advertencia espacial en mente, ajustamos todos los hiperparámetros usando validación cruzada anidada: un bucle externo por bloques geográficos, y un bucle interno para buscar hiperparámetros. 

Comparamos modelos lineales (Logística, Ridge, Lasso) contra métodos más flexibles (KNN, SVM, y luego Random Forest y XGBoost). Frente al desbalance de clases (Baja tiene solo el 3%), probamos dar pesos en la función de costo, SMOTE y ADASYN. Evaluamos optimizadores como búsqueda en grilla, búsqueda aleatoria, Optuna, y un algoritmo genético (con una población de 6 individuos). 

## 5. Resultados y métricas clave

En la **base mundial**, Random Forest y XGBoost, junto con el SVM de kernel, logran los mejores resultados (F1 macro alrededor de 0.82 y R² sobre 0.80). Aplastan a los modelos lineales. Pero como vimos en el EDA, parte de este éxito viene de que estos modelos logran identificar la región de la planta. Si quitamos la latitud y longitud, el desempeño cae en picada. 

En la **base de Colombia**, la historia se invierte. El factor de capacidad (FC) es casi proporcional a la radiación que recibe el panel. Por eso, un modelo lineal como Lasso logra explicar un R² de 0.47 del sube y baja diario de la planta, igualando o superando a modelos más complejos que tienden a sobreajustarse a las 6 zonas geográficas disponibles. Vimos empíricamente que cada kWh/m² de radiación suma alrededor de 4.7 puntos al FC.

![FC contra radiación por planta](fig_fc_vs_radiacion.png)

![Benchmark mundial](fig_benchmark_modelos.png)

![ROC y matriz de confusión, base mundial](fig_benchmark_roc_confusion.png)

![Efecto del ajuste, base mundial](fig_benchmark_ajuste.png)

![Benchmark de Colombia](fig_benchmark_colombia.png)

![ROC y matriz de confusión, Colombia](fig_benchmark_colombia_roc_confusion.png)

![Comparativa de todos los modelos](fig_resumen_comparativa.png)

![Efecto de las técnicas de balanceo](fig_exp_balanceo.png)

![Curvas de desempeño anytime](fig_exp_anytime.png)

![Evolución de la diversidad alélica en DEAP](fig_exp_diversidad.png)

![Curvas ROC consolidadas](fig_exp_roc.png)

![Matrices de confusión de los mejores clasificadores](fig_exp_confusion.png)

![Predicciones frente a valores observados en regresión](fig_exp_reg_tvp.png)

![Diagnóstico de residuos y heterocedasticidad](fig_exp_reg_residuos.png)

![Curvas de calibración y error ECE](fig_exp_calibracion.png)

## 6. Las pruebas estadísticas

Para salir de dudas, aplicamos la prueba de Clark-West y mediciones como la d de Cohen y la prueba de Diebold-Mariano (1995). Los resultados confirmaron sin espacio a duda la superioridad de Random Forest en la base global, con una d de Cohen gigantesca (10.01 respecto a Ridge y Lasso). Clark-West probó de forma contundente que incluir latitud y longitud dispara el poder predictivo (p < 0.001).

![Diagrama de Diferencias Críticas de Nemenyi](fig_exp_cd.png)

## 7. Qué aprendimos sobre los modelos (Interpretabilidad y Rendimiento)

El perfilamiento computacional confirmó que KNN es rápido de entrenar pero muy lento en inferencia. Random Forest y XGBoost concentran su costo al entrenar, logrando evaluar en fracciones de segundo, con picos de memoria bajísimos (el cuello de botella es el procesador, no la RAM). 

Al aplicar técnicas de explicabilidad, notamos que SHAP y LIME ordenan de forma bastante diferente la cola de importancia de variables, pero ambos coinciden en cuáles son los 3 factores más críticos.

![Complejidad computacional y escalamiento](fig_exp_complejidad.png)

![SHAP global en clasificación](fig_exp_shap_clf.png)

![SHAP global en regresión](fig_exp_shap_reg.png)

![Gráfico de cascada SHAP en observaciones individuales](fig_exp_shap_cascada.png)

![Contraste metrológico LIME frente a TreeSHAP en XGBoost](fig_exp_lime_shap.png) 

## 8. Conclusiones y lo que queda pendiente

El índice del dataset mundial no mide aptitud desde el clima, sino principalmente la región. Los modelos pueden predecirlo muy bien si "saben" dónde están, pero fracasan en continentes nuevos. Por otro lado, en Colombia confirmamos que la radiación sí explica la mitad del comportamiento diario de una planta real, y un modelo lineal simple basta para capturarlo. 

Queda pendiente medir la tecnología específica de cada planta en Colombia (potencia DC real, tipo de seguidor), lo cual probablemente explicaría la gran diferencia de nivel base que hay entre una planta y otra. Además, trabajar con radiación medida por estaciones en terreno podría romper el techo del R² de 0.50 que nos impone la radiación estimada por satélite.
