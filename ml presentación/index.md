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
