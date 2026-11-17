import { createServerClient } from '@supabase/ssr';
 import { NextResponse, type NextRequest } from 'next/server';
  
 /** Rutas que exigen haber iniciado sesión. */
 const PROTECTED_PREFIXES = ['/cuenta', '/admin'];
 /** Rutas que no tienen sentido si ya iniciaste sesión. */
 const GUEST_ONLY = ['/ingresar', '/registro'];
  
 /**
  * Refresca la sesión de Supabase en cada petición y protege rutas.
  * Se llama desde src/proxy.ts (Next.js 16).
  */
 export async function updateSession(request: NextRequest) {
   let supabaseResponse = NextResponse.next({ request });
  
   const supabase = createServerClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
     {
       cookies: {
         getAll() {
           return request.cookies.getAll();
         },
         setAll(cookiesToSet, headers?: Record<string, string>) {
           cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
           supabaseResponse = NextResponse.next({ request });
           cookiesToSet.forEach(({ name, value, options }) =>
             supabaseResponse.cookies.set(name, value, options),
           );
           // Cabeceras anti-caché que envía Supabase al refrescar la sesión
           if (headers) {
             Object.entries(headers).forEach(([key, val]) => supabaseResponse.headers.set(key, val));
           }
         },
       },
     },
   );
  
   // IMPORTANTE: no pongas código entre createServerClient y getClaims().
   const { data } = await supabase.auth.getClaims();
   const isLoggedIn = Boolean(data?.claims);
  
   const { pathname } = request.nextUrl;
  
   const redirectTo = (path: string, next?: string) => {
     const url = request.nextUrl.clone();
     url.pathname = path;
     url.search = '';
     if (next) url.searchParams.set('next', next);
     const response = NextResponse.redirect(url);
     // Conserva las cookies de sesión recién refrescadas
     supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
     return response;
   };
  
   if (!isLoggedIn && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
     return redirectTo('/ingresar', pathname);
   }
  
   if (isLoggedIn && GUEST_ONLY.some((p) => pathname.startsWith(p))) {
     return redirectTo('/cuenta');
   }
  
   return supabaseResponse;
 }
