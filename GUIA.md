# Guía de Salud y Vida Records

**TODO SE TRATA DE JESÚS**
© Salud y Vida Records — Siervo del Señor Juan Cisneros

Esta guía explica, sin conocimientos de programación, cómo publicar el sitio y cómo agregar contenido desde un iPhone o iPad.

---

## 1. Qué contiene este proyecto

| Carpeta o archivo | Para qué sirve |
|---|---|
| `src/config/sitio.json` | **El archivo más importante.** Canal de YouTube, videos, listas, enlace de la App Store, contacto, redes, versículo destacado y dominio. |
| `src/content/canticos/` | Un archivo `.md` por cántico. |
| `src/content/reflexiones/` | Un archivo `.md` por reflexión o ensayo. |
| `src/content/novedades/` | Un archivo `.md` por noticia. |
| `public/audio/` | Sus archivos MP3. |
| `public/portadas/` | Las portadas de sus cánticos (JPG o PNG, cuadradas, 1200×1200 recomendado). |
| `src/data/biblia/rvr1909.json` | La Santa Biblia Reina-Valera 1909 completa (66 libros, 1.189 capítulos), de dominio público. No necesita tocarla. |

Todo lo marcado como **«Demostración»** o **«Ejemplo»** es contenido de prueba. Los dos audios de demostración son tonos musicales simples, no cánticos reales. Bórrelos cuando agregue los suyos.

Tecnología: Astro (sitio estático). No usa base de datos, no usa servidor permanente y no tiene cuotas mensuales.

---

## 2. Publicar el sitio desde el iPhone o iPad (sin Mac)

Todo se hace con Safari. Costo: **$0**.

### Paso 1 — Cuenta de GitHub (donde se guarda el código)
1. Abra **github.com** en Safari y cree una cuenta gratuita (o inicie sesión).
2. Toque **+** → **New repository**.
3. Nombre: `salud-y-vida-records`. Elija **Public** o **Private** (las dos opciones funcionan). **No** marque «Add a README». Toque **Create repository**.

### Paso 2 — Subir el código
Subir carpetas completas desde el iPhone a GitHub es incómodo, así que hay dos caminos:

- **Camino recomendado:** en esta conversación con Claude, conecte su cuenta de GitHub cuando se le pida y diga «sube el sitio a mi repositorio salud-y-vida-records». Claude puede subir todos los archivos por usted.
- **Camino alternativo:** desde una computadora prestada o de una biblioteca: descomprima el ZIP, abra su repositorio en github.com, toque **uploading an existing file** y arrastre todo el contenido de la carpeta.

### Paso 3 — Cloudflare Pages (donde se publica el sitio)
1. Abra **dash.cloudflare.com** y cree una cuenta gratuita.
2. Vaya a **Workers & Pages** → **Create** → pestaña **Pages** → **Connect to Git**.
3. Autorice GitHub y elija `salud-y-vida-records`.
4. Configuración de compilación:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Toque **Save and Deploy**. En uno o dos minutos tendrá una dirección como `https://salud-y-vida-records.pages.dev`.

### Paso 4 — Poner su dirección real
Abra `src/config/sitio.json` y cambie `"dominio"` por la dirección que le dio Cloudflare (o su dominio propio). Esto es necesario para que Google, el sitemap y los enlaces para compartir funcionen correctamente. El valor actual, `https://saludyvidarecords.pages.dev`, es provisional.

Desde ese momento, **cada cambio que guarde en GitHub se publica solo** en uno o dos minutos.

> Un dominio propio (por ejemplo `saludyvidarecords.com`) es opcional y cuesta alrededor de $10–15 al año. Se conecta en Cloudflare → su proyecto → **Custom domains**.

---

## 3. Cómo editar archivos desde el iPhone

