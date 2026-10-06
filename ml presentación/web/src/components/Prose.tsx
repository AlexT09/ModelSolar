import { Fragment, type ReactNode } from 'react';

// Renderiza el markdown en línea de las celdas del cuaderno: `código`, *cursiva* y [texto](url).
// Los saltos de línea simples del cuaderno se unen; una línea en blanco separa párrafos.
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[(`?)([^\]]+?)\1\]\(([^)]+)\)|`([^`]+)`|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[3]) {
      out.push(
        <a key={m.index} href={m[3]} target="_blank" rel="noreferrer" className="underline decoration-white/30 underline-offset-4 hover:decoration-white">
          {m[1] ? <code className="code">{m[2]}</code> : m[2]}
        </a>,
      );
    } else if (m[4]) {
      out.push(<code key={m.index} className="code">{m[4]}</code>);
    } else {
      out.push(<em key={m.index}>{m[5]}</em>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Inline({ text }: { text: string }) {
  return <>{inline(text)}</>;
}

export default function Prose({ text, className = '' }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim());
  return (
    <div className={`space-y-4 text-white/75 text-[15px] sm:text-[16px] font-[450] leading-[1.6] ${className}`}>
      {paragraphs.map((p, i) => (
        <Fragment key={i}>
          <p>{inline(p)}</p>
        </Fragment>
      ))}
    </div>
  );
}
