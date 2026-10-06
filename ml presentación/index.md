# Aptitud solar fotovoltaica: del índice del dataset a la generación real

Proyecto de Machine Learning del pregrado en Ciencia de Datos de la Universidad del Norte, con el profesor Dr. Lihki Rubio.
Lo hicimos Jesús David Arévalo Montilla, Enmanuel David Díaz Molinares y Alex David Terán Meza.

:::{figure} proceso/fig_mapa_clases_e3.png
:alt: Mapa mundial de las plantas solares coloreadas por clase de aptitud. La clase Baja, en rojo, se concentra en Europa.
:width: 100%

Cada punto es una planta del dataset. Casi toda la clase Baja (en rojo) cae en Europa.
:::

## De qué trata

El punto de partida es un dataset mundial de 58,978 plantas solares con un índice de "aptitud solar" en tres clases: Baja, Media y Alta.
En el EDA encontramos dos cosas que cambian cómo se lee cualquier modelo sobre él:

- El índice sale solo del terreno: pendiente, orientación, sombreado y curvatura. No mide cuánto sol recibe un sitio.
- Casi toda la clase Baja (94.5 %) viene de un lote de plantas europeas que se añadió en la segunda versión del dataset. Un modelo que
  aprende "Europa" acierta la clase Baja sin aprender nada del terreno.

Por eso todos los modelos se validan con bloques espaciales de 5° × 5°: un bloque cae entero en entrenamiento o en prueba, nunca partido.

## Resultados en una tabla

| Base | Tarea | Mejor modelo | Resultado |
|---|---|---|---|
| Mundial | Clasificar la clase de aptitud | Random Forest | F1 macro 0.894 |
| Mundial | Predecir el índice | Random Forest | R² 0.902 |
| Colombia | Predecir el factor de capacidad diario | Lasso | R² dentro de planta 0.469 |
| Colombia | Clasificar el día (bajo, medio, alto) | Regresión logística y SVM RBF | F1 macro 0.572 |

Los números de la base mundial se apoyan en buena parte en que los modelos reconocen la región. Sin latitud y longitud el desempeño baja
mucho, y al dejar un continente fuera del entrenamiento el R² sale negativo en todos los modelos del benchmark base. En Colombia pasa lo
contrario: la energía es casi proporcional a la radiación y un modelo lineal basta.

## Cómo está organizado el libro

::::{grid} 1 1 2 2

:::{card} Datos y EDA
:url: proceso/EDA_Corregido%28Entregable%203%29.ipynb
Limpieza, variables y los hallazgos de arriba, con números.
:::

:::{card} Modelos base
:url: proceso/Benchmark_Modelos_Base.ipynb
Los modelos del curso con hiperparámetros por defecto y con ajuste por validación anidada, con y sin latitud y longitud.
:::

:::{card} Experimento de 140 combinaciones
:url: proceso/Experimento_1_Diseno.ipynb
7 modelos de clasificación × 4 balanceos × 4 optimizadores, más 7 modelos de regresión × 4 optimizadores.
Incluye la comparación de optimizadores, el costo computacional, la estadística formal y la interpretabilidad con SHAP y LIME.
:::

:::{card} Línea de Colombia
:url: proceso/Clima_a_Generacion_Colombia.ipynb
Predecir el factor de capacidad diario real de 16 plantas colombianas a partir del clima, con generación de XM y clima de Open-Meteo.
:::

:::{card} Resumen final
:url: proceso/Resumen_final.md
Todo el recorrido en un documento, con las figuras principales y los cuadros del experimento.
:::

::::

## Para tener en cuenta

Todos los cuadernos se publican con sus salidas y gráficas guardadas, sin volver a ejecutarlos. El entorno de conda está definido en
`environment.yml` y la semilla usada en los experimentos es 42.

El dataset original tiene licencia CC BY-NC-SA 4.0 (Mantilla-Guerra et al., 2026).

## Terminología

Los términos están agrupados por tema. Si buscas uno en particular, el buscador de arriba también los encuentra.

### Datos y terreno

