import { Section } from '@/components/Section';
import { Md, NbImage, Source } from '@/components/Notebook';
import Prose, { Inline } from '@/components/Prose';
import { Card } from './Datos';
import * as C from '@/content';

const Src = ({ children }: { children: string }) => (
  <p className="text-white/35 text-[11px] font-mono mt-4">{children}</p>
);

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((t) => (
        <li key={t} className="flex gap-3">
          <span className="mt-[11px] w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
          <Md text={t} className="!text-[15px] sm:!text-[16px]" />
        </li>
      ))}
    </ul>
  );
}

function H({ children }: { children: string }) {
  return <h3 className="text-white text-[20px] sm:text-[24px] font-normal mb-5">{children}</h3>;
}

// 1. Introducción: el problema, el dataset y los objetivos
export function Introduccion() {
  return (
    <Section
      id="introduccion"
      kicker="Proyecto ModelSolar"
      title="1. Introducción"
      summary={<Md text={C.PROBLEMA[0]} className="!text-[19px] sm:!text-[22px] !text-white/85" />}
      stats={[
        { value: '58,978', label: 'plantas fotovoltaicas del mundo', source: 'EDA, celda 5' },
        { value: '29', label: 'columnas: ubicación, terreno, clima, logística y potencia', source: 'EDA, celda 5' },
        { value: '5', label: 'fuentes integradas por los autores del dataset', source: 'main.tex, "De dónde salen los datos"' },
        { value: '75 / 22 / 3 %', label: 'plantas en clase Alta / Media / Baja', source: 'EDA, celda 10' },
      ]}
      visual={
        <div className="space-y-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
            <div>
              <H>El problema</H>
              <Bullets items={C.PROBLEMA.slice(1)} />
              <Src>{`${C.EXPO}: "El problema"`}</Src>
            </div>
            <div className="glass p-6 sm:p-8 border-l-4 !border-l-[#d95926] self-start">
              <p className="text-white/55 text-[13px] mb-3">Lo que encontramos</p>
              <p className="text-white text-[18px] sm:text-[21px] leading-[1.45]">{C.ENCONTRAMOS}</p>
              <Src>{`${C.EXPO}: "El problema"`}</Src>
            </div>
          </div>

          <div>
            <H>El dataset</H>
            <p className="text-white/75 text-[15px] sm:text-[16px] leading-[1.6] max-w-[900px] mb-8"><Inline text={C.DATASET} /></p>
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
              <div className="space-y-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead>
                      <tr className="text-white/50 text-left">
                        <th className="font-[450] py-2 pr-4">Fuente</th>
                        <th className="font-[450] py-2">Qué aporta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {C.FUENTES.map(([f, q]) => (
                        <tr key={f} className="border-t border-white/[0.06]">
                          <td className="py-2.5 pr-4 text-white/85">{f}</td>
                          <td className="py-2.5 text-white/65">{q}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Src>{`${C.EXPO}: "De dónde salen los datos"`}</Src>
                </div>
                <Card title="La variable a predecir: el índice de aptitud solar (IAS)">
                  <p className="font-mono text-[14px] sm:text-[15px] text-white mb-5 break-words">
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
              </div>
              <div className="space-y-4">
                <NbImage name="eda_11_0.png" alt="Distribución de solar_aptitude y de solar_aptittude_class" />
                <Prose text={C.OBJETIVO} className="!text-[14px] sm:!text-[15px]" />
                <Source nb="eda" cells={[9, 11]} />
              </div>
            </div>
          </div>

          <div id="objetivos" className="scroll-mt-16">
            <H>Objetivos</H>
            <div className="glass p-6 sm:p-8 mb-5">
              <p className="text-white/55 text-[13px] mb-3">Objetivo general</p>
              <p className="text-white text-[18px] sm:text-[22px] leading-[1.45]">{C.OBJETIVO_GENERAL}</p>
            </div>
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              {C.OBJETIVOS.map((o, k) => (
                <a key={o.text} href={o.section.href} className="glass p-6 block hover:bg-white/[0.06] transition-colors">
                  <p className="text-white/40 text-[13px] font-mono mb-2">Objetivo específico {k + 1}</p>
                  <p className="text-white text-[18px] sm:text-[20px] leading-[1.35] mb-3">{o.text}</p>
                  <p className="text-white/65 text-[14px] leading-[1.55]">{o.evidence}</p>
                  <p className="text-white/45 text-[12px] mt-4">Sección {o.section.label} →</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
}
