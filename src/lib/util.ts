export const fechaES = (d: Date) => d.toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
export const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Color estable por título para portadas generadas automáticamente
export function tono(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return 200 + (h % 50); }
