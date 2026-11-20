// =============================================================
// Salud y Vida Records — comportamiento del sitio (sin dependencias)
// Reproductor único, favoritos locales, compartir, tema, filtros,
// buscador unificado, lectura bíblica y formulario de contacto.
// =============================================================

type Cantico = { id: string; titulo: string; referencia: string; audio: string; portada?: string; url: string };

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
// Raíz del sitio: normalmente "/". En la vista previa se usan rutas relativas.
const raiz = () => document.documentElement.dataset.raiz || '/';
const ruta = (p: string) => (/^https?:/.test(p) ? p : raiz() + p.replace(/^\//, ''));
const guardar = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const leer = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function aviso(msg: string) {
  $('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

// ---------------- Tema claro / oscuro ----------------
function aplicarTema() {
  const b = $('#boton-tema');
  const oscuro = document.documentElement.dataset.theme !== 'light';
  b?.setAttribute('aria-pressed', String(!oscuro));
  b?.setAttribute('aria-label', oscuro ? 'Activar modo claro' : 'Activar modo oscuro');
}

// ---------------- Reproductor ----------------
let canticos: Cantico[] | null = null;
let cola: string[] = [];
let actual = -1;
const audio = () => $('#audio') as HTMLAudioElement;

async function cargarCanticos() {
  if (canticos) return canticos;
  try { canticos = await (await fetch(ruta('/canticos.json'))).json(); } catch { canticos = []; }
  return canticos!;
}
const buscarC = (id: string) => canticos?.find((c) => c.id === id);
const fmt = (s: number) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');

function sincronizarBotones() {
  const a = audio(); const id = cola[actual]; const sonando = !!a && !a.paused;
  $$('[data-play]').forEach((b) => {
    const activo = b.dataset.play === id && sonando;
    b.setAttribute('aria-pressed', String(activo));
    const t = buscarC(b.dataset.play!)?.titulo || '';
    b.setAttribute('aria-label', `${activo ? 'Pausar' : 'Reproducir'} ${t}`);
  });
  const p = $('#r-play');
  p?.setAttribute('aria-pressed', String(sonando));
  p?.setAttribute('aria-label', sonando ? 'Pausar' : 'Reproducir');
}

async function reproducir(id: string, nuevaCola?: string[]) {
  await cargarCanticos();
  const c = buscarC(id); if (!c) return;
  if (nuevaCola) cola = nuevaCola.filter((x) => buscarC(x));
  if (!cola.includes(id)) cola = [id, ...cola];
  actual = cola.indexOf(id);
  const a = audio();
  if (a.dataset.id !== id) {
    a.src = ruta(c.audio); a.dataset.id = id;
    $('#r-titulo')!.textContent = c.titulo;
    $('#r-ref')!.textContent = `${c.referencia} (RVR1909)`;
    $('#r-mini')!.innerHTML = c.portada ? `<img src="${esc(ruta(c.portada))}" alt="">` : $('#r-mini')!.innerHTML;
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: c.titulo, artist: 'Salud y Vida Records', album: c.referencia + ' (RVR1909)',
        artwork: [{ src: ruta(c.portada || '/img/icono-512.png'), sizes: '512x512' }] });
    }
  }
  $('#reproductor')!.classList.add('visible'); document.body.classList.add('con-reproductor');
  try { await a.play(); } catch { aviso('Toque Reproducir de nuevo para iniciar el audio.'); }
  sincronizarBotones();
}
function alternar() { const a = audio(); if (!a.src) return; a.paused ? a.play().catch(() => {}) : a.pause(); }
function mover(d: number) { if (!cola.length) return; const i = (actual + d + cola.length) % cola.length; reproducir(cola[i]); }

function iniciarReproductor() {
  const a = audio(); if (!a || a.dataset.listo) return; a.dataset.listo = '1';
  a.volume = leer('syv-volumen', 0.9);
  ($('#r-vol') as HTMLInputElement).value = String(a.volume);
  a.addEventListener('play', sincronizarBotones);
  a.addEventListener('pause', sincronizarBotones);
  a.addEventListener('ended', () => { if (actual < cola.length - 1) mover(1); else sincronizarBotones(); }); // reproducción continua
  a.addEventListener('error', () => aviso('No se pudo cargar este audio.'));
  a.addEventListener('loadedmetadata', () => { $('#r-total')!.textContent = fmt(a.duration); });
  a.addEventListener('timeupdate', () => {
    $('#r-actual')!.textContent = fmt(a.currentTime);
    if (a.duration) ($('#r-barra') as HTMLInputElement).value = String(Math.round((a.currentTime / a.duration) * 1000));
  });
  $('#r-barra')!.addEventListener('input', (e) => { if (a.duration) a.currentTime = (+(e.target as HTMLInputElement).value / 1000) * a.duration; });
  $('#r-vol')!.addEventListener('input', (e) => { a.volume = +(e.target as HTMLInputElement).value; guardar('syv-volumen', a.volume); });
  $('#r-play')!.addEventListener('click', alternar);
  $('#r-ant')!.addEventListener('click', () => (a.currentTime > 3 ? (a.currentTime = 0) : mover(-1)));
  $('#r-sig')!.addEventListener('click', () => mover(1));
  $('#r-cerrar')!.addEventListener('click', () => { a.pause(); $('#reproductor')!.classList.remove('visible'); document.body.classList.remove('con-reproductor'); });
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => a.play());
    navigator.mediaSession.setActionHandler('pause', () => a.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => mover(-1));
    navigator.mediaSession.setActionHandler('nexttrack', () => mover(1));
  }
}

