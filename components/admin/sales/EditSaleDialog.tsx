'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Sale {
  _id: string;
  name: string;
  description: string;
  products: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
    };
    salePrice: number;
    discountPercent: number;
    discountedPrice: number;
  }>;
  status: 'active' | 'inactive';
}

interface EditSaleDialogProps {
  sale: Sale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditSaleDialog({ sale, open, onOpenChange, onSuccess }: EditSaleDialogProps) {
  const [name, setName] = useState(sale.name);
  const [description, setDescription] = useState(sale.description);
  const [products, setProducts] = useState(sale.products);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setName(sale.name);
    setDescription(sale.description);
    setProducts(sale.products);
  }, [sale]);

  const handleSalePriceChange = (productId: string, price: number) => {
    setProducts(products.map(item => {
      if (item.product._id === productId) {
        const discountPercent = Math.round(((item.product.price - price) / item.product.price) * 100);
        const discountedPrice = price;
        return {
          ...item,
          salePrice: price,
          discountPercent,
          discountedPrice
        };
      }
      return item;
    }));
  };

  const handleDiscountChange = (productId: string, discount: number) => {
    setProducts(products.map(item => {
      if (item.product._id === productId) {
        const salePrice = item.product.price;
        const discountedPrice = Math.round(salePrice - (salePrice * (discount / 100)));
        return {
          ...item,
          salePrice,
          discountPercent: discount,
          discountedPrice
        };
      }
      return item;
    }));
  };

  const handleSubmit = async () => {
    if (!name) {
      toast({
        title: "Error",
        description: "Sale name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/sales/${sale._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          products: products.map(item => ({
            product: item.product._id,
            salePrice: item.salePrice,
            discountPercent: item.discountPercent,
            discountedPrice: item.discountedPrice
          }))
        }),
      });

      if (!response.ok) throw new Error('Failed to update sale');

      toast({
        title: "Success",
        description: "Sale updated successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sale",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Sale Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Summer Sale"
            />
          </div>

          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter sale description..."
            />
          </div>

          <div className="space-y-4">
            <Label>Products</Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Original Price</TableHead>
                  <TableHead>Sale Price</TableHead>
                  <TableHead>Discount %</TableHead>
                  <TableHead>Final Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((item) => (
                  <TableRow key={item.product._id}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>{formatPrice(item.product.price)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.salePrice}
                        onChange={(e) => handleSalePriceChange(item.product._id, Number(e.target.value))}
                        className="w-24"
                        min={0}
                        max={item.product.price}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.discountPercent}
                        onChange={(e) => handleDiscountChange(item.product._id, Number(e.target.value))}
                        className="w-20"
                        min={0}
                        max={100}
                      />
                    </TableCell>
                    <TableCell>{formatPrice(item.discountedPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 