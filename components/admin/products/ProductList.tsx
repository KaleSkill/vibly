'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPercent: number;
  discountedPrice: number;
  status: 'active' | 'inactive' | 'draft';
  gender: string;
  specifications: {
    material?: string;
    fit?: string;
    occasion?: string;
    pattern?: string;
    washCare?: string;
    style?: string;
    neckType?: string;
    sleeveType?: string;
  };
  variants: Array<{
    colorName: string;
    images: string[];
    sizes: Array<{
      size: string;
      stock: number;
    }>;
  }>;
}

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      // Refresh the list
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell>
                {product.variants[0]?.images[0] && (
                  <div className="relative h-16 w-16">
                    <Image
                      src={product.variants[0].images[0]}
                      alt={product.name}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                {product.discountPercent > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-medium">
                      {formatPrice(product.discountedPrice)}
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="font-medium">{formatPrice(product.price)}</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={product.status === 'active' ? "default" : "secondary"}
                  className={cn(
                    "font-medium",
                    product.status === 'active' && "bg-green-100 text-green-800",
                    product.status === 'inactive' && "bg-gray-100 text-gray-800",
                    product.status === 'draft' && "bg-yellow-100 text-yellow-800"
                  )}
                >
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsViewModalOpen(true);
                    }}
                    className="hover:text-blue-600 hover:border-blue-600"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="hover:text-green-600 hover:border-green-600"
                  >
                    <Link href={`/admin/products/edit/${product._id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product._id)}
                    className="hover:text-red-600 hover:border-red-600"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Product Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              {/* Basic Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Original Price:</span>
                      <span className="font-medium">{formatPrice(selectedProduct.price)}</span>
                    </div>
                    {selectedProduct.discountPercent > 0 && (
                      <>
                        <div className="flex justify-between items-center text-red-600">
                          <span className="text-sm">Discount:</span>
                          <span>-{selectedProduct.discountPercent}%</span>
                        </div>
                        <div className="flex justify-between items-center text-green-600 pt-1 border-t">
                          <span>Final Price:</span>
                          <span className="font-bold">{formatPrice(selectedProduct.discountedPrice)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="pt-2">
                    <Badge className="capitalize">{selectedProduct.gender}</Badge>
                    <Badge variant={selectedProduct.status === 'active' ? 'default' : 'secondary'} className="ml-2 capitalize">
                      {selectedProduct.status}
                    </Badge>
                  </div>
                </div>

                {/* Specifications */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Specifications</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                      value && (
                        <div key={key}>
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <p className="font-medium">{value}</p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-4">
                <h4 className="font-medium">Variants</h4>
                <div className="grid gap-4">
                  {selectedProduct.variants.map((variant, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">{variant.colorName}</h5>
                      </div>
                      {/* Images */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {variant.images.map((image, imgIdx) => (
                          <div key={imgIdx} className="relative aspect-square rounded-md overflow-hidden">
                            <Image
                              src={image}
                              alt={`${selectedProduct.name} ${variant.colorName} ${imgIdx + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      {/* Sizes */}
                      <div className="flex flex-wrap gap-2">
                        {variant.sizes.map((size, sizeIdx) => (
                          <div
                            key={sizeIdx}
                            className="px-3 py-1 bg-white border rounded-full text-sm"
                          >
                            {size.size} - {size.stock} pcs
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 