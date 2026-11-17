import Link from 'next/link';
 import { requireAdmin } from '@/lib/auth';
  
 export const metadata = { title: 'Administración', robots: { index: false } };
  
 export default async function AdminLayout({ children }: { children: React.ReactNode }) {
   // Si no eres administrador, te devuelve al inicio
   await requireAdmin();
  
   const links = [
     { href: '/admin', label: 'Resumen' },
     { href: '/admin/productos', label: 'Productos' },
     { href: '/admin/pedidos', label: 'Pedidos' },
   ];
  
   return (
     <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[220px_1fr]">
       <aside>
         <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Administración</p>
         <nav className="mt-3 space-y-1">
           {links.map((l) => (
             <Link key={l.label} href={l.href} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-white">
               {l.label}
             </Link>
           ))}
         </nav>
       </aside>
       <div>{children}</div>
     </div>
   );
 }
