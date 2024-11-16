export interface Product {
  _id: string;
  name: string;
  price: number;
  discountedPrice: number;
  discountPercent: number;
  variants: Array<{
    color: {
      _id: string;
      name: string;
      value: string;
    };
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

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      discountedPrice: number;
      discountPercent: number;
      variants: Array<{
        color: {
          _id: string;
          name: string;
          value: string;
        };
        sizes: Array<{
          size: string;
          stock: number;
        }>;
        images: string[];
      }>;
    };
    variant: {
      color: string;
      size: string;
    };
    quantity: number;
  }>;
  shippingAddress: {
    fullName: string;
    streetAddress: string;
    city: string;
    state: string;
    pincode: string;
    phoneNumber: string;
  };
  total: number;
  status: OrderStatus;
  paymentMethod: 'cod' | 'online';
  createdAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'; 