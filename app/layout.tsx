import { Inter } from "next/font/google";
import { Header } from "@/components/common/Header";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { CartProvider } from "@/providers/CartProvider";
import { ProductProvider } from "@/contexts/ProductContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ProductProvider>
            <CartProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              <Toaster />
            </CartProvider>
          </ProductProvider>
        </Providers>
      </body>
    </html>
  );
}
