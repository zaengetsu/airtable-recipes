'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePathname } from 'next/navigation';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeaderFooter = pathname?.startsWith('/login') || pathname?.startsWith('/register');

  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <title>AirCook - Recettes et Assistant Nutritionnel</title>
        <meta name="description" content="Découvrez des recettes délicieuses et analysez leur valeur nutritionnelle avec l'assistant AirCook" />
        <link rel="icon" href="/aircooklogo.png" />
        <link rel="apple-touch-icon" href="/aircooklogo.png" />
      </head>
      <body className={`${inter.className} text-gray-900 antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          {!hideHeaderFooter && <Header />}
          <main className="flex-1">
            {children}
          </main>
          {!hideHeaderFooter && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}
