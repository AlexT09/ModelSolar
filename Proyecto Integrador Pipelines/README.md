# Proyecto Integrador — Predicción de Falla Cardíaca (MLOps local)

Proyecto integrador del curso de Machine Learning (notas *"10. Pipelines — Machine Learning"*,
sección 10.12). Construye, evalúa y despliega localmente un modelo de clasificación binaria que
predice el riesgo de falla cardíaca (`HeartDisease = 1` o `0`) a partir del dataset
[Heart Failure Prediction (Kaggle)](https://www.kaggle.com/datasets/fedesoriano/heart-failure-prediction),
aplicando `Pipeline` + `GridSearchCV` de scikit-learn para evitar *data leakage*, y sirviendo el
modelo con FastAPI, Docker, Kubernetes, CI en GitHub Actions y monitoreo de deriva de datos con
Evidently.

## Estructura

```
app/            API de predicción (FastAPI) y modelo serializado (model.joblib, generado)
docker/         Dockerfile y requirements.txt de la API
k8s/            Manifiestos de Kubernetes (Deployment + Service)
notebooks/      Notebooks de las etapas 1 y 2 (leakage demo, modelado con validación segura)
tests/          Pruebas automáticas de la API (usadas por CI)
drift_report.html  Reporte de deriva de datos generado por notebooks/2_model_pipeline_cv.ipynb
```

## Etapas

| Etapa | Descripción | Artefacto |
|---|---|---|
| 1. Análisis y detección de fuga | Demo de data leakage + comparación de 5 modelos (`SVC`, `LogisticRegression`, `RandomForestClassifier`, `KNeighborsClassifier`, `GradientBoostingClassifier`) en `Pipeline`+`GridSearchCV`, ranking por AUC/Accuracy | `notebooks/1_model_leakage_demo.ipynb` |
| 2. Modelado con validación segura | Split antes de preprocesar, `Pipeline` final, matriz de confusión, curva ROC, exportación del modelo y reporte de drift | `notebooks/2_model_pipeline_cv.ipynb` |
| 3. Despliegue local | API REST con FastAPI, contenerizada con Docker | `app/api.py`, `docker/` |
| 4. Orquestación | Manifiestos de Kubernetes para desplegar localmente con Minikube | `k8s/` |
| 5. Integración continua | Lint (`flake8`) y pruebas (`pytest`) en cada push/PR que toque esta carpeta | `.github/workflows/proyecto-integrador-ci.yml` (raíz del repo) |
| 6. Monitoreo | Reporte de deriva de datos (train vs. test) con Evidently | `drift_report.html` |

## Cómo correrlo

### 1–2. Notebooks

El dataset ya está incluido en `data/heart.csv` (descargado manualmente desde Kaggle), así que los
notebooks lo leen directamente con pandas — no se necesitan credenciales de Kaggle. Cada notebook
deja comentada la alternativa con `kagglehub` (descarga automática) por si se prefiere usarla.

```bash
pip install scikit-learn pandas numpy matplotlib seaborn evidently
jupyter lab notebooks/
```

Ejecuta primero `1_model_leakage_demo.ipynb` (comparación de modelos) y luego
`2_model_pipeline_cv.ipynb`, que genera `app/model.joblib` y `drift_report.html`.

> **Orden de features:** el pipeline serializado espera un vector en el mismo orden que
> `X_train.columns` (impreso en la sección 2 del notebook 2):
> `Age, Sex, ChestPainType, RestingBP, Cholesterol, FastingBS, RestingECG, MaxHR, ExerciseAngina, Oldpeak, ST_Slope`.

### 3. API local (sin Docker)

```bash
pip install -r docker/requirements.txt
uvicorn app.api:app --reload
```

```bash
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [58, "M", "ATA", 130, 250, 0, "Normal", 145, "N", 1.2, "Up"]}'
```

### 3. Docker

Construir y ejecutar desde esta carpeta (`Proyecto Integrador Pipelines/`):

```bash
docker build -t heart-api -f docker/Dockerfile .
docker run -p 8000:8000 heart-api
```

### 4. Kubernetes (Minikube)

Sube la imagen a un registro accesible por Minikube (o cárgala con `minikube image load`) y
reemplaza `<TU_USUARIO_DOCKER>` en `k8s/deployment.yaml`:

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl get svc
```

### 5. CI

El workflow `.github/workflows/proyecto-integrador-ci.yml` (en la raíz del repo) se dispara solo
cuando cambia algo dentro de esta carpeta, y corre `flake8 app/` + `pytest tests/`.

### 6. Monitoreo

`drift_report.html` se genera automáticamente al final de `notebooks/2_model_pipeline_cv.ipynb`;
ábrelo en un navegador para inspeccionar la deriva de datos entre entrenamiento y prueba.

## Notas de adaptación respecto al PDF del curso

- El PDF usa una columna genérica `target`; el dataset real de Kaggle usa **`HeartDisease`**.
- El PDF ilustra el leakage con datos sintéticos 100% numéricos; este dataset real mezcla variables
  numéricas y categóricas, por lo que el preprocesamiento usa un `ColumnTransformer`
  (`OneHotEncoder` + `MinMaxScaler`) en vez de un único `MinMaxScaler`, siempre dentro del `Pipeline`.
