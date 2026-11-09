// Tablas de resultados para la presentación. Los valores son los que imprimen los cuadernos en la
// celda indicada en `source`; solo se reordenan columnas y se quitan las que no hacen falta.

// Resumen de los 7 modelos de cada tarea: la mejor combinación de cada uno (Experimentos 2 y 3).
// Se agrupan por familia; los modelos que solo existen en una tarea dejan la otra vacía.
export const SUMMARY = {
  source: 'Experimento_2_Clasificacion.ipynb, celda 7 y Experimento_3_Regresion.ipynb, celda 6 (media en los 5 pliegues externos)',
  columns: ['Modelo', 'Clasificación: F1 macro', 'Clasificación: AUC', 'Regresión: R²', 'Regresión: RMSE'],
  rows: [
    ['Random Forest', '0.894', '0.981', '0.9023', '0.0416'],
    ['XGBoost', '0.888', '0.981', '0.8989', '0.0423'],
    ['Árbol de decisión', '0.881', '0.972', '0.8802', '0.046'],
    ['SVM RBF / SVR RBF', '0.814', '0.932', '0.7921', '0.0607'],
    ['KNN', '0.799', '0.929', '0.7984', '0.0598'],
    ['Regresión logística / Ridge', '0.629', '0.873', '0.4794', '0.0962'],
    ['Lasso', '—', '—', '0.4791', '0.0962'],
    ['Naive Bayes', '0.58', '0.838', '—', '—'],
  ],
};

export const BASE_F1 = {
  raw: { nb: 'benchmark' as const, outs: [[6, 0]] as [number, number][] },
  source: 'Benchmark_Modelos_Base.ipynb, celda 6 (F1 macro, hiperparámetros por defecto)',
  columns: ['Modelo', 'Con lat/lon, aleatoria', 'Con lat/lon, bloques 5°', 'Sin lat/lon, aleatoria', 'Sin lat/lon, bloques 5°'],
  rows: [
    ['SVM RBF (8 mil filas)', '0.826', '0.812', '0.680', '0.617'],
    ['KNN', '0.807', '0.787', '0.730', '0.658'],
    ['Regresión logística balanceada', '0.632', '0.629', '0.488', '0.470'],
    ['Regresión logística', '0.613', '0.599', '0.381', '0.377'],
    ['SVM lineal (calibrado)', '0.533', '0.516', '0.310', '0.312'],
    ['Naive Bayes gaussiano', '0.458', '0.448', '0.148', '0.146'],
    ['Referencia: clase mayoritaria', '0.285', '0.285', '0.285', '0.285'],
  ],
};

export const BASE_R2 = {
  raw: { nb: 'benchmark' as const, outs: [[8, 0]] as [number, number][] },
  source: 'Benchmark_Modelos_Base.ipynb, celda 8 (R², hiperparámetros por defecto)',
  columns: ['Modelo', 'Con lat/lon, aleatoria', 'Con lat/lon, bloques 5°', 'Sin lat/lon, aleatoria', 'Sin lat/lon, bloques 5°'],
  rows: [
    ['KNN', '0.818', '0.790', '0.656', '0.480'],
    ['SVR RBF (8 mil filas)', '0.762', '0.734', '0.560', '0.427'],
    ['Ridge', '0.490', '0.479', '0.220', '0.195'],
    ['SVR lineal', '0.490', '0.479', '0.220', '0.195'],
    ['Lasso', '0.488', '0.478', '0.219', '0.195'],
    ['Referencia: media', '-0.000', '-0.002', '-0.000', '-0.002'],
  ],
};

export const BASE_LORO = {
  raw: { nb: 'benchmark' as const, outs: [[10, 0]] as [number, number][] },
  source: 'Benchmark_Modelos_Base.ipynb, celda 10 (R² con latitud y longitud, una macrorregión fuera)',
  columns: ['Modelo', 'Fuera: Américas', 'Fuera: Asia/Oceanía', 'Fuera: Europa/África/M.Oriente'],
  rows: [
    ['SVR RBF (8 mil filas)', '-0.85', '-8.38', '-0.19'],
    ['KNN', '-1.49', '-5.94', '-1.18'],
    ['Ridge', '-5.41', '-4.15', '-0.11'],
    ['Lasso', '-4.60', '-4.16', '-0.11'],
    ['SVR lineal', '-5.40', '-4.15', '-0.11'],
    ['Referencia: media', '-1.03', '-3.59', '-0.71'],
  ],
};

