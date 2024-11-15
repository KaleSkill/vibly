export interface Banner {
  _id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  position: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
} 