import { useEffect, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { COURSE } from '@/content';
import { GROUPS as NAV } from './TopBar';

const CUADERNOS_URL = 'https://github.com/AlexT09/ModelSolar/tree/main/ml%20presentaci%C3%B3n/proceso';

// El recorrido de la presentación, en el orden de la guía del entregable (sección 8)
const AGENDA = [
  { label: 'Introducción', href: '#introduccion' },
  { label: 'Contexto: el dataset', href: '#contexto' },
  { label: 'Objetivos', href: '#objetivos' },
  { label: 'ETL', href: '#etl' },
  { label: 'EDA', href: '#eda' },
  { label: 'Modelos implementados y resultados', href: '#modelos' },
  { label: 'Comparación de métodos de optimización', href: '#optimizacion' },
  { label: 'Resultados finales y conclusiones', href: '#conclusiones' },
];

function Animate({
  children,
  delay = 0,
  className = '',
  direction = 'up',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
}) {
  const directionClass = {
    up: 'animate-fade-up',
    down: 'animate-fade-down',
    left: 'animate-fade-left',
    right: 'animate-fade-right',
    scale: 'animate-fade-scale',
  }[direction];

  return (
    <div className={`opacity-0 ${directionClass} ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// Tarjeta de la portada: el recorrido de la presentación. Cada punto entra escalonado y lleva a su sección.
function AgendaCard() {
  return (
    <Animate delay={900} direction="scale" className="w-full max-w-[405px] mx-auto lg:mx-0">
      <nav aria-label="Recorrido de la presentación"
        className="w-full rounded-[24px] sm:rounded-[33px] bg-[rgba(17,16,15,0.35)] backdrop-blur-[20px] p-5 sm:p-8 pb-4 sm:pb-6">
        <p className="text-white text-[16px] sm:text-[20px] font-[450] leading-[20px] mb-4 sm:mb-6">El proyecto</p>
        <ol>
          {AGENDA.map((item, i) => (
            <li key={item.href} className="opacity-0 animate-fade-up" style={{ animationDelay: `${1100 + i * 80}ms` }}>
              <a href={item.href}
                className="group flex items-baseline gap-4 py-[9px] sm:py-[10px] border-t border-white/10 first:border-0 text-white/80 hover:text-white transition-colors">
                <span className="text-white/40 text-[12px] sm:text-[13px] font-[450] tabular-nums w-5 shrink-0 group-hover:text-white/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[14px] sm:text-[15px] font-[450] leading-[1.3]">{item.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </Animate>
  );
}

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen lg:h-screen overflow-hidden bg-[#080A19]">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260813_092641_de52eb87-daf2-41db-92cb-7a56eae012a5.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#080A19] pointer-events-none" />

      <div className="relative z-10 min-h-screen lg:h-full flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center py-8">
          <div className="w-full max-w-[1800px] mx-auto px-5 sm:px-8 md:px-[82px] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-12">
            <div className="max-w-[640px]">
              <Animate delay={300} direction="up">
                <h1 className="text-white text-[36px] sm:text-[52px] md:text-[64px] lg:text-[72px] font-normal leading-[0.95] mb-5 sm:mb-8">
                  Proyecto ModelSolar
                </h1>
              </Animate>
              <Animate delay={500} direction="up">
                <p className="text-white/80 text-[16px] sm:text-[18px] md:text-[20px] font-[450] leading-[1.3] max-w-[420px] mb-7 sm:mb-10">
                  Entregable 3 · Predicción de la aptitud solar de plantas fotovoltaicas con Machine Learning.
                  <span className="block text-white/55 text-[14px] sm:text-[15px] mt-3">{COURSE}</span>
                </p>
              </Animate>
              <Animate delay={700} direction="up">
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <a href="#introduccion"
                    className="inline-flex items-center h-[46px] sm:h-[51px] px-5 sm:px-[27px] bg-[#E9E9E9] rounded-[12px] text-[#0A0707] text-[14px] sm:text-[15.5px] font-[450] leading-[15.5px] transition-opacity hover:opacity-90">
                    Ver el proyecto
                  </a>
                  <a href={CUADERNOS_URL} target="_blank" rel="noreferrer"
                    className="inline-flex items-center h-[46px] sm:h-[51px] px-5 sm:px-[27px] rounded-[12px] border border-white text-white text-[14px] sm:text-[15.5px] font-[450] leading-[15.5px] transition-opacity hover:opacity-80">
                    Ver los cuadernos
                  </a>
                </div>
              </Animate>
            </div>
            <AgendaCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <nav className="w-full max-w-[1800px] mx-auto px-5 sm:px-8 md:px-[82px] pt-[20px] sm:pt-[30px] flex items-center justify-between relative z-50">
        <Animate delay={0} direction="down">
          <a href="#" className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 256 256" fill="none" className="sm:w-[32px] sm:h-[32px]" aria-hidden>
              <path
                d="M 256 256 L 178 256 C 150.386 256 128 233.614 128 206 L 128 256 L 0 256 L 0 192 C 0 156.654 28.654 128 64 128 C 99.346 128 128 156.654 128 192 L 128 128 L 256 128 Z M 78 0 C 105.614 0 128 22.386 128 50 L 128 0 L 256 0 L 256 64 C 256 99.346 227.346 128 192 128 C 156.654 128 128 99.346 128 64 L 128 128 L 0 128 L 0 0 Z"
                fill="white"
              />
            </svg>
            <span className="text-white text-[22px] sm:text-[26px] font-[450] leading-none tracking-[-0.02em]">ModelSolar</span>
          </a>
        </Animate>

        <Animate delay={100} direction="down" className="hidden lg:block">
          <div className="h-[52px] px-6 flex items-center gap-[30px] bg-[rgba(10,7,7,0.35)] rounded-[11px] backdrop-blur-[17px]">
            {NAV.map((item) => (
              <a key={item.href} href={item.href}
                className="text-white/80 text-[14px] font-[450] leading-[14px] hover:text-white transition-colors">
                {item.label}
              </a>
            ))}
          </div>
        </Animate>

        <Animate delay={200} direction="down" className="hidden lg:block">
          <div className="h-[52px] p-[3px] bg-[rgba(0,0,0,0.35)] rounded-[13px] backdrop-blur-[17px] flex items-center gap-[5px]">
            <a href={CUADERNOS_URL} target="_blank" rel="noreferrer"
              className="h-[46px] px-6 inline-flex items-center rounded-[11px] text-white text-[14px] font-[450] leading-[14px] hover:bg-white/5 transition-colors">
              Cuadernos
            </a>
            <a href="#introduccion"
              className="h-[46px] px-6 inline-flex items-center bg-[#E9E9E9] rounded-[11px] text-[#0A0707] text-[14px] font-[450] leading-[14px] hover:bg-white transition-colors">
              Ver el proyecto
            </a>
          </div>
        </Animate>

        <Animate delay={100} direction="down" className="lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Abrir o cerrar el menú"
            aria-expanded={isOpen}
            className="w-[44px] h-[44px] flex items-center justify-center rounded-[11px] bg-[rgba(10,7,7,0.35)] backdrop-blur-[17px] transition-colors hover:bg-white/10"
          >
            <div className="relative w-5 h-5">
              <Menu className={`w-5 h-5 text-white absolute inset-0 transition-all duration-300 ease-out ${isOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`} />
              <X className={`w-5 h-5 text-white absolute inset-0 transition-all duration-300 ease-out ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`} />
            </div>
          </button>
        </Animate>
      </nav>

      <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 bg-[#080A19]/90 backdrop-blur-[24px] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)}
        />
        <div
          className={`absolute top-[76px] sm:top-[86px] left-4 right-4 sm:left-6 sm:right-6 bg-[rgba(17,16,15,0.6)] backdrop-blur-[30px] rounded-[20px] border border-white/[0.06] p-6 sm:p-8 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] origin-top ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-[0.97]'}`}
        >
          <div className="flex flex-col gap-1">
            {NAV.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-4 rounded-[12px] text-white/90 text-[18px] font-[450] hover:bg-white/[0.06] transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'}`}
                style={{ transitionDelay: isOpen ? `${100 + i * 50}ms` : '0ms' }}
              >
                {item.label}
                <ChevronDown className="w-4 h-4 opacity-50 -rotate-90" />
              </a>
            ))}
          </div>
          <div className="h-px bg-white/10 my-5" />
          <div
            className={`flex flex-col gap-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            style={{ transitionDelay: isOpen ? '350ms' : '0ms' }}
          >
            <a href="#introduccion" onClick={() => setIsOpen(false)}
              className="w-full h-[50px] flex items-center justify-center bg-[#E9E9E9] rounded-[12px] text-[#0A0707] text-[15px] font-[450] transition-colors hover:bg-white">
              Ver el proyecto
            </a>
            <a href={CUADERNOS_URL} target="_blank" rel="noreferrer"
              className="w-full h-[50px] flex items-center justify-center rounded-[12px] border border-white/30 text-white text-[15px] font-[450] transition-colors hover:bg-white/5">
              Ver los cuadernos
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
