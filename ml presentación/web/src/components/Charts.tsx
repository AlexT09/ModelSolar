import { useState } from 'react';
import { CLASS_COLORS, FOLD_COLORS, fmt, summary } from '@/lib/data';
import type { NbKey } from '@/lib/notebooks';
import { Raw } from './Notebook';

const CLASSES = summary.classes;

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5 text-[12px] text-white/70">
          <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

export const classLegend = CLASSES.map((c, i) => ({ label: c, color: CLASS_COLORS[i] }));

// Barra apilada al 100 % con separación de 2px entre segmentos y tooltip por segmento.
function StackRow({ label, counts, sub }: { label: string; counts: number[]; sub?: string }) {
  const total = counts.reduce((a, b) => a + b, 0);
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5 gap-3">
        <span className="text-[13px] text-white/85">{label}</span>
        {sub && <span className="text-[12px] text-white/50 text-right">{sub}</span>}
      </div>
      <div className="relative flex gap-[2px] h-[22px]">
        {counts.map((n, k) =>
          n === 0 ? null : (
            <div key={k}
              className="h-full first:rounded-l-[4px] last:rounded-r-[4px] transition-opacity"
              style={{ width: `${(n / total) * 100}%`, minWidth: 2, background: CLASS_COLORS[k],
                opacity: hover === null || hover === k ? 1 : 0.4 }}
              onPointerEnter={() => setHover(k)}
              onPointerLeave={() => setHover(null)}
            />
          ),
        )}
      </div>
      <div className="flex gap-4 mt-1.5 text-[12px] text-white/60 tabular-nums">
        {counts.map((n, k) => (
          <span key={k} className={hover === k ? 'text-white' : ''}>
            {CLASSES[k]} {fmt(n)} ({((n / total) * 100).toFixed(2)} %)
          </span>
        ))}
      </div>
    </div>
  );
}

export function ClassBeforeAfter() {
  const raw = CLASSES.map((c) => summary.class_raw[c]);
  const clean = CLASSES.map((c) => summary.class_clean[c]);
  return (
    <div className="space-y-6">
      <StackRow label="Antes de limpiar" sub={`${fmt(summary.rows_raw)} filas`} counts={raw} />
      <StackRow label="Después de limpiar" sub={`${fmt(summary.rows_clean)} filas`} counts={clean} />
      <Legend items={classLegend} />
    </div>
  );
}

export function RegionComposition() {
  return (
    <div className="space-y-6">
      {summary.region_summary.map((r) => (
        <StackRow key={r.region} label={r.region}
          sub={`n = ${fmt(r.n)} · media_IAS = ${r.mean_ias.toFixed(3)}`}
          counts={[r.Baja, r.Media, r.Alta]} />
      ))}
      <Legend items={classLegend} />
    </div>
  );
}

