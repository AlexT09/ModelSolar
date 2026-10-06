# ModelSolar

Proyecto de Machine Learning sobre aptitud solar fotovoltaica y predicción de generación real a partir de variables climáticas.

**Estudiantes:** Jesús David Arévalo Montilla, Enmanuel David Díaz Molinares, Alex David Terán Meza  
**Profesor:** Dr. Lihki Rubio  
**Programa:** Ciencia de Datos, Universidad del Norte  

Libro web del proyecto: [https://alext09.github.io/ModelSolar/](https://alext09.github.io/ModelSolar/)

---

### Contenido

- **`ml presentación/`**: cuadernos del proyecto final (análisis exploratorio corregido, modelos base, experimento de 140 combinaciones y el modelo de generación en Colombia con datos de XM y Open-Meteo).
- **`ml presentación/Dataset/`**: los datos que usan los cuadernos. No se versionan (`.gitignore`).
  - `Dataset_Mundial_Final(2).csv`: dataset fuente, de [cimejia/solarPV](https://github.com/cimejia/solarPV/tree/main/Dataset).
  - `dataset_eda_corregido.csv`: base limpia que exporta el EDA y usan los modelos.
  - `plantas_colombia.csv` y `tabla_diaria_colombia.csv`: base de Colombia que arma `Clima_a_Generacion_Colombia.ipynb`.
- **`ml presentación/web/`**: presentación web del proyecto completo, en [https://alext09.github.io/ModelSolar/presentacion/](https://alext09.github.io/ModelSolar/presentacion/).

### Entorno

Para crear el ambiente e instalar el kernel de Jupyter:

```bash
conda env create -f environment.yml
conda activate solarpv-eda
python -m ipykernel install --user --name solarpv-eda --display-name "Python (solarpv-eda)"
```