| Término | Qué es |
|---|---|
| IAS (índice de aptitud solar) | Número de 0 a 1 que trae el dataset para cada planta. Se calcula con 0.40 × pendiente + 0.25 × orientación + 0.20 × sombreado + 0.15 × curvatura, o sea que solo usa el terreno. Con cortes en 0.4 y 0.6 se separa en tres clases: Baja, Media y Alta. |
| Variable objetivo y predictoras | La objetivo (target) es lo que el modelo intenta predecir: la clase de aptitud, el índice o el factor de capacidad. Las predictoras son las variables con las que lo intenta. |
| EDA | Análisis exploratorio de datos: revisar, limpiar y describir los datos antes de modelar. |
| ETL | Extraer, transformar y cargar: leer los datos originales y dejarlos listos para usar. |
| DEM (modelo digital de elevación) | Mapa de alturas del terreno. De él se calculan la pendiente, la orientación y la curvatura. |
| Arco-segundo | Unidad para medir ángulos: un grado tiene 60 minutos de arco y cada minuto tiene 60 arco-segundos, así que un arco-segundo es 1/3600 de grado. Sobre el terreno equivale a unos 30 m, y los 9 arco-segundos del DEM que usa el paper son celdas de unos 280 m de lado. |
| Raster | Mapa guardado como una cuadrícula de celdas, cada una con un valor (altura, radiación, etc.). |
| Pendiente (slope) | Inclinación del terreno, en grados. |
| Orientación (aspect) | Hacia qué lado mira una ladera, de 0° a 360°. El dataset usa -1 para el terreno plano, donde no hay orientación. |
| Sombreado (hillshade) | Cuánta sombra proyecta el relieve según la posición del sol. |
| Curvatura | Forma de la superficie: si el terreno es cóncavo, convexo o plano. |
| Variable circular | Variable medida en ángulos, como la orientación o la dirección del viento. 1° y 359° están casi en el mismo punto, así que se pasan a seno y coseno. |
| Dato centinela | Valor que en realidad significa "sin dato" o "no aplica", por ejemplo un 0 o un -1. |
| Valor extremo (outlier) | Dato muy lejos del resto. |
| Lote de procesamiento | Grupo de plantas cuyos datos se procesaron juntos y con su propia escala (en este dataset, por continente). Es la explicación más probable de que el índice cambie de nivel de una región a otra. |
| Macrorregión | Grupo de continentes que se usa en los contrastes: Asia y Oceanía; América; Europa, África y Medio Oriente. |
| Densidad de potencia | Potencia instalada por metro cuadrado de terreno. Una planta típica instala entre 40 y 100 W/m². |
| Unión espacial | Asignarle a cada punto el polígono más cercano de otro mapa. Así se calcula el área de cada planta, y por eso falla cuando el punto cae sobre un solo panel o un techo. |
| Ruido de etiqueta | Etiquetas que no son del todo coherentes, por ejemplo el mismo valor del índice en dos clases distintas. Ningún modelo puede acertarlas todas. |
| D1 a D14 | Numeración de los 14 problemas de calidad de datos que se documentan en el EDA. |

### Energía solar y clima

| Término | Qué es |
|---|---|
| Planta fotovoltaica (FV) | Instalación que convierte la luz del sol en electricidad con paneles. |
| Factor de capacidad (FC) | Energía que entregó la planta en el día dividida entre la que habría entregado funcionando a potencia nominal las 24 horas. Va de 0 a 1 y es lo que se predice en la línea de Colombia. |
| Capacidad efectiva neta | Potencia máxima que la planta puede entregar a la red, según XM. Es el denominador del factor de capacidad. |
| Potencia DC y AC | DC es la potencia pico de los paneles; AC, la que sale del inversor hacia la red. Su relación cambia el nivel de FC de cada planta. |
| Seguidor solar | Estructura que gira los paneles para seguir al sol. Una planta con seguidor suele producir más que una fija. |
| Radiación global horizontal (GHI) | Energía solar que llega a una superficie horizontal, en kWh/m² por día. Es la variable de clima que más pesa en Colombia. |
| Radiación en plano inclinado | Radiación sobre una superficie inclinada, como un panel. Se pidió con 10° de inclinación hacia el sur. |
| Nubosidad | Fracción del cielo cubierta por nubes. |
| Índice de claridad | Cociente entre la radiación que llega al suelo y la que llegaría al borde de la atmósfera. Separa el efecto de las nubes del de la posición del sol; queda pendiente para una versión con datos horarios. |
| Reanálisis (ERA5) | Reconstrucción del clima pasado que combina un modelo con observaciones. ERA5 da celdas de unos 0.25° (unos 28 km). El clima de cada planta es el valor de su celda, no una medición en el sitio. |
| best_match | Opción por defecto de Open-Meteo: combina los modelos IFS HRES, ERA5 y ERA5-Land. Fue la fuente de radiación que mejor explicó la generación. |
| NOCT | Temperatura nominal de operación de una celda solar. Sirve para estimar la temperatura de la celda a partir de la del aire. |
| Pérdida por temperatura | Un panel produce menos cuando se calienta. Se usó un 0.4 % menos por cada grado de la celda sobre 25 °C, un valor genérico. |

