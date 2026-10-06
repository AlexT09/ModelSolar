# Presentación web del Proyecto ModelSolar

Recorrido del proyecto completo, en dos formatos con el mismo contenido:

| Formato | Enlace | Entrada |
|---|---|---|
| Página continua: todas las secciones seguidas, con scroll | https://alext09.github.io/ModelSolar/presentacion/ | `index.html` → `src/App.tsx` |
| Vista por paneles: índice lateral y una parte a la vez, como un libro de Jupyter Book | https://alext09.github.io/ModelSolar/presentacion/secciones.html | `secciones.html` → `src/AppSecciones.tsx` |

En la vista por paneles cada parte tiene su dirección (`secciones.html#eda/validacion-espacial`) y se
avanza con las flechas ← → del teclado. Las dos usan los mismos componentes de `src/sections/`: un
cambio de contenido aparece en ambas.


| Parte | Sección | Cuadernos |
|---|---|---|
| Proyecto | Contexto y objetivo | `exposicion/main.tex` (apertura), `proceso/Resumen_final.md` |
| Línea 1 | 1. Datos y EDA | `EDA_Corregido(Entregable 3).ipynb` |
| Línea 1 | 2. Modelos base sobre la base mundial | `Benchmark_Modelos_Base.ipynb` |
| Línea 1 | 3. Experimento de 140 combinaciones | `Experimento_1` a `Experimento_7` |
| Línea 2 | 4. Base de generación real en Colombia | `Clima_a_Generacion_Colombia.ipynb` |
| Línea 2 | 5. Qué explica el clima | `Clima_a_Generacion_Colombia.ipynb`, `Benchmark_Colombia.ipynb` |
| Cierre | 6. Resultados y conclusiones | `proceso/Resumen_final.md` |

Cada sección tiene un resumen y cifras clave, y el detalle en pestañas. Los textos, tablas y figuras son
los de los cuadernos, sin reescribir, con el número de celda de origen. De `main.tex` solo se toma la
apertura: las cifras de sus diapositivas de resultados no coinciden en todo con los cuadernos.

```bash
npm install
npm run dev      # desarrollo
npm run build    # genera dist/
```

## Regenerar los datos

Después de volver a ejecutar un cuaderno:

```bash
python scripts/extract_notebooks.py
```

Lee los cuadernos de `../proceso/` y escribe `src/generated/notebooks.json` (celdas de markdown y salidas de
texto) y `public/figs/` (las imágenes de las salidas y los esquemas que enlaza el markdown).

El mapa y la dispersión del EDA se proyectan desde el CSV con `scripts/build_data.py`, que repite la
limpieza del cuaderno y falla si alguna cifra no coincide. Necesita scikit-learn 1.9.0, la de
`proceso/environment.yml`:

```bash
python scripts/build_data.py "../Dataset/Dataset_Mundial_Final(2).csv"
```

El CSV está en `ml presentación/Dataset/Dataset_Mundial_Final(2).csv` (copia de [cimejia/solarPV](https://github.com/cimejia/solarPV/tree/main/Dataset)).
