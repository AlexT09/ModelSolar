import json

file_path = 'ml presentación/proceso/Experimento_1_Diseno.ipynb'
with open(file_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Humanizing cell 14
new_source = """## 7. Sobre la evaluación

El código asegura un par de cosas para que los resultados sirvan:
- Validamos por bloques espaciales (ni en el outer ni en el inner fold se mezclan).
- SMOTE y ADASYN solo se aplican en el fit del pipeline para no afectar los datos de validación.

A todos los optimizadores les dimos exactamente 30 iteraciones. Si no, no podríamos ver cuál aprende más rápido de forma justa.
"""

for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'markdown':
        source_str = ''.join(cell['source'])
        if 'Garantías metodológicas de la evaluación' in source_str:
            cell['source'] = [new_source]

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)
print('Exp1 updated.')
