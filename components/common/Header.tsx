import Link from "next/link";
import { SignInButton } from "../auth/SignInButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ShoppingCart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export async function Header() {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('Session error:', error);
    session = null;
  }

  return (
    <header className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              FashionStore
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/products" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              All Products
            </Link>
            <Link 
              href="/products?category=men" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Men
            </Link>
            <Link 
              href="/products?category=women" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Women
            </Link>
            <Link 
              href="/products?category=kids" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Kids
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                className="w-full pl-10 bg-gray-50"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {session?.user?.role === 'admin' && (
              <Link 
                href="/admin/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Admin Panel
              </Link>
            )}
            <Link 
              href="/cart" 
              className="relative hover:text-primary transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
            <SignInButton />
          </div>
        </div>
      </div>
    </header>
  );
} 