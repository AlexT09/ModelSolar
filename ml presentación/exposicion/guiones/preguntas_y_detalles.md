# Detalles y preguntas difíciles, diapositiva por diapositiva

Va en el mismo orden de la presentación (`exposicion/main.tex`). Para cada diapositiva: los detalles que conviene saber y las preguntas que pueden hacer, con su respuesta. Las cifras salen de los cuadernos ejecutados el 2 de octubre de 2026. Al final hay una tabla con los números clave.

---

# Apertura

## Portada
- Integrantes: Jesús David Arévalo Montilla, Enmanuel David Díaz Molinares y Alex David Terán Meza.
- Universidad del Norte, pregrado en Ciencia de Datos, Machine Learning. Profesor: Dr. Lihki Rubio.

## El problema

Detalles:
- **El dataset:** Mantilla-Guerra, A., Mejia-Escobar, C., Azorin-Lopez, J. y Garcia-Rodriguez, J. (2026). *Global dataset of solar power plants: multidimensional integration and analysis*. Revista *Eng*, 7(7), 343. DOI 10.3390/eng7070343. También hay un preprint en arXiv (2603.20601), del 21 de marzo de 2026.
- **Tamaño:** 58,978 plantas fotovoltaicas del mundo y 29 columnas.
- **La idea inicial:** predecir la aptitud de un lugar a partir de su clima.

Preguntas posibles:
- *¿Por qué eligieron este dataset?* Es reciente, es global, es público y trae una etiqueta de aptitud ya calculada. Al auditarlo encontramos que esa etiqueta tiene problemas, y eso se volvió parte del aporte.
- *¿Qué aporta el trabajo?* Tres cosas:
  1. Una auditoría del índice que muestra, con números, que mide región y lote de procesamiento.
  2. Una base nueva y verificable de generación real en Colombia.
  3. Una evaluación sin fuga de información que separa lo que el clima explica de lo que no.

## Nuestra solución planteada

Detalles:
- **Línea 1, auditar el índice:** EDA corregido y modelos base con validación espacial y ajuste anidado.
- **Línea 2, generación real:** base propia con XM y Open-Meteo para 16 plantas colombianas.
- **Reproducibilidad:** cuatro cuadernos de Jupyter, con `Pipeline`, semilla 42 y referencias verificadas con Crossref, DataCite o la página de la revista.

Preguntas posibles:
- *¿Por qué dos líneas y no solo la del curso?* La primera responde lo que pide el curso sobre el dataset. La segunda retoma la pregunta original, el clima, con datos donde el clima sí tiene sentido físico.

## Diapositiva de impacto
- Mensaje: el índice mide la región, no el clima. Con datos reales, el clima explica la mitad de la producción diaria.

---

# Parte 1. Datos y EDA

## La pregunta

Detalles:
- **Variable objetivo:** índice de aptitud solar (IAS), de 0 a 1.
- **Clases:** Baja si es menor a 0.4, Media de 0.4 a 0.6 y Alta si es 0.6 o más.
- **Dos tareas:** clasificación de la clase y regresión del índice.

## De dónde salen los datos

Detalles:

| Fuente | Qué aporta | Detalle |
|---|---|---|
| Global Energy Monitor, Global Solar Power Tracker | Nombre, ubicación, capacidad y estado | Release de febrero de 2026 |
| Global Solar Atlas (Banco Mundial, datos de Solargis) | Irradiación, potencial FV, inclinación óptima | Período 2018-2024 |
| ERA5 (Copernicus) y NASA POWER | Temperatura, humedad, viento | Promedios mensuales pasados a anuales; el paper no dice qué años |
| Modelos de elevación (DEM) | Pendiente, orientación, curvatura | Procesados por continente |
| OpenStreetMap (Geofabrik) | Distancia a carretera, área | Extraído el 14 de marzo de 2026 |

- **Repositorio de los autores:** github.com/cimejia/solarPV. El CSV es idéntico al nuestro, y hay una versión anterior en Excel con 48,369 filas.
- **Archivo:** `Dataset_Mundial_Final(2).csv`, separado por `;` con decimal `,`. Licencia CC BY-NC-SA 4.0.

Preguntas posibles:
- *¿Por qué confían en ese dataset?* No confiamos a ciegas: lo auditamos y documentamos cada problema con su decisión. La auditoría es parte del aporte.

