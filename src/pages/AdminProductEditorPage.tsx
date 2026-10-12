import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  PackageX,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { useAdminContext } from '../contexts/adminContext';
import type { Product } from '../types/product';
import { formatPrice } from '../utils/format';
import { cn } from '../utils/cn';
import { uploadProductCover, uploadProductDownload } from '../lib/productMedia';

interface ProductDraft {
  title: string;
  description: string;
  category: string;
  type: Product['type'];
  price: string;
  format: string;
  coverUrl: string;
  fileUrl: string | null;
  fileName: string;
  fileSize: string;
  pages: string;
  grade: string;
  tags: string;
  published: boolean;
}

const emptyDraft: ProductDraft = {
  title: '',
  description: '',
  category: '',
  type: 'paid',
  price: '',
  format: 'PDF',
  coverUrl: '',
  fileUrl: null,
  fileName: '',
  fileSize: '',
  pages: '',
  grade: '',
  tags: '',
  published: false
};

function toDraft(product: Product): ProductDraft {
  return {
    title: product.title,
    description: product.description,
    category: product.category,
    type: product.type,
    price: product.type === 'paid' ? String(product.price) : '',
    format: product.format,
    coverUrl: product.coverUrl,
    fileUrl: product.fileUrl,
    fileName: product.fileName,
    fileSize: product.fileSize,
    pages: product.pages ? String(product.pages) : '',
    grade: product.grade,
    tags: product.tags.join(', '),
    published: product.published
  };
}

