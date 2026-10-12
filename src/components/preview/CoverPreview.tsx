import React, { useState } from 'react';
import { Lock, ImageOff } from 'lucide-react';
import { Skeleton } from '../Skeleton';
import { cn } from '../../utils/cn';
import { PreviewShell } from './PreviewShell';

interface CoverPreviewProps {
  title: string;
  coverUrl: string;
  isVideo: boolean;
  format: string;
  pages: number;
}

export function CoverPreview({ title, coverUrl, isVideo, format, pages }: CoverPreviewProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(isVideo ? 'ready' : 'loading');

  return (
    <PreviewShell label="ภาพตัวอย่างสินค้า" meta={title} format={format}>
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {status === 'loading' && <Skeleton className="absolute inset-0 rounded-none" />}
        {status === 'error' ?
        <div className="flex h-full flex-col items-center justify-center gap-2">
            <ImageOff className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">ไม่สามารถโหลดภาพปก</p>
          </div> :
        isVideo ?
        <video controls playsInline className="h-full w-full bg-black object-contain" aria-label={title}>
            <source src={coverUrl} type="video/mp4" />
          </video> :

        <img
          src={coverUrl}
          alt={title}
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
          className={cn('h-full w-full object-cover transition-opacity duration-300', status === 'ready' ? 'opacity-100' : 'opacity-0')} />

        }

        <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-lg bg-background/95 p-3 shadow-md ring-1 ring-border backdrop-blur">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Lock className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium">เนื้อหาเต็ม {pages > 0 ? `${pages} หน้า` : ''} ปลดล็อกหลังชำระเงิน</p>
            <p className="text-xs text-muted-foreground">นี่คือภาพหน้าปก — ซื้อเพื่อดูและดาวน์โหลดไฟล์ทั้งหมด</p>
          </div>
        </div>
      </div>
    </PreviewShell>);

}