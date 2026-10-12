import React, { useState } from 'react';
import { Pencil, Plus, Search, Trash2, PackageOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import type { Product } from '../../types/product';
import { formatPrice } from '../../utils/format';
import { cn } from '../../utils/cn';

interface AdminProductsProps {
  products: Product[];
  onDelete: (id: string) => void;
  onTogglePublish: (id: string) => void;
}

export function AdminProducts({ products, onDelete, onTogglePublish }: AdminProductsProps) {
  const [query, setQuery] = useState('');
  const list = products.filter((p) => p.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="relative w-full max-w-xs">
          <span className="sr-only">ค้นหาสินค้า</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="h-10 w-full rounded-xl border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          
        </label>
        <Button className="rounded-xl" onClick={() => toast.info('เปิดฟอร์มเพิ่มสินค้าใหม่')}>
          <Plus className="size-4" />
          เพิ่มสินค้าใหม่
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        {list.length === 0 ?
        <div className="flex flex-col items-center py-16 text-center">
            <PackageOpen className="size-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">ยังไม่มีสินค้า</p>
          </div> :

        <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/60 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">สินค้า</th>
                  <th className="px-4 py-3 font-medium">หมวดหมู่</th>
                  <th className="px-4 py-3 font-medium">ราคา</th>
                  <th className="px-4 py-3 font-medium">สถานะ</th>
                  <th className="px-4 py-3 text-right font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((p) =>
              <tr key={p.id} className="transition hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.coverUrl} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="max-w-[260px] truncate font-medium">{p.title}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">{p.format} · {p.fileSize}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{p.category}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                      {p.type === 'free' ? <span className="text-brand-mint-ink">ฟรี</span> : formatPrice(p.price)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                    type="button"
                    onClick={() => onTogglePublish(p.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold transition',
                      p.published ? 'bg-brand-mint text-brand-mint-ink' : 'bg-muted text-muted-foreground'
                    )}>
                    
                        <span className={cn('size-1.5 rounded-full', p.published ? 'bg-brand-mint-ink' : 'bg-muted-foreground')} />
                        {p.published ? 'เผยแพร่' : 'ฉบับร่าง'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" aria-label={`แก้ไข ${p.title}`} onClick={() => toast.info(`แก้ไข: ${p.title}`)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`ลบ ${p.title}`}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        if (window.confirm('ต้องการลบสินค้านี้หรือไม่?')) onDelete(p.id);
                      }}>
                      
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>);

}