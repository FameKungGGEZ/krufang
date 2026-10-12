import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Download, Eye, Facebook, FileQuestion, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ProductPreview } from '../components/preview/ProductPreview';
import { ProductCard } from '../components/store/ProductCard';
import { facebookUrl } from '../data/products';
import { formatNumber, formatPrice } from '../utils/format';
import { useAdminContext } from '../contexts/adminContext';
import { getProductDownloadUrl } from '../lib/productMedia';

export function ProductPage() {
  const { id } = useParams();
  const { products, loading, loadError } = useAdminContext();
  const product = products.find((p) => p.id === id);
  const [downloading, setDownloading] = useState(false);
  const [resolvedFileUrl, setResolvedFileUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    let active = true;
    setResolvedFileUrl(null);
    setFileError('');
    if (product?.fileUrl) {
      void getProductDownloadUrl(product.fileUrl)
        .then((url) => {
          if (active) setResolvedFileUrl(url);
        })
        .catch((error: unknown) => {
          if (active) setFileError(error instanceof Error ? error.message : 'เปิดไฟล์ตัวอย่างไม่สำเร็จ');
        });
    }
    return () => {
      active = false;
    };
  }, [product?.fileUrl]);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-muted-foreground">กำลังโหลดข้อมูลสินค้า…</div>;
  }

  if (loadError) {
    return <div role="alert" className="mx-auto max-w-xl px-4 py-20 text-center text-sm text-destructive">โหลดข้อมูลสินค้าจาก Supabase ไม่สำเร็จ: {loadError}</div>;
  }

  if (!product || !product.published) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="size-6 text-muted-foreground" />
        </span>
        <h1 className="mt-4 font-heading text-2xl font-medium">ไม่พบสินค้า</h1>
        <p className="mt-2 text-sm text-muted-foreground">สินค้านี้อาจถูกลบหรือยังไม่เผยแพร่</p>
        <Link to="/" className="mt-6 text-sm font-semibold text-primary hover:underline">
          ← กลับไปหน้าสินค้า
        </Link>
      </div>);

  }

  const isFree = product.type === 'free';
  const related = products.
  filter((p) => p.id !== product.id && p.published).
  sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category) || b.views - a.views).
  slice(0, 4);

  const facts = [
  { label: 'รูปแบบไฟล์', value: product.format },
  { label: 'ชื่อไฟล์', value: product.fileName },
  { label: 'ขนาดไฟล์', value: product.fileSize },
  { label: 'หมวดหมู่', value: product.category },
  { label: 'ระดับชั้น', value: product.grade },
  ...(product.pages > 1 ? [{ label: 'จำนวนหน้า', value: `${product.pages} หน้า` }] : [])];


  const handleDownload = async () => {
    if (!product.fileUrl) {
      toast.error('ไม่พบไฟล์ดาวน์โหลด');
      return;
    }
    setDownloading(true);
    try {
      const url = await getProductDownloadUrl(product.fileUrl, product.fileName);
      const link = document.createElement('a');
      link.href = url;
      link.download = product.fileName;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(`เปิดไฟล์ดาวน์โหลดไม่สำเร็จ: ${error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleBuy = () => {
    const win = window.open(facebookUrl, '_blank', 'noopener');
    if (!win) toast.error('อนุญาตป๊อปอัปเพื่อเปิดลิงก์สั่งซื้อ');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 -ml-2 font-medium transition hover:bg-secondary hover:text-secondary-foreground">
          <ArrowLeft className="size-4" />
          กลับไปหน้าสินค้า
        </Link>
        <span aria-hidden="true">/</span>
        <span>{product.category}</span>
      </nav>

      <div className="mt-5 grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="min-w-0">
          <ProductPreview
            product={product}
            isFree={isFree}
            fileUrl={isFree ? (resolvedFileUrl ?? product.fileUrl) : null}
            coverUrl={isFree ? null : product.coverUrl} />
          {fileError && <p role="alert" className="mt-3 text-sm text-destructive">เปิดไฟล์ตัวอย่างไม่สำเร็จ: {fileError}</p>}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                isFree ? 'bg-brand-mint text-brand-mint-ink' : 'bg-brand-pink-soft text-brand-pink-ink'}`
                }>
                
                {isFree ? 'ฟรี' : 'พรีเมียม'}
              </span>
              {product.tags.map((tag) =>
              <Badge key={tag} variant="outline" className="rounded-full bg-white">
                  {tag}
                </Badge>
              )}
            </div>
            <h1 className="font-heading text-2xl font-medium leading-snug md:text-3xl">{product.title}</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          </div>

          <section aria-label="ราคาและการสั่งซื้อ" className="rounded-2xl border bg-white p-5 shadow-soft">
            <p className="text-xs font-medium text-muted-foreground">ราคา</p>
            <p className={`font-heading text-4xl font-medium ${isFree ? 'text-brand-mint-ink' : 'text-foreground'}`}>
              {isFree ? 'ฟรี' : formatPrice(product.price)}
            </p>
            {isFree ?
            <Button size="lg" className="mt-4 h-12 w-full rounded-xl text-base" onClick={handleDownload} disabled={downloading}>
                {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                {downloading ? 'กำลังเตรียมไฟล์…' : 'ดาวน์โหลดฟรี'}
              </Button> :

            <Button size="lg" className="mt-4 h-12 w-full rounded-xl text-base" onClick={handleBuy}>
                <Facebook className="size-4" />
                สั่งซื้อผ่าน Facebook
              </Button>
            }
            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-brand-mint-ink" />
                {isFree ? 'กดรับไฟล์ได้ทันที ไม่มีค่าใช้จ่าย' : 'สอบถามและสั่งซื้อผ่าน Facebook ของร้าน'}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-brand-mint-ink" />
                ใช้ในห้องเรียนได้ไม่จำกัดจำนวนครั้ง
              </li>
            </ul>
          </section>

          <dl className="divide-y overflow-hidden rounded-2xl border bg-white">
            {facts.map((f) =>
            <div key={f.label} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
                <dt className="shrink-0 text-muted-foreground">{f.label}</dt>
                <dd className="min-w-0 break-words text-right font-medium">{f.value}</dd>
              </div>
            )}
          </dl>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="size-3.5" />
            {formatNumber(product.views)} ครั้งที่เข้าชม
          </p>
        </aside>
      </div>

      <section aria-labelledby="related-title" className="mt-16">
        <h2 id="related-title" className="mb-5 font-heading text-xl font-medium">
          สื่อที่คุณอาจสนใจ
        </h2>
        <ul className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
          {related.map((p) =>
          <li key={p.id}>
              <ProductCard product={p} />
            </li>
          )}
        </ul>
      </section>
    </div>);

}