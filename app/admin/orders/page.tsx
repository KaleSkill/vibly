import { AdminOrders } from '@/components/admin/orders/AdminOrders';
import { OrderList } from '@/components/admin/orders/OrderList';

export default function OrdersPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
      </div>
      {/* <AdminOrders /> */}
      <OrderList />
    </div>
  );
} 