## Qué mide realmente el índice

Detalles:
- **Ecuación 1 del paper:** `0.40·pendiente + 0.25·orientación + 0.20·sombreado + 0.15·curvatura`, con pesos tipo AHP. El clima no entra.
- **Desbalance:** Alta 74.9 %, Media 22.0 %, Baja 3.2 %.

Preguntas posibles:
- *Entonces, ¿por qué el paper lo llama aptitud solar?* Es una aptitud del terreno para instalar, no del recurso solar. Para decidir dónde invertir hacen falta las dos cosas.

## Pipeline del EDA

Detalles:
- El recorrido: 58,978 plantas, luego limpieza, 57,976 plantas, variables nuevas, 15 predictoras y bloques de 5° × 5°.
- La salida es `dataset_eda_corregido.csv`, con 57,976 × 22.

## Problemas de calidad de datos y decisiones

Detalles:

| Problema | Cifra | Decisión |
|---|---|---|
| Sin datos de terreno, todas clase Baja | 64 | Eliminar |
| Sin datos de clima | 3 | Eliminar |
| Duplicados de atributos | 1,598 | Eliminar |
| Orientación -1 en terreno plano | 1,105 | Seno y coseno igual a 0, más el indicador `is_flat` |
| Distancia a carretera imposible (hasta 2,296 km) | 65 | Pasar a vacío y usar logaritmo |
| Área vacía o incoherente | 27.7 % | Excluir |
| Variables que son agrupaciones de otras | 5 | Excluir |

- **Las 15 predictoras:** latitud, longitud, elevación, pendiente, curvatura, seno y coseno de la orientación, `is_flat`, seno y coseno de la dirección del viento, logaritmo de la distancia a carretera, temperatura, humedad, velocidad del viento y `ghi`.

Preguntas posibles:
- *¿Por qué seno y coseno?* Porque los ángulos son circulares: 359° y 1° son vecinos, pero como número parecen lejanos (Fisher, 1993).
- *¿Por qué no usaron el área de la planta?* Tiene el 28 % vacío y densidades imposibles (mediana de 540 W/m², cuando lo físico está entre 40 y 200). Además se conoce solo después de construir.
- *¿Por qué quitaron `pv_potential` y `optimal_tilt`?* Son casi redundantes con `ghi` y con la latitud. Quedaron como variantes opcionales.
- *¿Por qué Spearman y no Pearson?* Las variables tienen colas pesadas y relaciones no lineales. Spearman usa rangos y es robusto a eso (Hollander et al., 2015).

## El índice depende de la región

Detalles:
- En el mapa, Asia es casi toda Alta y la clase Baja aparece casi solo en Europa.
- El 94.5 % de la clase Baja viene de un lote europeo añadido en la segunda versión del dataset.

Preguntas posibles:
- *¿Cómo saben que viene de un lote?* Comparamos el CSV con la versión anterior del repositorio. En las 30,555 ubicaciones comunes el índice es idéntico. De las 1,892 plantas Baja, 1,788 están en filas añadidas después, sobre todo de Grecia, Alemania, España, Italia, Francia y Turquía.

## Hallazgo central del EDA

Detalles:
- Spearman del índice con la pendiente: -0.07. Con la longitud: +0.58.
- Modelo con solo terreno: R² 0.18. Con latitud y longitud: 0.91.
- Entrenando sin una macrorregión: R² negativo (-7.3 en Asia y Oceanía, -2.3 en América, -0.1 en Europa, África y Medio Oriente).
- Bloques de 5° × 5°: 496 en total. La clase Baja queda entre 2.9 % y 3.8 % en cada pliegue.

Preguntas posibles:
- *Si la fórmula usa la pendiente, ¿por qué casi no se relaciona?* Esa es la inconsistencia. Nuestra hipótesis es que los DEM se procesaron y normalizaron por continente, lo que mete un desplazamiento regional. Dentro de cada país sí aparece una relación con la pendiente, de -0.2 a -0.3.
- *Un R² negativo, ¿cómo es posible?* El modelo predice peor que el simple promedio de la región de prueba. Pasa cuando el nivel del índice en la región nueva es distinto al de las regiones de entrenamiento.

