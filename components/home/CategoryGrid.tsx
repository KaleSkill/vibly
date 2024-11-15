import Image from 'next/image';
import Link from 'next/link';

const categories = [
  {
    name: "Men's Fashion",
    image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e',
    slug: 'men',
  },
  {
    name: "Women's Fashion",
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
    slug: 'women',
  },
  {
    name: "Kid's Fashion",
    image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b',
    slug: 'kids',
  },
  {
    name: 'Unisex',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
    slug: 'unisex',
  },
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/products?category=${category.slug}`}
          className="group relative h-64 overflow-hidden rounded-lg"
        >
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h3 className="text-2xl font-bold text-white">{category.name}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
} 