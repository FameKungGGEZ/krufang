import React, { useState } from 'react';
import {
  Check,
  ImagePlus,
  Images,
  Loader2,
  Store,
  Upload,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { facebookUrl, heroSlides } from '../../data/products';
import { cn } from '../../utils/cn';

const INITIAL_STORE_NAME = 'Kru.Fang Studio';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function AdminSettings() {
  const [storeName, setStoreName] = useState(INITIAL_STORE_NAME);
  const [facebook, setFacebook] = useState(facebookUrl);
  const [logo, setLogo] = useState('');
  const [kept, setKept] = useState<string[]>(heroSlides);
  const [slides, setSlides] = useState<string[]>(heroSlides);
  const [saved, setSaved] = useState({
    storeName: INITIAL_STORE_NAME,
    facebook: facebookUrl,
    logo: '',
    kept: heroSlides,
    slides: heroSlides
  });
  const [saving, setSaving] = useState(false);

  const currentSettings = { storeName, facebook, logo, kept, slides };
  const dirty = JSON.stringify(currentSettings) !== JSON.stringify(saved);

  const toggle = (url: string) =>
    setKept((current) => current.includes(url) ? current.filter((item) => item !== url) : [...current, url]);

  const handleImage = (file: File | undefined, target: 'logo' | 'slide') => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('รูปภาพต้องมีขนาดไม่เกิน 5 MB');
      return;
    }
    const url = URL.createObjectURL(file);
    if (target === 'logo') {
      setLogo((current) => {
        if (current.startsWith('blob:')) URL.revokeObjectURL(current);
        return url;
      });
      return;
    }
    setSlides((current) => [...current, url]);
    setKept((current) => [...current, url]);
  };

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!storeName.trim()) {
      toast.error('กรุณาใส่ชื่อร้าน');
      document.getElementById('site-name')?.focus();
      return;
    }
    if (facebook && !/^https?:\/\/.+/i.test(facebook)) {
      toast.error('กรุณาตรวจสอบลิงก์ Facebook');
      document.getElementById('fb-link')?.focus();
      return;
    }
    if (kept.length === 0) {
      toast.error('เลือกภาพหน้าแรกอย่างน้อย 1 ภาพ');
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setSaved(currentSettings);
      setSaving(false);
      toast.success('บันทึกการตั้งค่าแล้ว');
    }, 600);
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <EditorSection
        icon={Store}
        title="ข้อมูลร้าน"
        description="ข้อมูลที่ลูกค้าจะเห็นบนหน้าร้านและช่องทางติดต่อ"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="site-name"
            label="ชื่อร้าน"
            hint="ใช้ชื่อที่ลูกค้ารู้จักและจดจำได้ง่าย"
            required
          >
            <input
              id="site-name"
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
              maxLength={80}
              placeholder="เช่น Kru.Fang Studio"
              required
              className={inputClass}
            />
          </Field>
          <Field
            id="fb-link"
            label="ลิงก์ Facebook"
            hint="ใช้เป็นช่องทางติดต่อและสั่งซื้อสินค้า"
          >
            <input
              id="fb-link"
              type="url"
              value={facebook}
              onChange={(event) => setFacebook(event.target.value)}
              placeholder="https://www.facebook.com/your-page"
              className={inputClass}
            />
          </Field>
        </div>
        <Field
          id="logo-file"
          label="โลโก้ร้าน"
          hint="PNG, JPG หรือ WebP ขนาดไม่เกิน 5 MB"
        >
          <div className="flex flex-col gap-4 rounded-xl border bg-brand-canvas/70 p-4 sm:flex-row sm:items-center">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-white shadow-sm">
              {logo ? (
                <img src={logo} alt="ตัวอย่างโลโก้ร้าน" className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center bg-primary text-primary-foreground">
                  <Store className="size-7" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{logo ? 'เลือกโลโก้ใหม่แล้ว' : 'เพิ่มโลโก้เพื่อสร้างเอกลักษณ์ให้ร้าน'}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">รูปสี่เหลี่ยมจัตุรัสจะแสดงผลได้ชัดเจนทั้งบนมือถือและคอมพิวเตอร์</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <label
                htmlFor="logo-file"
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border bg-white px-3.5 text-sm font-medium transition hover:border-primary/40 hover:bg-secondary/40"
              >
                <Upload className="size-4" />
                {logo ? 'เปลี่ยนโลโก้' : 'เลือกโลโก้'}
              </label>
              {logo && (
                <button
                  type="button"
                  onClick={() => {
                    if (logo.startsWith('blob:')) URL.revokeObjectURL(logo);
                    setLogo('');
                  }}
                  aria-label="ลบโลโก้"
                  className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              )}
              <input
                id="logo-file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => handleImage(event.target.files?.[0], 'logo')}
              />
            </div>
          </div>
        </Field>
      </EditorSection>

      <EditorSection
        icon={Images}
        title="ภาพหน้าแรก"
        description="เลือกภาพที่ต้องการแสดงบนหน้าร้าน และเพิ่มภาพใหม่ได้"
        action={
          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            เลือกแล้ว {kept.length}/{slides.length}
          </span>
        }
      >
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {slides.map((url, index) => {
            const selected = kept.includes(url);
            return (
              <li key={url}>
                <button
                  type="button"
                  onClick={() => toggle(url)}
                  aria-pressed={selected}
                  aria-label={`ภาพหน้าแรกที่ ${index + 1}${selected ? ' เลือกแล้ว' : ' ยังไม่เลือก'}`}
                  className={cn(
                    'group relative block w-full overflow-hidden rounded-xl border-2 bg-brand-canvas text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    selected ? 'border-primary shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  )}
                >
                  <img src={url} alt="" className="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                  <span className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <span className="text-xs font-medium">{index < heroSlides.length ? `ภาพแนะนำ ${index + 1}` : 'ภาพที่เพิ่มใหม่'}</span>
                    <span className={cn('flex size-5 items-center justify-center rounded-full border', selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-white text-transparent')}>
                      <Check className="size-3" />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          <li>
            <label className="flex aspect-[16/10] h-full min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-brand-canvas/50 px-4 text-center transition hover:border-primary/50 hover:bg-secondary/30">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                <ImagePlus className="size-5" />
              </span>
              <span className="mt-2 text-sm font-medium">เพิ่มภาพใหม่</span>
              <span className="mt-0.5 text-xs text-muted-foreground">PNG, JPG หรือ WebP · ไม่เกิน 5 MB</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => {
                  handleImage(event.target.files?.[0], 'slide');
                  event.target.value = '';
                }}
              />
            </label>
          </li>
        </ul>
        <div className="flex items-start gap-2.5 rounded-xl border border-secondary bg-secondary/30 px-3.5 py-3 text-xs leading-relaxed text-secondary-foreground">
          <Check className="mt-0.5 size-4 shrink-0" />
          คลิกภาพเพื่อเลือกหรือยกเลิก ระบบจะแสดงเฉพาะภาพที่เลือกไว้บนหน้าร้าน
        </div>
      </EditorSection>

      <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-2xl border bg-white/95 p-3 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-muted-foreground">
          {dirty ? 'มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก' : 'การตั้งค่าร้านเป็นปัจจุบันแล้ว'}
        </p>
        <Button type="submit" size="lg" className="rounded-xl" disabled={saving || !dirty}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          {saving ? 'กำลังบันทึก…' : 'บันทึกการตั้งค่า'}
        </Button>
      </div>
    </form>
  );
}

function EditorSection({
  icon: Icon,
  title,
  description,
  action,
  children
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b bg-gradient-to-r from-white to-brand-canvas/70 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <Icon className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-base font-semibold">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  required,
  children
}: {
  id: string;
  label: string;
  hint: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-destructive" aria-hidden="true">*</span>}
      </label>
      {children}
      <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
    </div>
  );
}

const inputClass = 'h-11 w-full rounded-xl border bg-white px-3.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30';
