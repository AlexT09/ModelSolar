# Guion de la Parte 2: modelos y evaluación

Lo presenta el compañero. Va desde la portada "Parte 2. Modelos y evaluación" hasta "Gracias". Tiempo sugerido: 10 a 12 minutos. Al final hay un repaso de conceptos y de preguntas probables.

## Diseño experimental: la partición va primero

Antes de entrenar cualquier modelo hay que decidir cómo se separan los datos de entrenamiento y de prueba, y esa decisión es la más importante del proyecto.

- **Base mundial.** No partimos al azar. Si lo hiciéramos, una planta podría quedar en entrenamiento y su vecina a un kilómetro en prueba. Como se parecen tanto, el modelo acertaría solo por eso, como si se copiara en el examen. Por eso dividimos el mapa en bloques de 5 por 5 grados: un bloque entero va a entrenamiento o entero a prueba.
- **Colombia.** Dejamos fuera una zona completa de plantas cercanas. Además entrenamos con el pasado de cada planta y probamos con su futuro.
- **Fuga de información.** Todo lo que se aprende de los datos, como el valor para rellenar vacíos o la escala de las variables, se calcula solo con el entrenamiento, dentro de un `Pipeline` de scikit-learn. Así ninguna información del examen se filtra al modelo.

**Validación anidada.** Para elegir los hiperparámetros, como el número de vecinos de KNN, usamos dos bucles. El interno prueba combinaciones y elige la mejor usando solo el entrenamiento. El externo, que nunca participó en la elección, mide el resultado final. Si eligiéramos mirando la prueba, el resultado saldría inflado.

## Pipeline de evaluación

El diagrama resume lo anterior. Primero se parte. Después, solo con el entrenamiento, se rellenan los vacíos y se escalan las variables. Luego se entrena el modelo, se predice la prueba y se miden las métricas.

## Modelos y métricas

Usamos los modelos base del curso:
- **Clasificación:** regresión logística (normal y con pesos balanceados), Naive Bayes, KNN, SVM lineal y SVM con kernel RBF.
- **Regresión:** Ridge, Lasso, KNN, SVR lineal y SVR con kernel RBF.

Siempre comparamos contra una referencia: el modelo más tonto posible, que predice la clase más común o el promedio. Cualquier modelo útil tiene que superarla.

Métricas de clasificación:
- **F1 macro** es la principal. Como la clase Baja es solo el 3 %, un modelo que diga siempre "Alta" tendría 75 % de exactitud y no serviría para nada. El F1 macro promedia el desempeño de las tres clases por igual.
- **AUC** mide si el modelo ordena bien las probabilidades, sin depender de un umbral. 0.5 es azar y 1 es perfecto.
- **Kappa ponderado** castiga más confundir Baja con Alta que confundir Media con Alta, porque las clases tienen orden.

En regresión usamos R², la proporción de la variación que el modelo explica, y los errores RMSE y MAE.

## Resultados: comparativa de todos los modelos ajustados

Esta gráfica tiene las cuatro tareas, cada una con su mejor modelo resaltado y la línea roja de la referencia:
- Arriba, la base mundial. Ganan el SVM y el SVR con kernel, seguidos de KNN, y los lineales quedan bastante abajo.
- Abajo, Colombia. Pasa lo contrario: ganan los lineales.

## Base mundial: clasificación

El mejor es el SVM RBF, con F1 macro de 0.82, AUC de 0.96 y kappa de 0.78, seguido de KNN con 0.80. La logística balanceada tiene la mejor exactitud balanceada, 0.80, porque da más peso a la clase Baja, pero su F1 es 0.63. Naive Bayes y el SVM lineal quedan abajo. En regresión, el SVR RBF explica un R² de 0.81 y Ridge y Lasso solo 0.48.

## Base mundial: ROC y matriz de confusión

A la izquierda están las curvas ROC del mejor modelo, una por clase, todas muy cerca de la esquina superior. A la derecha, la matriz de confusión: cada fila es la clase real y muestra qué porcentaje se predijo como cada clase.

## ¿Qué aprendieron los modelos?

Esta es la diapositiva clave. Los números anteriores se ven muy bien, pero:
- Si quitamos latitud y longitud, KNN baja de 0.79 a 0.48 en R². El modelo aprendía dónde está la planta.
- Con partición al azar los resultados salen más altos que con bloques, que es justo la trampa de la vecindad.
- Si entrenamos sin un continente y lo predecimos, todos los modelos dan R² negativo, incluso la referencia.

Conclusión: los modelos aprenden la región, no la aptitud, y eso confirma lo que encontró el EDA.

## Colombia: resultados

Aquí predecimos la producción real:
- **Regresión.** El mejor es Lasso, con R² de 0.47 dentro de cada planta, casi igual a la regresión lineal. El error baja del 20 % al 14 % del factor de capacidad medio.
- **Clasificación del día** en bajo, medio o alto para esa planta. La regresión logística acierta 57 de cada 100 días, con AUC de 0.77. El azar daría 33.

Ganan los lineales porque la energía es casi proporcional a la radiación, y una recta ya tiene la forma correcta.

## Colombia: contrastes

