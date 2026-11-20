import { libros } from '../../lib/biblia';
// Texto completo RVR1909 para la búsqueda por palabras (se descarga solo si el visitante lo pide)
export async function GET() {
  const out: [string, number, number, string][] = [];
  for (const l of libros) l.capitulos.forEach((cap, i) => cap.forEach(([v, t]) => out.push([l.libro, i + 1, v, t])));
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } });
}
