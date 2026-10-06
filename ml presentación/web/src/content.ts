// Textos copiados literalmente de "ml presentación/proceso/EDA_Corregido(Entregable 3).ipynb".
// El número entre corchetes es el índice de la celda de origen. No se reescriben ni se resumen.

export const NOTEBOOK_URL =
  'https://github.com/AlexT09/ModelSolar/blob/main/ml%20presentaci%C3%B3n/proceso/EDA_Corregido(Entregable%203).ipynb';

// ---------------------------------------------------------------------------------------------
// Apertura: textos literales de "ml presentación/exposicion/main.tex" (sin el formato de LaTeX),
// diapositivas "El problema", "Nuestra solución planteada", la diapositiva de mensaje,
// "La pregunta" y "De dónde salen los datos". De esa exposición solo se toma la apertura: las
// cifras de resultados de sus diapositivas finales no coinciden en todo con los cuadernos, así que
// los resultados de la web salen de los cuadernos.
// ---------------------------------------------------------------------------------------------
export const EXPO = 'ml presentación/exposicion/main.tex';

export const PROBLEMA = [
  'Colombia y el mundo están instalando plantas solares a gran velocidad. Elegir **dónde** construir define cuánta energía producirá la planta durante décadas.',
  'Un dataset reciente (Mantilla-Guerra et al., 2026) ofrece un **índice de aptitud solar** para 58,978 plantas del mundo.',
  'Queríamos usarlo para predecir la aptitud de un lugar a partir de su clima.',
];
export const ENCONTRAMOS =
  'El índice se calcula solo con el terreno, depende de la región y de cómo se procesaron los datos, y no se puede predecir desde el clima ni transferir entre continentes.';

export const LINEAS = [
  {
    title: 'Línea 1: auditar el índice',
    items: [
      'EDA corregido de la base mundial.',
      'Modelos base del curso con validación espacial y ajuste anidado.',
      'Medir si el índice se transfiere entre regiones.',
    ],
  },
  {
    title: 'Línea 2: generación real',
    items: [
      'Base propia: generación horaria real de 16 plantas en Colombia (XM) y su clima (Open-Meteo).',
      'Medir cuánto explica el clima la producción real.',
      'Mismos modelos, sin data leakage.',
    ],
  },
];

export const MENSAJE = ['El índice de aptitud mide la región, no el clima.', 'Con datos reales, el clima explica la mitad de la producción diaria.'];

export const PREGUNTA = [
  'Idea inicial: predecir qué tan apto es un lugar para una planta solar **a partir del clima**, para que sirva en cualquier parte.',
  'Dataset: Mantilla-Guerra et al. (2026), *Eng* 7(7):343. 58,978 plantas fotovoltaicas del mundo, 29 columnas.',
  'Variable objetivo: índice de aptitud solar (IAS) de 0 a 1, y su versión en tres clases: Baja, Media y Alta.',
  'Dos tareas: clasificación de la clase y regresión del índice.',
];

export const FUENTES: [string, string][] = [
  ['Global Energy Monitor (febrero 2026)', 'Ubicación, capacidad y estado de cada planta'],
  ['Global Solar Atlas', 'Irradiación y potencial fotovoltaico'],
  ['ERA5 y NASA POWER', 'Temperatura, humedad y viento (promedios anuales)'],
  ['Modelos de elevación (DEM)', 'Elevación, pendiente, orientación y curvatura'],
  ['OpenStreetMap', 'Distancia a carretera y área de la planta'],
];
export const FUENTES_NOTA =
  'Para la segunda parte construimos una base propia con **XM** (generación real horaria en Colombia) y **Open-Meteo** (clima por hora).';

// [0]
export const TITLE ='EDA corregido: aptitud solar fotovoltaica (Entrega 3)';
export const COURSE = 'Proyecto final, Machine Learning, Pregrado en Ciencia de Datos.';
export const AUTHORS =
  'Integrantes: Jesús David Arévalo Montilla, Enmanuel David Díaz Molinares, Alex David Terán Meza.';
export const DATASET =
  'Dataset: *Global Dataset of Solar Power Plants* (Mantilla-Guerra et al., 2026, arXiv:2603.20601), disponible en [`cimejia/solarPV`](https://github.com/cimejia/solarPV).';

