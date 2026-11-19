'use client';
  
 import { create } from 'zustand';
 import { persist } from 'zustand/middleware';
  
 export type CartItem = {
   variantId: string;
   slug: string;
   productName: string;
   variantName: string;
   price: number;
   maxStock: number;
   image: string | null;
   quantity: number;
 };
  
 type CartState = {
   items: CartItem[];
   add: (item: CartItem) => void;
   setQuantity: (variantId: string, quantity: number) => void;
   remove: (variantId: string) => void;
   clear: () => void;
 };
  
 const MAX_PER_ITEM = 20; // igual que el CHECK de la tabla cart_items
  
 const limit = (q: number, stock: number) => Math.max(1, Math.min(q, stock, MAX_PER_ITEM));
  
 export const useCart = create<CartState>()(
   persist(
     (set) => ({
       items: [],
       add: (item) =>
         set((state) => {
           const found = state.items.find((i) => i.variantId === item.variantId);
           if (found) {
             return {
               items: state.items.map((i) =>
                 i.variantId === item.variantId ? { ...i, quantity: limit(i.quantity + item.quantity, i.maxStock) } : i,
               ),
             };
           }
           return { items: [...state.items, { ...item, quantity: limit(item.quantity, item.maxStock) }] };
         }),
       setQuantity: (variantId, quantity) =>
         set((state) => ({
           items: state.items.map((i) => (i.variantId === variantId ? { ...i, quantity: limit(quantity, i.maxStock) } : i)),
         })),
       remove: (variantId) => set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),
       clear: () => set({ items: [] }),
     }),
     { name: 'sutech-cart' }, // clave en localStorage
   ),
 );
  
 /** Total en soles (solo referencial: el precio real lo calcula create_order) */
 export const cartTotal = (items: CartItem[]) => items.reduce((sum, i) => sum + i.price * i.quantity, 0);
 export const cartCount = (items: CartItem[]) => items.reduce((sum, i) => sum + i.quantity, 0);
