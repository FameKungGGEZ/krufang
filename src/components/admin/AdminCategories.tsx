import React, { useState } from 'react';
import {
  BookOpen,
  Check,
  FileText,
  FolderOpen,
  LayoutTemplate,
  Layers3,
  Palette,
  PlayCircle,
  Plus,
  Presentation,
  Sparkles,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { CategoryIconGlyph } from '../store/CategoryIconGlyph';
import type { Category, CategoryIcon, Product } from '../../types/product';
import { cn } from '../../utils/cn';

interface AdminCategoriesProps {
  categories: Category[];
  products: Product[];
  onAdd: (name: string, color: string, icon: CategoryIcon, ink: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const CATEGORY_ICONS: { id: CategoryIcon; label: string; icon: React.ElementType }[] = [
  { id: 'worksheet', label: 'ใบงาน', icon: FileText },
  { id: 'slides', label: 'สไลด์', icon: Presentation },
  { id: 'cards', label: 'บัตรคำ', icon: Layers3 },
  { id: 'decor', label: 'ตกแต่ง', icon: Sparkles },
  { id: 'template', label: 'Template', icon: LayoutTemplate },
  { id: 'video', label: 'วิดีโอ', icon: PlayCircle }
];

const COLOR_SWATCHES = [
  { name: 'มิ้นต์', color: '#dff8ee', ink: '#087c5b' },
  { name: 'เหลือง', color: '#fff0c8', ink: '#8a6212' },
  { name: 'ฟ้า', color: '#eaf3ff', ink: '#2464c6' },
  { name: 'ชมพู', color: '#ffe5ef', ink: '#bf356b' },
  { name: 'ม่วง', color: '#efeaff', ink: '#5b45c9' },
  { name: 'ฟ้าอมเขียว', color: '#e3f6fb', ink: '#0e7490' }
];

export function AdminCategories({ categories, products, onAdd, onDelete }: AdminCategoriesProps) {
  const [name, setName] = useState('');
  const [swatch, setSwatch] = useState(COLOR_SWATCHES[0]);
  const [customColor, setCustomColor] = useState(false);
  const [icon, setIcon] = useState<CategoryIcon>('worksheet');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('กรุณาใส่ชื่อหมวดหมู่');
      return;
    }
    if (categories.some((category) => category.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase())) {
      setError('มีหมวดหมู่นี้อยู่แล้ว');
      return;
    }
    try {
      await onAdd(trimmed, swatch.color, icon, swatch.ink);
      setName('');
      setError('');
    } catch (cause) {
      toast.error(`เพิ่มหมวดหมู่ไม่สำเร็จ: ${cause instanceof Error ? cause.message : 'เกิดข้อผิดพลาด'}`);
    }
  };

  const updateColor = (color: string) => {
    setSwatch({ name: 'กำหนดเอง', color, ink: '#17345e' });
    setCustomColor(true);
  };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
      <form onSubmit={submit} noValidate className="space-y-6 xl:sticky xl:top-8">
        <section className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          <div>
            <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <FolderOpen className="size-5" />
            </span>
            <h2 className="font-heading text-lg font-semibold">เพิ่มหมวดหมู่ใหม่</h2>
            <p className="mt-1 text-sm text-muted-foreground">จัดกลุ่มสื่อให้ลูกค้าเลือกดูได้สะดวก</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="category-name" className="block text-sm font-medium">ชื่อหมวดหมู่</label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError('');
              }}
              placeholder="เช่น สังคมศึกษา"
              maxLength={100}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'category-name-error' : undefined}
              className="h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30 aria-invalid:border-destructive"
            />
            {error && <p id="category-name-error" className="text-xs font-medium text-destructive">{error}</p>}
          </div>

          <fieldset>
            <legend className="text-sm font-medium">เลือกไอคอน</legend>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {CATEGORY_ICONS.map(({ id, label, icon: Icon }) => {
                const selected = icon === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setIcon(id)}
                    aria-label={`เลือกไอคอน${label}`}
                    aria-pressed={selected}
                    className={cn(
                      'relative flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      selected ? 'border-primary bg-secondary/60 text-secondary-foreground ring-1 ring-primary/20' : 'bg-white text-muted-foreground hover:border-primary/40 hover:bg-muted/50'
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                    {label}
                    {selected && (
                      <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium">สีประจำหมวดหมู่</legend>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {COLOR_SWATCHES.map((option) => {
                const selected = !customColor && swatch.name === option.name;
                return (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => {
                      setSwatch(option);
                      setCustomColor(false);
                    }}
                    aria-label={`เลือกสี${option.name}`}
                    aria-pressed={selected}
                    className={cn(
                      'flex size-9 items-center justify-center rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      selected ? 'border-foreground' : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: option.color }}
                  >
                    {selected && <Check className="size-4" style={{ color: option.ink }} />}
                  </button>
                );
              })}
              <label
                title="เลือกสีที่กำหนดเอง"
                className={cn(
                  'relative flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 bg-white transition focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                  customColor ? 'border-foreground' : 'border-border hover:border-primary/50'
                )}
              >
                <Palette className="pointer-events-none absolute size-4 text-muted-foreground" />
                <input
                  type="color"
                  value={customColor ? swatch.color : '#eaf3ff'}
                  onChange={(event) => updateColor(event.target.value)}
                  aria-label="เลือกสีที่กำหนดเอง"
                  className="size-12 cursor-pointer opacity-0"
                />
              </label>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-canvas px-3 py-2.5">
              <span className="text-xs text-muted-foreground">{swatch.name === 'กำหนดเอง' ? 'สีที่กำหนดเอง' : `สี${swatch.name}`}</span>
              <span className="font-mono text-xs text-muted-foreground">{swatch.color.toUpperCase()}</span>
            </div>
          </fieldset>

          <div className="rounded-xl border bg-brand-canvas p-4">
            <p className="text-xs font-medium text-muted-foreground">ตัวอย่างหมวดหมู่</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: swatch.color, color: swatch.ink }}>
                <CategoryIconGlyph icon={icon} className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{name.trim() || 'ชื่อหมวดหมู่'}</span>
                <span className="text-xs text-muted-foreground">0 รายการ</span>
              </span>
            </div>
          </div>

          <button type="submit" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Plus className="size-4" />
            เพิ่มหมวดหมู่
          </button>
        </section>
      </form>

      <section className="space-y-4" aria-labelledby="category-list-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="category-list-title" className="font-heading text-lg font-semibold">หมวดหมู่ในร้าน</h2>
            <p className="mt-1 text-sm text-muted-foreground">เลือกไอคอนและสีที่ช่วยให้แต่ละกลุ่มจดจำได้ง่าย</p>
          </div>
          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
            {categories.length} หมวดหมู่
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed bg-white px-5 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-canvas text-muted-foreground">
              <BookOpen className="size-5" />
            </span>
            <p className="mt-3 text-sm font-medium">ยังไม่มีหมวดหมู่</p>
            <p className="mt-1 text-xs text-muted-foreground">เพิ่มหมวดหมู่แรกของร้านจากแบบฟอร์ม</p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => {
              const itemCount = products.filter((product) => product.category === category.name).length;
              return (
                <li key={category.id} className="rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft sm:p-5">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex size-12 shrink-0 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: category.color, color: category.ink }}
                    >
                      <CategoryIconGlyph icon={category.icon} className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <h3 className="truncate text-sm font-semibold">{category.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{itemCount} สินค้าในหมวดหมู่นี้</p>
                    </div>
                    <button
                      type="button"
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={async () => {
                        if (itemCount > 0) {
                          toast.error('ย้ายสินค้าออกจากหมวดหมู่นี้ก่อนลบ');
                          return;
                        }
                        if (!window.confirm(`ต้องการลบหมวดหมู่ “${category.name}” หรือไม่?`)) return;
                        try {
                          await onDelete(category.id);
                        } catch (cause) {
                          toast.error(`ลบหมวดหมู่ไม่สำเร็จ: ${cause instanceof Error ? cause.message : 'เกิดข้อผิดพลาด'}`);
                        }
                      }}
                      aria-label={`ลบหมวดหมู่ ${category.name}`}
                      title={itemCount > 0 ? 'ย้ายสินค้าออกจากหมวดหมู่ก่อนลบ' : 'ลบหมวดหมู่'}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <span className="text-xs text-muted-foreground">สีและไอคอน</span>
                    <span className="inline-flex items-center gap-2">
                      <span className="size-4 rounded-full border border-black/5" style={{ backgroundColor: category.color }} />
                      <CategoryIconGlyph icon={category.icon} className="size-4 text-muted-foreground" />
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
