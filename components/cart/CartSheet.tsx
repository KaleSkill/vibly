'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Minus, X, ShoppingCartIcon, ShoppingCart,  } from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { CartItem } from '@/types';

export function CartSheet() {
  const { items, cartCount, isLoading, updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const total = items.reduce((acc, item) => 
    acc + (item.product.discountedPrice * item.quantity), 0
  );

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      setIsUpdating(itemId);
      await updateQuantity(itemId, newQuantity);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setIsRemoving(itemId);
      await removeFromCart(itemId);
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-6 w-6" />
          <AnimatePresence>
            {!isLoading && cartCount > 0 && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="absolute -top-2 -right-2"
              >
                <Badge 
                  className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground"
                >
                  {cartCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader className="space-y-2.5 pb-6 border-b">
          <SheetTitle className="flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Cart ({cartCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Your cart is empty</p>
            <p className="text-muted-foreground text-center mb-4">
              Add items to your cart to proceed with your purchase
            </p>
            <Button asChild variant="outline">
              <Link href="/products">
                Continue Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-6">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    <div className="relative aspect-square h-24 w-24 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.product.variants[0].images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium line-clamp-2">{item.product.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.variant.color} / {item.variant.size}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemoveItem(item._id)}
                          disabled={isRemoving === item._id}
                        >
                          {isRemoving === item._id ? (
                            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating === item._id}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          {isUpdating === item._id ? (
                            <div className="w-8 h-8 flex items-center justify-center">
                              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : (
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                          )}
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                            disabled={isUpdating === item._id}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-medium">
                          {formatPrice(item.product.discountedPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center justify-between text-base font-medium">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Button 
                className="w-full bg-black hover:bg-black/90 h-12 text-base"
                asChild
              >
                <Link href="/checkout">
                  Proceed to Checkout
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
} 