export const INTRO_A = `Este cuaderno retoma el EDA de la Entrega 1 y corrige los hallazgos que la guía de la Entrega 3 (sección 7.1) marca como errores críticos.
Antes de entrenar los 140 modelos de clasificación y regresión hacen falta tres cosas: un target bien definido, los problemas de calidad de datos
tratados y no solo contados, y un esquema de validación cruzada que sirva para este dataset.

El paper define la aptitud solar con la ecuación 1 (página 11):`;

export const FORMULA = [
  { name: 'Slope', w: 0.4 },
  { name: 'Aspect', w: 0.25 },
  { name: 'Hillshade', w: 0.2 },
  { name: 'Curvature', w: 0.15 },
];

export const INTRO_B = `Las cuatro capas de entrada se clasificaron según FAO (1976) para la pendiente y Wilson y Gallant (2000) para la curvatura, y se combinaron con
una ponderación tipo AHP (Saaty, 1980), el mismo método jerárquico de criterios que usan los propios autores del dataset. El índice sale entonces
solo del terreno: no entran irradiancia, temperatura, viento ni humedad. Lo usamos igual, porque el curso pide un target de clasificación y uno de
regresión y esta variable sirve para los dos: continua para regresión (\`solar_aptitude\`) y discretizada en Baja, Media y Alta para clasificación
(\`solar_aptittude_class\`). Eso sí, al llamarlo "aptitud solar" hay que aclarar que mide terreno. Eso se desarrolla con evidencia en la sección 9.`;

// [4] y [7]
export const CARGA = `La Entrega 1 describió la carga con \`pandas.read_excel\` sobre un archivo \`.xlsx\`, pero el archivo del proyecto es un CSV con separador \`;\`, decimal \`,\` y BOM UTF-8.
Con los parámetros por defecto de pandas, esas tres cosas dan una sola columna de texto en vez de 29 columnas numéricas, así que el ETL de la Entrega 1 no se podía
reproducir con nuestros datos.

Solo \`area\` tiene nulos, el 27.7 % de sus filas. El resto del esquema carga limpio. La Entrega 1 daba por buena toda la tabla sin mencionar este hueco.
El motivo del faltante se explica en D6, más abajo, junto con las razones para no imputarlo.`;

// [9]
export const OBJETIVO = `\`solar_aptitude\` va de 0 a 0.942, con media 0.68. Con los umbrales 0.4 y 0.6 que define el paper (sección 2.4.6), la clase Alta tiene el 75 % de las plantas,
Media el 22 % y Baja apenas el 3 %. Una explicación probable es que la mayoría de las plantas ya estén en terrenos que el índice califica como favorables,
porque quien construye una planta solar suele revisar primero la pendiente. Falta explicar de dónde sale la clase Baja, que es el tema de la sección 9.`;

// [12]
export const CALIDAD_INTRO = `La Entrega 1 reportó "una única violación" en la validación de rangos. Al revisar con más cuidado encontramos catorce problemas, cada uno con una causa
identificable en la metodología del paper (secciones 2.4.3 a 2.4.6). Los numeramos de D1 a D14 para referirnos a ellos cuando decidimos qué hacer con cada predictora.`;

// Tratamiento según la celda [55]: D1, D2 y D8 se eliminan; D3, D4, D5 a D7 y D12 se resuelven con
// variables derivadas. El resto queda documentado en su propia celda.
export type Treatment = 'Filas eliminadas' | 'Variables derivadas' | 'Documentado';

export interface Issue {
  id: string;
  title: string;
  treatment: Treatment;
  output: string; // salida impresa por el cuaderno, literal
  text: string;
}

