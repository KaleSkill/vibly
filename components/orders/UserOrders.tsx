'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order } from '@/types';

const statusMap = {
  'pending': { label: 'Order Placed', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  'confirmed': { label: 'Confirmed', icon: Package, color: 'bg-blue-100 text-blue-800' },
  'shipped': { label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-800' },
  'delivered': { label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  'cancelled': { label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800' },
};

export function UserOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-gray-50">
        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">No orders yet</h3>
        <p className="text-muted-foreground mt-1">When you place orders, they will appear here.</p>
        <Button asChild className="mt-4">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="space-y-4">
        {orders.map((order) => {
          const StatusIcon = statusMap[order.status].icon;
          
          return (
            <AccordionItem
              key={order._id}
              value={order._id}
              className="border rounded-lg px-6"
            >
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Order #{order._id.slice(-8)}</span>
                      <Badge 
                        variant="secondary"
                        className={cn(statusMap[order.status].color)}
                      >
                        {statusMap[order.status].label}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Placed on {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(order.total)}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-6">
                  {/* Order Items */}
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.product._id} className="flex gap-4">
                        <div className="relative aspect-square h-24 w-24 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={item.product.variants[0].images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          <div className="text-sm text-muted-foreground mt-1">
                            Size: {item.variant.size} • Color: {item.variant.colorName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </div>
                          <div className="mt-1 font-medium">
                            {formatPrice(item.product.discountedPrice * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <div className="text-sm text-muted-foreground">
                      <p>{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.streetAddress}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                      </p>
                      <p>Phone: {order.shippingAddress.phoneNumber}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Payment Information</h4>
                    <div className="text-sm text-muted-foreground">
                      <p>Payment Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                      <p>Order Total: {formatPrice(order.total)}</p>
                    </div>
                  </div>

                  {/* Cancel Button - Show only for pending orders */}
                  {order.status === 'pending' && (
                    <div className="border-t pt-4">
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={async () => {
                          if (!confirm('Are you sure you want to cancel this order?')) return;
                          
                          try {
                            const response = await fetch(`/api/orders/${order._id}/cancel`, {
                              method: 'PATCH'
                            });
                            
                            if (!response.ok) throw new Error('Failed to cancel order');
                            
                            toast({
                              title: "Success",
                              description: "Order cancelled successfully",
                            });
                            
                            fetchOrders();
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to cancel order",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Cancel Order
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
} 