1. Abra su repositorio en **github.com** con Safari.
2. Entre en la carpeta deseada, por ejemplo `src/content/canticos`.
3. Para **editar**: toque el archivo → el lápiz ✏️ → cambie el texto → **Commit changes**.
4. Para **crear**: **Add file** → **Create new file** → escriba el nombre → pegue el contenido → **Commit changes**.
5. Para **subir un MP3 o una portada**: entre en `public/audio` o `public/portadas` → **Add file** → **Upload files** → elija el archivo desde la app Archivos → **Commit changes**.

---

## 4. Agregar un cántico

Cree un archivo nuevo en `src/content/canticos/` con un nombre corto, sin espacios ni acentos. Ese nombre será la dirección de la página. Ejemplo: `el-senor-estuvo-conmigo.md` → `/musica/el-senor-estuvo-conmigo/`

Pegue esto y cambie los datos:

```markdown
---
titulo: "El Señor estuvo conmigo"
referencia: "1 Samuel 3:19"
libro: "1-samuel"
capitulo: 3
temas: ["Fidelidad de Dios", "Llamado"]
descripcion: "Un cántico sobre el Dios que acompañó al joven Samuel."
audio: "/audio/el-senor-estuvo-conmigo.mp3"
portada: "/portadas/el-senor-estuvo-conmigo.jpg"
youtube: "ABCDEFGHIJK"
fecha: 2026-11-20
duracion: "3:45"
destacado: true
---
Aquí puede escribir la letra, una meditación o notas del cántico.
```

Reglas sencillas:
- `libro` va en minúsculas, sin acentos y con guiones: `genesis`, `exodo`, `salmos`, `1-samuel`, `2-corintios`, `cantares`, `apocalipsis`. Más ejemplos: `1-reyes`, `2-cronicas`, `nehemias`, `eclesiastes`, `lamentaciones`, `abdias`, `jonas`, `sofonias`, `malaquias`, `hechos`, `galatas`, `filemon`, `1-tesalonicenses`, `1-juan`.
- Si todavía no tiene MP3, portada o video, **borre esa línea**. El sitio mostrará «Audio próximamente» y creará una portada elegante automáticamente.
- `youtube` es el identificador del video: las 11 letras después de `v=` en el enlace.
- `destacado: true` hace que el cántico aparezca en el carrusel de la portada.
- Escriba las referencias siempre con (RVR1909) en mente: el sitio añade «(RVR1909)» automáticamente.

El sistema funciona igual con 5 o con 5.000 cánticos: no hay que tocar código.

**Importante sobre el espacio:** GitHub y Cloudflare son ideales para decenas o pocos cientos de MP3. Para miles de canciones, conviene guardar los audios en un almacenamiento de archivos (por ejemplo Cloudflare R2, gratuito hasta 10 GB y de pago después) y poner en `audio:` el enlace `https://…` completo. Pregúnteme antes de activar cualquier servicio que pueda generar costos.

---

## 5. Agregar videos y listas de YouTube

En `src/config/sitio.json`, dentro de `"youtube"`:

```json
"urlCanal": "https://www.youtube.com/@SuCanalOficial",
"videos": [
  { "id": "ABCDEFGHIJK", "titulo": "Título exacto del video", "fecha": "2026-11-19", "referencia": "Salmos 23", "descripcion": "Breve descripción" }
],
"listas": [
  { "id": "PLxxxxxxxxxxxxxxxx", "titulo": "Salmos cantados", "descripcion": "Lista completa" }
]
```

Los videos más recientes van primero. Cuide las comas: cada `{ … }` lleva una coma después, excepto el último.

**¿Por qué no se cargan solos?** Mostrar automáticamente los últimos videos requiere la API de datos de YouTube (clave de Google) y una tarea programada. Esta versión usa la alternativa sin API: usted pega los identificadores. Es gratis, rápida y no puede fallar por cuotas. Si más adelante lo desea, se puede agregar la actualización automática.

---

## 6. Agregar una reflexión

Archivo nuevo en `src/content/reflexiones/`, por ejemplo `samuel-y-la-voz-de-dios.md`:

