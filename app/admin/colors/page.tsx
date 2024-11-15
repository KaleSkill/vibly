import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ColorList } from '@/components/admin/colors/ColorList';
import { ColorForm } from '@/components/admin/colors/ColorForm';

export default async function ColorsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Colors</h2>
          <p className="text-muted-foreground">
            Manage product colors
          </p>
        </div>
        <ColorForm />
      </div>
      <ColorList />
    </div>
  );
} 