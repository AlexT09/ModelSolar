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

function CellView({ nb, cell }: { nb: NbKey; cell: Cell }) {
  if (cell.md !== undefined) return <Md text={cell.md} />;
  return (
    <div className="space-y-3">
      {cell.out?.map((t, k) => <Output key={k} text={t} />)}
      {cell.img?.map((name) => (
        <NbImage key={name} name={name} alt={`Figura de ${nbFile(nb)}, celda ${cell.i}`} />
      ))}
    </div>
  );
}

// Un tramo de celdas de un cuaderno, en orden, con la referencia a su origen.
export function Cells({ nb, from, to, skip = [] }: { nb: NbKey; from: number; to: number; skip?: number[] }) {
  const cells = cellsIn(nb, from, to, skip).filter((c) => !/^##\s+Referencias/m.test(c.md ?? ''));
  return (
    <div className="space-y-5 max-w-[960px]">
      {cells.map((c) => <CellView key={c.i} nb={nb} cell={c} />)}
      <Source nb={nb} from={from} to={to} />
    </div>
  );
}

export function Source({ nb, from, to }: { nb: NbKey; from?: number; to?: number }) {
  return (
    <p className="text-white/40 text-[12px] font-mono pt-2">
      Fuente:{' '}
      <a href={nbUrl(nb)} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-white">
        {nbFile(nb)}
      </a>
      {from !== undefined && `, celdas ${from}${to !== undefined && to !== from ? ` a ${to}` : ''}`}
    </p>
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
