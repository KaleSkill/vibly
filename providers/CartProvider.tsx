'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    discountedPrice: number;
    variants: any[];
  };
  variant: {
    color: string;
    size: string;
  };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (productId: string, variantData: any, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, newQuantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user) {
      fetchCart();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: string, variantData: any, quantity: number) => {
    try {
      if (!session?.user) {
        toast({
          title: "Error",
          description: "Please sign in to add items to cart",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          variantData,
          quantity,
        }),
      });

      if (!response.ok) throw new Error('Failed to add to cart');

      const data = await response.json();
      setItems(data.items);

      toast({
        title: "Success",
        description: "Item added to cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) throw new Error('Failed to update quantity');

      const updatedCart = await response.json();
      setItems(updatedCart.items);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove item');

      const updatedCart = await response.json();
      setItems(updatedCart.items);

      toast({
        title: "Success",
        description: "Item removed from cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to clear cart');

      setItems([]);
      toast({
        title: "Success",
        description: "Cart cleared successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartCount: items.reduce((total, item) => total + item.quantity, 0),
      isLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 