### Datos de Colombia

| Término | Qué es |
|---|---|
| XM | Operador del mercado eléctrico de Colombia. Publica la generación por hora de cada planta. |
| GEM (Global Energy Monitor) | Organización que mantiene un registro público de plantas de energía. De su Global Solar Power Tracker salen las plantas del dataset y las fichas con coordenadas. |
| GSA (Global Solar Atlas) | Mapa mundial del recurso solar y del potencial fotovoltaico. De ahí salen `ghi` y `pv_potential` en el dataset. |
| Open-Meteo | Servicio con datos de clima histórico para cualquier coordenada. De ahí sale el clima de cada planta. |
| OpenStreetMap (OSM) | Mapa colaborativo. De ahí vienen las carreteras y los polígonos de instalaciones solares del dataset. |
| IDEAM | Instituto de Hidrología, Meteorología y Estudios Ambientales de Colombia. Sus estaciones miden la radiación en el terreno. |
| Día planta | Una fila de la base de Colombia: una planta en un día. Hay 8,589. |
| Zona de cercanía | Grupo de plantas a menos de 100 km entre sí, que comparten el clima del mismo día. Son 6, y la validación deja fuera una zona entera cada vez. |
| Nivel de la planta | FC medio de la planta y media de cada variable de clima, calculados con la primera mitad de sus días. Se les resta a los datos para medir solo el sube y baja diario. |
| Arranque | Los primeros 60 días de una planta cuyo inicio de operación se observa. Se excluyen del análisis principal con un criterio que no mira ni la radiación ni el FC. |
| Terciles | Dos cortes que dividen los datos en tres grupos del mismo tamaño. Con los terciles del FC de cada planta se definen los días bajo, medio y alto. |

### Validación y fuga de información

| Término | Qué es |
|---|---|
| Fuga de información (data leakage) | Que el modelo use al entrenar algo que no tendría en la práctica, como datos de la prueba. Infla los resultados. |
| Validación cruzada | Repetir el entrenamiento y la prueba con varias particiones de los datos. Cada partición es un pliegue (fold). |
| Bloque espacial | Cuadrado de 5° × 5° del mapa, de unos 550 km de norte a sur. Todas las plantas de un bloque van juntas a entrenamiento o a prueba. Hay 496 bloques. |
| Validación espacial por bloques | Partir los datos por bloques geográficos y no por filas al azar. Evita que plantas vecinas, que se parecen, queden una en entrenamiento y otra en prueba. |
| Autocorrelación espacial | Que lo que está cerca en el mapa se parezca. Con una partición al azar le da ventaja al modelo, porque puede predecir una planta mirando a su vecina. |
| Estratificar | Mantener en cada pliegue la proporción de clases, para que la clase Baja (3 %) aparezca siempre en la prueba. `StratifiedGroupKFold` lo hace respetando los bloques. |
| Validación anidada | Dos bucles: el interno elige los hiperparámetros y el externo mide el desempeño con datos que no participaron en esa elección. |
| Bucle externo e interno | El externo tiene 5 pliegues por bloques y solo mide. El interno tiene 3 pliegues dentro del entrenamiento externo y elige los hiperparámetros. |
| Sesgo de selección | El optimismo que aparece cuando el resultado se reporta con los mismos datos con los que se eligió el mejor modelo. |
| Leave-one-out, leave-one-region-out, leave-one-group-out | Dejar fuera un caso, una región o un grupo completo, entrenar con el resto y probar en lo que quedó fuera. Aquí se deja fuera una macrorregión (base mundial) o una zona de plantas (Colombia). |
| Partición temporal | Entrenar con el pasado y probar con el futuro. En Colombia, la primera mitad de los días de cada planta es el pasado. |
| Predicción fuera de pliegue (out-of-fold) | Predicción de una planta hecha por un modelo que no la vio al entrenar. Con ellas cada planta aparece una sola vez. |
| Pipeline | Cadena de pasos de scikit-learn (imputar, escalar, balancear, modelo) que se ajustan juntos usando solo el entrenamiento de cada pliegue. |
| Imputación por mediana | Rellenar un valor vacío con la mediana del entrenamiento. |
| Estandarización | Restar la media y dividir entre la desviación estándar, para que las variables queden en la misma escala. KNN, SVM y los modelos con regularización la necesitan. |
| Semilla | Número que fija la parte aleatoria del código para poder repetir los resultados. Aquí es 42. |

