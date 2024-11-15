'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const bannerSchema = z.object({
  image: z.string().min(1, 'Banner image is required'),
  position: z.number().min(1).max(10),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

interface BannerFormProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function BannerForm({ children, onSuccess }: BannerFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [availablePositions, setAvailablePositions] = useState<number[]>([]);
  const { toast } = useToast();

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      image: '',
      position: 1,
    },
  });

  const fetchAvailablePositions = async () => {
    try {
      const response = await fetch('/api/admin/banner');
      const banners = await response.json();
      const takenPositions = banners.map((banner: any) => banner.position);
      const available = Array.from({ length: 10 }, (_, i) => i + 1)
        .filter(pos => !takenPositions.includes(pos));
      setAvailablePositions(available);
      
      if (available.length > 0) {
        form.setValue('position', available[0]);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available positions",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchAvailablePositions();
    }
  }, [open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      form.setValue('image', data.secure_url);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(values: BannerFormValues) {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create banner');
      }

      toast({
        title: "Success",
        description: "Banner created successfully",
      });
      
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating banner:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create banner",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Banner</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Upload banner image and set its position (1-10)
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="banner-image"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                        <label 
                          htmlFor="banner-image" 
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <ImagePlus className="h-10 w-10 text-gray-400" />
                          <div className="text-sm">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Recommended: 1920x600 pixels (max 5MB)
                          </p>
                          {isUploading && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </label>
                      </div>

                      {field.value && (
                        <div className="relative aspect-[16/5]">
                          <Image
                            src={field.value}
                            alt="Banner preview"
                            fill
                            className="object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => form.setValue('image', '')}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availablePositions.map((pos) => (
                        <SelectItem 
                          key={pos} 
                          value={pos.toString()}
                        >
                          Position {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Available positions will be shown here
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="sticky bottom-0 bg-white pt-4">
              <Button 
                type="submit" 
                disabled={isLoading || isUploading} 
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload Banner
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 