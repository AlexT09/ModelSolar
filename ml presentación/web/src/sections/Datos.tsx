import { useState, type ReactNode } from 'react';
import Prose, { Inline } from '@/components/Prose';
import WorldMap, { Chip } from '@/components/WorldMap';
import SlopeScatter from '@/components/SlopeScatter';
import { ClassBeforeAfter, FoldTable, RegionComposition } from '@/components/Charts';
import { Md, Output, References, Source } from '@/components/Notebook';
import { Section } from '@/components/Section';
import { fmt, summary, usePoints, type Points } from '@/lib/data';
import { resumenMd } from '@/lib/notebooks';
import * as C from '@/content';

const BASE = import.meta.env.BASE_URL;

export function Card({ title, children, className = '' }: { title?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`glass p-5 sm:p-7 ${className}`}>
      {title && <p className="text-white text-[15px] sm:text-[16px] font-[450] mb-5">{title}</p>}
      {children}
    </div>
  );
}

function Grid2({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`grid gap-8 lg:grid-cols-2 lg:gap-14 ${className}`}>{children}</div>;
}

function PointsGate({ children }: { children: (data: Points) => ReactNode }) {
  const { data, error } = usePoints();
  if (error) return <p className="text-white/60 text-[14px]">No se pudieron cargar los puntos ({error}).</p>;
  if (!data) {
    return (
      <div className="h-[300px] grid place-items-center rounded-[16px] border border-white/[0.06] text-white/50 text-[14px]">
        Cargando {fmt(summary.rows_clean)} plantas…
      </div>
    );
  }
  return <>{children(data)}</>;
}

const TREATMENTS: C.Treatment[] = ['Filas eliminadas', 'Variables derivadas', 'Documentado'];

function QualityGrid() {
  const [filter, setFilter] = useState<C.Treatment | null>(null);
  const issues = C.ISSUES.filter((d) => !filter || d.treatment === filter);
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        <Chip active={filter === null} onClick={() => setFilter(null)}>Todos ({C.ISSUES.length})</Chip>
        {TREATMENTS.map((t) => (
          <Chip key={t} active={filter === null || filter === t} onClick={() => setFilter(filter === t ? null : t)}>
            {t} ({C.ISSUES.filter((d) => d.treatment === t).length})
          </Chip>
        ))}
      </div>
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        {issues.map((d) => (
          <article key={d.id} className="glass p-5 sm:p-7 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-white/45 text-[12px] font-mono">{d.id}</span>
                <h3 className="text-white text-[18px] sm:text-[20px] font-[450] leading-[1.25] mt-1">
                  <Inline text={d.title} />
                </h3>
              </div>
              <span className="shrink-0 px-2.5 py-1.5 rounded-[8px] bg-white/[0.07] text-white/75 text-[12px]">{d.treatment}</span>
            </div>
            <Output text={d.output} />
            <Prose text={d.text} className="!text-[14px] sm:!text-[15px]" />
          </article>
        ))}
      </div>
    </>
  );
}

export const paras = (key: string) => resumenMd[key].split(/\n\s*\n/).map((p) => p.trim());
export const sentences = (p: string, n: number) => p.split(/(?<=\.)\s+/).slice(0, n).join(' ');

// Resumen_final.md §2, segundo párrafo: las dos oraciones de la base mundial (la tercera es de Colombia)
const ETL_RESUMEN = sentences(paras('2. Los datos recolectados')[1], 2);
// Resumen_final.md §3: qué mide el índice y por qué se valida por bloques
const [EDA_RESUMEN, EDA_BLOQUES] = paras('3. Qué mide el índice global');

export function Summary({ text, source }: { text: string; source: string }) {
  return (
    <div>
      <Md text={text} className="!text-[17px] sm:!text-[19px] !text-white/80" />
      <p className="text-white/35 text-[11px] font-mono mt-3">{source}</p>
    </div>
  );
}

