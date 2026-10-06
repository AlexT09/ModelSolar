# Contexto total — Proyecto ML: Clasificación/Regresión de Aptitud Solar FV

Universidad del Norte · Ciencia de Datos · Machine Learning
Autores: Jesús David Arévalo Montilla, Enmanuel David Díaz Molinares, Alex David Terán Meza
Fecha de corte de este contexto: 2026-10-02

Archivos base:

| Archivo | Rol |
|---|---|
| `main.tex` | Entrega 1 (ETL + EDA), plantilla Springer `sn-jnl` |
| `main_1.tex` | Entrega 2 (modelo base: Regresión Logística) |
| `Entregable2MachineLearningProject_2.pdf` | Enunciado vigente. Dice "Segundo Entregable" pero es la **Entrega 3** (archivo reciclado del semestre anterior) |
| `Dataset_Mundial_Final2.csv` | Datos. CSV con `;` como separador, `,` como decimal, BOM UTF-8 |
| `2603_20601v1-2.pdf` | Paper fuente del dataset (Mantilla-Guerra et al., arXiv:2603.20601, 2026). Leído completo |
| `github.com/cimejia/solarPV` | Repositorio oficial: CSV idéntico, versión anterior en xlsx, notebook de los autores (ver §1.2b) |
| `fig_*.png` (raíz) | Figuras de E1 y E2 |
| `sn-jnl.cls`, `sn-jnl_1.cls` | Idénticos (diff vacío). Uno sobra |
| `proceso/EDA_Corregido(Entregable 3).ipynb` | EDA corregido de la Entrega 3, ya ejecutado de punta a punta (0 errores, 104 celdas, 13 figuras). Ver §8 |
| `proceso/dataset_eda_corregido.csv` | Salida del EDA corregido: 57,976 filas × 22 columnas, listo para el cuaderno de modelos |
| `proceso/environment.yml` | Entorno conda exportado (`solarpv-eda`, Python 3.11) para reproducibilidad, requisito §7.3 del enunciado |
| `proceso/nota_asistencia_ia.md` | Deja constancia de que el modelo de IA usado es Claude Sonnet 5, no "Sonnet 5.5" |
| `proceso/fig_*.png` | Figuras generadas por el EDA corregido (distribución del target, correlación, mapa de clases) |
| `proceso/Clima_a_Generacion_Colombia.ipynb` | Línea nueva (§9): factor de capacidad diario real de plantas colombianas contra el clima del día. Ejecutado de punta a punta, 40 celdas, 0 errores |
| `proceso/tabla_diaria_colombia.csv` | Salida de ese cuaderno: 4,505 filas planta-día de 9 plantas |
| `proceso/datos_xm/` | Cachés de las descargas de XM y Open-Meteo. Si existen, el cuaderno no vuelve a pedirlas |
| `proceso/referencias.bib` | Referencias de §9 verificadas contra Crossref y DataCite |

Todas las cifras marcadas como **[verificado]** se recalcularon sobre el CSV en esta revisión. Las
cifras de §8 vienen de la ejecución real del notebook `proceso/EDA_Corregido(Entregable 3).ipynb` el
2026-10-02 y son la fuente más actualizada; donde contradicen una cifra anterior de este documento, la
de §8 es la correcta porque salió de código ejecutado y verificable, no de una revisión manual.

---

## 1. El dataset: lo que realmente es

### 1.1 Estructura

58,978 filas × 29 columnas. Carga correcta:

```python
pd.read_csv("Dataset_Mundial_Final2.csv", sep=";", decimal=",", encoding="utf-8-sig")
```

Con los parámetros por defecto de pandas se obtiene una sola columna de texto. El ETL de E1 dice que se carga `Dataset_Mundial_Final.xlsx` con `read_excel`: el archivo del proyecto no es ese.

| Grupo | Columnas |
|---|---|
| Identificación | `OBJECTID`, `code`, `plant_name` |
| Geográficas | `country` (183), `longitude`, `latitude` |
| Topográficas (DEM, GSA, 9 arc-s) | `elevation`, `slope`, `aspect`, `curvature` + binnings `slope_type`, `aspect_type`, `curvature_type` |
| Logísticas | `dist_to_road`, `area` (polígono de la planta), `size` (binning de `area`) |
| Clima (ERA5 promedios mensuales → anual) | `ambient_temperature`, `humidity`, `wind_speed`, `wind_direction`, `dt_wind` (binning) |
| Energía / GSA | `ghi` (según el paper es **GTI**, irradiación global en plano inclinado, kWh/m²/día), `pv_potential` (kWh/kWp/día), `optimal_tilt` |
| GEM | `operational_status` (10 estados), `capacity` (MW según GEM; el paper dice kWp, error del paper) |
| Target | `solar_aptitude` [0, 0.942], `solar_aptitude_rounded` (=round(10·apt), entero 0–9), `solar_aptittude_class` (Baja <0.4, Media 0.4–0.6, Alta ≥0.6) |

### 1.2 Cómo se construyó el target (dato central omitido en E1 y E2)

Paper, Ec. 1:

```
IAS = 0.40·Slope + 0.25·Aspect + 0.20·Hillshade + 0.15·Curvature
```

capas normalizadas a [0,1], ponderación tipo AHP, luego binning en Baja/Media/Alta. Hillshade se calculó con sol fijo (azimut 315°, elevación 45°), por lo que es función de slope y aspect.

Consecuencias:

1. El target **no incluye irradiancia, temperatura, viento ni humedad**. "Aptitud solar" aquí es aptitud **topográfica** del terreno, no recurso solar. El planteamiento de negocio de E1 ("¿vale la pena invertir?") y el vector de entrada "terreno y clima" sobredimensionan lo que mide la variable.
2. Empíricamente, la fórmula **no se reproduce** con los valores puntuales del CSV [verificado]:
   - Spearman(`solar_aptitude`, `slope`) = −0.06; `aspect` = 0.03; `curvature` = −0.03.
   - Spearman con `longitude` = **0.58**, con `latitude` = −0.33.
   - HistGradientBoosting regresor con solo `slope`, `aspect`, `curvature`: R² CV = **0.04**. Añadiendo `latitude`, `longitude`: R² = **0.90**.
3. El índice tiene un **nivel base por macro-región** [verificado]:

| Región (por longitud) | n | media `solar_aptitude` | Baja | Media | Alta |
|---|---|---|---|---|---|
| Américas (lon < −30) | 10,508 | 0.606 | 3 | 5,574 | 4,931 |
| Europa/África/M. Oriente (−30 a 60) | 20,898 | 0.607 | 1,883 | 6,764 | 12,251 |
| Asia/Oceanía (lon ≥ 60) | 27,572 | 0.768 | 6 | 453 | 27,113 |

   El paper indica que los DEM se procesaron **por continente** y se normalizaron. Hipótesis más probable: la normalización por continente introduce un desplazamiento regional del índice. Dentro de cada país la relación física sí aparece (Spearman con slope: España −0.32, EE. UU. −0.23, Alemania −0.19).
4. Prueba de transferencia leave-region-out (HGB regresor, 13 numéricas) [verificado]: R² = **−7.6** al predecir Asia, **−1.2** Europa/África, **−2.4** Américas. El modelo **no generaliza entre continentes**. Dentro de región sí (bloques espaciales 5°×5°: R² 0.886).

Esto debe declararse como limitación central y como corrección del EDA (requisito 7.1 del enunciado).

### 1.2b Repositorio oficial (`github.com/cimejia/solarPV`) [verificado]

- `Dataset/Dataset_Mundial_Final.csv` es **byte a byte idéntico** a `Dataset_Mundial_Final2.csv`.
- `Dataset/Dataset_Mundial.xlsx` es una **versión anterior**: 48,369 filas, solo 204 Baja, centinela de aptitud = −9999, y **0 plantas de Alemania, Grecia, España e Italia**.
- En las 30,555 ubicaciones comunes a ambas versiones, `solar_aptitude` es idéntico (100%).
- De las 1,892 Baja actuales, **1,788 (94.5%) están en filas añadidas en la segunda versión**: Grecia 454, Alemania 329, España 206, Italia 191, Francia 151, Turquía 108, Reino Unido 73.
- Conclusión: Europa se procesó en un lote posterior y ese lote trae casi toda la clase minoritaria. La clase Baja está confundida con el lote de procesamiento. Esto refuerza §1.2.3 con evidencia directa, no solo con la hipótesis de normalización por continente.
- Modelo de los autores (`ML-model/solarpvprediction.ipynb`): MLP (Keras) sobre un subconjunto de **Sudamérica** (7,006 filas), target **`pv_potential`** (no la aptitud), con `irradiancia` como predictora. CV espacial `GroupKFold` con bloques de 0.5°, sen/cos para aspecto y dirección del viento. Resultado: MAE 0.100 ± 0.008, RMSE 0.143 ± 0.018, Spearman 0.895. Tiene fuga menor: `StandardScaler` ajustado sobre todos los datos antes de la CV. Sirve como referencia externa y como precedente de CV espacial en la literatura del propio dataset.

