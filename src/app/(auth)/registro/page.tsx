import type { Metadata } from 'next';
 import Link from 'next/link';
 import { AuthCard } from '../AuthCard';
 import { SignupForm } from './SignupForm';
  
 export const metadata: Metadata = { title: 'Crear cuenta' };
  
 export default function SignupPage() {
   return (
     <AuthCard
       title="Crea tu cuenta"
       subtitle="Guarda tus direcciones y sigue tus pedidos."
       footer={
         <>
           ¿Ya tienes cuenta?{' '}
           <Link href="/ingresar" className="font-semibold text-brand-600 hover:underline">
             Ingresa aquí
           </Link>
         </>
       }
     >
       <SignupForm />
     </AuthCard>
   );
 }
