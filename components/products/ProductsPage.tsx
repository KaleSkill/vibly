"use client";

import { ProductFilters } from "./ProductFilters";
import Products from "./Products";

export function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">All Products</h1>
          {/* <p className="text-muted-foreground mt-1">
            {products?.length} Products
          </p> */}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters - Now in a sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <ProductFilters />
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          <Products />
        </main>
      </div>
    </div>
  );
}
