import type { EmailOtpType } from '@supabase/supabase-js';
 import { NextResponse, type NextRequest } from 'next/server';
 import { createClient } from '@/lib/supabase/server';
 import { safeNext } from '@/lib/config';
  
 /**
  * Destino de los enlaces de los correos (confirmar cuenta, recuperar contraseña)
  * y del inicio de sesión con Google (?code=...).
  */
 export async function GET(request: NextRequest) {
   const { searchParams, origin } = request.nextUrl;
   const tokenHash = searchParams.get('token_hash');
   const type = searchParams.get('type') as EmailOtpType | null;
   const code = searchParams.get('code');
   const next = safeNext(searchParams.get('next'), '/cuenta');
  
   const supabase = await createClient();
  
   if (tokenHash && type) {
     const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
     if (!error) return NextResponse.redirect(new URL(next, origin));
   } else if (code) {
     const { error } = await supabase.auth.exchangeCodeForSession(code);
     if (!error) return NextResponse.redirect(new URL(next, origin));
   }
  
   return NextResponse.redirect(new URL('/ingresar?error=enlace', origin));
 }
