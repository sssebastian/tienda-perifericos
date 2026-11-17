import Link from 'next/link';
 import { logout } from '@/app/(auth)/actions';
 import { ChevronDownIcon, UserIcon } from '@/components/ui/icons';
 import { Dropdown } from '@/components/ui/Dropdown';
  
 export function UserMenu({ name, isAdmin }: { name: string; isAdmin: boolean }) {
   const firstName = name.split(/[\s@]/)[0];
  
   return (
     <Dropdown
       label="Menú de usuario"
       summaryClassName="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
       summary={
         <>
           <UserIcon className="size-5" />
           <span className="hidden max-w-32 truncate sm:inline">Hola, {firstName}</span>
           <ChevronDownIcon />
         </>
       }
     >
       <div className="absolute right-0 top-12 w-52 rounded-xl border border-slate-200 bg-white p-2 text-sm shadow-lg">
         <Link href="/cuenta" className="block rounded-lg px-3 py-2 hover:bg-slate-100">
           Mi cuenta
         </Link>
         {isAdmin && (
           <Link href="/admin" className="block rounded-lg px-3 py-2 font-medium text-accent-600 hover:bg-slate-100">
             Panel de administración
           </Link>
         )}
         <form action={logout}>
           <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-danger-600 hover:bg-red-50">
             Cerrar sesión
           </button>
         </form>
       </div>
     </Dropdown>
   );
 }
