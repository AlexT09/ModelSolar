import { useState, type ReactNode } from 'react';
import Prose, { Inline } from '@/components/Prose';
import WorldMap, { Chip } from '@/components/WorldMap';
import SlopeScatter from '@/components/SlopeScatter';
import { ClassBeforeAfter, FoldTable, HBars, RegionComposition, SpearmanBars } from '@/components/Charts';
import { Cells, Output, References, Source } from '@/components/Notebook';
import { Section } from '@/components/Section';
import { CLASS_COLORS, fmt, summary, usePoints, type Points } from '@/lib/data';
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

function H({ children }: { children: ReactNode }) {
  return <h3 className="text-white text-[20px] sm:text-[24px] font-normal mb-5">{children}</h3>;
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

// El primer párrafo de la celda 0 del EDA: lo que hace falta antes de entrenar
const ANTES_DE_MODELAR = C.INTRO_A.split(/\n\s*\n/)[0];

// 4. ETL: extracción, transformación y carga
export function Etl() {
  return (
    <Section
      id="etl"
      kicker="Datos"
      title="4. ETL: extracción, transformación y carga"
      summary={
        <div>
          <Prose text={ANTES_DE_MODELAR} className="!text-[17px] sm:!text-[19px] !text-white/80" />
          <Source nb="eda" cells={[0]} />
        </div>
      }
      stats={[
        { value: '58,978 → 57,976', label: 'plantas: 1,002 filas eliminadas (D1, D2 y D8)', source: 'EDA, celda 56' },
        { value: '14', label: 'problemas de calidad documentados (D1 a D14)', source: 'EDA, celda 12' },
        { value: '15', label: 'predictoras finales', source: 'EDA, celda 97' },
        { value: '63', label: 'nulos restantes, imputados por mediana dentro de cada pliegue', source: 'EDA, celda 98' },
      ]}
      visual={
        <a href={`${BASE}figs/fig_pipeline_eda_mundial.png`} target="_blank" rel="noreferrer" className="block rounded-[16px] bg-white p-2 sm:p-4 max-w-[1200px]">
          <img src={`${BASE}figs/fig_pipeline_eda_mundial.png`} alt="Pipeline del EDA corregido, del dato crudo a la base limpia" loading="lazy" className="w-full h-auto" />
        </a>
      }
      tabs={[
        {
          label: 'Extracción y carga',
          content: (
            <div className="max-w-[960px] space-y-5">
              <Prose text={C.CARGA} />
              <Output text={'Filas: 58,978 | Columnas: 29\n\narea   float64   n_nulos 16329   pct_nulos 27.69'} />
              <Source nb="eda" cells={[4, 5, 6, 7]} />
            </div>
          ),
        },
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
          label: 'Transformación',
          content: (
            <div className="space-y-8">
              <Grid2>
                <div className="space-y-6">
                  <Prose text={C.LIMPIEZA_A} />
                  <Output text="Filas: 58,978 -> 57,976 tras D1+D2+D8 (1002 eliminadas)" />
                  <Prose text={C.LIMPIEZA_B} />
                </div>
                <div className="space-y-6">
                  <Card title="Proporción de clases antes y después de D1, D2 y D8">
                    <ClassBeforeAfter />
                  </Card>
                  <Prose text={C.LIMPIEZA_C} />
                </div>
              </Grid2>
              <Source nb="eda" cells={[55, 56, 57, 58, 59, 60, 63]} />
            </div>
          ),
        },
        {
          label: 'Base final',
          content: (
            <div className="space-y-6">
              <Grid2>
                <Prose text={C.S11_A} />
                <div className="space-y-6">
                  <Card title={`${C.PREDICTORS.length} predictoras finales`}>
                    <div className="flex flex-wrap gap-2">
                      {C.PREDICTORS.map((p) => <span key={p} className="code !text-[13px]">{p}</span>)}
                    </div>
                  </Card>
                  <Prose text={C.S11_B} />
                </div>
              </Grid2>
              <Source nb="eda" cells={[96, 97, 98, 99]} />
            </div>
          ),
        },
      ]}
    />
  );
}

