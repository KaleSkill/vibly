'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Eye, MoreHorizontal, Archive, CheckCircle } from "lucide-react";
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  _id: string;
  name: string;
  price: number;
  status: 'active' | 'inactive';
  category: {
    _id: string;
    name: string;
  };
  variants: Array<{
    images: string[];
  }>;
}

interface SortOption {
  value: string;
  label: string;
}

const sortOptions: SortOption[] = [
  { value: "default", label: "Default" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "price-asc", label: "Price (Low to High)" },
  { value: "price-desc", label: "Price (High to Low)" },
];

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    let result = [...products];

    if (statusFilter !== 'all') {
      result = result.filter(product => product.status === statusFilter);
    }

    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter(product => 
        product.category._id === categoryFilter
      );
      if (result.length === 0) {
        setFilteredProducts([]);
        return;
      }
    }

    if (result.length > 0) {
      if (searchQuery) {
        result = result.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (sortBy && sortBy !== 'default') {
        const [field, direction] = sortBy.split('-');
        result.sort((a, b) => {
          if (field === 'name') {
            return direction === 'asc' 
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          } else if (field === 'price') {
            return direction === 'asc'
              ? a.price - b.price
              : b.price - a.price;
          }
          return 0;
        });
      }
    }

    setFilteredProducts(result);
  }, [products, searchQuery, sortBy, categoryFilter, statusFilter]);

  const displayProducts = categoryFilter !== 'all' ? filteredProducts : 
    (filteredProducts.length > 0 ? filteredProducts : products);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      // Refresh the list
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleStatusChange = async (productId: string, newStatus: 'active' | 'inactive') => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast({
        title: "Success",
        description: `Product ${newStatus === 'active' ? 'activated' : 'archived'} successfully`,
      });

      // Refresh the products list
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        {/* Filters Skeleton */}
        <div className="p-4 space-y-4 border-b">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-[300px]" /> {/* Search */}
            <Skeleton className="h-10 w-[180px]" /> {/* Category Filter */}
            <Skeleton className="h-10 w-[180px]" /> {/* Sort */}
            <Skeleton className="h-10 w-[180px]" /> {/* Status Filter */}
          </div>
        </div>

        {/* Table Skeleton */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-4 w-12" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-32" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-16" />
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
                  <Skeleton className="h-12 w-12 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[250px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16 rounded-full" />
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
      <div className="p-4 space-y-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
            
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {displayProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No products found
            {statusFilter !== 'all' && <> with status &quot;{statusFilter}&quot;</>}
            {categoryFilter !== 'all' && categories?.find(c => c._id === categoryFilter) && 
              <> in {categories?.find(c => c._id === categoryFilter)?.name}</>
            }
            {searchQuery && <> matching &quot;{searchQuery}&quot;</>}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setSortBy('default');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayProducts.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  {product.variants[0]?.images[0] && (
                    <div className="relative h-12 w-12">
                      <Image
                        src={product.variants[0].images[0]}
                        alt={product.name}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell>
                  <Badge
                    variant={product.status === 'active' ? "default" : "secondary"}
                    className={cn(
                      "px-2 py-1",
                      product.status === 'active' && "bg-green-100 text-green-800",
                      product.status === 'inactive' && "bg-yellow-100 text-yellow-800"
                    )}
                  >
                    {product.status === 'active' ? 'Active' : 'Archived'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/products/view/${product._id}`)}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/products/edit/${product._id}`)}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Product
                      </DropdownMenuItem>
                      {product.status === 'active' ? (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(product._id, 'inactive')}
                          className="cursor-pointer"
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(product._id, 'active')}
                          className="cursor-pointer"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDelete(product._id)}
                        className="cursor-pointer text-red-600 focus:text-red-600"
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
      )}

     
    </div>
  );
} 