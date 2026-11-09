"""Pruebas de `src.stats` contra casos con respuesta conocida."""
import numpy as np
import pandas as pd
import pytest
from sklearn.metrics import roc_auc_score

from src import stats


def test_hilbert_es_biyectiva_y_continua():
    n = 16
    x, y = np.meshgrid(np.arange(n), np.arange(n))
    d = stats._xy_a_hilbert(x.ravel(), y.ravel(), n)
    assert sorted(d) == list(range(n * n))
    orden = np.argsort(d)
    pasos = np.abs(np.diff(x.ravel()[orden])) + np.abs(np.diff(y.ravel()[orden]))
    assert (pasos == 1).all()  # celdas consecutivas en la curva son vecinas en el mapa


def test_delong_reproduce_auc_y_detecta_diferencia():
    rng = np.random.default_rng(0)
    y = rng.integers(0, 2, 2000)
    bueno = y + rng.normal(0, 0.8, 2000)
    malo = y + rng.normal(0, 3.0, 2000)
    r = stats.delong(y, bueno, malo)
    assert r["auc1"] == pytest.approx(roc_auc_score(y, bueno))
    assert r["auc2"] == pytest.approx(roc_auc_score(y, malo))
    assert r["p"] < 1e-6
    assert stats.delong(y, bueno, bueno)["p"] == pytest.approx(1.0)


def test_holm_conoce_el_caso_de_libro():
    np.testing.assert_allclose(stats.holm([0.01, 0.04, 0.03]), [0.03, 0.06, 0.06])


def test_cliff_extremos():
    assert stats.cliff_delta([5, 6, 7], [1, 2, 3])["delta"] == 1.0
    assert stats.cliff_delta([1, 2], [1, 2])["magnitud"] == "despreciable"


def test_friedman_ordena_bien():
    rng = np.random.default_rng(1)
    tabla = pd.DataFrame({"a": 0.9 + rng.normal(0, 0.01, 10), "b": 0.8 + rng.normal(0, 0.01, 10),
                          "c": 0.7 + rng.normal(0, 0.01, 10)})
    r = stats.friedman_nemenyi(tabla)
    assert r["p"] < 0.001 and list(r["rangos"].sort_values().index) == ["a", "b", "c"]
    assert r["cd"] == pytest.approx(1.048, abs=0.01)  # q_0.05(k=3) = 2.343 en Demšar (2006)


def test_diebold_mariano_sin_diferencia_no_rechaza():
    rng = np.random.default_rng(2)
    e = rng.normal(size=5000)
    r = stats.diebold_mariano(e**2, rng.permutation(e) ** 2)
    assert r["p"] > 0.05


def test_bca_por_bloques_cubre_la_media():
    rng = np.random.default_rng(3)
    v = rng.normal(10, 1, 600)
    grupos = np.repeat(np.arange(60), 10)
    lo, hi = stats.bca_por_bloques(lambda i: v[i].mean(), grupos, n_boot=500)
    assert lo < 10 < hi
