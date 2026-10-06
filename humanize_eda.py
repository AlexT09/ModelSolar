import json

file_path = 'ml presentación/proceso/EDA_Corregido(Entregable 3).ipynb'
with open(file_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

replacements = [
    ('Ese desbalance no es un defecto del muestreo: viene de que la mayoría de las plantas del dataset ya están construidas en terrenos que el propio índice califica como favorables, algo esperable si quien construye una planta solar primero revisa la pendiente del terreno. El problema real no es que Baja sea minoritaria, sino de dónde sale esa minoría...', 
     'El desbalance tiene sentido: las plantas se hacen en terrenos buenos. Lo raro es por qué hay plantas en terreno Baja.'),
    
    ('La Entrega 1 reportó "una única violación" en la validación de rangos. Eso era incorrecto: hay al menos doce problemas distintos, cada uno con una causa identificable en la metodología del paper... Los numeramos D1 a D14.',
     'En la entrega pasada vimos un solo problema de rangos. Mirando mejor, encontramos 14 fallas (D1 a D14).'),
    
    ('Esto no es un error, es la convención del paper para marcar terreno plano, donde la orientación no está definida.',
     'El paper usa ese valor para marcar el terreno plano, porque no tiene orientación.'),
    
    ('No es ruido aleatorio, es un artefacto sistemático del método de unión espacial, así que `area` no sirve como medida confiable del tamaño físico de una planta.',
     'La unión espacial genera estos datos raros, entonces `area` no nos va a servir mucho para ver el tamaño real.'),
    
    ('Ningún par de filas es idéntico de principio a fin, por eso el chequeo ingenuo de duplicados exactos da cero y parece confirmar lo que decía la Entrega 1.',
     'Las filas nunca son 100% idénticas, por eso un .duplicated() directo no sirve y parecía que la Entrega 1 estaba bien.'),
    
    ('El resultado no es la velocidad media del viento en el sitio, es la magnitud del viento vectorial medio anual, que por construcción es menor. Hay que leerla con ese matiz, no como un sensor de viento real.',
     'Ese número es la magnitud del viento vectorial medio, que da valores más bajos. No podemos usarlo como si fuera la velocidad del viento.'),
    
    ('dentro de estos países el "clima" es casi una constante compartida por decenas de plantas, no una medición local.',
     'en esos países los valores del clima se repiten igualitos para muchas plantas.'),
     
    ('No es una limpieza que resuelva el desbalance, pero sí evita que un 3.4 % de la clase minoritaria sea, literalmente, ausencia de datos disfrazada de terreno malo.',
     'La limpieza no arregla el desbalance, pero sacamos esos casos donde faltaban datos que parecían clase baja.'),
     
    ('Usar seno y coseno en lugar del ángulo en grados es la forma estándar de tratar variables circulares en estadística: 1 y 359 grados son casi el mismo punto en la brújula, pero numéricamente están casi tan separados como es posible (Fisher, 1993).',
     'Usamos seno y coseno para los ángulos porque 1° y 359° están cerca en la realidad pero muy lejos si usamos solo el número.'),
     
    ('no es una distribución naturalmente sesgada, es una mezcla de mediciones buenas y mediciones con error de cálculo.',
     'la distribución mezcla datos correctos con algunos que salieron mal calculados.'),
     
    ('La relación local es real; lo que falta es una relación global que conecte una región con otra. Eso es justo lo que un desplazamiento entre lotes de procesamiento produciría.',
     'Parece que hay una relación local, pero a nivel global todo está desplazado por lotes.'),
     
    ('Esto corrige tres afirmaciones de entregas anteriores a la vez... Lo mostramos en tres pasos: primero, que el IAS no correlaciona con las variables que su propia fórmula declara; segundo, que sí correlaciona con la posición geográfica; tercero, que un modelo entrenado en un continente no predice bien en otro.',
     'Revisamos el IAS y notamos que no tiene que ver con sus variables de fórmula. Depende sobre todo de las coordenadas, y si entrenamos un modelo en un continente, se cae a pedazos en el otro.'),
     
    ('Una variable que no entra en la fórmula del índice explica más de su variación que las que sí entran.',
     'La longitud explica el índice mejor que las variables que supuestamente lo calculan.'),
     
    ('Si el IAS reflejara una relación física estable entre terreno y aptitud, esa relación debería transferirse entre continentes. No se transfiere.',
     'El modelo no sirve cuando probamos en otros continentes.'),
     
    ('Esto no invalida el dataset para este proyecto, pero sí cambia lo que se puede afirmar con él: el IAS funciona razonablemente bien para comparar plantas dentro de una misma región, y no es fiable para comparar entre regiones sin controlar ese efecto de lote.',
     'Podemos usar el IAS para comparar plantas cercanas, pero falla cuando comparamos entre regiones distintas.'),
     
    ('Roberts et al. (2017) documentan este problema en detalle para datos con estructura espacial, temporal o jerárquica, y recomiendan particionar por bloques en vez de al azar quede como estándar en ese tipo de datos.',
     'Partimos los datos por bloques espaciales para que la validación sea más realista y no mezcle plantas vecinas.'),
     
    ('La regla de inclusión es simple: una variable entra si está disponible antes de invertir en una coordenada cualquiera, si no es una copia determinista de otra variable ya incluida, y si no arrastra un centinela sin tratar.',
     'Dejamos solo las variables que se pueden saber antes de instalar la planta y que no estén duplicadas o rotas.'),
     
    ('Esto no significa que el dataset esté mal construido para los fines de este curso: significa que hay que ser honestos sobre qué mide el índice.',
     'El índice del dataset mide más la región que la aptitud real del terreno.'),
     
    ('quedan tres implicaciones directas. Primera,', 'tenemos que tener en cuenta que'),
    ('Segunda,', 'Además'),
    ('Tercera,', 'Por último'),
    
    ('Si eso se confirma, hay que reportarlo como el hallazgo central del proyecto, no esconderlo detrás de una métrica de desempeño alta.',
     'Este problema de las regiones va a afectar mucho las métricas.'),
     
    ('03_modelos_clasificacion_regresion.ipynb', 'los cuadernos de modelos')
]

modified = False
for cell in nb['cells']:
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
    print('EDA updated successfully.')
else:
    print('No changes made to EDA.')