export const ISSUES: Issue[] = [
  {
    id: 'D1',
    title: 'Filas sin cobertura de DEM',
    treatment: 'Filas eliminadas',
    output: `Filas sin cobertura de DEM: 64
Todas con clase 'Baja': True
Proporción de la clase Baja total que representan: 3.4%`,
    text: `El modelo digital de elevación (DEM) que usa el paper viene organizado por continente y con
resolución de 9 arco-segundos. Fuera de esa cobertura, \`slope\`, \`aspect\`, \`curvature\` y \`elevation\`
quedan en cero, y como esas cuatro variables alimentan directamente la ecuación 1, el IAS también
sale en cero, lo que la clasifica como Baja sin que eso diga nada real sobre el terreno.

Son casi todas islas pequeñas (Reunión, Mauricio, Cabo Verde), donde el DEM regional no tiene resolución suficiente. Su clase Baja viene de la falta de dato
de terreno. Las eliminamos en lugar de imputarlas.`,
  },
  {
    id: 'D2',
    title: 'Filas sin cobertura de raster GSA',
    treatment: 'Filas eliminadas',
    output: `Filas con ghi=pv_potential=0: 3
Filas adicionales con wind_speed=0: 2`,
    text: `Lo mismo pasa con el raster del Global Solar Atlas que alimenta \`ghi\` y \`pv_potential\`. Cuando no hay
cobertura, ambas quedan en cero en vez de en nulo, lo que las hace indistinguibles de un valor real
bajo si no se revisan a mano.`,
  },
  {
    id: 'D3',
    title: '`aspect = -1`',
    treatment: 'Variables derivadas',
    output: `aspect = -1: 1105 filas (1.87%)
  Coincide con aspect_type == 'Flat': 100.0%
  Coincide con slope == 0: 100.0%`,
    text: `El paper usa -1 para marcar terreno plano, donde la orientación no está definida. Lo confirmamos cruzando con la columna categórica y con la pendiente.

Coincide al 100 % con ambas condiciones, así que el -1 es un centinela consistente y se trata como una categoría propia, y no como un ángulo de 359 grados.
La sección 5 crea el indicador binario \`is_flat\` para eso.`,
  },
  {
    id: 'D4',
    title: '`dist_to_road` con valores que no caben en la metodología',
    treatment: 'Variables derivadas',
    output: `  filas con dist_to_road > 6.31 km: 7538
  filas con dist_to_road > 20 km: 1723
  filas con dist_to_road > 100 km: 65`,
    text: `El paper calcula esta distancia con la red vial de Sudamérica (GEOFABRIK) proyectada en "South
America Albers Equal Area", y admite en el texto que fuera de esa cobertura el cálculo se hizo de
forma genérica. Su propio máximo reportado es 6.31 km. En el CSV hay filas muy por encima de eso.

El máximo real es 2,296 km, en Pakistán, un país fuera de Sudamérica. Eso coincide con lo que el paper
mismo advierte: fuera de la región para la que se calibró la red vial, la distancia pierde sentido
físico. Tratamos más de 100 km como error de cálculo y lo convertimos en nulo en la sección 5, en vez
de dejarlo entrar al modelo como si fuera una distancia real.`,
  },
  {
    id: 'D5',
    title: '`area` incoherente con `capacity`',
    treatment: 'Variables derivadas',
    output: `Plantas con densidad > 300 W/m²: 23999
area máxima registrada: 234,700,000.0 m²`,
    text: `Una planta solar típica instala entre 40 y 100 vatios por metro cuadrado, con un techo físico
alrededor de 200. Si dividimos \`capacity\` entre \`area\`, buena parte del dataset queda muy por encima
de eso.

La explicación más probable está en el procedimiento del paper: \`area\` sale de unir cada coordenada con el polígono de OpenStreetMap más cercano etiquetado
como instalación solar. Si el punto cae sobre un solo panel o sobre un techo y no sobre la planta completa, el área queda diminuta y la densidad se dispara.
Un error que viene del método de unión se repite de forma sistemática en todo el dataset, así que \`area\` no sirve para medir el tamaño de una planta.`,
  },
  {
    id: 'D6 y D7',
    title: '`area` faltante y lo que ese faltante revela',
    treatment: 'Variables derivadas',
    output: `NaN en area: 16329 (27.69%)
area_na   Baja  Media  Alta
False      3.9   26.6  69.5
True       1.4    8.9  89.7`,
    text: `Cuando \`area\` falta, el 90 % de esas plantas son clase Alta, frente al 70 % cuando hay dato, así que el faltante depende de la clase. La columna \`size\` asigna
"Small" a las 16,329 filas sin área y mezcla plantas pequeñas de verdad con plantas a las que no se les pudo calcular el área. Por eso \`size\` tampoco sirve tal como viene en el dataset.`,
  },
  {
    id: 'D8',
    title: 'Duplicados',
    treatment: 'Filas eliminadas',
    output: `Duplicados exactos (fila completa, incluye ID): 0
Duplicados de atributos (sin ID/código/nombre): 1598
Filas con coordenadas repetidas: 9894 en 3064 grupos
Grupos de coordenada con más de una clase distinta: 8`,
    text: `La Entrega 1 afirmó que no había duplicados. Revisando atributos completos, sin contar el
identificador, el nombre o el código, la afirmación no se sostiene.

Ninguna fila es idéntica a otra en todas las columnas, así que buscar duplicados exactos da cero, que es lo que dijo la Entrega 1. Al excluir solo las columnas de
identificación aparecen más de 1,500 filas que comparten todo lo demás, y casi 10,000 filas comparten coordenada con al menos otra planta. En ocho de esos grupos la misma
coordenada tiene dos clases distintas, de modo que parte del ruido viene de cómo se construyó el dataset y no del terreno.`,
  },
  {
    id: 'D9 y D10',
    title: 'Ruido en el propio target',
    treatment: 'Documentado',
    output: `solar_aptitude ≈ 0.4: 16 filas -> {'Media': 12, 'Baja': 4}
solar_aptitude ≈ 0.6: 506 filas -> {'Alta': 267, 'Media': 239}
Inconsistencias de redondeo en solar_aptitude_rounded: 255 de 58,978 filas`,
    text: `Justo en los cortes hay filas con el mismo valor de IAS en clases distintas, porque la discretización se hizo antes de redondear a tres decimales. Ese ruido de etiqueta
no se corrige limpiando: queda documentado como un límite al desempeño de cualquier modelo cerca de 0.4 y 0.6. Además \`solar_aptitude_rounded\` tiene 255 inconsistencias de
redondeo, así que se queda fuera de las predictoras y de los targets.`,
  },
  {
    id: 'D11',
    title: '`wind_speed` sesgada a la baja',
    treatment: 'Documentado',
    output: `mean    0.992144
50%     0.777000
max    12.755000`,
    text: `El paper calcula esta variable a partir de los componentes zonal y meridional del viento (\`u10\`, \`v10\`), ya promediados por mes, antes de obtener la rapidez.
Al promediar direcciones opuestas dentro del mismo mes se cancela parte de la magnitud real del viento. Lo que queda es la magnitud del viento vectorial medio anual, que por construcción
es menor que la velocidad media del viento en el sitio, así que no debe leerse como la medición de un sensor.`,
  },
  {
    id: 'D12',
    title: 'Redundancia categórica',
    treatment: 'Variables derivadas',
    output: `slope_type              min     max  count
Plano o casi plano    0.000   2.000  46766
Suave                 2.000   5.000   8523
Moderado              5.001   9.989   2906
Fuerte               10.003  14.985    562
Muy fuerte           15.004  28.986    217
Escarpado o abrupto  30.180  34.682      4`,
    text: `\`slope_type\`, \`curvature_type\`, \`aspect_type\` y \`dt_wind\` son clasificaciones derivadas de su
variable numérica correspondiente, con rangos que no se solapan.

Incluir la versión numérica y la categórica como predictoras separadas no añade información nueva,
solo infla la dimensionalidad y, en modelos lineales, el VIF. Usamos la numérica y descartamos su
versión categórica.`,
  },
  {
    id: 'D13',
    title: 'Los máximos del paper no coinciden con los del CSV',
    treatment: 'Documentado',
    output: `area          máx. CSV = 234,700,000.0 | máx. paper = 153,488.0
dist_to_road  máx. CSV =   2,295,655.3 | máx. paper =   6,309.7
capacity      máx. CSV =      25,000.0 | máx. paper =      57.5`,
    text: `En las tres variables, el CSV tiene filas muy por encima del máximo que reporta el paper en su propia
sección 3. La explicación más simple es que las figuras del artículo están filtradas o recortadas
antes de graficarse, mientras que el CSV público no pasó por ese mismo filtro. Al citar los valores
del paper hay que aclarar esa diferencia.`,
  },
  {
    id: 'D14',
    title: 'Clima de baja resolución en algunos países',
    treatment: 'Documentado',
    output: `Argentina  n=  64  humidity únicos=  4  wind_direction únicos=  5
Colombia   n= 371  humidity únicos= 18  wind_direction únicos= 19
Chile      n= 319  humidity únicos= 29  wind_direction únicos= 26`,
    text: `Argentina tiene 64 plantas pero solo 4 valores distintos de humedad. El clima sale de promedios mensuales de ERA5 con resolución espacial gruesa, así que dentro de estos
países decenas de plantas comparten casi el mismo valor de "clima". Hay que tenerlo en cuenta al interpretar la importancia que SHAP le dé a estas variables en los experimentos.`,
  },
];

