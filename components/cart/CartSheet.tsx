"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, Minus, X, ShoppingCartIcon } from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

interface ProductVariant {
  _id: string;
  color: {
    _id: string;
    name: string;
    value: string;
  };
  colorName: string;
  images: string[];
  sizes: Array<{
    size: string;
    stock: number;
  }>;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  discountedPrice: number;
  discountPercent: number;
  variants: ProductVariant[];
}

export function CartSheet() {
  const { items, cartCount, updateQuantity, removeFromCart } = useCart();
  console.log(items);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const total = items.reduce(
    (acc, item) => acc + item.product.discountedPrice * item.quantity,
    0
  );

  const getMatchingVariant = (product: Product, colorId: string) => {
    return product.variants.find((variant) => variant.color._id === colorId);
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    await updateQuantity(itemId, newQuantity);
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
          <ShoppingCartIcon className="h-6 w-6" />
          {cartCount > 0 && (
            <div className="absolute -top-2 -right-2">
              <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground">
                {cartCount}
              </Badge>
            </div>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({cartCount})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <ShoppingCartIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Your cart is empty</p>
            <Button asChild variant="outline">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-6">
              <div className="space-y-6">
                {items.map((item) => {
                  if (!item.product || !item.variant) return null;
                  const matchingVariant = getMatchingVariant(
                    item.product,
                    item.variant.color
                  );
                  if (!matchingVariant) return null;

                  return (
                    <div key={item._id} className="flex gap-4">
                      <div className="relative aspect-square h-24 w-24 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={matchingVariant.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium line-clamp-2">
                              {item.product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className="h-3 w-3 rounded-full border"
                                style={{
                                  backgroundColor: matchingVariant.color.value,
                                }}
                              />
                              <span className="text-sm text-muted-foreground">
                                {matchingVariant.colorName} /{" "}
                                {item.variant.size}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
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
                              onClick={() =>
                                handleUpdateQuantity(
                                  item._id,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item._id,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.quantity === item.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-medium">
                            {formatPrice(
                              item.product.discountedPrice * item.quantity
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between text-base font-medium">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Button
                className="w-full bg-black hover:bg-black/90 h-12 text-base"
                asChild
              >
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
