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

Si algún término te suena raro, está explicado desde cero en la sección [Terminología](#terminologia), al final de esta página.

El dataset original tiene licencia CC BY-NC-SA 4.0 (Mantilla-Guerra et al., 2026).

(terminologia)=
## Terminología

Esta sección explica todos los términos técnicos que aparecen en el libro, empezando desde cero. Los términos están agrupados por tema y cada grupo va de lo más básico a lo más específico. Si buscas uno en particular, el buscador de arriba también los encuentra. Los nombres de columnas y de funciones de código aparecen entre comillas invertidas, como `solar_aptitude`.

### 1. Lo básico de datos y de machine learning

| Término | Qué es |
|---|---|
| Machine learning (aprendizaje automático) | Forma de programar en la que, en vez de escribir las reglas a mano, se le muestran muchos ejemplos a un programa para que encuentre patrones y pueda hacer predicciones sobre casos nuevos. |
| Dataset (conjunto de datos) | Tabla con la información con la que se trabaja. Aquí cada fila es una planta solar y cada columna es algo que se sabe de ella: dónde está, qué pendiente tiene su terreno, etc. |
| Fila, observación o caso | Un elemento del dataset. En el dataset mundial es una planta solar; en la base de Colombia es una planta en un día. |
| Columna o variable | Una característica que se mide de cada caso, como la latitud, la temperatura o la clase de aptitud. |
| Variable predictora (característica, feature) | Variable que se le da al modelo para que haga su predicción. Por ejemplo, la pendiente, la longitud o la temperatura. |
| Variable objetivo (target) y etiqueta | La objetivo es lo que se quiere predecir: aquí, la clase de aptitud, el índice de aptitud o el factor de capacidad. La etiqueta es el valor real de la objetivo en un caso concreto, el que el modelo debería acertar. |
| Modelo | Programa que aprendió de ejemplos cómo se relacionan las variables predictoras con la objetivo, y que usa esa relación para predecir casos nuevos. KNN, Random Forest o XGBoost son tipos de modelos. |
| Entrenar (entrenamiento) | Dejar que el modelo aprenda de un conjunto de ejemplos, ajustando sus parámetros internos para equivocarse lo menos posible. |
| Datos de prueba | Casos que el modelo no vio mientras entrenaba. Sirven para medir con honestidad qué tan bien predice, igual que un examen con preguntas que no se vieron en clase. |
| Predecir (predicción) | Dar el valor que el modelo cree que tiene la variable objetivo en un caso. |
| Clasificación | Tipo de problema en el que se predice una categoría, como la clase de aptitud (Baja, Media o Alta). |
| Clase | Cada una de las categorías posibles en un problema de clasificación. Aquí son Baja, Media y Alta, y en Colombia día bajo, medio y alto. |
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
| Entrega y guía | Las entregas son los trabajos que se presentan en el curso: la 1 fue el EDA, la 2 los modelos base y la 3 es este proyecto completo. La guía es el documento del curso que dice qué hay que hacer en la Entrega 3. |
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

### 2. Los datos del paper y el terreno

| Término | Qué es |
|---|---|
| IAS (índice de aptitud solar) | Número de 0 a 1 que el dataset trae para cada planta. Se calcula con 0.40 × pendiente + 0.25 × orientación + 0.20 × sombreado + 0.15 × curvatura, o sea que solo usa el terreno. Con cortes en 0.4 y 0.6 se separa en tres clases: Baja (menor que 0.4), Media (de 0.4 a 0.6) y Alta (0.6 o más). |
| `solar_aptitude` y `solar_aptittude_class` | Nombres de las columnas del índice (el número) y de su clase (Baja, Media o Alta). El segundo nombre trae una errata, con dos t, que viene del dataset original. |
| Planta fotovoltaica (FV) | Instalación que convierte la luz del sol en electricidad con paneles. |
| Latitud y longitud | Las coordenadas de un lugar en el mapa. La latitud dice qué tan al norte o al sur está (0° en el ecuador) y la longitud qué tan al este o al oeste. |
| Grado (°) | Unidad para medir ángulos y coordenadas. Una vuelta completa tiene 360 grados. |
| Ecuador y hemisferio norte | El ecuador es la línea imaginaria a 0° de latitud, que divide la Tierra en norte y sur. El hemisferio norte es la mitad de arriba, donde está la mayoría de las plantas del dataset. |
| DEM (modelo digital de elevación) | Mapa de las alturas del terreno. De él se calculan la pendiente, la orientación y la curvatura. |
| Arco-segundo | Unidad para medir ángulos: un grado tiene 60 minutos de arco y cada minuto tiene 60 arco-segundos, así que un arco-segundo es 1/3600 de grado. Sobre el terreno equivale a unos 30 m, y los 9 arco-segundos del DEM que usa el paper son celdas de unos 280 m de lado. |
| Raster | Mapa guardado como una cuadrícula de celdas, cada una con un valor (una altura, una radiación, etc.). |
| Resolución | Qué tan pequeñas son las celdas de un mapa. Con una resolución gruesa, muchos lugares cercanos comparten el mismo valor. |
| Elevación (`elevation`) | Altura del terreno sobre el nivel del mar. |
| Pendiente (slope) | Inclinación del terreno, en grados. |
| Orientación (aspect) | Hacia qué lado mira una ladera, de 0° a 360°. El dataset usa -1 para el terreno plano, donde no hay orientación. |
| Sombreado (hillshade) | Cuánta sombra proyecta el relieve según la posición del sol. |
| Curvatura | Forma de la superficie: si el terreno es cóncavo (hundido), convexo (abultado) o plano. |
| Variable circular | Variable medida en ángulos, como la orientación o la dirección del viento. 1° y 359° están casi en el mismo punto de la brújula, así que se pasan a seno y coseno para que el modelo lo entienda. |
| Seno y coseno | Dos números que se calculan a partir de un ángulo. Juntos describen su posición en el círculo sin el salto entre 359° y 0°. Aquí se usan para la orientación y la dirección del viento (`aspect_sin`, `aspect_cos`, `wind_sin`, `wind_cos`). |
| `is_flat` | Indicador que vale 1 si el terreno es plano (orientación -1) y 0 si no. |
| Ponderación (AHP) | Forma de decidir cuánto pesa cada criterio cuando se combinan varios en un solo número. El AHP (proceso analítico jerárquico) es un método de ese tipo, y el que usan los autores del dataset para combinar las cuatro capas del terreno en el IAS. |
| `ghi`, `ambient_temperature`, `humidity`, `wind_speed`, `wind_direction` | Variables de clima del dataset: radiación global horizontal, temperatura del aire, humedad, velocidad del viento y su dirección. Son promedios por lugar, no mediciones diarias. |
| `pv_potential` y `optimal_tilt` | El potencial fotovoltaico de un lugar (cuánta energía podría producir un sistema solar allí) y la inclinación de los paneles que mejor aprovecharía el sol. |
| `dist_to_road` y `log_dist_to_road` | Distancia de la planta a la carretera más cercana y su logaritmo. El logaritmo se usa porque unas pocas distancias enormes distorsionan los promedios. |
| `area`, `capacity`, `size`, `operational_status` | Área de la planta, potencia instalada, un tamaño en categorías (Small, etc.) y su estado de operación. Se descartan como predictoras porque solo se conocen después de construir la planta o porque tienen errores. |
| Macrorregión | Grupo de continentes que se usa en los contrastes: Asia y Oceanía; América; y Europa, África y Medio Oriente. |
| Lote de procesamiento | Grupo de plantas cuyos datos se procesaron juntos y con su propia escala (en este dataset, por continente). Es la explicación más probable de que el índice cambie de nivel de una región a otra. |
| Desplazamiento por región | Que el índice tenga un nivel distinto en cada región aunque el terreno sea parecido. Es el hallazgo central del EDA. |
| `spatial_block` | Columna que dice a qué bloque de 5° × 5° del mapa pertenece cada planta. |

### 3. Calidad y limpieza de los datos

| Término | Qué es |
|---|---|
| EDA (análisis exploratorio de datos) | Revisar, describir y limpiar los datos antes de modelar, para entender qué hay y qué problemas tienen. |
| ETL | Extraer, transformar y cargar: el proceso de leer los datos originales y dejarlos listos para usar. |
| Valor nulo o faltante | Casilla de la tabla sin dato. |
| Imputar (imputación) | Rellenar un valor faltante con una estimación. La imputación por mediana usa la mediana de los datos de entrenamiento. |
| Duplicado | Fila repetida. Aquí se buscan filas que son iguales en todo salvo en el identificador o el nombre. |
| Dato centinela | Valor que en realidad significa "sin dato" o "no aplica", por ejemplo un 0 o un -1. Si no se detecta, el modelo lo lee como un valor real. |
| Valor extremo (outlier) | Dato muy lejos del resto. Puede ser real o un error. |
| Cobertura | Qué zona del mundo cubre un mapa o un dato. Fuera de su cobertura, el dato queda en cero o vacío. |
| Filtro | Regla que deja fuera ciertas filas, por ejemplo las plantas con menos de 100 días de datos. |
| Variable derivada | Variable calculada a partir de otras, como el seno de un ángulo. |
| Indicador binario | Variable que solo vale 0 o 1, como `is_flat`. |
| Variable categórica y numérica | Una categórica toma categorías (Baja, Media, Alta). Una numérica toma números (la pendiente, la temperatura). |
| Discretizar (discretización) | Convertir un número continuo en categorías usando cortes. Así el índice se vuelve la clase Baja, Media o Alta. |
| Ruido de etiqueta | Etiquetas que no son del todo coherentes, por ejemplo el mismo valor del índice en dos clases distintas. Ningún modelo puede acertarlas todas. |
| Unión espacial | Asignarle a cada punto el polígono más cercano de otro mapa. Así se calcula el área de cada planta, y por eso falla cuando el punto cae sobre un solo panel o un techo. |
| Polígono | Figura cerrada dibujada en un mapa, como el contorno de una planta solar. |
| Densidad de potencia | Potencia instalada por metro cuadrado de terreno. Una planta típica instala entre 40 y 100 W/m². |
| Escala logarítmica | Forma de repartir o graficar valores en la que cada paso multiplica en vez de sumar (0.001, 0.01, 0.1). Sirve cuando los valores van de muy pequeños a muy grandes. |
| Cola larga (o pesada) | Distribución con unos pocos valores muy grandes que se alejan mucho del resto. |
| Escalar y estandarizar | Poner las variables en una escala parecida. Estandarizar es restar el promedio y dividir entre la desviación estándar, para que ninguna variable pese más solo por tener números más grandes. KNN, SVM y los modelos regularizados la necesitan. |
| Centrar una variable | Restarle su promedio, para que sus valores queden alrededor de 0. Se hace, por ejemplo, con el FC de cada planta para medir solo su sube y baja diario. |
| Dimensionalidad | Cuántas variables tiene el dataset. Con más variables, los cálculos se vuelven más lentos y más difíciles de interpretar. |
| Colinealidad | Que dos variables digan casi lo mismo (por ejemplo, humedad y temperatura). Le estorba a un modelo lineal porque no sabe a cuál darle el mérito. |
| VIF (factor de inflación de varianza) | Número que mide cuánto se puede explicar una variable con las demás. Por encima de 5 suele considerarse que hay colinealidad relevante. |
| Separador, decimal y BOM UTF-8 | Detalles de cómo está escrito un CSV: el carácter que separa las columnas (`;`), el que marca los decimales (`,`) y una marca invisible al inicio del archivo que indica su codificación. Si no se leen con los parámetros correctos, la tabla sale como una sola columna. |
| D1 a D14 | Numeración de los 14 problemas de calidad de datos que se documentan en el EDA. |

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
| Índice de claridad | Cociente entre la radiación que llega al suelo y la que llegaría al borde de la atmósfera. Separa el efecto de las nubes del de la posición del sol; queda pendiente para una versión con datos horarios. |

### 5. Las fuentes y la base de Colombia

| Término | Qué es |
|---|---|
| XM | Operador del mercado eléctrico de Colombia. Publica la generación por hora de cada planta y su capacidad. |
| GEM (Global Energy Monitor) | Organización que mantiene un registro público de plantas de energía. De su Global Solar Power Tracker salen las plantas del dataset y las fichas con coordenadas. |
| GSA (Global Solar Atlas) | Mapa mundial del recurso solar y del potencial fotovoltaico. De ahí salen `ghi` y `pv_potential` en el dataset. |
| Open-Meteo | Servicio con datos de clima histórico para cualquier coordenada. De ahí sale el clima de cada planta. |
| FAO | Organización de las Naciones Unidas para la Alimentación y la Agricultura. Su marco de evaluación de tierras (1976) es la referencia para clasificar la pendiente del terreno. |
| OpenStreetMap (OSM) | Mapa colaborativo. De ahí vienen las carreteras y los polígonos de instalaciones solares del dataset. |
| Geofabrik | Empresa que distribuye extractos de los datos de OpenStreetMap por región. De ahí sale la red vial de Sudamérica que usa el paper. |
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
| Terciles | Dos cortes que dividen los datos en tres grupos del mismo tamaño. Con los terciles del FC de cada planta se definen los días bajo, medio y alto. |
| Día bajo, medio o alto | Clase de un día según su FC comparado con el de la misma planta: el tercio más bajo, el del medio o el más alto. |
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
| Interpolación espacial | Estimar el valor de un punto a partir de los puntos cercanos. Es justo la trampa que se evita con los bloques. |
| Estratificar | Mantener en cada pliegue la proporción de clases, para que la clase Baja (3 %) aparezca siempre en la prueba. |
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
| Experimento de 140 combinaciones | Cruce de modelos, formas de balancear las clases y formas de buscar hiperparámetros: 112 combinaciones de clasificación (7 modelos × 4 balanceos × 4 optimizadores) y 28 de regresión (7 × 4). Cuatro de clasificación no aplican, así que se corren 136. |

### 7. Los modelos

| Término | Qué es |
|---|---|
| Modelo de referencia (baseline) | Modelo trivial que sirve de piso: en clasificación siempre predice la clase más frecuente y en regresión el promedio (o el nivel de la planta). Cualquier modelo útil tiene que superarlo. |
| Regresión lineal | Ajusta una recta (o un plano, con varias variables) a los datos: la predicción es una suma de las variables, cada una multiplicada por un coeficiente, más un valor fijo llamado intercepto. |
| Coeficiente e intercepto | Los números que aprende un modelo lineal. El coeficiente de una variable dice cuánto cambia la predicción cuando esa variable sube una unidad. El intercepto es la predicción cuando todas las variables valen cero. |
| Regresión logística | Modelo lineal para clasificar: estima la probabilidad de cada clase pasando la suma ponderada de las variables por una curva en forma de S llamada función logística (o sigmoide). |
| Regularización (L1, L2) | Penalización que limita el tamaño de los coeficientes para que el modelo no se ajuste de más. L2 los encoge a todos y L1 puede llevar algunos a cero, o sea, descartar variables. |
| Ridge y Lasso | Regresión lineal con regularización L2 (Ridge) y L1 (Lasso). El hiperparámetro alpha es la fuerza de la penalización: mientras más grande, más penaliza. |
| `C` | En la regresión logística y en el SVM, controla la regularización al revés que alpha: un C grande penaliza poco y uno pequeño penaliza mucho. |
| KNN (k vecinos más cercanos) | Para predecir un caso, mira las k plantas más parecidas del entrenamiento (sus vecinas) y toma su clase o el promedio de su valor. No aprende parámetros: guarda los datos. |
| Distancia euclidiana y Manhattan | Formas de medir qué tan parecidas son dos plantas. La euclidiana es la distancia en línea recta entre sus valores. La Manhattan suma las diferencias variable por variable, como caminar por las calles de una cuadrícula. |
| Naive Bayes gaussiano | Modelo probabilístico simple. Supone que las variables son independientes entre sí dentro de cada clase y que siguen una distribución normal. |
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
| Pérdida bisagra (hinge) | Forma de medir el error que usa el SVM: no penaliza los puntos bien clasificados con margen y penaliza más los que quedan cerca o del lado equivocado. |
| Modelo flexible | Modelo capaz de dibujar formas complicadas (KNN, SVM con kernel, árboles). Se adapta mejor a los datos, pero con pocos casos tiende a sobreajustarse. |
| Suavizar | Hacer que un modelo sea menos sensible a los detalles de los datos, por ejemplo un KNN con muchos vecinos. Con pocos datos, un modelo más suave suele generalizar mejor. |
| Vecindario local | Las plantas cercanas a una dada. Los modelos locales, como KNN, predicen mirando solo ese vecindario. |
| No estacionariedad espacial | Que la relación entre variables cambie de un lugar a otro. Un modelo lineal global no la puede representar, porque ajusta un solo plano para todo el mundo. |
| Frontera de decisión | Línea (o superficie) que separa en el espacio de las variables las zonas donde el modelo dice una clase de las zonas donde dice otra. |

### 8. Clases desbalanceadas

| Término | Qué es |
|---|---|
| Clase desbalanceada | Clase con muchas menos observaciones que las demás. Aquí Baja tiene el 3 %, Media el 22 % y Alta el 75 %, así que un modelo que siempre dijera "Alta" acertaría el 75 % de las veces sin aprender nada. |
| Clase minoritaria y mayoritaria | La minoritaria es la que tiene menos casos (Baja) y la mayoritaria la que tiene más (Alta). |
| Balanceo | Técnicas para que el modelo no ignore la clase minoritaria. En este proyecto: no hacer nada, SMOTE, ADASYN o `class_weight`. |
| Sobremuestreo | Agregar ejemplos de la clase minoritaria. SMOTE y ADASYN lo hacen, y solo con el entrenamiento de cada pliegue. |
| Puntos sintéticos | Ejemplos nuevos que no existían en los datos y que el algoritmo inventa a partir de los reales. |
| SMOTE | Crea plantas sintéticas de la clase minoritaria interpolando entre vecinas reales: elige una planta Baja y otra Baja cercana, y crea un caso nuevo en algún punto entre las dos. |
| ADASYN | Como SMOTE, pero crea más puntos donde la clase minoritaria es más difícil de aprender. |
| `class_weight` | No crea datos: le da más peso a las clases poco frecuentes en la función de pérdida, así equivocarse en una planta Baja cuesta más que equivocarse en una Alta. En KNN no aplica, porque KNN no tiene una función de pérdida que se pueda ponderar. |
| `sample_weight` | Peso que se le da a cada fila al entrenar. Es la forma de lograr lo mismo que `class_weight` en los modelos que no tienen esa opción, como Naive Bayes y XGBoost. |
| `imblearn` | Librería que implementa SMOTE y ADASYN y que los deja actuar solo durante el entrenamiento. |

### 9. Cómo se mide si un modelo es bueno

| Término | Qué es |
|---|---|
| Métrica | Número que resume qué tan bien lo hizo un modelo. |
| Exactitud (accuracy) | Proporción de aciertos. Con una clase del 75 %, predecir siempre esa clase da 75 % de exactitud, por eso sola no basta. |
| Exactitud balanceada | Promedio del recall de cada clase. No depende de cuántas plantas hay en cada una. |
| Precisión y recall | Precisión: de los casos que el modelo dijo que eran de una clase, cuántos lo eran de verdad. Recall (exhaustividad): de los casos que eran de esa clase, cuántos encontró el modelo. |
| Verdadero y falso positivo | Un verdadero positivo es un caso de la clase que el modelo identificó bien. Un falso positivo es un caso de otra clase que el modelo dijo que era de ella. |
| F1 y F1 macro | El F1 combina precisión y recall en un solo número. El F1 macro promedia el F1 de las tres clases sin pesarlas por su tamaño, y por eso es la métrica principal cuando una clase es pequeña. |
| F1 de la clase Baja | El F1 calculado solo para la clase minoritaria, que es la más difícil. |
| Matriz de confusión | Tabla con los aciertos y los errores de cada clase: las filas son la clase real y las columnas la que dijo el modelo. Si se normaliza por fila, la diagonal es el recall de cada clase. |
| Curva ROC y AUC | La curva ROC grafica los verdaderos positivos contra los falsos positivos al mover el umbral de decisión. El AUC es el área bajo esa curva: la probabilidad de que el modelo le dé más puntaje a un ejemplo de la clase correcta que a uno de otra clase. 0.5 es azar y 1 es perfecto. |
| Uno contra el resto | Con tres clases, la métrica se calcula una vez por clase, enfrentándola a las otras dos juntas, y luego se promedian. |
| Kappa ponderado cuadrático | Acuerdo entre la predicción y la realidad que castiga más los errores entre clases lejanas (confundir Baja con Alta pesa más que confundir Baja con Media). 0 es azar y 1 es acuerdo perfecto. |
| R² | Proporción de la variación que explica el modelo. 1 es perfecto, 0 equivale a predecir siempre el promedio y un valor negativo significa que predice peor que el promedio. |
| R² dentro de planta | R² calculado después de restarle a cada variable la media de su planta. Mide cuánto explica el clima el sube y baja diario, sin contar el nivel de cada planta. |
| Residuo | Valor real menos valor predicho. Un residuo grande es un error grande. |
| RMSE y MAE | Error típico de las predicciones, en las unidades de la variable. El RMSE (raíz del error cuadrático medio) castiga más los errores grandes; el MAE (error absoluto medio) es el promedio del error sin signo. |
| MAE relativo | MAE dividido entre el FC medio de la planta. Dice qué fracción de su nivel típico se equivoca el modelo. |
| Media ± desviación (`0.797 ± 0.024`) | Forma de escribir un resultado en las tablas: el promedio de los 5 pliegues y, después del ±, cuánto varía entre pliegues (desviación estándar). En las columnas se anota como `_de`. |
| Brier y ECE | Miden qué tan buenas son las probabilidades. El Brier es el error cuadrático medio de las probabilidades. El ECE es la diferencia media entre la confianza del modelo y su exactitud real. En los dos, menos es mejor. |
| Calibración | Un modelo está calibrado si, de las plantas a las que les da 80 % de probabilidad, acierta más o menos el 80 %. Importa porque las probabilidades se usan para decidir. |
| Recalibración (Platt e isotónica) | Ajustar las probabilidades de un modelo ya entrenado para que estén mejor calibradas. Platt usa una curva en forma de S; la isotónica, una función que solo sube, por tramos. |
| Confianza | La probabilidad más alta que el modelo da a una planta, es decir, qué tan seguro está de su respuesta. |
| Mediana entre plantas | En Colombia, el R² se calcula planta por planta y se reporta la mediana de esos 16 valores, para que una planta rara no mueva el resultado. |

### 10. Cómo se buscan los mejores hiperparámetros

| Término | Qué es |
|---|---|
| Ajuste de hiperparámetros | Probar distintas configuraciones de hiperparámetros para quedarse con la que mejor resultado da. Se hace dentro del entrenamiento, para no usar la prueba. |
| Configuración o candidato | Un juego concreto de valores de hiperparámetros, por ejemplo 15 vecinos con distancia euclidiana. |
| Evaluación y presupuesto | Una evaluación es entrenar y medir un modelo con una configuración. El presupuesto es cuántas evaluaciones puede gastar cada búsqueda: aquí 30. |
| Optimizador | En este libro, el método que decide qué configuraciones probar: grid search, random search, optimización bayesiana o algoritmo genético. |
| Grilla (grid) de hiperparámetros | Lista de valores candidatos para cada hiperparámetro. Combinar las listas da todas las configuraciones posibles. |
| Grid search | Prueba todas las combinaciones de una grilla. Es ordenado pero gasta evaluaciones repitiendo valores de los hiperparámetros que importan poco. En las tablas aparece como `grilla`. |
| Random search | Prueba configuraciones al azar dentro de los rangos. Con el mismo presupuesto prueba más valores distintos de cada hiperparámetro que el grid search. En las tablas aparece como `aleatoria`. |
| Optimización bayesiana (Optuna, TPE) | Usa lo que ya probó para decidir qué probar después, apuntando a las zonas que parecen prometedoras. Optuna es la librería y TPE (Tree-structured Parzen Estimator) el método que usa por dentro: separa las configuraciones buenas de las malas y propone nuevas parecidas a las buenas. En las tablas aparece como `bayesiana`. |
| Adquisición y mejora esperada | La adquisición es la regla que decide cuál configuración probar a continuación. La mejora esperada elige la que más probablemente supere al mejor resultado hasta ese momento. |
| Modelo sustituto y muestreador | El modelo sustituto es un modelo barato que estima qué tan buena sería cada configuración sin entrenarla de verdad; la optimización bayesiana lo usa para decidir. El muestreador es la parte de Optuna que propone las configuraciones a probar. |
| Algoritmo genético (DEAP) | Imita la selección natural. Mantiene una población de configuraciones y, generación tras generación, se queda con las mejores, las cruza y las muta. DEAP es la librería. Aquí la población es de 6. En las tablas aparece como `genetica`. |
| Población, generación e individuo | En el algoritmo genético, la población es el grupo de configuraciones que existen a la vez, cada configuración es un individuo y una generación es cada ronda de selección, cruce y mutación. |
| Torneo, cruce y mutación | Pasos del algoritmo genético. El torneo elige padres comparando configuraciones. El cruce (aquí BLX-α) mezcla dos configuraciones y crea una nueva entre ellas. La mutación altera un poco una configuración con ruido normal (mutación gaussiana). |
| Elitismo | Dejar pasar intacta a la siguiente generación a la mejor configuración, para no perderla. |
| Diversidad y convergencia prematura | La diversidad es qué tan distintos son entre sí los individuos de la población. Si cae a cero muy pronto, la población converge prematuramente: todos se parecen y el algoritmo deja de explorar. |
| Successive halving (multifidelidad) | Prueba muchas configuraciones con pocos datos y deja pasar solo a las mejores a rondas con más datos, hasta evaluar a las finalistas con todos. Aquí se prueban 90 candidatos con 1/9 de los datos, 30 con 1/3 y 10 con todos. |
| Fidelidad y factor η | La fidelidad es qué tan parecida a la evaluación completa es una evaluación barata: aquí, la fracción de filas usada. El factor η = 3 significa que en cada ronda pasa 1 de cada 3 candidatos. |
| Cubo unitario | Truco para que todos los optimizadores busquen en el mismo espacio: cada hiperparámetro se reescala a un número entre 0 y 1, y después se traduce otra vez a su valor real. |
| Caché | Memoria donde se guarda un resultado ya calculado para no repetirlo. Si un optimizador propone una configuración que ya se evaluó, se toma de ahí y no gasta presupuesto. |
| Orden lexicográfico | Orden como el del diccionario. El grid search recorre un hiperparámetro y, para cada valor, todas las opciones del siguiente. |
| Curvas anytime (de desempeño en cualquier momento) | Mejor valor que ha encontrado una búsqueda hasta cada evaluación. Muestran qué tan rápido llega cada optimizador a un buen resultado, sin esperar a que termine. |
| Regret | Cuánto falta para el mejor valor. Aquí 0 es el mejor valor que encontró cualquiera de los cuatro optimizadores y 1 es la mediana de todas las evaluaciones. Menos es mejor. |
| Área bajo la curva de regret | Promedio del regret a lo largo de las 30 evaluaciones. Resume toda la curva: menos significa que llegó pronto y se quedó cerca del mejor valor. |
| Evaluaciones hasta el 95 % | Cuántas evaluaciones tarda una búsqueda en cerrar el 95 % de la distancia entre la mediana y el mejor valor. |
| Estabilidad ante la semilla | Repetir un experimento con otras semillas para ver cuánto cambia el resultado. Si cambia poco, no dependió de la suerte. |
| Early stopping | Detener el entrenamiento cuando el modelo deja de mejorar con datos de validación. Ahorra tiempo y evita sobreajustar. |
| Tolerancia | Cuánto tiene que cambiar el resultado entre un paso y otro para que un algoritmo siga iterando. Una tolerancia más grande lo detiene antes. |
| Número de árboles, `n_estimators` | Cuántos árboles tiene un Random Forest o un XGBoost. Más árboles casi nunca empeoran, pero cuestan más tiempo. |
| Tabla maestra | Tabla donde se reúnen los resultados de cada combinación y de cada pliegue externo. De ahí salen todas las tablas y gráficas de los experimentos. |
| Corrida | Una ejecución del experimento. La corrida completa es cada combinación de modelo, balanceo y optimizador en los 5 pliegues externos. |
| Piloto | Prueba pequeña que se hace antes de lanzar el experimento completo, por ejemplo para estimar cuánto va a tardar. |

### 11. Pruebas estadísticas

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
| Prueba ómnibus | Pregunta si hay alguna diferencia entre todos los grupos a la vez, sin decir cuáles. Friedman es una. |
| Friedman | Prueba ómnibus para comparar varios modelos medidos en los mismos pliegues, usando sus posiciones (rangos). Su estadístico se llama chi cuadrado (χ²): mientras más grande, más diferencias entre los modelos. |
| Nemenyi y diagrama de diferencia crítica | Nemenyi compara los modelos de a pares después de Friedman, con sus rangos medios. La diferencia crítica (CD) es cuánto tienen que separarse dos rangos medios para que se consideren distintos. En el diagrama, los que quedan unidos por una barra no se distinguen. |
| Wilcoxon (rangos con signo) | Compara dos modelos caso a caso sin suponer una distribución normal: mira cuántas veces gana uno y qué tan grande es la ventaja. |
| DeLong | Compara dos AUC calculados sobre los mismos datos. |
| Tamaño del efecto | Qué tan grande es una diferencia en la práctica, aparte de si es significativa. Con muchos datos una diferencia diminuta puede ser significativa y no importar. |
| Delta de Cliff | Qué tan seguido un modelo queda por encima de otro, de -1 a 1. 0 es empate. No depende de la escala de la métrica. |
| d de Cohen | Diferencia entre dos promedios medida en desviaciones estándar. Por convención, 0.2 es pequeña, 0.5 mediana y 0.8 grande. Con 5 pares es muy inestable. |
| Bootstrap | Truco para estimar qué tanto podría variar un resultado: se remuestrean los datos muchas veces, con reemplazo, y se recalcula cada vez. |
| Bootstrap BCa y bootstrap estacionario | BCa es una versión que corrige el sesgo y la asimetría del intervalo. El estacionario remuestrea tramos seguidos de datos ordenados y no casos sueltos. Aquí se remuestrean bloques enteros del mapa y no plantas sueltas. |
| Intervalo de confianza (IC95) | Rango donde se espera que caiga el valor verdadero con un 95 % de confianza. Si es ancho, el resultado es poco preciso. |
| Conjunto de confianza de modelos (MCS) | Empieza con todos los modelos y va eliminando los que son peores con significancia, hasta que los que quedan no se distinguen entre sí. |
| Pérdida cuadrática | Error elevado al cuadrado. Hace que los errores grandes pesen mucho más que los pequeños. |
| Diebold-Mariano (DM, HLN) | Compara el error de dos modelos sobre una misma secuencia de casos ordenados. HLN es una corrección para muestras pequeñas. |
| Modelo anidado | Modelo que es un caso particular de otro. Ridge sin latitud ni longitud está anidado en Ridge con las 15 variables. |
| Clark-West | Variante de Diebold-Mariano para modelos anidados, donde la prueba original queda sesgada contra el modelo grande. |
| Giacomini-White (GW) | Pregunta si la diferencia de error entre dos modelos se puede predecir con otra cosa; aquí, con la diferencia en la planta vecina. Capta si un modelo gana solo en ciertas zonas. |
| Pruebas de series de tiempo | Pruebas pensadas para datos ordenados en el tiempo, donde cada valor depende del anterior. Aquí se usan con datos del mapa, ordenados con una curva de Hilbert. |
| Curva de Hilbert | Forma de recorrer el mapa con una sola línea para que los puntos cercanos queden cerca en la lista. Permite usar pruebas de series de tiempo con datos espaciales. |
| ACF (autocorrelación) | Qué tanto se parece cada residuo al de su vecino en la lista. Cerca de 0 es lo esperable; valores altos indican que los errores vecinos van juntos. |
| Ljung-Box y BDS | Pruebas que revisan si hay dependencia entre los residuos ordenados: Ljung-Box busca relaciones lineales y BDS cualquier tipo de dependencia. |
| I de Moran | Mide la autocorrelación espacial, de -1 a 1. Cerca de 0 no hay patrón; un valor positivo indica que los vecinos del mapa se parecen. |
| Heterocedasticidad | Que la variación de los errores no sea constante: el modelo se equivoca más en unas zonas que en otras. Breusch-Pagan y White son pruebas que la detectan. |
| Normalidad, asimetría y curtosis | Jarque-Bera prueba si los residuos siguen una distribución normal. La asimetría dice hacia qué lado se alarga la distribución; la curtosis, qué tan pesadas son las colas. |
| Spearman y Pearson | Dos formas de medir la correlación. Pearson mide relaciones en línea recta con los valores. Spearman usa las posiciones de los valores y capta cualquier relación que suba o baje, aunque no sea recta. |
| Kruskal-Wallis | Prueba que compara varios grupos usando rangos, sin suponer normalidad. |

### 12. Costo computacional

| Término | Qué es |
|---|---|
| Costo computacional | Cuánto tiempo y cuánta memoria necesita un modelo para entrenarse y para predecir. |
| Tiempo de entrenamiento e inferencia | Entrenar es el tiempo que tarda el modelo en aprender. La inferencia es el que tarda en predecir casos nuevos ya entrenado. |
| Complejidad (O de n por p) | Cómo crece el tiempo de un algoritmo con el número de filas n y de variables p. O(n·p) crece en proporción; O(n²) crece al cuadrado; O(n·log n) crece un poco más que proporcional. T es el número de árboles y K el de clases. |
| Exponente empírico | El b que sale de ajustar t ≈ a·n^b a los tiempos medidos en una gráfica con ambos ejes en escala logarítmica (log-log). b = 1 es crecimiento proporcional y b = 2, cuadrático. Se compara con el teórico. |
| Escalamiento | Cómo cambia el tiempo de un modelo cuando aumentan las filas o las variables. |
| Fuerza bruta, KD-Tree y Ball-Tree | Formas de buscar vecinos en KNN. La fuerza bruta compara con todos los puntos; KD-Tree y Ball-Tree ordenan los datos en árboles para saltarse comparaciones. Con 15 variables, la fuerza bruta les gana. |
| FAISS, Flat y HNSW | FAISS es una librería para buscar vecinos muy rápido. Flat es exacto. HNSW es aproximado, con un grafo de varias capas por el que se navega hacia los vecinos, y es mucho más rápido a cambio de perder un poco de exactitud. |
| Gradiente estocástico, SAGA y SGD | Algoritmos que entrenan un modelo con pasos pequeños, usando una fila o un lote a la vez. SGD es el método básico y SAGA una variante con reducción de varianza. |
| Descenso por coordenadas y Cholesky | Dos formas estándar de resolver modelos lineales. El descenso por coordenadas ajusta una variable a la vez (se usa en Lasso). Cholesky resuelve el modelo de una vez con álgebra de matrices (se usa en Ridge). |
| `SVC`, `LinearSVC` y SMO | `SVC` es el SVM con kernel y `LinearSVC` el SVM lineal. SMO es el algoritmo con el que se entrena el primero; su tiempo crece entre n² y n³. |
| `partial_fit` | Entrenar por bloques sin tener todos los datos en memoria. |
| Nyström | Aproximación del kernel RBF que permite usar un SVM lineal conservando parte de la no linealidad. |
| XGBoost `hist` y `exact` | Dos formas de buscar cortes en los árboles. `exact` revisa todos los valores; `hist` los agrupa en histogramas y es mucho más rápido. |
| Paralelismo | Hacer varias tareas al mismo tiempo en distintos núcleos del procesador. |
| Núcleo, proceso e hilo | El núcleo es una unidad de cálculo del procesador. Un proceso es un programa en ejecución y un hilo es una línea de ejecución dentro de él. `n_jobs` dice cuántos se usan a la vez. |
| joblib, loky y threading | joblib es la librería que reparte tareas en paralelo. loky las reparte en procesos y threading en hilos, que en Python están limitados por el GIL salvo en código que lo libera. |
| GIL | Candado de Python que impide que dos hilos ejecuten código Python al mismo tiempo. |
| Aceleración y ley de Amdahl | La aceleración es cuántas veces más rápido va un programa al usar más núcleos. La ley de Amdahl dice que hay un límite: la parte que no se puede paralelizar (la fracción serial) lo frena. |
| Horas-núcleo | Tiempo de cómputo sumado de todos los núcleos usados. 16 núcleos durante una hora son 16 horas-núcleo. |
| CPU, GPU, CUDA y RAM | La CPU es el procesador general. La GPU es un procesador de gráficos, útil para cálculo en paralelo, y CUDA es la tecnología de NVIDIA para usarla. La RAM es la memoria de trabajo. |
| Perfilado (profiling) | Medir en qué funciones se va el tiempo (`cProfile`) y cuánta memoria se usa (`memory_profiler`). |
| Cuello de botella | La parte que limita la velocidad de todo lo demás. Aquí es el procesador y no la memoria. |
| MB y GB | Megabyte y gigabyte: unidades para medir memoria o tamaño de archivos (1 GB son unos 1,000 MB). |
| Pico de memoria | La mayor cantidad de memoria que usa un programa mientras corre. |

### 13. Interpretabilidad

| Término | Qué es |
|---|---|
| Interpretabilidad | Entender por qué un modelo da la predicción que da, y en qué variables se apoya. |
| Importancia de variables | Cuánto pesa cada variable en las predicciones de un modelo. |
| Explicación global y local | Una explicación global dice en qué se apoya el modelo en general. Una local explica la predicción para una planta concreta. |
| SHAP y valores de Shapley | SHAP reparte cada predicción entre las variables usando valores de Shapley, una idea de teoría de juegos: cuánto empuja cada variable la predicción hacia arriba o hacia abajo respecto al promedio. |
| TreeSHAP | Versión de SHAP exacta y rápida para modelos de árboles. |
| Importancia media de SHAP | Promedio del valor absoluto de SHAP de una variable sobre muchas plantas. Dice qué variables pesan más, sin importar si empujan hacia arriba o hacia abajo. |
| LIME | Explica una predicción ajustando un modelo lineal sencillo alrededor de esa planta, con datos ligeramente perturbados. |
| Atribución | El peso que un método de explicación le asigna a cada variable en una predicción. SHAP y LIME dan atribuciones distintas, y se comparan. |
| Diagrama de enjambre (beeswarm) | Gráfico con un punto por planta: la posición horizontal es cuánto empuja la variable la predicción y el color, si su valor es alto o bajo. |
| Gráfico de cascada | Parte del valor medio que predice el modelo y suma la contribución de cada variable hasta llegar a la predicción de una planta. |

### 14. Gráficas y tablas

| Término | Qué es |
|---|---|
| Histograma | Gráfico de barras que muestra cuántos valores caen en cada intervalo. Sirve para ver la forma de una distribución. |
| Diagrama de dispersión | Gráfico con un punto por caso, donde cada eje es una variable. Muestra si dos variables van juntas. |
| Matriz de correlación (mapa de calor) | Tabla de colores que muestra la correlación entre cada par de variables. |
| Gráfico Q-Q | Gráfico que compara los residuos con los de una distribución normal. Si los puntos siguen la diagonal, son casi normales. |
| Gráfico de densidad (hexbin) | Dibuja hexágonos cuyo color indica cuántos puntos caen en cada uno. Sirve cuando hay tantos puntos que se amontonan. |
| Curva de calibración | Gráfico de la confianza del modelo contra su exactitud real. Si el modelo está bien calibrado, la curva queda sobre la diagonal. |
| Diagrama de barras apiladas | Barras divididas en tramos de colores, donde cada tramo es una parte del total. |
| Mapa de clases | Mapa con un punto por planta, coloreado por su clase de aptitud. |
