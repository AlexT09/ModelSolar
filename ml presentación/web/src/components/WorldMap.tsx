import { useEffect, useMemo, useRef, useState } from 'react';
import { CLASS_COLORS, FOLD_COLORS, fmt, summary, type Points } from '@/lib/data';
import { hexAlpha, setupCanvas, useWidth } from '@/lib/canvas';

// Proyección equirectangular recortada a la franja con plantas.
const LON0 = -180, LON1 = 180, LAT0 = -58, LAT1 = 75;
const ASPECT = (LON1 - LON0) / (LAT1 - LAT0);

type Mode = 'class' | 'fold';
type Hover =
  | { kind: 'point'; i: number; x: number; y: number }
  | { kind: 'block'; b: Points['blocks'][number]; x: number; y: number }
  | null;

export default function WorldMap({ data, mode }: { data: Points; mode: Mode }) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState([true, true, true]);
  const [fold, setFold] = useState<number | null>(null);
  const [hover, setHover] = useState<Hover>(null);
  const height = Math.round(width / ASPECT);

  const px = (lon: number) => ((lon - LON0) / (LON1 - LON0)) * width;
  const py = (lat: number) => ((LAT1 - lat) / (LAT1 - LAT0)) * height;

  // Índice por celdas de 1° para encontrar la planta más cercana al cursor.
  const grid = useMemo(() => {
    const g = new Map<number, number[]>();
    for (let i = 0; i < data.lon.length; i++) {
      const k = Math.floor(data.lat[i] / 100 + 90) * 360 + Math.floor(data.lon[i] / 100 + 180);
      let cell = g.get(k);
      if (!cell) g.set(k, (cell = []));
      cell.push(i);
    }
    return g;
  }, [data]);

  const blockIndex = useMemo(() => {
    const m = new Map<string, Points['blocks'][number]>();
    for (const b of data.blocks) m.set(`${b[0]}_${b[1]}`, b);
    return m;
  }, [data]);

  const counts = useMemo(() => {
    const c = [0, 0, 0];
    for (const k of data.cls) c[k]++;
    return c;
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0) return;
    const ctx = setupCanvas(canvas, width, height);

    // Retícula cada 30°, con el ecuador un poco más marcado
    ctx.lineWidth = 1;
    for (let lon = -150; lon <= 150; lon += 30) {
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath(); ctx.moveTo(px(lon) + 0.5, 0); ctx.lineTo(px(lon) + 0.5, height); ctx.stroke();
    }
    for (let lat = -30; lat <= 60; lat += 30) {
      ctx.strokeStyle = lat === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)';
      ctx.beginPath(); ctx.moveTo(0, py(lat) + 0.5); ctx.lineTo(width, py(lat) + 0.5); ctx.stroke();
    }

    const r = Math.max(1.1, width / 900);
    if (mode === 'class') {
      for (const k of [2, 1, 0]) {
        if (!visible[k]) continue;
        ctx.fillStyle = hexAlpha(CLASS_COLORS[k], k === 0 ? 0.9 : 0.55);
        for (let i = 0; i < data.cls.length; i++) {
          if (data.cls[i] !== k) continue;
          ctx.fillRect(px(data.lon[i] / 100) - r / 2, py(data.lat[i] / 100) - r / 2, r, r);
        }
      }
    } else {
      const cw = (5 / (LON1 - LON0)) * width;
      const ch = (5 / (LAT1 - LAT0)) * height;
      for (const [lat, lon, , f] of data.blocks) {
        const active = fold === null || fold === f;
        ctx.fillStyle = hexAlpha(FOLD_COLORS[f], active ? 0.7 : 0.08);
        ctx.fillRect(px(lon) + 0.5, py(lat + 5) + 0.5, cw - 1, ch - 1);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      const pr = Math.max(0.8, r * 0.6);
      for (let i = 0; i < data.lon.length; i++) {
        if (fold !== null && data.fold[i] !== fold) continue;
        ctx.fillRect(px(data.lon[i] / 100) - pr / 2, py(data.lat[i] / 100) - pr / 2, pr, pr);
      }
    }
  }, [data, width, height, mode, visible, fold]);

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lon = LON0 + (x / width) * (LON1 - LON0);
    const lat = LAT1 - (y / height) * (LAT1 - LAT0);

    if (mode === 'fold') {
      const b = blockIndex.get(`${Math.floor(lat / 5) * 5}_${Math.floor(lon / 5) * 5}`);
      setHover(b && (fold === null || b[3] === fold) ? { kind: 'block', b, x, y } : null);
      return;
    }
    const radiusPx = 10;
    const degPerPx = (LON1 - LON0) / width;
    const span = Math.ceil(radiusPx * degPerPx) + 1;
    let best = -1;
    let bestD = radiusPx * radiusPx;
    const la0 = Math.floor(lat + 90), lo0 = Math.floor(lon + 180);
    for (let a = la0 - span; a <= la0 + span; a++) {
      for (let o = lo0 - span; o <= lo0 + span; o++) {
        const cell = grid.get(a * 360 + o);
        if (!cell) continue;
        for (const i of cell) {
          if (!visible[data.cls[i]]) continue;
          const dx = px(data.lon[i] / 100) - x;
          const dy = py(data.lat[i] / 100) - y;
          const d = dx * dx + dy * dy;
          // A igual distancia gana la clase Baja, que es la que se dibuja encima
          if (d < bestD || (d === bestD && best >= 0 && data.cls[i] < data.cls[best])) {
            bestD = d;
            best = i;
          }
        }
      }
    }
    setHover(best >= 0 ? { kind: 'point', i: best, x, y } : null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {mode === 'class'
          ? summary.classes.map((c, k) => (
              <Chip key={c} active={visible[k]} color={CLASS_COLORS[k]}
                onClick={() => setVisible((v) => v.map((x, j) => (j === k ? !x : x)))}>
                {c} <span className="text-white/50">{fmt(counts[k])}</span>
              </Chip>
            ))
          : (
            <>
              <Chip active={fold === null} onClick={() => setFold(null)}>Todos los pliegues</Chip>
              {summary.folds.map((f) => (
                <Chip key={f.fold} active={fold === null || fold === f.fold} color={FOLD_COLORS[f.fold]}
                  onClick={() => setFold(fold === f.fold ? null : f.fold)}>
                  Fold {f.fold}
                </Chip>
              ))}
            </>
          )}
      </div>

      <div ref={wrapRef} className="relative w-full rounded-[16px] overflow-hidden bg-[#0b0e21] border border-white/[0.06]">
        <canvas
          ref={canvasRef}
          className="block cursor-crosshair touch-none"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          role="img"
          aria-label={mode === 'class'
            ? 'Mapa de las plantas solares coloreadas por clase de aptitud'
            : 'Mapa de los bloques espaciales de 5 grados coloreados por pliegue'}
        />
        {width === 0 && <div style={{ height: 300 }} />}
        {hover && <Tooltip hover={hover} data={data} width={width} />}
      </div>
    </div>
  );
}

