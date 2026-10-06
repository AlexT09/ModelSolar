"""Extrae el contenido de los cuadernos de proceso/ para la web.

Genera:
- src/generated/notebooks.json: por cuaderno, cada celda con su índice. Las de markdown llevan su
  texto; las de código, sus salidas de texto (sin stderr ni objetos sin representación) y las
  imágenes que mostraron.
- public/figs/nb/<cuaderno>_<celda>_<n>.png: cada imagen de salida, tal como quedó guardada.
- public/figs/<fig>.png: las figuras fig_*.png de proceso/ que el markdown de los cuadernos enlaza.
- El texto de proceso/Resumen_final.md, partido por encabezados "## " (clave _resumen_md).

Uso (desde ml presentación/web):
    python scripts/extract_notebooks.py
"""

import base64
import json
import re
import shutil
from pathlib import Path

WEB = Path(__file__).resolve().parent.parent
PROCESO = WEB.parent / "proceso"
OUT_JSON = WEB / "src" / "generated" / "notebooks.json"
FIGS = WEB / "public" / "figs"
NB_FIGS = FIGS / "nb"

NOTEBOOKS = {
    "eda": "EDA_Corregido(Entregable 3).ipynb",
    "benchmark": "Benchmark_Modelos_Base.ipynb",
    "clima": "Clima_a_Generacion_Colombia.ipynb",
    "benchmark_col": "Benchmark_Colombia.ipynb",
    "exp1": "Experimento_1_Diseno.ipynb",
    "exp2": "Experimento_2_Clasificacion.ipynb",
    "exp3": "Experimento_3_Regresion.ipynb",
    "exp4": "Experimento_4_Optimizadores.ipynb",
    "exp5": "Experimento_5_Computacional.ipynb",
    "exp6": "Experimento_6_Estadistica.ipynb",
    "exp7": "Experimento_7_Interpretabilidad.ipynb",
}

SKIP_TEXT = ("<pandas.io.formats.style.Styler", "<Figure size")
ANSI = re.compile(r"\x1b\[[0-9;]*m")


def text_of(value):
    return "".join(value) if isinstance(value, list) else value


def extract(key, name):
    nb = json.loads((PROCESO / name).read_text(encoding="utf-8"))
    cells = []
    for i, cell in enumerate(nb["cells"]):
        if cell["cell_type"] == "markdown":
            cells.append({"i": i, "md": text_of(cell["source"])})
            continue
        if cell["cell_type"] != "code":
            continue
        outputs, images = [], []
        for out in cell.get("outputs", []):
            if out.get("output_type") == "stream":
                if out.get("name") == "stderr":
                    continue
                txt = text_of(out["text"])
            elif "data" in out:
                data = out["data"]
                if "image/png" in data:
                    path = NB_FIGS / f"{key}_{i}_{len(images)}.png"
                    path.write_bytes(base64.b64decode(text_of(data["image/png"])))
                    images.append(path.name)
                    continue
                txt = text_of(data.get("text/plain", ""))
            else:
                continue
            txt = ANSI.sub("", txt).rstrip()
            if txt and not txt.startswith(SKIP_TEXT):
                outputs.append(txt)
        if outputs or images:
            cells.append({"i": i, "out": outputs, "img": images})
    return {"file": name, "cells": cells}


def resumen_sections():
    text = (PROCESO / "Resumen_final.md").read_text(encoding="utf-8")
    parts = re.split(r"^## ", text, flags=re.M)
    sections = {"intro": parts[0].split("\n", 1)[1].strip()}
    for part in parts[1:]:
        head, _, body = part.partition("\n")
        sections[head.strip()] = body.strip()
    return sections


def main():
    if FIGS.exists():
        shutil.rmtree(FIGS)
    NB_FIGS.mkdir(parents=True)

    data = {key: extract(key, name) for key, name in NOTEBOOKS.items()}
    data["_resumen_md"] = resumen_sections()

    # Solo las figuras de proceso/ que enlaza el markdown de los cuadernos (los esquemas)
    linked = {m for nb in data.values() if "cells" in nb for c in nb["cells"] if "md" in c
              for m in re.findall(r"\]\((fig_[^)]+\.png)\)", c["md"])}
    for name in linked:
        shutil.copy2(PROCESO / name, FIGS / name)
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    n_img = len(list(NB_FIGS.glob("*.png")))
    size = sum(p.stat().st_size for p in FIGS.rglob("*.png")) / 1e6
    print(f"{OUT_JSON.name}: {OUT_JSON.stat().st_size / 1e3:.0f} KB | imágenes de salida: {n_img} | figuras: {size:.1f} MB")


if __name__ == "__main__":
    main()
