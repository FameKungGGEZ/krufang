import React from 'react';
import { Package, FolderOpen, Eye, MousePointerClick, Database } from 'lucide-react';
import type { Category, Product } from '../../types/product';
import { formatNumber } from '../../utils/format';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
}

export function AdminDashboard({ products, categories }: AdminDashboardProps) {
  const totalViews = products.reduce((s, p) => s + p.views, 0);
  const totalClicks = products.reduce((s, p) => s + p.clicks, 0);
  const stats = [
  { label: 'สินค้าทั้งหมด', value: products.length, icon: Package, tone: 'bg-secondary text-secondary-foreground' },
  { label: 'หมวดหมู่', value: categories.length, icon: FolderOpen, tone: 'bg-brand-yellow text-brand-yellow-ink' },
  { label: 'ยอดวิวรวม', value: totalViews, icon: Eye, tone: 'bg-brand-pink-soft text-brand-pink-ink' },
  { label: 'ยอดคลิกรวม', value: totalClicks, icon: MousePointerClick, tone: 'bg-brand-mint text-brand-mint-ink' }];

  const top = [...products].sort((a, b) => b.views - a.views).slice(0, 5);
  const max = top[0]?.views ?? 1;

  return (
    <div className="space-y-6">
      <ul className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) =>
        <li key={label} className="rounded-2xl border bg-white p-5">
            <span className={`flex size-10 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="size-5" />
            </span>
            <p className="mt-4 text-sm text-muted-foreground">{label}</p>
            <p className="font-heading text-3xl font-medium">{formatNumber(value)}</p>
          </li>
        )}
      </ul>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border bg-white p-5 xl:col-span-2" aria-labelledby="top-title">
          <h2 id="top-title" className="font-heading text-lg font-medium">
            สินค้ายอดนิยม
          </h2>
          <ol className="mt-4 space-y-4">
            {top.map((p, i) =>
            <li key={p.id} className="flex items-center gap-3">
                <span className="w-5 text-sm font-semibold tabular-nums text-muted-foreground">{i + 1}</span>
                <img src={p.coverUrl} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatNumber(p.views)} วิว</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${p.views / max * 100}%` }} />
                  </div>
                </div>
              </li>
            )}
          </ol>
        </section>

        <section className="rounded-2xl border bg-white p-5" aria-labelledby="storage-title">
          <h2 id="storage-title" className="font-heading text-lg font-medium">
            การเชื่อมต่อ
          </h2>
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-mint p-4 text-brand-mint-ink">
            <Database className="size-5" />
            <div>
              <p className="text-sm font-semibold">Supabase</p>
              <p className="text-xs">เชื่อมต่อสำเร็จ</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            จัดการสินค้า หมวดหมู่ และตั้งค่าร้าน Kru.Fang Studio ได้จากเมนูด้านข้าง
          </p>
        </section>
      </div>
    </div>);

}