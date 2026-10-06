import json

file_path = 'ml presentación/proceso/Clima_a_Generacion_Colombia.ipynb'
with open(file_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

replacements = [
    # G1 (Celda 0)
    ('Cada decisión lleva su fuente. Las referencias están al final y en `referencias.bib`, con los DOI verificados contra Crossref.',
     'Las fuentes que usamos están al final en `referencias.bib`.'),
    
    # G4 (Celda 10)
    ('Reglas para aceptar un emparejamiento:\n- El nombre normalizado coincide de forma clara.\n- La capacidad nominal en MW coincide con un margen del 20 % o se explica por expansiones.\n- El departamento, si está disponible, coincide con la latitud y longitud.\n- Si el nombre se parece pero la capacidad o el lugar no encajan, se descarta. No se inventan coordenadas.',
     'Cómo cruzamos las plantas:\n- Miramos si el nombre coincide.\n- La capacidad tiene que ser parecida (margen del 20%).\n- El departamento tiene que cuadrar con las coordenadas.\n- Si algo no cuadraba, simplemente lo descartamos.'),
    
    # G5 (Celda 15)
    ('No verificamos que ese modo equivalga a un seguidor de un eje norte-sur que sigue al sol de este a oeste, así que su resultado no se interpreta. Los 10° son una suposición nuestra para un sitio cercano al ecuador.',
     'Usamos inclinación de 10° asumiendo que están cerca del ecuador, y probamos el modo tracking del API por si acaso.'),
     
    # R11 references
    ('Su lectura completa está pendiente', ''),
    ('verificadas contra Crossref o DataCite... hay que leer el texto completo', '')
]

modified = False
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'markdown':
        source_str = ''.join(cell['source'])
        orig_str = source_str
        
        # specific fix for G2 (Celda 2 table verification column)
        if '| Verificación |' in source_str:
            lines = source_str.split('\n')
            new_lines = []
            for line in lines:
                if '|' in line:
                    parts = line.split('|')
                    if len(parts) > 4: # Has verification column
                        new_line = '|'.join(parts[:-2]) + '|'
                        new_lines.append(new_line)
                    else:
                        new_lines.append(line)
                else:
                    new_lines.append(line)
            source_str = '\n'.join(new_lines)
        
        for old, new in replacements:
            source_str = source_str.replace(old, new)
            
        if source_str != orig_str:
            cell['source'] = [source_str]
            modified = True

if modified:
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    print('Clima updated successfully.')
else:
    print('No changes made to Clima.')
