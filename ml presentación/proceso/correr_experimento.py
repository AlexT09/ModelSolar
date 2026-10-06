"""Lanza las combinaciones modelo × balanceo × optimizador. Se puede interrumpir y relanzar: salta lo que ya está hecho.

Ejemplos, desde `proceso/`:
    python correr_experimento.py                                  # las 140 combinaciones
    python correr_experimento.py --modelos "Naive Bayes" Ridge    # solo algunos modelos
    python correr_experimento.py --semilla 7 --modelos XGBoost    # otra semilla, para la sensibilidad
"""
from src.runner import main

if __name__ == "__main__":
    main()
