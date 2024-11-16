'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Eye, MoreHorizontal, Search, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { OrderDetailsDialog } from './OrderDetailsDialog';
import { Order, OrderStatus } from '@/types';
import { Skeleton } from "@/components/ui/skeleton";

const orderStatuses: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500' },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-500' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' }
];

const paymentMethods = [
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'online', label: 'Online Payment' }
];

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let result = [...orders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order._id.toLowerCase().includes(query) ||
        order.user.email.toLowerCase().includes(query) ||
        order.shippingAddress.fullName.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Payment method filter
    if (paymentFilter && paymentFilter !== 'all') {
      result = result.filter(order => order.paymentMethod === paymentFilter);
    }

    setFilteredOrders(result);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPaymentFilter('all');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Skeleton for Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 w-full sm:w-[300px]" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>

        {/* Skeleton for Table */}
        <div className="rounded-md border">
          <div className="bg-white">
            {/* Table Header Skeleton */}
            <div className="grid grid-cols-7 border-b">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="p-4">
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>

            {/* Table Rows Skeleton */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-7 border-b">
                {/* Order ID */}
                <div className="p-4">
                  <Skeleton className="h-4 w-16" />
                </div>
                {/* Customer */}
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                {/* Total */}
                <div className="p-4">
                  <Skeleton className="h-4 w-20" />
                </div>
                {/* Status */}
                <div className="p-4">
                  <Skeleton className="h-4 w-24" />
                </div>
                {/* Payment */}
                <div className="p-4">
                  <Skeleton className="h-4 w-20" />
                </div>
                {/* Date */}
                <div className="p-4">
                  <Skeleton className="h-4 w-24" />
                </div>
                {/* Actions */}
                <div className="p-4 flex justify-end">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders By OrderID....."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {orderStatuses.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            {paymentMethods.map(method => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(searchQuery || statusFilter !== 'all' || paymentFilter !== 'all') && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={clearFilters}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Orders Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">
                    #{order._id.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.shippingAddress.fullName}</div>
                      <div className="text-sm text-muted-foreground">{order.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        orderStatuses.find(s => s.value === order.status)?.color
                      }`} />
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{order.paymentMethod}</span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <OrderDetailsDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderDeleted={fetchOrders}
      />
    </div>
  );
} 