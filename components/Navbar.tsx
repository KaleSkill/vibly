'use client';

// ... previous imports
import { useCart } from '@/providers/CartProvider';
import { ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { CartSheet } from './cart/CartSheet';

export function Navbar() {
  const { cartCount, isLoading } = useCart();

  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <CartSheet />
          </div>
        </div>
      </div>
    </header>
  );
} 