### Modelos

| Término | Qué es |
|---|---|
| Clasificación y regresión | Clasificar es predecir una clase (Baja, Media, Alta). Hacer regresión es predecir un número (el índice o el factor de capacidad). |
| Hiperparámetro | Valor que se fija antes de entrenar y que el modelo no aprende de los datos, como k en KNN, C en el SVM o alpha en Ridge. |
| Modelo de referencia | Modelo trivial que sirve de piso: en clasificación siempre predice la clase más frecuente, y en regresión el promedio (o el nivel de la planta). Cualquier modelo útil tiene que superarlo. |
| Sobreajuste | Que el modelo se aprenda detalles del entrenamiento que no se repiten en datos nuevos. Sale muy bien en entrenamiento y peor en prueba. |
| Regularización (L1, L2) | Penalización que limita el tamaño de los coeficientes. L2 los encoge todos (Ridge) y L1 puede llevar algunos a cero (Lasso). |
| Regresión logística | Modelo lineal para clasificar: estima la probabilidad de cada clase con una función logística. |
| Ridge y Lasso | Regresión lineal con regularización L2 y L1. Alpha es la fuerza de la penalización: mientras más grande, más penaliza. |
| Naive Bayes gaussiano | Modelo probabilístico simple. Supone que las variables son independientes entre sí dentro de cada clase y que siguen una distribución normal. |
| KNN (k vecinos más cercanos) | Predice mirando las k plantas más parecidas del entrenamiento. No aprende parámetros: guarda los datos. |
| Árbol de decisión | Serie de preguntas de sí o no sobre las variables que va dividiendo los datos hasta llegar a una predicción. |
| Random Forest (bosque aleatorio) | Muchos árboles entrenados con partes distintas de los datos. La predicción es el voto o el promedio de todos. |
| Boosting y XGBoost | Árboles que se entrenan uno tras otro, cada uno corrigiendo los errores del anterior. XGBoost es una implementación rápida; HistGradientBoosting es la versión de scikit-learn que agrupa los valores en histogramas. |
| SVM y SVR | Máquina de vectores de soporte. El SVM busca el límite que separa las clases con el mayor margen; el SVR, la curva que sigue los datos dentro de un margen de error. |
| Kernel RBF | Función que le deja al SVM trazar fronteras curvas en vez de rectas. El SVM lineal solo traza rectas. |
| Margen epsilon | En el SVR, el tamaño del error que se perdona alrededor de la predicción. Si es muy grande para el rango del índice, el modelo ignora errores que sí importan. |
| No estacionariedad espacial | Que la relación entre variables cambie de un lugar a otro. Un modelo lineal global no la puede representar, porque ajusta un solo plano para todo el mundo. |

### Balanceo de clases

| Término | Qué es |
|---|---|
| Clase desbalanceada | Clase con muchas menos observaciones que las demás. Aquí, Baja tiene el 3 %. |
| Sobremuestreo | Agregar ejemplos de la clase minoritaria. SMOTE y ADASYN lo hacen, y solo con el entrenamiento de cada pliegue. |
| SMOTE | Crea plantas sintéticas de la clase minoritaria interpolando entre vecinas reales. |
| ADASYN | Como SMOTE, pero crea más puntos donde la clase minoritaria es más difícil de aprender. |
| class_weight | No crea datos: le da más peso a las clases poco frecuentes en la función de pérdida. En KNN no aplica. |