export const CLF_BEST = {
  raw: { nb: 'exp2' as const, outs: [[7, 0]] as [number, number][] },
  source: 'Experimento_2_Clasificacion.ipynb, celda 7 (media ± desviación en los 5 pliegues externos)',
  columns: ['Modelo', 'Balanceo', 'Optimizador', 'Exactitud', 'F1 macro', 'AUC', 'F1 clase Baja'],
  rows: [
    ['Random Forest', 'ninguno', 'aleatoria', '0.94 ± 0.009', '0.894 ± 0.014', '0.981 ± 0.007', '0.864 ± 0.016'],
    ['XGBoost', 'ninguno', 'bayesiana', '0.937 ± 0.01', '0.888 ± 0.016', '0.981 ± 0.007', '0.853 ± 0.022'],
    ['Árbol de decisión', 'ninguno', 'bayesiana', '0.932 ± 0.01', '0.881 ± 0.017', '0.972 ± 0.009', '0.846 ± 0.02'],
    ['SVM RBF', 'ninguno', 'genetica', '0.894 ± 0.006', '0.814 ± 0.018', '0.932 ± 0.008', '0.762 ± 0.03'],
    ['KNN', 'ninguno', 'aleatoria', '0.893 ± 0.005', '0.799 ± 0.023', '0.929 ± 0.012', '0.701 ± 0.055'],
    ['Regresión logística', 'smote', 'bayesiana', '0.716 ± 0.024', '0.629 ± 0.014', '0.873 ± 0.007', '0.514 ± 0.041'],
    ['Naive Bayes', 'ninguno', 'bayesiana', '0.713 ± 0.031', '0.58 ± 0.025', '0.838 ± 0.016', '0.485 ± 0.038'],
  ],
};

export const CALIBRATION = {
  raw: { nb: 'exp2' as const, outs: [[15, 0]] as [number, number][] },
  source: 'Experimento_2_Clasificacion.ipynb, celda 15 (predicciones fuera de pliegue; menor Brier y ECE es mejor)',
  columns: ['Modelo', 'Probabilidades', 'Brier', 'ECE', 'F1 macro (argmax)'],
  rows: [
    ['Random Forest', 'original', '0.0322', '0.0132', '0.8946'],
    ['Random Forest', 'Platt', '0.0331', '0.0163', '0.8917'],
    ['Random Forest', 'isotónica', '0.0319', '0.0030', '0.8945'],
    ['XGBoost', 'original', '0.0325', '0.0145', '0.8887'],
    ['XGBoost', 'Platt', '0.0340', '0.0240', '0.8897'],
    ['XGBoost', 'isotónica', '0.0323', '0.0028', '0.8869'],
    ['Árbol de decisión', 'original', '0.0354', '0.0124', '0.8817'],
    ['Árbol de decisión', 'Platt', '0.0373', '0.0320', '0.8794'],
    ['Árbol de decisión', 'isotónica', '0.0353', '0.0051', '0.8843'],
    ['SVM RBF', 'original', '0.0605', '0.0245', '0.8152'],
    ['SVM RBF', 'Platt', '0.0619', '0.0052', '0.8136'],
    ['SVM RBF', 'isotónica', '0.0606', '0.0226', '0.8147'],
    ['KNN', 'original', '0.0540', '0.0265', '0.8008'],
    ['KNN', 'Platt', '0.0542', '0.0295', '0.7987'],
    ['KNN', 'isotónica', '0.0533', '0.0053', '0.8011'],
    ['Regresión logística', 'original', '0.1293', '0.0548', '0.6288'],
    ['Regresión logística', 'Platt', '0.0996', '0.0766', '0.6059'],
    ['Regresión logística', 'isotónica', '0.0944', '0.0273', '0.6282'],
    ['Naive Bayes', 'original', '0.1260', '0.0715', '0.5825'],
    ['Naive Bayes', 'Platt', '0.1109', '0.1099', '0.4989'],
    ['Naive Bayes', 'isotónica', '0.1027', '0.0194', '0.3056'],
  ],
};

