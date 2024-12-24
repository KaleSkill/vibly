'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash, GripVertical, Save, X, ImagePlus, Loader2, Pencil } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';

interface BannerImage {
  public_id: string;
  secure_url: string;
  isTemp?: boolean;
  file?: File;
}

interface Banner {
  _id: string;
  images: BannerImage[];
}

interface PendingChanges {
  toDelete: string[]; // public_ids to delete
}

export function BannerList() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({
    toDelete: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchBanner = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/banner');
      if (!response.ok) throw new Error('Failed to fetch banner');
      const data = await response.json();
      console.log(data)
      setBanner(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  const handleDragEnd = (result: any) => {
    if (!result.destination || !isEditMode || !banner) return;

    const items = Array.from(banner.images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBanner({ ...banner, images: items });
  };

  const handleDelete = (publicId: string) => {
    if (!isEditMode || !banner) return;

    // Add to pending deletions if it's not a temp image
    if (!banner.images.find(img => img.public_id === publicId)?.isTemp) {
      setPendingChanges(prev => ({
        ...prev,
        toDelete: [...prev.toDelete, publicId]
      }));
    }

    // Remove from banner images
    setBanner({
      ...banner,
      images: banner.images.filter(img => {
        if (img.public_id === publicId) {
          // Cleanup blob URL if it's a temp image
          if (img.isTemp && img.secure_url.startsWith('blob:')) {
            URL.revokeObjectURL(img.secure_url);
          }
          return false;
        }
        return true;
      })
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !banner) return;

    try {
      setIsUploading(true);
      const previewUrl = URL.createObjectURL(file);
      
      const tempImage: BannerImage = {
        public_id: `temp-${Date.now()}`,
        secure_url: previewUrl,
        isTemp: true,
        file
      };

      setBanner({
        ...banner,
        images: [...banner.images, tempImage]
      });

      toast({
        title: "Success",
        description: "Image added to pending changes",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!banner) return;

    try {
      setIsSaving(true);

      // Upload new images
      const updatedImages = await Promise.all(
        banner.images.map(async (img) => {
          if (!img.isTemp) return img;

          const formData = new FormData();
          formData.append('file', img.file!);
          
          const response = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) throw new Error('Failed to upload image');
          const data = await response.json();

          // Cleanup blob URL
          URL.revokeObjectURL(img.secure_url);

          return {
            public_id: data.public_id,
            secure_url: data.secure_url
          };
        })
      );

      // Delete removed images from Cloudinary
      if (pendingChanges.toDelete.length > 0) {
        await Promise.all(
          pendingChanges.toDelete.map(async (publicId) => {
            await fetch('/api/admin/upload', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ publicId }),
            });
          })
        );
      }

      // Save to database
      const response = await fetch('/api/admin/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: updatedImages
        }),
      });

      if (!response.ok) throw new Error('Failed to save changes');

      toast({
        title: "Success",
        description: "Changes saved successfully",
      });

      setIsEditMode(false);
      setPendingChanges({ toDelete: [] });
      await fetchBanner();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Cleanup any blob URLs
    banner?.images.forEach(img => {
      if (img.isTemp && img.secure_url.startsWith('blob:')) {
        URL.revokeObjectURL(img.secure_url);
      }
    });

    fetchBanner();
    setPendingChanges({ toDelete: [] });
    setIsEditMode(false);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Banner Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your homepage banner images here.
          </p>
        </div>
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditMode(true)} className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit Banners
            </Button>
          )}
        </div>
      </div>

      {isEditMode && (
        <Card>
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
            className="cursor-pointer block"
          >
            <div className="border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <div className="rounded-full bg-gray-50 p-3 mb-3">
                  <ImagePlus className="h-6 w-6 text-gray-400" />
                </div>
                <div className="text-sm text-center">
                  <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 1920x600 pixels
                  </p>
                </div>
                {isUploading && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>
            </div>
          </label>
        </Card>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="banners">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef} 
              className="space-y-3"
            >
              {banner?.images.map((image, index) => (
                <Draggable 
                  key={image.public_id} 
                  draggableId={image.public_id} 
                  index={index}
                  isDragDisabled={!isEditMode}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <Card className={cn(
                        "group relative overflow-hidden transition-all",
                        image.isTemp && "border-dashed border-2 border-primary/50",
                        isEditMode && "hover:shadow-md"
                      )}>
                        <div className="flex items-center justify-between p-3">
                          <div className='flex flex-row gap-2 w-full items-center'>
                          {isEditMode && (
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="relative w-1/2 aspect-[3/1] rounded-lg overflow-hidden bg-gray-50">
                            <Image
                              src={image.secure_url}
                              alt="Banner"
                              fill
                              className="object-cover"
                            />
                            {image.isTemp && (
                              <div className="absolute top-2 left-2">
                                <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full shadow-sm">
                                  Pending Upload
                                </span>
                              </div>
                            )}
                          </div>
                          </div>

                          {isEditMode && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(image.public_id)}
                              className="shrink-0 h-8 w-8"
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {banner?.images.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-2">
            <ImagePlus className="h-8 w-8 text-gray-400" />
            <h3 className="font-semibold mt-2">No banners yet</h3>
            <p className="text-sm text-muted-foreground">
              Add banners to showcase on your homepage
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>

      <div className="space-y-3">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 w-full">
                <Skeleton className="w-4 h-4" />
                <div className="relative w-1/2 aspect-[3/1]">
                  <Skeleton className="absolute inset-0 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}