import { Cells, Md, NbImage, References, Source, Synthesis } from '@/components/Notebook';
import { Section } from '@/components/Section';
import { mdCell, type NbKey } from '@/lib/notebooks';
import { paras, sentences, Summary } from './Datos';

const BASE = import.meta.env.BASE_URL;

// Párrafo literal de una celda de markdown, ubicado por su comienzo.
function para(nb: NbKey, i: number, start: string) {
  const p = mdCell(nb, i).split(/\n\s*\n/).find((x) => x.trim().startsWith(start));
  if (!p) throw new Error(`${nb}[${i}] no tiene un párrafo que empiece con "${start}"`);
  return p.trim();
}

// Primer párrafo de una celda de Resumen_Final.ipynb, sin su encabezado
const resumenFirst = (i: number) => mdCell('resumen', i).replace(/^#+\s.*\n+/, '').split(/\n\s*\n/)[0].trim();

function Stack({ children }: { children: React.ReactNode }) {
  return <div className="space-y-8">{children}</div>;
}

// Resumen_final.md §5, primer párrafo: resultados de la base mundial
const RESULTADOS_MUNDIAL = paras('5. Resultados y métricas clave')[0];
// Resumen_final.md §8: las dos oraciones de la base mundial (la tercera es de Colombia)
const CONCLUSION = sentences(paras('8. Conclusiones y lo que queda pendiente')[0], 2);

// 4. Modelos implementados y resultados obtenidos
export function Modelos() {
  return (
    <Section
      id="modelos"
      kicker="Modelos"
      title="4. Modelos implementados y resultados"
      summary={<Summary text={RESULTADOS_MUNDIAL} source="Resumen_final.md, sección 5" />}
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
        {
          label: 'Clasificación',
          content: (
            <Stack>
              <Synthesis i={12} />
              <Cells nb="exp2" picks={[6, 7, 8, 9]} />
              <Synthesis i={6} />
              <Cells nb="exp2" picks={[12, 13, 19]} />
            </Stack>
          ),
        },
        {
          label: 'Regresión',
          content: (
            <Stack>
              <Synthesis i={14} />
              <Cells nb="exp3" picks={[5, 6, 9, 10, 14]} />
            </Stack>
          ),
        },
      ]}
      after={<References items={[{ nb: 'exp2', i: 20 }, { nb: 'exp3', i: 15 }]} />}
    />
  );
}

// 5. Comparación de métodos de optimización
export function Optimizacion() {
  return (
    <Section
      id="optimizacion"
      kicker="Optimización"
      title="5. Comparación de métodos de optimización"
      summary={<Summary text={resumenFirst(8)} source="Resumen_Final.ipynb, celda 8" />}
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
        {
          label: 'Optimizadores',
          content: <Cells nb="exp4" picks={[3, 4, 12, { i: 13, out: [0] }, 14, { i: 15, out: [] }, 20]} />,
        },
        {
          label: 'Costo computacional',
          content: (
            <Stack>
              <Synthesis i={10} />
              <Cells nb="exp5" picks={[22, 23, 24]} />
            </Stack>
          ),
        },
      ]}
      after={<References items={[{ nb: 'exp4', i: 21 }, { nb: 'exp5', i: 25 }]} />}
    />
  );
}

// 6. Resultados finales y conclusiones
export function Conclusiones() {
  return (
    <Section
      id="conclusiones"
      kicker="Conclusiones"
      title="6. Resultados finales y conclusiones"
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
        {
          label: 'Pruebas estadísticas',
          content: (
            <Stack>
              <Synthesis i={16} />
              <Cells nb="exp6" picks={[3, 4, 8, 9, 12, 13]} />
            </Stack>
          ),
        },
        {
          label: 'Interpretabilidad',
          content: (
            <Stack>
              <Synthesis i={18} />
              <Cells nb="exp7" picks={[3, 4, 9, 10, 11]} />
            </Stack>
          ),
        },
      ]}
      after={<References items={[{ nb: 'exp6', i: 20 }, { nb: 'exp7', i: 12 }]} />}
    />
  );
}
