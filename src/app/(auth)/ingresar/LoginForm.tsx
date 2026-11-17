'use client';
  
 import Link from 'next/link';
 import { useActionState } from 'react';
 import { login } from '../actions';
 import { Field, FormMessage, SubmitButton, initialFormState } from '@/components/ui/form';
  
 export function LoginForm({ next, notice }: { next: string; notice?: string }) {
   const [state, formAction] = useActionState(login, initialFormState);
  
   return (
     <form action={formAction} className="space-y-4">
       {notice && !state.error && <FormMessage state={{ error: notice }} />}
       <FormMessage state={state} />
       <input type="hidden" name="next" value={next} />
       <Field
         label="Correo electrónico"
         name="email"
         type="email"
         autoComplete="email"
         required
         defaultValue={state.values?.email}
         placeholder="tu@correo.com"
       />
       <div>
         <Field label="Contraseña" name="password" type="password" autoComplete="current-password" required />
         <Link href="/recuperar" className="mt-2 inline-block text-sm text-brand-600 hover:underline">
           ¿Olvidaste tu contraseña?
         </Link>
       </div>
       <SubmitButton pendingText="Ingresando…">Ingresar</SubmitButton>
     </form>
   );
 }
