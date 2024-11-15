import { Category } from './category';
import { Gender } from './gender';

export interface ProductVariant {
  color: string;
  colorName: string;
  images: string[];
  sizes: {
    size: string;
    stock: number;
  }[];
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: Category;
  gender: Gender;
  variants: ProductVariant[];
  featured: boolean;
  paymentOptions: {
    cod: boolean;
    online: boolean;
  };
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
} 