// [55], [58], [60], [63]
export const LIMPIEZA_A = `Eliminamos las filas centinela de D1 y D2, y deduplicamos atributos de D8. El resto de los problemas
(D3, D4, D5 a D7, D12) se resuelven con variables derivadas, no borrando filas, porque en esos casos
la fila sigue teniendo información real en sus demás columnas.`;
export const LIMPIEZA_B = `El cambio es pequeño: la limpieza quita 1,002 filas de 58,978 y Baja pasa de 3.21 % a 3.15 %. El desbalance sigue ahí. Lo que se gana es sacar de la clase Baja
un 3.4 % de casos que eran falta de datos de terreno.`;
export const LIMPIEZA_C = `Pasamos \`aspect\` y \`wind_direction\` a seno y coseno porque 1 y 359 grados son casi el mismo punto en la brújula, y como números están casi tan separados como es posible (Fisher, 1993).
Con el ángulo crudo, un modelo lineal o una prueba de Kruskal-Wallis los trata como extremos opuestos.

Aun en escala logarítmica, ambas variables conservan una cola larga de valores extremos. Va con lo que vimos en D4 y D5: la distribución mezcla mediciones buenas con valores mal calculados.`;

// [64], [66]
export const GEO_A = `En vez de mirar latitud y longitud por separado, miramos dónde cae cada clase en el mapa, que es donde aparece el patrón de la sección 9.`;
export const GEO_B = `La clase Baja (naranja) no se reparte de forma pareja por el mapa: se concentra casi toda en una
franja alrededor de Europa. Si el IAS midiera solo pendiente, orientación, sombra y curvatura, no
habría razón geográfica para eso. Volvemos sobre este punto con números en la sección 9.`;

