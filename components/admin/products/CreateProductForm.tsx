'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { Loader2, Check, ArrowLeft, Trash, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Steps } from './Steps';
import { VariantForm } from './VariantForm';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Add this CSS class near the top of the file after imports
const noSpinnerClass = "appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// Add this helper function at the top of the file
const formatIndianPrice = (price: number) => {
  return `₹${price.toLocaleString('en-IN')}`;
};

// Add this near the top of the file after the noSpinnerClass definition
const preventWheelChange = (e: React.WheelEvent<HTMLInputElement>) => {
  e.currentTarget.blur();
};

// Step 1: Basic Details
const basicDetailsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  discountedPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  specifications: z.object({
    material: z.string().optional(),
    fit: z.string().optional(),
    occasion: z.string().optional(),
    pattern: z.string().optional(),
    washCare: z.string().optional(),
    style: z.string().optional(),
    neckType: z.string().optional(),
    sleeveType: z.string().optional(),
  }),
});

// Step 2: Variants
const variantSchema = z.object({
  color: z.string().min(1, 'Color is required'),
  sizes: z.array(z.object({
    size: z.string().min(1, 'Size is required'),
    stock: z.number().min(0, 'Stock cannot be negative'),
  })).min(1, 'At least one size is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
});

// Step 3: Payment Options
const paymentSchema = z.object({
  cod: z.boolean(),
  online: z.boolean(),
});

type BasicDetailsFormValues = z.infer<typeof basicDetailsSchema>;

const GENDERS = [
  { id: 'men', label: "Men's Fashion" },
  { id: 'women', label: "Women's Fashion" },
  { id: 'kids', label: "Kid's Fashion" },
  { id: 'unisex', label: 'Unisex' },
] as const;

// Update the steps
const steps = [
  {
    id: 1,
    name: 'Basic Details',
    description: 'Product name, description and pricing',
  },
  {
    id: 2,
    name: 'Category & Gender',
    description: 'Select category and gender',
  },
  {
    id: 3,
    name: 'Variants',
    description: 'Colors, sizes and images',
  },
  {
    id: 4,
    name: 'Payment',
    description: 'Payment options',
  },
  {
    id: 5,
    name: 'Preview',
    description: 'Review and create',
  },
];

// Add Color interface
interface Color {
  _id: string;
  name: string;
  value: string;
}

// Add Category interface
interface Category {
  _id: string;
  name: string;
  slug: string;
}

// Add PreviewStep component
function PreviewStep({
  data,
  variants,
  categories,
  colors,
  onBack,
  onSubmit,
  isLoading,
  isEditing
}: {
  data: any;
  variants: any[];
  categories: Category[];
  colors: Color[];
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  isEditing?: boolean;
}) {

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const discountedPercent = data.discountedPrice
    ? Math.round(((data.price - data.discountedPrice) / data.price) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Details Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4 pb-2 border-b">Basic Details</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <p className="font-medium">{data.name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Description</label>
              <p className="text-sm">{data.description}</p>
            </div>

            {/* Price Details Card */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Original Price:</span>
                <span className="font-medium">{formatPrice(data.price)}</span>
              </div>
              {discountedPercent > 0 && (
                <>
                  <div className="flex justify-between items-center text-red-600">
                    <span className="text-sm">Discount:</span>
                    <span className="font-medium">-{discountedPercent}%</span>
                  </div>
                  <div className="flex justify-between items-center text-green-600 pt-2 border-t">
                    <span className="font-medium">Final Price:</span>
                    <span className="text-lg font-bold">{formatPrice(data.discountedPrice)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Specifications Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4 pb-2 border-b">Specifications</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(data.specifications || {}).map(([key, value]) => {
              if (typeof value === 'string' && value) {
                return (
                  <div key={key}>
                    <label className="text-sm text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <p className="font-medium">{value}</p>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>

      {/* Variants Preview */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="font-semibold mb-4 pb-2 border-b">Variants</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {variants.map((variant, index) => {
            // Find the color object to get the actual color value
            const colorObj = colors.find(c => c._id === variant.color);

            return (
              <div key={index} className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-6 h-6 rounded-full border shadow-sm"
                    style={{ backgroundColor: colorObj?.value || '#ffffff' }}
                  />
                  {colorObj?.name || 'N/A'}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                  {variant.images.map((image: string, imgIndex: number) => (
                    <div key={imgIndex} className="relative aspect-square rounded-md overflow-hidden">
                      <Image
                        src={image}
                        alt={`Variant ${index + 1} image ${imgIndex + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {variant.sizes.map((size: any, sizeIndex: number) => (
                    <div
                      key={sizeIndex}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {size.size} - {size.stock} pcs
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onSubmit} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </div>
  );
}

interface CreateProductFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function CreateProductForm({ initialData, isEditing = false }: CreateProductFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [colors, setColors] = useState<Color[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditingVariant, setIsEditingVariant] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState({
    cod: true,
    online: true,
  });

  // Add this form initialization
  const basicDetailsForm = useForm<BasicDetailsFormValues>({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      discountedPrice: '',
      specifications: {
        material: '',
        fit: '',
        occasion: '',
        pattern: '',
        washCare: '',
        style: '',
        neckType: '',
        sleeveType: '',
      },
    },
  });

  // Initialize form with initial data if editing
  useEffect(() => {
    if (initialData && isEditing) {
      basicDetailsForm.reset({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price.toString(),
        discountedPrice: (initialData.discountedPrice || initialData.price).toString(),
        specifications: initialData.specifications || {
          material: '',
          fit: '',
          occasion: '',
          pattern: '',
          washCare: '',
          style: '',
          neckType: '',
          sleeveType: '',
        },
      });
      setFormData({
        ...initialData,
        category: initialData.category._id,
        price: parseFloat(initialData.price),
        discountedPrice: parseFloat(initialData.discountedPrice || initialData.price),
      });
      setVariants(initialData.variants);
      setPaymentOptions(initialData.paymentOptions || { cod: true, online: true });
    }
  }, [initialData, isEditing, basicDetailsForm]);

  // Fetch colors and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [colorsRes, categoriesRes] = await Promise.all([
          fetch('/api/admin/colors'),
          fetch('/api/admin/categories')
        ]);

        const [colorsData, categoriesData] = await Promise.all([
          colorsRes.json(),
          categoriesRes.json()
        ]);

        setColors(colorsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch required data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

  const handleVariantSubmit = (data: any) => {
    const color = colors.find(c => c._id === data.color);
    if (!color) return;

    const newVariant = {
      ...data,
      color: {
        _id: color._id,
        name: color.name,
        value: color.value
      }
    };

    if (editingIndex !== null) {
      // Update existing variant
      const updatedVariants = [...variants];
      updatedVariants[editingIndex] = newVariant;
      setVariants(updatedVariants);
      setEditingVariant(null);
      setEditingIndex(null);
      setIsEditingVariant(false);
      toast({
        title: "Success",
        description: "Variant updated successfully",
      });
    } else {
      // Add new variant
      setVariants([...variants, newVariant]);
      toast({
        title: "Success",
        description: "Variant added successfully",
      });
    }
  };

  const handleEditVariant = (variant: any, index: number) => {
    // Convert existing variant data to match form structure
    const editableVariant = {
      ...variant,
      color: variant.color._id || variant.color, // Handle both populated and unpopulated color
      images: variant.images,
      tempImages: [], // Initialize empty tempImages array
    };

    setEditingVariant(editableVariant);
    setEditingIndex(index);
    setIsEditingVariant(true);
  };

  const handleCancelEdit = () => {
    setEditingVariant(null);
    setEditingIndex(null);
    setIsEditingVariant(false);
  };

  const handleBasicDetailsSubmit = (data: BasicDetailsFormValues) => {
    // Validate that discounted price is not higher than original price
    const price = parseFloat(data.price);
    const discountedPrice = parseFloat(data.discountedPrice);

    if (discountedPrice > price) {
      toast({
        title: "Error",
        description: "Discounted price cannot be higher than original price",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      ...formData,
      ...data,
      price: parseFloat(data.price),
      discountedPrice: parseFloat(data.discountedPrice || data.price)
    });
    setStep(2);
  };

  const handleCategoryAndGenderSelect = (categoryId: string, gender: string) => {
    setFormData({ ...formData, category: categoryId, gender });
    setStep(3);
  };

  const handleCreateProduct = async () => {
    try {
      if (!formData.name || !formData.price || !formData.description || !formData.discountedPrice ||
        !formData.category || !formData.gender || variants.length === 0) {
        toast({
          title: "Error",
          description: "Please fill all required fields",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      // Upload all variant images first
      const processedVariants = await Promise.all(
        variants.map(async (variant) => {
          // Handle image uploads
          const finalImages = await Promise.all(
            variant.images.map(async (img: string) => {
              // If the image is already a URL (starts with http/https), keep it as is
              if (img.startsWith('http')) {
                return img;
              }

              // Otherwise, find the corresponding temp image and upload it
              const tempImage = variant.tempImages?.find(temp => temp.preview === img);
              if (!tempImage) {
                throw new Error('Missing image file');
              }

              const formData = new FormData();
              formData.append('file', tempImage.file);

              const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
              });

              if (!response.ok) throw new Error('Failed to upload image');
              const uploadedData = await response.json();
              return uploadedData.secure_url;
            })
          );

          // Return processed variant without temp data
          const { tempImages, ...variantData } = variant;
          return {
            ...variantData,
            images: finalImages,
          };
        })
      );
      console.log(formData.discountedPrice);
      console.log(formData)

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountedPrice: parseFloat(formData.discountedPrice),
        discountPercent: Math.round(
          ((parseFloat(formData.price) -
            parseFloat(formData.discountedPrice)) /
            parseFloat(formData.price)) * 100
        ),
        category: formData.category,
        gender: formData.gender,
        specifications: {
          material: formData.specifications?.material || '',
          fit: formData.specifications?.fit || '',
          occasion: formData.specifications?.occasion || '',
          pattern: formData.specifications?.pattern || '',
          washCare: formData.specifications?.washCare || '',
          style: formData.specifications?.style || '',
          neckType: formData.specifications?.neckType || '',
          sleeveType: formData.specifications?.sleeveType || '',
        },
        variants: processedVariants,
        paymentOptions: paymentOptions,
        status: 'active',
      };
      console.log(productData)

      const url = isEditing
        ? `/api/admin/products/${initialData._id}`
        : '/api/admin/products';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(isEditing ? 'Failed to update product' : 'Failed to create product');
      }

      toast({
        title: "Success",
        description: isEditing ? "Product updated successfully" : "Product created successfully",
      });
      router.push('/admin/products');
      router.refresh();

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: isEditing
          ? "Failed to update product. Please try again."
          : "Failed to create product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextAfterVariants = () => {
    if (variants.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one variant",
        variant: "destructive",
      });
      return;
    }
    setStep(4); // Go to payment options
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Form {...basicDetailsForm}>
            <form onSubmit={basicDetailsForm.handleSubmit(handleBasicDetailsSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <FormField
                  control={basicDetailsForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={basicDetailsForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1200"
                            className={cn(noSpinnerClass)}
                            onWheel={preventWheelChange}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={basicDetailsForm.control}
                    name="discountedPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discounted Price (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1000"
                            className={cn(noSpinnerClass)}
                            onWheel={preventWheelChange}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={basicDetailsForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter product description"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Product Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={basicDetailsForm.control}
                    name="specifications.material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cotton, Polyester" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={basicDetailsForm.control}
                    name="specifications.fit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fit</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Regular, Slim" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={basicDetailsForm.control}
                    name="specifications.occasion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occasion</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Casual, Formal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={basicDetailsForm.control}
                    name="specifications.pattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pattern</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Solid, Printed" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={basicDetailsForm.control}
                    name="specifications.washCare"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wash Care</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Machine wash" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={basicDetailsForm.control}
                    name="specifications.style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Style</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Casual, Formal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={basicDetailsForm.control}
                    name="specifications.neckType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Neck Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Round, V-neck" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={basicDetailsForm.control}
                    name="specifications.sleeveType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sleeve Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Full, Half" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {basicDetailsForm.watch('price') && (
                <div className="p-4 rounded-lg border bg-white/50 backdrop-blur-sm space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="font-medium">
                      {formatIndianPrice(Number(basicDetailsForm.watch('price')))}
                    </span>
                  </div>
                  {basicDetailsForm.watch('discountedPrice') &&
                    Number(basicDetailsForm.watch('discountedPrice')) < Number(basicDetailsForm.watch('price')) && (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-red-500">Discount:</span>
                          <span className="text-red-500">
                            {Math.round(
                              ((Number(basicDetailsForm.watch('price')) -
                                Number(basicDetailsForm.watch('discountedPrice'))) /
                                Number(basicDetailsForm.watch('price'))) * 100
                            )}%
                          </span>
                        </div>
                        <div className="pt-2 border-t flex justify-between items-center">
                          <span className="font-medium">Final Price:</span>
                          <span className="text-lg font-bold text-green-600">
                            {formatIndianPrice(Number(basicDetailsForm.watch('discountedPrice')))}
                          </span>
                        </div>
                      </>
                    )}
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit">Next Step</Button>
              </div>
            </form>
          </Form>
        );
      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Select Gender</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {GENDERS.map((gender) => (
                  <Button
                    key={gender.id}
                    variant={formData.gender === gender.id ? "default" : "outline"}
                    className="h-24 flex flex-col gap-2"
                    onClick={() => setFormData({ ...formData, gender: gender.id })}
                  >
                    {gender.label}
                    {formData.gender === gender.id && (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Select Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Button
                    key={category._id}
                    variant={formData.category === category._id ? "default" : "outline"}
                    className="h-24"
                    onClick={() => handleCategoryAndGenderSelect(category._id, formData.gender)}
                    disabled={!formData.gender}
                  >
                    {category.name}
                    {formData.category === category._id && (
                      <Check className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {formData.category && formData.gender && (
                <Button onClick={() => setStep(3)}>
                  Next Step
                </Button>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <VariantForm
                colors={colors}
                onSubmit={handleVariantSubmit}
                selectedVariant={editingVariant}
                onCancelEdit={handleCancelEdit}
              />
            </div>

            {!isEditingVariant && variants.length > 0 && (
              <div>
                <h4 className="font-medium mb-4">Added Variants</h4>
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: colors.find(c => c._id === variant.color)?.value }}
                          />
                          <span className="font-medium">{variant.color.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditVariant(variant, index)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setVariants(variants.filter((_, i) => i !== index));
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {variant.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="relative aspect-square rounded-md overflow-hidden">
                            <Image
                              src={image}
                              alt={`Variant ${index + 1} image ${imgIndex + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {variant.sizes.map((size, sizeIndex) => (
                          <div
                            key={sizeIndex}
                            className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                          >
                            {size.size} - {size.stock} pcs
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {variants.length > 0 && !isEditingVariant && (
                <Button onClick={handleNextAfterVariants}>
                  Next Step
                </Button>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Payment Options</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium">Cash on Delivery</label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to pay on delivery
                    </p>
                  </div>
                  <Switch
                    checked={paymentOptions.cod}
                    onCheckedChange={(checked) =>
                      setPaymentOptions(prev => ({ ...prev, cod: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium">Online Payment</label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to pay online
                    </p>
                  </div>
                  <Switch
                    checked={paymentOptions.online}
                    onCheckedChange={(checked) =>
                      setPaymentOptions(prev => ({ ...prev, online: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  paymentOptions
                }));
                setStep(5);
              }}>
                Next Step
              </Button>
            </div>
          </div>
        );
      case 5:
        return (
          <PreviewStep
            data={formData}
            variants={variants}
            categories={categories}
            colors={colors}
            onBack={() => setStep(4)}
            onSubmit={handleCreateProduct}
            isLoading={isLoading}
            isEditing={isEditing}
          />
        );
    }
  };

  return (
    <div className="space-y-8">
      <Steps currentStep={step} steps={steps} />
      <div className="mt-8">
        {renderStep()}
      </div>
    </div>
  );
} 