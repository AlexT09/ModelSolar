import { Cells, Md, References, type Pick } from '@/components/Notebook';
import { Section, type Tab } from '@/components/Section';
import { mdCell, resumenMd, type NbKey } from '@/lib/notebooks';

// Párrafo literal de una celda de markdown, ubicado por su comienzo.
function para(nb: NbKey, i: number, start: string) {
  const p = mdCell(nb, i).split(/\n\s*\n/).find((x) => x.trim().startsWith(start));
  if (!p) throw new Error(`${nb}[${i}] no tiene un párrafo que empiece con "${start}"`);
  return p.trim();
}

function Summary({ text, source }: { text: string; source: string }) {
  return (
    <div>
      <Md text={text} className="!text-[17px] sm:!text-[19px] !text-white/80" />
      <p className="text-white/35 text-[11px] font-mono mt-3">{source}</p>
    </div>
  );
}

// Cada pestaña muestra solo las celdas que sostienen el objetivo de la sección: qué se hizo,
// el resultado principal y la interpretación del cuaderno. El resto queda en el cuaderno enlazado.
const tab = (label: string, nb: NbKey, picks: Pick[]): Tab => ({
  label,
  content: <Cells nb={nb} picks={picks} />,
});

export function ModelosBase() {
  return (
    <Section
      id="modelos-base"
      kicker="Línea 1 · Predecir el índice de aptitud"
      title="2. Modelos base sobre la base mundial"
      summary={<Summary text={para('benchmark', 22, 'Los contrastes')} source="Benchmark_Modelos_Base.ipynb, celda 22" />}
      stats={[
        { value: '0.818', label: 'F1 macro del SVM RBF ajustado (AUC 0.960)', source: 'Benchmark, celda 13' },
        { value: '0.806', label: 'R² del SVR RBF ajustado', source: 'Benchmark, celda 16' },
        { value: '0.79 → 0.48', label: 'R² de KNN con y sin latitud y longitud', source: 'Benchmark, celda 8' },
        { value: '< 0', label: 'R² de todos los modelos con una región fuera', source: 'Benchmark, celda 10' },
      ]}
      tabs={[
        tab('Diseño', 'benchmark', [0, 1, 2]),
        tab('Con y sin ubicación', 'benchmark', [5, 6, { i: 8, out: [0] }, 21]),
        tab('Región fuera', 'benchmark', [9, 10, 11]),
        tab('Ajuste anidado', 'benchmark', [12, 15, { i: 16, out: [7] }]),
        tab('Gráficas', 'benchmark', [18, 19, 20]),
        tab('Conclusiones', 'benchmark', [22]),
      ]}
      after={<References items={[{ nb: 'benchmark', i: 23 }]} />}
    />
  );
}

export function Experimento() {
  return (
    <Section
      id="experimento"
      kicker="Línea 1 · Predecir el índice de aptitud"
      title="3. Experimento de 140 combinaciones"
      summary={<Summary text={para('exp2', 19, 'Los tres modelos')} source="Experimento_2_Clasificacion.ipynb, celda 19" />}
      stats={[
        { value: '136', label: 'combinaciones corridas: 108 de clasificación y 28 de regresión', source: 'Experimento 1, celda 15' },
        { value: '0.894', label: 'F1 macro de Random Forest (XGBoost 0.888)', source: 'Experimento 2, celda 7' },
        { value: '0.902', label: 'R² de Random Forest (XGBoost 0.899)', source: 'Experimento 3, celda 6' },
        { value: '0.149', label: 'importancia |SHAP| de la longitud, la mayor', source: 'Experimento 7, celda 4' },
      ]}
      tabs={[
        tab('Diseño', 'exp1', [0, 1, 2, 3, { i: 4, out: [1] }, 5, 10, 11, { i: 15, out: [0] }]),
        tab('Clasificación', 'exp2', [0, 6, 7, 8, 9, 12, 13, 14, 16, 19]),
        tab('Regresión', 'exp3', [0, 5, 6, 9, 10, 12, 13, 14]),
        tab('Optimizadores', 'exp4', [0, 3, 4, 10, 11, 12, { i: 13, out: [0] }, 14, { i: 15, out: [] }, 20]),
        tab('Costo computacional', 'exp5', [0, 5, 22, 23, 24]),
        tab('Estadística formal', 'exp6', [0, 3, 4, 5, 6, 8, 9, 12, 13, 19]),
        tab('Interpretabilidad', 'exp7', [0, 3, 4, 9, 10, 11]),
      ]}
      after={
        <References items={[
          { nb: 'exp1', i: 16 }, { nb: 'exp2', i: 20 }, { nb: 'exp3', i: 15 }, { nb: 'exp4', i: 21 },
          { nb: 'exp5', i: 25 }, { nb: 'exp6', i: 20 }, { nb: 'exp7', i: 12 },
        ]} />
      }
    />
  );
}

