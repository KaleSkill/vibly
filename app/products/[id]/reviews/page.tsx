import { ProductReviews } from "@/components/reviews/ProductReviews";

interface Props {
  params: {
    id: string;
  };
}

export default function ProductReviewsPage({ params }: Props) {
  return (
    <div className="min-h-screen py-10">
      <ProductReviews productId={params.id} />
    </div>
  );
} 