function Tooltip({ hover, data, width }: { hover: NonNullable<Hover>; data: Points; width: number }) {
  const left = Math.min(hover.x + 14, width - 270);
  const rows: [string, string][] =
    hover.kind === 'point'
      ? [
          ['country', data.countries[data.country[hover.i]]],
          ['solar_aptittude_class', summary.classes[data.cls[hover.i]]],
          ['solar_aptitude', (data.ias[hover.i] / 1000).toFixed(3)],
          ['slope', (data.slope[hover.i] / 10).toFixed(1)],
          ['macro_region', summary.regions[data.region[hover.i]]],
          ['lat, lon', `${(data.lat[hover.i] / 100).toFixed(2)}, ${(data.lon[hover.i] / 100).toFixed(2)}`],
        ]
      : [
          ['spatial_block', `${hover.b[0].toFixed(1)}_${hover.b[1].toFixed(1)}`],
          ['fold', String(hover.b[3])],
          ['plantas', fmt(hover.b[2])],
          ['Baja', fmt(hover.b[4])],
        ];
  return (
    <div className="pointer-events-none absolute z-10 w-[260px] rounded-[10px] bg-[rgba(10,12,28,0.92)] border border-white/10 backdrop-blur px-3 py-2.5 text-[12px]"
      style={{ left: Math.max(4, left), top: Math.max(4, hover.y - 20) }}>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3 leading-[1.6]">
          <span className="text-white/50 font-mono text-[11px]">{k}</span>
          <span className="text-white text-right">{v}</span>
        </div>
      ))}
    </div>
  );
}

export function Chip({ active, color, onClick, children }: {
  active: boolean; color?: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`h-[34px] px-3.5 inline-flex items-center gap-2 rounded-[10px] text-[13px] font-[450] border transition-colors ${
        active ? 'bg-white/[0.08] border-white/15 text-white' : 'bg-transparent border-white/[0.06] text-white/40'
      }`}
    >
      {color && <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: color, opacity: active ? 1 : 0.35 }} />}
      {children}
    </button>
  );
}