## Base nueva: generación real en Colombia

Detalles:
- El pipeline: XM, factor de capacidad, coordenadas, Open-Meteo, resúmenes diarios, filtros y la base final.

## Cómo se construyó la base de Colombia

Detalles:
- **XM** (operador del mercado eléctrico), API pública en `servapibi.xm.com.co`, sin clave:
  - `Gene`: generación horaria por planta, en kWh.
  - `CapEfecNeta`: capacidad efectiva neta diaria, en kW.
  - `ListadoRecursos`: la lista de plantas.
  - Ventana: del 1 de enero de 2024 al 28 de febrero de 2026, que termina el mes del release de GEM que usa el paper.
- **Factor de capacidad:** energía del día dividida entre la capacidad por 24 horas.
- **Coordenadas:** 9 plantas del dataset, emparejadas por nombre y capacidad. 7 de las fichas públicas de GEM, contrastadas con prensa o con el desarrollador: Bosques Solares de los Llanos 4 y 5, BSB 503 y 504, La Unión, Portón del Sol y Sunnorte.
  - Ejemplo: el parque Fundación de Enel está en Pivijay (Magdalena), según Enel y pv magazine, y coincide con la fila de GEM.
  - Descartadas: Palmira II, porque su ubicación no se confirmó, y Shangri-La, porque sus coordenadas de GEM caen 230 km al este de Ibagué y contradicen su ficha.
- **Open-Meteo:** `era5` en celdas de 0.25°, unos 25 km. `best_match` combina IFS HRES, ERA5 y ERA5-Land y cayó en celdas de unos 3 km.
- **Filtros:** fuera los primeros 60 días de las plantas con arranque observado. Solo plantas con al menos 100 días útiles.
- **Resultado:** 8,589 días planta, 16 plantas y 6 zonas de cercanía. Los días faltantes en XM van de 0 a 24 por planta.

Preguntas posibles:
- *¿Por qué solo 16 plantas si XM tiene más de 2,000 recursos solares?* La mayoría son autogeneradores pequeños. Con al menos 1 MW hay 27, y solo usamos las que se pudieron ubicar con fuente y que tienen al menos 100 días.
- *¿El clima es medido?* No: es un modelo, no una estación en la planta. Comparar con estaciones del IDEAM está pendiente.
- *¿Por qué quitar los primeros 60 días?* Son de puesta en marcha, cuando la planta todavía no opera de forma normal. El criterio no mira la producción, así que no sesga el resultado.

## EDA de la base de Colombia

Detalles:
- El 84 % de la variación del factor de capacidad es de un día a otro dentro de cada planta. El 16 % es diferencia entre plantas.
- Radiación, nubosidad, temperatura y humedad están muy correlacionadas.
- La tecnología de cada planta está pendiente: ninguna de las 16 tiene confirmado el montaje.

Preguntas posibles:
- *¿Por qué la temperatura sale con correlación positiva si el calor baja el rendimiento?* Porque los días soleados también son más calurosos. Viene de la radiación, no es una causa.

## La radiación explica el día a día

Detalles:
- Cada kWh/m² de radiación diaria suma 4.7 puntos de factor de capacidad. La proporción física simple, factor de capacidad medio entre radiación media, da 4.6.
- La radiación de `best_match` explica más que la de `era5` en 13 de 16 plantas (R² 0.49 frente a 0.41).

Preguntas posibles:
- *¿Por qué la nubosidad no aporta si las nubes bajan la producción?* Sí afecta, pero ya está dentro de la radiación del modelo. Separar su efecto exige datos por hora y un índice de claridad.

---

# Parte 2. Modelos y evaluación

## Diseño experimental: la partición va primero

Detalles:
- **Base mundial:** `StratifiedGroupKFold` con 5 pliegues, y el grupo es el bloque de 5°.
- **Colombia:** se deja fuera una zona completa. Se entrena con la primera mitad de los días de cada planta y se prueba con la segunda.
- **Pipeline:** la imputación, el escalado y la calibración van dentro de un `Pipeline` (Kaufman et al., 2012).
- **Validación anidada** (Varma y Simon, 2006; Cawley y Talbot, 2010):
  - Base mundial: 5 pliegues externos y 3 internos, todos por bloques.
  - Colombia: 6 zonas externas, y en el interno se deja fuera una zona de entrenamiento a la vez.

