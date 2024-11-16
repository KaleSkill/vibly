export interface Product {
  _id: string;
  name: string;
  price: number;
  discountedPrice: number;
  discountPercent: number;
  description?: string;
  specifications?: Record<string, string>;
  status: 'active' | 'inactive';
  createdAt: string;
  variants: Array<{
    color: {
      _id: string;
      name: string;
      value: string;
    };
    colorName: string;
    sizes: Array<{
      size: string;
      stock: number;
    }>;
    images: string[];
  }>;
}

export interface CartItem {
  _id: string;
  product: Product;
  variant: {
    color: string;
    size: string;
  };
  quantity: number;
}

export interface Address {
  _id: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
} 