// ---------------- Favoritos (solo en este dispositivo) ----------------
type Fav = { titulo: string; url: string; fecha: number };
const favs = () => leer<Record<string, Fav>>('syv-favoritos', {});
function pintarFavs() {
  const f = favs();
  $$('[data-fav]').forEach((b) => {
    const on = !!f[b.dataset.fav!];
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', `${on ? 'Quitar de' : 'Guardar en'} favoritos: ${b.dataset.favTitulo}`);
  });
  const lista = $('#lista-favoritos');
  if (lista) {
    const items = Object.entries(f).sort((a, b) => b[1].fecha - a[1].fecha);
    lista.innerHTML = items.length
      ? `<ul class="resultados">${items.map(([k, v]) => `<li><a href="${esc(ruta(v.url))}"><span class="tipo">${k.startsWith('cantico') ? 'Cántico' : k.startsWith('versiculo') ? 'Versículo' : k.startsWith('video') ? 'Video' : 'Reflexión'}</span><strong>${esc(v.titulo)}</strong></a></li>`).join('')}</ul>`
      : `<div class="vacio"><h3>Todavía no tiene favoritos</h3><p>Toque el corazón en cualquier cántico, video o versículo para guardarlo aquí. Se guarda solo en este dispositivo; no necesita crear una cuenta.</p></div>`;
  }
}
function alternarFav(b: HTMLElement) {
  const f = favs(); const k = b.dataset.fav!;
  if (f[k]) { delete f[k]; aviso('Quitado de favoritos'); } else { f[k] = { titulo: b.dataset.favTitulo!, url: b.dataset.favUrl!, fecha: Date.now() }; aviso('Guardado en favoritos'); }
  guardar('syv-favoritos', f); pintarFavs();
}

// ---------------- Compartir ----------------
async function compartir(titulo: string, url: string, texto = '') {
  const abs = new URL(ruta(url), location.href).href;
  if (navigator.share) { try { await navigator.share({ title: titulo, text: texto || titulo, url: abs }); return; } catch (e: any) { if (e?.name === 'AbortError') return; } }
  copiar(`${texto ? texto + '\n' : ''}${abs}`, 'Enlace copiado');
}
async function copiar(t: string, ok = 'Copiado') {
  try { await navigator.clipboard.writeText(t); aviso(ok); }
  catch { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); aviso(ok); } catch { aviso('No se pudo copiar'); } ta.remove(); }
}

