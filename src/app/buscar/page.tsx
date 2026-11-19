import type { Metadata } from 'next';
 import { createClient } from '@/lib/supabase/server';
 import { ProductCard, type ProductCardData } from '@/components/product/ProductCard';
  
 export const metadata: Metadata = { title: 'Buscar' };
  
 type Props = { searchParams: Promise<{ q?: string }> };
  
 export default async function SearchPage({ searchParams }: Props) {
   const { q = '' } = await searchParams;
   const term = q.trim();
   let list: ProductCardData[] = [];
  
   if (term.length >= 2) {
     const supabase = await createClient();
     // 1) La función SQL search_products busca sin importar tildes y ordena por relevancia
     const { data: found } = await supabase.rpc('search_products', { q: term });
     const ids = (found ?? []).map((p: { id: string }) => p.id);
     // 2) Traemos las tarjetas (precio, stock, imagen) de esos productos
     if (ids.length) {
       const { data } = await supabase.from('product_cards').select('*').in('id', ids);
       list = ((data ?? []) as ProductCardData[]).sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
     }
   }
  
   return (
     <div className="mx-auto max-w-7xl px-4 py-10">
       <h1 className="text-2xl font-bold">{term ? `Resultados para “${term}”` : 'Buscar productos'}</h1>
       <p className="mt-1 text-sm text-slate-500">{list.length} productos encontrados</p>
       <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
         {list.map((p) => <ProductCard key={p.id} product={p} />)}
       </div>
     </div>
   );
 }
