'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import { Order, OrderStatus } from "@/types";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface OrderDetailsProps {
  order: Order | null;
  onClose: () => void;
  onOrderDeleted: () => void;
}

const statusColors: Record<OrderStatus, string> = {
  pending: "default",
  confirmed: "secondary",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
} as const;

export function OrderDetailsDialog({ order, onClose, onOrderDeleted }: OrderDetailsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  if (!order) return null;

  const handleDeleteOrder = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/orders/${order._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete order');

      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
      onClose();
      onOrderDeleted();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={!!order} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle>Order Details #{order._id.slice(-6).toUpperCase()}</DialogTitle>
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Order
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Order Information</h3>
                <div className="text-sm space-y-1">
                  <p>Date: {format(new Date(order.createdAt), 'PPP')}</p>
                  <p>Status: <Badge variant={statusColors[order.status]}>{order.status}</Badge></p>
                  <p>Payment: <Badge variant="outline">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</Badge></p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Customer Information</h3>
                <div className="text-sm space-y-1">
                  <p>Name: {order.user.name}</p>
                  <p>Email: {order.user.email}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="font-medium mb-2">Shipping Address</h3>
              <div className="text-sm space-y-1">
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.streetAddress}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                <p>Phone: {order.shippingAddress.phoneNumber}</p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-medium mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.product._id} className="flex gap-4 border-b pb-4">
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.product.variants[0].images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Size: {item.variant.size} • Quantity: {item.quantity}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        {formatPrice(item.product.discountedPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-medium text-base mt-4">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 