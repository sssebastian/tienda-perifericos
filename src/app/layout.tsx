import type { Metadata } from 'next';
 import { Inter } from 'next/font/google';
 import { Header } from '@/components/layout/Header';
 import { Footer } from '@/components/layout/Footer';
 import { SITE } from '@/lib/config';
 import './globals.css';
  
 const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
  
 export const metadata: Metadata = {
   metadataBase: new URL(SITE.url),
   title: { default: `${SITE.name} · ${SITE.tagline}`, template: `%s · ${SITE.name}` },
   description:
     'Monitores, teclados, mouse, audífonos y accesorios con envío a todo el Perú. Compra segura y en soles.',
 };
  
 export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
     <html lang="es-PE" className={inter.variable}>
       <body className="flex min-h-screen flex-col font-sans">
         <Header />
         <main className="flex-1">{children}</main>
         <Footer />
       </body>
     </html>
   );
 }
