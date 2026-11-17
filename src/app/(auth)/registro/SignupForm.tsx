 'use client';
  
 import { useActionState } from 'react';
 import { signup } from '../actions';
 import { Field, FormMessage, SubmitButton, initialFormState } from '@/components/ui/form';
  
 export function SignupForm() {
   const [state, formAction] = useActionState(signup, initialFormState);
  
   // Tras registrarse con confirmación por correo, mostramos solo el mensaje
   if (state.success) return <FormMessage state={state} />;
  
   return (
     <form action={formAction} className="space-y-4">
       <FormMessage state={state} />
       <Field
         label="Nombre completo"
         name="full_name"
         autoComplete="name"
         required
         defaultValue={state.values?.full_name}
         placeholder="Ana Torres"
       />
       <Field
         label="Correo electrónico"
         name="email"
         type="email"
         autoComplete="email"
         required
         defaultValue={state.values?.email}
         placeholder="tu@correo.com"
       />
       <Field
         label="Contraseña"
         name="password"
         type="password"
         autoComplete="new-password"
         required
         minLength={8}
         hint="Mínimo 8 caracteres, con letras y números."
       />
       <Field label="Repite la contraseña" name="confirm" type="password" autoComplete="new-password" required />
       <SubmitButton pendingText="Creando cuenta…">Crear cuenta</SubmitButton>
       <p className="text-center text-xs text-slate-500">
         Al crear tu cuenta aceptas los términos y la política de privacidad de la tienda.
       </p>
     </form>
   );
 }