Preguntas posibles:
- *¿Por qué no partieron al azar?* Las plantas vecinas se parecen y el modelo acertaría por vecindad (Roberts et al., 2017). Con partición aleatoria todos los resultados salieron más altos.
- *¿Por qué bloques de 5°?* Hay 496 bloques y la clase Baja queda entre 2.9 % y 3.8 % en cada pliegue. Bloques más pequeños dejarían muchos con una sola planta.
- *¿Cómo evitaron la fuga de información?* Partiendo primero y ajustando todo lo que aprende de los datos solo con el entrenamiento. En Colombia, el nivel de cada planta y los cortes de las clases salen solo de su pasado.
- *¿Usaron el futuro para calcular el nivel de cada planta?* No: sale de la primera mitad de sus días.

## Pipeline de evaluación

Detalles:
- Los pasos: partición, luego imputación y escalado solo con el entrenamiento, luego el modelo, luego predicción y métricas en la prueba.

## Modelos y métricas

Detalles de los modelos:
- **Clasificación:** regresión logística (normal y balanceada), Naive Bayes, KNN, SVM lineal (calibrado) y SVM RBF.
- **Regresión:** Ridge, Lasso, KNN, SVR lineal y SVR RBF.
- **Referencias:** la clase mayoritaria, la media o el nivel de la planta.
- **Búsqueda en grilla**, con escala logarítmica para C y alpha (Bergstra y Bengio, 2012).

Las métricas, explicadas:
- **Precisión:** cuando el modelo dice "Baja", ¿cuántas veces acierta?
- **Recall:** de todas las Baja reales, ¿cuántas encontró?
- **F1:** combina las dos, $2 \cdot P \cdot R / (P + R)$. Solo es alto si las dos lo son. Un modelo que dice "Baja" a todo tiene recall 1 pero precisión 0.03, y su F1 es 0.06.
- **F1 macro, la principal:** el promedio del F1 de las tres clases con el mismo peso. La clase Baja (3 %) pesa igual que la Alta (75 %) (He y Garcia, 2009).
- **Exactitud:** aciertos totales. Engaña con desbalance: decir siempre Alta da 75 %.
- **Exactitud balanceada:** el promedio del recall de cada clase. El azar da 0.33.
- **AUC:** la probabilidad de darle más puntaje a un ejemplo de la clase correcta que a uno de otra. No depende del umbral. 0.5 es azar y 1 es perfecto (Fawcett, 2006).
- **Kappa ponderado cuadrático:** acuerdo descontando el azar, que castiga más los errores entre clases lejanas (Cohen, 1968).
- **R²:** proporción de la variación explicada. Si es negativo, el modelo es peor que el promedio.
- **R² dentro de planta:** el R² después de restar el nivel de cada planta. Mide el sube y baja diario.
- **MAE:** error promedio en unidades. **RMSE:** error que castiga más los errores grandes. **MAE relativo:** el MAE en porcentaje del valor medio.

Preguntas posibles:
- *¿Por qué F1 macro y no exactitud?* Con 75 % de clase Alta, predecir siempre Alta da 75 % de exactitud y no sirve. El F1 macro de esa referencia es 0.29.
- *¿Por qué calibrar el SVM lineal?* Porque no da probabilidades, y el AUC las necesita. La calibración se ajusta solo con el entrenamiento (Niculescu-Mizil y Caruana, 2005).
- *¿Por qué el SVM se entrenó con 8,000 filas?* El SVM con kernel crece entre cuadrático y cúbico con las filas (Chang y Lin, 2011). Es una limitación declarada.

## Resultados: comparativa de todos los modelos ajustados

Detalles:
- Arriba, la base mundial: ganan el SVM y el SVR con kernel, seguidos de KNN.
- Abajo, Colombia: ganan los lineales.
- La línea roja es la referencia.

## Base mundial: clasificación (ajustada, bloques 5°)

Detalles:
- **SVM RBF:** F1 macro 0.818, AUC 0.960, kappa 0.775, F1 de la clase Baja 0.744.
- **KNN:** F1 0.797. **Logística balanceada:** F1 0.629, pero la mejor exactitud balanceada (0.798).
- **Naive Bayes:** 0.472. **Referencia:** 0.285.
- **Regresión:** SVR RBF R² 0.806, KNN 0.796, Ridge y Lasso 0.479.

