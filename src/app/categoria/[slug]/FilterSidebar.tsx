import type { Attribute, SearchParams } from './filters';
  
 /** Formulario GET: los filtros viajan en la URL (?marca=logitech&refresh-rate=144) */
 export function FilterSidebar({
   slug,
   attrs,
   options,
   brands,
   params,
 }: {
   slug: string;
   attrs: Attribute[];
   options: Record<string, string[]>;
   brands: { slug: string; name: string }[];
   params: SearchParams;
 }) {
   const selectClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm';
  
   return (
     <form action={`/categoria/${slug}`} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
       <h2 className="font-semibold">Filtrar</h2>
  
       <label className="block text-sm">
         Marca
         <select name="marca" defaultValue={params.marca ?? ''} className={selectClass}>
           <option value="">Todas</option>
           {brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
         </select>
       </label>
  
       <div className="grid grid-cols-2 gap-2 text-sm">
         <label>Precio mín.<input name="min" type="number" defaultValue={params.min} className={selectClass} /></label>
         <label>Precio máx.<input name="max" type="number" defaultValue={params.max} className={selectClass} /></label>
       </div>
  
       {attrs.map((a) => (
         <label key={a.id} className="block text-sm">
           {a.name} {a.data_type === 'number' && `(mínimo${a.unit ? `, ${a.unit}` : ''})`}
           <select name={a.slug} defaultValue={params[a.slug] ?? ''} className={selectClass}>
             <option value="">Cualquiera</option>
             {a.data_type === 'boolean' ? (
               <>
                 <option value="si">Sí</option>
                 <option value="no">No</option>
               </>
             ) : (
               options[a.slug]?.map((o) => <option key={o} value={o}>{o} {a.data_type === 'number' ? a.unit : ''}</option>)
             )}
           </select>
         </label>
       ))}
  
       <div className="flex gap-2">
         <button className="flex-1 rounded-lg bg-brand-900 py-2 text-sm font-semibold text-white">Aplicar</button>
         <a href={`/categoria/${slug}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Limpiar</a>
       </div>
     </form>
   );
 }
