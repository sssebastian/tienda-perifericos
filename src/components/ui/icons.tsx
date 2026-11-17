// Íconos SVG simples (sin dependencias externas)
 type IconProps = { className?: string };
  
 const base = {
   fill: 'none',
   stroke: 'currentColor',
   strokeWidth: 1.8,
   strokeLinecap: 'round' as const,
   strokeLinejoin: 'round' as const,
   viewBox: '0 0 24 24',
   'aria-hidden': true,
 };
  
 export const CartIcon = ({ className = 'size-6' }: IconProps) => (
   <svg {...base} className={className}>
     <circle cx="9" cy="20" r="1.4" />
     <circle cx="18" cy="20" r="1.4" />
     <path d="M2.5 3h2.6l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.9a1.5 1.5 0 0 0 1.5-1.1L21.5 8H6" />
   </svg>
 );
  
 export const UserIcon = ({ className = 'size-6' }: IconProps) => (
   <svg {...base} className={className}>
     <circle cx="12" cy="8" r="4" />
     <path d="M4 21a8 8 0 0 1 16 0" />
   </svg>
 );
  
 export const SearchIcon = ({ className = 'size-5' }: IconProps) => (
   <svg {...base} className={className}>
     <circle cx="11" cy="11" r="7" />
     <path d="m20 20-3.5-3.5" />
   </svg>
 );
  
 export const MenuIcon = ({ className = 'size-6' }: IconProps) => (
   <svg {...base} className={className}>
     <path d="M3 6h18M3 12h18M3 18h18" />
   </svg>
 );
  
 export const ChevronDownIcon = ({ className = 'size-4' }: IconProps) => (
   <svg {...base} className={className}>
     <path d="m6 9 6 6 6-6" />
   </svg>
 );
  
 export const ImageIcon = ({ className = 'size-10' }: IconProps) => (
   <svg {...base} className={className}>
     <rect x="3" y="4" width="18" height="16" rx="2" />
     <circle cx="9" cy="10" r="2" />
     <path d="m21 16-5-5-9 9" />
   </svg>
 );
  
 export const TruckIcon = ({ className = 'size-6' }: IconProps) => (
   <svg {...base} className={className}>
     <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" />
     <circle cx="7" cy="18" r="1.6" />
     <circle cx="17" cy="18" r="1.6" />
   </svg>
 );
  
 export const ShieldIcon = ({ className = 'size-6' }: IconProps) => (
   <svg {...base} className={className}>
     <path d="M12 3 4 6v6c0 5 3.4 8.3 8 9 4.6-.7 8-4 8-9V6l-8-3Z" />
     <path d="m9 12 2 2 4-4" />
   </svg>
 );
  
 export const CardIcon = ({ className = 'size-6' }: IconProps) => (
   <svg {...base} className={className}>
     <rect x="2.5" y="5" width="19" height="14" rx="2" />
     <path d="M2.5 10h19M6 15h4" />
   </svg>
 );
