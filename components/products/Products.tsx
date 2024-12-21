"use client";

import { ProductCard } from "@/components/products/ProductCard";
import { ProductSkeleton } from "@/components/skeletons/ProductSkeleton";
import { useProducts } from "@/contexts/ProductContext";
import { Button } from "../ui/button";
export default function Products() {
  const { products, isLoading, clearFilters } = useProducts();
  if (isLoading) {
    return <ProductSkeleton />;
  }
  if (products?.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-muted-foreground mb-4">
          No products found matching your criteria.
        </p>
        <Button variant="outline" onClick={clearFilters}>
          Clear All Filters
        </Button>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {products?.map((product) => (
        <div className="h-full" key={product._id}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
