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
        <BannerList />
    </div>
  );
} 