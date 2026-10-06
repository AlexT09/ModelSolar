# Aptitud solar fotovoltaica: del índice del dataset a la generación real

Proyecto de Machine Learning del pregrado en Ciencia de Datos de la Universidad del Norte, con el profesor Dr. Lihki Rubio.
Lo hicimos Jesús David Arévalo Montilla, Enmanuel David Díaz Molinares y Alex David Terán Meza.

## De qué trata

El punto de partida es un dataset mundial de 58,978 plantas solares con un índice de "aptitud solar" en tres clases: Baja, Media y Alta.
En el EDA encontramos dos cosas que cambian cómo se lee cualquier modelo sobre él:

- El índice sale solo del terreno: pendiente, orientación, sombreado y curvatura. No mide cuánto sol recibe un sitio.
- Casi toda la clase Baja (94.5 %) viene de un lote de plantas europeas que se añadió en la segunda versión del dataset. Un modelo que
  aprende "Europa" acierta la clase Baja sin aprender nada del terreno.

Por eso todos los modelos se validan con bloques espaciales de 5° × 5°: un bloque cae entero en entrenamiento o en prueba, nunca partido.

## Cómo está organizado el libro

1. **Datos y EDA.** Limpieza, variables y los hallazgos de arriba, con números.
2. **Modelos base.** Los modelos del curso con hiperparámetros por defecto y con ajuste por validación anidada, con y sin latitud y longitud.
3. **Experimento de 140 combinaciones.** Lo que pide la guía:
   - 7 modelos de clasificación × 4 balanceos × 4 optimizadores, más 7 de regresión × 4 optimizadores.
   - La comparación de optimizadores (grilla, aleatoria, bayesiana y genética, más halving sucesivo).
   - La optimización computacional y la estadística formal.
   - La interpretabilidad con SHAP y LIME.
4. **Línea de Colombia.** Una pregunta con más uso práctico: predecir el factor de capacidad diario real de 16 plantas colombianas a partir del
   clima, con datos de generación de XM y clima de Open-Meteo.
5. **Resumen final.** Todo el recorrido en un documento, con la tabla comparativa, la interpretación y un glosario.

## Reproducir

Para correr los cuadernos se usa el entorno de conda definido en `environment.yml` (`conda env create -f environment.yml`). Todos los cuadernos tienen guardadas sus salidas y gráficas. La semilla usada en los experimentos es 42.

El dataset original tiene licencia CC BY-NC-SA 4.0 (Mantilla-Guerra et al., 2026).

