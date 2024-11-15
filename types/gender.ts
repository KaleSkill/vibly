export interface Gender {
  _id: string;
  name: 'male' | 'female' | 'kids' | 'unisex';
  slug: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
} 