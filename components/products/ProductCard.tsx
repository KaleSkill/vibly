'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/providers/CartProvider';
import { Product } from '@/types';

export function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart, items } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Check if product is in cart
  const isInCart = items.some(item => item.product._id === product._id);

  // Image carousel effect on hover
  useEffect(() => {
    if (!isHovered) {
      setCurrentImageIndex(0);
      return;
    }

    const images = product.variants[0]?.images || [];
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 1000); // Change image every 1 second

    return () => clearInterval(interval);
  }, [isHovered, product.variants]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    try {
      await addToCart(product._id, {
        color: product.variants[0].color._id,
        size: product.variants[0].sizes[0].size
      }, 1);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-0">
        <Link href={`/products/${product._id}`} className="block">
          <div 
            className="relative aspect-square overflow-hidden bg-gray-50"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              setCurrentImageIndex(0);
            }}
          >
            {product.variants[0]?.images.map((image, index) => (
              <Image
                key={image}
                src={image}
                alt={product.name}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  currentImageIndex === index ? 'opacity-100' : 'opacity-0'
                }`}
                priority={index === 0}
              />
            ))}
            
            {product.saleType ? (
              <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                SALE {product.salePriceDiscount}% OFF
              </Badge>
            ) : product.discountPercent > 0 && (
              <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                {product.discountPercent}% OFF
              </Badge>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-medium text-base line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center gap-2 mb-3">
              {product.saleType ? (
                <>
                  <span className="text-lg font-bold text-red-600">
                    {formatPrice(product.discountedSalePrice)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.salePrice)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg font-bold">
                    {formatPrice(product.discountedPrice)}
                  </span>
                  {product.discountPercent > 0 && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </>
              )}
            </div>

            {isInCart ? (
              <Button 
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                asChild
              >
                <Link href={`/products/${product._id}`}>
                  View Product
                </Link>
              </Button>
            ) : (
              <Button 
                className="w-full bg-black hover:bg-black/90"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? (
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
} 