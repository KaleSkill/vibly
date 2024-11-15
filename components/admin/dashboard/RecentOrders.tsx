'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const recentOrders = [
  {
    id: "ORD001",
    customer: "John Doe",
    status: "delivered",
    total: "$250.00",
    date: new Date("2024-03-14"),
  },
  {
    id: "ORD002",
    customer: "Jane Smith",
    status: "pending",
    total: "$150.00",
    date: new Date("2024-03-13"),
  },
  {
    id: "ORD003",
    customer: "Bob Johnson",
    status: "processing",
    total: "$350.00",
    date: new Date("2024-03-12"),
  },
  {
    id: "ORD004",
    customer: "Alice Brown",
    status: "shipped",
    total: "$450.00",
    date: new Date("2024-03-11"),
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
};

export function RecentOrders() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={statusColors[order.status]}
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>{order.total}</TableCell>
              <TableCell>{format(order.date, 'MMM d, yyyy')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 