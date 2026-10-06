import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { BarChart3, BookOpen, Brain, ChevronLeft, ChevronRight, Database, ExternalLink, Flag, Gauge, Home, Menu, Rows3, X, type LucideIcon } from 'lucide-react';
import Hero from '@/components/Hero';
import { PanelContext, type PanelView } from '@/components/Section';
import { Introduccion } from '@/sections/Inicio';
import { Eda, Etl } from '@/sections/Datos';
import { Conclusiones, Modelos, Optimizacion } from '@/sections/Modelos';
import { COURSE } from '@/content';

// Vista tipo dashboard: barra lateral con las secciones y sus partes, y un panel que muestra
// solo la parte elegida. La ubicación vive en el hash (#eda/validacion-espacial), así que los
// enlaces de la portada, recargar la página y el botón "atrás" funcionan sin cambios.
const SECTIONS: { id: string; label: string; icon: LucideIcon; Component: ComponentType }[] = [
  { id: 'introduccion', label: 'Introducción', icon: BookOpen, Component: Introduccion },
  { id: 'etl', label: 'ETL', icon: Database, Component: Etl },
  { id: 'eda', label: 'EDA', icon: BarChart3, Component: Eda },
  { id: 'modelos', label: 'Modelos', icon: Brain, Component: Modelos },
  { id: 'optimizacion', label: 'Optimización', icon: Gauge, Component: Optimizacion },
  { id: 'conclusiones', label: 'Conclusiones', icon: Flag, Component: Conclusiones },
];

const CUADERNOS_URL = 'https://github.com/AlexT09/ModelSolar/tree/main/ml%20presentaci%C3%B3n/proceso';

type Part = { slug: string; label: string };

function readHash() {
  const [id, part = 'resumen'] = window.location.hash.slice(1).split('/');
  return { index: SECTIONS.findIndex((s) => s.id === id), part }; // index -1 = portada
}

const href = (index: number, part = 'resumen') =>
  `#${SECTIONS[index].id}${part === 'resumen' ? '' : `/${part}`}`;

