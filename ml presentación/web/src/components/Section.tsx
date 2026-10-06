import { useId, useState, type ReactNode } from 'react';

export interface Stat {
  value: string;
  label: string;
  source: string; // cuaderno y celda de donde sale la cifra
}

export interface Tab {
  label: string;
  content: ReactNode;
}

export const CONTAINER = 'max-w-[1800px] mx-auto px-5 sm:px-8 md:px-[82px]';

export function Stats({ items }: { items: Stat[] }) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="glass p-5">
          <p className="text-white text-[32px] sm:text-[38px] leading-none tabular-nums">{s.value}</p>
          <p className="text-white/70 text-[13px] leading-[1.45] mt-3">{s.label}</p>
          <p className="text-white/35 text-[11px] font-mono mt-2">{s.source}</p>
        </div>
      ))}
    </div>
  );
}

export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  return (
    <div>
      <div role="tablist" aria-label="Detalle de la sección"
        className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 border-b border-white/[0.08]">
        {tabs.map((t, k) => (
          <button
            key={t.label}
            role="tab"
            id={`${id}-t${k}`}
            aria-selected={active === k}
            aria-controls={`${id}-p${k}`}
            onClick={() => setActive(k)}
            className={`shrink-0 h-[38px] px-4 rounded-[10px] text-[14px] font-[450] transition-colors ${
              active === k ? 'bg-[#E9E9E9] text-[#0A0707]' : 'text-white/65 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${id}-p${active}`} aria-labelledby={`${id}-t${active}`} className="pt-8">
        {tabs[active].content}
      </div>
    </div>
  );
}

export function Section({ id, kicker, title, summary, stats, tabs, after }: {
  id: string;
  kicker: string;
  title: string;
  summary: ReactNode;
  stats?: Stat[];
  tabs?: Tab[];
  after?: ReactNode;
}) {
  return (
    <section id={id} data-nav={title} className="scroll-mt-16 py-16 sm:py-24 border-t border-white/[0.06]">
      <div className={CONTAINER}>
        <p className="text-white/45 text-[13px] font-[450] mb-3">{kicker}</p>
        <h2 className="text-white text-[30px] sm:text-[44px] md:text-[52px] font-normal leading-[1.05] max-w-[1000px] mb-6">
          {title}
        </h2>
        <div className="max-w-[900px] mb-10">{summary}</div>
        {stats && <div className="mb-12">{<Stats items={stats} />}</div>}
        {tabs && <Tabs tabs={tabs} />}
        {after}
      </div>
    </section>
  );
}

// Separador de cada línea de trabajo
export function LineHeader({ id, label, title, text }: { id: string; label: string; title: string; text: string }) {
  return (
    <div id={id} className="scroll-mt-16 border-t border-white/[0.06] bg-white/[0.02]">
      <div className={`${CONTAINER} py-14 sm:py-20`}>
        <p className="text-white/45 text-[13px] mb-3">{label}</p>
        <p className="text-white text-[34px] sm:text-[56px] md:text-[64px] leading-[1] max-w-[1100px]">{title}</p>
        <p className="text-white/65 text-[16px] sm:text-[18px] leading-[1.5] max-w-[760px] mt-6">{text}</p>
      </div>
    </div>
  );
}
