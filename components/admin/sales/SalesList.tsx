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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit, Trash, Power, PowerOff } from "lucide-react";
import { CreateSaleDialog } from './CreateSaleDialog';
import { EditSaleDialog } from './EditSaleDialog';

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

export function SalesList() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const { toast } = useToast();

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/admin/sales');
      const data = await response.json();
      setSales(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sales",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleStatusChange = async (saleId: string, newStatus: 'active' | 'inactive') => {
    try {
      const response = await fetch(`/api/admin/sales/${saleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update sale status');

      toast({
        title: "Success",
        description: `Sale ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      });

      fetchSales();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sale status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (saleId: string) => {
    if (!confirm('Are you sure you want to delete this sale?')) return;

    try {
      const response = await fetch(`/api/admin/sales/${saleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete sale');

      toast({
        title: "Success",
        description: "Sale deleted successfully",
      });

      fetchSales();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sale",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Sales</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Sale
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale._id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{sale.name}</div>
                    {sale.description && (
                      <div className="text-sm text-muted-foreground">
                        {sale.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {sale.products.map((item) => (
                      <div key={item.product._id} className="text-sm">
                        {item.product.name} - {formatPrice(item.salePrice)} 
                        ({item.discountPercent}% off)
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={sale.status === 'active' ? "success" : "secondary"}
                  >
                    {sale.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSale(sale)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(
                        sale._id, 
                        sale.status === 'active' ? 'inactive' : 'active'
                      )}
                    >
                      {sale.status === 'active' ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(sale._id)}
                      className="text-red-600"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateSaleDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchSales}
      />

      {selectedSale && (
        <EditSaleDialog
          sale={selectedSale}
          open={!!selectedSale}
          onOpenChange={(open) => !open && setSelectedSale(null)}
          onSuccess={() => {
            setSelectedSale(null);
            fetchSales();
          }}
        />
      )}
    </div>
  );
} 