import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { CreateProductForm } from '@/components/admin/products/CreateProductForm';
import connectDB from '@/lib/db';
import Product from '@/models/product';

interface Props {
  params: {
    id: string;
  };
}

async function getProduct(id: string) {
  try {
    await connectDB();
    const product = await Product.findById(id)
      .populate('category')
      .lean();
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function EditProductPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  const product = await getProduct(params.id);

  if (!product) {
    redirect('/admin/products');
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
        <p className="text-muted-foreground">
          Update product details and variants
        </p>
      </div>
      <CreateProductForm initialData={product} isEditing />
    </div>
  );
} 