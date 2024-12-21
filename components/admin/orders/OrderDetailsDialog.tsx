"use client";

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
import {
  Package,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Truck,
  User,
  FileDown,
  Trash2,
  Loader2,
} from "lucide-react";
import { useState } from "react";
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
import jsPDF from "jspdf";
import "jspdf-autotable";

interface OrderDetailsProps {
  order: Order | null;
  onClose: () => void;
  onOrderDeleted?: () => void;
}

const statusColors: Record<OrderStatus, string> = {
  pending: "default",
  confirmed: "secondary",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
} as const;

export function OrderDetailsDialog({
  order,
  onClose,
  onOrderDeleted,
}: OrderDetailsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  if (!order) return null;

  const handleDeleteOrder = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/orders/${order._id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete order");

      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
      onClose();
      onOrderDeleted?.();
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

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF();

      // Add Header
      doc.setFontSize(20);
      doc.text("Order Details", 20, 20);
      doc.setFontSize(12);
      doc.text(`Order #${order._id.slice(-6).toUpperCase()}`, 20, 30);
      doc.text(`Date: ${format(new Date(order.createdAt), "PPP")}`, 20, 40);

      // Add Customer Info
      doc.text("Customer Information:", 20, 60);
      doc.text(`Name: ${order.shippingAddress.fullName}`, 20, 70);
      doc.text(`Email: ${order.user.email}`, 20, 80);
      doc.text(`Phone: ${order.shippingAddress.phoneNumber}`, 20, 90);

      // Add Shipping Address
      doc.text("Shipping Address:", 20, 110);
      doc.text(order.shippingAddress.streetAddress, 20, 120);
      doc.text(
        `${order.shippingAddress.city}, ${order.shippingAddress.state}`,
        20,
        130
      );
      doc.text(order.shippingAddress.pincode, 20, 140);

      // Add Order Items
      doc.text("Order Items:", 20, 160);
      const tableData = order.items.map((item) => [
        item.product.name,
        item.variant.color.value,
        item.variant.size,
        item.quantity.toString(),
        formatPrice(item.product.saleType?item.product.discountedSalePrice:item.product.discountedPrice * item.quantity),
      ]);

      (doc as any).autoTable({
        startY: 170,
        head: [["Product", "Color", "Size", "Qty", "Price"]],
        body: tableData,
      });

      // Add Total
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.text(`Total Amount: ${formatPrice(order.total)}`, 20, finalY);

      // Save PDF
      doc.save(`order-${order._id.slice(-6).toUpperCase()}.pdf`);

      toast({
        title: "Success",
        description: "Order details exported to PDF",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Dialog open={!!order} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order #{order._id.slice(-6).toUpperCase()}
                </DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(order.createdAt), "PPP")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4" />
                  )}
                  Export PDF
                </Button>
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
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Status and Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Order Status
                </h3>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={statusColors[order.status]}
                    className="capitalize"
                  >
                    {order.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">•</span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span className="capitalize">{order.paymentMethod}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-lg border">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {order.user.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {order.shippingAddress.phoneNumber}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {order.shippingAddress.fullName}
                      </p>
                      <p>{order.shippingAddress.streetAddress}</p>
                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Items ({order.items.length})
              </h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex gap-4 p-4 border rounded-lg bg-gray-50/50"
                  >
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-white border">
                      <Image
                        src={item.product.variants[0].images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Color: {item.variant.colorName}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Size: {item.variant.size}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Qty: {item.quantity}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="text-sm font-medium">
                          {formatPrice(
                            item.product.saleType?item.product.discountedSalePrice:item.product.discountedPrice * item.quantity
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatPrice(item.product.saleType?item.product.salePrice:item.product.discountedPrice)} per item
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <div className="bg-gray-50/50 p-4 rounded-lg border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between font-medium text-base pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              order and remove all associated data.
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
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
