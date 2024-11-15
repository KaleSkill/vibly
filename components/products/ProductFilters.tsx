'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

interface Color {
  _id: string;
  name: string;
  value: string;
}

interface ProductFiltersProps {
  categories: Category[];
  colors: Color[];
  onFilterChange: (filters: any) => void;
}

export function ProductFilters({ categories, colors, onFilterChange }: ProductFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const handleFilterChange = () => {
    onFilterChange({
      categories: selectedCategories,
      colors: selectedColors,
      priceRange,
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setPriceRange([0, 10000]);
    onFilterChange({
      categories: [],
      colors: [],
      priceRange: [0, 10000],
    });
  };

  return (
    <>
      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {/* Filter content */}
              <div className="space-y-4">
                <h3 className="font-medium">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category._id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category._id)}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...selectedCategories, category._id]
                            : selectedCategories.filter(id => id !== category._id);
                          setSelectedCategories(newCategories);
                          handleFilterChange();
                        }}
                        className="rounded border-gray-300"
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Colors</h3>
                <div className="grid grid-cols-2 gap-2">
                  {colors.map((color) => (
                    <label
                      key={color._id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color._id)}
                        onChange={(e) => {
                          const newColors = e.target.checked
                            ? [...selectedColors, color._id]
                            : selectedColors.filter(id => id !== color._id);
                          setSelectedColors(newColors);
                          handleFilterChange();
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Categories</h3>
            {/* Same category filters as mobile */}
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Colors</h3>
            {/* Same color filters as mobile */}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </Card>
      </div>
    </>
  );
} 