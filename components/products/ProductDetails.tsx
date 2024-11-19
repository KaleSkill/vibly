'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Minus, Plus, MapPin, Truck, XCircle, Calendar, Star, StarHalf, MoreVertical, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from 'next-auth/react';
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from '@/providers/CartProvider';
import { Product } from '@/types';
import { useRouter } from 'next/navigation';
import { Label } from "@/components/ui/label";

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
  price: number;
  discountPercent: number;
  discountedPrice: number;
  saleType: boolean;
  salePrice: number;
  salePriceDiscount: number;
  discountedSalePrice: number;
  description: string;
  specifications: {
    [key: string]: string;
  };
  variants: Array<{
    color: {
      _id: string;
      name: string;
      value: string;
    };
    sizes: Array<{
      size: string;
      stock: number;
    }>;
    images: string[];
  }>;
}

// Add this size order mapping
const sizeOrder = {
  'S': 1,
  'M': 2,
  'L': 3,
  'XL': 4,
  'XXL': 5,
  'XXXL': 6
};

export function ProductDetails({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [pincode, setPincode] = useState('');
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<{
    expectedDate?: Date;
  } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const { data: session } = useSession();
  const { addToCart, items } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const [availableStock, setAvailableStock] = useState(0);

  // Check if product is in cart
  const isInCart = items.some(item => item.product._id === productId);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        setProduct(data);
        
        if (data.variants?.[0]?.images?.[0]) {
          setSelectedImage(data.variants[0].images[0]);
        }
        
        if (data.variants?.[0]?.sizes?.[0]?.size) {
          setSelectedSize(data.variants[0].sizes[0].size);
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load product details');
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, toast]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/reviews`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchReviews();
  }, [productId]);

  useEffect(() => {
    if (product && selectedSize) {
      const currentVariant = product.variants[selectedVariant];
      const sizeStock = currentVariant.sizes.find(s => s.size === selectedSize)?.stock || 0;
      setAvailableStock(sizeStock);
      
      // Reset quantity if it exceeds available stock
      if (quantity > sizeStock) {
        setQuantity(sizeStock);
      }
    }
  }, [product, selectedVariant, selectedSize]);

  const checkDelivery = async () => {
    if (!pincode || pincode.length !== 6) {
      toast({
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode",
        variant: "destructive",
      });
      return;
    }

    setCheckingPincode(true);
    // Simulate pincode check
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Set delivery date (4-5 days from now)
    setDeliveryInfo({
      expectedDate: addDays(new Date(), 4)
    });
    
    setCheckingPincode(false);
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name?.trim()) return name.charAt(0).toUpperCase();
    if (email?.trim()) return email.charAt(0).toUpperCase();
    return 'U';
  };

  const handleAddReview = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
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
        throw new Error(error.error || 'Failed to add review');
      }

      const newReview = await response.json();
      
      const transformedReview: Review = {
        ...newReview,
        user: {
          name: newReview.user?.name || null,
          email: newReview.user?.email || null,
          image: newReview.user?.image || null
        }
      };

      setReviews([transformedReview, ...reviews]);
      
      // Reset form and close dialog
      setNewComment('');
      setNewRating(5);
      setIsDialogOpen(false);

      toast({
        title: "Success",
        description: "Review added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      
      // Update reviews list
      setReviews(reviews.map(review => 
        review._id === editingReview._id ? updatedReview : review
      ));
      
      // Reset form and close dialog
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

      // Remove review from list
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

  const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          )}
        />
      ))}
    </div>
  );

  const incrementQuantity = () => {
    if (quantity < availableStock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= availableStock) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast({
        title: "Error",
        description: "Please select a size",
        variant: "destructive",
      });
      return;
    }

    if (quantity > availableStock) {
      toast({
        title: "Error",
        description: "Selected quantity exceeds available stock",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product._id, {
        color: product.variants[selectedVariant].color._id,
        colorName: product.variants[selectedVariant].color.name,
        size: selectedSize
      }, quantity);

      toast({
        title: "Success",
        description: "Added to cart",
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedSize || !product) {
      toast({
        title: "Error",
        description: "Please select a size",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentVariant = product.variants[selectedVariant];
      await addToCart(productId, {
        color: currentVariant.color._id,
        colorName: currentVariant.color.name,
        size: selectedSize,
      }, quantity);

      router.push('/checkout');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to proceed to checkout",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Only run if product exists
    if (product && product.variants) {
      // Reset size selection when color variant changes
      const availableSizes = product.variants[selectedVariant].sizes;
      if (availableSizes.length > 0) {
        // Select first available size with stock
        const firstAvailableSize = availableSizes.find(size => size.stock > 0);
        setSelectedSize(firstAvailableSize ? firstAvailableSize.size : '');
      } else {
        setSelectedSize('');
      }
    }
  }, [selectedVariant, product]);

  // Helper function to sort sizes
  const sortSizes = (sizes: Array<{ size: string; stock: number }>) => {
    return [...sizes].sort((a, b) => {
      const orderA = sizeOrder[a.size as keyof typeof sizeOrder] || 999;
      const orderB = sizeOrder[b.size as keyof typeof sizeOrder] || 999;
      return orderA - orderB;
    });
  };

  // Get stock warning message and color
  const getStockWarning = (stock: number) => {
    if (stock <= 3) {
      return {
        message: `Only ${stock} items left!`,
        className: "text-red-600 font-medium"
      };
    }
    if (stock < 10) {
      return {
        message: `Only ${stock} items left`,
        className: "text-yellow-600"
      };
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Column - Image Skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="grid grid-cols-6 gap-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          </div>

          {/* Right Column - Content Skeleton */}
          <div className="flex flex-col space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-6 w-1/3" />
            </div>

            {/* Color Selection Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-10 h-10 rounded-full" />
                ))}
              </div>
            </div>

            {/* Size Selection Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-4 w-16" />
              <div className="grid grid-cols-6 gap-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-md" />
                ))}
              </div>
            </div>

            {/* Quantity Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center gap-2 w-28">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>

            {/* Delivery Check Skeleton */}
            <div className="pt-4 space-y-4 border-t">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="mt-6">
              <div className="flex gap-6 border-b">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-24" />
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{error || 'Product not found'}</p>
      </div>
    );
  }

  const currentVariant = product.variants[selectedVariant];

  // Calculate average rating
  const averageRating = reviews.length 
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="container max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
           
          </div>

          {/* Thumbnail Images */}
          <div className="grid grid-cols-6 gap-2">
            {currentVariant.images.map((image) => (
              <button
                key={image}
                onClick={() => setSelectedImage(image)}
                className={cn(
                  "relative aspect-square rounded-md overflow-hidden bg-gray-50 hover:opacity-80 transition-opacity",
                  selectedImage === image && "ring-2 ring-black"
                )}
              >
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            
            {/* Price Display */}
            <div className="mt-4 flex items-baseline gap-4">
              {product.saleType ? (
                // Sale Price Display
                <>
                  <span className="text-3xl font-bold text-red-600">
                    {formatPrice(product.discountedSalePrice)}
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.salePrice)}
                  </span>
                  <Badge className="bg-red-500">
                    SALE {product.salePriceDiscount}% OFF
                  </Badge>
                </>
              ) : (
                // Regular Price Display
                <>
                  <span className="text-3xl font-bold">
                    {formatPrice(product.discountedPrice)}
                  </span>
                  {product.discountPercent > 0 && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        {formatPrice(product.price)}
                      </span>
                      <Badge>
                        {product.discountPercent}% OFF
                      </Badge>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Savings Display */}
            {product.saleType ? (
              <p className="mt-2 text-sm text-red-600">
                You save {formatPrice(product.salePrice - product.discountedSalePrice)}
              </p>
            ) : product.discountPercent > 0 && (
              <p className="mt-2 text-sm text-green-600">
                You save {formatPrice(product.price - product.discountedPrice)}
              </p>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <span className="text-sm font-medium">Color: {currentVariant.colorName}</span>
            <div className="flex gap-2">
              {product.variants.map((variant, index) => (
                <button
                  key={variant.color._id}
                  onClick={() => {
                    setSelectedVariant(index);
                    setSelectedImage(variant.images[0]);
                  }}
                  className={cn(
                    "w-9 h-9 rounded-full transition-all",
                    selectedVariant === index && "ring-2 ring-black ring-offset-2"
                  )}
                >
                  <div
                    className="w-full h-full rounded-full"
                    style={{ backgroundColor: variant.color.value }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <span className="text-sm font-medium">Size</span>
            <div className="grid grid-cols-6 gap-2">
              {sortSizes(product.variants[selectedVariant].sizes).map((size) => (
                <button
                  key={size.size}
                  onClick={() => setSelectedSize(size.size)}
                  disabled={size.stock === 0}
                  className={cn(
                    "py-2 text-sm border rounded-md transition-colors",
                    size.stock === 0 && "bg-gray-50 text-gray-400 cursor-not-allowed",
                    selectedSize === size.size && "border-black bg-black text-white",
                    size.stock > 0 && selectedSize !== size.size && "hover:border-gray-400"
                  )}
                >
                  {size.size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={1}
                max={availableStock}
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={quantity >= availableStock}
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              {/* Stock Warning */}
              {availableStock > 0 && getStockWarning(availableStock) && (
                <div className={cn(
                  "flex items-center gap-1 ml-2",
                  getStockWarning(availableStock)?.className
                )}>
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    {getStockWarning(availableStock)?.message}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isInCart ? (
              <>
                <Button 
                  className="flex-1 bg-black hover:bg-black/90"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !selectedSize}
                >
                  {isAddingToCart ? (
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button 
                  className="flex-1"
                  variant="outline"
                  onClick={handleBuyNow}
                  disabled={isAddingToCart || !selectedSize}
                >
                  Buy Now
                </Button>
              </>
            ) : (
              <Button 
                className="w-full bg-black hover:bg-black/90"
                onClick={() => router.push('/checkout')}
              >
                Buy Now
              </Button>
            )}
          </div>

          {/* Delivery Check - Updated Section */}
          <div className="pt-4 space-y-3 border-t">
            <span className="text-sm font-medium">Check Delivery</span>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPincode(value);
                    if (deliveryInfo) setDeliveryInfo(null);
                  }}
                  className="pl-9 h-9"
                />
              </div>
              <Button 
                variant="outline"
                onClick={checkDelivery}
                disabled={checkingPincode || pincode.length !== 6}
                className="h-9 whitespace-nowrap"
              >
                {checkingPincode ? (
                  <>
                    <span className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Checking...
                  </>
                ) : 'Check'}
              </Button>
            </div>

            {deliveryInfo && (
              <div className="rounded-lg border bg-gray-50/50 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Truck className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-green-600">
                          Delivery Available
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">
                          Expected by {format(deliveryInfo.expectedDate!, 'EEEE, MMMM d')}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        Free Delivery
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Information */}
          <Tabs defaultValue="description" className="mt-6">
            <TabsList className="border-b rounded-none h-auto p-0 bg-transparent space-x-6">
              <TabsTrigger 
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black bg-transparent px-0"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="specifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black bg-transparent px-0"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </TabsContent>
            <TabsContent value="specifications" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  value && (
                    <div key={key} className="space-y-1">
                      <dt className="text-xs text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </dt>
                      <dd className="text-sm">{value}</dd>
                    </div>
                  )
                ))}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                  <h3 className="text-lg font-medium">Customer Reviews</h3>
                    <p className="text-sm text-muted-foreground">
                      {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                        Write a Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingReview ? 'Edit Review' : 'Write a Review'}
                        </DialogTitle>
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
                          onClick={editingReview ? handleEditReview : handleAddReview}
                          className="w-full"
                          disabled={!newComment.trim() || isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                              {editingReview ? 'Updating...' : 'Submitting...'}
                            </>
                          ) : (
                            editingReview ? 'Update Review' : 'Submit Review'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.slice(0, 2).map((review) => (
                      <div key={review._id} className="border-b pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 shrink-0">
                              {review.user.image ? (
                                <AvatarImage 
                                  src={review.user.image} 
                                  alt={review.user.name || 'User'} 
                                />
                              ) : (
                                <AvatarFallback 
                                  className="bg-primary/10 text-primary font-medium"
                                  delayMs={600}
                                >
                                {getInitials(review.user.name, review.user.email)}
                              </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {review.user.name || 'Anonymous User'}
                              </div>
                              {review.user.email && (
                                <div className="text-sm text-muted-foreground truncate">
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
                              <RatingStars rating={review.rating} />
                              <div className="text-sm text-muted-foreground mt-1">
                                {review.rating}/5 rating
                              </div>
                            </div>
                            {session?.user?.email === review.user.email && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
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
                        <div className="mt-2 sm:pl-13">
                          <p className="text-gray-600 text-sm sm:text-base">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {reviews.length > 2 && (
                      <div className="pt-6 border-t">
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-center">
                            <p className="text-muted-foreground">
                              Showing 2 of {reviews.length} reviews
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="lg"
                            className="group relative overflow-hidden rounded-full px-8 transition-all hover:bg-primary hover:text-white"
                            asChild
                          >
                            <Link href={`/products/${productId}/reviews`} className="flex items-center gap-2">
                              <span>View All Reviews</span>
                              <div className="flex items-center gap-0.5">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="font-medium">{averageRating}</span>
                                <span className="text-sm text-muted-foreground">
                                  ({reviews.length})
                                </span>
                              </div>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <p className="text-gray-500 mb-4">No reviews yet</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingReview(true)}
                      className="w-full sm:w-auto"
                    >
                      Be the first to review
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 