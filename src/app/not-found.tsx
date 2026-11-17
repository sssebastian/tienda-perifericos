 import Link from 'next/link';
  
 export default function NotFound() {
   return (
     <div className="mx-auto max-w-lg px-4 py-24 text-center">
       <p className="text-6xl font-extrabold text-brand-900">404</p>
       <h1 className="mt-4 text-2xl font-bold text-slate-900">No encontramos esta página</h1>
       <p className="mt-2 text-slate-600">Puede que el enlace esté mal escrito o que el producto ya no esté disponible.</p>
       <Link href="/" className="mt-8 inline-block rounded-lg bg-brand-900 px-5 py-3 font-semibold text-white hover:bg-brand-700">
         Volver al inicio
       </Link>
     </div>
   );
 }