### 1.2c Procedimiento de `area` y `dist_to_road` según el paper (explica D4–D5)

- **`area`**: polígonos OSM etiquetados como planta solar, unidos espacialmente al punto GEM. El paso 7 del procedimiento dice literalmente "área de cada panel solar". Si el punto cae en un polígono de un solo bloque o techo, el área queda diminuta (ej. Cauchari aparece dos veces: 10,738,800 m² y 30 m²). Si no hay polígono, NaN. Esto explica las densidades capacidad/área imposibles y los faltantes.
- **`dist_to_road`**: el procedimiento descrito usa la red vial de Sudamérica de GEOFABRIK y la proyección "South America Albers Equal Area"; el propio paper admite que fuera de la cobertura de los DEM la distancia "se calculó de forma genérica". Distancias de miles de km en Pakistán o España son coherentes con haber medido contra una red vial o proyección que no corresponde a la región.
- Las variables climáticas en algunos países tienen granularidad muy gruesa: Argentina (64 plantas) tiene solo 4 valores distintos de humedad y 5 de dirección del viento; Colombia 18 y 19; Chile 29 y 26. En esos países el "clima" es casi una constante por país.

### 1.3 Problemas de calidad de datos [verificado]

| # | Problema | Cuantificación | Tratamiento recomendado |
|---|---|---|---|
| D1 | Filas centinela sin cobertura DEM | 64 filas con `solar_aptitude`=0 y `slope`=`aspect`=`curvature`=`elevation`=0 (Reunión 30, Mauricio 16, Cabo Verde 7, Egipto 4, …). **Todas etiquetadas Baja** (3.4% de la clase minoritaria es artefacto) | Eliminar |
| D2 | Clima centinela | 3 filas con `ghi`=`humidity`=`pv_potential`=0; 2 con `wind_speed`=0 | Eliminar o NaN + imputar |
| D3 | `aspect`=−1 | 1,105 filas, coinciden con `aspect_type`=Flat y `slope`=0 | Indicador binario `is_flat` + sen/cos = 0 |
| D4 | `dist_to_road` imposible | Máx. 2,295 km (Pakistán, dos plantas con valor idéntico); 65 filas >100 km (15 en España); 1,723 >20 km. El paper reporta máx. 6.3 km. Causa probable: red vial/proyección de Sudamérica aplicada fuera de región (§1.2c) | Marcar >100 km como error → NaN; log1p |
| D5 | `area` incoherente con `capacity` | Densidad mediana 540 W/m² (físico: ~40–100 W/m²; tope ~200). 24,000 plantas >300 W/m². Máx. 234.7 km². Causa: unión punto-polígono OSM que a veces captura un bloque o panel (§1.2c) | `area` no es fiable como huella de planta |
| D6 | `area` faltante y `size` | 16,329 NaN (27.69%). **Todas** tienen `size`=Small. `size`=Small mezcla plantas pequeñas con faltantes | `size` inválida tal como está |
| D7 | Faltantes informativos | Con `area` NaN: Alta 89.7%, Baja 1.4%. Con `area` presente: Alta 69.5%, Baja 3.9% | Si se usa `area`, añadir indicador de faltante |
| D8 | Duplicados | 0 duplicados exactos, pero **1,598** filas duplicadas en todos los atributos salvo ID/código/nombre; **9,894** con coordenadas repetidas (3,064 grupos); 8 grupos con clase distinta en el mismo punto. Cifra recalculada en §8 sobre código ejecutado; una revisión anterior de este documento reportaba 938/6,830 con el mismo criterio, la de aquí es la que vale | Deduplicar atributos; agrupar por coordenada en CV |
| D9 | Ambigüedad en umbrales | `solar_aptitude`=0.400: 12 Media, 4 Baja. =0.600: 267 Alta, 239 Media (el binning se hizo antes de redondear a 3 decimales) | Ruido de etiqueta irreducible; documentar |
| D10 | `solar_aptitude_rounded` | 255 inconsistencias de redondeo (0.75→7, 0.85→9) | Irrelevante (excluida) |
| D11 | `wind_speed` sesgada a la baja | Media 0.99 m/s. El paper calcula velocidad desde componentes u, v ya promediadas: la cancelación vectorial subestima la rapidez media | Interpretar como "viento vectorial medio", no velocidad media |
| D12 | Redundancia categórica | `slope_type`, `aspect_type`, `curvature_type`, `dt_wind`, `size` son binnings deterministas de numéricas (rangos verificados sin solapamiento) | Usar una sola representación |
| D14 | Clima de baja resolución en algunos países | Argentina: 4 valores de humedad para 64 plantas; Colombia 18; Chile 29 | Considerar en interpretación de SHAP |
| D13 | Paper vs CSV | Los máximos del paper (área 153,488; distancia 6,309.67; capacidad 57.5) coinciden con las cotas superiores IQR de E1: las figuras del paper están filtradas, el CSV no | Citar con esa salvedad |

---

## 2. Errores en la Entrega 1 (`main.tex`)

Severidad: **C** = invalida conclusiones o el diseño · **M** = afirmación falsa o inconsistente · **m** = forma, notación, presentación.

| # | Sev. | Ubicación | Error | Evidencia / corrección |
|---|---|---|---|---|
| E1.1 | C | Intro, §2, §3.1 | No se describe cómo se construye el target. Se presenta como función de "terreno y clima" cuando el IAS es solo topográfico | §1.2 de este documento |
| E1.2 | C | §3.1, §3.3.4 | Lógica de exclusión invertida. `pv_potential` y `optimal_tilt` son valores de raster GSA disponibles para **cualquier** coordenada antes de invertir; no son "resultado de haber construido la planta". En cambio `area` (polígono de la planta construida) sí es posterior a la construcción y se mantiene como predictora | Excluir `area`/`size` por la misma regla, o admitir `pv_potential`/`optimal_tilt`. Solo `capacity` y `operational_status` son posteriores a la decisión |
| E1.3 | C | Abstract, §3.3.3 | "La clase minoritaria concentrada casi exclusivamente en cuatro países europeos". Falso: Grecia 454, Alemania 329, España 206, **Italia 191**, Francia 151, **Turquía 108**, Reino Unido 73. Los cuatro citados suman 759/1,892 = **40%**. El error surge de mirar solo el top-10 por volumen | Reescribir con la tabla de Baja por país |
| E1.4 | C | Abstract, §3.2 | "Ausencia de duplicados". 938 duplicados de atributos y 6,830 coordenadas repetidas | D8 |
| E1.5 | C | §3.2 | "La validación de rangos encontró una única violación". Omite D1, D2, D4, D5 | §1.3 |
| E1.6 | C | §3.3.3 | La dominancia de `longitude` (H = 12,890) se interpreta como sesgo de muestreo. La evidencia apunta a un desplazamiento del índice por continente y por lote de procesamiento (94.5% de Baja proviene del lote europeo añadido después), lo que cambia la validación requerida (leave-region-out falla) | §1.2 puntos 3–4, §1.2b |
| E1.7 | M | §3.2 | Afirma que `aspect` y `wind_direction` "se codificaron" de forma cíclica. E2 usa grados crudos | Aplicar realmente sen/cos |
| E1.8 | M | §3.2 | ETL describe `Dataset_Mundial_Final.xlsx` con `read_excel`. El archivo del proyecto es `Dataset_Mundial_Final2.csv` (`;`, decimal `,`) | Reproducibilidad rota |
| E1.9 | M | §3.3.7 | "55–58% de Alta en las bandas templadas y tropical sur". Templada norte tiene **74.7%** Alta (y contiene 50,609 plantas, 86% del total). Solo templada sur (55.2%) y tropical sur (58.2%) están en ese rango. Además las "bandas climáticas" no se definen; son bandas de latitud | Corregir y definir cortes (0°, ±23.44°, ±66.5°) |
| E1.10 | M | §3.3.7 | Interpreta que `size` "codifica el tamaño del proyecto construido" por su relación con `operational_status`. `size` es un binning de `area` donde todos los NaN se asignaron a Small (D6) | Reinterpretar |
| E1.11 | M | §3.3.5, Fig. 2 | Pearson sobre variables de cola pesada (`area`, `dist_to_road`) y circulares (`aspect`, `wind_direction`) | Spearman; para circulares, correlación circular-lineal o sen/cos |
| E1.12 | M | §3.3.5 | Kruskal-Wallis sobre ángulos crudos: 359° y 1° quedan en extremos opuestos del ranking | Aplicar a sen/cos o usar prueba circular |
| E1.13 | M | §3.3.5 | VIF calculado sobre casos completos (n = 42,649) sin decirlo; ignora la redundancia categórica (D12) | Declarar n; tratar redundancia |
| E1.14 | M | §3.3.4 | Umbrales del target descritos como disjuntos ("Baja hasta 0.400, Media entre 0.4 y 0.6"); hay solapamiento en 0.4 y 0.6 | D9 |
| E1.15 | M | §3.3.4 | La sección de fuga omite la fuga real del diseño: coordenadas + partición aleatoria permiten interpolación espacial | §4.3 |
| E1.16 | M | §2 | Target declarado ordinal; ninguna métrica ni modelo usa el orden (confundir Baja↔Alta cuesta igual que Media↔Alta) | Añadir MAE ordinal o kappa ponderado cuadrático como métrica auxiliar |
| E1.17 | M | Ec. 1 | Vector con `wind_direction` y `dt_wind` (misma información), y tres pares numérica/binning | D12 |
| E1.18 | m | Tabla 1 | `área` sin unidades (m²); "irradiancia (kWh/m²)" es irradiación y la unidad correcta es kWh/m²/día; la columna es GTI, no GHI | Corregir etiqueta |
| E1.19 | m | Keywords | "Validación cruzada espacial" como palabra clave; no se ejecutó en E1 ni E2 | — |
| E1.20 | m | Fig. 1 | La etiqueta "44,295 (75.1%)" se superpone al título | Ampliar `ylim` |
| E1.21 | m | Fig. 4 | Eje `symlog` de `dist_to_road` con etiquetas ilegibles (−10⁻⁵… superpuestas); bigotes IQR calculados en escala lineal y dibujados en log | `log1p` antes de graficar, eje lineal sobre la transformación |
| E1.22 | m | Fig. 2 | Título en spanglish ("features numéricas") | — |
| E1.23 | m | Varios | Cuerpo con referencias a `\ref{subsec:eda}` mientras afirma que `size`/`country` "se analizan sin incorporarse"; nunca se decide su destino en E2 | Cerrar decisión en E3 |

