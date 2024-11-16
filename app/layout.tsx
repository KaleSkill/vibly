import { Inter } from 'next/font/google';
import { Header } from '@/components/common/Header';
import { Providers } from '@/components/Providers';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { CartProvider } from '@/providers/CartProvider';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <CartProvider>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <Toaster />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
