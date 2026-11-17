import type { NextRequest } from 'next/server';
 import { updateSession } from '@/lib/supabase/proxy';
  
 // Next.js 16: este archivo reemplaza a middleware.ts
 export async function proxy(request: NextRequest) {
   return updateSession(request);
 }
  
 export const config = {
   matcher: [
     // Todo excepto archivos estáticos e imágenes
     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
   ],
 };
