import Image from 'next/image';
 import { formatPrice } from '@/lib/format';
 import { ImageIcon } from '@/components/ui/icons';
  
 /** Fila de la vista product_cards creada en el script SQL. */
 export type ProductCardData = {
   id: string;
   name: string;
   slug: string;
   short_desc: string | null;
   brand_name: string | null;
   category_name: string;
   min_price: number;
   compare_at_price: number | null;
   total_stock: number;
   image_url: string | null;
   avg_rating: number | null;
   review_count: number;
 };
  
 export function ProductCard({ product }: { product: ProductCardData }) {
   const hasDiscount = product.compare_at_price && product.compare_at_price > product.min_price;
   const outOfStock = product.total_stock <= 0;
  
   // En la Fase 2 esta tarjeta enlazará a /producto/[slug]
   return (
     <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
       <div className="relative aspect-square bg-slate-100">
         {product.image_url ? (
           <Image src={product.image_url} alt={product.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-contain p-4" />
         ) : (
           <div className="grid h-full place-items-center text-slate-300">
             <ImageIcon className="size-14" />
           </div>
         )}
         {hasDiscount && (
           <span className="absolute left-3 top-3 rounded-full bg-danger-600 px-2.5 py-1 text-xs font-bold text-white">Oferta</span>
         )}
       </div>
  
       <div className="flex flex-1 flex-col p-4">
         <p className="text-xs font-semibold uppercase tracking-wide text-accent-600">{product.brand_name}</p>
         <h3 className="mt-1 line-clamp-2 font-semibold text-slate-900">{product.name}</h3>
         {product.short_desc && <p className="mt-1 line-clamp-1 text-sm text-slate-500">{product.short_desc}</p>}
  
         <div className="mt-auto pt-4">
           {hasDiscount && <p className="text-sm text-slate-400 line-through">{formatPrice(product.compare_at_price)}</p>}
           <p className="text-xl font-bold text-brand-900">
             {product.min_price ? `Desde ${formatPrice(product.min_price)}` : ''}
           </p>
           <p className={`mt-1 text-xs font-medium ${outOfStock ? 'text-danger-600' : 'text-emerald-700'}`}>
             {outOfStock ? 'Agotado' : 'En stock'}
           </p>
         </div>
       </div>
     </article>
   );
 }