export function BaseColombia() {
  return (
    <Section
      id="colombia"
      kicker="Línea 2 · Predecir la generación diaria"
      title="4. Base de generación real en Colombia"
      summary={<Summary text={para('clima', 0, 'Pregunta:')} source="Clima_a_Generacion_Colombia.ipynb, celda 0" />}
      stats={[
        { value: '16', label: 'plantas con coordenadas verificadas', source: 'Clima, celda 20' },
        { value: '8,589', label: 'filas planta-día, sin valores vacíos', source: 'Clima, celdas 20 y 24' },
        { value: '6', label: 'zonas de plantas a menos de 100 km', source: 'Clima, celda 20' },
        { value: '2024–2026', label: 'del 1 de enero de 2024 al 28 de febrero de 2026', source: 'Clima, celda 22' },
      ]}
      tabs={[
        tab('Pregunta y fuentes', 'clima', [0, 1, 2]),
        tab('Factor de capacidad', 'clima', [4, 8, { i: 9, out: [0] }]),
        tab('Ubicación y clima', 'clima', [10, { i: 12, out: [0] }, 15, 17]),
        tab('Tabla diaria y su EDA', 'clima', [19, 20, 21, { i: 22, out: [0] }, 26, 27, 29, { i: 30, out: [0] }]),
      ]}
    />
  );
}

export function QueExplicaElClima() {
  return (
    <Section
      id="clima"
      kicker="Línea 2 · Predecir la generación diaria"
      title="5. Qué explica el clima de la generación diaria"
      summary={<Summary text={resumenMd['5. Resultados y métricas clave'].split(/\n\s*\n/)[1]} source="Resumen_final.md, sección 5" />}
      stats={[
        { value: '0.493', label: 'R² mediana dentro de planta con la radiación best_match', source: 'Clima, celda 37' },
        { value: '84 %', label: 'de la varianza del FC es día a día dentro de cada planta', source: 'Clima, celda 37' },
        { value: '4.7', label: 'puntos de FC por cada kWh/m² de radiación diaria', source: 'Clima, celda 38' },
        { value: '0.469', label: 'R² de Lasso ajustado, el mejor modelo base', source: 'Benchmark Colombia, celda 7' },
      ]}
      tabs={[
        tab('Antes de modelar', 'clima', [31, { i: 32, out: [] }, 33, 34]),
        tab('Cuánto explica el clima', 'clima', [36, { i: 37, out: [0, 1] }, 38, 48, 49]),
        tab('Modelos base', 'benchmark_col', [0, 1, 2, 6, { i: 7, out: [0] }, 9, { i: 10, out: [0] }, 12, 13, 14, 15, 16]),
        {
          label: 'Conclusiones',
          content: (
            <div className="space-y-10">
              <Cells nb="clima" picks={[54]} />
              <Cells nb="benchmark_col" picks={[18]} />
            </div>
          ),
        },
      ]}
      after={<References items={[{ nb: 'clima', i: 55 }, { nb: 'benchmark_col', i: 19 }]} />}
    />
  );
}

const RESUMEN_TABS = [
  ['Conclusiones', '8. Conclusiones y lo que queda pendiente'],
  ['Resultados y métricas clave', '5. Resultados y métricas clave'],
  ['Pruebas estadísticas', '6. Las pruebas estadísticas'],
  ['Interpretabilidad y rendimiento', '7. Qué aprendimos sobre los modelos (interpretabilidad y rendimiento)'],
] as const;

export function Cierre() {
  return (
    <Section
      id="conclusiones"
      kicker="Cierre"
      title="6. Resultados y conclusiones"
      summary={<Summary text={resumenMd['8. Conclusiones y lo que queda pendiente'].split(/\n\s*\n/)[0]} source="Resumen_final.md, sección 8" />}
      stats={[
        { value: '0.894', label: 'F1 macro de Random Forest en la base mundial, con validación espacial', source: 'Experimento 2, celda 7' },
        { value: '0.902', label: 'R² de Random Forest sobre el índice', source: 'Experimento 3, celda 6' },
        { value: '< 0', label: 'R² al predecir una región que el modelo no vio', source: 'EDA, celda 91' },
        { value: '0.469', label: 'R² del clima sobre la generación diaria real en Colombia', source: 'Benchmark Colombia, celda 7' },
      ]}
      tabs={RESUMEN_TABS.map(([label, key]) => ({
        label,
        content: (
          <div className="max-w-[960px] space-y-4">
            <Md text={resumenMd[key]} noImages />
            <p className="text-white/40 text-[12px] font-mono pt-2">Fuente: proceso/Resumen_final.md, sección {key.split('.')[0]}</p>
          </div>
        ),
      }))}
    />
  );
}
