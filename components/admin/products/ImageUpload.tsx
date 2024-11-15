'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ImagePlus, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onChange: (value: string[]) => void;
  value: string[];
}

export function ImageUpload({ onChange, value }: ImageUploadProps) {
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      // Show loading toast
      toast({
        title: "Uploading...",
        description: "Please wait while we upload your images",
      });

      // Create FormData
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append('files', file);
      });

      // Upload files
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      // Update form with new URLs
      onChange([...value, ...data.urls]);

      toast({
        title: "Success",
        description: "Images uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    }
  }, [onChange, value, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5242880, // 5MB
    multiple: true
  });

  const onRemove = useCallback((url: string) => {
    onChange(value.filter((current) => current !== url));
  }, [onChange, value]);

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className={cn(
            "h-10 w-10 transition-colors",
            isDragActive ? "text-primary" : "text-gray-400"
          )} />
          {isDragActive ? (
            <p className="text-primary font-medium">Drop the files here...</p>
          ) : (
            <>
              <p className="font-medium">Drag & drop images here</p>
              <p className="text-sm text-muted-foreground">
                or click to select files
              </p>
            </>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Supported formats: JPEG, PNG, WebP (up to 5MB)
          </p>
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden">
              <Image
                fill
                src={url}
                alt="Product image"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  onClick={() => onRemove(url)}
                  variant="destructive"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 