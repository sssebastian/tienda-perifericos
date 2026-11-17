import { redirect } from 'next/navigation';
 import { createClient } from '@/lib/supabase/server';
  
 export type Profile = {
   id: string;
   full_name: string | null;
   phone: string | null;
   document_number: string | null;
   role: 'customer' | 'admin';
 };
  
 /** Devuelve el usuario verificado (o null). Usa getClaims, que valida el token. */
 export async function getCurrentUser() {
   const supabase = await createClient();
   const { data } = await supabase.auth.getClaims();
   if (!data?.claims) return null;
   return { id: data.claims.sub as string, email: (data.claims.email as string) ?? '' };
 }
  
 /** Usuario + su fila en la tabla profiles. */
 export async function getCurrentProfile() {
   const user = await getCurrentUser();
   if (!user) return { user: null, profile: null };
  
   const supabase = await createClient();
   const { data: profile } = await supabase
     .from('profiles')
     .select('id, full_name, phone, document_number, role')
     .eq('id', user.id)
     .single<Profile>();
  
   return { user, profile };
 }
  
 /** Para páginas que exigen sesión. */
 export async function requireUser(next = '/cuenta') {
   const result = await getCurrentProfile();
   if (!result.user) redirect(`/ingresar?next=${encodeURIComponent(next)}`);
   return result as { user: NonNullable<typeof result.user>; profile: Profile | null };
 }
  
 /** Para el panel de administración. */
 export async function requireAdmin() {
   const result = await requireUser('/admin');
   if (result.profile?.role !== 'admin') redirect('/');
   return result;
 }