### Métricas

| Término | Qué es |
|---|---|
| Exactitud | Proporción de aciertos. Con una clase del 75 %, predecir siempre esa clase da 75 % de exactitud. |
| Exactitud balanceada | Promedio del recall de cada clase. No depende de cuántas plantas hay en cada una. |
| Precisión y recall | Precisión: de lo que el modelo dijo que era de una clase, cuánto lo era. Recall (exhaustividad): de lo que era de esa clase, cuánto encontró el modelo. |
| F1 y F1 macro | El F1 combina precisión y recall en un solo número. El F1 macro promedia el F1 de las tres clases sin pesarlas por su tamaño, y por eso es la métrica principal cuando una clase es pequeña. |
| Matriz de confusión | Tabla con los aciertos y los errores de cada clase. Si se normaliza por fila, la diagonal es el recall de cada clase. |
| Curva ROC y AUC | La curva ROC grafica los verdaderos positivos contra los falsos positivos al mover el umbral de decisión. El AUC es el área bajo esa curva: la probabilidad de que el modelo le dé más puntaje a un ejemplo de la clase correcta que a uno de otra clase. 0.5 es azar y 1 es perfecto. |
| Uno contra el resto | Con tres clases, la métrica se calcula una vez por clase, enfrentándola a las otras dos juntas. |
| Kappa ponderado cuadrático | Acuerdo entre la predicción y la realidad que castiga más los errores entre clases lejanas (Baja con Alta pesa más que Baja con Media). 0 es azar. |
| R² | Proporción de la variación que explica el modelo. 1 es perfecto, 0 equivale a predecir el promedio y un valor negativo es peor que predecir el promedio. |
| R² dentro de planta | R² calculado después de restarle a cada variable la media de su planta. Mide cuánto explica el clima el sube y baja diario, sin contar el nivel de cada planta. |
| RMSE y MAE | Error típico de las predicciones, en las unidades de la variable. El RMSE castiga más los errores grandes; el MAE es el promedio del error sin signo. |
| MAE relativo | MAE dividido entre el FC medio de la planta. Dice qué fracción de su nivel típico se equivoca el modelo. |
| Residuo | Valor real menos valor predicho. |
| Brier y ECE | Miden qué tan buenas son las probabilidades. El Brier es el error cuadrático medio de las probabilidades; el ECE, la diferencia media entre la confianza del modelo y su exactitud real. En los dos, menos es mejor. |
| Calibración | Un modelo está calibrado si, de las plantas a las que les da 80 % de probabilidad, acierta más o menos el 80 %. |
| Recalibración (Platt e isotónica) | Ajustar las probabilidades de un modelo ya entrenado. Platt usa una sigmoide; la isotónica, una función que solo sube, por tramos. |

### Ajuste de hiperparámetros

| Término | Qué es |
|---|---|
| Evaluación y presupuesto | Una evaluación es entrenar y medir un modelo con una configuración de hiperparámetros. Cada búsqueda tiene un presupuesto de 30. |
| Búsqueda en grilla | Probar todas las combinaciones de una lista de valores. Gasta evaluaciones repitiendo valores de los hiperparámetros que importan poco. |
| Búsqueda aleatoria | Probar configuraciones al azar dentro de los rangos. Con el mismo presupuesto prueba más valores distintos de cada hiperparámetro que la grilla. |
| Búsqueda bayesiana (Optuna, TPE) | Usa lo que ya probó para decidir qué probar después. Optuna es la librería y TPE (Tree-structured Parzen Estimator), el método que usa por dentro. |
| Algoritmo genético (DEAP) | Mantiene una población de configuraciones y, generación tras generación, se queda con las mejores, las cruza y las muta. DEAP es la librería. Aquí la población es de 6. |
| Torneo, cruce, mutación y elitismo | Pasos del algoritmo genético. El torneo elige padres, el cruce (aquí BLX-α) mezcla dos configuraciones, la mutación las altera un poco y el elitismo deja pasar intacta a la mejor. |
| Halving sucesivo (multifidelidad) | Prueba muchas configuraciones con pocos datos y deja pasar a las mejores a rondas con más datos, hasta evaluar a las finalistas con todos. |
| Curva de desempeño en cualquier momento (anytime) | Mejor valor que ha encontrado una búsqueda hasta cada evaluación. Muestra qué tan rápido llega a un buen resultado. |
| Regret | Cuánto falta para el mejor valor. Aquí 0 es el mejor valor que encontró cualquiera de los cuatro optimizadores y 1 es la mediana de todas las evaluaciones. |
| Escala logarítmica | Repartir los valores de un hiperparámetro de modo que cada paso multiplique en vez de sumar (0.001, 0.01, 0.1). Se usa para C, alpha y la tasa de aprendizaje. |
| Parada temprana (early stopping) | Detener el entrenamiento cuando el modelo deja de mejorar con datos de validación. |