export function HBars({ rows, color, format = fmt }: {
  rows: { label: string; value: number }[];
  color: string;
  format?: (v: number) => string;
}) {
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[120px_1fr_44px] sm:grid-cols-[140px_1fr_48px] items-center gap-3 group">
          <span className="text-[13px] text-white/75 truncate">{r.label}</span>
          <div className="h-[14px]">
            <div className="h-full rounded-r-[4px] group-hover:brightness-125"
              style={{ width: `${(r.value / max) * 100}%`, background: color }} />
          </div>
          <span className="text-[13px] text-white/85 tabular-nums text-right">{format(r.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Correlación de Spearman con solar_aptitude (salida de la celda 74), barras divergentes desde 0.
export function SpearmanBars() {
  const POS = '#3987e5';
  const NEG = '#d95926';
  return (
    <div>
      <div className="space-y-1.5">
        {summary.spearman.map((s) => (
          <div key={s.var} className="grid grid-cols-[130px_1fr_52px] sm:grid-cols-[160px_1fr_56px] items-center gap-3 group">
            <span className="font-mono text-[12px] text-white/75 truncate">{s.var}</span>
            <div className="relative h-[14px]">
              <div className="absolute left-1/2 top-[-3px] bottom-[-3px] w-px bg-white/25" />
              <div className="absolute top-0 h-full group-hover:brightness-125"
                style={{
                  width: `${Math.abs(s.r) * 50}%`,
                  left: s.r >= 0 ? '50%' : `${50 - Math.abs(s.r) * 50}%`,
                  background: s.r >= 0 ? POS : NEG,
                  borderRadius: s.r >= 0 ? '0 4px 4px 0' : '4px 0 0 4px',
                }} />
            </div>
            <span className="text-[13px] text-white/85 tabular-nums text-right">{s.r.toFixed(3)}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[130px_1fr_52px] sm:grid-cols-[160px_1fr_56px] gap-3 mt-2 text-[11px] text-white/45">
        <span />
        <div className="flex justify-between"><span>−1</span><span>0</span><span>+1</span></div>
        <span />
      </div>
      <Legend items={[{ label: 'r positivo', color: POS }, { label: 'r negativo', color: NEG }]} />
    </div>
  );
}

// Tabla de presentación con valores tomados de una salida de cuaderno. La fila `best` se resalta.
export function DataTable({ title, columns, rows, best, source, note, raw }: {
  title?: string;
  columns: string[];
  rows: (string | number)[][];
  best?: number;
  source: string;
  note?: string;
  raw?: { nb: NbKey; outs: [number, number][] };
}) {
  const isNum = (v: string | number) => typeof v === 'number' || /^[−\-+<]?\s?[\d.,]+(\s?[±→%s].*)?$/.test(String(v));
  return (
    <div>
      {title && <p className="text-white text-[15px] sm:text-[16px] font-[450] mb-3">{title}</p>}
      <div className="overflow-x-auto rounded-[14px] border border-white/[0.08]">
        <table className="w-full text-[13px] sm:text-[14px] tabular-nums">
          <thead>
            <tr className="bg-white/[0.04] text-white/55">
              {columns.map((c, k) => (
                <th key={c} className={`font-[450] px-3 sm:px-4 py-2.5 whitespace-nowrap ${k === 0 ? 'text-left' : 'text-right'}`}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={`border-t border-white/[0.06] ${best === i ? 'bg-white/[0.06] text-white' : 'text-white/80'}`}>
                {r.map((v, k) => (
                  <td key={k} className={`px-3 sm:px-4 py-2 whitespace-nowrap ${k === 0 ? 'text-left' : isNum(v) ? 'text-right' : 'text-right text-white/60'} ${best === i && k === 0 ? 'font-[600]' : ''}`}>
                    {typeof v === 'number' ? v.toString() : v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className="text-white/50 text-[12px] mt-2">{note}</p>}
      <p className="text-white/35 text-[11px] font-mono mt-2">{source}</p>
      {raw && <Raw nb={raw.nb} outs={raw.outs} />}
    </div>
  );
}

export function FoldTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px] tabular-nums">
        <thead>
          <tr className="text-white/50 text-left">
            <th className="font-[450] py-2 pr-3">Fold</th>
            <th className="font-[450] py-2 pr-3 text-right">n_test</th>
            <th className="font-[450] py-2 pr-3 text-right">Baja_test</th>
            <th className="font-[450] py-2 w-[45%]">% Baja</th>
          </tr>
        </thead>
        <tbody>
          {summary.folds.map((f) => (
            <tr key={f.fold} className="border-t border-white/[0.06]">
              <td className="py-2 pr-3">
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: FOLD_COLORS[f.fold] }} />
                  Fold {f.fold}
                </span>
              </td>
              <td className="py-2 pr-3 text-right text-white/85">{fmt(f.n)}</td>
              <td className="py-2 pr-3 text-right text-white/85">{f.baja}</td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-[10px]">
                    <div className="h-full rounded-r-[4px]" style={{ width: `${(f.pct_baja / 4) * 100}%`, background: CLASS_COLORS[0] }} />
                  </div>
                  <span className="w-[48px] text-right text-white/85">{f.pct_baja.toFixed(2)}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
