from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

# El Pipeline serializado incluye un ColumnTransformer ajustado con nombres de columna,
# por lo que el vector de entrada debe reconstruirse como DataFrame con este orden exacto
# (igual a X_train.columns en notebooks/2_model_pipeline_cv.ipynb):
FEATURE_COLUMNS = [
    "Age", "Sex", "ChestPainType", "RestingBP", "Cholesterol",
    "FastingBS", "RestingECG", "MaxHR", "ExerciseAngina", "Oldpeak", "ST_Slope",
]

model = joblib.load("app/model.joblib")
app = FastAPI(title="Heart Disease Prediction API")


class Input(BaseModel):
    features: list


@app.post("/predict")
def predict(data: Input):
    X = pd.DataFrame([data.features], columns=FEATURE_COLUMNS)
    proba = model.predict_proba(X)[0][1]
    return {"heart_disease_probability": float(proba), "prediction": int(proba > 0.5)}


@app.get("/health")
def health():
    return {"status": "ok"}