export const RESIDUAL_TESTS = {
  raw: { nb: 'exp3' as const, outs: [[11, 0]] as [number, number][] },
  source: 'Experimento_3_Regresion.ipynb, celda 11 (residuos fuera de pliegue de Random Forest)',
  columns: ['Prueba', 'Hipótesis nula', 'Estadístico', 'p'],
  rows: [
    ['Jarque-Bera', 'residuos normales', '182378.781890', '0.000000e+00'],
    ['Breusch-Pagan', 'varianza constante', '2615.877418', '0.000000e+00'],
    ['White (7 variables)', 'varianza constante', '5557.521930', '0.000000e+00'],
    ['Ljung-Box, rezago 1', 'sin autocorrelación en orden de Hilbert', '1519.093066', '0.000000e+00'],
    ['Ljung-Box, rezago 5', 'sin autocorrelación en orden de Hilbert', '2544.007720', '0.000000e+00'],
    ['Ljung-Box, rezago 20', 'sin autocorrelación en orden de Hilbert', '3081.424362', '0.000000e+00'],
    ['BDS, ventana 1 de 2,500', 'residuos i.i.d. en orden de Hilbert', '—', '1.098126e-04'],
    ['BDS, ventana 2 de 2,500', 'residuos i.i.d. en orden de Hilbert', '—', '1.328251e-20'],
    ['BDS, ventana 3 de 2,500', 'residuos i.i.d. en orden de Hilbert', '—', '3.723311e-37'],
    ['BDS, ventana 4 de 2,500', 'residuos i.i.d. en orden de Hilbert', '—', '1.051572e-88'],
    ['I de Moran (8 vecinos)', 'sin autocorrelación espacial', '0.103272', '5.000000e-03'],
  ],
};

export const REG_BEST = {
  raw: { nb: 'exp3' as const, outs: [[6, 0]] as [number, number][] },
  source: 'Experimento_3_Regresion.ipynb, celda 6 (media ± desviación en los 5 pliegues externos)',
  columns: ['Modelo', 'Optimizador', 'R²', 'RMSE', 'MAE'],
  rows: [
    ['Random Forest', 'bayesiana', '0.9023 ± 0.0128', '0.0416 ± 0.0023', '0.0252 ± 0.0016'],
    ['XGBoost', 'bayesiana', '0.8989 ± 0.013', '0.0423 ± 0.0023', '0.0262 ± 0.0015'],
    ['Árbol de decisión', 'bayesiana', '0.8802 ± 0.0146', '0.046 ± 0.0024', '0.0275 ± 0.0015'],
    ['KNN', 'bayesiana', '0.7984 ± 0.0218', '0.0598 ± 0.0022', '0.0361 ± 0.0013'],
    ['SVR RBF', 'bayesiana', '0.7921 ± 0.0182', '0.0607 ± 0.0019', '0.0387 ± 0.001'],
    ['Ridge', 'genetica', '0.4794 ± 0.0427', '0.0962 ± 0.0038', '0.0694 ± 0.0032'],
    ['Lasso', 'genetica', '0.4791 ± 0.0431', '0.0962 ± 0.0038', '0.0694 ± 0.0032'],
  ],
};

export const OPTIMIZERS = {
  raw: { nb: 'exp4' as const, outs: [[4, 0], [8, 0], [13, 0]] as [number, number][] },
  source: 'Experimento_4_Optimizadores.ipynb, celdas 4, 8 y 13',
  columns: ['Optimizador', 'Veces mejor (de 34)', 'Rango medio', 'Métrica externa media', 'Área de regret', 'Regret final', 'Evaluaciones hasta 95 %', 'Segundos por evaluación'],
  rows: [
    ['bayesiana', '12', '2.1471', '0.7533', '0.240', '0.034', '16.387', '27.79'],
    ['aleatoria', '14', '2.1324', '0.7527', '0.256', '0.086', '14.500', '19.85'],
    ['grilla', '3', '2.6912', '0.7505', '0.486', '0.160', '16.691', '20.14'],
    ['genetica', '5', '3.0294', '0.7487', '0.406', '0.190', '14.143', '20.17'],
  ],
};

