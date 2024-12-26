'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Order {
  _id: string;
  user: {
    name: string;
  };
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  paymentMethod: 'cod' | 'online';
}

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/admin/orders?limit=5');
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order._id}>
            <TableCell className="font-medium">
              {format(new Date(order.createdAt), 'dd MMM yyyy')}
            </TableCell>
            <TableCell>{order.user.name}</TableCell>
            <TableCell className="capitalize">{order.paymentMethod}</TableCell>
            <TableCell>
              <Badge
                variant={
                  order.status === 'delivered' 
                    ? 'default' 
                    : order.status === 'cancelled'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(order.total)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 