export default function AppSecciones() {
  const [loc, setLoc] = useState(readHash);
  const [parts, setParts] = useState<Part[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onHash = () => {
      setLoc(readHash());
      setMenuOpen(false);
      panelRef.current?.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const onParts = useCallback((p: Part[]) => setParts(p), []);
  const panel = useMemo<PanelView>(() => ({ part: loc.part, onParts }), [loc.part, onParts]);

  // Recorrido lineal: las partes de la sección actual y luego el resumen de la siguiente
  const pos = Math.max(0, parts.findIndex((p) => p.slug === loc.part));
  const prev = loc.index < 0 ? null
    : pos > 0 ? { href: href(loc.index, parts[pos - 1].slug), label: parts[pos - 1].label }
    : loc.index > 0 ? { href: href(loc.index - 1), label: SECTIONS[loc.index - 1].label }
    : { href: '#', label: 'Portada' };
  const next = loc.index < 0 ? null
    : pos < parts.length - 1 ? { href: href(loc.index, parts[pos + 1].slug), label: parts[pos + 1].label }
    : loc.index < SECTIONS.length - 1 ? { href: href(loc.index + 1), label: SECTIONS[loc.index + 1].label }
    : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.altKey || e.ctrlKey || e.metaKey || t.closest('input, textarea, [role="tab"]')) return;
      if (e.key === 'ArrowRight' && next) window.location.hash = next.href;
      if (e.key === 'ArrowLeft' && prev) window.location.hash = prev.href;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  if (loc.index < 0) return <Hero />;

  const { Component, label } = SECTIONS[loc.index];
  const currentPart = parts[pos];

  return (
    <div className="h-[100dvh] flex overflow-hidden bg-[#080A19]">
      {/* Barra lateral: fija en pantallas grandes, cajón en móvil */}
      <div className={`fixed inset-0 z-40 bg-black/60 lg:hidden transition-opacity ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)} />
      <aside className={`fixed lg:static z-50 inset-y-0 left-0 w-[272px] shrink-0 flex flex-col bg-[#0b0d1f] border-r border-white/[0.06] transition-transform duration-300 ${menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-[60px] px-5 flex items-center justify-between border-b border-white/[0.06]">
          <a href="#" className="text-white text-[16px] font-[450]">ModelSolar</a>
          <button onClick={() => setMenuOpen(false)} aria-label="Cerrar el menú" className="lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav aria-label="Secciones" className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {SECTIONS.map((s, i) => {
            const active = i === loc.index;
            const Icon = s.icon;
            return (
              <div key={s.id}>
                <a href={href(i)} aria-current={active && loc.part === 'resumen' ? 'page' : undefined}
                  className={`flex items-center gap-3 h-[40px] px-3 rounded-[10px] text-[14px] font-[450] transition-colors ${
                    active ? 'bg-white/[0.08] text-white' : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                  }`}>
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-white/40'}`} />
                  <span className="flex-1">{s.label}</span>
                  <span className="text-[11px] tabular-nums text-white/30">{String(i + 1).padStart(2, '0')}</span>
                </a>
                {active && parts.length > 1 && (
                  <div className="ml-[22px] pl-3 border-l border-white/[0.08] my-1 space-y-0.5">
                    {parts.map((p) => (
                      <a key={p.slug} href={href(i, p.slug)} aria-current={p.slug === currentPart?.slug ? 'page' : undefined}
                        className={`block px-3 py-[7px] rounded-[8px] text-[13px] leading-[1.3] transition-colors ${
                          p.slug === currentPart?.slug ? 'bg-[#E9E9E9] text-[#0A0707] font-[450]' : 'text-white/55 hover:text-white hover:bg-white/[0.04]'
                        }`}>
                        {p.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.06] space-y-0.5">
          <a href="#" className="flex items-center gap-3 h-[38px] px-3 rounded-[10px] text-[13px] text-white/55 hover:text-white hover:bg-white/[0.04]">
            <Home className="w-4 h-4 text-white/40" /> Portada
          </a>
          <a href={`index.html#${SECTIONS[loc.index].id}`} className="flex items-center gap-3 h-[38px] px-3 rounded-[10px] text-[13px] text-white/55 hover:text-white hover:bg-white/[0.04]">
            <Rows3 className="w-4 h-4 text-white/40" /> Página continua
          </a>
          <a href={CUADERNOS_URL} target="_blank" rel="noreferrer" className="flex items-center gap-3 h-[38px] px-3 rounded-[10px] text-[13px] text-white/55 hover:text-white hover:bg-white/[0.04]">
            <ExternalLink className="w-4 h-4 text-white/40" /> Cuadernos
          </a>
        </div>
      </aside>

      {/* Panel principal */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-[60px] shrink-0 px-4 sm:px-8 flex items-center gap-3 border-b border-white/[0.06]">
          <button onClick={() => setMenuOpen(true)} aria-label="Abrir el menú" className="lg:hidden p-2 -ml-2 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.06]">
            <Menu className="w-5 h-5" />
          </button>
          <p className="flex-1 min-w-0 truncate text-[14px]">
            <span className="text-white/45">{String(loc.index + 1).padStart(2, '0')} · {label}</span>
            {currentPart && <><span className="text-white/25"> / </span><span className="text-white">{currentPart.label}</span></>}
          </p>
          <span className="hidden xl:block text-white/35 text-[12px] truncate">{COURSE}</span>
          <div className="flex gap-1">
            <NavButton to={prev} dir="prev" />
            <NavButton to={next} dir="next" />
          </div>
        </header>

        <div ref={panelRef} className="flex-1 overflow-y-auto">
          <PanelContext.Provider value={panel}>
            <main key={`${loc.index}/${loc.part}`} className="max-w-[1400px] px-4 sm:px-8 lg:px-12 py-8 sm:py-10 opacity-0 animate-fade-up">
              <Component />
            </main>
          </PanelContext.Provider>

          {next && (
            <div className="max-w-[1400px] px-4 sm:px-8 lg:px-12 pb-12">
              <a href={next.href} className="flex items-center justify-between gap-4 glass px-6 py-5 hover:bg-white/[0.06] transition-colors">
                <span>
                  <span className="block text-white/45 text-[12px] mb-1">Siguiente</span>
                  <span className="text-white text-[17px] font-[450]">{next.label}</span>
                </span>
                <ChevronRight className="w-5 h-5 text-white/60" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavButton({ to, dir }: { to: { href: string; label: string } | null; dir: 'prev' | 'next' }) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;
  const title = `${dir === 'prev' ? 'Anterior' : 'Siguiente'}${to ? `: ${to.label}` : ''} (flecha ${dir === 'prev' ? '←' : '→'})`;
  return to ? (
    <a href={to.href} title={title} aria-label={title}
      className="w-[36px] h-[36px] inline-flex items-center justify-center rounded-[10px] border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.06]">
      <Icon className="w-4 h-4" />
    </a>
  ) : (
    <span aria-hidden className="w-[36px] h-[36px] inline-flex items-center justify-center rounded-[10px] border border-white/[0.05] text-white/20">
      <Icon className="w-4 h-4" />
    </span>
  );
}
