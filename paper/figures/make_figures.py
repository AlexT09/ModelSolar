"""Genera todas las figuras del paper en PDF vectorial, con texto en inglés y su tamaño final de impresión.

Uso, desde la carpeta paper/:
    python figures/make_figures.py
Lee ../data/tabla_diaria_colombia.csv y los resultados de resultados/ (los escribe el cuaderno
notebooks/Modelo_Propuesto_Colombia.ipynb) y escribe figures/*.pdf.
"""
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.patches import FancyBboxPatch

AQUI = Path(__file__).resolve().parent
DATOS = AQUI.parent.parent / "data" / "tabla_diaria_colombia.csv"
RES = AQUI.parent / "resultados"
ANCHO = 6.3   # ancho útil de la página, en pulgadas

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

AZUL, OCRE, GRIS = "#1F3A5F", "#E0A526", "#7F7F7F"
VARS = ["rad_bm", "nube_bm", "temp_bm", "humedad_bm", "viento_bm"]
NOMBRES = ["CF", "GHI", "Cloud", "Temp", "RH", "Wind"]
ETIQUETAS = {"fc": "Capacity factor (–)", "rad_bm": "GHI (kWh/m$^2$/day)", "nube_bm": "Cloud cover (%)",
             "temp_bm": "Temperature (°C)", "humedad_bm": "Relative humidity (%)", "viento_bm": "Wind speed (km/h)"}
PROP = "Ridge jerárquico (propuesto)"


def corto(nombre):
    """Nombre corto de una planta para los ejes."""
    n = nombre.upper()
    for viejo, nuevo in [("BOSQUES SOLARES DE LOS LLANOS", "BSL"), ("PARQUE SOLAR ", ""), ("LATAM SOLAR ", ""),
                         ("SOLAR ", "")]:
        n = n.replace(viejo, nuevo)
    return " ".join(p if p in ("BSL", "BSB", "II", "I") else p.capitalize() for p in n.split())


def guarda(fig, nombre):
    fig.savefig(AQUI / nombre)
    plt.close(fig)
    print("figures/" + nombre)


def eda(t):
    # Variables centradas con la media de cada planta (variación día a día dentro de la planta)
    c = t[VARS + ["fc"]] - t.groupby("code")[VARS + ["fc"]].transform("mean")

    # Solo la relación con la radiación: la distribución del FC ya está en hist_variables.pdf
    fig, ax = plt.subplots(figsize=(ANCHO, 3.4))
    ax.scatter(c.rad_bm, c.fc, s=3, alpha=0.15, color=AZUL, rasterized=True, label="Plant-day")
    b = np.polyfit(c.rad_bm, c.fc, 1)
    xs = np.linspace(c.rad_bm.min(), c.rad_bm.max(), 50)
    ax.plot(xs, np.polyval(b, xs), color=OCRE, linestyle="--", label="OLS fit")
    ax.set_xlabel("Centered GHI (kWh/m$^2$/day)")
    ax.set_ylabel("Centered capacity factor (–)")
    ax.legend(frameon=False, loc="upper left", markerscale=4)
    fig.tight_layout()
    guarda(fig, "eda_colombia.pdf")

    fig, axes = plt.subplots(2, 3, figsize=(ANCHO, 4.4))
    for ax, v in zip(axes.flat, ["fc"] + VARS):
        ax.hist(t[v], bins=30, color=AZUL, edgecolor="white", linewidth=0.3)
        ax.set_xlabel(ETIQUETAS[v], fontsize=12)
        ax.tick_params(labelsize=11)
    for ax in axes[:, 0]:
        ax.set_ylabel("Plant-days")
    fig.tight_layout()
    guarda(fig, "hist_variables.pdf")

    orden = t.groupby("planta").fc.median().sort_values().index
    fig, ax = plt.subplots(figsize=(ANCHO, 4.6))
    ax.boxplot([t.loc[t.planta == p, "fc"] for p in orden], vert=False, widths=0.6,
               flierprops={"marker": "o", "markersize": 3, "markerfacecolor": GRIS, "markeredgecolor": GRIS},
               medianprops={"color": OCRE, "linewidth": 2}, boxprops={"color": AZUL}, whiskerprops={"color": AZUL},
               capprops={"color": AZUL})
    ax.set_yticks(range(1, len(orden) + 1), [corto(p) for p in orden], fontsize=11)
    ax.set_xlabel("Daily capacity factor (–)")
    fig.tight_layout()
    guarda(fig, "boxplot_plantas.pdf")

    fig, ax = plt.subplots(figsize=(ANCHO, 5.0))
    m = c[["fc"] + VARS].corr().values
    im = ax.imshow(m, cmap="RdBu_r", vmin=-1, vmax=1)
    ax.set_xticks(range(6), NOMBRES)
    ax.set_yticks(range(6), NOMBRES)
    ax.grid(False)
    for i in range(6):
        for j in range(6):
            ax.text(j, i, f"{m[i, j]:.2f}", ha="center", va="center", fontsize=12,
                    color="white" if abs(m[i, j]) > 0.6 else "black")
    fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04, label="Pearson correlation")
    fig.tight_layout()
    guarda(fig, "corr_colombia.pdf")


