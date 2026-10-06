# Resumen del proyecto

Este resumen recorre el proyecto desde la recolección de datos hasta los siete experimentos. Las cifras salen de las corridas de octubre de 2026.

| Cuaderno | Qué hace |
|---|---|
| `EDA_Corregido(Entregable 3).ipynb` | Limpia y explora la base mundial y genera `dataset_eda_corregido.csv`. |
| `Benchmark_Modelos_Base.ipynb` | Corre los modelos base sobre la base mundial. |
| `Clima_a_Generacion_Colombia.ipynb` | Construye la base de generación real de Colombia y prueba modelos preliminares. |
| `Benchmark_Colombia.ipynb` | Corre los modelos base sobre los datos de Colombia. |
| `Experimento_1_Diseno.ipynb` a `Experimento_7_Interpretabilidad.ipynb` | Diseño, clasificación, regresión, optimizadores, rendimiento computacional, pruebas estadísticas e interpretabilidad. |
| `Resumen_Final.ipynb` | Síntesis con las tablas y figuras de la ejecución completa. |

## 1. La pregunta original y cómo evolucionó

Arrancamos queriendo predecir la aptitud de un sitio para albergar una planta solar a partir de datos climáticos globales. Tomamos el dataset de Mantilla-Guerra et al. (2026), que trae un índice de aptitud solar (`solar_aptitude`). Al revisar la fórmula del paper vimos que el índice se calcula solo con variables de terreno (pendiente, orientación, sombreado y curvatura) y que el clima no influye. Por eso el proyecto quedó en dos líneas:

1. Modelar el índice topográfico del dataset global para evaluar su generalización espacial.
2. Construir una base propia con generación real de plantas colombianas para ver cuánto influye el clima.

## 2. Los datos recolectados

Juntamos información de cuatro fuentes: el dataset de Mantilla-Guerra (con potencial solar y datos topográficos), el Global Energy Monitor (coordenadas y nombres), XM, el operador eléctrico de Colombia (generación real hora a hora) y Open-Meteo (radiación, nubosidad, viento, temperatura y humedad).

En la base mundial quitamos filas rotas, eliminamos más de mil duplicados y tratamos vacíos que seguían un patrón. Quedaron 57,976 plantas y 15 predictoras. Para Colombia armamos una serie con 8,589 días planta de 16 plantas con coordenadas verificadas.

![Esquema del EDA](fig_pipeline_eda_mundial.png)

![Esquema de la base de Colombia](fig_pipeline_clima.png)

![EDA de la base de Colombia](fig_eda_base_colombia.png)

## 3. Qué mide el índice global

El hallazgo central del EDA es que el índice casi no correlaciona con la pendiente, aunque esta pesa el 40 % de su fórmula, y que tiene una correlación de +0.58 con la longitud. Un modelo entrenado en dos continentes tiene un R² negativo al predecir en un tercero. Todo apunta a que el índice recoge sobre todo el bloque o lote de procesamiento (por ejemplo, el europeo) y poco de una regla topográfica universal.

Por eso evaluamos todo con bloques espaciales de 5° × 5°. Al partir los datos al azar, las plantas vecinas se mezclaban y las métricas salían muy optimistas.

## 4. Diseño experimental

Con la advertencia espacial en mente, ajustamos los hiperparámetros con validación cruzada anidada: un bucle externo por bloques geográficos y un bucle interno que busca hiperparámetros.

Comparamos modelos lineales (logística, Ridge, Lasso) con métodos más flexibles (KNN, SVM y, después, Random Forest y XGBoost). Para el desbalance de clases (Baja tiene solo el 3 %) probamos pesos en la función de costo, SMOTE y ADASYN. Los optimizadores fueron búsqueda en grilla, búsqueda aleatoria, Optuna y un algoritmo genético con una población de 6 individuos.

## 5. Resultados y métricas clave

En la base mundial, Random Forest y XGBoost llegan a un F1 macro de 0.89 y un R² de 0.90, y el SVM con kernel a 0.82 y 0.81 en el benchmark base. Los modelos lineales quedan en 0.60 de F1 y 0.48 de R². Parte de ese éxito viene de que los modelos identifican la región de la planta: sin latitud y longitud el desempeño baja mucho (el R² de KNN pasa de 0.79 a 0.48).

