'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal, X } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  discountedPrice: number;
  discountPercent: number;
  status: string;
  createdAt: string;
  variants: Array<{
    color: string;
    colorName: string;
    images: string[];
  }>;
}

interface Color {
  _id: string;
  name: string;
  value: string;
}

interface PriceRange {
  min: number;
  max: number;
  label: string;
}

interface SortOption {
  value: string;
  label: string;
}

const sortOptions: SortOption[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
  { value: 'newest', label: "What's New" },
];

const priceRanges: PriceRange[] = [
  { min: 0, max: 1000, label: 'Under ₹1,000' },
  { min: 1000, max: 2000, label: '₹1,000 - ₹2,000' },
  { min: 2000, max: 5000, label: '₹2,000 - ₹5,000' },
  { min: 5000, max: Infinity, label: 'Above ₹5,000' },
];

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number[]>([0, 10000]);
  const [sortBy, setSortBy] = useState('recommended');
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, colorsRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/colors')
        ]);

        const [productsData, colorsData] = await Promise.all([
          productsRes.json(),
          colorsRes.json()
        ]);

        const activeProducts = productsData.filter((p: Product) => p.status === 'active');
        setProducts(activeProducts);
        setFilteredProducts(activeProducts);
        setColors(colorsData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = [...products];

    // Apply color filter
    if (selectedColors.length > 0) {
      result = result.filter(product =>
        product.variants.some(variant =>
          selectedColors.includes(variant.color)
        )
      );
    }

    // Apply price range filter
    result = result.filter(product =>
      product.discountedPrice >= selectedPriceRange[0] &&
      product.discountedPrice <= selectedPriceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case 'price-low-high':
        result.sort((a, b) => a.discountedPrice - b.discountedPrice);
        break;
      case 'price-high-low':
        result.sort((a, b) => b.discountedPrice - a.discountedPrice);
        break;
      case 'name-a-z':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-z-a':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        result.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    setFilteredProducts(result);
  }, [products, selectedColors, selectedPriceRange, sortBy]);

  const handlePriceRangeChange = (range: PriceRange) => {
    setSelectedPriceRange([range.min, range.max]);
    setActiveFilters(prev => 
      [...prev.filter(f => !f.startsWith('Price:')), `Price: ${range.label}`]
    );
    setIsOpen(false);
  };

  const handleColorChange = (color: Color) => {
    const newColors = selectedColors.includes(color._id)
      ? selectedColors.filter(c => c !== color._id)
      : [...selectedColors, color._id];
    setSelectedColors(newColors);
    
    if (selectedColors.includes(color._id)) {
      setActiveFilters(prev => 
        prev.filter(f => f !== `Color: ${color.name}`)
      );
    } else {
      setActiveFilters(prev => [...prev, `Color: ${color.name}`]);
    }
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedPriceRange([0, 10000]);
    setActiveFilters([]);
    setIsOpen(false);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Ranges */}
      <div>
        <h3 className="font-medium mb-4">Price Range</h3>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => handlePriceRangeChange(range)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedPriceRange[0] === range.min ? 'bg-primary text-white' : 'hover:bg-gray-100'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="font-medium mb-4">Colors</h3>
        <div className="grid grid-cols-2 gap-2">
          {colors.map((color) => (
            <button
              key={color._id}
              onClick={() => handleColorChange(color)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                selectedColors.includes(color._id) ? 'bg-primary text-white' : 'hover:bg-gray-100'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: color.value }}
              />
              {color.name}
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full mt-4"
      >
        Clear All Filters
      </Button>
    </div>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">All Products</h1>
          <p className="text-muted-foreground mt-1">
            {filteredProducts.length} Products
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
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

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
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
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="px-3 py-1"
            >
              {filter}
              <button
                onClick={() => {
                  setActiveFilters(activeFilters.filter(f => f !== filter));
                  if (filter.startsWith('Price:')) {
                    setSelectedPriceRange([0, 10000]);
                  } else if (filter.startsWith('Color:')) {
                    const colorName = filter.split(': ')[1];
                    const color = colors.find(c => c.name === colorName);
                    if (color) {
                      setSelectedColors(prev => prev.filter(c => c !== color._id));
                    }
                  }
                }}
                className="ml-2"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-8">
        {/* Filters */}
        <div className="hidden lg:block w-64">
          <div className="space-y-6">
            {/* Price Ranges */}
            <div>
              <h3 className="font-medium mb-4">Price Range</h3>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handlePriceRangeChange(range)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedPriceRange[0] === range.min ? 'bg-primary text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="font-medium mb-4">Colors</h3>
              <div className="grid grid-cols-2 gap-2">
                {colors.map((color) => (
                  <button
                    key={color._id}
                    onClick={() => handleColorChange(color)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedColors.includes(color._id) ? 'bg-primary text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: color.value }}
                    />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found.</p>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 