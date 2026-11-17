'use server';
  
 import { redirect } from 'next/navigation';
 import { revalidatePath } from 'next/cache';
 import { createClient } from '@/lib/supabase/server';
 import { SITE, safeNext } from '@/lib/config';
 import type { FormState } from '@/components/ui/form';
  
 const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
 /** Traduce los errores de Supabase Auth a mensajes claros. */
 function translateAuthError(message: string): string {
   const m = message.toLowerCase();
   if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
   if (m.includes('email not confirmed')) return 'Aún no confirmas tu correo. Revisa tu bandeja de entrada.';
   if (m.includes('already registered') || m.includes('already been registered'))
     return 'Ya existe una cuenta con este correo. Intenta ingresar.';
   if (m.includes('password should be') || m.includes('weak password'))
     return 'La contraseña es muy débil. Usa al menos 8 caracteres con letras y números.';
   if (m.includes('rate limit') || m.includes('too many'))
     return 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.';
   if (m.includes('same as the old') || m.includes('different from the old'))
     return 'La nueva contraseña debe ser distinta a la anterior.';
   return 'Ocurrió un error. Inténtalo de nuevo.';
 }
  
 function validatePassword(password: string): string | null {
   if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
   if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return 'La contraseña debe tener letras y números.';
   return null;
 }
  
 // ---------- Iniciar sesión (RF-01) ----------
 export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
   const email = String(formData.get('email') ?? '').trim().toLowerCase();
   const password = String(formData.get('password') ?? '');
   const next = safeNext(String(formData.get('next') ?? ''), '/');
  
   if (!EMAIL_RE.test(email) || !password) {
     return { error: 'Ingresa tu correo y contraseña.', values: { email } };
   }
  
   const supabase = await createClient();
   const { error } = await supabase.auth.signInWithPassword({ email, password });
   if (error) return { error: translateAuthError(error.message), values: { email } };
  
   revalidatePath('/', 'layout');
   redirect(next);
 }
  
 // ---------- Crear cuenta (RF-01) ----------
 export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
   const fullName = String(formData.get('full_name') ?? '').trim();
   const email = String(formData.get('email') ?? '').trim().toLowerCase();
   const password = String(formData.get('password') ?? '');
   const confirm = String(formData.get('confirm') ?? '');
   const values = { full_name: fullName, email };
  
   if (fullName.length < 3) return { error: 'Escribe tu nombre completo.', values };
   if (!EMAIL_RE.test(email)) return { error: 'El correo no es válido.', values };
   const pwError = validatePassword(password);
   if (pwError) return { error: pwError, values };
   if (password !== confirm) return { error: 'Las contraseñas no coinciden.', values };
  
   const supabase = await createClient();
   const { data, error } = await supabase.auth.signUp({
     email,
     password,
     options: {
       // El trigger handle_new_user() copia este nombre a la tabla profiles
       data: { full_name: fullName },
       emailRedirectTo: `${SITE.url}/auth/confirm?next=/cuenta`,
     },
   });
   if (error) return { error: translateAuthError(error.message), values };
  
   // Si la confirmación por correo está activada, todavía no hay sesión
   if (!data.session) {
     return { success: `¡Listo! Te enviamos un correo a ${email}. Ábrelo y confirma tu cuenta para ingresar.` };
   }
  
   revalidatePath('/', 'layout');
   redirect('/cuenta');
 }
  
 // ---------- Cerrar sesión ----------
 export async function logout() {
   const supabase = await createClient();
   await supabase.auth.signOut();
   revalidatePath('/', 'layout');
   redirect('/');
 }
  
 // ---------- Recuperar contraseña (RF-03) ----------
 export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
   const email = String(formData.get('email') ?? '').trim().toLowerCase();
   if (!EMAIL_RE.test(email)) return { error: 'El correo no es válido.', values: { email } };
  
   const supabase = await createClient();
   const { error } = await supabase.auth.resetPasswordForEmail(email, {
     redirectTo: `${SITE.url}/auth/confirm?next=/actualizar-contrasena`,
   });
   if (error && error.message.toLowerCase().includes('rate limit')) {
     return { error: translateAuthError(error.message), values: { email } };
   }
  
   // Mismo mensaje exista o no la cuenta (no revelamos qué correos están registrados)
   return { success: 'Si el correo está registrado, recibirás un enlace para crear una nueva contraseña.' };
 }
  
 // ---------- Nueva contraseña (RF-03) ----------
 export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
   const password = String(formData.get('password') ?? '');
   const confirm = String(formData.get('confirm') ?? '');
  
   const pwError = validatePassword(password);
   if (pwError) return { error: pwError };
   if (password !== confirm) return { error: 'Las contraseñas no coinciden.' };
  
   const supabase = await createClient();
   const { error } = await supabase.auth.updateUser({ password });
   if (error) return { error: translateAuthError(error.message) };
  
   redirect('/cuenta?mensaje=contrasena-actualizada');
 }
