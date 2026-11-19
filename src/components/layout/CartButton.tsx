'use client';
  
 import Link from 'next/link';
 import { useCart, cartCount } from '@/lib/cart/store';
 import { useHydrated } from '@/lib/cart/useHydrated';
 import { CartIcon } from '@/components/ui/icons';
  
 export function CartButton() {
   const items = useCart((s) => s.items);
   // localStorage solo existe en el navegador: esperamos a que cargue
   const mounted = useHydrated();
   const count = mounted ? cartCount(items) : 0;
  
   return (
     <Link href="/carrito" className="relative rounded-lg p-2 text-slate-700 hover:bg-slate-100" aria-label={`Carrito, ${count} productos`}>
       <CartIcon />
       {count > 0 && (
         <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-accent-500 text-xs font-bold text-white">
           {count}
         </span>
       )}
     </Link>
   );
 }
