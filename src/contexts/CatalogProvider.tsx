import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AdminOutletContext } from './adminContext';
import { AdminDataContext } from './adminContext';
import { fetchCatalog, persistCategory, persistProduct } from '../lib/supabaseCatalog';
import { requireSupabase } from '../lib/supabase';

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<AdminOutletContext['products']>([]);
  const [categories, setCategories] = useState<AdminOutletContext['categories']>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const catalog = await fetchCatalog();
      setProducts(catalog.products);
      setCategories(catalog.categories);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลจาก Supabase ได้';
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo<AdminOutletContext>(() => ({
    products,
    categories,
    loading,
    loadError,
    reload,
    saveProduct: async (product) => {
      await persistProduct(product, categories);
      await reload();
    },
    deleteProduct: async (id) => {
      const { data, error } = await requireSupabase()
        .from('products')
        .delete()
        .eq('id', id)
        .select('id');
      if (error) throw error;
      if (!data?.length) throw new Error('ไม่พบสินค้าที่ต้องการลบ หรือไม่มีสิทธิ์จัดการ');
      await reload();
    },
    togglePublish: async (id) => {
      const product = products.find((item) => item.id === id);
      if (!product) throw new Error('ไม่พบสินค้าที่ต้องการแก้ไข');
      await persistProduct({ ...product, published: !product.published }, categories);
      await reload();
    },
    addCategory: async (name, color, icon, ink) => {
      await persistCategory({ id: crypto.randomUUID(), name, color, icon, ink });
      await reload();
    },
    deleteCategory: async (id) => {
      const { data, error } = await requireSupabase()
        .from('categories')
        .delete()
        .eq('id', id)
        .select('id');
      if (error) throw error;
      if (!data?.length) throw new Error('ไม่พบหมวดหมู่ที่ต้องการลบ หรือไม่มีสิทธิ์จัดการ');
      await reload();
    }
  }), [categories, loadError, loading, products, reload]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}
