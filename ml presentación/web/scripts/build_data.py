"""Genera src/generated/summary.json y public/eda/points.json a partir del CSV crudo del dataset.

Replica la limpieza de EDA_Corregido(Entregable 3).ipynb (D1, D2, D8, macro-región,
bloques de 5° y StratifiedGroupKFold) y verifica que las cifras coincidan con el cuaderno.

Requiere scikit-learn 1.9.0 (la de ml presentación/proceso/environment.yml): con otra versión
StratifiedGroupKFold reparte los bloques distinto y la verificación de pliegues falla.

Uso:
    python scripts/build_data.py "../Dataset/Dataset_Mundial_Final(2).csv"

El CSV está en https://github.com/cimejia/solarPV (Dataset/Dataset_Mundial_Final.csv; en este repositorio se guarda como ml presentación/Dataset/Dataset_Mundial_Final(2).csv).
"""

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import spearmanr
from sklearn.model_selection import StratifiedGroupKFold

SEED = 42
CLASS_ORDER = ["Baja", "Media", "Alta"]
REGION_ORDER = ["Américas", "Europa/África/M.Oriente", "Asia/Oceanía"]
WEB = Path(__file__).resolve().parent.parent
SUMMARY_OUT = WEB / "src" / "generated" / "summary.json"
POINTS_OUT = WEB / "public" / "eda" / "points.json"


def macro_region(lon):
    if lon < -30:
        return "Américas"
    if lon < 60:
        return "Europa/África/M.Oriente"
    return "Asia/Oceanía"


