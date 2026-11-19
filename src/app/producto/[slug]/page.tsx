import type { Metadata } from 'next';
 import Link from 'next/link';
 import { notFound } from 'next/navigation';
 import { createClient } from '@/lib/supabase/server';
 import { VariantPicker, type VariantRow } from './VariantPicker';
  
 type Props = { params: Promise<{ slug: string }> };
  
 // Un solo SELECT trae el producto con sus tablas relacionadas (joins de Supabase)
 const PRODUCT_QUERY = `
   id, name, slug, model, description, warranty_months,
   brand:brands ( name ),
   category:categories ( name, slug ),
   variants:product_variants ( id, sku, name, price, compare_at_price, stock, is_active ),
   images:product_images ( url, alt_text, position ),
   specs:product_attributes ( value_text, value_number, value_bool, attribute:attributes ( name, unit, position ) )
 `;
  
 // Forma real que devuelve Supabase. Sin los tipos generados de la BD, TypeScript cree que
 // toda relación anidada es un array; pero brand, category y attribute son relaciones
 // "muchos a uno" (FK en la tabla actual), así que Supabase devuelve un objeto o null.
 type ProductDetail = {
   id: string;
   name: string;
   slug: string;
   model: string | null;
   description: string | null;
   warranty_months: number | null;
   brand: { name: string } | null;
   category: { name: string; slug: string } | null;
   variants: VariantRow[] | null;
   images: { url: string; alt_text: string | null; position: number }[] | null;
   specs:
     | {
         value_text: string | null;
         value_number: number | null;
         value_bool: boolean | null;
         attribute: { name: string; unit: string | null; position: number } | null;
       }[]
     | null;
 };

 async function getProduct(slug: string) {
   const supabase = await createClient();
   const { data } = await supabase.from('products').select(PRODUCT_QUERY).eq('slug', slug).eq('is_active', true).maybeSingle();
   return data as ProductDetail | null;
 }
  
 export async function generateMetadata({ params }: Props): Promise<Metadata> {
   const { slug } = await params;
   const product = await getProduct(slug);
   return { title: product?.name ?? 'Producto' };
 }
  
 export default async function ProductPage({ params }: Props) {
   const { slug } = await params;
   const product = await getProduct(slug);
   if (!product) notFound();
  
   const supabase = await createClient();
   const { data: reviews } = await supabase
     .from('reviews')
     .select('id, rating, title, comment, created_at')
     .eq('product_id', product.id)
     .eq('is_approved', true)
     .order('created_at', { ascending: false });
  
   const images = [...(product.images ?? [])].sort((a, b) => a.position - b.position);
   const specs = [...(product.specs ?? [])].sort((a, b) => (a.attribute?.position ?? 0) - (b.attribute?.position ?? 0));
   const variants = (product.variants ?? []).filter((v) => v.is_active);
  
   const showValue = (s: (typeof specs)[number]) =>
     s.value_bool !== null ? (s.value_bool ? 'Sí' : 'No') : `${s.value_text ?? s.value_number} ${s.attribute?.unit ?? ''}`.trim();
  
   return (
     <div className="mx-auto max-w-7xl px-4 py-10">
       <nav className="text-sm text-slate-500">
         <Link href="/">Inicio</Link> / <Link href={`/categoria/${product.category?.slug}`}>{product.category?.name}</Link> / {product.name}
       </nav>
  
       <div className="mt-6 grid gap-10 lg:grid-cols-2">
         {/* Galería */}
         <div className="aspect-square rounded-2xl border border-slate-200 bg-white p-6">
           {images[0] ? (
             // eslint-disable-next-line @next/next/no-img-element
             <img src={images[0].url} alt={images[0].alt_text ?? product.name} className="h-full w-full object-contain" />
           ) : (
             <div className="grid h-full place-items-center text-slate-300">Sin imagen</div>
           )}
         </div>
  
         {/* Información y compra */}
         <div>
           <p className="text-sm font-semibold uppercase text-accent-600">{product.brand?.name}</p>
           <h1 className="mt-1 text-3xl font-bold text-slate-900">{product.name}</h1>
           <p className="mt-1 text-sm text-slate-500">Modelo {product.model} · Garantía {product.warranty_months} meses</p>
           <VariantPicker
             product={{ slug: product.slug, name: product.name, image: images[0]?.url ?? null }}
             variants={variants}
           />
           <p className="mt-8 leading-relaxed text-slate-700">{product.description}</p>
         </div>
       </div>
  
       {/* Especificaciones */}
       <section className="mt-12">
         <h2 className="text-xl font-bold">Especificaciones</h2>
         <dl className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
           {specs.map((s, i) => (
             <div key={i} className="grid grid-cols-2 px-5 py-3 text-sm">
               <dt className="text-slate-500">{s.attribute?.name}</dt>
               <dd className="font-medium text-slate-900">{showValue(s)}</dd>
             </div>
           ))}
         </dl>
       </section>
  
       {/* Reseñas */}
       <section className="mt-12">
         <h2 className="text-xl font-bold">Opiniones ({reviews?.length ?? 0})</h2>
         {(reviews ?? []).map((r) => (
           <article key={r.id} className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
             <p className="text-amber-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
             {r.title && <p className="mt-1 font-semibold">{r.title}</p>}
             <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
           </article>
         ))}
       </section>
     </div>
   );
 }