// [70]
export const TOPO = `Pendiente y curvatura están casi todas pegadas a cero: la inmensa mayoría de las plantas se construye
en terreno plano, algo lógico porque nivelar terreno inclinado cuesta dinero. El gráfico de
orientación en seno y coseno no tiene forma de anillo perfecto: hay más densidad hacia el sur, que es
la orientación que más sol recibe en el hemisferio norte, donde está la mayoría de las plantas.`;

// [73], [75], [77]
export const BIVAR_A = `La Entrega 1 usó correlación de Pearson sobre variables de cola pesada (\`area\`, \`dist_to_road\`) y
circulares (\`aspect\`, \`wind_direction\`) sin transformar. Pearson asume relaciones lineales y es
sensible a valores extremos, justo lo que sobra en esas columnas (Hollander, Wolfe y Chicken, 2014). Aquí
usamos Spearman, que trabaja sobre rangos y no asume linealidad, junto con las versiones seno y
coseno de las variables circulares.`;
export const BIVAR_B = `La correlación más fuerte con \`solar_aptitude\` es con \`longitude\`, y no con alguna de las cuatro variables de la ecuación 1. El índice no se comporta como dice su fórmula,
y ese es el hilo que seguimos en la sección 9.`;
export const BIVAR_C = `Dentro de cada región los puntos muestran una tendencia negativa leve: más pendiente, menos aptitud, como cabe esperar. Las tres nubes de puntos están a alturas distintas
en el eje vertical y ninguna relación conecta una región con otra. Un desplazamiento entre lotes de procesamiento sería consistente con este patrón.`;

