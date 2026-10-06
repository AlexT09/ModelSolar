"""Pruebas de las garantías que sostienen el experimento: sin fuga, mismo espacio y mismo presupuesto.

Correr desde `proceso/`:  python -m pytest tests -q
"""
import numpy as np
import pytest
from sklearn.datasets import make_classification

from src import balancing, cv, models
from src.search import OPTIMIZADORES
from src.search.base import Evaluador
from src.search.espacio import decodificar, grilla, niveles_grilla


@pytest.fixture(scope="module")
def juguete():
    X, y = make_classification(n_samples=600, n_features=6, n_informative=4, n_classes=3,
                               weights=[0.1, 0.6, 0.3], random_state=0)
    grupos = np.repeat(np.arange(60), 10).astype(str)
    return X, y, grupos


def test_bloques_no_se_parten_entre_entrenamiento_y_prueba(juguete):
    _, y, grupos = juguete
    for tr, te in cv.externas(y, grupos):
        assert not set(grupos[tr]) & set(grupos[te])
        for itr, iva in cv.internas(y[tr], grupos[tr]):
            assert not set(grupos[tr][itr]) & set(grupos[tr][iva])


def test_decodificar_respeta_limites_y_escala_log():
    espacio = {"C": ("float", 1e-3, 1e3, True), "k": ("int", 1, 60, True), "w": ("cat", ("a", "b"))}
    assert decodificar(espacio, [0, 0, 0]) == {"C": pytest.approx(1e-3), "k": 1, "w": "a"}
    assert decodificar(espacio, [1, 1, 1]) == {"C": pytest.approx(1e3), "k": 60, "w": "b"}
    assert decodificar(espacio, [0.5, 0, 0])["C"] == pytest.approx(1.0)  # centro geométrico en escala log


@pytest.mark.parametrize("tarea", ["clf", "reg"])
def test_grilla_cabe_en_el_presupuesto(tarea):
    for nombre, espacio in models.ESPACIOS[tarea].items():
        niveles = niveles_grilla(espacio, 30)
        assert np.prod(list(niveles.values())) <= 30, nombre
        assert 0 < len(grilla(espacio, 30)) <= 30, nombre


def test_smote_solo_remuestrea_en_fit(juguete):
    X, y, _ = juguete
    pipe = balancing.construir(models.estimador("clf", "Naive Bayes"), "Naive Bayes", "smote")
    pipe.fit(X[:400], y[:400])
    assert len(pipe.predict(X[400:])) == 200  # en predicción no se crean ni se quitan filas
    _, vistos = pipe.named_steps["bal"].fit_resample(pipe[:2].transform(X[:400]), y[:400])
    assert np.bincount(vistos).min() == np.bincount(vistos).max()  # en fit sí se balancea


def test_class_weight_no_aplica_a_knn():
    assert not balancing.aplica("KNN", "class_weight")
    with pytest.raises(ValueError):
        balancing.construir(models.estimador("clf", "KNN"), "KNN", "class_weight")


def test_sample_weight_para_modelos_sin_class_weight(juguete):
    _, y, _ = juguete
    w = balancing.argumentos_fit("XGBoost", "class_weight", y)["m__sample_weight"]
    assert w[y == 0].sum() == pytest.approx(w[y == 1].sum())


@pytest.mark.parametrize("nombre", list(OPTIMIZADORES))
def test_cada_optimizador_gasta_exactamente_el_presupuesto(juguete, nombre):
    X, y, grupos = juguete
    espacio = models.ESPACIOS["clf"]["Árbol de decisión"]
    pipe = balancing.construir(models.estimador("clf", "Árbol de decisión"), "Árbol de decisión", "ninguno")
    ev = Evaluador(pipe=pipe, tarea="clf", modelo="Árbol de decisión", balanceo="ninguno", X=X, y=y,
                   internas=cv.internas(y, grupos), presupuesto=12)
    OPTIMIZADORES[nombre](ev, espacio, 42)
    tope = len(grilla(espacio, 12)) if nombre == "grilla" else 12
    assert ev.usadas == tope
    assert all(np.isfinite(t["puntaje"]) for t in ev.traza)
    params, puntaje = ev.mejor()
    assert set(params) == set(espacio) and 0 < puntaje <= 1


def test_halving_cabe_en_el_presupuesto_y_elige_con_datos_completos(juguete):
    from src.search.halving import buscar_halving, plan_rondas
    plan = plan_rondas(30)
    assert sum(n * f for n, f in plan) <= 30 and plan[-1][1] == 1.0 and plan[0][0] > 30
    X, y, grupos = juguete
    espacio = models.ESPACIOS["clf"]["Árbol de decisión"]
    pipe = balancing.construir(models.estimador("clf", "Árbol de decisión"), "Árbol de decisión", "smote")
    ev = Evaluador(pipe=pipe, tarea="clf", modelo="Árbol de decisión", balanceo="smote", X=X, y=y,
                   internas=cv.internas(y, grupos), presupuesto=12)
    out = buscar_halving(ev, espacio, 42)
    assert out["costo_equivalente"] <= 12
    params, _ = ev.mejor()
    finales = [t["params"] for t in ev.traza if t["fraccion"] == 1.0]
    assert params in finales


def test_genetico_registra_diversidad(juguete):
    X, y, grupos = juguete
    espacio = models.ESPACIOS["clf"]["KNN"]
    pipe = balancing.construir(models.estimador("clf", "KNN"), "KNN", "ninguno")
    ev = Evaluador(pipe=pipe, tarea="clf", modelo="KNN", balanceo="ninguno", X=X, y=y,
                   internas=cv.internas(y, grupos), presupuesto=15)
    out = OPTIMIZADORES["genetica"](ev, espacio, 42)
    assert len(out["diversidad"]) >= 2
    assert all(0 <= g["distancia_media"] <= 1 for g in out["diversidad"])