- La partición al azar vuelve a inflar: el SVR pasa de 0.36 a 0.48.
- Si usamos solo la radiación, el SVR sube de 0.36 a 0.49. Las otras variables de clima meten más ruido que información.
- El ajuste de hiperparámetros eligió siempre la opción más suave: KNN con 101 vecinos y SVR con C igual a 0.1. Con solo 6 zonas, lo que generaliza es suavizar mucho.

## Interpretación: ¿por qué unos modelos quedan bajos?

- **Base mundial.** Un modelo lineal ajusta un solo plano para todo el planeta, y el índice tiene un nivel distinto en cada región. Eso se llama no estacionariedad espacial. KNN y el SVM con kernel ajustan vecindarios locales y por eso funcionan mejor. Lasso no ayuda porque el problema no es que sobren variables, sino la forma de la relación. Naive Bayes supone que las variables son independientes, y aquí no lo son.
- **Colombia.** La física es casi lineal y hay pocas zonas, así que los modelos flexibles sobreajustan. El techo de 0.5 viene de los datos: el clima es modelado y no medido en la planta, usamos promedios diarios, y no conocemos la tecnología de cada planta.

## ¿Cómo se podría mejorar?

- **Base mundial:**
  - Bosques aleatorios y XGBoost, que captan interacciones.
  - Modelos espaciales, como un bosque aleatorio espacial o una regresión geográficamente ponderada, que estima coeficientes distintos en cada lugar.
  - Stacking, que combina varios modelos.

  Pero subir el puntaje no hace que el índice mida aptitud. Por eso proponemos delimitar el área de aplicabilidad, es decir, dónde es confiable predecir.
- **Colombia:**
  - Un modelo híbrido: calcular la física con la librería pvlib y usar machine learning solo para corregir el error.
  - Radiación satelital o medida.
  - Modelos de efectos mixtos con un nivel propio por planta.
  - Datos por hora y completar la tecnología de cada planta.

## Los resultados en tres números

- **0.96:** el AUC del mejor clasificador del índice.
- **Menor que cero:** el R² de todos los modelos al predecir un continente que no vieron.
- **0.47:** el R² del clima sobre la producción real en Colombia.

Predecir bien el índice dentro de una región no significa medir aptitud.

## Conclusiones

1. El índice del dataset mide terreno, región y lote de procesamiento. No se puede predecir desde el clima ni se transfiere entre continentes.
2. Los modelos lo predicen bien dentro de las regiones conocidas, pero porque reconocen la ubicación.
3. La validación espacial es necesaria, porque la partición al azar siempre infla.
4. Con generación real, el clima explica cerca de la mitad de la variación diaria, y casi todo lo aporta la radiación.
5. El ajuste de hiperparámetros ayuda poco: el límite está en los datos.

## Limitaciones y siguientes pasos

- **Pendientes:**
  - La tecnología de cada planta colombiana.
  - Comparar el clima modelado con estaciones del IDEAM.
  - Grillas de hiperparámetros más grandes.
- **Siguiente entrega:** árboles, bosques aleatorios, XGBoost, balanceo de clases con SMOTE y ADASYN, y optimizadores bayesiano y genético.

Gracias, quedamos atentos a sus preguntas.

---

## Repaso de conceptos para preparar

- **Fuga de información (data leakage):** que el modelo vea, al entrenar, algo que no tendría en la vida real, como los datos de prueba. Se evita partiendo primero y metiendo todo el preprocesamiento en el `Pipeline`.
- **`Pipeline`:** una cadena de pasos (rellenar vacíos, escalar, modelo) que se ajusta como una sola pieza, solo con el entrenamiento.
- **Validación cruzada por bloques:** partir por zonas del mapa en lugar de filas al azar.
- **Validación anidada:** un bucle interno elige los hiperparámetros y uno externo mide.
- **Hiperparámetro:** un ajuste del modelo que no se aprende de los datos, como el número de vecinos de KNN o la C del SVM.
- **Regularización:** una penalización que evita coeficientes demasiado grandes. Ridge usa L2 y Lasso usa L1, que puede dejar variables en cero.
- **Kernel RBF:** permite al SVM trazar fronteras curvas en lugar de rectas.
- **R² negativo:** el modelo predice peor que simplemente usar el promedio.
- **Factor de capacidad:** la energía producida en el día dividida entre la máxima posible.

## Preguntas probables

- *¿Por qué no partieron los datos al azar?* Porque las plantas vecinas se parecen, y el modelo acertaría por vecindad. Lo mostramos con números: al azar siempre sale más alto.
- *¿Por qué F1 macro y no exactitud?* Porque el 75 % es clase Alta, y predecir siempre Alta daría 75 % de exactitud sin servir para nada.
- *¿Por qué solo 16 plantas en Colombia?* XM no publica las coordenadas, y solo usamos plantas cuya ubicación pudimos verificar con fuentes.
- *¿Por qué ganan los lineales en Colombia y pierden en la base mundial?* En Colombia la física es casi lineal y hay pocas zonas para aprender algo más complejo. En la base mundial el índice cambia de nivel por región, y un solo plano no puede representarlo.
- *¿Qué es el AUC?* La probabilidad de que el modelo le dé más puntaje a un ejemplo de la clase correcta que a uno de otra clase. 0.5 es azar y 1 es perfecto.
