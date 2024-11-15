'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { BannerForm } from './BannerForm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Banner {
  _id: string;
  image: string;
  position: number;
  active: boolean;
}

export function BannerList() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/banner');
      if (!response.ok) throw new Error('Failed to fetch banners');
      const data = await response.json();
      setBanners(data.sort((a: Banner, b: Banner) => a.position - b.position));
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({
        title: "Error",
        description: "Failed to fetch banners",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handlePositionChange = async (bannerId: string, newPosition: string) => {
    try {
      const response = await fetch(`/api/admin/banner/${bannerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: parseInt(newPosition) }),
      });

      if (!response.ok) throw new Error('Failed to update banner position');

      toast({
        title: "Success",
        description: "Banner position updated successfully",
      });
      fetchBanners();
    } catch (error) {
      console.error('Error updating banner position:', error);
      toast({
        title: "Error",
        description: "Failed to update banner position",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(`/api/admin/banner/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete banner');

      toast({
        title: "Success",
        description: "Banner deleted successfully",
      });
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/banner/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });

      if (!response.ok) throw new Error('Failed to update banner status');

      toast({
        title: "Success",
        description: "Banner status updated successfully",
      });
      fetchBanners();
    } catch (error) {
      console.error('Error updating banner status:', error);
      toast({
        title: "Error",
        description: "Failed to update banner status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {banners.length < 10 && (
          <BannerForm onSuccess={fetchBanners}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Banner
            </Button>
          </BannerForm>
        )}
      </div>

      <div className="grid gap-6">
        {banners.map((banner) => (
          <Card key={banner._id} className="p-4">
            <div className="flex gap-6">
              <div className="relative w-[300px] h-[100px] rounded-lg overflow-hidden">
                <Image
                  src={banner.image}
                  alt={`Banner position ${banner.position}`}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Position:</span>
                  <Select
                    value={banner.position.toString()}
                    onValueChange={(value) => handlePositionChange(banner._id, value)}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((pos) => (
                        <SelectItem 
                          key={pos} 
                          value={pos.toString()}
                          disabled={banners.some(b => b.position === pos && b._id !== banner._id)}
                        >
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Switch
                    checked={banner.active}
                    onCheckedChange={(checked) => handleToggleActive(banner._id, checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {banner.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(banner._id)}
                  className="ml-auto"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {banners.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-muted-foreground">No banners found</p>
          </div>
        )}
      </div>
    </div>
  );
} 