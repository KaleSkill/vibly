'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';

interface Color {
  _id: string;
  name: string;
  value: string;
}

interface ProductContextType {
  products: Product[];
  colors: Color[];
  isLoading: boolean;
  selectedColors: string[];
  selectedPriceRange: [number, number];
  sortBy: string;
  setSelectedColors: (colors: string[]) => void;
  setSelectedPriceRange: (range: [number, number]) => void;
  setSortBy: (sort: string) => void;
  clearFilters: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([0, Infinity]);
  const [sortBy, setSortBy] = useState("");
  const router = useRouter();   

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, colorsRes] = await Promise.all([
          fetch(`/api/products?${searchParams.toString()}`),
          fetch('/api/colors')
        ]);

        const [productsData, colorsData] = await Promise.all([
          productsRes.json(),
          colorsRes.json()
        ]);

        setProducts(productsData);
        setColors(colorsData);

        // Set filters from URL params
        const urlColors = searchParams.get('color')?.split(',') || [];
        const urlPrice = searchParams.get('price')?.split('-') || [];
        const urlSort = searchParams.get('sort') || '';

        setSelectedColors(urlColors);
        if (urlPrice.length === 2) {
          setSelectedPriceRange([
            Number(urlPrice[0]) || 0,
            urlPrice[1] === 'max' ? Infinity : Number(urlPrice[1])
          ]);
        }
        setSortBy(urlSort);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedPriceRange([0, Infinity]);
    setSortBy('');
    router.push('/products');
  };

  const value = {
    products,
    colors,
    isLoading,
    selectedColors,
    selectedPriceRange,
    sortBy,
    setSelectedColors,
    setSelectedPriceRange,
    setSortBy,
    clearFilters,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}; 