Verificado como correcto en E1: conteos de clase, 183 países, 79.81% top-10, tabla por país (Tabla 2), asimetrías, estadísticos H de Kruskal-Wallis, VIF (sobre casos completos), porcentajes de `slope_type`/`curvature_type`/`dt_wind`, 1,261 plantas con área >10⁶, tabla de outliers, medias de `capacity`/`pv_potential`/`optimal_tilt` por clase, referencias bibliográficas (volúmenes y páginas correctos).

---

## 3. Errores en la Entrega 2 (`main_1.tex`)

Resultados reproducidos exactamente con split estratificado 80/20, semilla 42: base acc 0.787, F1 macro 0.647, AUC 0.8858; balanceado C=10 acc 0.753, F1 0.625, AUC 0.8856 [verificado].

| # | Sev. | Ubicación | Error | Evidencia / corrección |
|---|---|---|---|---|
| E2.1 | C | Abstract, §3, §4 | "El AUC idéntico confirma que la capacidad discriminativa no cambia: solo cambia el umbral". Falso: `class_weight` cambia la función de pérdida y los coeficientes, no un umbral. Norma L1 de coeficientes: 42.9 (base) vs 97.8 (balanceado C=10). AUC 0.8858 vs 0.8856 es coincidencia aproximada, no prueba. King & Zeng solo garantiza corrección de intercepto en modelo bien especificado | Reformular: "el AUC macro OvR no varió materialmente" |
| E2.2 | C | §2.1 | Partición aleatoria, contradiciendo la decisión de E1 de validación espacial por país | — |
| E2.3 | C | §2.1 | Predictoras heredan E1.2 (incluye `area`, post-construcción, 28% imputado con mediana sin indicador, con faltante informativo D7) | — |
| E2.4 | C | §3 | Se omite la falla principal del modelo base: recall de **Media = 0.363** (Baja 0.575, Alta 0.919). El texto solo discute Baja | Reportar matriz y métricas por clase de ambos modelos |
| E2.5 | M | §2.3, §3 | Se comparan dos cambios a la vez (ponderación y C). C=1 y C=10 con ponderación dan resultados casi idénticos (F1 0.624 vs 0.625): la grilla fue plana; la regularización no es el cuello de botella | Aislar efectos; grilla log más amplia o declarar irrelevancia de C |
| E2.6 | M | §3, §4 | GridSearch optimizó F1 macro, pero el modelo elegido tiene menor F1 macro que el base; luego se afirma que el ajuste "cierra buena parte del margen" | Contradicción entre criterio y conclusión |
| E2.7 | M | §2.2 | Ec. 3 omite los pesos de clase (que son el cambio estudiado) y el factor ½ de la parametrización de scikit-learn | `min ½‖w‖² + C Σ ω_{y_i} ℓ_i` |
| E2.8 | M | §2.1 | `aspect` con centinela −1 estandarizado como numérico; sin sen/cos pese a E1 | — |
| E2.9 | M | §3 | Mención a "iteración previa que incluía por error `optimal_tilt`": error interno que no corresponde al documento y además contradice E1.2 | Eliminar |
| E2.10 | M | §3 | "No se realiza prueba de significancia al evaluar un único modelo": se comparan dos versiones; McNemar o bootstrap pareado eran aplicables | — |
| E2.11 | M | Todo | Métricas de un único split, sin desviación ni IC | — |
| E2.12 | M | §4 | Atribuye el efecto de `longitude` a "composición geográfica" sin evidencia; ver E1.6 | — |
| E2.13 | m | §4 | "F1 macro de 0.62 a 0.65 según la versión" redactado como margen de mejora | — |
| E2.14 | m | Abstract | "17 variables definidas en el EDA": E1 dejó pendientes `size`, `country` y la codificación categórica | — |
| E2.15 | m | Fig. 3 | Pie de figura correcto (368/379; 536 y 1,546). Falta la matriz del modelo base para contraste | — |

Verificado como correcto en E2: 39 columnas tras one-hot (13 + 6+3+9+8), recall Baja 0.97 y precisión Baja 0.28, caída de 3.4 pp, conteos de la matriz.

---

## 4. Requisitos de la Entrega 3 (enunciado)

### 4.1 Combinatoria obligatoria

| Tarea | Modelos (7) | Balanceo (4) | Optimizador (4) | Total |
|---|---|---|---|---|
| Clasificación | KNN, Naive Bayes, LogReg L1/L2, DT, RF, XGBoost, SVM | Ninguno, SMOTE, ADASYN, `class_weight='balanced'` | Grid, Random, Bayesiana (Optuna/Hyperopt), Genética (DEAP) | 112 |
| Regresión | KNN, Ridge, Lasso, DT, RF, XGBoost, SVR | — | ídem | 28 |
| | | | | **140** |

Más (recomendado) un método multi-fidelidad: Successive Halving / Hyperband / BOHB, con métrica de fidelidad y factor de reducción justificados.

### 4.2 Checklist

**Optimización (§3)**
- [ ] Validación anidada: métricas reportadas solo del bucle externo; justificar K externo/interno
- [ ] Preprocesamiento dentro de cada pliegue para los 4 optimizadores (Pipeline o equivalente manual en Optuna y DEAP)
- [ ] Bayesiana: declarar surrogate (TPE en Optuna; GP si se usa `GPSampler`/scikit-optimize) y función de adquisición (TPE maximiza l(x)/g(x), equivalente a EI)
- [ ] Genética: selección, cruce, mutación con probabilidades, elitismo, tamaño de población, **diversidad genética por generación**
- [ ] Espacios de búsqueda justificados; escalas log para C, λ, learning rate
- [ ] Comparar métodos por métrica externa, tiempo total y por evaluación, número de evaluaciones
- [ ] Curvas anytime (mejor valor hasta la evaluación t)
- [ ] Estabilidad ante semillas
- [ ] **Demostración cuantitativa** de eficiencia Bayes/GA vs Grid/Random (calidad por unidad de presupuesto)

**Optimización computacional (§4)**
- [ ] Complejidad O(·) de entrenamiento e inferencia por modelo, contrastada con tiempos empíricos variando n y p (exponente empírico)
- [ ] KNN: fuerza bruta vs KD/Ball-tree vs FAISS (exactitud vs velocidad)
- [ ] Ridge/Lasso: solver SAGA
- [ ] Naive Bayes: `partial_fit`
- [ ] XGBoost: `hist` vs `exact`, early stopping con validación independiente; GPU si existe (factor de aceleración)
- [ ] SVM: SGD / LinearSVC en vez de kernel completo
- [ ] `n_jobs`, backends joblib; Dask/Ray opcional
- [ ] Profiling (cProfile, memory_profiler, py-spy)
- [ ] Tabla estándar vs optimizado: complejidad, t_train, t_inferencia, memoria, Δdesempeño

**Evaluación clasificación (§5.1)**
- [ ] Por modelo: matriz de confusión, ROC, tabla Accuracy/Precision/Recall/F1/AUC
- [ ] Justificar métrica principal de validación
- [ ] Comparación con/sin SMOTE, ADASYN, class_weight
- [ ] Calibración: diagrama de confiabilidad, Brier, ECE; recalibración Platt/isotónica si aplica, con efecto en ECE/Brier

**Evaluación regresión (§5.2)**
- [ ] RMSE, MAE
- [ ] Gráfico train/validación/prueba con predicciones
- [ ] White (homocedasticidad), BDS (independencia), ACF + Ljung-Box, histograma + normalidad

