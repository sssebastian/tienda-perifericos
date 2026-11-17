import type { Metadata } from 'next';
 import Link from 'next/link';
 import { safeNext } from '@/lib/config';
 import { AuthCard } from '../AuthCard';
 import { LoginForm } from './LoginForm';
  
 export const metadata: Metadata = { title: 'Ingresar' };
  
 type Props = { searchParams: Promise<{ next?: string; error?: string }> };
  
 export default async function LoginPage({ searchParams }: Props) {
   const { next, error } = await searchParams;
   const notice = error === 'enlace' ? 'El enlace no es válido o ya venció. Solicita uno nuevo.' : undefined;
  
   return (
     <AuthCard
       title="Ingresa a tu cuenta"
       subtitle="Revisa tus pedidos y compra más rápido."
       footer={
         <>
           ¿No tienes cuenta?{' '}
           <Link href="/registro" className="font-semibold text-brand-600 hover:underline">
             Créala gratis
           </Link>
         </>
       }
     >
       <LoginForm next={safeNext(next, '/')} notice={notice} />
     </AuthCard>
   );
 }