Preguntas posibles:
- *¿Ese 0.82 es con latitud y longitud?* Sí. Sin ellas, con los mismos bloques y los hiperparámetros por defecto, el SVM RBF baja a 0.62, KNN de 0.79 a 0.66 y la logística de 0.60 a 0.38. En regresión, KNN baja de R² 0.79 a 0.48. La siguiente diapositiva lo muestra.
- *¿El ajuste de hiperparámetros sirvió?* Poco en los lineales y algo en los no lineales. El SVR RBF subió de 0.73 a 0.81 porque el margen epsilon por defecto, 0.1, era grande para un índice de 0 a 0.94.
- *¿Por qué Lasso no mejora a Ridge?* Con 15 variables y 58 mil filas la regularización casi no cambia nada. Lasso eligió alphas de 0.00001 a 0.001.

## Base mundial: ROC y matriz de confusión

Detalles:
- **Curvas ROC:** una por clase, del mejor modelo.
- **Matriz de confusión:** filas = clase real, en porcentaje. Muestra dónde se confunde el modelo.

## ¿Qué aprendieron los modelos?

Detalles:
- Sin latitud y longitud, todos caen: KNN de R² 0.79 a 0.48.
- Con partición aleatoria los resultados salen más altos que con bloques.
- Con un continente fuera, todos dan R² negativo, incluida la referencia.

Por qué el 0.82 llega tan alto: con latitud y longitud el modelo aprende un mapa de etiquetas por región. Los bloques de 5° no lo impiden del todo, porque los bloques vecinos de la misma región quedan en entrenamiento y el modelo interpola. Sin vecinos de la misma región, falla.

Por qué no lo tomamos como capacidad de medir aptitud:
- No es fuga de información: la latitud y la longitud se conocen antes de construir.
- Es un atajo: el modelo usa la ubicación en lugar de las propiedades del lugar.
- La etiqueta está contaminada por el lote: el 94.5 % de la Baja es europea.
- No se transfiere a continentes nuevos.

Frase para decirlo: "El 0.82 muestra que el índice se puede predecir, pero casi todo sale de la ubicación. Sin latitud y longitud baja a 0.62, y en un continente que no vio falla por completo."

Preguntas posibles:
- *Entonces, ¿los bloques de 5° no sirven?* Sirven para lo que deben: medir el desempeño en zonas no vistas dentro de las regiones conocidas. Para medir la transferencia entre regiones está la prueba de dejar fuera un continente.
- *¿Por qué no quitaron la latitud y la longitud desde el principio?* Las reportamos con y sin ellas a propósito. Ese contraste es lo que muestra que el índice codifica la región.

## Colombia: resultados (ajustados, zona fuera y futuro)

Detalles:
- **Regresión:** Lasso R² 0.469 dentro de planta, lineal 0.466, Ridge 0.461, KNN 0.414, SVR 0.407. La referencia da -0.039. El error baja del 20 % al 14 % del factor de capacidad medio.
- **Clasificación del día:** la logística tiene F1 0.572, AUC 0.765 y kappa 0.575, y acierta 57 de cada 100 días. El azar daría 33. El SVM RBF empata en F1.

Preguntas posibles:
- *¿Por qué aquí ganan los lineales?* La energía es casi proporcional a la radiación, así que una recta ya tiene la forma correcta. Con 6 zonas, los modelos flexibles sobreajustan.
- *¿Por qué restan el nivel de cada planta?* Cada planta produce distinto por su tecnología, que no tenemos. Restar el nivel mide solo lo que el clima puede explicar: el día a día, que es el 84 % de la variación.
- *¿Por qué solo explica la mitad?* El resto viene de lo que no medimos: la tecnología, los seguidores, la relación DC/AC, el mantenimiento, los recortes y la variación de las nubes dentro del día.

## Colombia: contrastes

Detalles:
- Con partición aleatoria, el SVR sube de 0.36 a 0.48. El resultado se infla.
- Con solo la radiación, el SVR sube de 0.36 a 0.49: las demás variables agregan ruido.
- El ajuste eligió siempre la opción más suave: KNN con 101 vecinos, SVR con C de 0.1 y Ridge con alpha de 100. KNN y SVR quedaron en el borde de su grilla.

