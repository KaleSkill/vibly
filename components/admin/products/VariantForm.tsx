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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { ImageUpload } from './ImageUpload';
import { Plus, Trash, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Color {
  _id: string;
  name: string;
  value: string;
}

interface Size {
  size: string;
  stock: number;
}

interface Variant {
  color: string;
  colorName: string;
  sizes: Size[];
  images: string[];
}

interface VariantFormProps {
  colors: Color[];
  onSubmit: (data: any) => void;
  selectedVariant?: Variant | null;
  onCancelEdit?: () => void;
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const sizeSchema = z.object({
  size: z.string().min(1, 'Size is required'),
  stock: z.number().min(0, 'Stock cannot be negative'),
});

const variantSchema = z.object({
  color: z.string().min(1, 'Color is required'),
  sizes: z.array(sizeSchema).min(1, 'At least one size is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
});

export function VariantForm({ colors, onSubmit, selectedVariant, onCancelEdit }: VariantFormProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    resolver: zodResolver(variantSchema),
    defaultValues: selectedVariant || {
      color: '',
      sizes: [{ size: '', stock: 0 }],
      images: [],
    },
  });

  // Reset form when selectedVariant changes
  useEffect(() => {
    if (selectedVariant) {
      form.reset(selectedVariant);
      setIsEditing(true);
    } else {
      form.reset({
        color: '',
        sizes: [{ size: '', stock: 0 }],
        images: [],
      });
      setIsEditing(false);
    }
  }, [selectedVariant, form]);

  const handleSubmit = (data: any) => {
    onSubmit(data);
    if (!selectedVariant) {
      form.reset({
        color: '',
        sizes: [{ size: '', stock: 0 }],
        images: [],
      });
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
    onCancelEdit?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {isEditing ? 'Edit Variant' : 'Add New Variant'}
          </h3>
          {isEditing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Edit
            </Button>
          )}
        </div>

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color._id} value={color._id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <div className="flex items-center justify-between mb-4">
            <FormLabel>Sizes & Stock</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentSizes = form.getValues('sizes');
                form.setValue('sizes', [...currentSizes, { size: '', stock: 0 }]);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Size
            </Button>
          </div>
          <div className="space-y-4">
            {form.watch('sizes')?.map((_, index) => (
              <div key={index} className="flex gap-4 items-start">
                <FormField
                  control={form.control}
                  name={`sizes.${index}.size`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SIZES.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`sizes.${index}.stock`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Stock"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const sizes = form.getValues('sizes');
                    form.setValue('sizes', sizes.filter((_, i) => i !== index));
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {isEditing ? 'Update Variant' : 'Add Variant'}
        </Button>
      </form>
    </Form>
  );
} 