### Pruebas estadísticas

| Término | Qué es |
|---|---|
| Valor p | Probabilidad de ver una diferencia así de grande si en realidad no hubiera ninguna. Un p pequeño (por ejemplo, menor que 0.05) indica que la diferencia difícilmente es azar. Con muchos datos, hasta diferencias pequeñas salen significativas. |
| Prueba pareada | Compara dos modelos medidos sobre los mismos casos (los mismos pliegues o las mismas plantas). |
| Potencia de una prueba | Probabilidad de detectar una diferencia que sí existe. Con 5 pliegues, Nemenyi tiene poca. |
| Prueba ómnibus | Pregunta si hay alguna diferencia entre todos los grupos a la vez, sin decir cuáles. Friedman es una. |
| Friedman y Nemenyi | Friedman revisa si hay diferencias entre varios modelos medidos en los mismos pliegues. Nemenyi los compara de a pares con sus rangos medios, y el diagrama de diferencia crítica une con una barra los que no se distinguen. |
| Wilcoxon (rangos con signo) | Compara dos modelos caso a caso sin suponer una distribución normal. |
| Corrección de Holm | Ajusta los valores p cuando se hacen muchas comparaciones a la vez, para no declarar diferencias que son azar. |
| DeLong | Compara dos AUC calculados sobre los mismos datos. |
| Delta de Cliff | Qué tan seguido un modelo queda por encima de otro, de -1 a 1. 0 es empate. No depende de la escala de la métrica. |
| d de Cohen | Diferencia entre dos promedios en unidades de desviación estándar. Por convención 0.2 es pequeña, 0.5 mediana y 0.8 grande. |
| Bootstrap BCa | Intervalo de confianza que se obtiene remuestreando los datos muchas veces. BCa corrige el sesgo y la asimetría. Aquí se remuestrean bloques enteros y no plantas sueltas. |
| Intervalo de confianza (IC95) | Rango donde se espera que caiga el valor verdadero con un 95 % de confianza. |
| Conjunto de confianza de modelos (MCS) | Empieza con todos los modelos y va eliminando los que son peores con significancia, hasta que los que quedan no se distinguen entre sí. |
| Diebold-Mariano (DM, HLN) | Compara el error de dos modelos sobre una misma secuencia de casos. HLN es una corrección para muestras pequeñas. |
| Modelo anidado | Modelo que es un caso particular de otro. Ridge sin latitud ni longitud está anidado en Ridge con las 15 variables. |
| Clark-West | Variante de Diebold-Mariano para modelos anidados, donde la prueba original queda sesgada contra el modelo grande. |
| Giacomini-White (GW) | Pregunta si la diferencia de error entre dos modelos se puede predecir con otra variable; aquí, con la de la planta vecina. Capta si un modelo gana solo en ciertas zonas. |
| Curva de Hilbert | Forma de recorrer el mapa con una sola línea para que los puntos cercanos queden cerca en la lista. Permite usar pruebas pensadas para series de tiempo con datos espaciales. |
| ACF, Ljung-Box y BDS | Pruebas de series de tiempo. La ACF mide cuánto se parece cada residuo al de su vecino; Ljung-Box y BDS revisan si hay dependencia entre ellos. |
| I de Moran | Mide la autocorrelación espacial, de -1 a 1. Cerca de 0 no hay patrón; un valor positivo indica que los vecinos se parecen. |
| Heterocedasticidad | Que la variación de los errores no sea constante. Breusch-Pagan y White la prueban. |
| Normalidad, asimetría y curtosis | Jarque-Bera prueba si los residuos son normales. La asimetría dice hacia qué lado se alarga la distribución; la curtosis, qué tan pesadas son las colas. |
| Spearman y Pearson | Pearson mide relaciones lineales. Spearman usa las posiciones de los valores y no los valores: capta relaciones que suben o bajan aunque no sean rectas. |
| Kruskal-Wallis | Prueba que compara varios grupos usando rangos, sin suponer normalidad. |
| Colinealidad y VIF | La colinealidad es que dos variables digan casi lo mismo. El VIF (factor de inflación de varianza) mide cuánto se explica una variable con las demás; por encima de 5 suele considerarse relevante. |

