import type { Metadata } from 'next';
 import { requireUser } from '@/lib/auth';
 import { logout } from '@/app/(auth)/actions';
 import { ProfileForm } from './ProfileForm';
  
 export const metadata: Metadata = { title: 'Mi cuenta' };
  
 type Props = { searchParams: Promise<{ mensaje?: string }> };
  
 export default async function AccountPage({ searchParams }: Props) {
   const { user, profile } = await requireUser('/cuenta');
   const { mensaje } = await searchParams;
  
   return (
     <div className="mx-auto max-w-4xl px-4 py-10">
       <div className="flex flex-wrap items-center justify-between gap-4">
         <div>
           <h1 className="text-3xl font-bold text-slate-900">Mi cuenta</h1>
           <p className="mt-1 text-slate-500">Hola, {profile?.full_name ?? user.email}.</p>
         </div>
         <form action={logout}>
           <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
             Cerrar sesión
           </button>
         </form>
       </div>
  
       {mensaje === 'contrasena-actualizada' && (
         <p className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
           Tu contraseña se actualizó correctamente.
         </p>
       )}
  
       <div className="mt-8 grid gap-6 lg:grid-cols-3">
         <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
           <h2 className="text-lg font-semibold text-slate-900">Datos personales</h2>
           <p className="mb-5 mt-1 text-sm text-slate-500">Los usamos para tus pedidos y comprobantes.</p>
           <ProfileForm profile={profile} email={user.email} />
         </section>
  
         <aside className="space-y-4">
           <div className="rounded-2xl border border-slate-200 bg-white p-6">
             <h2 className="font-semibold text-slate-900">Mis pedidos</h2>
             <p className="mt-1 text-sm text-slate-500">Aquí verás tus compras y su estado (Fase 3).</p>
           </div>
           <div className="rounded-2xl border border-slate-200 bg-white p-6">
             <h2 className="font-semibold text-slate-900">Mis direcciones</h2>
             <p className="mt-1 text-sm text-slate-500">Guarda tus direcciones de entrega (Fase 3).</p>
           </div>
         </aside>
       </div>
     </div>
   );
 }
