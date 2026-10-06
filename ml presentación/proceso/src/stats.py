"""Pruebas estadísticas para comparar modelos (contexto §5.8).

Clasificación: Friedman → Nemenyi con diagrama de diferencia crítica (Demšar, 2006) → DeLong uno contra el resto
(DeLong et al., 1988; versión rápida de Sun y Xu, 2014) con corrección de Holm (Holm, 1979) → delta de Cliff
(Cliff, 1993; umbrales de Romano et al., 2006) → intervalos bootstrap BCa (Efron, 1987).

Regresión: conjunto de confianza de modelos, MCS (Hansen et al., 2011) → Diebold-Mariano con la corrección de
Harvey, Leybourne y Newbold (1997) → Clark-West para modelos anidados (Clark y West, 2007) → Giacomini-White
condicional (Giacomini y White, 2006) → d de Cohen.

Los datos no tienen tiempo. Las pruebas pensadas para series (DM, GW, MCS con bootstrap estacionario, Ljung-Box)
se aplican sobre las pérdidas ordenadas por una curva de Hilbert sobre latitud y longitud: vecinos en la curva son
vecinos en el mapa, así que la dependencia "serial" que miden es autocorrelación espacial. Se complementa con el
I de Moran (Moran, 1950).
"""
import numpy as np
from scipy import stats as st

from . import config


# ---------- orden espacial ----------

def indice_hilbert(lat, lon, orden=16):
    """Posición de cada punto en una curva de Hilbert de 2^orden × 2^orden sobre el rectángulo lat/lon."""
    n = 2**orden
    x = np.clip(((np.asarray(lon) + 180) / 360 * (n - 1)).astype(np.int64), 0, n - 1)
    y = np.clip(((np.asarray(lat) + 90) / 180 * (n - 1)).astype(np.int64), 0, n - 1)
    return _xy_a_hilbert(x, y, n)


def _xy_a_hilbert(x, y, n):
    """Algoritmo xy2d clásico, vectorizado. x, y enteros en [0, n)."""
    x, y = np.asarray(x, np.int64).copy(), np.asarray(y, np.int64).copy()
    d = np.zeros_like(x)
    s = n // 2
    while s > 0:
        rx = ((x & s) > 0).astype(np.int64)
        ry = ((y & s) > 0).astype(np.int64)
        d += s * s * ((3 * rx) ^ ry)
        # rotar el cuadrante
        voltear = ry == 0
        cambiar = voltear & (rx == 1)
        x = np.where(cambiar, n - 1 - x, x)
        y = np.where(cambiar, n - 1 - y, y)
        x, y = np.where(voltear, y, x), np.where(voltear, x, y)
        s //= 2
    return d


def moran_i(valores, lat, lon, k=8, permutaciones=999, semilla=config.SEED):
    """I de Moran con pesos de los k vecinos más cercanos (distancia haversine) y p por permutación."""
    from sklearn.neighbors import NearestNeighbors
    z = np.asarray(valores, float) - np.mean(valores)
    coords = np.radians(np.column_stack([lat, lon]))
    vecinos = NearestNeighbors(n_neighbors=k + 1, metric="haversine").fit(coords).kneighbors(coords)[1][:, 1:]

    def calc(v):
        return len(v) / (len(v) * k) * np.sum(v[:, None] * v[vecinos]) / np.sum(v**2)

    observado = calc(z)
    rng = np.random.default_rng(semilla)
    nulos = np.array([calc(rng.permutation(z)) for _ in range(permutaciones)])
    p = (1 + np.sum(nulos >= observado)) / (permutaciones + 1)
    return {"I": float(observado), "esperado": -1 / (len(z) - 1), "p": float(p)}


# ---------- clasificación ----------

def friedman_nemenyi(tabla):
    """Friedman ómnibus y Nemenyi por pares.

    Args:
        tabla: DataFrame con una fila por pliegue y una columna por modelo (mayor es mejor).

    Returns:
        Diccionario con estadístico y p de Friedman, rangos medios, diferencia crítica y matriz de p de Nemenyi.
    """
    import scikit_posthocs as sp
    k, n = tabla.shape[1], tabla.shape[0]
    est, p = st.friedmanchisquare(*[tabla[c].to_numpy() for c in tabla.columns])
    rangos = tabla.rank(axis=1, ascending=False).mean()
    q = st.studentized_range.ppf(0.95, k, np.inf) / np.sqrt(2)
    cd = q * np.sqrt(k * (k + 1) / (6 * n))
    return {"chi2": float(est), "p": float(p), "rangos": rangos, "cd": float(cd),
            "nemenyi": sp.posthoc_nemenyi_friedman(tabla.to_numpy()).set_axis(tabla.columns, axis=0).set_axis(tabla.columns, axis=1)}


def _rango_medio(x):
    orden = np.argsort(x)
    z = x[orden]
    t = np.zeros(len(x))
    i = 0
    while i < len(x):
        j = i
        while j < len(x) and z[j] == z[i]:
            j += 1
        t[i:j] = 0.5 * (i + j - 1) + 1
        i = j
    salida = np.empty(len(x))
    salida[orden] = t
    return salida


