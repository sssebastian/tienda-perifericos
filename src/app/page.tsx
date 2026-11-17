import Link from 'next/link';
 import { createClient } from '@/lib/supabase/server';
 import { ProductCard, type ProductCardData } from '@/components/product/ProductCard';
 import { CardIcon, ShieldIcon, TruckIcon } from '@/components/ui/icons';
  
 export default async function HomePage() {
   const supabase = await createClient();
  
   const [{ data: categories, error }, { data: featured }] = await Promise.all([
     supabase.from('categories').select('id, name, slug, description').eq('is_active', true).order('position'),
     supabase.from('product_cards').select('*').eq('is_featured', true).limit(8),
   ]);
  
   return (
     <>
       {/* Portada */}
       <section className="bg-linear-to-br from-brand-900 to-brand-700 text-white">
         <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
           <p className="text-sm font-semibold uppercase tracking-widest text-accent-500">Nueva temporada</p>
           <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
             Equipa tu setup con los mejores periféricos
           </h1>
           <p className="mt-4 max-w-xl text-lg text-brand-100">
             Monitores, teclados mecánicos, mouse y audífonos de marcas originales, con garantía y envío a todo el Perú.
           </p>
           <div className="mt-8 flex flex-wrap gap-3">
             <Link href="/categoria/monitores" className="rounded-lg bg-accent-500 px-5 py-3 font-semibold hover:bg-accent-600">
               Ver monitores
             </Link>
             <Link href="/categoria/teclados" className="rounded-lg bg-white/10 px-5 py-3 font-semibold ring-1 ring-white/30 hover:bg-white/20">
               Ver teclados
             </Link>
           </div>
         </div>
       </section>
  
       {/* Beneficios */}
       <section className="border-b border-slate-200 bg-white">
         <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:grid-cols-3">
           {[
             { icon: <TruckIcon />, title: 'Envío a todo el Perú', text: 'Delivery en Lima en 1 a 2 días' },
             { icon: <ShieldIcon />, title: 'Garantía oficial', text: 'Productos originales de 12 a 24 meses' },
             { icon: <CardIcon />, title: 'Pago seguro', text: 'Tarjeta, Yape y más medios' },
           ].map((b) => (
             <div key={b.title} className="flex items-center gap-3">
               <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-900">{b.icon}</span>
               <div>
                 <p className="font-semibold text-slate-900">{b.title}</p>
                 <p className="text-sm text-slate-500">{b.text}</p>
               </div>
             </div>
           ))}
         </div>
       </section>
  
       <div className="mx-auto max-w-7xl px-4">
         {error && (
           <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
             No se pudo conectar con la base de datos. Revisa las variables de tu archivo .env.local y que hayas ejecutado
             el script SQL en Supabase.
           </p>
         )}
  
         {/* Categorías */}
         <section className="mt-12">
           <h2 className="text-2xl font-bold text-slate-900">Compra por categoría</h2>
           <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
             {(categories ?? []).map((c) => (
               <Link
                 key={c.id}
                 href={`/categoria/${c.slug}`}
                 className="rounded-2xl border border-slate-200 bg-white p-5 text-center transition hover:border-brand-600 hover:shadow-md"
               >
                 <p className="font-semibold text-slate-900">{c.name}</p>
                 <p className="mt-1 line-clamp-2 text-xs text-slate-500">{c.description}</p>
               </Link>
             ))}
           </div>
         </section>
  
         {/* Destacados */}
         <section className="mt-14">
           <h2 className="text-2xl font-bold text-slate-900">Productos destacados</h2>
           <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
             {((featured ?? []) as ProductCardData[]).map((p) => (
               <ProductCard key={p.id} product={p} />
             ))}
           </div>
         </section>
       </div>
     </>
   );
 }
