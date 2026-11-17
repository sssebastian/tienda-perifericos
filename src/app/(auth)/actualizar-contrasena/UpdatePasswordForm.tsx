 'use client';
  
 import { useActionState } from 'react';
 import { updatePassword } from '../actions';
 import { Field, FormMessage, SubmitButton, initialFormState } from '@/components/ui/form';
  
 export function UpdatePasswordForm() {
   const [state, formAction] = useActionState(updatePassword, initialFormState);
  
   return (
     <form action={formAction} className="space-y-4">
       <FormMessage state={state} />
       <Field
         label="Nueva contraseña"
         name="password"
         type="password"
         autoComplete="new-password"
         required
         minLength={8}
         hint="Mínimo 8 caracteres, con letras y números."
       />
       <Field label="Repite la nueva contraseña" name="confirm" type="password" autoComplete="new-password" required />
       <SubmitButton pendingText="Guardando…">Guardar contraseña</SubmitButton>
     </form>
   );
 }
