import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { BannerList } from '@/components/admin/banner/BannerList';


export default async function BannerPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Banner Management</h2>
            <p className="text-muted-foreground mt-1">
              Upload and manage homepage banners (Maximum 10 banners allowed)
            </p>
          </div>
        </div>
        <BannerList />
      </div>
    </div>
  );
} 