En la base de Colombia pasa lo contrario. El factor de capacidad (FC) es casi proporcional a la radiación que recibe el panel, y un modelo lineal como Lasso explica un R² de 0.47 del sube y baja diario de la planta, igual o mejor que modelos más complejos, que tienden a sobreajustarse a las 6 zonas disponibles. Cada kWh/m² de radiación suma alrededor de 4.7 puntos al FC.

![FC contra radiación por planta](fig_fc_vs_radiacion.png)

![Benchmark mundial](fig_benchmark_modelos.png)

![ROC y matriz de confusión, base mundial](fig_benchmark_roc_confusion.png)

![Efecto del ajuste, base mundial](fig_benchmark_ajuste.png)

![Benchmark de Colombia](fig_benchmark_colombia.png)

![ROC y matriz de confusión, Colombia](fig_benchmark_colombia_roc_confusion.png)

![Comparativa de todos los modelos](fig_resumen_comparativa.png)

![Efecto de las técnicas de balanceo](fig_exp_balanceo.png)

![Curvas de desempeño en cualquier momento](fig_exp_anytime.png)

![Evolución de la diversidad de la población genética (DEAP)](fig_exp_diversidad.png)

![Curvas ROC consolidadas](fig_exp_roc.png)

![Matrices de confusión de los mejores clasificadores](fig_exp_confusion.png)

![Predicciones frente a valores observados en regresión](fig_exp_reg_tvp.png)

![Diagnóstico de residuos y heterocedasticidad](fig_exp_reg_residuos.png)

![Curvas de calibración y error ECE](fig_exp_calibracion.png)

## 6. Las pruebas estadísticas

Comparamos los modelos con Friedman y Nemenyi, DeLong, el conjunto de confianza de modelos y Diebold-Mariano (1995). En regresión, Random Forest es el único que queda en el conjunto de confianza al 90 %, y su d de Cohen sobre el RMSE frente a Ridge y Lasso es 10.01, un valor muy inestable con solo 5 pliegues. En clasificación, Random Forest y XGBoost no se distinguen entre sí. Clark-West muestra que incluir latitud y longitud mejora la predicción del Ridge (RMSE de 0.0962 con coordenadas y 0.1197 sin ellas, p < 0.001).

![Diagrama de diferencia crítica de Nemenyi](fig_exp_cd.png)

## 7. Qué aprendimos sobre los modelos (interpretabilidad y rendimiento)

KNN es rápido de entrenar y lento al predecir. Random Forest y XGBoost cargan su costo en el entrenamiento y predicen en fracciones de segundo. En el perfilado de una evaluación con SMOTE y XGBoost, el 80 % del tiempo se va en XGBoost y el pico de memoria fue de 621 MB, así que el límite es el procesador y no la memoria.

SHAP muestra que la variable que más pesa es la longitud, y las variables de clima casi no pesan. SHAP y LIME no ordenan igual las variables (correlación de Spearman media de -0.30 en 30 plantas), pero comparten en promedio 3.1 de las 5 variables más importantes.

![Complejidad computacional y escalamiento](fig_exp_complejidad.png)

![SHAP global en clasificación](fig_exp_shap_clf.png)

![SHAP global en regresión](fig_exp_shap_reg.png)

![Gráfico de cascada SHAP en observaciones individuales](fig_exp_shap_cascada.png)

![LIME frente a TreeSHAP en XGBoost](fig_exp_lime_shap.png)

## 8. Conclusiones y lo que queda pendiente

El índice del dataset mundial depende sobre todo de la región y no del clima. Los modelos lo predicen muy bien si "saben" dónde están y fallan en continentes nuevos. En Colombia, en cambio, la radiación explica cerca de la mitad del comportamiento diario de una planta real, y un modelo lineal simple basta para capturarlo.

Queda pendiente medir la tecnología de cada planta en Colombia (potencia DC real, tipo de seguidor), que probablemente explica buena parte de la diferencia de nivel entre plantas. También falta trabajar con radiación medida por estaciones en terreno, que podría subir el R² de alrededor de 0.5 que logramos con radiación modelada.
