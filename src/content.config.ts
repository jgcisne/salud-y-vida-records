import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const canticos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/canticos' }),
  schema: z.object({
    titulo: z.string(),
    referencia: z.string(),              // Ej.: "Salmos 23:1-6"
    libro: z.string(),                   // slug del libro: "salmos", "juan", "1-samuel"
    capitulo: z.number().optional(),
    temas: z.array(z.string()).default([]),
    descripcion: z.string(),
    audio: z.string().optional(),        // "/audio/archivo.mp3" o enlace https autorizado
    youtube: z.string().optional(),      // ID de 11 caracteres del video
    portada: z.string().optional(),      // "/portadas/archivo.jpg"
    fecha: z.coerce.date(),
    duracion: z.string().optional(),     // "3:45"
    destacado: z.boolean().default(false),
    demo: z.boolean().default(false),
  }),
});

const reflexiones = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reflexiones' }),
  schema: z.object({
    titulo: z.string(),
    referencia: z.string(),
    libro: z.string(),
    capitulo: z.number().optional(),
    resumen: z.string(),
    fecha: z.coerce.date(),
    demo: z.boolean().default(false),
  }),
});

const novedades = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/novedades' }),
  schema: z.object({
    titulo: z.string(),
    fecha: z.coerce.date(),
    enlace: z.string().optional(),
    demo: z.boolean().default(false),
  }),
});

export const collections = { canticos, reflexiones, novedades };
