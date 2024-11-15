'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';

interface Product {
  _id: string;
  name: string;
  price: number;
  discountedPrice: number;
  discountPercent: number;
  status: 'active' | 'inactive';
  variants: Array<{
    images: string[];
  }>;
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        const activeProducts = data
          .filter((product: Product) => product.status === 'active')
          .slice(0, 8);
        setProducts(activeProducts);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Image carousel effect
  useEffect(() => {
    if (!hoveredProduct) return;

    const product = products.find(p => p._id === hoveredProduct);
    if (!product) return;

    const imageCount = product.variants[0]?.images.length || 0;
    if (imageCount <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => ({
        ...prev,
        [hoveredProduct]: ((prev[hoveredProduct] || 0) + 1) % imageCount
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [hoveredProduct, products]);

  const handleImageChange = (productId: string) => {
    setHoveredProduct(productId);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
          <p className="text-muted-foreground mt-1">
            Shop our latest collection
          </p>
        </div>
        <Link 
          href="/products" 
          className="group flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View All 
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
          />
        ))}
      </div>

      <div className="mt-8 text-center md:hidden">
        <Button asChild variant="outline">
          <Link href="/products">
            View All Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
} 