import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { DashboardStats } from '@/components/admin/dashboard/DashboardStats';
import { RecentOrders } from '@/components/admin/dashboard/RecentOrders';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your store's performance
        </p>
      </div>
      <DashboardStats />
      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
        <RecentOrders />
      </div>
    </div>
  );
} 