def diagrama():
    # Cajas con margen holgado: el texto no debe tocar los bordes con ninguna fuente
    fig, ax = plt.subplots(figsize=(ANCHO, 3.4))
    ax.set_xlim(-0.2, 13.4); ax.set_ylim(0.1, 4.8); ax.axis("off")
    cajas = {   # x, y, ancho, alto, texto
        "x": (0.0, 3.0, 3.4, 1.15, "Daily weather\n$\\mathbf{x}_{pt}$"),
        "z": (0.0, 0.95, 3.4, 1.15, "Centered and\nscaled $\\mathbf{z}_{pt}$"),
        "b": (4.4, 3.55, 4.2, 1.05, "Common slope $\\boldsymbol{\\beta}$\nRidge, other zones"),
        "bp": (4.4, 2.05, 4.2, 1.05, "Plant deviation $\\mathbf{b}_p$\nRidge, own past"),
        "l": (4.4, 0.55, 4.2, 1.05, "Adaptive level $\\ell_{pt}$\nEWMA to day $t-1$"),
        "y": (9.8, 2.05, 3.4, 1.05, "Prediction\n$\\hat{y}_{pt}$"),
    }
    for clave, (x, y, w, h, texto) in cajas.items():
        color = "#FFF4D6" if clave in ("bp", "l") else "#E6EEF7"
        ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.05", facecolor=color, edgecolor=AZUL, linewidth=1.5))
        ax.text(x + w / 2, y + h / 2, texto, ha="center", va="center", fontsize=11, linespacing=1.3)
    flecha = dict(arrowstyle="-|>", color=AZUL, lw=1.5, shrinkA=2, shrinkB=2)
    ax.annotate("", (1.7, 2.15), (1.7, 2.95), arrowprops=flecha)                   # x -> z
    ax.annotate("", (4.35, 4.05), (3.45, 1.75), arrowprops=flecha)                 # z -> beta
    ax.annotate("", (4.35, 2.55), (3.45, 1.55), arrowprops=flecha)                 # z -> b_p
    ax.annotate("", (6.5, 3.15), (6.5, 3.5), arrowprops=flecha)                    # beta -> b_p (encogimiento)
    for yy in (4.05, 2.55, 1.05):
        ax.annotate("", (9.75, 2.55), (8.65, yy), arrowprops=flecha)               # componentes -> predicción
    ax.annotate("", (8.65, 0.85), (11.5, 2.0), arrowprops=dict(arrowstyle="-|>", color=OCRE, lw=1.5, linestyle="--",
                                                                 connectionstyle="arc3,rad=-0.35", shrinkA=2, shrinkB=2))
    ax.text(11.9, 0.75, "observed\nresiduals", ha="center", va="center", fontsize=11, color="#8A6514")
    guarda(fig, "diagrama_modelo.pdf")


def resultados():
    r2 = pd.read_csv(RES / "r2_por_planta.csv", index_col=0)
    r2 = r2.sort_values(PROP)
    fig, ax = plt.subplots(figsize=(ANCHO, 4.8))
    yy = np.arange(len(r2))
    for col, color, marca, etiqueta in [(PROP, AZUL, "o", "Hierarchical Ridge (proposed)"), ("Lasso", OCRE, "s", "Lasso"),
                                        ("Lasso + nivel adaptativo", GRIS, "^", "Lasso + adaptive level")]:
        ax.scatter(r2[col], yy, color=color, marker=marca, s=40, label=etiqueta, zorder=3)
    ax.set_yticks(yy, [corto(p) for p in r2.index], fontsize=11)
    ax.axvline(0, color="black", lw=0.8)
    ax.set_xlabel("Within-plant $R^2$ on the test period")
    ax.legend(frameon=False, loc="upper center", bbox_to_anchor=(0.45, -0.13), ncol=2)
    fig.tight_layout()
    fig.savefig(AQUI.parent.parent / "figuras" / "fig_r2_por_planta.png", dpi=130)   # copia para el libro web
    guarda(fig, "r2_por_planta.pdf")

    curva = pd.read_csv(RES / "curva_aprendizaje.csv").pivot(index="fraccion", columns="modelo", values="r2_mediana")
    fig, ax = plt.subplots(figsize=(ANCHO, 3.2))
    for col, color, marca, estilo, etiqueta in [(PROP, AZUL, "o", "-", "Hierarchical Ridge (proposed)"),
                                                ("Lasso", OCRE, "s", "--", "Lasso"), ("XGBoost", GRIS, "^", ":", "XGBoost")]:
        ax.plot(curva.index * 100, curva[col], color=color, marker=marca, linestyle=estilo, label=etiqueta)
    ax.set_xlabel("Training rows used (%)")
    ax.set_ylabel("Median within-plant $R^2$")
    ax.legend(frameon=False, loc="upper center", bbox_to_anchor=(0.5, -0.25), ncol=3, fontsize=12, columnspacing=1.0, handlelength=1.6)
    fig.tight_layout()
    guarda(fig, "curva_aprendizaje.pdf")


def main():
    t = pd.read_csv(DATOS, parse_dates=["date"])
    eda(t)
    diagrama()
    if (RES / "r2_por_planta.csv").exists():
        resultados()


if __name__ == "__main__":
    main()