**Interpretabilidad (§5.3)** — mejor modelo de cada tarea
- [ ] SHAP summary global
- [ ] Waterfall/force para ≥2 observaciones (una acertada, una con error alto)
- [ ] LIME vs SHAP en XGBoost (obligatorio por §7.2)

**Robustez (§5.4)**
- [ ] Media ± DE sobre pliegues externos para cada combinación
- [ ] Sensibilidad a semillas (RF, XGB, GA, SVM)
- [ ] Discusión: diferencia entre modelos vs variabilidad intra-modelo

**Estadística (§6)**
- [ ] Clasificación: Friedman → Nemenyi + **diagrama CD** → DeLong en subconjunto reducido con Holm o BH (p crudo y ajustado) → Delta de Cliff → IC bootstrap BCa
- [ ] Regresión: MCS → Giacomini-White o Clark-West (según anidamiento) → Diebold-Mariano con HLN + bootstrap estacionario → d de Cohen
- [ ] Tamaño de efecto en todos los casos

**Entregables (§7)**
- [ ] **Jupyter Book** (no LaTeX) con código, figuras, tablas e interpretación
- [ ] §7.1 EDA corregido (incluye §2 y §1.3 de este documento)
- [ ] `requirements.txt`/`environment.yml` con versiones exactas
- [ ] Semilla global única propagada a numpy, sklearn, XGBoost, DEAP
- [ ] Tabla maestra de 140 corridas (CSV/parquet/MLflow): hiperparámetros finales, métricas externas, tiempo, semilla
- [ ] Código modular (datos / modelos / optimización / evaluación); docstrings NumPy o Google
- [ ] Sustentación de 10 min: ETL, EDA, modelos, comparación de optimizadores, conclusiones

---

## 5. Posibilidades con este dataset y decisiones de diseño

### 5.1 Tareas

**Clasificación:** `solar_aptittude_class` (3 clases, 75.1/21.7/3.2%).

**Regresión — candidatos [verificado, HGB por defecto, R² CV]:**

| Target | CV aleatoria | CV bloques 5° | Comentario |
|---|---|---|---|
| `solar_aptitude` | 0.906 | 0.886 | **Recomendado.** Versión continua del mismo fenómeno; coherencia narrativa total con clasificación |
| `pv_potential` con `ghi` | 0.998 | 0.994 | Trivial: Pearson(`pv_potential`, `ghi`) = 0.946; ambas salen del mismo modelo GSA |
| `pv_potential` sin `ghi` | 0.973 | 0.912 | Más físico, pero cambia de problema |

Con `solar_aptitude` como target de regresión, el enunciado se cumple sin abrir un segundo problema y los errores de regresión se pueden mapear a clases (umbral 0.4/0.6) como análisis cruzado.

### 5.2 Conjunto de predictoras recomendado

Reglas: (a) disponible antes de invertir para una coordenada arbitraria; (b) sin redundancia determinista; (c) sin centinelas.

| Variable | Decisión | Razón |
|---|---|---|
| `latitude`, `longitude` | Mantener + ablación sin ellas | Capturan el desplazamiento regional del índice; obligan a CV espacial |
| `elevation`, `slope`, `curvature` | Mantener | Topografía |
| `aspect` | sen, cos + `is_flat` | Circular con centinela −1 |
| `wind_direction` | sen, cos | Circular |
| `dist_to_road` | log1p; >100 km → NaN | D4 |
| `ambient_temperature`, `humidity`, `wind_speed`, `ghi` | Mantener | Clima; no entran en la fórmula del target |
| `pv_potential`, `optimal_tilt` | Opcional (decisión del grupo) | Pre-inversión (raster GSA). Redundantes con `ghi`/latitud |
| `area`, `size` | **Excluir** | Post-construcción, densidades imposibles, 28% NaN informativo |
| `*_type`, `dt_wind` | Excluir | Binnings deterministas (D12). Además deja todo numérico, lo que permite SMOTE/ADASYN sin SMOTENC |
| `country` | Solo como grupo de CV | 183 niveles; codificarlo induce memorización regional |
| `capacity`, `operational_status` | Excluir | Posteriores a la decisión |
| `solar_aptitude*` | Excluir (en clasificación) | Definen el target |

Limpieza previa: eliminar 64 filas centinela (D1) y 3 de clima centinela (D2), deduplicar 938 filas (D8). Resultado ≈ 57,9xx filas; recalcular proporciones (Baja baja a ~1,828).

### 5.3 Esquema de validación

Referencias medidas [verificado], HGB clasificador por defecto, 13 numéricas, F1 macro:

| Esquema | F1 macro | Accuracy |
|---|---|---|
| StratifiedKFold aleatorio | 0.898 | 0.941 |
| StratifiedGroupKFold por bloques 5°×5° (502 bloques) | 0.886 ± 0.014 | 0.937 |
| StratifiedGroupKFold por país | 0.859 ± 0.044 | 0.924 |
| Bloques 5° sin lat/lon | 0.782 | 0.880 |
| País sin lat/lon | 0.599 | 0.739 |
| Leave-region-out (regresión) | R² < 0 | — |

Recomendación:

- **Externo:** `StratifiedGroupKFold(n_splits=5)` con grupos = bloques espaciales 5°×5° (o celdas de 2.5° si los pliegues quedan desbalanceados). Coordenadas duplicadas caen siempre en el mismo bloque, resolviendo D8 de paso.
- **Interno:** `StratifiedGroupKFold(n_splits=3)` con los mismos grupos sobre el entrenamiento externo.
- **Verificar** que cada pliegue externo tenga Baja suficiente: Baja existe casi solo en Europa/África/M. Oriente (1,883 de 1,892).
- **Prueba de estrés (no para seleccionar):** leave-region-out sobre el mejor modelo, reportado como limitación de transferencia.
- Justificación teórica: Roberts et al. (2017), ya citado en E1. Precedente directo: el notebook de los autores del dataset usa `GroupKFold` con bloques espaciales de 0.5°.
- **Ablación obligatoria por lote:** entrenar sin Europa y sin la versión 2 para mostrar que Baja depende del lote europeo.

### 5.4 Balanceo por modelo

| Modelo | SMOTE / ADASYN | `class_weight='balanced'` |
|---|---|---|
| KNN | Sí (imblearn Pipeline) | **No nativo.** Opciones: declarar N/A (112 → 108) o implementar voto ponderado por inverso de frecuencia. Documentar |
| GaussianNB | Sí | No existe el parámetro. Equivalente: `sample_weight=compute_sample_weight('balanced', y)` en `fit` o `priors` uniformes |
| LogReg L1/L2 | Sí | Nativo (`solver='saga'` para L1) |
| DT, RF | Sí | Nativo (`balanced_subsample` en RF como variante) |
| XGBoost | Sí | No existe en multiclase. `sample_weight` balanceado en `fit` |
| SVM (LinearSVC/SGD) | Sí | Nativo |

SMOTE/ADASYN **solo** dentro del pliegue de entrenamiento (`imblearn.pipeline.Pipeline`). Advertencia: interpolar entre vecinos en espacio (lat, lon, …) puede crear puntos sintéticos entre regiones distintas; estandarizar antes y discutirlo.

### 5.5 Modelos: escalabilidad medida (1 CPU, n_train = 47,000, 13 numéricas) [verificado]

| Modelo | t_fit | t_predict (12k) | F1 macro (split aleatorio, sin tuning) |
|---|---|---|---|
| KNN (k=15) | 0.07 s | **5.2 s** | 0.82 |
| GaussianNB | 0.02 s | ~0 | 0.52 |
| LogReg | 0.15 s | ~0 | 0.57 |
| Decision Tree | 0.8 s | ~0 | 0.87 |
| Random Forest (200) | 22.7 s | 0.3 s | 0.90 |
| XGBoost hist (300) | 4.1 s | 0.15 s | 0.90 |
| LinearSVC | 0.15 s | ~0 | 0.50 |
| SVC RBF (n=10k) | 1.3 s | 1.5 s | 0.79 |

Implicaciones:
- SVM: LinearSVC/SGD como versión optimizada; `Nystroem` + lineal como aproximación RBF; SVC kernel solo en submuestra para la tabla de complejidad. LinearSVC no tiene `predict_proba`: envolver en `CalibratedClassifierCV` (necesario para ROC, Brier, ECE). Esto conecta con §5.1.3.
- KNN: el costo está en inferencia; con p ≈ 15 KD/Ball-tree son viables; FAISS como comparación ANN.
- Los modelos lineales y GNB quedan muy por debajo de árboles: el índice tiene estructura no lineal y regional. Es un resultado, no un fallo.

### 5.6 Presupuesto computacional

Con 5 externos × 3 internos × B evaluaciones por optimizador:

```
fits por combinación ≈ 5 × (3·B + 1)
B = 30 → 455 fits;  112 combinaciones → ~51,000 fits de clasificación
```

