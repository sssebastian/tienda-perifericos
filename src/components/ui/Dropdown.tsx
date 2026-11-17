'use client';
  
 import { useEffect, useRef } from 'react';
 import { usePathname } from 'next/navigation';
  
 /**
  * Menú desplegable basado en <details>. Se cierra al cambiar de página,
  * al hacer clic fuera o al presionar Escape.
  */
 export function Dropdown({
   summary,
   summaryClassName,
   className = '',
   label,
   children,
 }: {
   summary: React.ReactNode;
   summaryClassName?: string;
   className?: string;
   label?: string;
   children: React.ReactNode;
 }) {
   const ref = useRef<HTMLDetailsElement>(null);
   const pathname = usePathname();
  
   useEffect(() => {
     if (ref.current) ref.current.open = false;
   }, [pathname]);
  
   useEffect(() => {
     const close = (e: MouseEvent | KeyboardEvent) => {
       const el = ref.current;
       if (!el?.open) return;
       if (e instanceof KeyboardEvent ? e.key === 'Escape' : !el.contains(e.target as Node)) el.open = false;
     };
     document.addEventListener('click', close);
     document.addEventListener('keydown', close);
     return () => {
       document.removeEventListener('click', close);
       document.removeEventListener('keydown', close);
     };
   }, []);
  
   return (
     <details ref={ref} className={`relative ${className}`}>
       <summary className={summaryClassName} aria-label={label}>
         {summary}
       </summary>
       {children}
     </details>
   );
 }
