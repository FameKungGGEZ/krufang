export type ProductType = 'free' | 'paid';

export type CategoryIcon = 'worksheet' | 'slides' | 'cards' | 'decor' | 'template' | 'video';

export interface Category {
  id: string;
  name: string;
  color: string;
  ink: string;
  icon: CategoryIcon;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  type: ProductType;
  price: number;
  format: string;
  cover_type: 'image' | 'video';
  coverUrl: string;
  fileUrl: string | null;
  fileName: string;
  pages: number;
  previewPages: string[];
  fileSize: string;
  grade: string;
  tags: string[];
  views: number;
  clicks: number;
  createdAt: string;
  published: boolean;
}

export interface PreviewProps {
  product: Product;
  isFree: boolean;
  fileUrl?: string | null;
  coverUrl?: string | null;
}