export const STD_VS_OPT = {
  raw: { nb: 'exp5' as const, outs: [[23, 0]] as [number, number][] },
  source: 'Experimento_5_Computacional.ipynb, celda 23',
  columns: ['Modelo', 'Estándar', 'Optimizado', 'Entrenamiento (s)', 'Inferencia (s)', 'Memoria pico (MB)'],
  rows: [
    ['XGBoost', 'exact, 300 árboles', 'hist, 300 árboles', '64.20 → 5.40', '0.160 → 0.165', '0 → 0'],
    ['Random Forest', '200 árboles, 1 núcleo', '200 árboles, 16 núcleos', '23.46 → 1.98', '0.203 → 0.084', '6 → 47'],
    ['KNN', 'KD-Tree', 'FAISS exacto', '0.10 → 0.00', '5.232 → 0.655', '2 → 3'],
    ['SVM', 'SVC RBF, 10 mil filas', 'Nyström 500 + LinearSVC, todas', '0.69 → 16.38', '1.552 → 0.106', '1 → 356'],
    ['Naive Bayes', 'fit completo', 'partial_fit en bloques', '0.02 → 0.03', '0.006 → 0.005', '8 → 1'],
    ['Logística', 'lbfgs', 'saga', '0.29 → 0.48', '0.001 → 0.001', '3 → 2'],
    ['Ridge', 'Cholesky', 'saga', '0.01 → 0.12', '0.000 → 0.000', '6 → 7'],
  ],
};

export const DELONG = {
  raw: { nb: 'exp6' as const, outs: [[9, 0]] as [number, number][] },
  source: 'Experimento_6_Estadistica.ipynb, celda 9 (predicciones fuera de pliegue)',
  columns: ['Clase', 'Comparación', 'AUC 1', 'AUC 2', 'p de Holm'],
  rows: [
    ['Baja', 'Random Forest vs XGBoost', '0.9970', '0.9971', '0.8411'],
    ['Baja', 'Random Forest vs Árbol de decisión', '0.9970', '0.9877', '0.0000'],
    ['Baja', 'XGBoost vs Árbol de decisión', '0.9971', '0.9877', '0.0000'],
    ['Media', 'Random Forest vs XGBoost', '0.9697', '0.9702', '0.5018'],
    ['Media', 'Random Forest vs Árbol de decisión', '0.9697', '0.9604', '0.0000'],
    ['Alta', 'Random Forest vs XGBoost', '0.9767', '0.9771', '0.5018'],
    ['Alta', 'Random Forest vs Árbol de decisión', '0.9767', '0.9689', '0.0000'],
  ],
};

export const MCS = {
  raw: { nb: 'exp6' as const, outs: [[13, 0]] as [number, number][] },
  source: 'Experimento_6_Estadistica.ipynb, celda 13 (conjunto de confianza de modelos al 90 %)',
  columns: ['Modelo', 'RMSE fuera de pliegue', 'p del MCS', 'En el conjunto'],
  rows: [
    ['Random Forest', '0.0416', '1.0', 'Sí'],
    ['XGBoost', '0.0424', '0.0', 'No'],
    ['Árbol de decisión', '0.0461', '0.0', 'No'],
    ['KNN', '0.0598', '0.0', 'No'],
    ['SVR RBF', '0.0608', '0.0', 'No'],
    ['Ridge', '0.0962', '0.0', 'No'],
    ['Lasso', '0.0962', '0.0', 'No'],
  ],
};

// Importancia media |SHAP| en el Random Forest de clasificación (columna "media")
export const SHAP_CLF = {
  raw: { nb: 'exp7' as const, outs: [[4, 0]] as [number, number][] },
  source: 'Experimento_7_Interpretabilidad.ipynb, celda 4 (importancia media |SHAP|, promedio de las tres clases)',
  rows: [
    ['longitude', 0.1491], ['aspect_cos', 0.06], ['slope', 0.0438], ['latitude', 0.0163],
    ['log_dist_to_road', 0.0065], ['ghi', 0.0047], ['curvature', 0.0044], ['elevation', 0.0042],
    ['ambient_temperature', 0.0041], ['wind_speed', 0.0041], ['aspect_sin', 0.0036], ['humidity', 0.002],
    ['wind_sin', 0.0019], ['wind_cos', 0.0015], ['is_flat', 0.0004],
  ] as [string, number][],
};