function getFileSize(size: number) {
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function inferFormat(filename: string) {
  const extension = filename.split('.').pop()?.toUpperCase();
  return extension || 'FILE';
}

export function AdminProductEditorPage() {
  const { id } = useParams<{ id: string }>();
  return <ProductEditor key={id ?? 'new'} productId={id} />;
}

function ProductEditor({ productId }: { productId?: string }) {
  const navigate = useNavigate();
  const { products, categories, saveProduct, deleteProduct } = useAdminContext();
  const existing = productId ? products.find((product) => product.id === productId) : undefined;
  const isEdit = Boolean(productId);
  const [initialDraft] = useState(() => existing ? toDraft(existing) : {
    ...emptyDraft,
    category: categories[0]?.name ?? ''
  });
  const [draft, setDraft] = useState<ProductDraft>(initialDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [coverInputKey, setCoverInputKey] = useState(0);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [recordId] = useState(() => existing?.id ?? crypto.randomUUID());
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(initialDraft), [draft, initialDraft]);

  const setField = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const requestLeave = () => {
    if (dirty && !window.confirm('มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?')) return;
    navigate('/admin/products');
  };

  const handleCover = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพ');
      setCoverInputKey((key) => key + 1);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('รูปภาพต้องมีขนาดไม่เกิน 5 MB');
      setCoverInputKey((key) => key + 1);
      return;
    }
    setUploadingMedia(true);
    try {
      setField('coverUrl', await uploadProductCover(file, recordId));
    } catch (cause) {
      toast.error(`อัปโหลดรูปปกไม่สำเร็จ: ${cause instanceof Error ? cause.message : 'เกิดข้อผิดพลาด'}`);
    } finally {
      setUploadingMedia(false);
      setCoverInputKey((key) => key + 1);
    }
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error('ไฟล์ดาวน์โหลดต้องมีขนาดไม่เกิน 50 MB');
      setFileInputKey((key) => key + 1);
      return;
    }
    const fileFormat = inferFormat(file.name);
    setUploadingMedia(true);
    try {
      const fileUrl = await uploadProductDownload(file, recordId);
      setField('fileName', file.name);
      setField('fileSize', getFileSize(file.size));
      setField('fileUrl', fileUrl);
      setField('format', fileFormat);
    } catch (cause) {
      toast.error(`อัปโหลดไฟล์สินค้าไม่สำเร็จ: ${cause instanceof Error ? cause.message : 'เกิดข้อผิดพลาด'}`);
    } finally {
      setUploadingMedia(false);
      setFileInputKey((key) => key + 1);
    }
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (draft.title.trim().length < 5) nextErrors.title = 'กรุณาใส่ชื่อสินค้าอย่างน้อย 5 ตัวอักษร';
    if (!draft.category) nextErrors.category = 'กรุณาเลือกหมวดหมู่สินค้า';
    if (draft.type === 'paid' && (!draft.price || Number(draft.price) <= 0)) {
      nextErrors.price = 'กรุณาระบุราคาที่มากกว่า 0';
    }
    if (draft.published && !draft.coverUrl) nextErrors.coverUrl = 'ต้องเพิ่มรูปปกก่อนเผยแพร่สินค้า';
    if (draft.published && !draft.fileUrl) nextErrors.fileName = 'ต้องเพิ่มไฟล์ดาวน์โหลดก่อนเผยแพร่สินค้า';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('กรุณาตรวจสอบข้อมูลที่ไฮไลต์ไว้');
      document.getElementById(`product-field-${Object.keys(nextErrors)[0]}`)?.focus();
      return;
    }

    setSaving(true);
    const savedAt = new Date().toISOString();
    const product: Product = {
      id: recordId,
      title: draft.title.trim(),
      description: draft.description.trim(),
      category: draft.category,
      type: draft.type,
      price: draft.type === 'paid' ? Number(draft.price) : 0,
      format: draft.format,
      cover_type: 'image',
      coverUrl: draft.coverUrl,
      fileUrl: draft.fileUrl,
      fileName: draft.fileName,
      pages: Number(draft.pages) || 0,
      previewPages: existing?.previewPages ?? [],
      fileSize: draft.fileSize,
      grade: draft.grade.trim(),
      tags: draft.tags.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 8),
      views: existing?.views ?? 0,
      clicks: existing?.clicks ?? 0,
      createdAt: existing?.createdAt ?? savedAt.slice(0, 10),
      published: draft.published
    };
    void (async () => {
      try {
        await saveProduct(product);
        toast.success(isEdit ? 'บันทึกการเปลี่ยนแปลงแล้ว' : draft.published ? 'สร้างและเผยแพร่สินค้าแล้ว' : 'บันทึกสินค้าเป็นฉบับร่างแล้ว');
        navigate('/admin/products');
      } catch (cause) {
        toast.error(`บันทึกสินค้าไม่สำเร็จ: ${cause instanceof Error ? cause.message : 'เกิดข้อผิดพลาด'}`);
      } finally {
        setSaving(false);
      }
    })();
  };

  const confirmDelete = () => {
    if (!existing || !window.confirm(`ต้องการลบ “${existing.title}” หรือไม่?`)) return;
    void deleteProduct(existing.id)
      .then(() => {
        toast.success('ลบสินค้าแล้ว');
        navigate('/admin/products');
      })
      .catch((cause: unknown) => {
        toast.error(`ลบสินค้าไม่สำเร็จ: ${cause instanceof Error ? cause.message : 'เกิดข้อผิดพลาด'}`);
      });
  };

  if (isEdit && !existing) {
    return (
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-white">
          <PackageX className="size-6 text-muted-foreground" />
        </span>
        <h1 className="mt-4 font-heading text-xl font-semibold">ไม่พบสินค้านี้</h1>
        <p className="mt-1 text-sm text-muted-foreground">สินค้าอาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>
        <Button className="mt-6" onClick={() => navigate('/admin/products')}>กลับไปหน้าสินค้า</Button>
      </main>
    );
  }

  const imageInput = (
    <input
      key={coverInputKey}
      type="file"
      accept="image/png,image/jpeg,image/webp"
      className="sr-only"
      onChange={(event) => handleCover(event.target.files?.[0])}
    />
  );
  const saveButton = (
    <Button type="submit" form="product-editor-form" size="lg" className="rounded-xl" disabled={saving || uploadingMedia}>
      {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
      {saving ? 'กำลังบันทึก…' : uploadingMedia ? 'กำลังอัปโหลดไฟล์…' : isEdit ? 'บันทึกการเปลี่ยนแปลง' : draft.published ? 'สร้างและเผยแพร่' : 'บันทึกฉบับร่าง'}
    </Button>
  );

  return (
    <div className="pb-24 lg:pb-10">
      <div className="z-20 border-b bg-white lg:sticky lg:top-0">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-8">
          <Button variant="ghost" size="icon" aria-label="กลับไปหน้าสินค้า" onClick={requestLeave}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <nav aria-label="เส้นทางนำทาง" className="flex items-center gap-1 text-xs text-muted-foreground">
              <button type="button" onClick={requestLeave} className="hover:text-foreground">สินค้า</button>
              <ChevronRight className="size-3" />
              <span>{isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</span>
            </nav>
            <div className="flex items-center gap-2">
              <h1 className="truncate font-heading text-lg font-semibold">
                {draft.title.trim() || (isEdit ? 'แก้ไขสินค้า' : 'สินค้าใหม่')}
              </h1>
              <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', draft.published ? 'bg-brand-mint text-brand-mint-ink' : 'bg-muted text-muted-foreground')}>
                {draft.published ? 'เผยแพร่' : 'ฉบับร่าง'}
              </span>
            </div>
          </div>
          {dirty && <span className="hidden text-xs text-muted-foreground md:block">ยังไม่ได้บันทึก</span>}
          <div className="hidden items-center gap-2 lg:flex">
            <Button type="button" variant="outline" size="lg" className="rounded-xl" onClick={requestLeave}>ยกเลิก</Button>
            {saveButton}
          </div>
        </div>
      </div>

      <form id="product-editor-form" onSubmit={save} noValidate>
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:px-8 md:py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <EditorSection title="ข้อมูลสินค้า" description="รายละเอียดที่ช่วยให้ลูกค้าตัดสินใจ">
              <Field label="ชื่อสินค้า" error={errors.title} htmlFor="product-field-title">
                <input
                  id="product-field-title"
                  value={draft.title}
                  maxLength={80}
                  onChange={(event) => setField('title', event.target.value)}
                  placeholder="เช่น ชุดฝึกคัดพยัญชนะไทย ก–ฮ"
                  className={inputClass(Boolean(errors.title))}
                />
                <span className="mt-1 block text-right text-xs text-muted-foreground">{draft.title.length}/80</span>
              </Field>
              <Field label="คำอธิบาย">
                <textarea
                  value={draft.description}
                  maxLength={600}
                  rows={4}
                  onChange={(event) => setField('description', event.target.value)}
                  placeholder="อธิบายเนื้อหา กลุ่มเป้าหมาย และวิธีใช้งาน"
                  className="w-full resize-y rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
              </Field>
            </EditorSection>

            <EditorSection title="รูปปกสินค้า" description="รูปภาพที่ลูกค้าจะเห็นในหน้าร้าน">
              {imageInput}
              {draft.coverUrl ? (
                <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
                  <img src={draft.coverUrl} alt="ตัวอย่างรูปปกสินค้า" className="aspect-square w-full rounded-xl border object-cover" />
                  <div>
                    <p className="text-sm font-medium">รูปปกพร้อมใช้งาน</p>
                    <p className="mt-1 text-sm text-muted-foreground">แนะนำภาพสี่เหลี่ยมจัตุรัส ขนาดไม่เกิน 5 MB</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 text-sm font-medium hover:bg-muted">
                        <ImagePlus className="size-4" /> เปลี่ยนรูป
                        {imageInput}
                      </label>
                      <Button type="button" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setField('coverUrl', '')}>
                        <X className="size-4" /> ลบรูป
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <label
                  className={cn(
                    'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition hover:border-primary hover:bg-secondary/30',
                    errors.coverUrl && 'border-destructive bg-destructive/5'
                  )}
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground"><Upload className="size-5" /></span>
                  <span className="mt-3 text-sm font-medium">ลากรูปมาวาง หรือเลือกไฟล์</span>
                  <span className="mt-1 text-xs text-muted-foreground">รองรับ PNG, JPG และ WebP · ไม่เกิน 5 MB</span>
                  {imageInput}
                </label>
              )}
              {errors.coverUrl && <p className="mt-2 text-xs font-medium text-destructive">{errors.coverUrl}</p>}
            </EditorSection>

            <EditorSection title="ไฟล์สำหรับดาวน์โหลด" description="เลือกไฟล์สื่อการสอนที่ลูกค้าจะได้รับ">
              <input
                key={fileInputKey}
                type="file"
                className="sr-only"
                id="product-file-input"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
              {draft.fileName ? (
                <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><Upload className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{draft.fileName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{draft.format} · {draft.fileSize || 'ขนาดไฟล์ไม่ระบุ'}</p>
                  </div>
                  <div className="flex gap-2">
                    <label htmlFor="product-file-input" className="inline-flex h-9 cursor-pointer items-center rounded-lg border px-3 text-sm font-medium hover:bg-muted">เปลี่ยนไฟล์</label>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="ลบไฟล์" className="text-destructive" onClick={() => {
                      setField('fileName', '');
                      setField('fileSize', '');
                      setField('fileUrl', null);
                      setFileInputKey((key) => key + 1);
                    }}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <label htmlFor="product-file-input" className={cn('flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition hover:border-primary hover:bg-secondary/30', errors.fileName && 'border-destructive bg-destructive/5')}>
                  <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground"><Upload className="size-5" /></span>
                  <span className="mt-3 text-sm font-medium">เลือกไฟล์ดาวน์โหลด</span>
                  <span className="mt-1 text-xs text-muted-foreground">รองรับไฟล์ทุกชนิด ขนาดไม่เกิน 50 MB</span>
                </label>
              )}
              {errors.fileName && <p className="mt-2 text-xs font-medium text-destructive">{errors.fileName}</p>}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="จำนวนหน้า">
                  <input type="number" min="0" value={draft.pages} onChange={(event) => setField('pages', event.target.value)} placeholder="เช่น 24" className={inputClass(false)} />
                </Field>
                <Field label="ระดับชั้น">
                  <input value={draft.grade} onChange={(event) => setField('grade', event.target.value)} placeholder="เช่น อนุบาล 1–3" className={inputClass(false)} />
                </Field>
              </div>
            </EditorSection>

            <EditorSection title="ราคา" description="เลือกประเภทสินค้าฟรีหรือชำระเงิน">
              <div className="grid gap-3 sm:grid-cols-2">
                {([
                  { type: 'paid', label: 'สินค้าพรีเมียม', detail: 'ลูกค้าชำระเงินก่อนรับไฟล์' },
                  { type: 'free', label: 'แจกฟรี', detail: 'เปิดให้ดาวน์โหลดโดยไม่มีค่าใช้จ่าย' }
                ] as const).map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    role="radio"
                    aria-checked={draft.type === option.type}
                    onClick={() => setField('type', option.type)}
                    className={cn('rounded-xl border p-4 text-left transition', draft.type === option.type ? 'border-primary bg-secondary/50 ring-1 ring-primary/20' : 'hover:bg-muted/50')}
                  >
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{option.detail}</span>
                  </button>
                ))}
              </div>
              {draft.type === 'paid' && (
                <Field label="ราคาขาย (บาท)" error={errors.price} htmlFor="product-field-price">
                  <input id="product-field-price" type="number" inputMode="decimal" min="1" step="1" value={draft.price} onChange={(event) => setField('price', event.target.value)} placeholder="เช่น 89" className={inputClass(Boolean(errors.price))} />
                </Field>
              )}
            </EditorSection>
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border bg-white p-5">
              <h2 className="font-heading text-base font-semibold">การเผยแพร่</h2>
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-brand-canvas p-3.5">
                <span className="mt-0.5 text-muted-foreground">{draft.published ? <Eye className="size-4 text-brand-mint-ink" /> : <EyeOff className="size-4" />}</span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">{draft.published ? 'แสดงในหน้าร้าน' : 'บันทึกเป็นฉบับร่าง'}</span>
                  <span className="block text-xs text-muted-foreground">{draft.published ? 'ลูกค้าจะมองเห็นสินค้านี้' : 'ยังไม่แสดงสินค้าให้ลูกค้าเห็น'}</span>
                </span>
                <input type="checkbox" checked={draft.published} onChange={(event) => setField('published', event.target.checked)} className="mt-1 size-4 accent-primary" />
              </label>
            </section>

            <section className="space-y-4 rounded-2xl border bg-white p-5">
              <h2 className="font-heading text-base font-semibold">การจัดหมวดหมู่</h2>
              <Field label="หมวดหมู่" error={errors.category} htmlFor="product-field-category">
                <select id="product-field-category" value={draft.category} onChange={(event) => setField('category', event.target.value)} className={inputClass(Boolean(errors.category))}>
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                </select>
              </Field>
              <Field label="แท็ก" hint="คั่นแต่ละแท็กด้วยเครื่องหมายจุลภาค">
                <input value={draft.tags} onChange={(event) => setField('tags', event.target.value)} placeholder="เช่น ภาษาไทย, พร้อมพิมพ์" className={inputClass(false)} />
              </Field>
            </section>

            <section className="overflow-hidden rounded-2xl border bg-white">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="font-heading text-base font-semibold">ตัวอย่างในหน้าร้าน</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">ตัวอย่างสด</span>
              </div>
              <div className="relative aspect-square bg-brand-canvas">
                {draft.coverUrl ? (
                  <img src={draft.coverUrl} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ImagePlus className="size-8" />
                    <span className="text-xs">ยังไม่มีรูปปก</span>
                  </div>
                )}
                <span className={cn('absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold', draft.type === 'free' ? 'bg-brand-mint text-brand-mint-ink' : 'bg-brand-pink-soft text-brand-pink-ink')}>
                  {draft.type === 'free' ? 'ฟรี' : 'พรีเมียม'}
                </span>
              </div>
              <div className="p-4">
                <p className="text-[11px] font-semibold text-primary">{draft.category || 'เลือกหมวดหมู่'}{draft.grade && ` · ${draft.grade}`}</p>
                <p className="mt-1 line-clamp-2 min-h-10 text-sm font-medium">{draft.title.trim() || <span className="text-muted-foreground">ชื่อสินค้าจะแสดงที่นี่</span>}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="font-heading text-lg font-semibold">{draft.type === 'free' ? 'ฟรี' : formatPrice(Number(draft.price) || 0)}</span>
                  <span className="text-xs text-muted-foreground">{draft.format}{draft.pages && ` · ${draft.pages} หน้า`}</span>
                </div>
              </div>
            </section>
            {existing && (
              <section className="rounded-2xl border border-red-200 bg-white p-5">
                <h2 className="font-heading text-base font-semibold text-destructive">ลบสินค้า</h2>
                <p className="mt-1 text-sm text-muted-foreground">ลบสินค้านี้ออกจากรายการแอดมินและหน้าร้าน</p>
                <Button type="button" variant="outline" className="mt-4 w-full border-red-200 text-destructive hover:bg-red-50 hover:text-destructive" onClick={confirmDelete}>
                  <Trash2 className="size-4" /> ลบสินค้านี้
                </Button>
              </section>
            )}
          </aside>
        </div>
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-end gap-2 border-t bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <Button type="button" variant="outline" className="rounded-xl" onClick={requestLeave}>ยกเลิก</Button>
          {saveButton}
        </div>
      </form>
    </div>
  );
}

function EditorSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white shadow-sm">
      <div className="px-5 pb-1 pt-5 md:px-6">
        <h2 className="font-heading text-base font-semibold">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-5 px-5 pb-6 pt-4 md:px-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  htmlFor,
  children
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function inputClass(invalid: boolean) {
  return cn(
    'h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30',
    invalid && 'border-destructive focus:border-destructive focus:ring-destructive/20'
  );
}
