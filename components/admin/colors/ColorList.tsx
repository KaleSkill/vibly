'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { EditColorForm } from './EditColorForm';
import { Skeleton } from "@/components/ui/skeleton";

interface Color {
  _id: string;
  name: string;
  value: string;
  createdAt: string;
}

export function ColorList() {
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchColors = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/colors');
      const data = await response.json();
      setColors(data);
    } catch (error) {
      console.error('Error fetching colors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch colors",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchColors();

    // Add event listener for refresh
    const handleRefresh = () => fetchColors();
    document.addEventListener('refreshColors', handleRefresh);

    return () => {
      document.removeEventListener('refreshColors', handleRefresh);
    };
  }, [fetchColors]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this color?')) return;

    try {
      const response = await fetch(`/api/admin/colors/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setColors(colors.filter(color => color._id !== id));
        router.refresh();
        toast({
          title: "Success",
          description: "Color deleted successfully",
        });
      }
    } catch (error) {
      console.error('Error deleting color:', error);
      toast({
        title: "Error",
        description: "Failed to delete color",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-4 w-12" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-28" />
              </TableHead>
              <TableHead className="text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="w-8 h-8 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Color</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {colors.map((color) => (
            <TableRow key={color._id}>
              <TableCell>
                <div 
                  className="w-8 h-8 rounded-full border shadow-sm"
                  style={{ backgroundColor: color.value }}
                />
              </TableCell>
              <TableCell className="font-medium">{color.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-sm font-mono">{color.value}</span>
                </div>
              </TableCell>
              <TableCell>
                {new Date(color.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <EditColorForm
                      color={color}
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      }
                      onSuccess={() => {
                        fetchColors();
                        toast({
                          title: "Success",
                          description: "Color updated successfully",
                        });
                      }}
                    />
                    <DropdownMenuItem
                      onClick={() => handleDelete(color._id)}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 