'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface Category {
  _id: string;
  name: string;
  image: string;
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Shop by Category</h2>
        <p className="text-muted-foreground mt-1">
          Find what you&apos;re looking for
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link key={category._id} href={`/categories/${category._id}`}>
            <Card className="group overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <h3 className="text-white text-xl font-bold">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
} 