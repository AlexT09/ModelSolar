"""Genera las figuras del paper en PDF vectorial (texto en inglés).

Uso, desde la carpeta paper/:
    python figures/make_figures.py
Lee ../ml presentación/proceso/tabla_diaria_colombia.csv y escribe figures/*.pdf
"""
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

AQUI = Path(__file__).resolve().parent
DATOS = AQUI.parent.parent / "ml presentación" / "proceso" / "tabla_diaria_colombia.csv"

plt.rcParams.update({
    "font.family": "sans-serif",
    "font.sans-serif": ["Latin Modern Sans", "DejaVu Sans"],
    "font.size": 12,
    "axes.labelsize": 13,
    "xtick.labelsize": 12,
    "ytick.labelsize": 12,
    "legend.fontsize": 12,
    "lines.linewidth": 2.0,
    "axes.grid": True,
    "grid.alpha": 0.3,
    "pdf.fonttype": 42,
    "savefig.bbox": "tight",
})

VARS = ["rad_bm", "nube_bm", "temp_bm", "humedad_bm", "viento_bm"]
NOMBRES = ["GHI", "Cloud", "Temp", "RH", "Wind", "CF"]


def main():
    t = pd.read_csv(DATOS, parse_dates=["date"])
    # Variables centradas con la media de cada planta (variación día a día dentro de la planta)
    c = t[VARS + ["fc"]] - t.groupby("code")[VARS + ["fc"]].transform("mean")

    fig, axes = plt.subplots(1, 2, figsize=(6.3, 2.9))
    ax = axes[0]
    ax.hist(t.fc, bins=40, color="#1F3A5F", edgecolor="white", linewidth=0.3)
    ax.set_xlabel("Daily capacity factor")
    ax.set_ylabel("Plant-days")

    ax = axes[1]
    ax.scatter(c.rad_bm, c.fc, s=2, alpha=0.15, color="#1F3A5F", rasterized=True)
    b = np.polyfit(c.rad_bm, c.fc, 1)
    xs = np.linspace(c.rad_bm.min(), c.rad_bm.max(), 50)
    ax.plot(xs, np.polyval(b, xs), color="#E0A526", linestyle="--", label="OLS fit")
    ax.set_xlabel("Centered GHI (kWh/m$^2$/day)")
    ax.set_ylabel("Centered capacity factor")
    ax.legend(frameon=False, loc="upper left")
    fig.tight_layout()
    fig.savefig(AQUI / "eda_colombia.pdf")

    fig, ax = plt.subplots(figsize=(5.0, 4.0))
    m = c.corr().values
    im = ax.imshow(m, cmap="RdBu_r", vmin=-1, vmax=1)
    ax.set_xticks(range(6), NOMBRES)
    ax.set_yticks(range(6), NOMBRES)
    ax.grid(False)
    for i in range(6):
        for j in range(6):
            ax.text(j, i, f"{m[i, j]:.2f}", ha="center", va="center", fontsize=10,
                    color="white" if abs(m[i, j]) > 0.6 else "black")
    fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04, label="Pearson correlation")
    fig.tight_layout()
    fig.savefig(AQUI / "corr_colombia.pdf")
    print("figures/eda_colombia.pdf, figures/corr_colombia.pdf")


if __name__ == "__main__":
    main()
