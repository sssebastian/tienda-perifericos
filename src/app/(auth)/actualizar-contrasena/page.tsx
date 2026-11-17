import type { Metadata } from 'next';
 import { redirect } from 'next/navigation';
 import { getCurrentUser } from '@/lib/auth';
 import { AuthCard } from '../AuthCard';
 import { UpdatePasswordForm } from './UpdatePasswordForm';
  
 export const metadata: Metadata = { title: 'Nueva contraseña' };
  
 export default async function UpdatePasswordPage() {
   // Se llega aquí desde el enlace del correo, que ya inició la sesión
   const user = await getCurrentUser();
   if (!user) redirect('/ingresar?error=enlace');
  
   return (
     <AuthCard title="Crea una nueva contraseña" subtitle={`Para la cuenta ${user.email}`}>
       <UpdatePasswordForm />
     </AuthCard>
   );
 }