### Costo computacional

| Término | Qué es |
|---|---|
| Complejidad (O de n por p) | Cómo crece el tiempo de un algoritmo con el número de filas n y de variables p. O(n·p) crece en proporción; O(n²) crece al cuadrado. |
| Exponente empírico | El b que sale de ajustar t ≈ a·n^b a los tiempos medidos. b = 1 es crecimiento proporcional y b = 2, cuadrático. Se compara con el exponente teórico. |
| Fuerza bruta, KD-Tree y Ball-Tree | Formas de buscar vecinos en KNN. La fuerza bruta compara con todos los puntos; KD-Tree y Ball-Tree ordenan los datos en árboles para saltarse comparaciones. Con 15 variables, la fuerza bruta les gana. |
| FAISS y HNSW | FAISS es una librería para buscar vecinos muy rápido. Flat es exacto; HNSW es aproximado, con un grafo de varias capas, y mucho más rápido a cambio de perder un poco de exactitud. |
| SAGA y SGD | Algoritmos de gradiente estocástico: actualizan el modelo con una fila o un lote a la vez. SAGA es la variante con reducción de varianza. |
| `partial_fit` | Entrenar por bloques sin tener todos los datos en memoria. |
| Nyström | Aproximación del kernel RBF que permite usar un SVM lineal conservando parte de la no linealidad. |
| XGBoost `hist` y `exact` | Dos formas de buscar cortes en los árboles. `exact` revisa todos los valores; `hist` los agrupa en histogramas y es mucho más rápido. |
| Ley de Amdahl | Límite de cuánto se acelera un programa al usar más núcleos: la parte que no se puede paralelizar (la fracción serial) lo frena. |
| Núcleo, proceso e hilo | El núcleo es una unidad de cálculo del procesador. Un proceso es un programa en ejecución y un hilo, una línea de ejecución dentro de él. `n_jobs` dice cuántos se usan en paralelo. |
| joblib, loky y threading | joblib reparte tareas en paralelo. loky usa procesos y threading usa hilos, que en Python están limitados por el GIL salvo en código que lo libera. |
| GIL | Candado de Python que impide que dos hilos ejecuten código Python al mismo tiempo. |
| Perfilado | Medir en qué funciones se va el tiempo (`cProfile`) y cuánta memoria se usa (`memory_profiler`). |
| Horas-núcleo | Tiempo de cómputo sumado de todos los núcleos usados. 16 núcleos durante una hora son 16 horas-núcleo. |
| CPU, GPU y RAM | La CPU es el procesador general. La GPU es un procesador de gráficos, útil para cálculo en paralelo. La RAM es la memoria de trabajo. |

### Interpretabilidad

| Término | Qué es |
|---|---|
| SHAP y TreeSHAP | Reparte cada predicción entre las variables con valores de Shapley, una idea de teoría de juegos: cuánto empuja cada variable la predicción hacia arriba o hacia abajo. TreeSHAP es la versión exacta y rápida para árboles. |
| Importancia media de SHAP | Promedio del valor absoluto de SHAP de una variable sobre muchas plantas. Dice qué variables pesan más en las predicciones. |
| LIME | Explica una predicción ajustando un modelo lineal sencillo alrededor de esa planta, con datos perturbados. |
| Diagrama de enjambre (beeswarm) | Gráfico con un punto por planta: la posición horizontal es cuánto empuja la variable la predicción y el color, si su valor es alto o bajo. |
| Gráfico de cascada | Parte del valor medio que predice el modelo y suma la contribución de cada variable hasta llegar a la predicción de una planta. |
