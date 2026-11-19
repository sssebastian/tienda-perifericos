'use client';
  
 import Link from 'next/link';
 import { useCart, cartTotal } from '@/lib/cart/store';
 import { useHydrated } from '@/lib/cart/useHydrated';
 import { formatPrice } from '@/lib/format';
  
 export default function CartPage() {
   const { items, setQuantity, remove } = useCart();
   // localStorage solo existe en el navegador: esperamos a que cargue
   const mounted = useHydrated();
   if (!mounted) return null;
  
   if (items.length === 0) {
     return (
       <div className="mx-auto max-w-lg px-4 py-24 text-center">
         <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
         <Link href="/" className="mt-6 inline-block rounded-lg bg-brand-900 px-5 py-3 font-semibold text-white">
           Ver productos
         </Link>
       </div>
     );
   }
  
   return (
     <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-3">
       <section className="space-y-4 lg:col-span-2">
         <h1 className="text-3xl font-bold">Carrito</h1>
         {items.map((i) => (
           <div key={i.variantId} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
             <div className="flex-1">
               <Link href={`/producto/${i.slug}`} className="font-semibold hover:underline">{i.productName}</Link>
               <p className="text-sm text-slate-500">{i.variantName}</p>
               <p className="mt-1 font-semibold text-brand-900">{formatPrice(i.price)}</p>
             </div>
             <input
               type="number"
               min={1}
               max={i.maxStock}
               value={i.quantity}
               onChange={(e) => setQuantity(i.variantId, Number(e.target.value))}
               className="w-16 rounded-lg border border-slate-300 px-2 py-1.5"
               aria-label="Cantidad"
             />
             <button onClick={() => remove(i.variantId)} className="text-sm text-danger-600 hover:underline">
               Quitar
             </button>
           </div>
         ))}
       </section>
  
       <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
         <h2 className="text-lg font-semibold">Resumen</h2>
         <div className="mt-4 flex justify-between">
           <span>Subtotal</span>
           <span className="font-semibold">{formatPrice(cartTotal(items))}</span>
         </div>
         <p className="mt-1 text-xs text-slate-500">El envío y los descuentos se calculan en el siguiente paso.</p>
         <Link href="/checkout" className="mt-6 block rounded-lg bg-brand-900 py-3 text-center font-semibold text-white hover:bg-brand-700">
           Continuar compra
         </Link>
       </aside>
     </div>
   );
 }
