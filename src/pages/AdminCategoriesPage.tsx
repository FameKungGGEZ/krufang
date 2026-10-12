import { toast } from 'sonner';
import { AdminCategories } from '../components/admin/AdminCategories';
import { PageHeader } from '../components/admin/PageHeader';
import { useAdminContext } from '../contexts/adminContext';

export function AdminCategoriesPage() {
  const { categories, products, addCategory, deleteCategory } = useAdminContext();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 md:px-8 md:py-10">
      <PageHeader title="หมวดหมู่" subtitle="จัดกลุ่มสินค้าให้ลูกค้าค้นหาได้ง่าย" />
      <AdminCategories
        categories={categories}
        products={products}
        onAdd={async (name, color, icon, ink) => {
          await addCategory(name, color, icon, ink);
          toast.success(`เพิ่มหมวดหมู่ “${name}” แล้ว`);
        }}
        onDelete={async (id) => {
          const category = categories.find((item) => item.id === id);
          if (category && products.some((product) => product.category === category.name)) {
            toast.error('ย้ายสินค้าออกจากหมวดหมู่นี้ก่อนลบ');
            return;
          }
          await deleteCategory(id);
          toast.success('ลบหมวดหมู่แล้ว');
        }}
      />
    </main>
  );
}
