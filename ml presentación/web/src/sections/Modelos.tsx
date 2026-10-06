import type { ReactNode } from 'react';
import { Cells, Md, NbImage, Raw, References, Source, Synthesis } from '@/components/Notebook';
import { DataTable, HBars } from '@/components/Charts';
import { Section } from '@/components/Section';
import { mdCell, type NbKey } from '@/lib/notebooks';
import * as R from '@/results';
import { paras, sentences, Summary } from './Datos';

const BASE = import.meta.env.BASE_URL;

// Párrafos literales de una celda de markdown, ubicados por su comienzo.
function para(nb: NbKey, i: number, start: string) {
  const p = mdCell(nb, i).split(/\n\s*\n/).find((x) => x.trim().startsWith(start));
  if (!p) throw new Error(`${nb}[${i}] no tiene un párrafo que empiece con "${start}"`);
  return p.trim();
}

// Primer párrafo de una celda de Resumen_Final.ipynb, sin su encabezado
const resumenFirst = (i: number) => mdCell('resumen', i).replace(/^#+\s.*\n+/, '').split(/\n\s*\n/)[0].trim();

function Stack({ children }: { children: ReactNode }) {
  return <div className="space-y-10 max-w-[1100px]">{children}</div>;
}

// Interpretación del cuaderno, con su origen
function Reading({ nb, i, starts }: { nb: NbKey; i: number; starts: string[] }) {
  return (
    <div className="max-w-[960px]">
      <p className="text-white/50 text-[12px] mb-3">Interpretación del cuaderno</p>
      <div className="space-y-4">
        {starts.map((s) => <Md key={s} text={para(nb, i, s)} />)}
      </div>
      <Source nb={nb} cells={[i]} />
    </div>
  );
}

function Fig({ name, alt, caption }: { name: string; alt: string; caption: string }) {
  return (
    <figure className="max-w-[1100px]">
      <NbImage name={name} alt={alt} />
      <figcaption className="text-white/45 text-[12px] mt-2">{caption}</figcaption>
    </figure>
  );
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
        <div className="space-y-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14 items-start">
            <div>
              <Md text={mdCell('exp1', 2)} />
              <Source nb="exp1" cells={[2]} />
            </div>
            <a href={`${BASE}figs/fig_pipeline_experimento.png`} target="_blank" rel="noreferrer" className="block rounded-[16px] bg-white p-2 sm:p-3">
              <img src={`${BASE}figs/fig_pipeline_experimento.png`} alt="Flujo del experimento de 140 combinaciones" loading="lazy" className="w-full h-auto" />
            </a>
          </div>
          <div className="max-w-[1100px]">
            <DataTable title="Resultados de los 7 modelos de cada tarea, con su mejor combinación" {...R.SUMMARY} best={0} />
          </div>
        </div>
      }
      tabs={[
        {
          label: 'Diseño y validación',
          content: (
            <Stack>
              <div className="glass p-5 sm:p-6 max-w-[960px] border-l-4 !border-l-white/30 space-y-4">
                <p className="text-white/50 text-[12px]">Síntesis del equipo</p>
                {paras('4. Diseño experimental').map((p) => <Md key={p} text={p} />)}
                <p className="text-white/35 text-[11px] font-mono">Resumen_final.md, sección 4</p>
              </div>
              <Cells nb="exp1" picks={[3, { i: 4, out: [1] }, 5, 6, 7, 9, 10, 11]} />
            </Stack>
          ),
        },
        {
          label: 'Modelos base',
          content: (
            <Stack>
              <DataTable title="Clasificación: F1 macro en cuatro escenarios" {...R.BASE_F1} best={0} />
              <DataTable title="Regresión: R² en cuatro escenarios" {...R.BASE_R2} best={0} />
              <DataTable title="Regresión: R² con una macrorregión fuera del entrenamiento" {...R.BASE_LORO}
                note={mdCell('benchmark', 11).replace(/\s*\n\s*/g, ' ')} />
              <Reading nb="benchmark" i={22} starts={['Los contrastes', 'Los modelos lineales']} />
            </Stack>
          ),
        },
        {
          label: 'Clasificación',
          content: (
            <Stack>
              <Synthesis i={12} />
              <DataTable title="Mejor combinación de cada modelo" {...R.CLF_BEST} best={0} />
              <Fig name="exp2_9_0.png" alt="Matriz de confusión de cada modelo"
                caption="Matriz de confusión de cada modelo, normalizada por fila (Experimento 2, celda 9)" />
              <Fig name="exp2_11_0.png" alt="Curva ROC de cada modelo, una por clase"
                caption="Curva ROC de cada modelo, uno contra el resto (Experimento 2, celda 11)" />
              <Synthesis i={6} />
              <Cells nb="exp2" picks={[14]} />
              <DataTable title="Calibración: original, Platt e isotónica" {...R.CALIBRATION} />
              <Fig name="exp2_16_0.png" alt="Diagramas de confiabilidad de cada modelo"
                caption="Diagramas de confiabilidad con las tres versiones de las probabilidades (Experimento 2, celda 16)" />
              <Reading nb="exp2" i={19} starts={['El balanceo no mejoró', 'Los árboles salen bien calibrados']} />
            </Stack>
          ),
        },
        {
          label: 'Regresión',
          content: (
            <Stack>
              <Synthesis i={14} />
              <DataTable title="Mejor combinación de cada modelo" {...R.REG_BEST} best={0} />
              <Cells nb="exp3" picks={[7, 8]} />
              <Fig name="exp3_10_0.png" alt="Residuos del mejor modelo de regresión"
                caption="Residuos de Random Forest con las predicciones fuera de pliegue (Experimento 3, celda 10)" />
              <DataTable title="Pruebas sobre los residuos de Random Forest" {...R.RESIDUAL_TESTS} />
              <Cells nb="exp3" picks={[12, 13]} />
              <Reading nb="exp3" i={14} starts={['Random Forest es el mejor', 'Los residuos de Random Forest']} />
            </Stack>
          ),
        },
      ]}
      after={<References items={[{ nb: 'exp1', i: 16 }, { nb: 'benchmark', i: 23 }, { nb: 'exp2', i: 20 }, { nb: 'exp3', i: 15 }]} />}
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
          content: (
            <Stack>
              <DataTable title="Los cuatro optimizadores con el mismo presupuesto de 30 evaluaciones" {...R.OPTIMIZERS} best={0} />
              <Reading nb="exp4" i={20} starts={['Con 30 evaluaciones', 'Por unidad de presupuesto', 'La genética, con población']} />
            </Stack>
          ),
        },
        {
          label: 'Costo computacional',
          content: (
            <Stack>
              <Synthesis i={10} />
              <DataTable title="Modelo estándar frente a optimizado" {...R.STD_VS_OPT} />
              <Reading nb="exp5" i={24} starts={['En la tabla de estándar']} />
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
              <div className="grid gap-8 xl:grid-cols-[1.3fr_1fr]">
                <DataTable title="Clasificación: DeLong entre los finalistas" {...R.DELONG} />
                <DataTable title="Regresión: conjunto de confianza de modelos" {...R.MCS} best={0} />
              </div>
              <Reading nb="exp6" i={19} starts={['En regresión']} />
            </Stack>
          ),
        },
        {
          label: 'Interpretabilidad',
          content: (
            <Stack>
              <Synthesis i={18} />
              <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] items-start">
                <div>
                  <p className="text-white text-[15px] sm:text-[16px] font-[450] mb-4">Importancia media |SHAP|, Random Forest de clasificación</p>
                  <HBars color="#3987e5" format={(v) => v.toFixed(4)}
                    rows={R.SHAP_CLF.rows.map(([label, value]) => ({ label, value }))} />
                  <p className="text-white/35 text-[11px] font-mono mt-3">{R.SHAP_CLF.source}</p>
                  <Raw nb={R.SHAP_CLF.raw.nb} outs={R.SHAP_CLF.raw.outs} />
                </div>
                <Fig name="exp7_4_0.png" alt="SHAP global en clasificación"
                  caption="Diagrama de enjambre SHAP para la clase Baja (Experimento 7, celda 4)" />
              </div>
              <Reading nb="exp7" i={11} starts={['La hipótesis de partida', 'LIME y SHAP']} />
            </Stack>
          ),
        },
      ]}
      after={<References items={[{ nb: 'exp6', i: 20 }, { nb: 'exp7', i: 12 }]} />}
    />
  );
}
