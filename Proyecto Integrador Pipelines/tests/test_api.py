from unittest.mock import patch, MagicMock

import numpy as np

# app.api loads model.joblib at import time; mock it so CI doesn't need a trained model.
with patch("joblib.load", return_value=MagicMock()):
    from fastapi.testclient import TestClient
    from app import api

client = TestClient(api.app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_predict():
    api.model.predict_proba = MagicMock(return_value=np.array([[0.35, 0.65]]))
    payload = {
        "features": [58, "M", "ATA", 130, 250, 0, "Normal", 145, "N", 1.2, "Up"]
    }
    response = client.post("/predict", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["heart_disease_probability"] == 0.65
    assert body["prediction"] == 1
    api.model.predict_proba.assert_called_once()
