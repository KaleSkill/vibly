import { ProductDetails } from '@/components/products/ProductDetails';
import { Suspense } from 'react';

interface Props {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: Props) {
  return (
    <div className="min-h-screen py-10">
      <Suspense fallback={<div>Loading...</div>}>
        <ProductDetails productId={params.id} />
      </Suspense>
    </div>
  );
} 