# ModelSolar

Proyecto de Machine Learning sobre aptitud solar fotovoltaica y predicción de generación real a partir de variables climáticas.

**Estudiantes:** Jesús David Arévalo Montilla, Enmanuel David Díaz Molinares, Alex David Terán Meza  
**Profesor:** Dr. Lihki Rubio  
**Programa:** Ciencia de Datos, Universidad del Norte  

Libro web del proyecto: [https://alext09.github.io/ModelSolar/](https://alext09.github.io/ModelSolar/)

---

### Contenido

- **`libro/`**: páginas del libro web (portada, resumen final, estilos y referencias).
- **`notebooks/`**: cuadernos del proyecto (EDA corregido, modelos base, experimento de 140 combinaciones y el modelo de generación en Colombia con datos de XM y Open-Meteo). Se abren desde esta carpeta.
  - `src/`: código del experimento (modelos, validación, optimizadores y estadística). `tests/` prueba que no haya fuga de datos.
  - `correr_experimento.py`: corre las 140 combinaciones y guarda los resultados en `data/runs/`, que usan los cuadernos `Experimento_*` y `Resumen_Final`.
- **`figuras/`**: figuras que generan los cuadernos y usa el libro.
- **`paper/`**: artículo en LaTeX con la plantilla de Springer Nature. Se compila en Overleaf o con pdfLaTeX.
- **`data/`**: los datos que usan los cuadernos. No se versionan (`.gitignore`).
  - `Dataset_Mundial_Final(2).csv`: dataset fuente, de [cimejia/solarPV](https://github.com/cimejia/solarPV/tree/main/Dataset).
  - `dataset_eda_corregido.csv`: base limpia que exporta el EDA y usan los modelos.
  - `plantas_colombia.csv` y `tabla_diaria_colombia.csv`: base de Colombia que arma `Clima_a_Generacion_Colombia.ipynb`.

### Entorno

Para crear el ambiente e instalar el kernel de Jupyter:

```bash
conda env create -f environment.yml
conda activate solarpv-eda
python -m ipykernel install --user --name solarpv-eda --display-name "Python (solarpv-eda)"
```
