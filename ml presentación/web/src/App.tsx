import { useState, type ReactNode } from 'react';
import Hero from '@/components/Hero';
import Prose, { Inline } from '@/components/Prose';
import WorldMap, { Chip } from '@/components/WorldMap';
import SlopeScatter from '@/components/SlopeScatter';
import { ClassBeforeAfter, FoldTable, HBars, RegionComposition, SpearmanBars } from '@/components/Charts';
import { CLASS_COLORS, fmt, summary, usePoints, type Points } from '@/lib/data';
import * as C from '@/content';

const BASE = import.meta.env.BASE_URL;

function Section({ id, heading, cells, children }: {
  id?: string; heading: string; cells: string; children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 py-16 sm:py-24 border-t border-white/[0.06]">
      <div className="max-w-[1800px] mx-auto px-5 sm:px-8 md:px-[82px]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-8 sm:mb-10">
          <h2 className="text-white text-[28px] sm:text-[40px] md:text-[48px] font-normal leading-[1.05] max-w-[900px]">
            <Inline text={heading} />
          </h2>
          <span className="text-white/40 text-[12px] font-mono">celdas {cells}</span>
        </div>
        {children}
      </div>
    </section>
  );
}

function Card({ title, children, className = '' }: { title?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`glass p-5 sm:p-7 ${className}`}>
      {title && <p className="text-white text-[15px] sm:text-[16px] font-[450] mb-5">{title}</p>}
      {children}
    </div>
  );
}

function Output({ text }: { text: string }) {
  return <pre className="output">{text}</pre>;
}

function Figure({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure>
      <div className="rounded-[16px] bg-white p-2 sm:p-4 overflow-hidden">
        <img src={`${BASE}${src}`} alt={alt} loading="lazy" className="w-full h-auto" />
      </div>
      <figcaption className="text-white/45 text-[12px] mt-2">{caption}</figcaption>
    </figure>
  );
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
              <span className="shrink-0 px-2.5 py-1.5 rounded-[8px] bg-white/[0.07] text-white/75 text-[12px]">
                {d.treatment}
              </span>
            </div>
            <Output text={d.output} />
            <Prose text={d.text} className="!text-[14px] sm:!text-[15px]" />
          </article>
        ))}
      </div>
    </>
  );
}

