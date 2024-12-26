'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { formatPrice } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SearchResult {
  _id: string;
  name: string;
  price: number;
  discountedPrice: number;
  category: {
    name: string;
  };
  variants: Array<{
    images: string[];
  }>;
}

export function SearchResults({ 
  query, 
  onClose 
}: { 
  query: string;
  onClose: () => void;
}) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  if (!query) return null;

  return (
    <div className="md:absolute md:top-full md:left-0 md:right-0 bg-white md:border md:rounded-lg md:shadow-lg md:mt-1 max-h-full md:max-h-[400px] overflow-y-auto z-50">
      {isLoading ? (
        <div className="p-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      ) : results.length > 0 ? (
        <div className="py-2">
          {results.map((product) => (
            <Link
              key={product._id}
              href={`/products/${product._id}`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              <div className="relative w-12 h-12">
                <Image
                  src={product.variants[0].images[0]}
                  alt={product.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{product.name}</h4>
                <p className="text-xs text-muted-foreground">{product.category.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {formatPrice(product.discountedPrice)}
                  </span>
                  {product.discountedPrice < product.price && (
                    <span className="text-xs line-through text-muted-foreground">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          No products found
        </div>
      )}
    </div>
  );
} 