Estrategias:
- **Mismo B para los 4 optimizadores** (Grid diseñado con ~30 puntos) para que la comparación calidad/presupuesto sea justa.
- Paralelizar a nivel de pliegue externo y combinación con joblib; registrar tiempo de pared por evaluación.
- Multi-fidelidad (`HalvingRandomSearchCV` o `optuna.pruners.HyperbandPruner`) con fidelidad = tamaño de submuestra o número de árboles; factor η = 3.
- XGBoost con early stopping en la partición interna, nunca en el pliegue externo.
- Guardar predicciones out-of-fold de cada combinación (probabilidades y etiquetas): las pruebas DeLong, Cliff, bootstrap, calibración y MCS se calculan desde ahí sin reentrenar.

### 5.7 Métrica principal

Propuesta: **F1 macro** como criterio de selección en el bucle interno (pondera las tres clases por igual y no depende de prevalencia como accuracy). Reportar además recall por clase, balanced accuracy, AUC macro OvR y, por el carácter ordinal, kappa ponderado cuadrático como métrica auxiliar. Justificación de costos: un falso "Alta" en un sitio Baja implica comprometer capital en terreno inadecuado; un falso "Baja" solo descarta un candidato. Esto favorece recall de Baja y precisión de Alta; decir explícitamente cuál se privilegia.

Regresión: RMSE como criterio (penaliza errores grandes que cruzan dos categorías), MAE como complemento.

### 5.8 Estadística: problemas de escala y adaptación

**Nemenyi con pocos bloques es casi inútil.** Diferencia crítica (α = 0.05) [calculado]:

| k modelos | N = 5 pliegues | N = 10 pliegues |
|---|---|---|
| 7 | 4.03 | 2.85 |
| 16 | 10.3 | 7.3 |
| 28 | 19.3 | 13.7 |
| 112 | 89.4 | 63.2 |

Estrategia jerárquica:
1. Friedman sobre las 112 combinaciones (ómnibus).
2. Diagramas CD por niveles: (a) 7 modelos, cada uno en su mejor configuración; (b) 4 balanceos dentro del mejor modelo; (c) 4 optimizadores dentro del mejor modelo.
3. Aumentar N con CV externa repetida 2×5 (N = 10), declarando la dependencia entre repeticiones.
4. DeLong solo para los 2–3 finalistas. DeLong es binario: aplicarlo OvR por clase (prioridad: Baja vs resto) sobre predicciones out-of-fold.
5. Holm-Bonferroni sobre las comparaciones dirigidas; Delta de Cliff sobre métricas por pliegue; IC BCa con `scipy.stats.bootstrap(method='BCa')`.

**Pruebas de series de tiempo en datos transversales.** BDS, Ljung-Box, ACF, Diebold-Mariano, Giacomini-White, bootstrap estacionario suponen un orden. Los datos no tienen tiempo. Adaptación defendible: ordenar residuos/diferencias de pérdida por una curva espacial (Hilbert o Morton sobre lat/lon), de modo que la dependencia serial medida sea **autocorrelación espacial**. Complementar con I de Moran sobre residuos. Giacomini-White condicional: instrumento = región o bloque. Clark-West: pares anidados naturales (Ridge con todas las variables vs Ridge sin lat/lon). Todo esto debe justificarse por escrito, no aplicarse en automático.

Librerías: `scikit-posthocs` (Nemenyi, CD diagram), `arch` (`MCS`, `SPA`, `StationaryBootstrap`), `statsmodels` (White `het_white`, `acorr_ljungbox`, `bds`), DeLong implementado (versión rápida de Sun & Xu, 2014), Cliff's delta implementado.

### 5.9 Interpretabilidad esperada

Hipótesis a contrastar con SHAP: `longitude`/`latitude` dominan (desplazamiento regional), seguidas de `slope` (relación negativa dentro de región) y `dist_to_road`. Si SHAP confirma esto, se refuerza la conclusión de §1.2 y debe redactarse como hallazgo, no esconderse. LIME en XGBoost: la explicación lineal local puede divergir de SHAP justo en fronteras de clase (0.4/0.6) y donde la interacción lat/lon × slope es fuerte.

---

## 6. Arquitectura de código sugerida (Jupyter Book)

```
proyecto/
├── environment.yml            # versiones exactas
├── config.py                  # SEED = 42, rutas, grupos, grillas
├── src/
│   ├── data.py                # carga CSV, limpieza D1–D13, features
│   ├── cv.py                  # bloques espaciales, nested CV
│   ├── models.py              # fábricas de los 7+7 modelos
│   ├── balancing.py           # none / SMOTE / ADASYN / class_weight (+ equivalentes)
│   ├── search/
│   │   ├── grid_random.py
│   │   ├── bayes_optuna.py    # pipeline manual por trial
│   │   ├── genetic_deap.py    # registro de diversidad por generación
│   │   └── halving.py
│   ├── evaluate.py            # métricas, calibración, OOF
│   ├── stats.py               # Friedman, Nemenyi, DeLong, Cliff, MCS, DM-HLN, GW, CW
│   └── explain.py             # SHAP, LIME
├── runs/master.parquet        # 140 filas: modelo, balanceo, optimizador, hiperparámetros, métricas externas (por pliegue), tiempos, semilla
└── book/
    ├── _config.yml, _toc.yml
    ├── 01_etl.ipynb
    ├── 02_eda_corregido.ipynb
    ├── 03_diseno_experimental.ipynb
    ├── 04_clasificacion.ipynb
    ├── 05_regresion.ipynb
    ├── 06_optimizacion_comparada.ipynb
    ├── 07_computacional.ipynb
    ├── 08_estadistica.ipynb
    ├── 09_interpretabilidad.ipynb
    └── 10_conclusiones.ipynb
```

Nota de entorno: E2 declara Python 3.14. Varias dependencias compiladas (numba para SHAP, faiss-cpu) pueden no tener wheels para 3.14; verificar antes de fijar el entorno o usar 3.12.

Bucle maestro (esqueleto):

```python
for task in ["clf", "reg"]:
    for model in MODELS[task]:
        for bal in (BALANCERS if task == "clf" else [None]):
            for opt in OPTIMIZERS:
                if not applicable(model, bal): log_na(...); continue
                for k, (tr, te) in enumerate(outer.split(X, y, groups)):
                    best, trace = opt.search(pipeline(model, bal), X[tr], y[tr], groups[tr], inner, budget=B, seed=SEED)
                    record(task, model, bal, opt, k, best, evaluate(best, X[te], y[te]), trace)
```

---

## 7. Decisiones abiertas

1. Incluir o no `pv_potential` y `optimal_tilt` (legítimas, redundantes con `ghi`). Decisión tomada en
   §8: quedan fuera del conjunto base de 15 predictoras, documentadas como variantes opcionales.
2. Tamaño de bloque espacial (5° vs 2.5°) según balance de Baja por pliegue. **Resuelto en §8**: 5°
   funciona bien (496 bloques, Baja entre 2.9 % y 3.8 % por pliegue en los 5 folds). Si en el cuaderno
   de modelos algún modelo específico necesita más resolución espacial, bajar a 2.5° sigue siendo la
   alternativa.
3. KNN + `class_weight`: N/A documentado vs implementación propia. Sigue abierta, pendiente para el
   cuaderno de modelos.
4. N de bloques para Friedman: 5 pliegues vs 2×5 repetidos (duplica costo). Sigue abierta.
5. Presupuesto B por optimizador según hardware disponible. Sigue abierta.
6. Target de regresión: `solar_aptitude` (recomendado) vs `pv_potential` sin `ghi`. **Resuelto en §8**:
   se implementó `solar_aptitude` como target de regresión y `solar_aptittude_class` como target de
   clasificación, exportados en `proceso/dataset_eda_corregido.csv`.
7. Usar o no la versión 1 del dataset (xlsx del repo) como evidencia del efecto lote en el EDA
   corregido. No se volvió a descargar en esta sesión; §8 usa en su lugar la prueba directa de
   leave-region-out sobre el CSV actual, que es más fuerte porque no depende de un archivo externo.
8. Correcciones del profesor a E1 y E2 (§7.1 del enunciado): no están en los archivos del proyecto; integrarlas cuando se tengan.

---

## 8. EDA corregido ejecutado (Entrega 3), sesión 2026-10-02

Esta sección resume `proceso/EDA_Corregido(Entregable 3).ipynb` para que una sesión futura no tenga
que abrir el notebook: lo que hace, los números que arrojó al ejecutarlo de verdad, y qué queda listo
para el cuaderno de modelos. El notebook corrió completo dos veces (antes y después de moverlo a
`proceso/`), ambas con 0 errores en sus 40 celdas de código.

### 8.1 Entorno

El entorno de trabajo es el conda env `solarpv-eda` (ya existía en la máquina antes de esta sesión,
Python 3.11.15), no la instalación de Anaconda base del usuario (Python 3.14, sin wheels para
XGBoost/Optuna/DEAP/SHAP/LIME: riesgo que ya estaba anotado en §6 y se confirmó real). Se instalaron
en `solarpv-eda` los paquetes que faltaban para los 140 modelos de la Entrega 3:
`imbalanced-learn`, `optuna`, `deap`, `shap`, `lime`, `plotly`, sobre una base que ya traía
`pandas 2.3.3`, `numpy 2.3.5`, `scikit-learn 1.9.0`, `xgboost 3.2.0`, `statsmodels 0.14.6`. El export
completo está en `proceso/environment.yml` (cubre el requisito §7.3 del enunciado: entorno fijado).

