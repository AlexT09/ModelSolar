# Factor de capacidad diario de plantas solares en Colombia

Proyecto de Machine Learning del pregrado en Ciencia de Datos de la Universidad del Norte, con el profesor Dr. Lihki Rubio.
Lo hicimos Jesús David Arévalo Montilla, Enmanuel David Díaz Molinares y Alex David Terán Meza.

:::{figure} ../figuras/fig_fc_vs_radiacion.png
:alt: Una gráfica por planta del factor de capacidad diario contra la radiación del día. En todas, los puntos suben con la radiación.
:width: 100%

En las 16 plantas, el factor de capacidad del día sube con la radiación que recibe la planta.
:::

## De qué trata

Queremos predecir cuánto produce cada día una planta solar colombiana a partir del clima de ese día. En Colombia no existía una base
pública para hacerlo: XM, el operador del mercado eléctrico, publica la generación de cada planta, pero no dónde está ni qué clima recibe.
Por eso armamos una base propia con la generación real de XM, el clima de Open-Meteo y coordenadas verificadas: 8,589 días-planta de
16 plantas, de enero de 2024 a febrero de 2026.

Predecimos una sola cosa: el **factor de capacidad (FC) diario**, la energía del día dividida entre la que habría dado la planta a
plena capacidad las 24 horas. Como cada planta tiene su propio nivel por su tecnología, que no conocemos, predecimos cuánto sube o baja
su FC frente a ese nivel.

Proponemos un **Ridge jerárquico con nivel adaptativo**, que suma tres partes:

- una respuesta al clima común a todas las plantas;
- un ajuste propio de cada planta, que se encoge hacia la respuesta común para no exagerar con plantas de pocos datos;
- un nivel que se corrige solo con la generación observada hasta el día anterior, para seguir a las plantas que cambian con el tiempo.

Lo comparamos con modelos de regresión de referencia: regresión lineal, Ridge, Lasso, KNN, SVR, Kernel Ridge, Random Forest y
XGBoost. Como el modelo propuesto usa la generación de los días anteriores, también lo comparamos con Lasso usando esa misma
información.

## Cómo se evalúa

Cada planta se parte en el tiempo: la primera mitad de sus días es su pasado y la segunda mitad se usa solo para medir. Además, en cada
ronda se deja fuera una zona completa de plantas cercanas, porque comparten el clima del día. Los hiperparámetros se eligen con
validación anidada, sin mirar nunca los días de prueba. La métrica principal es el $R^2$ dentro de cada planta.

## Resultados en una tabla

| Modelo | $R^2$ mediano dentro de planta | Peor planta | Error relativo | Tiempo del protocolo |
|---|---|---|---|---|
| **Ridge jerárquico (propuesto)** | **0.525** | **0.30** | **0.125** | 1.7 s |
| Lasso (el mejor modelo de referencia) | 0.469 | -0.46 | 0.140 | 0.8 s |
| XGBoost | 0.463 | -0.46 | 0.142 | 39 s |
| Random Forest | 0.431 | -0.49 | 0.144 | 162 s |
| Lasso + nivel adaptativo (misma información) | 0.522 | 0.19 | 0.129 | 0.7 s |

El modelo propuesto gana a todos los modelos de referencia y, a diferencia de todos ellos, no tiene ninguna planta con $R^2$ negativo. La ganancia viene sobre todo
de seguir el nivel de cada planta con su generación reciente: cuando Lasso recibe esa misma corrección queda muy cerca. Los modelos más
flexibles no superan a un modelo lineal, porque la producción diaria es casi proporcional a la radiación.

## Cómo está organizado el libro

::::{grid} 1 1 2 2

:::{card} Datos de XM y Open-Meteo
:url: ../notebooks/Clima_a_Generacion_Colombia.ipynb
Cómo se armó la base: descarga, emparejamiento de plantas, clima por hora, tabla diaria y EDA.
:::

:::{card} Modelos y modelo propuesto
:url: ../notebooks/Modelo_Propuesto_Colombia.ipynb
Modelos de referencia, Ridge jerárquico, pruebas estadísticas, ablación y pruebas de sobreajuste. Es la fuente de los resultados del artículo.
:::

:::{card} Resumen del proyecto
:url: Resumen_final.md
Todo el recorrido en un documento, de la pregunta original a las conclusiones.
:::

::::

## Para tener en cuenta

Los cuadernos se publican con sus salidas y gráficas guardadas. El entorno de conda está en `environment.yml` y la semilla es 42.
El artículo en LaTeX está en la carpeta `paper/` del repositorio.