// ---------------- Biblioteca musical: filtros ----------------
function iniciarFiltros() {
  const lista = $('#lista-canticos'); if (!lista) return;
  const tx = $('#f-texto') as HTMLInputElement, lb = $('#f-libro') as HTMLSelectElement, tm = $('#f-tema') as HTMLSelectElement;
  const mas = $('#ver-mas') as HTMLButtonElement; const conteo = $('#conteo');
  const tarjetas = $$('.tarjeta', lista); let limite = 48;
  const q = new URLSearchParams(location.search);
  if (q.get('libro')) lb.value = q.get('libro')!; if (q.get('tema')) tm.value = q.get('tema')!; if (q.get('q')) tx.value = q.get('q')!;
  const aplicar = () => {
    const t = sinAcentos(tx.value.trim()); let n = 0, vis = 0;
    tarjetas.forEach((c) => {
      const ok = (!t || sinAcentos(c.dataset.buscar!).includes(t)) && (!lb.value || c.dataset.libro === lb.value) && (!tm.value || c.dataset.temas!.split('|').includes(tm.value));
      if (ok) n++;
      const mostrar = ok && vis < limite; if (mostrar) vis++;
      c.hidden = !mostrar;
    });
    conteo!.textContent = n === 1 ? '1 cántico encontrado' : `${n} cánticos encontrados`;
    mas.hidden = n <= vis; $('#sin-resultados')!.hidden = n > 0;
  };
  [tx, lb, tm].forEach((el) => el.addEventListener('input', () => { limite = 48; aplicar(); }));
  mas.addEventListener('click', () => { limite += 48; aplicar(); });
  aplicar();
}

// ---------------- Lectura bíblica ----------------
function iniciarBiblia() {
  const lec = $('.lectura'); if (!lec) return;
  const tam = leer('syv-letra', 21);
  lec.style.setProperty('--letra', tam + 'px'); $$('.vers', lec).forEach((v) => (v.style.fontSize = tam + 'px'));
  if (location.hash.startsWith('#v')) $(location.hash)?.classList.add('marcado');
}
function cambiarLetra(d: number) {
  const t = Math.min(30, Math.max(17, leer('syv-letra', 21) + d)); guardar('syv-letra', t);
  $$('.lectura .vers').forEach((v) => (v.style.fontSize = t + 'px'));
}

// ---------------- Buscador unificado ----------------
type Item = { t: string; tipo: string; titulo: string; url: string; texto: string };
let indice: { items: Item[]; libros: { libro: string; slug: string; capitulos: number }[] } | null = null;
let textoBiblia: [string, number, number, string][] | null = null;

function parsearReferencia(q: string) {
  if (!indice) return null;
  const m = sinAcentos(q).trim().match(/^((?:[123]\s*)?[a-z\s]+?)\s*(\d+)?(?:\s*[:.,]\s*(\d+))?$/);
  if (!m) return null;
  const nombre = m[1].replace(/\s+/g, ' ').trim();
  const l = indice.libros.find((b) => sinAcentos(b.libro) === nombre) || (nombre.length >= 3 ? indice.libros.find((b) => sinAcentos(b.libro).startsWith(nombre)) : undefined);
  if (!l) return null;
  const cap = m[2] ? Math.min(+m[2], l.capitulos) : 1;
  return { titulo: `${l.libro}${m[2] ? ' ' + cap : ''}${m[3] ? ':' + m[3] : ''}`, url: `/biblia/${l.slug}/${cap}/${m[3] ? '#v' + m[3] : ''}` };
}