Para ejecutar notebooks desde la terminal sin abrir Jupyter, el patrón que funcionó es:

```
jupyter-nbconvert --to notebook --execute --inplace --ExecutePreprocessor.timeout=600 \
  --ExecutePreprocessor.kernel_name=solarpv-eda "nombre_del_notebook.ipynb"
```

Usar el `jupyter-nbconvert.exe` de dentro de `envs/solarpv-eda/Scripts/` directamente, no `python -m
jupyter nbconvert`, porque esto último puede resolver el `jupyter` del PATH (la instalación base de
miniconda) en vez del entorno del proyecto, y falla con `ModuleNotFoundError`. Hay que pasar también
`--ExecutePreprocessor.kernel_name=solarpv-eda` de forma explícita: el notebook trae `"name":
"python3"` en sus metadatos, y sin ese flag nbconvert puede arrancar el kernel `python3` genérico
(el de la base de miniconda, sin pandas) en lugar del kernel registrado para este proyecto.

### 8.2 Calidad de datos, cifras reales (reemplazan a las de §1.3 donde difieran)

Recalculado en vivo sobre `Dataset_Mundial_Final(2).csv` tal cual está hoy en la raíz de
`ml presentación/`:

| # | Hallazgo | Cifra verificada en el notebook |
|---|---|---|
| D1 | Filas sin cobertura de DEM | 64 filas, 100 % clase Baja, 3.4 % de toda la clase Baja. Coincide con §1.3 |
| D2 | Filas sin cobertura de GSA | 3 filas con `ghi=pv_potential=0` (Cabo Verde, Santo Tomé, Seychelles) + 2 filas adicionales con `wind_speed=0` (Cabo Verde se repite, más Sudáfrica). La redacción de §1.3 decía "3 filas con ghi=humidity=pv_potential=0" con las tres a la vez; en los datos reales solo Cabo Verde cumple esa triple condición, las otras dos tienen humedad no nula |
| D3 | `aspect=-1` | 1,105 filas (1.87 %), 100 % coincide con `aspect_type=Flat` y con `slope=0`. Coincide con §1.3 |
| D4 | `dist_to_road` imposible | Máximo real 2,295,655 m (2,296 km) en Pakistán. 65 filas > 100 km, 1,723 filas > 20 km, 7,538 filas > 6.31 km (el máximo que el paper reporta). Coincide con §1.3 |
| D5 | Densidad `capacity`/`area` imposible | 23,999 filas con densidad > 300 W/m² (asumiendo `capacity` en MW). `area` máxima: 234,700,000 m². Coincide en orden de magnitud con §1.3 |
| D6/D7 | `area` faltante | 16,329 filas (27.69 %), todas con `size=Small`. Con `area` ausente, 89.7 % es clase Alta; con `area` presente, 69.5 % es clase Alta. Coincide con §1.3 |
| D8 | Duplicados | **1,598** duplicados de atributos (sin ID/código/nombre), **9,894** filas con coordenadas repetidas en 3,064 grupos, 8 grupos con clase distinta en la misma coordenada. Esta es la cifra corregida, ver nota en la tabla de D8 en §1.3 |
| D9 | Ambigüedad de umbrales | En 0.4: 16 filas (12 Media, 4 Baja). En 0.6: 506 filas (267 Alta, 239 Media). Coincide con §1.3 |
| D10 | Redondeo de `solar_aptitude_rounded` | 255 inconsistencias de 58,978 filas. Coincide con §1.3 |
| D12 | Redundancia categórica | Confirmado sin solapamiento: los rangos de `slope_type` y `curvature_type` no se cruzan entre categorías |
| D13 | Paper vs CSV | `area`: 62.5 % del CSV cae bajo el máximo del paper. `dist_to_road`: 87.2 %. `capacity`: 85.8 % (máximo real en el CSV: 25,000 MW, muy por encima de los 57.5 que reporta el paper) |
| D14 | Clima de baja resolución | Argentina: 64 plantas, 4 valores únicos de humedad, 5 de dirección de viento. Colombia: 371 plantas, 18 y 19. Chile: 319 plantas, 29 y 26. Coincide con §1.3 |

### 8.3 Limpieza aplicada y dataset resultante

Se eliminaron las filas de D1 y D2, y se deduplicó por atributos (D8): de 58,978 filas se pasó a
**57,976** (1,002 eliminadas). La proporción de clases cambió muy poco: Baja pasó de 3.21 % a 3.15 %,
Media de 21.69 % a 22.00 %, Alta de 75.10 % a 74.85 %.

El resto de los hallazgos se resolvió con variables derivadas, no borrando filas:

- `aspect` → `aspect_sin`, `aspect_cos` (0 cuando `is_flat=1`), más la columna binaria `is_flat`.
- `wind_direction` → `wind_sin`, `wind_cos`.
- `dist_to_road` → valores > 100 km puestos en NaN, luego `log_dist_to_road` (quedan 63 nulos, 0.11 %
  de las filas, para imputar por mediana dentro de cada pliegue de entrenamiento en el cuaderno de
  modelos).
- `area`, `size`, los `*_type`, `dt_wind`, `capacity`, `operational_status`: excluidos del conjunto de
  predictoras (ver razones en §8.5).

### 8.4 Hallazgo central, con números reales

Esto confirma con código ejecutado lo que §1.2 ya planteaba como hipótesis:

- Spearman(`solar_aptitude`, `slope`) = −0.066 (p = 2.15e-57)
- Spearman(`solar_aptitude`, `curvature`) = −0.031 (p = 1.01e-13)
- Spearman(`solar_aptitude`, `aspect`, excluyendo el centinela −1) = +0.007 (p = 0.076, no
  significativo)
- Spearman(`solar_aptitude`, `longitude`) = **+0.583**
- Spearman(`solar_aptitude`, `latitude`) = −0.331

Tabla por macro-región (longitud < −30° Américas, −30° a 60° Europa/África/M.Oriente, ≥ 60°
Asia/Oceanía), recalculada sobre `df_clean`:

| Región | n | media IAS | Baja | Media | Alta |
|---|---|---|---|---|---|
| Américas | 10,508 | 0.606 | 3 | 5,574 | 4,931 |
| Europa/África/M.Oriente | 20,759 | 0.608 | 1,818 | 6,736 | 12,205 |
| Asia/Oceanía | 26,709 | 0.768 | 5 | 446 | 26,258 |

HistGradientBoostingRegressor, CV de 5 pliegues aleatorios (esto es solo para medir señal, no es el
esquema de validación que se usa para reportar desempeño de modelos finales, ver §8.6):

- Solo `slope`, `aspect_sin`, `aspect_cos`, `curvature`: R² = 0.184 ± 0.005
- Igual más `latitude`, `longitude`: R² = 0.906 ± 0.002

Leave-region-out (entrenar en dos macro-regiones, probar en la tercera, 10 variables numéricas):

- Probar en Asia/Oceanía: R² = −7.343
- Probar en Europa/África/M.Oriente: R² = −0.126
- Probar en Américas: R² = −2.260

Conclusión operativa: el IAS tiene relación topográfica real pero débil dentro de cada región, y un
desplazamiento regional fuerte que domina la señal global. Cualquier modelo que no controle por región
en la validación va a reportar un desempeño que no se sostiene fuera de la región de entrenamiento.

### 8.5 Conjunto de predictoras final (15 variables)

```
latitude, longitude, elevation, slope, curvature,
aspect_sin, aspect_cos, is_flat, wind_sin, wind_cos,
log_dist_to_road, ambient_temperature, humidity, wind_speed, ghi
```

Excluidas y por qué: `area`/`size` (posteriores a la construcción, D5–D7), `*_type`/`dt_wind`
(binnings deterministas, D12), `capacity`/`operational_status` (posteriores a la decisión de
invertir), `solar_aptitude_rounded` (inconsistencias propias, D10), `country` (183 niveles, se deja
solo como grupo alternativo de CV). `pv_potential` y `optimal_tilt` están disponibles antes de
invertir y no violan la regla de fuga temporal, pero se dejaron fuera del conjunto base por
redundancia con `ghi` y `latitude` respectivamente; el notebook deja esto documentado como variante
opcional en su índice de variables, no como una decisión cerrada.

El índice de variables completo (las 29 columnas originales del paper, con categoría, tipo, unidad y
la decisión tomada para cada una) está en la última sección de código del notebook, no se duplica
aquí para no perder sincronía si cambia.

### 8.6 Esquema de validación cruzada espacial implementado

`StratifiedGroupKFold(n_splits=5)` con grupos definidos por bloques de 5° × 5° de latitud/longitud
(`spatial_block = floor(lat/5)*5` + `floor(lon/5)*5`). Con el dataset limpio esto da **496 bloques**.
Los 5 pliegues quedan con porcentaje de Baja entre 2.92 % y 3.83 %, sin ningún pliegue sin ejemplos de
la clase minoritaria:

