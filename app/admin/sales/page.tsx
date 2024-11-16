import { SalesList } from "@/components/admin/sales/SalesList";

export default function SalesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Sales</h2>
      </div>
      <SalesList />
    </div>
  );
} 