import { HomeBanner } from '@/components/banner/HomeBanner';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { Categories } from '@/components/Categories';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <HomeBanner />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-16">
          <Categories />
          <FeaturedProducts />
        </div>
      </main>
      <Footer />
    </div>
  );
}
