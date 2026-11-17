
 import type { NextConfig } from 'next';
  
 const nextConfig: NextConfig = {
   images: {
     // Fotos de productos guardadas en Supabase Storage
     remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
   },
 };
  
 export default nextConfig;
