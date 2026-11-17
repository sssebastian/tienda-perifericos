import { createClient } from '@/lib/supabase/server';
  
 export default async function AdminHomePage() {
   const supabase = await createClient();
  
   // count: 'exact' + head: true cuenta filas sin traerlas
   const [products, orders, customers, lowStock] = await Promise.all([
     supabase.from('products').select('*', { count: 'exact', head: true }),
     supabase.from('orders').select('*', { count: 'exact', head: true }),
     supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
     supabase.from('low_stock_variants').select('sku, product_name, variant_name, stock').limit(10),
   ]);
  
   const stats = [
     { label: 'Productos', value: products.count ?? 0 },
     { label: 'Pedidos', value: orders.count ?? 0 },
     { label: 'Clientes', value: customers.count ?? 0 },
     { label: 'Con stock bajo', value: lowStock.data?.length ?? 0 },
   ];
  
   return (
     <div>
       <h1 className="text-3xl font-bold text-slate-900">Resumen</h1>
       <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
         {stats.map((s) => (
           <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
             <p className="text-sm text-slate-500">{s.label}</p>
             <p className="mt-1 text-3xl font-bold text-brand-900">{s.value}</p>
           </div>
         ))}
       </div>
  
       <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
         <h2 className="text-lg font-semibold text-slate-900">Stock bajo</h2>
         {lowStock.data && lowStock.data.length > 0 ? (
           <table className="mt-4 w-full text-left text-sm">
             <thead className="text-slate-500">
               <tr>
                 <th className="py-2">SKU</th>
                 <th>Producto</th>
                 <th>Versión</th>
                 <th className="text-right">Stock</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {lowStock.data.map((v) => (
                 <tr key={v.sku}>
                   <td className="py-2 font-mono text-xs">{v.sku}</td>
                   <td>{v.product_name}</td>
                   <td>{v.variant_name}</td>
                   <td className="text-right font-semibold text-danger-600">{v.stock}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         ) : (
           <p className="mt-2 text-sm text-slate-500">Todo el stock está en orden.</p>
         )}
       </section>
     </div>
   );
 }
