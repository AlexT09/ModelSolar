# Web del EDA corregido

Visualización de `proceso/EDA_Corregido(Entregable 3).ipynb`. Los textos son copia literal de las
celdas del cuaderno (`src/content.ts`, con el índice de cada celda) y las cifras son las salidas
del cuaderno. El mapa y la dispersión pendiente vs. IAS se proyectan desde el CSV.

```bash
npm install
npm run dev      # desarrollo
npm run build    # genera dist/
```

## Regenerar los datos

`src/generated/summary.json` y `public/eda/points.json` salen de `scripts/build_data.py`, que repite
la limpieza del cuaderno y falla si alguna cifra no coincide (filas, clases, Spearman, pliegues).
Necesita scikit-learn 1.9.0, la de `proceso/environment.yml`.

```bash
python scripts/build_data.py ../Dataset/Dataset_Mundial_Final.csv
```

El CSV está en `ml presentación/Dataset/` (copia de [cimejia/solarPV](https://github.com/cimejia/solarPV/tree/main/Dataset)).
