'use client';
  
 import { useActionState } from 'react';
 import { requestPasswordReset } from '../actions';
 import { Field, FormMessage, SubmitButton, initialFormState } from '@/components/ui/form';
  
 export function ResetRequestForm() {
   const [state, formAction] = useActionState(requestPasswordReset, initialFormState);
  
   if (state.success) return <FormMessage state={state} />;
  
   return (
     <form action={formAction} className="space-y-4">
       <FormMessage state={state} />
       <Field
         label="Correo electrónico"
         name="email"
         type="email"
         autoComplete="email"
         required
         defaultValue={state.values?.email}
         placeholder="tu@correo.com"
       />
       <SubmitButton pendingText="Enviando…">Enviar enlace</SubmitButton>
     </form>
   );
 }
