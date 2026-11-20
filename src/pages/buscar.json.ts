import { canticosOrdenados, reflexionesOrdenadas } from '../lib/datos';
import { libros } from '../lib/biblia';
import sitio from '../config/sitio.json';
export async function GET() {
  const items = [
    ...(await canticosOrdenados()).map((c) => ({ tipo: 'Cántico', titulo: c.data.titulo, url: `/musica/${c.id}/`, texto: `${c.data.referencia} (RVR1909) · ${c.data.temas.join(', ')} · ${c.data.descripcion}` })),
    ...(sitio.youtube.videos as any[]).map((v) => ({ tipo: 'Video', titulo: v.titulo, url: `/youtube/#video-${v.id}`, texto: `${v.referencia ?? ''} ${v.descripcion ?? ''}` })),
    ...(await reflexionesOrdenadas()).map((r) => ({ tipo: 'Reflexión', titulo: r.data.titulo, url: `/reflexiones/${r.id}/`, texto: `${r.data.referencia} (RVR1909) · ${r.data.resumen}` })),
    ...libros.map((l) => ({ tipo: 'Libro de la Biblia', titulo: l.libro, url: `/biblia/${l.slug}/`, texto: `${l.capitulos.length} capítulos · ${l.testamento === 'AT' ? 'Antiguo' : 'Nuevo'} Testamento` })),
  ];
  return new Response(JSON.stringify({ items, libros: libros.map((l) => ({ libro: l.libro, slug: l.slug, capitulos: l.capitulos.length })) }), { headers: { 'Content-Type': 'application/json' } });
}
