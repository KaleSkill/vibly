'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSession } from 'next-auth/react';
import { Star, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface Review {
  _id: string;
  user: {
    name: string | null;
    email: string | null;
    image?: string | null;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  variants: Array<{
    images: string[];
  }>;
}

export function ProductReviews({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, reviewsRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch(`/api/products/${productId}/reviews`)
        ]);

        const [productData, reviewsData] = await Promise.all([
          productRes.json(),
          reviewsRes.json()
        ]);

        setProduct(productData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const getInitials = (name: string | null, email: string | null) => {
    if (name?.trim()) return name.charAt(0).toUpperCase();
    if (email?.trim()) return email.charAt(0).toUpperCase();
    return 'U';
  };

  const averageRating = reviews.length 
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const handleEditReview = async () => {
    if (!editingReview || !newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/products/${productId}/reviews/${editingReview._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: newRating,
          comment: newComment,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update review');
      }

      const updatedReview = await response.json();
      
      setReviews(reviews.map(review => 
        review._id === editingReview._id ? updatedReview : review
      ));
      
      setNewComment('');
      setNewRating(5);
      setEditingReview(null);
      setIsDialogOpen(false);

      toast({
        title: "Success",
        description: "Review updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/products/${productId}/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete review');
      }

      setReviews(reviews.filter(review => review._id !== reviewId));

      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Product Header Skeleton */}
        <div className="flex flex-col sm:flex-row gap-6 items-start mb-8 pb-6 border-b">
          <Skeleton className="relative aspect-square w-32 rounded-lg" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-7 w-3/4" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="w-5 h-5" />
                  ))}
                </div>
                <Skeleton className="h-5 w-8" />
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>

        {/* Reviews List Skeleton */}
        <div className="space-y-8">
          {[...Array(5)].map((_, index) => (
            <div 
              key={index} 
              className="border-b pb-8"
              style={{ opacity: 1 - index * 0.1 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex justify-end gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="w-4 h-4" />
                    ))}
                  </div>
                  <Skeleton className="h-4 w-16 mt-1 ml-auto" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Product Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start mb-8 pb-6 border-b">
        <div className="relative aspect-square w-32 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={product.variants[0].images[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <Link 
            href={`/products/${productId}`}
            className="text-lg font-medium hover:underline"
          >
            {product.name}
          </Link>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      parseFloat(averageRating) >= star 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="font-medium">{averageRating}</span>
            </div>
            <span className="text-muted-foreground">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-8">
        {reviews.map((review) => (
          <div key={review._id} className="border-b pb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  {review.user.image ? (
                    <AvatarImage 
                      src={review.user.image} 
                      alt={review.user.name || 'User'} 
                    />
                  ) : (
                    <AvatarFallback 
                      className="bg-primary/10 text-primary font-medium"
                    >
                      {getInitials(review.user.name, review.user.email)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium">
                    {review.user.name || 'Anonymous User'}
                  </div>
                  {review.user.email && (
                    <div className="text-sm text-muted-foreground">
                      {review.user.email}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(review.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-right">
                  <div className="flex justify-end">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= review.rating 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {review.rating}/5 rating
                  </div>
                </div>
                {session?.user?.email === review.user.email && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingReview(review);
                          setNewRating(review.rating);
                          setNewComment(review.comment);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Review
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteReview(review._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Review
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            <p className="text-gray-600 mt-4">
              {review.comment}
            </p>
          </div>
        ))}
      </div>

      {/* Edit Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-colors",
                        star <= newRating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Comment</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your review here..."
                className="h-32 resize-none"
              />
            </div>
            <Button
              onClick={handleEditReview}
              className="w-full"
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update Review'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 