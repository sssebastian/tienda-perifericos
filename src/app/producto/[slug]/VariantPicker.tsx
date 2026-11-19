 'use client';
  
 import { useState } from 'react';
 import { useCart } from '@/lib/cart/store';
 import { formatPrice } from '@/lib/format';
  
 // Fila tal como viene de product_variants (la página la usa para tipar el resultado de Supabase)
 export type VariantRow = {
   id: string;
   sku: string;
   name: string;
   price: number;
   compare_at_price: number | null;
   stock: number;
   is_active: boolean;
 };
 type Variant = VariantRow;
  
 export function VariantPicker({
   product,
   variants,
 }: {
   product: { slug: string; name: string; image: string | null };
   variants: Variant[];
 }) {
   const add = useCart((s) => s.add);
   const [selected, setSelected] = useState<Variant | undefined>(variants.find((v) => v.stock > 0) ?? variants[0]);
   const [quantity, setQuantity] = useState(1);
   const [added, setAdded] = useState(false);
  
   if (!selected) return <p className="mt-6 text-danger-600">Producto no disponible.</p>;
  
   const handleAdd = () => {
     add({
       variantId: selected.id,
       slug: product.slug,
       productName: product.name,
       variantName: selected.name,
       price: Number(selected.price),
       maxStock: selected.stock,
       image: product.image,
       quantity,
     });
     setAdded(true);
     setTimeout(() => setAdded(false), 2000);
   };
  
   return (
     <div className="mt-6">
       <p className="text-3xl font-bold text-brand-900">{formatPrice(selected.price)}</p>
       {selected.compare_at_price && <p className="text-slate-400 line-through">{formatPrice(selected.compare_at_price)}</p>}
  
       {variants.length > 1 && (
         <fieldset className="mt-6">
           <legend className="text-sm font-medium text-slate-700">Elige la versión</legend>
           <div className="mt-2 flex flex-wrap gap-2">
             {variants.map((v) => (
               <button
                 key={v.id}
                 type="button"
                 disabled={v.stock === 0}
                 onClick={() => { setSelected(v); setQuantity(1); }}
                 className={`rounded-lg border px-3 py-2 text-sm disabled:opacity-40 ${
                   v.id === selected.id ? 'border-brand-900 bg-brand-50 font-semibold' : 'border-slate-300'
                 }`}
               >
                 {v.name}
               </button>
             ))}
           </div>
         </fieldset>
       )}
  
       <p className={`mt-4 text-sm ${selected.stock <= 5 ? 'text-danger-600' : 'text-emerald-700'}`}>
         {selected.stock === 0 ? 'Agotado' : selected.stock <= 5 ? `¡Quedan solo ${selected.stock}!` : 'En stock'}
       </p>
  
       <div className="mt-4 flex gap-3">
         <input
           type="number"
           min={1}
           max={selected.stock}
           value={quantity}
           onChange={(e) => setQuantity(Number(e.target.value))}
           className="w-20 rounded-lg border border-slate-300 px-3 py-2.5"
           aria-label="Cantidad"
         />
         <button
           onClick={handleAdd}
           disabled={selected.stock === 0}
           className="flex-1 rounded-lg bg-brand-900 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
         >
           {added ? '¡Agregado!' : 'Agregar al carrito'}
         </button>
       </div>
     </div>
   );
 }
