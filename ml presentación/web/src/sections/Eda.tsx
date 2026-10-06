import { useState, type ReactNode } from 'react';
import Prose, { Inline } from '@/components/Prose';
import WorldMap, { Chip } from '@/components/WorldMap';
import SlopeScatter from '@/components/SlopeScatter';
import { ClassBeforeAfter, FoldTable, HBars, RegionComposition, SpearmanBars } from '@/components/Charts';
import { Cells, NbImage, Output, References, Source } from '@/components/Notebook';
import { Section } from '@/components/Section';
import { CLASS_COLORS, fmt, summary, usePoints, type Points } from '@/lib/data';
import { resumenMd } from '@/lib/notebooks';
import { Md } from '@/components/Notebook';
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

function H({ children }: { children: ReactNode }) {
  return <h3 className="text-white text-[20px] sm:text-[24px] font-normal mb-5">{children}</h3>;
}

const tabs = [
  {
    label: 'Qué mide el índice',
    content: (
      <div className="space-y-12">
        <Grid2>
          <div className="space-y-6">
            <p className="text-white/60 text-[14px] leading-[1.6]">
              {C.AUTHORS}
              <br />
              <Inline text={C.DATASET} />
            </p>
            <Prose text={C.INTRO_A} />
            <Card>
              <p className="font-mono text-[14px] sm:text-[16px] text-white mb-5 break-words">
                IAS = 0.40·Slope + 0.25·Aspect + 0.20·Hillshade + 0.15·Curvature
              </p>
              <div className="space-y-2.5">
                {C.FORMULA.map((f) => (
                  <div key={f.name} className="grid grid-cols-[90px_1fr_40px] items-center gap-3">
                    <span className="text-[13px] text-white/75">{f.name}</span>
                    <div className="h-[12px]">
                      <div className="h-full rounded-r-[4px] bg-white/70" style={{ width: `${(f.w / 0.4) * 100}%` }} />
                    </div>
                    <span className="text-[13px] text-white/85 tabular-nums text-right">{f.w.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Prose text={C.INTRO_B} />
          </div>
          <div className="space-y-4">
            <p className="text-white text-[16px] font-[450]">Del dato crudo a la base limpia</p>
            <a href={`${BASE}figs/fig_pipeline_eda_mundial.png`} target="_blank" rel="noreferrer" className="block rounded-[16px] bg-white p-2 sm:p-4">
              <img src={`${BASE}figs/fig_pipeline_eda_mundial.png`} alt="Esquema del EDA" loading="lazy" className="w-full h-auto" />
            </a>
          </div>
        </Grid2>
        <Grid2>
          <div className="space-y-6">
            <H>2. Carga de datos</H>
            <Prose text={C.CARGA} />
          </div>
          <div className="space-y-6">
            <H>3. Variable objetivo</H>
            <Prose text={C.OBJETIVO} />
            <NbImage name="eda_11_0.png" alt="Distribución de solar_aptitude y de sus clases" />
          </div>
        </Grid2>
        <Source nb="eda" from={0} to={11} />
      </div>
    ),
  },
  {
    label: 'Calidad D1–D14',
    content: (
      <div className="space-y-10">
        <Prose text={C.CALIDAD_INTRO} className="max-w-[900px]" />
        <QualityGrid />
        <Grid2>
          <div className="space-y-6">
            <H>5. Construcción del dataset limpio</H>
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
        <Source nb="eda" from={12} to={63} />
      </div>
    ),
  },
  {
    label: 'Exploración',
    content: (
      <div className="space-y-12">
        <div>
          <H>6.1 Geográficas</H>
          <Grid2 className="mb-8">
            <Prose text={C.GEO_A} />
            <Prose text={C.GEO_B} />
          </Grid2>
          <Card title="Ubicación de cada planta, coloreada por clase de aptitud">
            <PointsGate>{(data) => <WorldMap data={data} mode="class" />}</PointsGate>
            <p className="text-white/45 text-[12px] mt-3">
              {fmt(summary.rows_clean)} plantas del dataset limpio. Pasa el cursor sobre un punto para ver su fila.
            </p>
          </Card>
        </div>
        <Cells nb="eda" picks={[68, 69, 70]} />
        <div>
          <H>7. Análisis bivariado corregido</H>
          <Grid2>
            <div className="space-y-6">
              <Prose text={C.BIVAR_A} />
              <Prose text={C.BIVAR_B} />
              <NbImage name="eda_74_0.png" alt="Matriz de correlación de Spearman" />
            </div>
            <Card title={<>Spearman con <span className="code">solar_aptitude</span></>}>
              <SpearmanBars />
            </Card>
          </Grid2>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-14 mt-10">
            <Prose text={C.BIVAR_C} />
            <Card title="Pendiente contra aptitud, por macro-región">
              <PointsGate>{(data) => <SlopeScatter data={data} />}</PointsGate>
            </Card>
          </div>
        </div>
        <div>
          <H>8. Factor de inflación de varianza</H>
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
        <Source nb="eda" from={64} to={81} />
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
        <Source nb="eda" from={82} to={92} />
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
        <Grid2>
          <div className="space-y-6">
            <H>11. Conjunto de predictoras final</H>
            <Prose text={C.S11_A} />
          </div>
          <div className="space-y-6">
            <Card title={`${C.PREDICTORS.length} predictoras finales`}>
              <div className="flex flex-wrap gap-2">
                {C.PREDICTORS.map((p) => <span key={p} className="code !text-[13px]">{p}</span>)}
              </div>
            </Card>
            <Prose text={C.S11_B} />
          </div>
        </Grid2>
        <Source nb="eda" from={93} to={98} />
      </div>
    ),
  },
  {
    label: 'Conclusiones del EDA',
    content: (
      <div className="space-y-6">
        <Prose text={C.CONCLUSIONES} className="max-w-[960px]" />
        <Source nb="eda" from={100} />
      </div>
    ),
  },
];

export default function Eda() {
  return (
    <Section
      id="eda"
      kicker="Línea 1 · Predecir el índice de aptitud"
      title="1. Datos y EDA: qué mide el índice"
      summary={<Md text={resumenMd['3. Qué mide el índice global'].split('\n\n')[0]} className="!text-[17px] sm:!text-[19px] !text-white/80" />}
      stats={[
        { value: '57,976', label: 'plantas tras la limpieza (de 58,978)', source: 'EDA, celda 56' },
        { value: '14', label: 'problemas de calidad documentados (D1 a D14)', source: 'EDA, celda 12' },
        { value: '+0.583', label: 'Spearman del IAS con la longitud (pendiente: −0.066)', source: 'EDA, celda 83' },
        { value: '0.184 → 0.906', label: 'R² solo topografía → con latitud y longitud', source: 'EDA, celda 89' },
      ]}
      tabs={tabs}
      after={<References items={[{ nb: 'eda', i: 104 }]} />}
    />
  );
}
