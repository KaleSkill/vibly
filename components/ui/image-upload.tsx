'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const onUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      onChange([data.url]);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }, [onChange]);

  return (
    <div>
      {value.length === 0 && (
        <div className="mb-4 flex items-center justify-center w-full">
          <label className="w-full cursor-pointer">
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              <div className="text-sm">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </div>
              <div className="text-xs text-muted-foreground">
                Recommended: 1920x600 pixels
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onUpload}
            />
          </label>
        </div>
      )}
      {value.map((url) => (
        <div key={url} className="relative aspect-[16/5] mt-4">
          <div className="absolute top-2 right-2 z-10">
            <Button
              type="button"
              onClick={onRemove}
              variant="destructive"
              size="icon"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Image
            fill
            src={url}
            alt="Banner"
            className="object-cover rounded-lg"
          />
        </div>
      ))}
    </div>
  );
} 