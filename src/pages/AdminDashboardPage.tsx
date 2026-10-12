import { Download, Eye, FolderOpen, Package, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAdminContext } from '../contexts/adminContext';
import { formatNumber } from '../utils/format';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { products, categories } = useAdminContext();
  const published = products.filter((product) => product.published).length;
  const views = products.reduce((sum, product) => sum + product.views, 0);
  const downloads = products.reduce((sum, product) => sum + product.clicks, 0);
  const stats = [
    { label: 'สินค้าทั้งหมด', value: products.length, icon: Package, tone: 'bg-secondary text-secondary-foreground' },
    { label: 'เผยแพร่แล้ว', value: published, icon: Download, tone: 'bg-brand-mint text-brand-mint-ink' },
    { label: 'ยอดเข้าชม', value: views, icon: Eye, tone: 'bg-brand-pink-soft text-brand-pink-ink' },
    { label: 'หมวดหมู่', value: categories.length, icon: FolderOpen, tone: 'bg-brand-yellow text-brand-yellow-ink' }
  ];
  const topProducts = [...products].sort((a, b) => b.views - a.views).slice(0, 5);
  const maxViews = topProducts[0]?.views || 1;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 md:px-8 md:py-10">
      <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Kru.Fang Studio</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight md:text-3xl">ภาพรวมร้านค้า</h1>
          <p className="mt-1 text-sm text-muted-foreground">จัดการสื่อการสอนและตรวจดูภาพรวมสินค้า</p>
        </div>
        <Button size="lg" className="rounded-xl" onClick={() => navigate('/admin/products/new')}>
          <Plus className="size-4" />
          เพิ่มสินค้าใหม่
        </Button>
      </header>

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <li key={label} className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
            <span className={`flex size-10 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="size-5" />
            </span>
            <p className="mt-4 text-sm text-muted-foreground">{label}</p>
            <p className="font-heading text-2xl font-semibold sm:text-3xl">{formatNumber(value)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <section className="rounded-2xl border bg-white p-5 sm:p-6" aria-labelledby="admin-popular-title">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="admin-popular-title" className="font-heading text-lg font-semibold">สินค้าที่มีผู้เข้าชมสูง</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">อันดับจากยอดเข้าชมที่บันทึกไว้</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/products')}>ดูสินค้าทั้งหมด</Button>
          </div>
          {topProducts.length > 0 ? (
            <ol className="mt-5 space-y-4">
              {topProducts.map((product, index) => (
                <li key={product.id} className="flex items-center gap-3">
                  <span className="w-5 text-sm font-semibold tabular-nums text-muted-foreground">{index + 1}</span>
                  <img src={product.coverUrl} alt="" className="size-11 shrink-0 rounded-lg border object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium">{product.title}</p>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatNumber(product.views)}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${product.views / maxViews * 100}%` }} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">ยังไม่มีสินค้า</p>
          )}
        </section>

        <section className="rounded-2xl border bg-white p-5 sm:p-6" aria-labelledby="admin-status-title">
          <h2 id="admin-status-title" className="font-heading text-lg font-semibold">สถานะร้าน</h2>
          <p className="mt-1 text-sm text-muted-foreground">สรุปสถานะสินค้าและหมวดหมู่</p>
          <dl className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-brand-canvas px-4 py-3">
              <dt className="text-sm text-muted-foreground">ฉบับร่าง</dt>
              <dd className="font-semibold tabular-nums">{products.length - published}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-brand-canvas px-4 py-3">
              <dt className="text-sm text-muted-foreground">ยอดคลิก/ดาวน์โหลด</dt>
              <dd className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
                <Download className="size-4 text-primary" /> {formatNumber(downloads)}
              </dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-brand-canvas px-4 py-3">
              <dt className="text-sm text-muted-foreground">หมวดหมู่สินค้า</dt>
              <dd className="font-semibold tabular-nums">{categories.length}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
