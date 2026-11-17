'use client';
  
 import { useFormStatus } from 'react-dom';
  
 /** Estado que devuelven las Server Actions de los formularios. */
 export type FormState = {
   error?: string;
   success?: string;
   values?: Record<string, string>;
 };
  
 export const initialFormState: FormState = {};
  
 type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
   label: string;
   name: string;
   hint?: string;
 };
  
 export function Field({ label, name, hint, className = '', ...props }: FieldProps) {
   return (
     <div className={className}>
       <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
         {label}
       </label>
       <input
         id={name}
         name={name}
         className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
         {...props}
       />
       {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
     </div>
   );
 }
  
 export function SubmitButton({ children, pendingText }: { children: React.ReactNode; pendingText?: string }) {
   const { pending } = useFormStatus();
   return (
     <button
       type="submit"
       disabled={pending}
       className="w-full rounded-lg bg-brand-900 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
     >
       {pending ? (pendingText ?? 'Procesando…') : children}
     </button>
   );
 }
  
 export function FormMessage({ state }: { state: FormState }) {
   if (state.error) {
     return (
       <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-danger-600">
         {state.error}
       </p>
     );
   }
   if (state.success) {
     return (
       <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
         {state.success}
       </p>
     );
   }
   return null;
 }
