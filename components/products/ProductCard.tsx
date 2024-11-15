'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Product } from '@/types/product';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const firstVariant = product.variants[0];
  const firstImage = firstVariant?.images[0];
  const firstSize = firstVariant?.sizes[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the add to cart button
    if (firstVariant && firstSize) {
      addItem({
        productId: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        quantity: 1,
        size: firstSize.size,
        color: firstVariant.colorName,
        image: firstImage,
      });
    }
  };

  return (
    <Link href={`/products/${product._id}`}>
      <Card className="group h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden">
            {firstImage && (
              <Image
                src={firstImage}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
          </div>

          {/* Sale Badge */}
          {product.discountPrice && (
            <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              Sale
            </span>
          )}

          {/* Quick Add Button - Appears on Hover */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              className="w-full bg-white/90 backdrop-blur-sm hover:bg-white text-black shadow-lg"
              onClick={handleAddToCart}
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors truncate">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              ${product.discountPrice || product.price}
            </span>
            {product.discountPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.price}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
} 