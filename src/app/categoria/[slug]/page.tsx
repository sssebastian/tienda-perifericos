 import type { Metadata } from 'next';
 import { notFound } from 'next/navigation';
 import { createClient } from '@/lib/supabase/server';
 import { ProductCard, type ProductCardData } from '@/components/product/ProductCard';
 import { FilterSidebar } from './FilterSidebar';
 import { getFilterOptions, getMatchingProductIds, type SearchParams } from './filters';
  
 type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> };
  
 export async function generateMetadata({ params }: Props): Promise<Metadata> {
   const { slug } = await params;
   return { title: slug.charAt(0).toUpperCase() + slug.slice(1) };
 }
  
 export default async function CategoryPage({ params, searchParams }: Props) {
   const { slug } = await params;
   const sp = await searchParams;
   const supabase = await createClient();
  
   const { data: category } = await supabase.from('categories').select('id, name, description').eq('slug', slug).maybeSingle();
   if (!category) notFound();
  
   const [{ attrs, options }, { data: brands }] = await Promise.all([
     getFilterOptions(category.id),
     supabase.from('brands').select('slug, name').order('name'),
   ]);
  
   // 1) Filtros de especificaciones → IDs de productos
   const ids = await getMatchingProductIds(attrs, sp);
  
   // 2) Filtros simples directamente sobre la vista product_cards
   let query = supabase.from('product_cards').select('*').eq('category_slug', slug);
   if (sp.marca) query = query.eq('brand_slug', sp.marca);
   if (sp.min) query = query.gte('min_price', Number(sp.min));
   if (sp.max) query = query.lte('min_price', Number(sp.max));
   if (ids !== null) query = query.in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
  
   const orden = sp.orden ?? 'precio-asc';
   query =
     orden === 'precio-desc' ? query.order('min_price', { ascending: false })
     : orden === 'nuevos' ? query.order('created_at', { ascending: false })
     : query.order('min_price');
  
   const { data: products } = await query;
   const list = (products ?? []) as ProductCardData[];
  
   return (
     <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[260px_1fr]">
       <FilterSidebar slug={slug} attrs={attrs} options={options} brands={brands ?? []} params={sp} />
       <div>
         <h1 className="text-3xl font-bold">{category.name}</h1>
         <p className="mt-1 text-sm text-slate-500">{list.length} productos</p>
         <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-3">
           {list.map((p) => <ProductCard key={p.id} product={p} />)}
         </div>
         {list.length === 0 && <p className="mt-10 text-center text-slate-500">Ningún producto cumple estos filtros.</p>}
       </div>
     </div>
   );
 }
