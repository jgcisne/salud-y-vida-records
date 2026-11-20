import { canticosOrdenados } from '../lib/datos';
export async function GET() {
  const c = (await canticosOrdenados()).filter((x) => x.data.audio);
  return new Response(JSON.stringify(c.map((x) => ({ id: x.id, titulo: x.data.titulo, referencia: x.data.referencia, audio: x.data.audio, portada: x.data.portada, url: `/musica/${x.id}/` }))), { headers: { 'Content-Type': 'application/json' } });
}
