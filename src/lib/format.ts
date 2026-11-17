 const pen = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
  
 /** 1499 → "S/ 1,499.00" */
 export function formatPrice(value: number | string | null | undefined) {
   if (value === null || value === undefined) return '';
   return pen.format(Number(value));
 }