export default function App() {
  const lorO = C.R2_LORO;
  return (
    <>
      <Hero />

      <main>
        <Section id="objetivo" heading={C.TITLE} cells="0, 1">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
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
              <Figure src="figs/fig_pipeline_eda_mundial.png" alt="Esquema del EDA"
                caption="Figura del cuaderno: fig_pipeline_eda_mundial.png" />
            </div>
          </div>
        </Section>

        <Section heading="2. Carga de datos" cells="4 a 7">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
            <Prose text={C.CARGA} />
            <Output text={`Filas: 58,978 | Columnas: 29

area   float64   n_nulos 16329   pct_nulos 27.69`} />
          </div>
        </Section>

        <Section heading="3. Variable objetivo" cells="9 a 11">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
            <div className="space-y-6">
              <Prose text={C.OBJETIVO} />
              <Output text={`count    58978.000000
mean         0.681957
std          0.134997
min          0.000000
50%          0.694000
max          0.942000`} />
            </div>
            <Card title={<><span className="code">solar_aptittude_class</span> (target de clasificación)</>}>
              <ClassBeforeAfter />
            </Card>
          </div>
        </Section>

        <Section id="calidad" heading="4. Calidad de datos" cells="12 a 54">
          <Prose text={C.CALIDAD_INTRO} className="max-w-[900px] mb-10" />
          <QualityGrid />
        </Section>

        <Section heading="5. Construcción del dataset limpio" cells="55 a 63">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
            <div className="space-y-6">
              <Prose text={C.LIMPIEZA_A} />
              <Output text={`Filas: 58,978 -> 57,976 tras D1+D2+D8 (1002 eliminadas)`} />
              <Prose text={C.LIMPIEZA_B} />
            </div>
            <div className="space-y-6">
              <Card title="Proporción de clases antes y después de D1, D2 y D8">
                <ClassBeforeAfter />
              </Card>
              <Prose text={C.LIMPIEZA_C} />
            </div>
          </div>
        </Section>

        <Section id="mapa" heading="6.1 Geográficas" cells="64 a 66">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-14 mb-8">
            <Prose text={C.GEO_A} />
            <Prose text={C.GEO_B} />
          </div>
          <Card title="Ubicación de cada planta, coloreada por clase de aptitud">
            <PointsGate>{(data) => <WorldMap data={data} mode="class" />}</PointsGate>
            <p className="text-white/45 text-[12px] mt-3">
              {fmt(summary.rows_clean)} plantas del dataset limpio. Pasa el cursor sobre un punto para ver su fila.
            </p>
          </Card>
        </Section>

        <Section heading="7. Análisis bivariado corregido" cells="73 a 77">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
            <div className="space-y-6">
              <Prose text={C.BIVAR_A} />
              <Prose text={C.BIVAR_B} />
              <Figure src="figs/fig_correlacion_e3.png" alt="Matriz de correlación de Spearman"
                caption="Figura del cuaderno: fig_correlacion_e3.png" />
            </div>
            <Card title={<>Spearman con <span className="code">solar_aptitude</span></>}>
              <SpearmanBars />
            </Card>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-14 mt-10">
            <Prose text={C.BIVAR_C} />
            <Card title="Pendiente contra aptitud, por macro-región">
              <PointsGate>{(data) => <SlopeScatter data={data} />}</PointsGate>
            </Card>
          </div>
        </Section>

        <Section heading="8. Factor de inflación de varianza" cells="79 a 81">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
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
          </div>
        </Section>

        <Section id="region" heading="9. El IAS es topográfico y tiene un desplazamiento por región" cells="82 a 92">
          <Prose text={C.S9_A} className="max-w-[900px] mb-10" />
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
            <div className="space-y-6">
              <Output text={C.S9_SPEARMAN_OUT} />
              <Prose text={C.S9_B} />
            </div>
            <Card title="Composición de clases por macro-región">
              <RegionComposition />
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14 mt-10">
            <Prose text={C.S9_C} />
            <Card title="Países con más plantas en clase Baja">
              <HBars color={CLASS_COLORS[0]}
                rows={summary.baja_by_country.map((r) => ({ label: r.country, value: r.n }))} />
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14 mt-10">
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
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14 mt-10">
            <Card title="R² dejando una macro-región fuera del entrenamiento:">
              <div className="space-y-3">
                {lorO.map((r) => (
                  <div key={r.region} className="flex items-baseline justify-between gap-4 border-t border-white/[0.06] pt-3 first:border-0 first:pt-0">
                    <span className="text-white/75 text-[14px]">Prueba en {r.region}</span>
                    <span className="text-white text-[22px] tabular-nums">R² = {r.r2 >= 0 ? '+' : ''}{r.r2.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Prose text={C.S9_E} />
          </div>
        </Section>

        <Section id="validacion" heading="10. Esquema de validación cruzada espacial" cells="93 a 95">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-14 mb-8">
            <Prose text={C.S10_A} />
            <Prose text={C.S10_B} />
          </div>
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
        </Section>

        <Section heading="11. Conjunto de predictoras final" cells="96 a 98">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
            <Prose text={C.S11_A} />
            <div className="space-y-6">
              <Card title={`${C.PREDICTORS.length} predictoras finales`}>
                <div className="flex flex-wrap gap-2">
                  {C.PREDICTORS.map((p) => <span key={p} className="code !text-[13px]">{p}</span>)}
                </div>
              </Card>
              <Prose text={C.S11_B} />
            </div>
          </div>
        </Section>

        <Section heading="12. Conclusiones" cells="100">
          <Prose text={C.CONCLUSIONES} className="max-w-[1000px]" />
        </Section>

        <Section heading="Referencias" cells="104">
          <ol className="space-y-3 max-w-[1000px] text-white/65 text-[14px] leading-[1.6]">
            {C.REFERENCIAS.map((r) => <li key={r}><Inline text={r} /></li>)}
          </ol>
        </Section>
      </main>

      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-[1800px] mx-auto px-5 sm:px-8 md:px-[82px] flex flex-wrap justify-between gap-4 text-white/45 text-[13px]">
          <span>
            Textos y cifras de{' '}
            <a href={C.NOTEBOOK_URL} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-white">
              EDA_Corregido(Entregable 3).ipynb
            </a>
            . Mapa y dispersión proyectados desde el CSV con <span className="code">scripts/build_data.py</span>.
          </span>
          <span>{C.COURSE}</span>
        </div>
      </footer>
    </>
  );
}