Preguntas posibles:
- *¿Qué significa que eligiera lo más suave?* Con pocas zonas, lo que generaliza es un modelo simple. Una grilla más amplia podría mejorar un poco a KNN y SVR.

## Interpretación: ¿por qué unos modelos quedan bajos?

Detalles:
- **Base mundial:** un modelo lineal ajusta un solo plano para todo el mundo. El índice cambia de nivel por región, y a eso se le llama no estacionariedad espacial (Brunsdon et al., 1996). KNN y el SVM con kernel ajustan vecindarios locales. Naive Bayes supone que las variables son independientes y normales, y aquí no lo son.
- **Colombia:** la física es casi lineal y hay pocas zonas. El techo de 0.5 viene de los datos.

## ¿Cómo se podría mejorar?

Detalles:
- **Base mundial:**
  - Bosques aleatorios (Breiman, 2001) y XGBoost (Chen y Guestrin, 2016).
  - Bosque aleatorio espacial (Hengl et al., 2018) o regresión geográficamente ponderada.
  - Stacking (Wolpert, 1992).
  - Delimitar el área de aplicabilidad (Meyer y Pebesma, 2021).
- **Colombia:**
  - Un modelo híbrido con pvlib (Holmgren et al., 2018; Antonanzas et al., 2016).
  - Radiación satelital o medida.
  - Efectos mixtos por planta (Bates et al., 2015; Hajjem et al., 2014).
  - Datos horarios y la tecnología de cada planta.

Preguntas posibles:
- *¿Con XGBoost subiría el 0.82?* Probablemente quedaría parecido dentro de las regiones conocidas, pero seguiría fallando en continentes nuevos. Subir el puntaje no hace que el índice mida aptitud.

## Los resultados en tres números
- **0.96:** AUC del mejor clasificador del índice.
- **Menor que 0:** el R² de todos los modelos en un continente no visto.
- **0.47:** el R² del clima sobre la producción real en Colombia.

## Conclusiones
1. El índice mide terreno, región y lote. No se predice desde el clima y no se transfiere entre continentes.
2. Los modelos lo predicen bien dentro de las regiones conocidas, pero por la ubicación.
3. La validación espacial es necesaria.
4. Con datos reales, el clima explica cerca de la mitad de la variación diaria, y casi todo lo aporta la radiación.
5. El ajuste de hiperparámetros ayuda poco: el límite está en los datos.

## Limitaciones y siguientes pasos

Detalles:
- Pendientes:
  - La tecnología de las plantas.
  - Comparar el clima con el IDEAM.
  - Grillas más grandes.
- SVM con kernel entrenado con 8,000 filas.

Preguntas posibles:
- *¿Por qué no hicieron las 140 combinaciones del enunciado?* Esta entrega es el problema, el EDA y los modelos base. Las 140 combinaciones (árboles, XGBoost, SMOTE, ADASYN, optimizadores bayesiano y genético) son la entrega siguiente.

## Referencias
- 47 referencias. Cada una se verificó contra Crossref, DataCite o la página de la revista. La lista completa está en la presentación y en `proceso/Resumen_final.md`.

---

## Números para tener a mano

| Dato | Valor |
|---|---|
| Plantas en el dataset | 58,978 (57,976 tras la limpieza) |
| Clases | Alta 74.9 %, Media 22.0 %, Baja 3.2 % |
| Bloques espaciales | 496 de 5° × 5° |
| Mejor clasificador (SVM RBF, con lat/lon) | F1 macro 0.82, AUC 0.96, kappa 0.78 |
| Mismo modelo sin lat/lon | F1 macro 0.62 |
| Mejor regresor (SVR RBF) | R² 0.81 |
| Continente fuera | R² negativo en todos |
| Base de Colombia | 16 plantas, 6 zonas, 8,589 días planta |
| Clima sobre la producción diaria | R² 0.47 (Lasso), error del 14 % del factor de capacidad medio |
| Clasificación del día en Colombia | F1 0.57, AUC 0.77 (azar: 0.33 y 0.5) |
| Efecto de la radiación | 4.7 puntos de factor de capacidad por kWh/m² |