```markdown
---
titulo: "Samuel y la voz de Dios"
referencia: "1 Samuel 3:10"
libro: "1-samuel"
capitulo: 3
resumen: "Una frase que resuma la reflexión."
fecha: 2026-11-20
---
Texto de la reflexión. Use **negritas**, citas con > y subtítulos con ##.
```

Aparecerá también automáticamente al pie del capítulo bíblico correspondiente.

## 7. Agregar una novedad

Archivo nuevo en `src/content/novedades/`, por ejemplo `2026-12-01-nuevo-album.md`:

```markdown
---
titulo: "Nuevo álbum de Salmos"
fecha: 2026-12-01
---
Texto breve de la noticia.
```

---

## 8. Activar el formulario de contacto (gratis)

1. Abra **web3forms.com**, escriba el correo donde quiere recibir los mensajes y toque **Create Access Key**.
2. Le llegará una clave por correo.
3. Péguela en `src/config/sitio.json` → `"contacto"` → `"clave_web3forms"`.

El formulario incluye protección antispam (campo trampa invisible y bloqueo de envíos automáticos inmediatos) y un aviso de privacidad. Mientras no haya clave, el botón aparece desactivado con un aviso honesto.

Su correo público y su WhatsApp solo aparecen si los escribe en `correo` y `whatsapp`.

---

## 9. Activar la aplicación de iPhone

Cuando Apple apruebe su aplicación, pegue el enlace oficial de la App Store en `src/config/sitio.json` → `"app"` → `"urlAppStore"`. El aviso PRÓXIMAMENTE se cambiará solo por el botón **DESCARGAR EN APP STORE**.

---

## 10. Qué se verificó y qué falta verificar

Verificado en esta primera versión (con un navegador automatizado en computadora):
- Las 1.272 páginas se generan sin errores, con más de 46.000 enlaces internos sin enlaces rotos.
- El reproductor: Reproducir, Pausar, Anterior, Siguiente, barra de progreso, volumen y reproducción continua. Un solo elemento de audio garantiza que nunca suenen dos canciones a la vez. La música sigue sonando al cambiar de página.
- Buscador unificado (cánticos, videos, reflexiones, libros y referencias como «Juan 3:16»), filtros de la biblioteca, favoritos, modo claro y oscuro.
- Revisión automática de accesibilidad (axe, normas WCAG 2 A y AA) en 10 páginas, sin errores. Vista móvil (390 px) y de escritorio.
- El texto bíblico proviene de un archivo de dominio público de la Reina-Valera 1909 (proyecto open-bibles). Contiene 31.087 versículos; algunas ediciones digitales cuentan unos pocos más por diferencias de numeración.

Pendiente de probar en un iPhone real:
- En iPhone, Apple no permite que una página web cambie el volumen. Se usan los botones físicos del teléfono, y el control de volumen del sitio solo funciona en computadoras.
- La reproducción con la pantalla bloqueada depende de Safari. El sitio ya envía el título y los controles a la pantalla de bloqueo.
- Los envíos reales del formulario (cuando tenga su clave) y la inserción de sus videos.

---

## 11. Créditos y derechos

- Música: el texto de créditos está en `sitio.json` → `creditosMusicales`. Solo menciona hechos que usted indicó (producción con Suno mediante suscripción comercial pagada). No afirma nada sobre derechos que no esté verificado. Para dudas legales sobre la propiedad o la licencia de sus canciones, revise los términos vigentes de Suno o consulte a un abogado.
- Biblia: Santa Biblia Reina-Valera 1909, dominio público.
- Las tipografías Cinzel, Cormorant Garamond y Atkinson Hyperlegible son gratuitas (Google Fonts).

---

## 12. Para quien tenga una computadora (opcional)

```bash
npm install
npm run dev      # vista local en http://localhost:4321
npm run build    # genera la carpeta dist/ lista para publicar
```
