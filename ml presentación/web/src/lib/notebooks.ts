import data from '@/generated/notebooks.json';

// Contenido extraído por scripts/extract_notebooks.py: celdas de markdown con su texto y celdas de
// código con sus salidas de texto e imágenes, cada una con su índice en el cuaderno.
export interface Cell {
  i: number;
  md?: string;
  out?: string[];
  img?: string[];
}

export type NbKey =
  | 'eda' | 'benchmark'
  | 'exp1' | 'exp2' | 'exp3' | 'exp4' | 'exp5' | 'exp6' | 'exp7' | 'resumen';

type Data = Record<NbKey, { file: string; cells: Cell[] }> & {
  _resumen_md: Record<string, string>;
};

const nbs = data as unknown as Data;

export const REPO = 'https://github.com/AlexT09/ModelSolar/blob/main/ml%20presentaci%C3%B3n/proceso/';

export function nbFile(nb: NbKey) {
  return nbs[nb].file;
}

export function nbUrl(nb: NbKey) {
  return REPO + encodeURIComponent(nbs[nb].file).replace(/%2F/g, '/');
}

export function cellsIn(nb: NbKey, from: number, to: number, skip: number[] = []) {
  return nbs[nb].cells.filter((c) => c.i >= from && c.i <= to && !skip.includes(c.i));
}

export function mdCell(nb: NbKey, i: number) {
  const c = nbs[nb].cells.find((x) => x.i === i);
  if (!c?.md) throw new Error(`${nb}[${i}] no es markdown`);
  return c.md;
}

export const resumenMd = nbs._resumen_md;
