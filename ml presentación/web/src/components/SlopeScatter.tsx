import { useEffect, useMemo, useRef, useState } from 'react';
import { REGION_COLORS, summary, type Points } from '@/lib/data';
import { hexAlpha, setupCanvas, useWidth } from '@/lib/canvas';
import { Chip } from './WorldMap';

// Réplica de la figura de la celda 76: pendiente <= 20° contra solar_aptitude, por macro-región.
const PAD = { l: 44, r: 12, t: 12, b: 36 };
const X_MAX = 20;

export default function SlopeScatter({ data }: { data: Points }) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState([true, true, true]);
  const height = Math.round(Math.min(460, Math.max(300, width * 0.55)));

  const idx = useMemo(() => {
    const byRegion: number[][] = [[], [], []];
    for (let i = 0; i < data.slope.length; i++) {
      if (data.slope[i] <= X_MAX * 10) byRegion[data.region[i]].push(i);
    }
    return byRegion;
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0) return;
    const ctx = setupCanvas(canvas, width, height);
    const w = width - PAD.l - PAD.r;
    const h = height - PAD.t - PAD.b;
    const x = (v: number) => PAD.l + (v / X_MAX) * w;
    const y = (v: number) => PAD.t + (1 - v) * h;

    ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    for (let v = 0; v <= 1.0001; v += 0.2) {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath(); ctx.moveTo(PAD.l, y(v) + 0.5); ctx.lineTo(PAD.l + w, y(v) + 0.5); ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(v.toFixed(1), PAD.l - 8, y(v) + 4);
    }
    for (let v = 0; v <= X_MAX; v += 5) {
      ctx.textAlign = 'center';
      ctx.fillText(String(v), x(v), PAD.t + h + 18);
    }
    ctx.textAlign = 'center';
    ctx.fillText('Pendiente (°)', PAD.l + w / 2, height - 4);
    ctx.save();
    ctx.translate(11, PAD.t + h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('solar_aptitude', 0, 0);
    ctx.restore();

    const r = 2.2;
    idx.forEach((list, k) => {
      if (!active[k]) return;
      ctx.fillStyle = hexAlpha(REGION_COLORS[k], 0.18);
      for (const i of list) {
        ctx.fillRect(x(data.slope[i] / 10) - r / 2, y(data.ias[i] / 1000) - r / 2, r, r);
      }
    });
  }, [data, idx, width, height, active]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {summary.regions.map((r, k) => (
          <Chip key={r} active={active[k]} color={REGION_COLORS[k]}
            onClick={() => setActive((a) => a.map((v, j) => (j === k ? !v : v)))}>
            {r}
          </Chip>
        ))}
      </div>
      <div ref={wrapRef} className="w-full">
        <canvas ref={canvasRef} className="block" role="img"
          aria-label="Pendiente contra aptitud, por macro-región" />
        {width === 0 && <div style={{ height: 300 }} />}
      </div>
    </div>
  );
}
