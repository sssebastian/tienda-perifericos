import { createClient } from '@/lib/supabase/server';
  
 export type Attribute = { id: string; slug: string; name: string; unit: string | null; data_type: 'text' | 'number' | 'boolean' };
 export type SearchParams = Record<string, string | undefined>;
  
 /** Atributos filtrables de la categoría y los valores que existen para cada uno. */
 export async function getFilterOptions(categoryId: string) {
   const supabase = await createClient();
   const { data: attributes } = await supabase
     .from('attributes')
     .select('id, slug, name, unit, data_type')
     .eq('category_id', categoryId)
     .eq('is_filterable', true)
     .order('position');
  
   const attrs = (attributes ?? []) as Attribute[];
   const { data: values } = await supabase
     .from('product_attributes')
     .select('attribute_id, value_text, value_number')
     .in('attribute_id', attrs.map((a) => a.id));
  
   // Valores únicos por atributo, ordenados
   const options: Record<string, string[]> = {};
   for (const a of attrs) {
     const set = new Set<string>(
       (values ?? [])
         .filter((v) => v.attribute_id === a.id)
         .map((v) => String(v.value_text ?? v.value_number ?? ''))
         .filter(Boolean),
     );
     options[a.slug] = [...set].sort((x, y) => (a.data_type === 'number' ? Number(x) - Number(y) : x.localeCompare(y)));
   }
   return { attrs, options };
 }
  
 /**
  * Devuelve los IDs de productos que cumplen TODOS los filtros de especificaciones,
  * o null si no hay filtros activos.
  * Números: "como mínimo" (ej. 144 Hz o más). Texto: igual. Booleanos: sí/no.
  */
 export async function getMatchingProductIds(attrs: Attribute[], params: SearchParams): Promise<string[] | null> {
   const supabase = await createClient();
   let ids: string[] | null = null;
  
   for (const a of attrs) {
    const value = params[a.slug];
     if (!value) continue;
     let query = supabase.from('product_attributes').select('product_id').eq('attribute_id', a.id);
     if (a.data_type === 'number') query = query.gte('value_number', Number(value));
     else if (a.data_type === 'boolean') query = query.eq('value_bool', value === 'si');
     else query = query.eq('value_text', value);
  
     const { data } = await query;
     const found = (data ?? []).map((r) => r.product_id as string);
     // Intersección: el producto debe cumplir este filtro y los anteriores
     ids = ids === null ? found : ids.filter((id) => found.includes(id));
   }
   return ids;
}



