import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { CreateProductForm } from '@/components/admin/products/CreateProductForm';

export default async function AddProductPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Add New Product</h2>
        <p className="text-muted-foreground">
          Create a new product with variants and details
        </p>
      </div>
      <CreateProductForm />
    </div>
  );
} 