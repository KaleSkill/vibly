'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (url: string) => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 5MB`);
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image`);
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();
        return data.secure_url;
      });

      const urls = await Promise.all(uploadPromises);
      onChange([...value, ...urls]);
      
      toast({
        title: "Success",
        description: "Images uploaded successfully",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  }, [onChange, value, toast]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => document.getElementById('image-input')?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <ImagePlus className="h-4 w-4 mr-2" />
          )}
          {isUploading ? 'Uploading...' : 'Upload Images'}
        </Button>
        <input
          id="image-input"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onUpload}
          disabled={isUploading}
        />
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden group">
              <Image
                src={url}
                alt="Upload"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => onRemove(url)}
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