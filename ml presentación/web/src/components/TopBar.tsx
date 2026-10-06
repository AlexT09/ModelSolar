import { useEffect, useState } from 'react';
import { CONTAINER } from './Section';

export const GROUPS = [
  { label: 'Proyecto', href: '#proyecto' },
  { label: 'Línea 1', href: '#linea-1' },
  { label: 'Línea 2', href: '#linea-2' },
  { label: 'Conclusiones', href: '#conclusiones' },
];

// Barra fija que aparece al salir del hero y dice en qué sección del recorrido está el lector.
export default function TopBar() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState('');

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const sections = Array.from(document.querySelectorAll<HTMLElement>('section[data-nav]'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.getAttribute('data-nav') ?? '');
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <div className={`fixed top-0 inset-x-0 z-30 transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      <div className="bg-[#080A19]/85 backdrop-blur-[17px] border-b border-white/[0.06]">
        <div className={`${CONTAINER} h-[52px] flex items-center justify-between gap-4`}>
          <a href="#" className="hidden sm:block text-white text-[15px] font-[450] shrink-0">Proyecto ModelSolar</a>
          <span className="hidden md:block text-white/55 text-[13px] truncate">{current}</span>
          <nav className="flex gap-1 overflow-x-auto">
            {GROUPS.map((g) => (
              <a key={g.href} href={g.href}
                className="shrink-0 px-2.5 sm:px-3 h-[32px] inline-flex items-center rounded-[8px] text-white/70 text-[13px] hover:text-white hover:bg-white/[0.06]">
                {g.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
