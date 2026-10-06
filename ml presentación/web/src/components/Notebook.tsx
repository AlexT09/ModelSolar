import { useMemo, useState } from 'react';
import { marked } from 'marked';
import { cellsIn, nbFile, nbUrl, type Cell, type NbKey } from '@/lib/notebooks';

const BASE = import.meta.env.BASE_URL;

// Markdown de una celda, tal cual. Las imágenes enlazadas (fig_*.png) se sirven desde figs/ y
// los enlaces externos abren en otra pestaña. Con noImages se quitan las imágenes del texto.
export function Md({ text, className = '', noImages = false }: { text: string; className?: string; noImages?: boolean }) {
  const html = useMemo(() => {
    let src = text;
    if (noImages) src = src.replace(/^!\[[^\]]*\]\([^)]+\)\s*$/gm, '');
    return (marked.parse(src, { async: false }) as string)
      .replace(/src="(fig_[^"]+\.png)"/g, `src="${BASE}figs/$1" loading="lazy"`)
      .replace(/<a href="http/g, '<a target="_blank" rel="noreferrer" href="http');
  }, [text, noImages]);
  return <div className={`md ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

const FOLD_LINES = 16;

// Salida de texto de una celda. Las tablas largas se muestran recortadas y se despliegan a pedido.
export function Output({ text }: { text: string }) {
  const lines = text.split('\n');
  const [open, setOpen] = useState(false);
  const long = lines.length > FOLD_LINES;
  return (
    <div>
      <pre className="output">{long && !open ? lines.slice(0, 10).join('\n') + '\n…' : text}</pre>
      {long && (
        <button onClick={() => setOpen(!open)}
          className="mt-2 text-[13px] text-white/70 hover:text-white underline underline-offset-4 decoration-white/30">
          {open ? 'Ocultar tabla' : `Ver tabla completa (${lines.length} líneas)`}
        </button>
      )}
    </div>
  );
}

export function NbImage({ name, alt }: { name: string; alt: string }) {
  const src = `${BASE}figs/nb/${name}`;
  return (
    <a href={src} target="_blank" rel="noreferrer" className="block rounded-[14px] bg-white p-2 sm:p-3 overflow-hidden">
      <img src={src} alt={alt} loading="lazy" className="w-full h-auto" />
    </a>
  );
}

// Una celda completa (su índice) o solo algunas de sus salidas de texto. Las imágenes de la celda se
// muestran salvo que img sea false.
export type Pick = number | { i: number; out?: number[]; img?: boolean };

function CellView({ nb, cell, pick }: { nb: NbKey; cell: Cell; pick: Pick }) {
  if (cell.md !== undefined) return <Md text={cell.md} />;
  const outs = typeof pick === 'object' && pick.out ? pick.out.map((k) => cell.out?.[k]).filter(Boolean) as string[] : cell.out ?? [];
  const showImg = typeof pick === 'number' || pick.img !== false;
  return (
    <div className="space-y-3">
      {outs.map((t, k) => <Output key={k} text={t} />)}
      {showImg && cell.img?.map((name) => (
        <NbImage key={name} name={name} alt={`Figura de ${nbFile(nb)}, celda ${cell.i}`} />
      ))}
    </div>
  );
}

// Las celdas elegidas de un cuaderno, en orden, con la referencia a su origen y el enlace al cuaderno.
export function Cells({ nb, picks }: { nb: NbKey; picks: Pick[] }) {
  const ids = picks.map((p) => (typeof p === 'number' ? p : p.i));
  return (
    <div className="space-y-5 max-w-[960px]">
      {picks.map((p) => {
        const i = typeof p === 'number' ? p : p.i;
        const cell = cellsIn(nb, i, i)[0];
        if (!cell) throw new Error(`${nb}[${i}] no tiene contenido`);
        return <CellView key={i} nb={nb} cell={cell} pick={p} />;
      })}
      <Source nb={nb} cells={ids} />
    </div>
  );
}

export function Source({ nb, from, to, cells }: { nb: NbKey; from?: number; to?: number; cells?: number[] }) {
  const range = cells
    ? `, celdas ${cells.join(', ')}`
    : from !== undefined ? `, celdas ${from}${to !== undefined && to !== from ? ` a ${to}` : ''}` : '';
  return (
    <p className="text-white/40 text-[12px] font-mono pt-2 leading-[1.7]">
      Fuente: {nbFile(nb)}{range}.{' '}
      <a href={nbUrl(nb)} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-white whitespace-nowrap">
        Ver el cuaderno completo
      </a>
    </p>
  );
}

// La salida original de una o más celdas, plegada debajo de la tabla limpia que se armó con ella.
export function Raw({ nb, outs }: { nb: NbKey; outs: [number, number][] }) {
  return (
    <details className="mt-3 group">
      <summary className="cursor-pointer select-none text-[13px] text-white/60 hover:text-white underline underline-offset-4 decoration-white/30 w-fit">
        Ver la salida del cuaderno
      </summary>
      <div className="mt-3 space-y-3">
        {outs.map(([i, k]) => {
          const text = cellsIn(nb, i, i)[0]?.out?.[k];
          if (!text) throw new Error(`${nb}[${i}] no tiene la salida ${k}`);
          return (
            <div key={`${i}-${k}`}>
              <p className="text-white/35 text-[11px] font-mono mb-1">celda {i}</p>
              <pre className="output">{text}</pre>
            </div>
          );
        })}
      </div>
    </details>
  );
}

// La síntesis que el equipo escribió en Resumen_Final.ipynb para un tema, sin su encabezado.
export function Synthesis({ i }: { i: number }) {
  const cell = cellsIn('resumen', i, i)[0];
  if (!cell?.md) throw new Error(`resumen[${i}] no es markdown`);
  const body = cell.md.replace(/^#+\s.*\n+/, '');
  return (
    <div className="glass p-5 sm:p-6 max-w-[960px] border-l-4 !border-l-white/30">
      <p className="text-white/50 text-[12px] mb-3">Síntesis del equipo</p>
      <Md text={body} />
      <p className="text-white/35 text-[11px] font-mono mt-3">Resumen_Final.ipynb, celda {i}</p>
    </div>
  );
}

// Las referencias de los cuadernos de una sección, plegadas.
export function References({ items }: { items: { nb: NbKey; i: number }[] }) {
  return (
    <details className="mt-10 glass p-5 sm:p-6 group">
      <summary className="cursor-pointer text-white/80 text-[14px] select-none">Referencias de los cuadernos</summary>
      <div className="mt-5 space-y-6">
        {items.map(({ nb, i }) => {
          const cell = cellsIn(nb, i, i)[0];
          return cell?.md ? (
            <div key={nb}>
              <p className="text-white/50 text-[12px] font-mono mb-2">{nbFile(nb)}</p>
              <Md text={cell.md.replace(/^##\s+.*$/m, '')} className="md-small" />
            </div>
          ) : null;
        })}
      </div>
    </details>
  );
}