def delong(y_bin, s1, s2):
    """Prueba de DeLong para dos AUC correlacionadas (mismas observaciones), algoritmo de Sun y Xu (2014).

    Returns:
        auc1, auc2, z y p bilateral.
    """
    y_bin = np.asarray(y_bin).astype(bool)
    m, n = y_bin.sum(), (~y_bin).sum()
    puntajes = np.vstack([s1, s2])
    tx = np.array([_rango_medio(p[y_bin]) for p in puntajes])
    ty = np.array([_rango_medio(p[~y_bin]) for p in puntajes])
    tz = np.array([_rango_medio(p) for p in puntajes])
    aucs = (tz[:, y_bin].sum(1) / m - (m + 1) / 2) / n
    v01 = (tz[:, y_bin] - tx) / n
    v10 = 1 - (tz[:, ~y_bin] - ty) / m
    s = np.cov(v01) / m + np.cov(v10) / n
    var = s[0, 0] + s[1, 1] - 2 * s[0, 1]
    z = (aucs[0] - aucs[1]) / np.sqrt(var) if var > 0 else 0.0
    return {"auc1": float(aucs[0]), "auc2": float(aucs[1]), "z": float(z), "p": float(2 * st.norm.sf(abs(z)))}


def holm(pvalores):
    """p ajustados por Holm-Bonferroni, en el orden original."""
    p = np.asarray(pvalores, float)
    orden = np.argsort(p)
    ajust = np.empty_like(p)
    acumulado = 0.0
    for i, j in enumerate(orden):
        acumulado = max(acumulado, (len(p) - i) * p[j])
        ajust[j] = min(1.0, acumulado)
    return ajust


def cliff_delta(x, y):
    """Delta de Cliff y su magnitud según Romano et al. (2006)."""
    x, y = np.asarray(x), np.asarray(y)
    d = (np.sum(x[:, None] > y[None, :]) - np.sum(x[:, None] < y[None, :])) / (len(x) * len(y))
    a = abs(d)
    magnitud = "despreciable" if a < 0.147 else "pequeña" if a < 0.33 else "mediana" if a < 0.474 else "grande"
    return {"delta": float(d), "magnitud": magnitud}


def bca_por_bloques(estadistico, grupos, n_boot=2000, semilla=config.SEED):
    """IC del 95 % BCa remuestreando bloques espaciales enteros, no filas (las filas de un bloque no son independientes).

    Args:
        estadistico: función que recibe un arreglo de índices de filas y devuelve un número.
        grupos: bloque de cada fila.
    """
    unicos, inverso = np.unique(grupos, return_inverse=True)
    filas = [np.flatnonzero(inverso == g) for g in range(len(unicos))]

    def sobre_bloques(b):
        return estadistico(np.concatenate([filas[i] for i in np.asarray(b, int)]))

    r = st.bootstrap((np.arange(len(unicos)),), sobre_bloques, method="BCa", n_resamples=n_boot,
                     vectorized=False, random_state=semilla)
    return float(r.confidence_interval.low), float(r.confidence_interval.high)


# ---------- regresión ----------

def _varianza_larga(d):
    """Varianza de largo plazo de Newey-West con rezago automático floor(4 (n/100)^(2/9))."""
    d = np.asarray(d, float) - np.mean(d)
    n = len(d)
    rezagos = int(np.floor(4 * (n / 100) ** (2 / 9)))
    v = np.dot(d, d) / n
    for l in range(1, rezagos + 1):
        v += 2 * (1 - l / (rezagos + 1)) * np.dot(d[l:], d[:-l]) / n
    return v


def diebold_mariano(perdida1, perdida2, h=1):
    """Diebold-Mariano con corrección HLN y varianza de Newey-West. Pérdidas ya ordenadas por la curva de Hilbert.

    Un estadístico negativo indica que el modelo 1 tiene menor pérdida.
    """
    d = np.asarray(perdida1) - np.asarray(perdida2)
    n = len(d)
    dm = np.mean(d) / np.sqrt(_varianza_larga(d) / n)
    hln = dm * np.sqrt((n + 1 - 2 * h + h * (h - 1) / n) / n)
    return {"dm_hln": float(hln), "p": float(2 * st.t.sf(abs(hln), n - 1))}


def clark_west(y, pred_pequeno, pred_grande):
    """Clark-West para modelos anidados. H1: el modelo grande predice mejor. p unilateral."""
    y, p1, p2 = map(np.asarray, (y, pred_pequeno, pred_grande))
    f = (y - p1) ** 2 - ((y - p2) ** 2 - (p1 - p2) ** 2)
    t = np.mean(f) / np.sqrt(_varianza_larga(f) / len(f))
    return {"cw": float(t), "p": float(st.norm.sf(t))}


def giacomini_white(perdida1, perdida2):
    """Giacomini-White condicional con instrumentos (1, diferencia de pérdida anterior en la curva de Hilbert)."""
    d = np.asarray(perdida1) - np.asarray(perdida2)
    h = np.column_stack([np.ones(len(d) - 1), d[:-1]])
    z = h * d[1:, None]
    n = len(z)
    zbar = z.mean(0)
    omega = np.cov(z, rowvar=False)
    est = n * zbar @ np.linalg.solve(omega, zbar)
    return {"gw": float(est), "p": float(st.chi2.sf(est, h.shape[1]))}


def mcs(perdidas, tamano=0.10, reps=1000, bloque=None, semilla=config.SEED):
    """Conjunto de confianza de modelos de Hansen et al. (2011) con bootstrap estacionario (arch).

    Args:
        perdidas: DataFrame (observaciones ordenadas por Hilbert × modelos).
    """
    from arch.bootstrap import MCS
    bloque = bloque or int(np.ceil(len(perdidas) ** (1 / 3)))
    m = MCS(perdidas, size=tamano, reps=reps, block_size=bloque, bootstrap="stationary",
            seed=np.random.default_rng(semilla))
    m.compute()
    return {"incluidos": list(m.included), "excluidos": list(m.excluded), "pvalores": m.pvalues}


def cohen_d_pareado(x, y):
    """d de Cohen para diferencias pareadas (por ejemplo, métricas por pliegue)."""
    d = np.asarray(x) - np.asarray(y)
    return float(np.mean(d) / np.std(d, ddof=1)) if np.std(d, ddof=1) > 0 else 0.0
