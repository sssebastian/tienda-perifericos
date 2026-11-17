 import type { Metadata } from 'next';
 import Link from 'next/link';
 import { AuthCard } from '../AuthCard';
 import { ResetRequestForm } from './ResetRequestForm';
  
 export const metadata: Metadata = { title: 'Recuperar contraseña' };
  
 export default function ResetRequestPage() {
   return (
     <AuthCard
       title="¿Olvidaste tu contraseña?"
       subtitle="Escribe tu correo y te enviaremos un enlace para crear una nueva."
       footer={
         <Link href="/ingresar" className="font-semibold text-brand-600 hover:underline">
           Volver a ingresar
         </Link>
       }
     >
       <ResetRequestForm />
     </AuthCard>
   );
 }