| Fold | n_test | Baja_test | % Baja |
|---|---|---|---|
| 0 | 11,570 | 338 | 2.92 % |
| 1 | 11,573 | 344 | 2.97 % |
| 2 | 11,675 | 447 | 3.83 % |
| 3 | 11,585 | 357 | 3.08 % |
| 4 | 11,573 | 340 | 2.94 % |

Se eligió 5° en vez de los 0.5° que usa el notebook de referencia de los autores del dataset porque
ese notebook trabaja sobre un subconjunto de Sudamérica de 7,006 filas, mientras que aquí el dataset
es global con 57,976 filas; con bloques de 0.5° el número de grupos sería demasiado alto y muchos
quedarían con una sola planta. Si en el cuaderno de modelos algún modelo necesita más resolución, la
alternativa documentada es bajar a 2.5° o agrupar por `country`.

### 8.7 Salida para el siguiente cuaderno

`proceso/dataset_eda_corregido.csv`: 57,976 filas × 22 columnas (las 15 predictoras más
`solar_aptitude`, `solar_aptitude_rounded`, `solar_aptittude_class`, `spatial_block`, `macro_region`,
`country`, `code`). El cuaderno de modelos (`03_modelos_clasificacion_regresion.ipynb`, aún no
creado) debe partir de este CSV, no del original, y usar `spatial_block` como `groups` en el bucle
externo de la validación anidada.

### 8.8 Citas usadas en el EDA corregido

Todas públicas y verificables, ninguna inventada. Se citan en el punto del notebook donde respaldan la
decisión metodológica correspondiente, no como lista decorativa:

- FAO (1976), *A framework for land evaluation* — clasificación de `slope` (ya citado por el paper
  fuente como su referencia [25]).
- Wilson, J. P. y Gallant, J. C. (2000), *Terrain analysis: principles and applications* —
  clasificación de `curvature` (referencia [27] del paper fuente).
- Saaty, T. L. (1980), *The analytic hierarchy process* — ponderación tipo AHP de la ecuación 1
  (referencia [31] del paper fuente).
- Roberts, D. R. et al. (2017), "Cross-validation strategies for data with temporal, spatial,
  hierarchical, or phylogenetic structure", *Ecography* 40(8), 913–929 — justificación de la CV
  espacial por bloques en vez de partición aleatoria.
- Fisher, N. I. (1993), *Statistical analysis of circular data*, Cambridge University Press —
  justificación de la codificación seno/coseno para `aspect` y `wind_direction`.
- Hollander, M., Wolfe, D. A. y Chicken, E. (2014), *Nonparametric statistical methods* (3.ª ed.),
  Wiley — justificación de Spearman sobre Pearson.
- O'Brien, R. M. (2007), "A caution regarding rules of thumb for variance inflation factors",
  *Quality and Quantity* 41, 673–690 — interpretación de los umbrales de VIF.
- Chawla, N. V. et al. (2002), "SMOTE: synthetic minority over-sampling technique", *JAIR* 16,
  321–357; He, H. et al. (2008), "ADASYN", *IEEE IJCNN*; King, G. y Zeng, L. (2001), "Logistic
  regression in rare events data", *Political Analysis* 9(2), 137–163 — citadas de cara al cuaderno de
  modelos, para justificar las técnicas de balanceo que exige el enunciado.

### 8.9 Convenciones de organización de archivos

Los artefactos que genera cada sesión de trabajo (notebooks nuevos, datasets intermedios, figuras,
exports de entorno) van dentro de `ml presentación/proceso/`, no sueltos en la raíz de
`ml presentación/`. La raíz se deja para los archivos originales del proyecto: el dataset crudo, los
PDF, los `.tex` de E1/E2, y este documento de contexto. Si se crea un cuaderno nuevo (por ejemplo el
de modelos de la sección 8.7), también va en `proceso/`, y debe referenciar el dataset crudo con ruta
relativa `../Dataset_Mundial_Final(2).csv` si lo necesita, o preferiblemente partir directo de
`dataset_eda_corregido.csv` que ya está en la misma carpeta.

### 8.10 Skills de Claude Code instalados en este proyecto

Ambos instalados con alcance de proyecto (sin `--global`), en `.claude/skills/` dentro de
`ModelSolar/`, revisados antes de instalar:

- `humanizer` (`blader/humanizer`): reescribe prosa para quitar marcas de texto generado por IA
  (negritas decorativas, rayas largas como conector universal, tríadas forzadas, cierres dramáticos de
  una línea). Se aplicó a todo el texto markdown del EDA corregido.
- `i-have-adhd` (`ayghri/i-have-adhd`): reformatea las respuestas del chat para ir directo a la acción,
  con pasos numerados y sin preámbulo ni cierre. Tiene `disable-model-invocation: true`, o sea que no
  se activa solo: hay que escribir `/i-have-adhd` o pedirlo explícitamente, y se apaga diciendo "stop
  adhd mode". No se usa para la prosa del notebook, que necesita explicar, no resumir en pasos.

Ninguno de los dos se usa dentro del propio dataset o de los cálculos: son herramientas de escritura y
de interacción, no de análisis.

---

## 9. Línea nueva: del clima a la generación real (Colombia), sesión 2026-10-02

El usuario pidió explícitamente priorizar la innovación sobre el enunciado. La rama de las 140 corridas sobre `solar_aptitude` quedó sin avanzar. Si la Entrega 3 sigue contando para nota, esa rama hay que reabrirla.

### 9.1 Por qué cambió el enfoque

La idea original era predecir la aptitud solar desde el clima para tener algo general. Con el índice del dataset no se puede, por una razón de construcción: el índice se calcula solo con pendiente, orientación, sombra y curvatura, y el clima no entra en la fórmula. Se midió con HistGradientBoosting (57,976 filas, bloques de 5°):

| Predictoras | R² bloques | F1 macro bloques |
|---|---|---|
| Clima (6 variables) | 0.198 | 0.421 |
| Clima + topografía | 0.509 | 0.738 |
| Topografía + lat/lon | 0.900 | 0.885 |

Dentro de cada región el R² del clima sobre el índice es casi cero (de -0.02 a 0.15), y en leave-region-out es negativo (de -0.5 a -5.6). Lo poco que predice a escala global es un proxy de la región.

Para `pv_potential` (modelado por Global Solar Atlas, no medido), clima más geometría solar da R² de 0.87 por bloques. Pero eso es aprender la fórmula física de un modelo, y en Colombia la señal desaparece sin `ghi` (R² de -0.05 con 371 plantas). Estas pruebas fueron rápidas, de sesión, y no están en ningún cuaderno todavía.

### 9.2 Fuentes de generación real revisadas

| Fuente | Resultado |
|---|---|
| ONS Brasil (factor de capacidad horario, CC-BY, CSV) | Probada con enero de 2025. Solo 68 entidades solares, 64 son conjuntos de varias plantas. 37 emparejadas a 2 km o menos con GEM. Pocas para modelar |
| XM Colombia (API pública) | Elegida. Generación horaria por planta y capacidad efectiva neta |
| Coordinador Eléctrico de Chile | La búsqueda dice que hay generación horaria por central. No se probó |
| IDEAM, promedios mensuales de radiación medida (datos.gov.co) | Existe. Son estaciones, no plantas. Pendiente de usar |
| CENACE México | No apareció generación por central solar |
| BSRN | Radiación de alta precisión, pocas estaciones. No se confirmó cuáles hay en Latinoamérica |

Hechos de la API de XM (verificados probándola): base `https://servapibi.xm.com.co/`, sin clave. `lists` con `ListadoRecursos` entrega 2,474 recursos con tipo, fuente, estado y fecha de inicio. `hourly` con `Gene` entrega generación horaria por recurso en kWh. `daily` con `CapEfecNeta` entrega capacidad efectiva neta en kW. El máximo es de 30 días por consulta. No entrega coordenadas. Hay 2,213 recursos solares y unos 2,020 son autogeneradores o generación distribuida. Con al menos 1 MW de capacidad el 15 de febrero de 2026 hay 27 plantas con generación. La licencia de los datos no se verificó. El concurso "Liga Solar XM 2026" es un ejercicio de clase que predice la generación nacional total, no un dataset oficial.

### 9.3 El cuaderno `proceso/Clima_a_Generacion_Colombia.ipynb`

Pregunta: ¿cuánto de la variación diaria de la generación de una planta solar colombiana se explica con el clima de ese día?

Corte de tiempo: del 1 de enero de 2024 al 28 de febrero de 2026. El fin es el mes del release de GEM que usa el paper. El inicio es decisión nuestra. El paper usa Global Solar Atlas del período 2018-2024 y no dice qué años promedia ERA5.

Emparejamiento: 10 de 27 plantas de XM con coordenadas de GEM, decididas a mano por nombre y capacidad, cada una con su motivo dentro del cuaderno. Casos que se verificaron con fuente externa: el parque Fundación de Enel está en Pivijay (Magdalena), que coincide con la fila operando de GEM (10.463, -74.616) y no con la fila de pre-construcción en el municipio de Fundación (10.518, -74.182). Guayepo tiene 370 MW en XM y 486.7 MW en GEM. Alma II quedó con 8 días útiles tras excluir el arranque y sale de la evaluación. Quedan 9 plantas, 4,505 filas y 5 grupos de cercanía (menos de 100 km).

