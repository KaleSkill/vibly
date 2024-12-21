'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { useProducts } from "@/contexts/ProductContext";
import { ColorFilter } from "./ColorFilter";
import { PriceFilter } from "./PriceFilter";

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "name-a-z", label: "Name: A to Z" },
  { value: "name-z-a", label: "Name: Z to A" },
  { value: "newest", label: "What's New" },
];

export function ProductFilters() {
  const { sortBy, setSortBy, clearFilters } = useProducts();
  const [isOpen, setIsOpen] = useState(false);

  const FilterContent = () => (
    <div className="space-y-6">
      <PriceFilter onApply={() => setIsOpen(false)} />
      <ColorFilter />
      <Button variant="outline" onClick={clearFilters} className="w-full mt-4">
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="sticky top-4">
      {/* Mobile Filter Button and Sort */}
      <div className="lg:hidden flex items-center gap-4 mb-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-8">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Sort Dropdown */}
      <div className="mb-6">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block space-y-6 bg-white rounded-lg p-4 border">
        <FilterContent />
      </div>
    </div>
  );
} 