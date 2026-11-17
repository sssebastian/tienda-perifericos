/** Datos generales de la tienda. Cambia aquí el nombre y los textos. */
 export const SITE = {
   name: 'SuTech',
   tagline: 'Periféricos para jugar, crear y trabajar',
   url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
   email: 'ventas@sutech.pe',
   phone: '+51 999 999 999',
 };
  
 /** Evita redirecciones a otros sitios: solo rutas internas. */
 export function safeNext(next: string | null | undefined, fallback = '/') {
   if (!next || !next.startsWith('/') || next.startsWith('//')) return fallback;
   return next;
 }
