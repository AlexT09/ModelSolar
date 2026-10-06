import Hero from '@/components/Hero';
import TopBar from '@/components/TopBar';
import { CONTAINER, LineHeader } from '@/components/Section';
import Apertura from '@/sections/Apertura';
import Eda from '@/sections/Eda';
import { BaseColombia, Cierre, Experimento, ModelosBase, QueExplicaElClima } from '@/sections/Procesos';
import { COURSE } from '@/content';

// Las dos líneas de trabajo, con el texto literal de Resumen_final.md, sección 1
const LINEA_1 = 'Modelar el índice topográfico del dataset global para evaluar su generalización espacial.';
const LINEA_2 = 'Construir una base propia con generación real de plantas colombianas para ver cuánto influye el clima.';

export default function App() {
  return (
    <>
      <Hero />
      <TopBar />

      <main>
        <Apertura />

        <LineHeader id="linea-1" label="Línea 1" title="Auditar el índice" text={LINEA_1} />
        <Eda />
        <ModelosBase />
        <Experimento />

        <LineHeader id="linea-2" label="Línea 2" title="Generación real en Colombia" text={LINEA_2} />
        <BaseColombia />
        <QueExplicaElClima />

        <Cierre />
      </main>

      <footer className="border-t border-white/[0.06] py-10">
        <div className={`${CONTAINER} flex flex-wrap justify-between gap-4 text-white/45 text-[13px]`}>
          <span>
            Textos, cifras y figuras de los cuadernos de{' '}
            <a href="https://github.com/AlexT09/ModelSolar/tree/main/ml%20presentaci%C3%B3n/proceso"
              target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-white">
              ml presentación/proceso
            </a>
            , con el número de celda de cada uno.
          </span>
          <span>Jesús David Arévalo Montilla, Enmanuel David Díaz Molinares y Alex David Terán Meza · {COURSE}</span>
        </div>
      </footer>
    </>
  );
}
