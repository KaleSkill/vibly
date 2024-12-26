import { Skeleton } from "@/components/ui/skeleton";

export function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Products Grid Skeleton */}
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="group">
                <div className="space-y-4 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="relative">
                    <Skeleton className="aspect-square w-full" />
                    <div className="absolute top-3 right-3">
                      <Skeleton className="h-7 w-16 rounded-full" />
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-5/6" />
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-7 w-28" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-11 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}