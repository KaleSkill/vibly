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
import { Checkbox } from "@/components/ui/checkbox";

interface Product {
  _id: string;
  name: string;
  price: number;
  status: 'active';
}

interface CreateSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateSaleDialog({ open, onOpenChange, onSuccess }: CreateSaleDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [salePrices, setSalePrices] = useState<Record<string, number>>({});
  const [saleDiscounts, setSaleDiscounts] = useState<Record<string, number>>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Calculate final price after discount
  const calculateFinalPrice = (price: number, discount: number) => {
    return Math.round(price - (price * (discount / 100)));
  };

  // Handle sale price change (independent of original price)
  const handleSalePriceChange = (productId: string, price: number) => {
    setSalePrices({ ...salePrices, [productId]: price });
    
    // Recalculate final price if there's a discount
    const currentDiscount = saleDiscounts[productId] || 0;
    if (currentDiscount > 0) {
      const finalPrice = calculateFinalPrice(price, currentDiscount);
      // Store the original sale price, not the discounted one
      setSalePrices(prev => ({ ...prev, [productId]: price }));
    }
  };

  // Handle discount change
  const handleDiscountChange = (productId: string, discount: number) => {
    setSaleDiscounts({ ...saleDiscounts, [productId]: discount });
    
    // Calculate final price based on current sale price
    const currentSalePrice = salePrices[productId];
    if (currentSalePrice) {
      // Don't update the sale price, only store the discount
      setSaleDiscounts(prev => ({ ...prev, [productId]: discount }));
    }
  };

  // Fetch available products
  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      
      // Filter only active products that are not already on sale
      const availableProducts = data.filter((p: Product) => 
        p.status === 'active'
      );
      
      setProducts(availableProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!name || selectedProducts.length === 0 || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate sale prices
    const invalidProducts = selectedProducts.filter(productId => !salePrices[productId]);
    if (invalidProducts.length > 0) {
      toast({
        title: "Error",
        description: "Please set sale prices for all selected products",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const saleProducts = selectedProducts.map(productId => {
        const salePrice = salePrices[productId];
        const salePriceDiscount = saleDiscounts[productId] || 0;
        const discountedSalePrice = calculateFinalPrice(salePrice, salePriceDiscount);

        return {
          product: productId,
          salePrice: salePrice, // Original sale price
          salePriceDiscount: salePriceDiscount,
          discountedSalePrice: discountedSalePrice // Final price after discount
        };
      });

      const response = await fetch('/api/admin/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          products: saleProducts,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          status: 'active'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create sale');
      }

      toast({
        title: "Success",
        description: "Sale created successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create sale",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Sale</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 py-4 px-2">
            {/* Basic Info */}
            <div className="space-y-4">
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

              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </div>
              </div>
            </div>

            {/* Products Table with sticky header */}
            <div className="space-y-4">
              <Label>Select Products and Set Sale Prices</Label>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="w-[50px]">Select</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Sale Price</TableHead>
                      <TableHead>Sale Discount %</TableHead>
                      <TableHead>Final Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="overflow-y-auto">
                    {products.map((product) => {
                      const isSelected = selectedProducts.includes(product._id);
                      const salePrice = salePrices[product._id] || 0;
                      const saleDiscount = saleDiscounts[product._id] || 0;
                      const finalPrice = saleDiscount > 0 ? calculateFinalPrice(salePrice, saleDiscount) : salePrice;

                      return (
                        <TableRow key={product._id}>
                          <TableCell>
                            <Checkbox 
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedProducts([...selectedProducts, product._id]);
                                  // Initialize with zero instead of product price
                                  setSalePrices(prev => ({ ...prev, [product._id]: 0 }));
                                } else {
                                  setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                                  const newPrices = { ...salePrices };
                                  const newDiscounts = { ...saleDiscounts };
                                  delete newPrices[product._id];
                                  delete newDiscounts[product._id];
                                  setSalePrices(newPrices);
                                  setSaleDiscounts(newDiscounts);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={salePrice || ''}
                              onChange={(e) => handleSalePriceChange(product._id, Number(e.target.value))}
                              className="w-24"
                              min={0}
                              placeholder="Enter price"
                              disabled={!isSelected}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={saleDiscount || ''}
                              onChange={(e) => handleDiscountChange(product._id, Number(e.target.value))}
                              className="w-20"
                              min={0}
                              max={100}
                              placeholder="%"
                              disabled={!isSelected}
                            />
                          </TableCell>
                          <TableCell>{formatPrice(finalPrice)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed footer */}
        <div className="flex justify-end gap-4 pt-4 border-t mt-auto">
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
            Create Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 