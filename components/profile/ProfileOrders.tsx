"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    product: {
      name: string;
      variants: Array<{
        images: string[];
      }>;
    };
    quantity: number;
  }>;
}

export function ProfileOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No orders yet</h3>
        <p className="text-muted-foreground mb-4">
          When you place an order, it will appear here
        </p>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div
          key={order._id}
          className="border rounded-lg p-4 space-y-4"
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <p className="font-medium">Order #{order.orderNumber}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">{order.status}</Badge>
              <p className="font-medium">{formatPrice(order.total)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {order.items.map((item, index) => (
              <div key={index} className="relative aspect-square">
                <Image
                  src={item.product.variants[0].images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover rounded-md"
                />
                {item.quantity > 1 && (
                  <Badge
                    className="absolute top-2 right-2"
                    variant="secondary"
                  >
                    x{item.quantity}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <Skeleton key={j} className="aspect-square rounded-md" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 