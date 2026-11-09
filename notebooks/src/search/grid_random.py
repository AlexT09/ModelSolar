"""Búsqueda en grilla y búsqueda aleatoria.

La grilla reparte el presupuesto entre los hiperparámetros y evalúa los centros de celda. La aleatoria muestrea
el mismo cubo de forma uniforme; con el mismo presupuesto explora más valores distintos de cada hiperparámetro,
lo que ayuda cuando solo unos pocos importan (Bergstra y Bengio, 2012).
"""
from .espacio import aleatorios, grilla


def buscar_grilla(evaluador, espacio, semilla):
    """Evalúa todos los puntos de la grilla (como mucho `evaluador.presupuesto`). La semilla no se usa."""
    for p in grilla(espacio, evaluador.presupuesto):
        evaluador(p)
    return {}


def buscar_aleatoria(evaluador, espacio, semilla):
    """Evalúa puntos uniformes hasta gastar el presupuesto. Los repetidos salen del caché y no cuentan."""
    lote = 0
    while evaluador.queda and lote < 20:
        for p in aleatorios(espacio, evaluador.presupuesto, semilla + 1000 * lote):
            if not evaluador.queda:
                break
            evaluador(p)
        lote += 1
    return {}