// [79], [81]
export const VIF_A = `El VIF mide cuánta varianza de una variable explica una combinación lineal del resto. Un valor por
encima de 5 suele tomarse como señal de colinealidad relevante, y por encima de 10 como señal fuerte,
aunque ese umbral de 10 es una convención sin base estadística firme y conviene tratarlo como guía, no
como regla dura (O'Brien, 2007).`;
export const VIF_B = `Todas las predictoras quedan muy por debajo de 5, con \`const\` como la única excepción esperable
porque mide la varianza explicada por el intercepto, no por una variable real. Eso confirma que la
codificación seno y coseno no introdujo colinealidad extra, y que las 13 variables del cálculo pueden
entrar juntas a un modelo lineal sin que la multicolinealidad distorsione sus coeficientes.`;
// Salida de la celda [80]
export const VIF_TABLE: [string, number][] = [
  ['const', 324.460955],
  ['latitude', 3.297794],
  ['longitude', 1.291383],
  ['elevation', 2.020055],
  ['slope', 1.245021],
  ['curvature', 1.009808],
  ['aspect_sin', 1.002695],
  ['aspect_cos', 1.014385],
  ['wind_sin', 1.195565],
  ['wind_cos', 1.067302],
  ['ambient_temperature', 3.063978],
  ['humidity', 2.203298],
  ['wind_speed', 1.667194],
  ['ghi', 3.603113],
];

// [82], [84], [87], [90], [92]
export const S9_A = `Esta sección corrige tres afirmaciones de las entregas anteriores: que el IAS mide terreno y clima juntos, que la clase Baja se concentra en cuatro países europeos y que su dominancia
por longitud se debe a sesgo de muestreo.`;
export const S9_SPEARMAN_OUT = `Spearman(solar_aptitude, variables de la ecuación 1):
  slope      r=-0.066  p=2.15e-57
  curvature  r=-0.031  p=1.01e-13
  aspect     r=+0.007  p=7.61e-02  (excluyendo el centinela -1)

  longitude  r=+0.583  p=0.00e+00
  latitude   r=-0.331  p=0.00e+00`;
export const S9_B = `La pendiente y la curvatura correlacionan muy poco con el IAS, y la orientación casi nada. La longitud correlaciona casi diez veces más fuerte que la pendiente,
aunque no entra en la fórmula del índice.`;
export const S9_C = `Asia y Oceanía tienen una media de IAS casi 0.17 puntos por encima de las otras dos regiones, y casi no tienen clase Baja. Europa, África y Medio Oriente concentran la gran
mayoría de la clase Baja. Esto corrige a la Entrega 1, que atribuía la clase Baja a cuatro países europeos: son siete los que suman la mayoría, y el patrón es regional y no nacional.`;
// Salida de la celda [89]
export const R2_CV = [
  { label: 'R² CV, HistGradientBoosting, solo topografía', mean: 0.184, sd: 0.005 },
  { label: 'R² CV, HistGradientBoosting, + latitud/longitud', mean: 0.906, sd: 0.002 },
];
export const S9_D = `Con solo las cuatro variables que la ecuación 1 declara, un modelo no lineal apenas explica el 18 % de
la varianza del IAS. Añadir dos coordenadas geográficas, que no aparecen en la fórmula, lo sube a 91
%. La mayor parte de lo que el modelo aprende no viene de la topografía declarada.`;
// Salida de la celda [91]
export const R2_LORO = [
  { region: 'Asia/Oceanía', r2: -7.343 },
  { region: 'Europa/África/M.Oriente', r2: -0.126 },
  { region: 'Américas', r2: -2.26 },
];
export const S9_E = `Un R² negativo significa que el modelo predice peor que el promedio de la región de prueba. Entrenado en dos regiones y probado en la tercera, con diez variables numéricas disponibles,
el modelo falla por completo. Si el IAS reflejara una relación física estable entre terreno y aptitud, esa relación se transferiría entre continentes, y aquí no se transfiere.

La explicación más simple, que va con lo que describe el propio paper en su sección 2.4.3, es que el DEM se procesó por continente y cada lote se normalizó de manera independiente.
El repositorio oficial del dataset (\`cimejia/solarPV\`) apunta en la misma dirección: en una versión anterior del archivo, publicada antes de incorporar Europa, la clase Baja casi no
existía, con apenas 204 filas frente a las 1,892 actuales, y la gran mayoría de la clase Baja actual entró en el dataset junto con el lote europeo. El dataset sigue sirviendo para este
proyecto, con una condición: el IAS compara razonablemente bien plantas dentro de una misma región, y no es fiable para comparar entre regiones sin controlar ese efecto de lote.
La validación cruzada tiene que diseñarse con esto en mente.`;

