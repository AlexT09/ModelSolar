# Guion de la Parte 1: problema, datos y EDA

Lo presenta Enmanuel. Va desde la portada hasta la diapositiva "La radiación explica el día a día". Tiempo sugerido: 8 a 10 minutos.

## Portada

Buenas. Somos Jesús Arévalo, Alex Terán y Enmanuel Díaz, de Ciencia de Datos de la Universidad del Norte. Esta es nuestra entrega del proyecto de Machine Learning con el profesor Lihki Rubio. Trabajamos la aptitud de los lugares para plantas solares fotovoltaicas.

## El problema

Colombia y el mundo están instalando plantas solares muy rápido, y decidir dónde construir una planta define cuánta energía va a producir durante décadas. Encontramos un dataset publicado este año en la revista *Eng*, de Mantilla-Guerra y otros autores. Trae 58,978 plantas solares del mundo con un índice de aptitud solar. Nuestra idea era predecir ese índice a partir del clima, para tener una herramienta que sirviera en cualquier lugar.

Pero al revisarlo a fondo encontramos que ese índice se calcula solo con el terreno. Además depende mucho de la región y de cómo se procesaron los datos, así que no se puede predecir desde el clima ni sirve de un continente a otro.

## Nuestra solución planteada

Por eso dividimos el trabajo en dos líneas.
- **Línea uno: auditar el índice.** Hicimos un EDA corregido y corrimos los modelos base del curso con validación espacial, para medir si el índice se transfiere entre regiones.
- **Línea dos: volver a la idea original del clima con datos reales.** Construimos una base propia con la generación real, hora por hora, de 16 plantas solares en Colombia, y medimos cuánto explica el clima esa producción.

Todo está en cuatro cuadernos de Jupyter reproducibles.

## Diapositiva de impacto

El mensaje central en una frase: el índice mide la región y no el clima. Pero con datos reales, el clima sí explica la mitad de la producción diaria.

## Agenda

La primera parte, que presento yo, cubre los datos y el EDA. La segunda parte, que presenta mi compañero, cubre los modelos y la evaluación.

## La pregunta

El objetivo formal tiene dos tareas sobre el mismo índice:
- **Clasificación:** predecir si un lugar tiene aptitud Baja, Media o Alta.
- **Regresión:** predecir el valor del índice, que va de 0 a 1.

## De dónde salen los datos

El dataset integra cinco fuentes:
- Global Energy Monitor, para la ubicación y la capacidad de cada planta.
- Global Solar Atlas, para la irradiación y el potencial fotovoltaico.
- ERA5 y NASA POWER, para el clima.
- Los modelos de elevación, para el terreno.
- OpenStreetMap, para las carreteras.

Para la segunda línea usamos otras dos fuentes públicas. XM, el operador del mercado eléctrico de Colombia, da la generación real. Open-Meteo da el clima hora por hora.

## Qué mide realmente el índice

Este es el primer hallazgo. El paper define el índice con esta fórmula: 40 % pendiente, 25 % orientación, 20 % sombreado y 15 % curvatura. No hay radiación, ni temperatura, ni viento. El clima no entra.

Eso significa que, por construcción, el clima no puede predecir este índice, y eso cambió el rumbo del proyecto.

Además las clases están muy desbalanceadas: 75 % Alta, 22 % Media y solo 3 % Baja.

## Pipeline del EDA

Este es el recorrido de los datos:
1. Arrancamos con 58,978 plantas y 29 columnas.
2. Limpiamos filas rotas y duplicados, y quedamos con 57,976.
3. Creamos variables nuevas, elegimos 15 predictoras y asignamos cada planta a un bloque del mapa de 5 por 5 grados. Esos bloques se usan después para validar los modelos.

## Problemas de calidad de datos y decisiones

Encontramos varios problemas, y para cada uno tomamos una decisión:
- **Plantas sin datos de terreno:** 64, todas en la clase Baja. Las eliminamos.
- **Duplicados:** 1,598 plantas iguales en todo salvo el identificador. Las eliminamos.
- **Distancias a carretera imposibles,** de hasta 2,296 kilómetros. Las pasamos a vacío y usamos el logaritmo.
- **El área de la planta:** el 28 % estaba vacía y el resto traía densidades físicamente imposibles, así que la excluimos.
- **Los ángulos,** como la orientación del terreno o la dirección del viento, los pasamos a seno y coseno. Si no, el modelo cree que 359 grados y 1 grado están lejos, cuando en realidad son vecinos.

## El índice depende de la región

En este mapa cada punto es una planta, coloreada por su clase. Asia es casi toda Alta. La clase Baja, en rojo, aparece casi solo en Europa: el 94.5 % de la clase Baja viene de un lote de plantas europeas que se añadió en una segunda versión del dataset. La clase minoritaria refleja más el lote en que se procesaron los datos que el terreno.

## Hallazgo central del EDA

Lo medimos de varias formas:
- **Correlación con la pendiente:** casi cero (-0.07), aunque la fórmula dice que la pendiente es lo que más pesa.
- **Correlación con la longitud,** es decir, con el este u oeste del mundo: 0.58.
- **Modelo con solo terreno:** explica un R² de 0.18. Con latitud y longitud sube a 0.91.
- **Continente fuera:** si entrenamos sin un continente y lo predecimos, el R² sale negativo, peor que predecir el promedio.

Conclusión: el índice mide sobre todo la región y el lote de procesamiento. Por eso, para evaluar los modelos, hay que validar por zonas del mapa y no al azar.

## Base nueva: generación real en Colombia

Para volver a la idea del clima armamos una base propia, y este diagrama muestra el proceso. Bajamos de XM la generación real hora por hora. La cruzamos con las coordenadas de cada planta y con el clima de Open-Meteo, y la resumimos por día.

## Cómo se construyó la base de Colombia

- **Lo que predecimos** es el factor de capacidad: la energía que la planta produjo en el día, dividida entre lo máximo que podría haber producido a plena potencia.
- **Las coordenadas:** XM no las publica. Para 9 plantas salieron del dataset y para 7 de las fichas de Global Energy Monitor, cada una verificada con prensa o con la empresa. Descartamos las que no pudimos confirmar.
- **El clima** lo bajamos de dos productos distintos para comparar.
- **Los filtros** no miran el resultado: quitamos los primeros 60 días de cada planta, que son de puesta en marcha.

Quedaron 8,589 días planta, de 16 plantas, sin datos faltantes.

## EDA de la base de Colombia

El 84 % de la variación del factor de capacidad es de un día a otro dentro de cada planta. El otro 16 % es diferencia entre plantas, que depende de su tecnología, por ejemplo si tienen seguidor solar. Eso no lo tenemos todavía, y lo dejamos como pendiente. También vimos que radiación, nubosidad, temperatura y humedad están muy correlacionadas entre sí.

## La radiación explica el día a día

En cada planta, el factor de capacidad sube con la radiación del día. Cada kWh por metro cuadrado de radiación suma unos 4.7 puntos de factor de capacidad, casi exactamente lo que predice la física. Además, la radiación de uno de los productos de clima explicó mejor que la del otro en 13 de las 16 plantas, así que la calidad del dato de clima importa.

Con esto le paso a mi compañero, que va a presentar los modelos.
