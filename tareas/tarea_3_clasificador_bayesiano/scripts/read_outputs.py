import json

with open('tarea3.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for i, c in enumerate(nb['cells']):
    if c['cell_type'] == 'code' and c.get('outputs'):
        print(f"=== CELL {i} ===")
        src = ''.join(c.get('source', []))
        # Print first line of source for context
        print(f"CODE: {src[:80]}...")
        for o in c['outputs']:
            if o.get('output_type') == 'stream':
                text = o.get('text', [])
                if isinstance(text, list):
                    print(''.join(text))
                else:
                    print(text)
        print()
