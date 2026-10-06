import { Cells, Md, NbImage, References, Source, type Pick } from '@/components/Notebook';
import { Section, type Tab } from '@/components/Section';
import { mdCell, resumenMd, type NbKey } from '@/lib/notebooks';

const BASE = import.meta.env.BASE_URL;

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

// Cada pestaña muestra las celdas que la guía del entregable pide para esa parte: qué se hizo,
// el resultado y la interpretación del cuaderno. El resto queda en el cuaderno enlazado.
const tab = (label: string, nb: NbKey, picks: Pick[]): Tab => ({
  label,
  content: <Cells nb={nb} picks={picks} />,
});

// 6. Modelos implementados y resultados obtenidos
export function Modelos() {
  return (
    <Section
      id="modelos"
      kicker="Modelos"
      title="6. Modelos implementados y resultados"
      summary={<Summary text={para('exp2', 19, 'Los tres modelos')} source="Experimento_2_Clasificacion.ipynb, celda 19" />}
      stats={[
        { value: '136', label: 'combinaciones corridas: 108 de clasificación y 28 de regresión', source: 'Experimento 1, celda 15' },
        { value: '0.894', label: 'F1 macro de Random Forest (XGBoost 0.888)', source: 'Experimento 2, celda 7' },
        { value: '0.902', label: 'R² de Random Forest (XGBoost 0.899)', source: 'Experimento 3, celda 6' },
        { value: '< 0', label: 'R² de todos los modelos base al predecir una región que no vieron', source: 'Benchmark, celda 10' },
      ]}
      visual={
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14 items-start">
          <div>
            <Md text={mdCell('exp1', 2)} />
            <Source nb="exp1" cells={[2]} />
          </div>
          <a href={`${BASE}figs/fig_pipeline_experimento.png`} target="_blank" rel="noreferrer" className="block rounded-[16px] bg-white p-2 sm:p-3">
            <img src={`${BASE}figs/fig_pipeline_experimento.png`} alt="Flujo del experimento de 140 combinaciones" loading="lazy" className="w-full h-auto" />
          </a>
        </div>
      }
      tabs={[
        tab('Validación y diseño', 'exp1', [0, 3, { i: 4, out: [1] }, 5, 6, 10, 11]),
        tab('Modelos base', 'benchmark', [0, 2, 5, 6, { i: 8, out: [0] }, 9, 10, 11, 21, 22]),
        tab('Clasificación', 'exp2', [0, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 19]),
        tab('Regresión', 'exp3', [0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]),
      ]}
      after={
        <References items={[{ nb: 'exp1', i: 16 }, { nb: 'benchmark', i: 23 }, { nb: 'exp2', i: 20 }, { nb: 'exp3', i: 15 }]} />
      }
    />
  );
}

// 7. Comparación de métodos de optimización
export function Optimizacion() {
  return (
    <Section
      id="optimizacion"
      kicker="Optimización"
      title="7. Comparación de métodos de optimización"
      summary={<Summary text={para('exp4', 20, 'Con 30 evaluaciones')} source="Experimento_4_Optimizadores.ipynb, celda 20" />}
      stats={[
        { value: '0.240', label: 'área bajo la curva de regret de la bayesiana (grid 0.486, menor es mejor)', source: 'Experimento 4, celda 13' },
        { value: '14 y 12', label: 'veces que random search y bayesiana fueron los mejores, de 34 grupos', source: 'Experimento 4, celda 4' },
        { value: '27.8 s', label: 'por evaluación con la bayesiana, frente a unos 20 s de las demás', source: 'Experimento 4, celda 8' },
        { value: '64.2 → 5.4 s', label: 'XGBoost de exact a hist, con el F1 casi igual', source: 'Experimento 5, celda 23' },
      ]}
      visual={
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-14 items-start">
          <div>
            <Md text={mdCell('exp4', 10)} />
            <Source nb="exp4" cells={[10, 11]} />
          </div>
          <NbImage name="exp4_11_0.png" alt="Curvas de desempeño anytime de los cuatro optimizadores" />
        </div>
      }
      tabs={[
        tab('Optimizadores', 'exp4', [0, 3, 4, 5, 6, 7, 8, 12, 13, 14, 15, 16, { i: 17, out: [0] }, 18, 19, 20]),
        tab('Costo computacional', 'exp5', [0, 2, 3, 4, 5, 8, 9, 14, { i: 15, out: [0] }, 18, 19, 20, { i: 21, out: [1] }, 22, 23, 24]),
      ]}
      after={<References items={[{ nb: 'exp4', i: 21 }, { nb: 'exp5', i: 25 }]} />}
    />
  );
}

// Las dos primeras oraciones del párrafo de conclusiones de Resumen_final.md, que tratan la base mundial
const CONCLUSION = resumenMd['8. Conclusiones y lo que queda pendiente']
  .split(/\n\s*\n/)[0]
  .split(/(?<=\.)\s+/)
  .slice(0, 2)
  .join(' ');

const RESULTADOS_MUNDIAL = resumenMd['5. Resultados y métricas clave'].split(/\n\s*\n/)[0];

// 8. Resultados finales y conclusiones
export function Conclusiones() {
  return (
    <Section
      id="conclusiones"
      kicker="Conclusiones"
      title="8. Resultados finales y conclusiones"
      summary={<Summary text={CONCLUSION} source="Resumen_final.md, sección 8" />}
      stats={[
        { value: 'RF ≈ XGBoost', label: 'DeLong no los distingue (p de Holm 0.84 en la clase Baja)', source: 'Experimento 6, celda 9' },
        { value: 'Random Forest', label: 'único modelo de regresión en el conjunto de confianza al 90 %', source: 'Experimento 6, celda 13' },
        { value: '0.149', label: 'importancia |SHAP| de la longitud, la variable que más pesa', source: 'Experimento 7, celda 4' },
        { value: '< 0', label: 'R² al predecir una región que el modelo no vio', source: 'EDA, celda 91' },
      ]}
      visual={
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-14 items-start">
          <div>
            <Md text={mdCell('exp6', 5)} />
            <Md text={para('exp6', 19, 'En clasificación')} className="mt-4" />
            <Source nb="exp6" cells={[5, 6, 19]} />
          </div>
          <NbImage name="exp6_6_0.png" alt="Diagramas de diferencia crítica de Nemenyi por niveles" />
        </div>
      }
      tabs={[
        tab('Comparación estadística', 'exp6', [0, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]),
        tab('Interpretabilidad', 'exp7', [0, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
        {
          label: 'Conclusiones',
          content: (
            <div className="max-w-[960px] space-y-6">
              <Md text={CONCLUSION} />
              <Md text={RESULTADOS_MUNDIAL} />
              <Md text={resumenMd['6. Las pruebas estadísticas']} noImages />
              <Md text={resumenMd['7. Qué aprendimos sobre los modelos (interpretabilidad y rendimiento)']} noImages />
              <p className="text-white/40 text-[12px] font-mono pt-2">Fuente: proceso/Resumen_final.md, secciones 5 a 8</p>
            </div>
          ),
        },
      ]}
      after={<References items={[{ nb: 'exp6', i: 20 }, { nb: 'exp7', i: 12 }]} />}
    />
  );
}
