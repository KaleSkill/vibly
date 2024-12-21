import { ProductDetails } from "@/components/products/ProductDetails";
interface Props {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: Props) {
  return (
    <div className="min-h-screen py-10">
      <ProductDetails productId={params.id} />{" "}
    </div>
  );
}
