import { Skeleton } from "@/components/ui/skeleton";

export function BannerSkeleton() {
  return (
    <div className="relative w-full h-[500px]">
      <Skeleton className="w-full h-full" />
      <div className="absolute bottom-10 left-10">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
} 