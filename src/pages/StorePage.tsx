import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Facebook, Heart, SearchX } from 'lucide-react';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { HeroSection } from '../components/store/HeroSection';
import { FeatureStrip } from '../components/store/FeatureStrip';
import { CategoryGrid } from '../components/store/CategoryGrid';
import { ProductCard } from '../components/store/ProductCard';
import { facebookUrl } from '../data/products';
import { scrollToSection } from '../utils/format';
import { cn } from '../utils/cn';
import { useAdminContext } from '../contexts/adminContext';

type SortKey = 'popular' | 'new' | 'price';

const ALL = 'ทั้งหมด';

export function StorePage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [category, setCategory] = useState(ALL);
  const [sort, setSort] = useState<SortKey>('popular');
  const { products, categories, loading, loadError } = useAdminContext();

  const counts = useMemo(
    () => products.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.category]: (acc[p.category] ?? 0) + 1 }), {}),
    [products]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter(
      (p) =>
      p.published && (
      category === ALL || p.category === category) && (
      !q || `${p.title} ${p.description} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes(q))
    );
    return [...list].sort((a, b) =>
    sort === 'popular' ? b.views - a.views : sort === 'new' ? b.createdAt.localeCompare(a.createdAt) : a.price - b.price
    );
  }, [query, category, products, sort]);

  const setQuery = (value: string) => setParams(value ? { q: value } : {}, { replace: true });

  const selectCategory = (name: string) => {
    setCategory(name);
    scrollToSection('products');
  };

  return (
    <>
      <HeroSection query={query} onQueryChange={setQuery} onSubmit={() => scrollToSection('products')} />
      <FeatureStrip />

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <section id="categories" aria-labelledby="categories-title" className="scroll-mt-24 pt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 id="categories-title" className="font-heading text-2xl font-medium">
                หมวดหมู่แนะนำ
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">เลือกดูสื่อการสอนตามที่คุณต้องการ</p>
            </div>
            <Button variant="ghost" onClick={() => selectCategory(ALL)} className="text-primary">
              ดูทั้งหมด <ArrowRight className="size-4" />
            </Button>
          </div>
          {loadError ? (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-white p-4 text-sm text-destructive">
              โหลดข้อมูลร้านจาก Supabase ไม่สำเร็จ: {loadError}
            </p>
          ) : (
            <CategoryGrid categories={categories} counts={counts} selected={category} onSelect={selectCategory} />
          )}
        </section>

        <section id="products" aria-labelledby="products-title" className="scroll-mt-24 pt-16">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="products-title" className="font-heading text-2xl font-medium">
                {query ? `ผลการค้นหา “${query}”` : category === ALL ? 'สินค้าแนะนำ' : category}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
                {loading ? 'กำลังโหลด…' : `${filtered.length} รายการ`}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">เรียงตาม</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 rounded-lg border bg-white px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring">
                
                <option value="popular">ยอดนิยม</option>
                <option value="new">มาใหม่</option>
                <option value="price">ราคา: ต่ำไปสูง</option>
              </select>
            </label>
          </div>

          <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0" role="group" aria-label="กรองตามหมวดหมู่">
            {[ALL, ...categories.map((c) => c.name)].map((name) =>
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name)}
              aria-pressed={category === name}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition',
                category === name ?
                'border-primary bg-primary text-primary-foreground' :
                'bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}>
              
                {name}
              </button>
            )}
          </div>

          {loadError ? (
          <div role="alert" className="rounded-2xl border border-destructive/30 bg-white px-6 py-12 text-center text-sm text-destructive">
            ไม่สามารถโหลดสินค้าได้จาก Supabase กรุณาลองใหม่อีกครั้ง
          </div>
          ) : loading ?
          <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) =>
            <div key={i} className="overflow-hidden rounded-2xl border bg-white">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
            )}
            </div> :
          filtered.length === 0 ?
          <div className="flex flex-col items-center rounded-2xl border border-dashed bg-white px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <SearchX className="size-5 text-muted-foreground" />
              </span>
              <p className="mt-4 font-semibold">ไม่พบสินค้าที่ตรงกับการค้นหา</p>
              <p className="mt-1 text-sm text-muted-foreground">ลองใช้คำค้นอื่น หรือดูสินค้าทุกหมวดหมู่</p>
              <Button
              variant="outline"
              className="mt-5"
              onClick={() => {
                setQuery('');
                setCategory(ALL);
              }}>
              
                ล้างตัวกรอง
              </Button>
            </div> :

          <ul className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
              {filtered.map((p) =>
            <li key={p.id}>
                  <ProductCard product={p} />
                </li>
            )}
            </ul>
          }
        </section>

        <section className="mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl bg-primary px-6 py-8 text-primary-foreground md:flex-row md:items-center md:px-10">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Heart className="size-6 fill-white" />
            </span>
            <div>
              <p className="font-heading text-xl font-medium">ขอบคุณที่สนับสนุนสื่อการสอนของเรา</p>
              <p className="mt-1 text-sm text-white/80">ทุกการดาวน์โหลดช่วยให้เราสร้างสรรค์สื่อดี ๆ ต่อไป</p>
            </div>
          </div>
          <a
            href={facebookUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90">
            
            <Facebook className="size-4" />
            ติดตามบน Facebook
          </a>
        </section>
      </div>
    </>);

}