Clima: Open-Meteo, API histórica. Su modelo por defecto (`best_match`) combina IFS HRES, ERA5 y ERA5-Land según su documentación, y en las pruebas cayó en una celda de unos 3 km. `era5` cae en celdas de 0.25°. El cuaderno usa los dos.

Resultados, con el nivel de cada planta conocido (mediana de R² dentro de planta, validación dejando fuera grupos de plantas cercanas, IC95 remuestreando plantas):

| Variables | R² mediana | IC95 |
|---|---|---|
| Radiación `era5` | 0.410 | 0.29 a 0.50 |
| Radiación `best_match` | 0.505 | 0.40 a 0.57 |
| Física con temperatura de celda | 0.488 | 0.39 a 0.57 |
| Radiación y nubosidad | 0.503 | 0.41 a 0.59 |
| Todas (rad, nube, temp, humedad, viento) | 0.511 | 0.41 a 0.60 |
| Solo nubosidad | 0.175 | 0.12 a 0.20 |

- El 83 % de la varianza del factor de capacidad es de un día a otro dentro de la planta, y el 17 % es entre plantas.
- Cada kWh/m² de radiación diaria suma unos 4.9 puntos de factor de capacidad.
- El error baja un 31 % frente a predecir el nivel de la planta y un 32 % frente a repetir el valor de ayer.
- `best_match` gana a `era5` en las 9 plantas.
- Con el nivel calculado solo con la primera mitad de los días, la mediana es 0.513, pero La Loma cae a -0.41.
- No se puede afirmar que la nubosidad explique algo además de la radiación. El diseño no separa esos efectos.

### 9.4 Revisión metodológica y qué se cambió

La revisión se hizo con tres subagentes que siguieron los roles de metodología, dominio y abogado del diablo del skill `academic-paper-reviewer`. Es una revisión por roles, no el contrato completo de cinco asientos del skill. Sus cifras las calcularon ellos. Lo que se verificó o implementó en el cuaderno:

| Hallazgo | Qué se hizo |
|---|---|
| La capacidad del día 15 de cada mes movía el nivel de las plantas | Capacidad efectiva neta diaria |
| Los primeros días de una planta son puesta en marcha | Se excluyen 60 días en plantas con arranque observado, con sensibilidad a 0 y 90 |
| Plantas cercanas comparten clima el mismo día | Validación por grupos de menos de 100 km |
| Medianas de R² sin intervalo | IC remuestreando plantas, diferencias pareadas con Wilcoxon |
| Centrar con todos los días supone conocer el nivel | Prueba temporal con el nivel de la primera mitad |
| No había línea base física | Radiación con temperatura de celda (NOCT) y plano inclinado como referencia |
| El modelo de clima no estaba fijado | Se piden `era5` y `best_match` por separado |
| Filtrar días raros por el residuo sesga el R² | El filtro por FC bajo es solo sensibilidad |

No se implementó: bootstrap por bloques de fecha con todas las plantas a la vez, ni la comparación con radiación medida. Un revisor sospechó que Fundación estaba mal emparejada. La sospecha se descartó con fuentes de Enel y pv magazine LATAM.

### 9.5 Referencias

Están en `proceso/referencias.bib` y al final del cuaderno, verificadas el 2026-10-02. Dos DOI que se recordaban mal se corrigieron con Crossref: Skoplaki y Palyvos (2009) es `10.1016/j.solener.2008.10.008` y Reich et al. (2012) es `10.1002/pip.1219`. El paper del dataset tiene versión en revista, *Eng* 7(7):343 (2026), `10.3390/eng7070343`, con cuatro autores en Crossref. El preprint de arXiv (2603.20601) lista seis. Hay estudios de sesgo de ERA5 en cielos nublados (Urraca et al., 2018), pero no se encontró uno verificable para los Andes colombianos ni la costa Caribe. Antes de citar cualquier fuente en el informe final hay que leer el texto completo, porque se verificó con título y resumen.

### 9.6 Decisiones abiertas de esta línea

1. Conseguir coordenadas de las 17 plantas de XM sin emparejar, con una fuente por cada una.
2. Comparar la radiación modelada con radiación medida (IDEAM) o satelital.
3. Pasar a datos horarios y a un índice de claridad para abordar la pregunta de las nubes.
4. Conseguir la tecnología de cada planta (seguidor o fija, relación DC/AC).
5. Decidir si esta línea reemplaza o complementa la rama de las 140 corridas.
6. `nota_asistencia_ia.md` dice que "Sonnet 5.5" no existe. En este entorno el modelo es Sonnet 5.5 (`claude-sonnet-5-5`). La nota no está corregida. El usuario dijo que no va a la sustentación.

### 9.7 Actualización: 16 plantas, EDA de la base y modelos preliminares

Esta subsección reemplaza las cifras de 9.3, que eran de 9 plantas.

Siete plantas más se ubicaron con la ficha pública de GEM, contrastada con prensa o con el desarrollador: Bosques Solares de los Llanos 4 y 5 (Puerto Gaitán, Meta), BSB 503 y 504 (Bosques Solares de Bolívar, Sabanalarga, Atlántico), La Unión (Montería), Portón del Sol (La Dorada) y Sunnorte (Ocaña). Se descartaron Palmira II, porque su ubicación no se confirmó, y Shangri-La, porque sus coordenadas en GEM caen unos 230 km al este de Ibagué y contradicen su propia ficha.

La base `proceso/tabla_diaria_colombia.csv` tiene ahora 8,589 filas planta-día, 23 columnas, 16 plantas y 6 zonas, del 2024-01-01 al 2026-02-28. No tiene valores vacíos fuera de `fc_ayer`. Los días sin generación en XM van de 0 a 24 por planta. `proceso/plantas_colombia.csv` tiene una fila por planta con coordenadas, fuente, precisión y el estado de la tecnología. El cuaderno incluye un diccionario de variables y un EDA (sección 6b).

Resultados con 16 plantas:
- Radiación `best_match` con el nivel de la planta conocido: mediana de R² dentro de planta 0.49 (IC95 de 0.38 a 0.51). Por planta va de 0.09 (Sunnorte) a 0.59.
- El 84 % de la varianza del factor de capacidad es día a día y el 16 % es entre plantas.
- Pendiente: 4.7 puntos de FC por kWh/m².
- `best_match` gana a `era5` en 13 de 16 plantas.
- Modelos del curso, con el nivel calculado con el pasado y el escalado dentro de cada partición: lineal, Ridge y Lasso 0.47, KNN 0.40, SVR 0.36, HistGradientBoosting 0.38.

Pendiente: la tecnología de cada planta. Ninguna de las 16 tiene el montaje confirmado (seguidor o fija) y solo 3 tienen la potencia DC con fuente. Se detuvo esa investigación para ahorrar uso.

Cuaderno nuevo: `proceso/Benchmark_Modelos_Base.ipynb`. Corre los modelos base del curso sobre `dataset_eda_corregido.csv`:
- Clasificación: regresión logística, Naive Bayes, KNN, SVM lineal y SVM RBF.
- Regresión: Ridge, Lasso, KNN, SVR lineal y SVR RBF.

Usa bloques de 5° frente a partición aleatoria, con y sin lat/lon, y deja una región completa fuera. La imputación y el escalado van dentro del `Pipeline`. Es el núcleo de la presentación, que según el usuario es el problema, el EDA y los modelos base.

`pypdf` 6.19.0 se instaló en `solarpv-eda` para leer el enunciado. `environment.yml` no se actualizó.

### 9.8 Benchmarks con ajuste y resumen final (2026-10-02)

Los dos benchmarks (`Benchmark_Modelos_Base.ipynb` y `Benchmark_Colombia.ipynb`) tienen ahora más métricas: AUC uno contra el resto, precisión y recall macro, F1 de la clase Baja, kappa ponderado, RMSE y MAE. También tienen ajuste de hiperparámetros con validación anidada: por bloques en la base mundial, y por zona y tiempo en Colombia.

Mejores modelos ajustados:

| Base | Tarea | Mejor modelo | Resultado |
|---|---|---|---|
| Mundial | Clasificación | SVM RBF | F1 0.818, AUC 0.960 |
| Mundial | Regresión | SVR RBF | R² 0.806 |
| Colombia | Regresión | Lasso | R² 0.469 |
| Colombia | Clasificación | Logística y SVM RBF | F1 0.572 |

Los cuatro cuadernos terminan con el mismo "Resumen final". Incluye la recolección, el EDA, el diseño, los modelos y las métricas, cada uno con su justificación y su referencia verificada. También trae resultados, una tabla comparativa, la interpretación con propuestas de mejora según la literatura, conclusiones, limitaciones, referencias y un glosario. La figura comparativa es `proceso/fig_resumen_comparativa.png`.
