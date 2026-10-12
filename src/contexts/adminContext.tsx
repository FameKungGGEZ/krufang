import { createContext, useContext } from 'react';
import type { Category, CategoryIcon, Product } from '../types/product';

export interface AdminOutletContext {
  products: Product[];
  categories: Category[];
  loading: boolean;
  loadError: string | null;
  reload: () => Promise<void>;
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  togglePublish: (id: string) => Promise<void>;
  addCategory: (name: string, color: string, icon: CategoryIcon, ink: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const AdminDataContext = createContext<AdminOutletContext | null>(null);

export function useAdminContext() {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error('useAdminContext must be used within CatalogProvider');
  return context;
}
