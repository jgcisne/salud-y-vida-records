// Utilidades de la biblioteca bíblica (RVR1909). El texto proviene de un archivo
// de dominio público (seven1m/open-bibles, spa-rv1909) convertido a JSON.
import datos from '../data/biblia/rvr1909.json';

export type Libro = { n: number; libro: string; slug: string; codigo: string; testamento: 'AT' | 'NT'; capitulos: [number, string][][] };

export const libros: Libro[] = (datos as any[]).map((b, i) => ({ n: i + 1, ...b }));

export const libroPorSlug = (slug: string) => libros.find((l) => l.slug === slug);
export const nombreLibro = (slug: string) => libroPorSlug(slug)?.libro ?? slug;

export function versiculo(slug: string, cap: number, v: number) {
  const l = libroPorSlug(slug);
  const t = l?.capitulos[cap - 1]?.find((x) => x[0] === v)?.[1];
  return t ? { texto: t, referencia: `${l!.libro} ${cap}:${v}`, url: `/biblia/${slug}/${cap}/#v${v}` } : null;
}

export const quitarAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
