"use client";

import { useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { useProducts } from "@/contexts/ProductContext";
import { ProductSkeleton } from "../skeletons/ProductSkeleton";

export default function Products() {
  const { products, isLoading } = useProducts();

  if (isLoading) {
    return <ProductSkeleton />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
