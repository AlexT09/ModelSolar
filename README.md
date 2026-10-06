# ModelSolar

Proyecto de Machine Learning sobre aptitud solar fotovoltaica y predicción de generación real a partir de variables climáticas.

**Estudiantes:** Jesús David Arévalo Montilla, Enmanuel David Díaz Molinares, Alex David Terán Meza  
**Profesor:** Dr. Lihki Rubio  
**Programa:** Ciencia de Datos, Universidad del Norte  

Libro web del proyecto: [https://krissv89.github.io/ModelSolar/](https://krissv89.github.io/ModelSolar/)

---

### Contenido

- **`ml presentación/`**: cuadernos del proyecto final (análisis exploratorio corregido, modelos base, experimento de 140 combinaciones y el modelo de generación en Colombia con datos de XM y Open-Meteo).
- **`tareas/`**: talleres del semestre (EDA en PySpark/Sklearn, detección y mitigación de data leakage con pipelines, y clasificador bayesiano).
- **`Proyecto Integrador Pipelines/`**: taller de pipelines y despliegue.

### Entorno

Para crear el ambiente e instalar el kernel de Jupyter:

```bash
conda env create -f environment.yml
conda activate solarpv-eda
python -m ipykernel install --user --name solarpv-eda --display-name "Python (solarpv-eda)"
```
