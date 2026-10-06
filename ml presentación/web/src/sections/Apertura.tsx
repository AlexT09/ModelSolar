import { CONTAINER } from '@/components/Section';
import { Md } from '@/components/Notebook';
import { resumenMd } from '@/lib/notebooks';
import * as C from '@/content';

function Heading({ children }: { children: string }) {
  return <h3 className="text-white text-[22px] sm:text-[26px] font-normal mb-5">{children}</h3>;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((t) => (
        <li key={t} className="flex gap-3 text-white/75 text-[15px] sm:text-[16px] leading-[1.6]">
          <span className="mt-[11px] w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
          <Md text={t} className="!text-[15px] sm:!text-[16px]" />
        </li>
      ))}
    </ul>
  );
}

const Src = ({ children }: { children: string }) => (
  <p className="text-white/35 text-[11px] font-mono mt-4">{children}</p>
);

// Contexto y objetivo del proyecto, antes de los procesos
export default function Apertura() {
  // Tabla de cuadernos con la que abre Resumen_final.md
  const tablaCuadernos = resumenMd.intro.slice(resumenMd.intro.indexOf('|'));
  const intro = resumenMd.intro.slice(0, resumenMd.intro.indexOf('|')).trim();

  return (
    <section id="proyecto" data-nav="Contexto y objetivo" className="scroll-mt-16 py-16 sm:py-24">
      <div className={CONTAINER}>
        <p className="text-white/45 text-[13px] font-[450] mb-3">Proyecto</p>
        <h2 className="text-white text-[30px] sm:text-[44px] md:text-[52px] font-normal leading-[1.05] mb-12">
          Contexto y objetivo
        </h2>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          <div>
            <Heading>El problema</Heading>
            <Bullets items={C.PROBLEMA} />
            <Src>{`${C.EXPO}: "El problema"`}</Src>
          </div>
          <div className="glass p-6 sm:p-8 border-l-4 !border-l-[#d95926]">
            <p className="text-white/55 text-[13px] mb-3">Lo que encontramos</p>
            <p className="text-white text-[18px] sm:text-[21px] leading-[1.45]">{C.ENCONTRAMOS}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14 mt-16">
          <div>
            <Heading>La pregunta</Heading>
            <Bullets items={C.PREGUNTA} />
            <Src>{`${C.EXPO}: "La pregunta"`}</Src>
          </div>
          <div>
            <Heading>La pregunta original y cómo evolucionó</Heading>
            <Md text={resumenMd['1. La pregunta original y cómo evolucionó']} />
            <Src>proceso/Resumen_final.md, sección 1</Src>
          </div>
        </div>

        <div className="mt-16">
          <Heading>Nuestra solución planteada</Heading>
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            {C.LINEAS.map((l, k) => (
              <a key={l.title} href={k === 0 ? '#linea-1' : '#linea-2'} className="glass p-6 sm:p-8 block hover:bg-white/[0.06] transition-colors">
                <p className="text-white text-[19px] sm:text-[22px] mb-5">{l.title}</p>
                <Bullets items={l.items} />
              </a>
            ))}
          </div>
          <Src>{`${C.EXPO}: "Nuestra solución planteada"`}</Src>
        </div>

        <div className="my-16 sm:my-20 text-center">
          <p className="text-white text-[28px] sm:text-[44px] leading-[1.1] max-w-[1000px] mx-auto">{C.MENSAJE[0]}</p>
          <p className="text-white/60 text-[17px] sm:text-[21px] mt-4">{C.MENSAJE[1]}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div>
            <Heading>De dónde salen los datos</Heading>
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
            </div>
            <Md text={C.FUENTES_NOTA} className="mt-4" />
            <Src>{`${C.EXPO}: "De dónde salen los datos"`}</Src>
          </div>
          <div>
            <Heading>Cuadernos del proyecto</Heading>
            <Md text={intro} className="mb-4" />
            <Md text={tablaCuadernos} />
            <Src>proceso/Resumen_final.md</Src>
          </div>
        </div>
      </div>
    </section>
  );
}
