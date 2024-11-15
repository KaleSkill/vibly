import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ProductView } from '@/components/admin/products/ProductView';

interface Props {
  params: {
    id: string;
  };
}

export default async function ProductViewPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ProductView productId={params.id} />
    </div>
  );
} 