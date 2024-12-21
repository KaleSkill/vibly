'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, colorsRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/categories'),
          fetch('/api/admin/colors')
        ]);

        const [productsData, categoriesData, colorsData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          colorsRes.json()
        ]);

        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(categoriesData);
        setColors(colorsData);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (filters: any) => {
    let filtered = [...products];

    // Apply filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        filters.categories.includes(product.category._id)
      );
    }

    if (filters.colors.length > 0) {
      filtered = filtered.filter(product =>
        product.variants.some(variant =>
          filters.colors.includes(variant.color)
        )
      );
    }

    setFilteredProducts(filtered);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      
      <div className="flex gap-8">
        <aside className="w-64 flex-shrink-0">
          <ProductFilters
            categories={categories}
            colors={colors}
            onFilterChange={handleFilterChange}
          />
        </aside>

        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
               
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 