// 5. EDA
export function Eda() {
  return (
    <Section
      id="eda"
      kicker="Datos"
      title="5. EDA: el índice depende de la región"
      summary={
        <div>
          <Prose text={C.BIVAR_B} className="!text-[17px] sm:!text-[19px] !text-white/80" />
          <Source nb="eda" cells={[75]} />
        </div>
      }
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
          label: 'Variables',
          content: (
            <div className="space-y-12">
              <Cells nb="eda" picks={[68, 69, 70]} />
              <div>
                <H>Análisis bivariado</H>
                <Grid2>
                  <div className="space-y-6">
                    <Prose text={C.BIVAR_A} />
                    <Card title={<>Spearman con <span className="code">solar_aptitude</span></>}>
                      <SpearmanBars />
                    </Card>
                  </div>
                  <div className="space-y-6">
                    <Card title="Pendiente contra aptitud, por macro-región">
                      <PointsGate>{(data) => <SlopeScatter data={data} />}</PointsGate>
                    </Card>
                    <Prose text={C.BIVAR_C} />
                  </div>
                </Grid2>
              </div>
              <div>
                <H>Factor de inflación de varianza</H>
                <Grid2>
                  <div className="space-y-6">
                    <Prose text={C.VIF_A} />
                    <Prose text={C.VIF_B} />
                  </div>
                  <Card title="n = 57,976 casos completos">
                    <HBars color="#3987e5"
                      rows={C.VIF_TABLE.filter(([v]) => v !== 'const').map(([label, value]) => ({ label, value: +value.toFixed(3) }))} />
                    <p className="text-white/45 text-[12px] mt-4">
                      <span className="code">const</span> = {C.VIF_TABLE[0][1].toFixed(3)} (fuera de la escala)
                    </p>
                  </Card>
                </Grid2>
              </div>
              <Source nb="eda" cells={[64, 66, 68, 69, 70, 73, 74, 76, 77, 79, 80, 81]} />
            </div>
          ),
        },
        {
          label: 'Efecto de región',
          content: (
            <div className="space-y-10">
              <Prose text={C.S9_A} className="max-w-[900px]" />
              <Grid2>
                <div className="space-y-6">
                  <Output text={C.S9_SPEARMAN_OUT} />
                  <Prose text={C.S9_B} />
                </div>
                <Card title="Composición de clases por macro-región">
                  <RegionComposition />
                </Card>
              </Grid2>
              <Grid2>
                <Prose text={C.S9_C} />
                <Card title="Países con más plantas en clase Baja">
                  <HBars color={CLASS_COLORS[0]} rows={summary.baja_by_country.map((r) => ({ label: r.country, value: r.n }))} />
                </Card>
              </Grid2>
              <Grid2>
                <div className="grid gap-4 sm:grid-cols-2 content-start">
                  {C.R2_CV.map((r) => (
                    <Card key={r.label}>
                      <p className="text-white/60 text-[13px] leading-[1.4] mb-3">{r.label}</p>
                      <p className="text-white text-[40px] sm:text-[46px] leading-none tabular-nums">
                        {r.mean.toFixed(3)}
                        <span className="text-white/25 text-[22px]"> ± {r.sd.toFixed(3)}</span>
                      </p>
                    </Card>
                  ))}
                </div>
                <Prose text={C.S9_D} />
              </Grid2>
              <Grid2>
                <Card title="R² dejando una macro-región fuera del entrenamiento:">
                  <div className="space-y-3">
                    {C.R2_LORO.map((r) => (
                      <div key={r.region} className="flex items-baseline justify-between gap-4 border-t border-white/[0.06] pt-3 first:border-0 first:pt-0">
                        <span className="text-white/75 text-[14px]">Prueba en {r.region}</span>
                        <span className="text-white text-[22px] tabular-nums">R² = {r.r2.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                <Prose text={C.S9_E} />
              </Grid2>
              <Source nb="eda" cells={[82, 83, 84, 85, 87, 88, 89, 90, 91, 92]} />
            </div>
          ),
        },
        {
          label: 'Validación espacial',
          content: (
            <div className="space-y-10">
              <Grid2>
                <Prose text={C.S10_A} />
                <Prose text={C.S10_B} />
              </Grid2>
              <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                <Card title={`Bloques espaciales de 5°x5°: ${summary.n_blocks}`}>
                  <PointsGate>{(data) => <WorldMap data={data} mode="fold" />}</PointsGate>
                  <p className="text-white/45 text-[12px] mt-3">
                    <span className="code">StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)</span> con{' '}
                    <span className="code">spatial_block</span> como grupo.
                  </p>
                </Card>
                <Card title="Baja en el conjunto de prueba de cada pliegue">
                  <FoldTable />
                </Card>
              </div>
              <Source nb="eda" cells={[93, 94, 95]} />
            </div>
          ),
        },
        {
          label: 'Conclusiones del EDA',
          content: (
            <div className="space-y-6">
              <Prose text={C.CONCLUSIONES} className="max-w-[960px]" />
              <Source nb="eda" cells={[100]} />
            </div>
          ),
        },
      ]}
      after={<References items={[{ nb: 'eda', i: 104 }]} />}
    />
  );
}
