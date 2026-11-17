import type { Metadata } from 'next';
 import Link from 'next/link';
 import { notFound } from 'next/navigation';
 import { createClient } from '@/lib/supabase/server';
 import { ProductCard, type ProductCardData } from '@/components/product/ProductCard';
  
 type Props = { params: Promise<{ slug: string }> };
  
 async function getCategory(slug: string) {
   const supabase = await createClient();
   const { data } = await supabase
     .from('categories')
     .select('id, name, slug, description')
     .eq('slug', slug)
     .eq('is_active', true)
     .maybeSingle();
   return data;
 }
  
 export async function generateMetadata({ params }: Props): Promise<Metadata> {
   const { slug } = await params;
   const category = await getCategory(slug);
   return { title: category?.name ?? 'Categoría', description: category?.description ?? undefined };
 }
  
 export default async function CategoryPage({ params }: Props) {
   const { slug } = await params;
   const category = await getCategory(slug);
   if (!category) notFound();
  
   const supabase = await createClient();
   const { data: products } = await supabase
     .from('product_cards')
     .select('*')
     .eq('category_slug', slug)
     .order('min_price');
  
   const list = (products ?? []) as ProductCardData[];
  
   return (
     <div className="mx-auto max-w-7xl px-4 py-10">
       <nav className="text-sm text-slate-500" aria-label="Ruta">
         <Link href="/" className="hover:text-brand-900">Inicio</Link> / <span className="text-slate-700">{category.name}</span>
       </nav>
       <h1 className="mt-3 text-3xl font-bold text-slate-900">{category.name}</h1>
       {category.description && <p className="mt-2 text-slate-600">{category.description}</p>}
       <p className="mt-1 text-sm text-slate-500">{list.length} productos</p>
  
       {list.length === 0 ? (
         <p className="mt-10 rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
           Aún no hay productos en esta categoría.
         </p>
       ) : (
         <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
           {list.map((p) => (
             <ProductCard key={p.id} product={p} />
           ))}
         </div>
       )}
     </div>
   );
 }
