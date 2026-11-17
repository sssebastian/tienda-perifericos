 'use client';
  
 import { useActionState } from 'react';
 import { updateProfile } from './actions';
 import { Field, FormMessage, SubmitButton, initialFormState } from '@/components/ui/form';
 import type { Profile } from '@/lib/auth';
  
 export function ProfileForm({ profile, email }: { profile: Profile | null; email: string }) {
   const [state, formAction] = useActionState(updateProfile, initialFormState);
   const v = state.values ?? {
     full_name: profile?.full_name ?? '',
     phone: profile?.phone ?? '',
     document_number: profile?.document_number ?? '',
   };
  
   return (
     <form action={formAction} className="space-y-4">
       <FormMessage state={state} />
       <Field label="Correo electrónico" name="email" value={email} disabled readOnly hint="El correo no se puede cambiar." />
       <Field label="Nombre completo" name="full_name" required defaultValue={v.full_name} autoComplete="name" />
       <div className="grid gap-4 sm:grid-cols-2">
         <Field label="Teléfono" name="phone" type="tel" defaultValue={v.phone} placeholder="987654321" autoComplete="tel" />
         <Field
           label="DNI o RUC (opcional)"
           name="document_number"
           inputMode="numeric"
           defaultValue={v.document_number}
           placeholder="12345678"
         />
       </div>
       <div className="sm:w-48">
         <SubmitButton pendingText="Guardando…">Guardar cambios</SubmitButton>
       </div>
     </form>
   );
 }