// 2. ETL: extracción, transformación y carga
export function Etl() {
  return (
    <Section
      id="etl"
      kicker="Datos"
      title="2. ETL: extracción, transformación y carga"
      summary={<Summary text={ETL_RESUMEN} source="Resumen_final.md, sección 2" />}
      stats={[
        { value: '58,978 → 57,976', label: 'plantas: 1,002 filas eliminadas (D1, D2 y D8)', source: 'EDA, celda 56' },
        { value: '14', label: 'problemas de calidad documentados (D1 a D14)', source: 'EDA, celda 12' },
        { value: '15', label: 'predictoras finales', source: 'EDA, celda 97' },
        { value: '3.21 → 3.15 %', label: 'clase Baja antes y después de limpiar: el desbalance sigue', source: 'EDA, celda 58' },
      ]}
      visual={
        <a href={`${BASE}figs/fig_pipeline_eda_mundial.png`} target="_blank" rel="noreferrer" className="block rounded-[16px] bg-white p-2 sm:p-4 max-w-[1200px]">
          <img src={`${BASE}figs/fig_pipeline_eda_mundial.png`} alt="Pipeline del EDA corregido, del dato crudo a la base limpia" loading="lazy" className="w-full h-auto" />
        </a>
      }
      tabs={[
        {
          label: 'Calidad: D1 a D14',
          content: (
            <div className="space-y-8">
              <Prose text={C.CALIDAD_INTRO} className="max-w-[900px]" />
              <QualityGrid />
              <Source nb="eda" from={12} to={54} />
            </div>
          ),
        },
        {
          label: 'Transformación y base final',
          content: (
            <div className="space-y-10">
              <Grid2>
                <div className="space-y-6">
                  <Prose text={C.LIMPIEZA_A} />
                  <Prose text={C.LIMPIEZA_B} />
                </div>
                <Card title="Proporción de clases antes y después de D1, D2 y D8">
                  <ClassBeforeAfter />
                </Card>
              </Grid2>
              <Grid2>
                <Prose text={C.S11_A} />
                <Card title={`${C.PREDICTORS.length} predictoras finales`}>
                  <div className="flex flex-wrap gap-2">
                    {C.PREDICTORS.map((p) => <span key={p} className="code !text-[13px]">{p}</span>)}
                  </div>
                </Card>
              </Grid2>
              <Source nb="eda" cells={[55, 57, 58, 96, 97]} />
            </div>
          ),
        },
      ]}
    />
  );
}

// 3. EDA
export function Eda() {
  return (
    <Section
      id="eda"
      kicker="Datos"
      title="3. EDA: el índice depende de la región"
      summary={<Summary text={EDA_RESUMEN} source="Resumen_final.md, sección 3" />}
      stats={[
        { value: '+0.583', label: 'Spearman del IAS con la longitud (pendiente: −0.066)', source: 'EDA, celda 83' },
        { value: '0.184 → 0.906', label: 'R² con solo terreno → añadiendo latitud y longitud', source: 'EDA, celda 89' },
        { value: '< 0', label: 'R² al predecir una macrorregión que el modelo no vio', source: 'EDA, celda 91' },
        { value: '496', label: 'bloques espaciales de 5° para validar', source: 'EDA, celda 94' },
      ]}
      visual={
        <Card title="Ubicación de cada planta, coloreada por clase de aptitud">
          <PointsGate>{(data) => <WorldMap data={data} mode="class" />}</PointsGate>
          <p className="text-white/45 text-[12px] mt-3">
            {C.GEO_B.replace(/\s*\n\s*/g, ' ')} Pasa el cursor sobre un punto para ver su fila.
          </p>
        </Card>
      }
      tabs={[
        {
          label: 'Efecto de región',
          content: (
            <div className="space-y-10">
              <Grid2>
                <div className="space-y-6">
                  <Output text={C.S9_SPEARMAN_OUT} />
                  <Prose text={C.S9_B} />
                  <Prose text={C.S9_C} />
                </div>
                <Card title="Composición de clases por macro-región">
                  <RegionComposition />
                </Card>
              </Grid2>
              <Grid2>
                <Card title="Pendiente contra aptitud, por macro-región">
                  <PointsGate>{(data) => <SlopeScatter data={data} />}</PointsGate>
                </Card>
                <div className="space-y-6">
                  <Prose text={C.BIVAR_C} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {C.R2_CV.map((r) => (
                      <Card key={r.label}>
                        <p className="text-white/60 text-[12px] leading-[1.4] mb-2">{r.label}</p>
                        <p className="text-white text-[32px] leading-none tabular-nums">
                          {r.mean.toFixed(3)}<span className="text-white/25 text-[18px]"> ± {r.sd.toFixed(3)}</span>
                        </p>
                      </Card>
                    ))}
                  </div>
                  <Prose text={C.S9_D} />
                </div>
              </Grid2>
              <Source nb="eda" cells={[77, 83, 84, 85, 87, 89, 90]} />
            </div>
          ),
        },
        {
          label: 'Validación espacial',
          content: (
            <div className="space-y-10">
              <Grid2>
                <div className="space-y-6">
                  <Md text={EDA_BLOQUES} />
                  <p className="text-white/35 text-[11px] font-mono">Resumen_final.md, sección 3</p>
                  <Prose text={C.S10_B} />
                </div>
                <Card title="Baja en el conjunto de prueba de cada pliegue">
                  <FoldTable />
                </Card>
              </Grid2>
              <Card title={`Bloques espaciales de 5°x5°: ${summary.n_blocks}`}>
                <PointsGate>{(data) => <WorldMap data={data} mode="fold" />}</PointsGate>
                <p className="text-white/45 text-[12px] mt-3">
                  <span className="code">StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)</span> con{' '}
                  <span className="code">spatial_block</span> como grupo.
                </p>
              </Card>
              <Source nb="eda" cells={[93, 94, 95]} />
            </div>
          ),
        },
      ]}
      after={<References items={[{ nb: 'eda', i: 104 }]} />}
    />
  );
}
