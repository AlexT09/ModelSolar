import json

file_path = 'ml presentación/proceso/Benchmark_Modelos_Base.ipynb'
with open(file_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

replacements = [
    # E1 (Celda 2)
    ('Métricas de clasificación:\n- F1 macro: promedio del F1 de las tres clases. Es la métrica principal, porque la clase Baja es el 3 % y la exactitud premiaría ignorarla.\n- Exactitud y exactitud balanceada (promedio del recall por clase).\n- Precisión macro y recall macro.\n- F1 de la clase Baja, la minoritaria.\n- AUC ROC macro uno contra el resto: para entender el ordenamiento, sin importar el umbral, usando probabilidades calibradas.',
     'Usamos el F1 macro como medida principal en clasificación porque casi no hay plantas de clase Baja (solo 3%) y la exactitud normal nos mentiría. También miramos exactitud balanceada y ROC AUC para tener más contexto.'),
    
    # E3 (Celda 21)
    ('6. Cómo leer los resultados', '6. Para interpretar los resultados'),
    ('- Si un modelo cae mucho al quitar latitud y longitud, una parte grande de lo que aprende es la ubicación, no el terreno.',
     '- La caída al sacar latitud y longitud muestra que el modelo hace trampa usando la ubicación.'),
    ('- Si cae al pasar de partición aleatoria a bloques, se estaba apoyando en plantas vecinas.',
     '- La diferencia entre aleatorio y bloques nos dice cuánto dependían de la planta de al lado.'),
    ('- Si dejando una región fuera sale negativo, no sirve fuera de los continentes que vio.',
     '- El R2 negativo dejando una región fuera significa que no generalizan.'),
    ('- Si el ajuste mejora poco, el límite está en los datos y no en los hiperparámetros.',
     '- Si optimizar los hiperparámetros no ayuda, ya le sacamos todo a los datos.'),
     
    # E4 (Celda 22)
    ('Los modelos lineales quedan bajos porque el índice tiene un nivel distinto en cada región, y un solo plano no puede representarlo. KNN y los SVM con kernel ajustan vecindarios locales y aprenden ese nivel.',
     'Los lineales fallan porque el índice cambia bruscamente de región a región. KNN y SVM lo hacen mejor porque se aprenden la zona de memoria.'),
    ('La interpretación completa y las propuestas de mejora con literatura están en el Resumen final.',
     'En el resumen del final se detallan más estos puntos y lo que queda por hacer.')
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
    print('Benchmark_Modelos_Base updated successfully.')
else:
    print('No changes made to Benchmark_Modelos_Base.')
