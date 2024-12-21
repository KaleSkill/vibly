'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/contexts/ProductContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function PriceFilter({ onApply }: { onApply?: () => void }) {
  const { selectedPriceRange, setSelectedPriceRange } = useProducts();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for input values
  const [minPrice, setMinPrice] = useState(selectedPriceRange[0]?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(
    selectedPriceRange[1] === Infinity ? "" : selectedPriceRange[1]?.toString() || ""
  );

  // Update local state when selectedPriceRange changes from context
  useEffect(() => {
    setMinPrice(selectedPriceRange[0]?.toString() || "");
    setMaxPrice(selectedPriceRange[1] === Infinity ? "" : selectedPriceRange[1]?.toString() || "");
  }, [selectedPriceRange]);

  const handleApply = () => {
    const min = Number(minPrice) || 0;
    const max = maxPrice ? Number(maxPrice) : Infinity;

    setSelectedPriceRange([min, max]);

    const params = new URLSearchParams(searchParams.toString());
    params.set("price", `${min}-${max === Infinity ? "max" : max}`);
    router.push(`/products?${params.toString()}`);
    onApply?.();
  };

  return (
    <div>
      <h3 className="font-medium mb-4">Price Range</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-muted-foreground">Min Price</label>
            <Input
              type="number"
              placeholder="₹0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Max Price</label>
            <Input
              type="number"
              placeholder="No limit"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleApply}
        >
          Apply Price Filter
        </Button>
      </div>
    </div>
  );
} 