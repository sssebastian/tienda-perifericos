'use server';
  
 import { revalidatePath } from 'next/cache';
 import { createClient } from '@/lib/supabase/server';
 import { getCurrentUser } from '@/lib/auth';
 import type { FormState } from '@/components/ui/form';
  
 // ---------- Editar perfil (RF-04) ----------
 export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
   const user = await getCurrentUser();
   if (!user) return { error: 'Tu sesión expiró. Vuelve a ingresar.' };
  
   const fullName = String(formData.get('full_name') ?? '').trim();
   const phone = String(formData.get('phone') ?? '').replace(/\s+/g, '');
   const documentNumber = String(formData.get('document_number') ?? '').trim();
   const values = { full_name: fullName, phone, document_number: documentNumber };
  
   if (fullName.length < 3) return { error: 'Escribe tu nombre completo.', values };
   if (phone && !/^\+?\d{9,12}$/.test(phone)) return { error: 'El teléfono debe tener 9 dígitos (ej. 987654321).', values };
   if (documentNumber && !/^(\d{8}|\d{11})$/.test(documentNumber))
     return { error: 'El documento debe ser un DNI de 8 dígitos o un RUC de 11.', values };
  
   const supabase = await createClient();
   // RLS garantiza que solo puedas editar tu propio perfil
   const { error } = await supabase
     .from('profiles')
     .update({ full_name: fullName, phone: phone || null, document_number: documentNumber || null })
     .eq('id', user.id);
  
   if (error) return { error: 'No pudimos guardar tus datos. Inténtalo de nuevo.', values };
  
   revalidatePath('/', 'layout');
   return { success: 'Tus datos se guardaron correctamente.', values };
 }
