import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { BannerSlider } from "@/components/home/BannerSlider";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductSkeleton } from "@/components/skeletons/ProductSkeleton";
import { BannerSkeleton } from "@/components/skeletons/BannerSkeleton";
import type { Product } from "@/types/product";
import type { Banner } from "@/types/banner";
import { fetchFromAPI } from "@/lib/utils";

async function getBanners(): Promise<Banner[]> {
  try {
    return await fetchFromAPI<Banner[]>('banners');
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    return await fetchFromAPI<Product[]>('products/featured');
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export default async function Home() {
  const [banners, featuredProducts] = await Promise.all([
    getBanners(),
    getFeaturedProducts()
  ]);

  return (
    <div className="flex flex-col gap-12">
      {/* Hero Section with Banner Slider */}
      <section className="relative">
        <Suspense fallback={<BannerSkeleton />}>
          <BannerSlider banners={banners} />
        </Suspense>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <CategoryGrid />
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Button variant="outline" asChild>
            <a href="/products">View All</a>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Suspense 
            fallback={[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          >
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </Suspense>
        </div>
      </section>
    </div>
  );
}
