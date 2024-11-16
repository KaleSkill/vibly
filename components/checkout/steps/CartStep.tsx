'use client';

import { useCart } from '@/providers/CartProvider';
import { useCheckout } from '@/providers/CheckoutProvider';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    discountedPrice: number;
    discountPercent: number;
    variants: Array<{
      color: {
        _id: string;
        name: string;
        value: string;
      };
      sizes: Array<{
        size: string;
        stock: number;
      }>;
      images: string[];
    }>;
  };
  
  quantity: number;
}

export function CartStep() {
  const { items } = useCart();
  const { setStep } = useCheckout();

  const subtotal = items.reduce((acc, item) => 
    acc + (item.product.discountedPrice * item.quantity), 0
  );

  const totalDiscount = items.reduce((acc, item) => 
    acc + ((item.product.price - item.product.discountedPrice) * item.quantity), 0
  );

  // Helper function to find variant by color ID
  const findVariantByColorId = (product: CartItem['product'], colorId: string) => {
    return product.variants.find(v => v.color._id === colorId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="space-y-6">
        {items.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-gray-50">
            <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">Add items to your cart to proceed</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</span>
            </div>
            {items.map((item) => {
              const selectedVariant = findVariantByColorId(item.product, item.variant.color);
              
              return (
                <motion.div
                  key={`${item.product._id}-${item.variant.color}-${item.variant.size}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex gap-6 p-4 border rounded-xl bg-white shadow-sm"
                >
                  <div className="relative aspect-square h-32 w-32 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={selectedVariant?.images[0] || item.product.variants[0].images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="font-medium line-clamp-2">{item.product.name}</h3>
                      <div className="mt-2 space-y-1">
                        <div className="flex flex-wrap gap-2">
                         
                          <Badge variant="secondary" className="text-xs">
                            Size: {item.variant.size}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Qty: {item.quantity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-medium">
                          {formatPrice(item.product.discountedPrice * item.quantity)}
                        </span>
                        {item.product.discountPercent > 0 && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(item.product.discountedPrice)} per item
                      </div>
                      {item.product.discountPercent > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          You save {formatPrice((item.product.price - item.product.discountedPrice) * item.quantity)} ({item.product.discountPercent}% off)
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      {items.length > 0 && (
        <div className="border rounded-xl p-6 space-y-4 bg-gray-50">
          <h3 className="font-medium">Order Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
              <span>{formatPrice(subtotal + totalDiscount)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Total Discount</span>
                <span>- {formatPrice(totalDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="border-t pt-3 mt-3 flex justify-between font-medium text-base">
              <span>Total Amount</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>

          <Button 
            className="w-full bg-black hover:bg-black/90 h-11 mt-4"
            onClick={() => setStep('address')}
          >
            Continue to Shipping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );
} 