def main(csv_path):
    df_raw = pd.read_csv(csv_path, sep=";", decimal=",", encoding="utf-8-sig")
    assert len(df_raw) == 58_978, f"El CSV no es el del cuaderno: {len(df_raw)} filas"

    mask_d1 = (
        (df_raw["solar_aptitude"] == 0)
        & (df_raw["slope"] == 0)
        & (df_raw["aspect"] == 0)
        & (df_raw["curvature"] == 0)
        & (df_raw["elevation"] == 0)
    )
    mask_d2 = (df_raw["ghi"] == 0) & (df_raw["pv_potential"] == 0)
    feature_cols = [c for c in df_raw.columns if c not in ("OBJECTID", "code", "plant_name")]

    df = df_raw.loc[~(mask_d1 | mask_d2)].copy()
    df = df.drop_duplicates(subset=feature_cols, keep="first")
    assert len(df) == 57_976, f"La limpieza no coincide con el cuaderno: {len(df)} filas"

    df["macro_region"] = df["longitude"].apply(macro_region)
    df["block_lat"] = (df["latitude"] // 5) * 5
    df["block_lon"] = (df["longitude"] // 5) * 5
    df["spatial_block"] = df["block_lat"].astype(str) + "_" + df["block_lon"].astype(str)

    y = df["solar_aptittude_class"]
    sgkf = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=SEED)
    fold = np.zeros(len(df), dtype=int)
    folds = []
    for k, (_, te_idx) in enumerate(sgkf.split(df, y, df["spatial_block"])):
        fold[te_idx] = k
        n_baja = int((y.iloc[te_idx] == "Baja").sum())
        folds.append({"fold": k, "n": len(te_idx), "baja": n_baja,
                      "pct_baja": round(n_baja / len(te_idx) * 100, 2)})
    assert [f["baja"] for f in folds] == [338, 344, 447, 357, 340], folds

    # Correlación de Spearman con el IAS, mismas columnas que la sección 7
    aspect_rad = np.deg2rad(df["aspect"].where(df["aspect"] != -1))
    df["aspect_sin"] = np.sin(aspect_rad).fillna(0.0)
    df["aspect_cos"] = np.cos(aspect_rad).fillna(0.0)
    wind_rad = np.deg2rad(df["wind_direction"])
    df["wind_sin"] = np.sin(wind_rad)
    df["wind_cos"] = np.cos(wind_rad)
    df["log_dist_to_road"] = np.log1p(df["dist_to_road"].where(df["dist_to_road"] <= 100_000))
    corr_cols = [
        "latitude", "longitude", "elevation", "slope", "curvature",
        "aspect_sin", "aspect_cos", "log_dist_to_road", "ambient_temperature",
        "humidity", "wind_speed", "wind_sin", "wind_cos", "ghi", "optimal_tilt",
        "pv_potential",
    ]
    corr = df[corr_cols + ["solar_aptitude"]].corr(method="spearman")["solar_aptitude"]
    corr = corr.drop("solar_aptitude").sort_values(key=abs, ascending=False)
    r_lon, _ = spearmanr(df["solar_aptitude"], df["longitude"])
    assert round(r_lon, 3) == 0.583

    regions = []
    for r in REGION_ORDER:
        sub = df[df["macro_region"] == r]
        counts = sub["solar_aptittude_class"].value_counts()
        regions.append({
            "region": r,
            "n": len(sub),
            "mean_ias": round(sub["solar_aptitude"].mean(), 3),
            **{c: int(counts.get(c, 0)) for c in CLASS_ORDER},
        })

    def class_counts(frame):
        vc = frame["solar_aptittude_class"].value_counts()
        return {c: int(vc.get(c, 0)) for c in CLASS_ORDER}

    baja_country = (df[df["solar_aptittude_class"] == "Baja"]["country"]
                    .value_counts().head(10))

    # Puntos: columnas enteras para que el JSON pese poco
    countries = sorted(df["country"].unique())
    country_idx = {c: i for i, c in enumerate(countries)}
    cls_idx = {c: i for i, c in enumerate(CLASS_ORDER)}
    reg_idx = {r: i for i, r in enumerate(REGION_ORDER)}
    points = {
        "lon": (df["longitude"] * 100).round().astype(int).tolist(),
        "lat": (df["latitude"] * 100).round().astype(int).tolist(),
        "ias": (df["solar_aptitude"] * 1000).round().astype(int).tolist(),
        "slope": (df["slope"] * 10).round().astype(int).tolist(),
        "cls": df["solar_aptittude_class"].map(cls_idx).tolist(),
        "region": df["macro_region"].map(reg_idx).tolist(),
        "fold": fold.tolist(),
        "country": df["country"].map(country_idx).tolist(),
    }

    blocks = (df.assign(fold=fold)
              .groupby(["block_lat", "block_lon"])
              .agg(n=("fold", "size"), fold=("fold", "first"),
                   baja=("solar_aptittude_class", lambda s: int((s == "Baja").sum())))
              .reset_index())

    # Histograma del IAS limpio en 32 intervalos de 0.03 (0 a 0.96), para el hero
    edges = np.linspace(0, 0.96, 33)
    hist, _ = np.histogram(df["solar_aptitude"], bins=edges)

    summary = {
        "classes": CLASS_ORDER,
        "regions": REGION_ORDER,
        "rows_raw": len(df_raw),
        "rows_clean": len(df),
        "class_raw": class_counts(df_raw),
        "class_clean": class_counts(df),
        "ias_mean": round(df_raw["solar_aptitude"].mean(), 3),
        "ias_max": round(df_raw["solar_aptitude"].max(), 3),
        "region_summary": regions,
        "spearman": [{"var": k, "r": round(v, 3)} for k, v in corr.items()],
        "baja_by_country": [{"country": k, "n": int(v)} for k, v in baja_country.items()],
        "folds": folds,
        "n_blocks": int(df["spatial_block"].nunique()),
        "ias_hist": hist.tolist(),
    }
    points_out = {
        "countries": countries,
        "blocks": blocks[["block_lat", "block_lon", "n", "fold", "baja"]]
        .astype(int).values.tolist(),
        **points,
    }
    for path, payload in ((SUMMARY_OUT, summary), (POINTS_OUT, points_out)):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
                        encoding="utf-8")
        print(f"{path} ({path.stat().st_size / 1e6:.2f} MB)")


if __name__ == "__main__":
    main(sys.argv[1])
