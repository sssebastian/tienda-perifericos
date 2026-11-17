import Link from 'next/link';
 import { SITE } from '@/lib/config';
  
 export function Footer() {
   const year = new Date().getFullYear();
   return (
     <footer className="mt-16 border-t border-slate-200 bg-white">
       <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
         <div>
           <p className="text-lg font-extrabold text-brand-900">{SITE.name}</p>
           <p className="mt-2 text-sm text-slate-500">{SITE.tagline}.</p>
         </div>
         <div>
           <p className="text-sm font-semibold text-slate-900">Tienda</p>
           <ul className="mt-3 space-y-2 text-sm text-slate-600">
             <li><Link href="/categoria/monitores" className="hover:text-brand-900">Monitores</Link></li>
             <li><Link href="/categoria/teclados" className="hover:text-brand-900">Teclados</Link></li>
             <li><Link href="/categoria/mouse" className="hover:text-brand-900">Mouse</Link></li>
           </ul>
         </div>
         <div>
           <p className="text-sm font-semibold text-slate-900">Mi cuenta</p>
           <ul className="mt-3 space-y-2 text-sm text-slate-600">
             <li><Link href="/cuenta" className="hover:text-brand-900">Mis datos</Link></li>
             <li><Link href="/ingresar" className="hover:text-brand-900">Ingresar</Link></li>
             <li><Link href="/registro" className="hover:text-brand-900">Crear cuenta</Link></li>
           </ul>
         </div>
         <div>
           <p className="text-sm font-semibold text-slate-900">Contacto</p>
           <ul className="mt-3 space-y-2 text-sm text-slate-600">
             <li>{SITE.email}</li>
             <li>{SITE.phone}</li>
             <li>Lima, Perú</li>
           </ul>
         </div>
       </div>
       <p className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
         © {year} {SITE.name}. Todos los precios incluyen IGV.
       </p>
     </footer>
   );
 }
