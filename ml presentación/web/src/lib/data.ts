import { useEffect, useState } from 'react';
import summaryJson from '@/generated/summary.json';

// Paletas validadas con el validador de dataviz contra la superficie oscura #0f1122.
// Baja va en naranja porque el texto del cuaderno (celda 66) la nombra así.
export const CLASS_COLORS = ['#d95926', '#9085e9', '#199e70']; // Baja, Media, Alta
export const REGION_COLORS = ['#3987e5', '#d55181', '#c98500'];
export const FOLD_COLORS = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181'];

export interface Summary {
  classes: string[];
  regions: string[];
  rows_raw: number;
  rows_clean: number;
  class_raw: Record<string, number>;
  class_clean: Record<string, number>;
  ias_mean: number;
  ias_max: number;
  region_summary: {
    region: string;
    n: number;
    mean_ias: number;
    Baja: number;
    Media: number;
    Alta: number;
  }[];
  spearman: { var: string; r: number }[];
  baja_by_country: { country: string; n: number }[];
  folds: { fold: number; n: number; baja: number; pct_baja: number }[];
  n_blocks: number;
  ias_hist: number[];
}

export const summary = summaryJson as Summary;

// Columnas enteras: lon y lat x100, ias x1000, slope x10; cls, region, fold y country son índices.
export interface Points {
  countries: string[];
  blocks: [number, number, number, number, number][]; // lat, lon, n, fold, baja
  lon: number[];
  lat: number[];
  ias: number[];
  slope: number[];
  cls: number[];
  region: number[];
  fold: number[];
  country: number[];
}

let cache: Promise<Points> | null = null;

function loadPoints() {
  cache ??= fetch(`${import.meta.env.BASE_URL}eda/points.json`).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json() as Promise<Points>;
  });
  return cache;
}

export function usePoints() {
  const [state, setState] = useState<{ data: Points | null; error: string | null }>({
    data: null,
    error: null,
  });
  useEffect(() => {
    let alive = true;
    loadPoints()
      .then((data) => alive && setState({ data, error: null }))
      .catch((e: Error) => alive && setState({ data: null, error: e.message }));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

export const fmt = (n: number) => n.toLocaleString('en-US');
