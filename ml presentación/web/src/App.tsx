import Hero from '@/components/Hero';
import TopBar from '@/components/TopBar';
import { CONTAINER } from '@/components/Section';
import { Contexto, Introduccion, Objetivos } from '@/sections/Inicio';
import { Eda, Etl } from '@/sections/Datos';
import { Conclusiones, Modelos, Optimizacion } from '@/sections/Modelos';
import { COURSE } from '@/content';

// Estructura de la sustentación según la guía del entregable (sección 8): introducción, contexto y
// objetivos; ETL; EDA; modelos y resultados; comparación de optimizadores; resultados finales.
export default function App() {
  return (
    <>
      <Hero />
      <TopBar />

      <main>
        <Introduccion />
        <Contexto />
        <Objetivos />
        <Etl />
        <Eda />
        <Modelos />
        <Optimizacion />
        <Conclusiones />
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