// [93], [95]
export const S10_A = `Ninguna de las dos entregas anteriores usó partición espacial, aunque la primera la declaraba como palabra clave sin implementarla. Dado el hallazgo de la sección 9, una partición
aleatoria deja que coordenadas casi idénticas caigan una en entrenamiento y otra en prueba, lo que permite interpolación espacial pura y sobreestima el desempeño real del modelo.
Roberts et al. (2017) documentan este problema para datos con estructura espacial, temporal o jerárquica y recomiendan particionar por bloques en vez de al azar. El cuaderno de
referencia de los propios autores del dataset sigue la misma lógica, con \`GroupKFold\` sobre bloques de 0.5 grados.`;
export const S10_B = `Usamos 5 grados por lado en vez de los 0.5 del cuaderno de referencia porque ahí trabajan sobre un
subconjunto de Sudamérica con 7,000 filas, mientras que aquí el dataset es global y tiene casi 58,000.
Con bloques tan finos como 0.5 grados, el número de grupos distintos sería enorme y muchos quedarían
con una sola planta, lo que rompe la lógica de \`GroupKFold\`. Con 496 bloques de 5 grados, los cinco
pliegues quedan con un porcentaje de Baja parecido entre sí, entre 2.9 % y 3.8 %, así que ningún
pliegue se queda sin ejemplos de la clase minoritaria. Si en el cuaderno de modelos algún pliegue
resulta demasiado desbalanceado para un modelo específico, la alternativa es reducir el bloque a 2.5
grados o agrupar por país en su lugar.`;

// [96], [97], [98]
export const S11_A = `Una variable entra si está disponible antes de invertir en una coordenada cualquiera, si no es una copia determinista de otra variable ya incluida y si no arrastra un centinela
sin tratar. Por eso quedan fuera \`area\` y \`size\`, que son posteriores a la construcción de la planta y traen el problema de D5 a D7; los campos \`*_type\` y \`dt_wind\`, que son
discretizaciones de otras variables (D12); y \`capacity\` junto con \`operational_status\`, que solo existen después de decidir invertir.`;
export const PREDICTORS = [
  'latitude', 'longitude', 'elevation', 'slope', 'curvature',
  'aspect_sin', 'aspect_cos', 'is_flat', 'wind_sin', 'wind_cos',
  'log_dist_to_road', 'ambient_temperature', 'humidity', 'wind_speed', 'ghi',
];
export const S11_B = `Quedan 63 valores nulos, todos en \`log_dist_to_road\`, que vienen de las distancias mayores a 100 km
que tratamos como error en la sección 5. Son menos del 0.11 % de las filas, así que una imputación
simple por mediana dentro de cada pliegue de entrenamiento basta para el cuaderno de modelos, sin
necesidad de descartar esas filas.`;

