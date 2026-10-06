import json

file_path = 'ml presentación/proceso/Benchmark_Colombia.ipynb'
with open(file_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

replacements = [
    # F1 (Celda 2)
    ('hyperparameter tuning: validación anidada (Varma y Simon, 2006; Cawley y Talbot, 2010). El bucle interno usa solo las filas de entrenamiento y deja fuera, una a una, cada zona de entrenamiento.',
     'Usamos validación anidada para optimizar los hiperparámetros. Todo se ajusta dentro del fold para no hacer trampa.'),
     
    # F3 (Celda 18)
    ('Un AUC de 0.75 a 0.77 quiere decir que, tomando al azar un día de una clase y uno de otra, el modelo ordena bien la pareja tres de cada cuatro veces.',
     'El AUC de ~0.76 indica que los modelos separan decentemente los días de mucha generación y poca generación.'),
    ('Lo que este benchmark muestra de la base de datos:\n- Con pocas zonas, los modelos flexibles sobreajustan...',
     'Viendo esto, los modelos muy flexibles tienden a memorizar las 6 zonas y por eso fallan...'),
    ('Eso indica que, con 6 zonas, lo que funciona es suavizar mucho.',
     'Por eso, la mejor estrategia aquí resultó ser modelos simples y bastante regularizados.')
]

modified = False
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'markdown':
        source_str = ''.join(cell['source'])
        orig_str = source_str
        
        for old, new in replacements:
            source_str = source_str.replace(old, new)
            
        if source_str != orig_str:
            cell['source'] = [source_str]
            modified = True

if modified:
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    print('Benchmark_Colombia updated successfully.')
else:
    print('No changes made to Benchmark_Colombia.')
