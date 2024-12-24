'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  _id: string;
  public_id:String;
  secure_url:String;
}

export function HomeBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/banners');
        if (!response.ok) throw new Error('Failed to fetch banners');
        const data = await response.json();
        setBanners(data[0].images);
        console.log(data[0].images)
      } catch (error) {
        console.error('Error fetching banners:', error);
        toast({
          title: "Error",
          description: "Failed to load banners",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, [toast]);

  // Auto-advance banners
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((current) => 
        current === banners.length - 1 ? 0 : current + 1
      );
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  const nextBanner = () => {
    setCurrentIndex((current) => 
      current === banners.length - 1 ? 0 : current + 1
    );
  };

  const previousBanner = () => {
    setCurrentIndex((current) => 
      current === 0 ? banners.length - 1 : current - 1
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-gray-100 animate-pulse rounded-lg" />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full">
      <div className="relative aspect-[16/6] overflow-hidden ">
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              index === currentIndex ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              src={banner.secure_url}
              alt="Banner"
              fill
              className="object-cover object-center"
              priority={index === currentIndex}
            />
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white"
            onClick={previousBanner}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white"
            onClick={nextBanner}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex 
                    ? "bg-white w-4" 
                    : "bg-white/50 hover:bg-white/75"
                )}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 