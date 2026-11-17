import Link from 'next/link';
 import { createClient } from '@/lib/supabase/server';
 import { getCurrentProfile } from '@/lib/auth';
 import { SITE } from '@/lib/config';
 import { MenuIcon } from '@/components/ui/icons';
 import { Dropdown } from '@/components/ui/Dropdown';
 import { UserMenu } from './UserMenu';
  
 type Category = { id: string; name: string; slug: string };
  
 async function getCategories(): Promise<Category[]> {
   const supabase = await createClient();
   const { data } = await supabase
     .from('categories')
     .select('id, name, slug')
     .eq('is_active', true)
     .is('parent_id', null)
     .order('position');
   return data ?? [];
 }
  
 export async function Header() {
   const [categories, { user, profile }] = await Promise.all([getCategories(), getCurrentProfile()]);
  
   return (
     <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
       {/* Franja superior */}
       <div className="bg-brand-900 text-center text-xs text-brand-100">
         <p className="mx-auto max-w-7xl px-4 py-1.5">Envíos a todo el Perú · Paga con tarjeta o Yape</p>
       </div>
  
       <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
         {/* Menú móvil */}
         <Dropdown
           className="md:hidden"
           label="Abrir menú"
           summaryClassName="cursor-pointer rounded-lg p-2 text-slate-700 hover:bg-slate-100"
           summary={<MenuIcon />}
         >
           <nav className="absolute left-0 top-12 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
             {categories.map((c) => (
               <Link key={c.id} href={`/categoria/${c.slug}`} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100">
                 {c.name}
               </Link>
             ))}
           </nav>
         </Dropdown>
  
         {/* Logo */}
         <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-brand-900">
           <span className="grid size-8 place-items-center rounded-lg bg-accent-500 text-sm text-white">ST</span>
           {SITE.name}
         </Link>
  
         {/* Categorías (escritorio) */}
         <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Categorías">
           {categories.map((c) => (
             <Link
               key={c.id}
               href={`/categoria/${c.slug}`}
               className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-brand-900"
             >
               {c.name}
             </Link>
           ))}
         </nav>
  
         {/* Cuenta */}
         <div className="ml-auto">
           {user ? (
             <UserMenu name={profile?.full_name || user.email} isAdmin={profile?.role === 'admin'} />
           ) : (
             <div className="flex items-center gap-2">
               <Link href="/ingresar" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                 Ingresar
               </Link>
               <Link
                 href="/registro"
                 className="hidden rounded-lg bg-brand-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700 sm:block"
               >
                 Crear cuenta
               </Link>
             </div>
           )}
         </div>
       </div>
     </header>
   );
 }
