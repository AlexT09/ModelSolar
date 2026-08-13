# ModelSolar

EDA y modelado de datos de plantas solares fotovoltaicas globales, basado en el dataset de cimejia/solarPV.

## Entorno

\\\powershell
conda env create -f environment.yml
conda activate solarpv-eda
python -m ipykernel install --user --name solarpv-eda --display-name "Python (solarpv-eda)"
\\\

## Estructura

- \Dataset/\ — datos crudos (xlsx, csv)
- \
otebooks/\ — notebooks de EDA y modelado
- \src/\ — scripts reutilizables
- \outputs/\ — resultados, gráficos, modelos exportados