async function iniciarBuscador() {
  const caja = $('#q') as HTMLInputElement; if (!caja) return;
  const out = $('#resultados')!;
  try { indice = indice || (await (await fetch(ruta('/buscar.json'))).json()); } catch { out.innerHTML = '<p>No se pudo cargar el índice de búsqueda.</p>'; return; }
  const marcar = (s: string, t: string) => { if (!t) return esc(s); const i = sinAcentos(s).indexOf(t); return i < 0 ? esc(s) : esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + t.length)) + '</mark>' + esc(s.slice(i + t.length)); };
  const pintar = () => {
    const q = caja.value.trim(); const t = sinAcentos(q);
    history.replaceState(history.state, '', q ? `?q=${encodeURIComponent(q)}` : location.pathname);
    if (t.length < 2) { out.innerHTML = '<p class="conteo">Escriba al menos 2 letras. Ejemplos: <em>pastor</em>, <em>Juan 3:16</em>, <em>Salmos 23</em>.</p>'; return; }
    const ref = parsearReferencia(q);
    const hits = indice!.items.filter((i) => sinAcentos(i.titulo + ' ' + i.texto).includes(t)).slice(0, 60);
    let html = '';
    if (ref) html += `<li><a href="${esc(ruta(ref.url))}"><span class="tipo">Ir al pasaje</span><strong>${esc(ref.titulo)} (RVR1909)</strong></a></li>`;
    html += hits.map((h) => `<li><a href="${esc(ruta(h.url))}"><span class="tipo">${esc(h.tipo)}</span><strong>${marcar(h.titulo, t)}</strong><span class="frag">${marcar(h.texto.slice(0, 160), t)}</span></a></li>`).join('');
    if (textoBiblia) {
      const vs = textoBiblia.filter((v) => sinAcentos(v[3]).includes(t));
      html += vs.slice(0, 100).map((v) => `<li><a href="${esc(ruta(`/biblia/${indice!.libros.find((l) => l.libro === v[0])!.slug}/${v[1]}/#v${v[2]}`))}"><span class="tipo">Versículo</span><strong>${esc(v[0])} ${v[1]}:${v[2]} (RVR1909)</strong><span class="frag">${marcar(v[3], t)}</span></a></li>`).join('');
      if (vs.length > 100) html += `<li class="conteo">Se muestran 100 de ${vs.length} versículos. Escriba una frase más precisa.</li>`;
    }
    out.innerHTML = html ? `<ul class="resultados">${html}</ul>` : '<div class="vacio"><h3>Sin resultados</h3><p>Pruebe otra palabra o una referencia como «Romanos 8».</p></div>';
  };
  let tmr: any; caja.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(pintar, 160); });
  $('#buscar-biblia')?.addEventListener('click', async (e) => {
    const b = e.currentTarget as HTMLButtonElement; b.disabled = true; b.textContent = 'Cargando la Biblia completa…';
    try { textoBiblia = await (await fetch(ruta('/biblia/texto.json'))).json(); b.textContent = 'Búsqueda en el texto bíblico activada ✓'; pintar(); }
    catch { b.disabled = false; b.textContent = 'Reintentar: buscar también en el texto bíblico'; }
  });
  const q0 = new URLSearchParams(location.search).get('q'); if (q0) caja.value = q0;
  pintar();
}

// ---------------- Formulario de contacto ----------------
function iniciarFormulario() {
  const f = $('#form-contacto') as HTMLFormElement; if (!f || f.dataset.listo) return; f.dataset.listo = '1';
  const inicio = Date.now(); const estado = $('#estado-form')!;
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = new FormData(f);
    if (datos.get('botcheck') || Date.now() - inicio < 3000) { estado.className = 'estado-form error'; estado.textContent = 'No se pudo enviar. Inténtelo de nuevo en unos segundos.'; return; }
    if (!datos.get('access_key')) { estado.className = 'estado-form error'; estado.textContent = 'El formulario todavía no está configurado.'; return; }
    estado.className = 'estado-form'; estado.textContent = 'Enviando…';
    try {
      const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: datos });
      const j = await r.json();
      if (j.success) { f.reset(); estado.className = 'estado-form ok'; estado.textContent = 'Gracias. Su mensaje fue enviado. Dios le bendiga.'; }
      else throw new Error(j.message);
    } catch { estado.className = 'estado-form error'; estado.textContent = 'No se pudo enviar el mensaje. Revise su conexión e inténtelo otra vez.'; }
  });
}

