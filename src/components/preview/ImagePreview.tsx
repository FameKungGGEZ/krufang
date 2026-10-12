import React, { useState } from 'react';
import { ImageOff, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../Button';
import { cn } from '../../utils/cn';
import { Skeleton } from '../Skeleton';
import { PreviewShell } from './PreviewShell';
import { Watermark } from './Watermark';

interface ImagePreviewProps {
  title: string;
  src: string;
  format: string;
  fileSize: string;
}

export function ImagePreview({ title, src, format, fileSize }: ImagePreviewProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [zoomed, setZoomed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <PreviewShell
      label={title}
      meta={fileSize}
      format={format}
      expanded={expanded}
      onToggleExpand={() => setExpanded((v) => !v)}
      actions={
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setZoomed((v) => !v)}
        disabled={status !== 'ready'}
        aria-label={zoomed ? 'ซูมออก' : 'ซูมเข้า'}>
        
          {zoomed ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />}
        </Button>
      }>
      
      <div className={cn('overflow-auto', expanded ? 'h-full' : 'h-[520px] md:h-[600px]')}>
        {status === 'error' ?
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <ImageOff className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">ไม่สามารถโหลดรูปภาพ</p>
            <p className="text-xs text-muted-foreground">ลองรีเฟรชหน้า หรือดาวน์โหลดไฟล์เพื่อดู</p>
          </div> :

        <div className={cn('flex min-h-full items-center justify-center p-6', zoomed && 'items-start')}>
            {status === 'loading' && <Skeleton className="absolute inset-6 rounded-md" />}
            <button
            type="button"
            onClick={() => setZoomed((v) => !v)}
            className={cn(
              'relative overflow-hidden rounded-sm bg-white shadow-lg ring-1 ring-border transition-[max-width] duration-300',
              zoomed ? 'max-w-none cursor-zoom-out' : 'max-h-full cursor-zoom-in',
              status === 'loading' && 'invisible'
            )}
            aria-label={zoomed ? 'คลิกเพื่อย่อ' : 'คลิกเพื่อขยาย'}>
            
              <img
              src={src}
              alt={title}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onLoad={() => setStatus('ready')}
              onError={() => setStatus('error')}
              className={cn('block select-none', zoomed ? 'w-[180%] max-w-none' : 'max-h-[480px] w-auto')}
              style={expanded && !zoomed ? { maxHeight: 'calc(100vh - 140px)' } : undefined} />
            
              <Watermark />
            </button>
          </div>
        }
      </div>
    </PreviewShell>);

}