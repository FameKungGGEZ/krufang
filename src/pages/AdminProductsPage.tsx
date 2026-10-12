import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, PackageOpen, Plus, Search, SearchX, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { useAdminContext } from '../contexts/adminContext';
import { formatNumber, formatPrice } from '../utils/format';
import { cn } from '../utils/cn';
import type { Product } from '../types/product';

type StatusFilter = 'all' | 'published' | 'draft';

export function AdminProductsPage() {
  const navigate = useNavigate();
  const { products, categories, deleteProduct, togglePublish } = useAdminContext();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [category, setCategory] = useState('all');
  const published = products.filter((product) => product.published).length;
  const counts: Record<StatusFilter, number> = {
    all: products.length,
    published,
    draft: products.length - published
  };
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return products.filter((product) => (
      (status === 'all' || product.published === (status === 'published')) &&
      (category === 'all' || product.category === category) &&
      (!normalizedQuery || `${product.title} ${product.description} ${product.tags.join(' ')}`.toLocaleLowerCase().includes(normalizedQuery))
    ));
  }, [category, products, query, status]);

  const clearFilters = () => {
    setQuery('');
    setStatus('all');
    setCategory('all');
  };

  const confirmDelete = async (product: Product) => {
    if (!window.confirm(`ต้องการลบ “${product.title}” หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`)) return;
    try {
      await deleteProduct(product.id);
      toast.success('ลบสินค้าแล้ว');
    } catch (cause) {
      toast.error(`ลบสินค้าไม่สำเร็จ: ${cause instanceof Error ? cause.message : 'เกิดข้อผิดพลาด'}`);
    }
  };

  const changePublishStatus = async (id: string) => {
    try {
      await togglePublish(id);
    } catch (cause) {
      toast.error(`เปลี่ยนสถานะสินค้าไม่สำเร็จ: ${cause instanceof Error ? cause.message : 'เกิดข้อผิดพลาด'}`);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 md:px-8 md:py-10">
      <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">คลังสื่อการสอน</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight md:text-3xl">จัดการสินค้า</h1>
          <p className="mt-1 text-sm text-muted-foreground">เพิ่ม แก้ไข เผยแพร่ และจัดระเบียบสินค้าของคุณ</p>
        </div>
        <Button size="lg" className="rounded-xl" onClick={() => navigate('/admin/products/new')}>
          <Plus className="size-4" />
          เพิ่มสินค้าใหม่
        </Button>
      </header>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm" aria-label="รายการสินค้า">
        <div className="space-y-4 border-b p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block w-full lg:max-w-sm">
              <span className="sr-only">ค้นหาสินค้า</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหาชื่อสินค้า คำอธิบาย หรือแท็ก"
                className="h-10 w-full rounded-xl border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">หมวดหมู่</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-10 min-w-36 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="all">ทุกหมวดหมู่</option>
                {categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="กรองตามสถานะ">
            {([
              ['all', 'สินค้าทั้งหมด'],
              ['published', 'เผยแพร่แล้ว'],
              ['draft', 'ฉบับร่าง']
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatus(key)}
                aria-pressed={status === key}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
                  status === key ? 'border-primary bg-primary text-primary-foreground' : 'bg-white text-muted-foreground hover:border-primary/40'
                )}
              >
                {label}
                <span className={cn('rounded-full px-1.5 py-0.5 text-[11px] tabular-nums', status === key ? 'bg-white/20' : 'bg-muted')}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title="ยังไม่มีสินค้าในร้าน"
            description="เริ่มต้นด้วยการเพิ่มสินค้าชิ้นแรกของคุณ"
            action={<Button onClick={() => navigate('/admin/products/new')}><Plus className="size-4" /> เพิ่มสินค้าใหม่</Button>}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="ไม่พบสินค้าที่ตรงกับตัวกรอง"
            description="ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองทั้งหมด"
            action={<Button variant="outline" onClick={clearFilters}>ล้างตัวกรอง</Button>}
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="bg-brand-canvas text-left text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">สินค้า</th>
                    <th scope="col" className="px-4 py-3 font-medium">หมวดหมู่</th>
                    <th scope="col" className="px-4 py-3 font-medium">ราคา</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">เข้าชม</th>
                    <th scope="col" className="px-4 py-3 font-medium">สถานะ</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium"><span className="sr-only">จัดการ</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((product) => (
                    <tr key={product.id} className="group transition-colors hover:bg-brand-canvas/70">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3.5">
                          <img src={product.coverUrl} alt="" className="size-12 shrink-0 rounded-lg border object-cover" />
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                              className="block max-w-[280px] truncate text-left font-medium hover:text-primary hover:underline"
                            >
                              {product.title}
                            </button>
                            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{product.format} · {product.fileSize} · {product.pages} หน้า</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className="rounded-full bg-white">{product.category}</Badge>
                      </td>
                      <td className="px-4 py-3.5 font-medium">
                        {product.type === 'free' ? <span className="text-brand-mint-ink">ฟรี</span> : formatPrice(product.price)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-xs">{formatNumber(product.views)}</td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => void changePublishStatus(product.id)}
                          aria-label={product.published ? `ซ่อน ${product.title}` : `เผยแพร่ ${product.title}`}
                          className={cn(
                            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold transition',
                            product.published ? 'bg-brand-mint text-brand-mint-ink' : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {product.published && <Check className="size-3" />}
                          {product.published ? 'เผยแพร่' : 'ฉบับร่าง'}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/products/${product.id}/edit`)}>
                            แก้ไข
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => confirmDelete(product)}
                          >
                            ลบ
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y md:hidden">
              {filtered.map((product) => (
                <li key={product.id} className="flex gap-3 p-4">
                  <img src={product.coverUrl} alt="" className="size-16 shrink-0 rounded-xl border object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                        className="line-clamp-2 text-left text-sm font-medium"
                      >
                        {product.title}
                      </button>
                      <button
                        type="button"
                        onClick={() => void changePublishStatus(product.id)}
                        className={cn(
                          'shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold',
                          product.published ? 'bg-brand-mint text-brand-mint-ink' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {product.published ? 'เผยแพร่' : 'ฉบับร่าง'}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{product.category} · {product.format}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{product.type === 'free' ? 'ฟรี' : formatPrice(product.price)}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/products/${product.id}/edit`)}>แก้ไข</Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => confirmDelete(product)}>ลบ</Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="border-t px-5 py-3 text-xs text-muted-foreground">แสดง {filtered.length} จาก {products.length} รายการ</p>
          </>
        )}
      </section>
    </main>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center sm:py-20">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-canvas">
        <Icon className="size-6 text-muted-foreground" />
      </span>
      <p className="mt-4 font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5">{action}</div>
    </div>
  );
}