// ---------------- Animaciones de aparición ----------------
let obs: IntersectionObserver | null = null;
function iniciarAparicion() {
  obs?.disconnect();
  if (!('IntersectionObserver' in window)) { $$('.aparecer').forEach((e) => e.classList.add('visto')); return; }
  obs = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('visto'); obs!.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.aparecer').forEach((e) => obs!.observe(e));
}

// ---------------- Delegación global (una sola vez) ----------------
if (!(window as any).__syv) {
  (window as any).__syv = true;
  document.addEventListener('click', (e) => {
    const el = e.target as HTMLElement;
    const play = el.closest<HTMLElement>('[data-play]');
    if (play) {
      const id = play.dataset.play!;
      if (cola[actual] === id && audio().src) return alternar();
      const ids = [...new Set($$('[data-play]').map((b) => b.dataset.play!))];
      return void reproducir(id, ids);
    }
    const fav = el.closest<HTMLElement>('[data-fav]'); if (fav) return alternarFav(fav);
    const sh = el.closest<HTMLElement>('[data-compartir]'); if (sh) return void compartir(sh.dataset.titulo!, sh.dataset.compartir!, sh.dataset.texto);
    const cp = el.closest<HTMLElement>('[data-copiar]'); if (cp) return void copiar(cp.dataset.copiar!, 'Versículo copiado');
    if (el.closest('#boton-tema')) {
      const nuevo = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = nuevo; try { localStorage.setItem('syv-tema', nuevo); } catch {} return aplicarTema();
    }
    if (el.closest('#boton-menu')) { const m = $('#menu')!; const ab = m.classList.toggle('abierto'); $('#boton-menu')!.setAttribute('aria-expanded', String(ab)); return; }
    const lite = el.closest<HTMLElement>('button.lite');
    if (lite) {
      const f = document.createElement('iframe');
      const id = lite.dataset.video!, lista = lite.dataset.lista;
      f.src = lista ? `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(lista)}&autoplay=1` : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
      f.title = lite.getAttribute('aria-label') || 'Video de YouTube';
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen'; f.allowFullscreen = true;
      audio()?.pause(); // nunca dos audios a la vez
      lite.replaceWith(f); return;
    }
    const vers = el.closest<HTMLElement>('.lectura .vers');
    if (vers && !el.closest('button')) { const ya = vers.classList.contains('marcado'); $$('.vers.marcado').forEach((v) => v.classList.remove('marcado')); if (!ya) vers.classList.add('marcado'); return; }
    const flecha = el.closest<HTMLElement>('[data-carrusel]');
    if (flecha) { const c = $(flecha.dataset.carrusel!)!; c.scrollBy({ left: (+flecha.dataset.dir! || 1) * c.clientWidth * 0.85, behavior: 'smooth' }); return; }
    const letra = el.closest<HTMLElement>('[data-letra]'); if (letra) return cambiarLetra(+letra.dataset.letra!);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { $('#menu')?.classList.remove('abierto'); $('#boton-menu')?.setAttribute('aria-expanded', 'false'); }
  });
}

function alCargar() {
  aplicarTema(); iniciarReproductor(); pintarFavs(); iniciarFiltros(); iniciarBiblia(); iniciarBuscador(); iniciarFormulario(); iniciarAparicion();
  $('#menu')?.classList.remove('abierto'); $('#boton-menu')?.setAttribute('aria-expanded', 'false');
  cargarCanticos().then(sincronizarBotones);
}
document.addEventListener('astro:page-load', alCargar);
