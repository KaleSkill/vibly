'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Tag, Box, Users, Bookmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProductViewProps {
  productId: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPercent: number;
  discountedPrice: number;
  gender: string;
  category: {
    _id: string;
    name: string;
  };
  status: 'active' | 'inactive';
  specifications: Record<string, string>;
  variants: Array<{
    colorName: string;
    images: string[];
    sizes: Array<{
      size: string;
      stock: number;
    }>;
  }>;
}

export function ProductView({ productId }: ProductViewProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${productId}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch product details",
          variant: "destructive",
        });
        router.push('/admin/products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router, toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Badge 
            variant={product.status === 'active' ? "default" : "secondary"}
            className={product.status === 'active' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
          >
            {product.status === 'active' ? 'Active' : 'Archived'}
          </Badge>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="mt-2 text-muted-foreground">{product.description}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Card className="flex-1">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>Category</span>
                </div>
                <p className="mt-1 font-medium">{product.category.name}</p>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Gender</span>
                </div>
                <p className="mt-1 font-medium capitalize">{product.gender}</p>
              </CardContent>
            </Card>
          </div>

          {/* Price Details */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Box className="h-4 w-4" />
                <span>Pricing Details</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Original Price</span>
                  <span className="font-medium">{formatPrice(product.price)}</span>
                </div>
                {product.discountPercent > 0 && (
                  <>
                    <div className="flex justify-between items-center text-red-600">
                      <span>Discount</span>
                      <span>-{product.discountPercent}%</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t text-green-600">
                      <span className="font-medium">Final Price</span>
                      <span className="text-lg font-bold">{formatPrice(product.discountedPrice)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          {Object.keys(product.specifications).length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Bookmark className="h-4 w-4" />
                  <span>Specifications</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    value && (
                      <div key={key}>
                        <span className="text-sm text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <p className="font-medium">{value}</p>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Variants */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Product Variants</h2>
          <div className="space-y-6">
            {product.variants.map((variant, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4">{variant.colorName}</h3>
                  
                  {/* Variant Images */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {variant.images.map((image, imgIdx) => (
                      <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`${product.name} - ${variant.colorName}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Sizes and Stock */}
                  <div className="flex flex-wrap gap-2">
                    {variant.sizes.map((size, sizeIdx) => (
                      <div
                        key={sizeIdx}
                        className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium"
                      >
                        <span className="text-muted-foreground">Size:</span> {size.size}
                        <span className="mx-2">•</span>
                        <span className="text-muted-foreground">Stock:</span> {size.stock}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 