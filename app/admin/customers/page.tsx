import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { CustomerList } from '@/components/admin/customers/CustomerList';

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
            <p className="text-muted-foreground mt-1">
              Manage your customers
            </p>
          </div>
        </div>
        <CustomerList />
      </div>
    </div>
  );
} 