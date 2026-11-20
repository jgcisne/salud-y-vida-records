import { getCollection } from 'astro:content';
export const canticosOrdenados = async () => (await getCollection('canticos')).sort((a, b) => +b.data.fecha - +a.data.fecha);
export const reflexionesOrdenadas = async () => (await getCollection('reflexiones')).sort((a, b) => +b.data.fecha - +a.data.fecha);
export const novedadesOrdenadas = async () => (await getCollection('novedades')).sort((a, b) => +b.data.fecha - +a.data.fecha);