// [100]
export const CONCLUSIONES = `El target no cambia respecto al planteado en la Entrega 2: \`solar_aptittude_class\` para clasificación y \`solar_aptitude\` para regresión, la misma variable en dos formas.
Cambia cómo la describimos y cómo la validamos.

En calidad de datos documentamos catorce problemas que la Entrega 1 no reportó o reportó de forma incompleta. El más importante para el curso es D8: la Entrega 1 decía que el
dataset no tenía duplicados, y hay más de 1,500 duplicados de atributos y casi 10,000 filas que comparten coordenada con alguna otra. D1, D2 y D5 a D7 muestran que varios huecos
del dataset no son aleatorios y vienen del método de construcción: cobertura incompleta de DEM y de GSA, y una unión punto-polígono que falla de forma sistemática al calcular \`area\`.

El hallazgo que más pesa es el de la sección 9. El IAS correlaciona casi diez veces más fuerte con la longitud que con la pendiente, aunque la pendiente pesa 40 % en la fórmula del índice
y la longitud no entra. Un modelo entrenado en dos macrorregiones falla por completo al predecir la tercera. El dataset sigue siendo útil para el curso, siempre que se diga qué mide el
índice: sobre todo el lote de procesamiento en que cayó cada planta, con una relación topográfica real pero secundaria dentro de cada región. Por eso la validación cruzada espacial de
la sección 10, con bloques de 5 grados y \`StratifiedGroupKFold\`, es un requisito.

Para los cuadernos de modelos esto deja tres consecuencias. Cualquier métrica con partición aleatoria se verá mejor de lo que el modelo generaliza, así que el bucle externo de la
validación anidada usa \`spatial_block\` como grupo. El desbalance de clases (75 % Alta, 22 % Media, 3 % Baja) sigue igual después de la limpieza, y por eso las técnicas de balanceo que
pide la guía, SMOTE (Chawla et al., 2002), ADASYN (He et al., 2008) y \`class_weight='balanced'\`, tienen sentido más allá de cumplir el requisito. Y la importancia de variables en SHAP
debería poner a \`latitude\` y \`longitude\` arriba, seguidas de \`slope\` con relación negativa dentro de cada región y de \`log_dist_to_road\`; esa hipótesis se revisa en el Experimento 7.

Los cuadernos siguientes parten de \`dataset_eda_corregido.csv\`. \`Benchmark_Modelos_Base.ipynb\` corre los modelos base del curso, y de \`Experimento_1_Diseno.ipynb\` a
\`Experimento_7_Interpretabilidad.ipynb\` van las 112 combinaciones de clasificación (108 aplicables) y las 28 de regresión que exige la guía de la Entrega 3, con \`spatial_block\` como
grupo en el bucle externo de la validación anidada.`;

// [104]
export const REFERENCIAS = [
  'Mantilla-Guerra, A., Mejia-Escobar, C., Azorin-Lopez, J., Garcia-Rodriguez, J., Tarco, B. F., y Santamaria, K. (2026). *Global dataset of solar power plants: multidimensional integration and analysis*. arXiv:2603.20601.',
  'FAO (1976). *A framework for land evaluation*. Food and Agriculture Organization of the United Nations.',
  'Wilson, J. P., y Gallant, J. C. (2000). *Terrain analysis: principles and applications*. John Wiley and Sons.',
  'Saaty, T. L. (1980). *The analytic hierarchy process*. McGraw-Hill.',
  'Roberts, D. R., Bahn, V., Ciuti, S., Boyce, M. S., Elith, J., Guillera-Arroita, G., Hauenstein, S., Lahoz-Monfort, J. J., Schröder, B., Thuiller, W., Warton, D. I., Wintle, B. A., Hartig, F., y Dormann, C. F. (2017). Cross-validation strategies for data with temporal, spatial, hierarchical, or phylogenetic structure. *Ecography*, 40(8), 913-929.',
  'Fisher, N. I. (1993). *Statistical analysis of circular data*. Cambridge University Press.',
  'Hollander, M., Wolfe, D. A., y Chicken, E. (2014). *Nonparametric statistical methods* (3.a ed.). Wiley.',
  "O'Brien, R. M. (2007). A caution regarding rules of thumb for variance inflation factors. *Quality and Quantity*, 41, 673-690.",
  'Chawla, N. V., Bowyer, K. W., Hall, L. O., y Kegelmeyer, W. P. (2002). SMOTE: synthetic minority over-sampling technique. *Journal of Artificial Intelligence Research*, 16, 321-357.',
  'He, H., Bai, Y., Garcia, E. A., y Li, S. (2008). ADASYN: adaptive synthetic sampling approach for imbalanced learning. *Proceedings of the IEEE International Joint Conference on Neural Networks*, 1322-1328.',
  'King, G., y Zeng, L. (2001). Logistic regression in rare events data. *Political Analysis*, 9(2), 137-163.',
];