El proyecto empezó con un dataset mundial de plantas solares y su índice de aptitud. Al revisarlo encontramos que ese índice depende
del terreno y de la región, no del clima, y decidimos trabajar con generación real. Ese trabajo previo quedó guardado en la etiqueta
[`linea-mundial`](https://github.com/AlexT09/ModelSolar/tree/linea-mundial) del repositorio.

Si algún término te suena raro, está explicado desde cero en la sección [Terminología](#terminologia), al final de esta página.

(terminologia)=
## Terminología

Esta sección explica todos los términos técnicos que aparecen en el libro, empezando desde cero. Los términos están agrupados por tema y cada grupo va de lo más básico a lo más específico. Si buscas uno en particular, el buscador de arriba también los encuentra. Los nombres de columnas y de funciones de código aparecen entre comillas invertidas, como `solar_aptitude`.

### 1. Lo básico de datos y de machine learning

| Término | Qué es |
|---|---|
| Machine learning (aprendizaje automático) | Forma de programar en la que, en vez de escribir las reglas a mano, se le muestran muchos ejemplos a un programa para que encuentre patrones y pueda hacer predicciones sobre casos nuevos. |
| Dataset (conjunto de datos) | Tabla con la información con la que se trabaja. Aquí cada fila es una planta en un día y cada columna es algo que se sabe de ese día: cuánto generó la planta, cuánta radiación recibió, la temperatura, etc. |
| Fila, observación o caso | Un elemento del dataset. En la base de Colombia es una planta en un día (un día-planta). |
| Columna o variable | Una característica que se mide de cada caso, como la latitud, la temperatura o la clase de aptitud. |
| Variable predictora (característica, feature) | Variable que se le da al modelo para que haga su predicción. Por ejemplo, la pendiente, la longitud o la temperatura. |
| Variable objetivo (target) y etiqueta | La objetivo es lo que se quiere predecir: aquí, la clase de aptitud, el índice de aptitud o el factor de capacidad. La etiqueta es el valor real de la objetivo en un caso concreto, el que el modelo debería acertar. |
| Modelo | Programa que aprendió de ejemplos cómo se relacionan las variables predictoras con la objetivo, y que usa esa relación para predecir casos nuevos. KNN, Random Forest o XGBoost son tipos de modelos. |
| Entrenar (entrenamiento) | Dejar que el modelo aprenda de un conjunto de ejemplos, ajustando sus parámetros internos para equivocarse lo menos posible. |
| Datos de prueba | Casos que el modelo no vio mientras entrenaba. Sirven para medir con honestidad qué tan bien predice, igual que un examen con preguntas que no se vieron en clase. |
| Predecir (predicción) | Dar el valor que el modelo cree que tiene la variable objetivo en un caso. |
| Regresión | Tipo de problema en el que se predice un número, como el índice de aptitud (de 0 a 1) o el factor de capacidad. No hay que confundirla con la regresión logística, que a pesar del nombre sirve para clasificar. |
| Parámetro | Número interno que el modelo aprende solo durante el entrenamiento, como la pendiente de una recta. |
| Hiperparámetro | Ajuste que se fija antes de entrenar y que el modelo no aprende de los datos: por ejemplo, cuántos vecinos mira KNN o cuántos árboles tiene un Random Forest. Elegirlos bien cambia el resultado. |
| Función de pérdida (o de costo) | Número que mide qué tan mal predice un modelo. Entrenar es buscar los parámetros que lo hagan lo más pequeño posible. |
| Generalizar (generalización) | Que el modelo funcione bien con datos nuevos y no solo con los que usó para entrenar. |
| Sobreajuste (overfitting) | Cuando el modelo se aprende de memoria detalles del entrenamiento que no se repiten en datos nuevos. Le va muy bien en el entrenamiento y mal en la prueba. |
| Probabilidad | Número entre 0 y 1 (o entre 0 % y 100 %) que dice qué tan seguro está el modelo de que algo ocurre. Un 0.8 es un 80 % de confianza. |
| Umbral | Valor a partir del cual se toma una decisión. Por ejemplo, con un umbral de 0.5, el modelo dice "Alta" cuando la probabilidad de Alta pasa de 0.5. |
| Aleatorio y semilla | Aleatorio es lo que se decide al azar, como la forma de repartir los datos. La semilla es un número que fija ese azar para que el código dé siempre el mismo resultado. Aquí es 42. |
| Modelo lineal y no lineal | Un modelo lineal combina las variables sumándolas, cada una con su peso, y eso dibuja una recta (o un plano). Uno no lineal puede dibujar curvas y formas más complicadas. |
| Benchmark | Comparación de varios modelos bajo las mismas reglas, para ver cuál funciona mejor. |
| Cuaderno (notebook, Jupyter) | Documento que mezcla texto, código y los resultados del código (tablas y gráficas). Este libro está hecho con cuadernos. |
| Python, pandas y scikit-learn | Python es el lenguaje de programación. pandas es una librería para manejar tablas de datos y scikit-learn es una librería con modelos de machine learning ya programados. |
| Librería | Conjunto de código ya escrito que se puede reutilizar. Por ejemplo Optuna, DEAP, SHAP o FAISS, que aparecen más abajo. |
| Paper y preprint | Un paper es un artículo científico. Un preprint es su versión antes de pasar por la revisión de una revista. |
| DOI | Código único de un artículo científico, que sirve para encontrarlo en internet. |
| API | Forma que ofrece un servicio para que un programa le pida datos. XM y Open-Meteo tienen una. |
| CSV | Archivo de texto que guarda una tabla, con los valores separados por comas o por punto y coma. |
| Promedio (media) | Suma de los valores dividida entre cuántos son. |
| Mediana | Valor del medio cuando se ordenan los datos de menor a mayor. A diferencia del promedio, casi no le afectan los valores extremos. |
| Desviación estándar y varianza | Miden cuánto se alejan los datos de su promedio. La varianza es el cuadrado de la desviación estándar. |
| Correlación | Qué tanto dos variables suben o bajan juntas. Va de -1 a 1: cerca de 1 suben juntas, cerca de -1 una sube cuando la otra baja y cerca de 0 no hay relación clara. Que dos variables estén correlacionadas no significa que una cause la otra. |
| Distribución normal | La forma de campana: casi todos los valores cerca del promedio y pocos muy lejos. |
| Rango (posición) | El lugar que ocupa un valor cuando los datos se ordenan de menor a mayor. Varias pruebas estadísticas trabajan con posiciones y no con los valores. |

### 2. Plantas y coordenadas

| Término | Qué es |
|---|---|
| Planta fotovoltaica (FV) | Instalación que convierte la luz del sol en electricidad con paneles. |
| Latitud y longitud | Las coordenadas de un lugar en el mapa. La latitud dice qué tan al norte o al sur está (0° en el ecuador) y la longitud qué tan al este o al oeste. |
| Grado (°) | Unidad para medir ángulos y coordenadas. Una vuelta completa tiene 360 grados. |

### 3. Calidad y limpieza de los datos

| Término | Qué es |
|---|---|
| EDA (análisis exploratorio de datos) | Revisar, describir y limpiar los datos antes de modelar, para entender qué hay y qué problemas tienen. |
| ETL | Extraer, transformar y cargar: el proceso de leer los datos originales y dejarlos listos para usar. |
| Valor nulo o faltante | Casilla de la tabla sin dato. |
| Duplicado | Fila repetida. Aquí se buscan filas que son iguales en todo salvo en el identificador o el nombre. |
| Valor extremo (outlier) | Dato muy lejos del resto. Puede ser real o un error. |
| Filtro | Regla que deja fuera ciertas filas, por ejemplo las plantas con menos de 100 días de datos. |
| Variable derivada | Variable calculada a partir de otras, como el seno de un ángulo. |
| Variable categórica y numérica | Una categórica toma categorías (Baja, Media, Alta). Una numérica toma números (la pendiente, la temperatura). |
| Escalar y estandarizar | Poner las variables en una escala parecida. Estandarizar es restar el promedio y dividir entre la desviación estándar, para que ninguna variable pese más solo por tener números más grandes. KNN, SVM y los modelos regularizados la necesitan. |
| Centrar una variable | Restarle su promedio, para que sus valores queden alrededor de 0. Se hace, por ejemplo, con el FC de cada planta para medir solo su sube y baja diario. |
| Colinealidad | Que dos variables digan casi lo mismo (por ejemplo, humedad y temperatura). Le estorba a un modelo lineal porque no sabe a cuál darle el mérito. |

### 4. Energía solar y clima

| Término | Qué es |
|---|---|
| Energía y potencia (kWh, kW, MW) | La potencia es qué tan rápido se produce energía, y se mide en kilovatios (kW) o megavatios (MW; 1 MW son 1,000 kW). La energía es lo que se produce en un tiempo, y se mide en kilovatios hora (kWh): una planta de 1 kW que funciona una hora produce 1 kWh. |
| Radiación solar (irradiancia) | Energía de la luz del sol que llega a una superficie. Se mide por metro cuadrado: en vatios por metro cuadrado (W/m²) en un instante, o en kWh/m² sumada durante un día. |
| Radiación global horizontal (GHI) | Radiación solar total que llega a una superficie horizontal. Es la variable de clima que más pesa en Colombia. |
| Radiación en plano inclinado | Radiación sobre una superficie inclinada, como un panel. Se pidió con 10° de inclinación hacia el sur. |
| Radiación de onda corta | La luz que llega del sol, a diferencia del calor que irradia la Tierra. Es la que aprovechan los paneles. |
| Nubosidad | Fracción del cielo cubierta por nubes. |
| Viento zonal y meridional | Las dos componentes en que se descompone el viento: la zonal va de este a oeste y la meridional de norte a sur. El dataset calcula la velocidad del viento a partir de ellas (`u10` y `v10`, a 10 m de altura). |
| Humedad relativa | Cuánto vapor de agua tiene el aire respecto al máximo que podría tener a esa temperatura. |
| Factor de capacidad (FC) | Energía que entregó la planta en el día dividida entre la que habría entregado funcionando a potencia nominal las 24 horas. Va de 0 a 1 y es lo que se predice en la línea de Colombia. |
| Capacidad efectiva neta | Potencia máxima que la planta puede entregar a la red, según XM. Es el denominador del factor de capacidad. |
| Potencia DC y AC | DC es la potencia pico de los paneles y AC, la que sale del inversor hacia la red. Su relación (DC/AC) cambia el nivel de FC de cada planta. |
| Inversor | Aparato que convierte la corriente continua de los paneles (DC) en la corriente alterna (AC) de la red. |
| Seguidor solar | Estructura que gira los paneles para seguir al sol durante el día. Una planta con seguidor suele producir más que una fija. |
| Tecnología de la planta | Datos como si la planta tiene seguidor o estructura fija, y su relación DC/AC. No está en la base, y probablemente explica por qué unas plantas tienen un nivel de FC más alto que otras. |
| Reanálisis (ERA5) | Reconstrucción del clima pasado que combina un modelo con observaciones. ERA5, producido por el ECMWF (el centro europeo de pronóstico del tiempo), da celdas de unos 0.25° (unos 28 km). El clima de cada planta es el valor de su celda, no una medición en el sitio. |
| Celda (de un modelo de clima) | Cuadrado del mapa para el que el modelo calcula un solo valor. Plantas dentro de la misma celda reciben el mismo clima. |
| Radiación modelada y medida | La modelada sale de un modelo de clima, como ERA5. La medida la registra un instrumento en el terreno, y es más confiable pero más difícil de conseguir. |
| `best_match` y `era5` | Dos productos de Open-Meteo para pedir el clima. `era5` es el reanálisis ERA5. `best_match` es la opción por defecto, que combina los modelos IFS HRES (el de pronóstico del ECMWF), ERA5 y ERA5-Land (una versión de ERA5 con celdas más finas sobre tierra), y fue la que mejor explicó la generación. |
| `tilt=nan` | Opción de Open-Meteo para pedir la radiación sobre un panel que sigue al sol (seguidor horizontal). No se comprobó que equivalga a un seguidor real de un eje, así que no se interpretó. |
| NOCT | Temperatura nominal de operación de una celda solar. Sirve para estimar la temperatura de la celda a partir de la del aire. |
| Pérdida por temperatura | Un panel produce menos cuando se calienta. Se usó un 0.4 % menos por cada grado de la celda sobre 25 °C, un valor genérico. |
| Índice físico de energía | Estimación de la energía de un día que combina la radiación con la pérdida por temperatura, sin ningún modelo de machine learning. Sirve de referencia física. |

### 5. Las fuentes y la base de Colombia

| Término | Qué es |
|---|---|
| XM | Operador del mercado eléctrico de Colombia. Publica la generación por hora de cada planta y su capacidad. |
| GEM (Global Energy Monitor) | Organización que mantiene un registro público de plantas de energía. De su Global Solar Power Tracker salen las plantas del dataset y las fichas con coordenadas. |
| GSA (Global Solar Atlas) | Mapa mundial del recurso solar y del potencial fotovoltaico. De ahí salen `ghi` y `pv_potential` en el dataset. |
| Open-Meteo | Servicio con datos de clima histórico para cualquier coordenada. De ahí sale el clima de cada planta. |
| FAO | Organización de las Naciones Unidas para la Alimentación y la Agricultura. Su marco de evaluación de tierras (1976) es la referencia para clasificar la pendiente del terreno. |
| IDEAM | Instituto de Hidrología, Meteorología y Estudios Ambientales de Colombia. Sus estaciones miden la radiación en el terreno. |
| Ficha pública | Página de una planta en el registro de GEM, con su ubicación y su capacidad. |
| AGPE | Autogeneradores a pequeña escala. Se dejan fuera de la base porque son muy pequeños. |
| Día planta | Una fila de la base de Colombia: una planta en un día. Hay 8,589. |
| Zona de cercanía | Grupo de plantas a menos de 100 km entre sí, que comparten el clima del mismo día. Son 6, y la validación deja fuera una zona entera cada vez. |
| Llanos | Las extensas llanuras del oriente de Colombia. Una de las 6 zonas de plantas está allí. |
| Nivel de la planta | FC medio de la planta y media de cada variable de clima, calculados con la primera mitad de sus días. Se les resta a los datos para medir solo el sube y baja diario. |
| Arranque (puesta en marcha) | Los primeros 60 días de una planta cuyo inicio de operación se observa. Se excluyen del análisis principal con un criterio que no mira ni la radiación ni el FC. |
| `RAMP_DAYS` y `MIN_DIAS` | Dos parámetros del cuaderno de Colombia: cuántos días de arranque se excluyen (60) y cuántos días útiles tiene que tener como mínimo una planta para entrar (100). |
| Ventana de tiempo | Periodo que cubre el análisis. En Colombia va del 1 de enero de 2024 al 28 de febrero de 2026. |
| Sensibilidad (análisis de sensibilidad) | Repetir un resultado cambiando una decisión, para ver si la conclusión se sostiene. Por ejemplo, incluir o no una planta con pocos días. |
| Variación dentro de la planta y entre plantas | El FC de una planta cambia de un día a otro (dentro) y además unas plantas producen más que otras (entre). En Colombia el 84 % de la variación es dentro de cada planta. |

### 6. Cómo se separan los datos y se evita la trampa

| Término | Qué es |
|---|---|
| Conjuntos de entrenamiento, validación y prueba | Los datos se reparten en partes. Con el entrenamiento el modelo aprende, con la validación se eligen los hiperparámetros y la prueba se guarda para medir el resultado final, sin haberla usado antes. |
| Partición (split) | La forma de repartir los datos entre entrenamiento y prueba. Puede ser al azar, por bloques geográficos o en el tiempo. |
| Validación cruzada | Repetir el entrenamiento y la prueba con varias particiones distintas, para que el resultado no dependa de una sola suerte. Cada partición es un pliegue (fold). |
| Pliegue (fold) | Una de las partes en que se divide el dataset en una validación cruzada. En cada vuelta, un pliegue hace de prueba y los demás de entrenamiento. |
| Fuga de información (data leakage) | Que el modelo use al entrenar algo que no tendría en la práctica, como datos de la prueba. Infla los resultados. |
| Bloque espacial | Cuadrado de 5° × 5° del mapa, de unos 550 km de norte a sur. Todas las plantas de un bloque van juntas a entrenamiento o a prueba. Hay 496 bloques. |
| Validación espacial por bloques | Partir los datos por bloques geográficos y no por filas al azar. Evita que plantas vecinas, que se parecen, queden una en entrenamiento y otra en prueba. |
| Autocorrelación espacial | Que lo que está cerca en el mapa se parezca. Con una partición al azar le da ventaja al modelo, porque puede predecir una planta mirando a su vecina. |
| `StratifiedGroupKFold`, `GroupKFold`, `LeaveOneGroupOut` | Funciones de scikit-learn que reparten los datos en pliegues respetando los grupos (aquí, los bloques o las zonas). La primera además estratifica y la última deja un grupo entero fuera en cada vuelta. |
| `GridSearchCV` | Función de scikit-learn que hace un grid search: prueba cada combinación de una grilla de hiperparámetros con validación cruzada. |
| Validación anidada (nested cross-validation) | Dos validaciones cruzadas, una dentro de la otra. La interna elige los hiperparámetros y la externa mide el desempeño con datos que no participaron en esa elección. |
| Bucle externo e interno | El externo tiene 5 pliegues por bloques y solo mide. El interno tiene 3 pliegues dentro del entrenamiento externo y elige los hiperparámetros. |
| Sesgo de selección | El optimismo que aparece cuando el resultado se reporta con los mismos datos con los que se eligió el mejor modelo. |
| Optimista | Resultado que parece mejor de lo que realmente será con datos nuevos. |
| Leave-one-out, leave-one-region-out, leave-one-group-out | Dejar fuera un caso, una región o un grupo completo, entrenar con el resto y probar en lo que quedó fuera. Aquí se deja fuera una macrorregión (base mundial) o una zona de plantas (Colombia). |
| Partición temporal | Entrenar con el pasado y probar con el futuro. En Colombia, la primera mitad de los días de cada planta es el pasado. |
| Predicción fuera de pliegue (out-of-fold) | Predicción de una planta hecha por un modelo que no la vio al entrenar. Con ellas cada planta aparece una sola vez. |
| Pipeline | Cadena de pasos de scikit-learn (imputar, escalar, balancear, modelo) que se ajustan juntos usando solo el entrenamiento de cada pliegue. Así nada de la prueba se cuela en el preprocesamiento. |
| `fit` y `StandardScaler` | `fit` es el paso en el que un modelo (o un preprocesamiento) aprende de los datos. `StandardScaler` es la función de scikit-learn que estandariza las variables, y se ajusta solo con el entrenamiento. |
| Preprocesamiento | Todo lo que se le hace a los datos antes del modelo: rellenar vacíos, escalar, convertir ángulos, etc. |
| Submuestra | Una parte de las filas elegida para ahorrar tiempo. El SVM, por ejemplo, se entrena con 8,000 o 5,000 filas porque con todas tardaría demasiado. |
| Comparación con la misma información | Darle a los modelos de referencia los mismos datos que usa el modelo propuesto, para saber si gana por el modelo o por la información extra. Aquí, Lasso con la generación de los días anteriores. |

### 7. Los modelos

| Término | Qué es |
|---|---|
| Modelo de referencia (baseline) | Modelo trivial que sirve de piso: en clasificación siempre predice la clase más frecuente y en regresión el promedio (o el nivel de la planta). Cualquier modelo útil tiene que superarlo. |
| Regresión lineal | Ajusta una recta (o un plano, con varias variables) a los datos: la predicción es una suma de las variables, cada una multiplicada por un coeficiente, más un valor fijo llamado intercepto. |
| Coeficiente e intercepto | Los números que aprende un modelo lineal. El coeficiente de una variable dice cuánto cambia la predicción cuando esa variable sube una unidad. El intercepto es la predicción cuando todas las variables valen cero. |
| Regularización (L1, L2) | Penalización que limita el tamaño de los coeficientes para que el modelo no se ajuste de más. L2 los encoge a todos y L1 puede llevar algunos a cero, o sea, descartar variables. |
| Ridge y Lasso | Regresión lineal con regularización L2 (Ridge) y L1 (Lasso). El hiperparámetro alpha es la fuerza de la penalización: mientras más grande, más penaliza. |
| KNN (k vecinos más cercanos) | Para predecir un caso, mira las k plantas más parecidas del entrenamiento (sus vecinas) y toma su clase o el promedio de su valor. No aprende parámetros: guarda los datos. |
| Distancia euclidiana y Manhattan | Formas de medir qué tan parecidas son dos plantas. La euclidiana es la distancia en línea recta entre sus valores. La Manhattan suma las diferencias variable por variable, como caminar por las calles de una cuadrícula. |
| Árbol de decisión | Serie de preguntas de sí o no sobre las variables (por ejemplo, "¿la longitud es mayor que 10?") que va dividiendo los datos hasta llegar a una predicción en una hoja. |
| Profundidad y hoja | La profundidad es cuántas preguntas seguidas hace un árbol. Una hoja es el final de una rama, donde el árbol da su predicción. |
| Random Forest (bosque aleatorio) | Muchos árboles entrenados con partes distintas de los datos y de las variables. La predicción es el voto o el promedio de todos, lo que corrige los errores de cada árbol suelto. |
| Boosting y XGBoost | En el boosting los árboles se entrenan uno tras otro, cada uno corrigiendo los errores del anterior. XGBoost es una implementación rápida de esa idea. |
| HistGradientBoosting | Versión de boosting de scikit-learn que agrupa los valores en histogramas para ir más rápido. |
| Tasa de aprendizaje (`learning_rate`) | En el boosting, qué tanto corrige cada árbol nuevo a los anteriores. Una tasa pequeña aprende más despacio pero con más cuidado. |
| Ensamble | Modelo formado por muchos modelos pequeños cuya predicción se combina, como el Random Forest y XGBoost. |
| SVM y SVR (máquina de vectores de soporte) | El SVM busca el límite que separa las clases con el mayor margen posible. El SVR es la versión para predecir un número: busca la curva que sigue los datos dentro de un margen de error. |
| Margen y vectores de soporte | El margen es el espacio libre entre el límite y los puntos más cercanos de cada clase. Esos puntos más cercanos son los vectores de soporte, y son los únicos que definen el límite. |
| Kernel RBF y SVM lineal | El kernel es una función que le deja al SVM trazar fronteras curvas en vez de rectas. RBF es el más usado. El SVM lineal solo traza rectas, y por eso es mucho más rápido. |
| `gamma` | En el kernel RBF, qué tan cerca tiene que estar un punto para influir en otro. Con un gamma grande cada punto influye solo en su entorno inmediato. |
| Margen `epsilon` | En el SVR, el tamaño del error que se perdona alrededor de la predicción. Si es muy grande para el rango del índice, el modelo ignora errores que sí importan. |
| Modelo flexible | Modelo capaz de dibujar formas complicadas (KNN, SVM con kernel, árboles). Se adapta mejor a los datos, pero con pocos casos tiende a sobreajustarse. |
| Suavizar | Hacer que un modelo sea menos sensible a los detalles de los datos, por ejemplo un KNN con muchos vecinos. Con pocos datos, un modelo más suave suele generalizar mejor. |
| Vecindario local | Las plantas cercanas a una dada. Los modelos locales, como KNN, predicen mirando solo ese vecindario. |
| Kernel Ridge | Versión de Ridge que trabaja con un kernel, como el RBF, para captar relaciones no lineales. Guarda una matriz con la similitud entre todos los pares de días de entrenamiento, así que se vuelve lento con muchos datos. |
| Ridge jerárquico (modelo propuesto) | Modelo con una respuesta al clima común a todas las plantas más un ajuste propio de cada planta. Se llama jerárquico porque hay dos niveles: el de todas las plantas y el de cada una. |
| Encogimiento (agrupamiento parcial) | Idea de los modelos jerárquicos: el ajuste propio de una planta se empuja hacia la respuesta común, con más fuerza cuanto menos datos tenga la planta. Así no se exagera con plantas cortas o ruidosas. |
| Nivel adaptativo | Parte del modelo propuesto que corrige el nivel de cada planta con la generación observada hasta el día anterior. Sirve para plantas que cambian con el tiempo por una ampliación, una falla o desgaste. |
| Suavizamiento exponencial (EWMA) y vida media | Promedio que da más peso a los días recientes y va olvidando los viejos. La vida media es cuántos días tarda un dato en pesar la mitad; con 7 días, lo de hace una semana pesa la mitad que lo de ayer. |
| Persistencia | Referencia que predice que hoy la planta producirá lo mismo que ayer. No usa el clima. |

### 8. Cómo se mide si un modelo es bueno

| Término | Qué es |
|---|---|
| Métrica | Número que resume qué tan bien lo hizo un modelo. |
| R² | Proporción de la variación que explica el modelo. 1 es perfecto, 0 equivale a predecir siempre el promedio y un valor negativo significa que predice peor que el promedio. |
| R² dentro de planta | R² calculado después de restarle a cada variable la media de su planta. Mide cuánto explica el clima el sube y baja diario, sin contar el nivel de cada planta. |
| Residuo | Valor real menos valor predicho. Un residuo grande es un error grande. |
| RMSE y MAE | Error típico de las predicciones, en las unidades de la variable. El RMSE (raíz del error cuadrático medio) castiga más los errores grandes; el MAE (error absoluto medio) es el promedio del error sin signo. |
| MAE relativo | MAE dividido entre el FC medio de la planta. Dice qué fracción de su nivel típico se equivoca el modelo. |
| Mediana entre plantas | En Colombia, el R² se calcula planta por planta y se reporta la mediana de esos 16 valores, para que una planta rara no mueva el resultado. |
| MAPE | Error absoluto porcentual medio: cuánto se equivoca el modelo en promedio, como porcentaje del valor real. Se calcula solo con días de FC de al menos 0.05, porque con valores cercanos a cero el porcentaje se dispara. |

### 9. Cómo se buscan los hiperparámetros

| Término | Qué es |
|---|---|
| Ajuste de hiperparámetros | Probar distintas configuraciones de hiperparámetros para quedarse con la que mejor resultado da. Se hace dentro del entrenamiento, para no usar la prueba. |
| Configuración o candidato | Un juego concreto de valores de hiperparámetros, por ejemplo 15 vecinos con distancia euclidiana. |
| Evaluación y presupuesto | Una evaluación es entrenar y medir un modelo con una configuración. El presupuesto es cuántas evaluaciones puede gastar cada búsqueda: aquí 30. |
| Grilla (grid) de hiperparámetros | Lista de valores candidatos para cada hiperparámetro. Combinar las listas da todas las configuraciones posibles. |
| Grid search | Prueba todas las combinaciones de una grilla. Es ordenado pero gasta evaluaciones repitiendo valores de los hiperparámetros que importan poco. En las tablas aparece como `grilla`. |
| Número de árboles, `n_estimators` | Cuántos árboles tiene un Random Forest o un XGBoost. Más árboles casi nunca empeoran, pero cuestan más tiempo. |

### 10. Pruebas estadísticas

| Término | Qué es |
|---|---|
| Prueba estadística | Procedimiento que responde si una diferencia observada es real o podría ser casualidad. Aquí se usan, por ejemplo, para saber si un modelo es de verdad mejor que otro. |
| Hipótesis nula y valor p | La hipótesis nula es la suposición de que no hay diferencia (por ejemplo, que dos modelos rinden igual). El valor p es la probabilidad de ver una diferencia tan grande como la observada si esa suposición fuera cierta. Un p pequeño (por convención, menor que 0.05) hace dudar de ella, y se dice que la diferencia es significativa. |
| Estadístico | El número que calcula una prueba para resumir la evidencia. A partir de él se obtiene el valor p. |
| Tamaño de la muestra | Cuántos casos se usan en el cálculo. Con muchos casos, hasta una diferencia minúscula sale significativa; con pocos (5 pliegues, 16 plantas), las pruebas casi no detectan nada. |
| Potencia de una prueba | Probabilidad de detectar una diferencia que sí existe. Con 5 pliegues, Nemenyi tiene poca. |
| Prueba pareada | Compara dos modelos medidos sobre los mismos casos (los mismos pliegues o las mismas plantas), restando caso a caso. |
| Prueba no paramétrica | Prueba que no supone que los datos sigan una distribución normal. Suele trabajar con rangos. |
| Exploratorio y confirmatorio | Un análisis confirmatorio pone a prueba una hipótesis definida de antemano. Uno exploratorio busca patrones y sus resultados se leen como pistas, no como pruebas definitivas. |
| Comparaciones múltiples y corrección de Holm | Cuando se hacen muchas comparaciones a la vez, alguna sale significativa por pura suerte. La corrección de Holm ajusta los valores p para compensarlo. |
| Wilcoxon (rangos con signo) | Compara dos modelos caso a caso sin suponer una distribución normal: mira cuántas veces gana uno y qué tan grande es la ventaja. |
| DeLong | Compara dos AUC calculados sobre los mismos datos. |
| Bootstrap | Truco para estimar qué tanto podría variar un resultado: se remuestrean los datos muchas veces, con reemplazo, y se recalcula cada vez. |
| Intervalo de confianza (IC95) | Rango donde se espera que caiga el valor verdadero con un 95 % de confianza. Si es ancho, el resultado es poco preciso. |
| Pérdida cuadrática | Error elevado al cuadrado. Hace que los errores grandes pesen mucho más que los pequeños. |
| Diebold-Mariano (DM, HLN) | Compara el error de dos modelos sobre una misma secuencia de casos ordenados. HLN es una corrección para muestras pequeñas. |
| ACF (autocorrelación) | Qué tanto se parece cada residuo al de su vecino en la lista. Cerca de 0 es lo esperable; valores altos indican que los errores vecinos van juntos. |
| Spearman y Pearson | Dos formas de medir la correlación. Pearson mide relaciones en línea recta con los valores. Spearman usa las posiciones de los valores y capta cualquier relación que suba o baje, aunque no sea recta. |
| Newey-West | Forma de calcular la varianza de un promedio cuando los datos de días seguidos se parecen entre sí (autocorrelación). Se usa dentro de la prueba de Diebold-Mariano. |
| Prueba de permutación | Se barajan los datos de entrenamiento para romper la relación entre el clima y la producción y se repite todo muchas veces. Si el modelo real es mucho mejor que todas las versiones barajadas, lo que aprendió no es casualidad. |

### 11. Costo computacional

| Término | Qué es |
|---|---|
| Costo computacional | Cuánto tiempo y cuánta memoria necesita un modelo para entrenarse y para predecir. |
| Tiempo de entrenamiento e inferencia | Entrenar es el tiempo que tarda el modelo en aprender. La inferencia es el que tarda en predecir casos nuevos ya entrenado. |
| Complejidad (O de n por p) | Cómo crece el tiempo de un algoritmo con el número de filas n y de variables p. O(n·p) crece en proporción; O(n²) crece al cuadrado; O(n·log n) crece un poco más que proporcional. T es el número de árboles y K el de clases. |
| Paralelismo | Hacer varias tareas al mismo tiempo en distintos núcleos del procesador. |
| Núcleo, proceso e hilo | El núcleo es una unidad de cálculo del procesador. Un proceso es un programa en ejecución y un hilo es una línea de ejecución dentro de él. `n_jobs` dice cuántos se usan a la vez. |
| CPU, GPU, CUDA y RAM | La CPU es el procesador general. La GPU es un procesador de gráficos, útil para cálculo en paralelo, y CUDA es la tecnología de NVIDIA para usarla. La RAM es la memoria de trabajo. |

### 12. Gráficas y tablas

| Término | Qué es |
|---|---|
| Histograma | Gráfico de barras que muestra cuántos valores caen en cada intervalo. Sirve para ver la forma de una distribución. |
| Diagrama de dispersión | Gráfico con un punto por caso, donde cada eje es una variable. Muestra si dos variables van juntas. |
| Matriz de correlación (mapa de calor) | Tabla de colores que muestra la correlación entre cada par de variables. |
| Diagrama de caja (boxplot) | Gráfica que muestra la mediana, el rango donde cae la mitad central de los datos y los valores atípicos, que aparecen como puntos sueltos. |
| Curva de aprendizaje | Gráfica del desempeño del modelo según cuántos datos de entrenamiento usa. Si casi no cambia al quitar datos, el modelo no está memorizando. |
