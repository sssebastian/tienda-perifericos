export function AuthCard({
   title,
   subtitle,
   children,
   footer,
 }: {
   title: string;
   subtitle?: string;
   children: React.ReactNode;
   footer?: React.ReactNode;
 }) {
   return (
     <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:py-16">
       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
         <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
         {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
         <div className="mt-6">{children}</div>
       </div>
       {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
     </div>
   );
 }
