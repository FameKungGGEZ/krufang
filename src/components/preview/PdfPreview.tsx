import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, ZoomIn, ZoomOut, PanelLeft } from 'lucide-react';
import { Button } from '../Button';
import { cn } from '../../utils/cn';
import { Skeleton } from '../Skeleton';
import { PreviewShell } from './PreviewShell';
import { Watermark } from './Watermark';

interface PdfPreviewProps {
  title: string;
  pages: string[];
  isFree: boolean;
  fileSize: string;
}

const ZOOM_STEPS = [0.75, 1, 1.25, 1.5];
const AUTO_INTERVAL = 3500;

export function PdfPreview({ title, pages, isFree, fileSize }: PdfPreviewProps) {
  const [page, setPage] = useState(0);
  const [zoomIndex, setZoomIndex] = useState(1);
  const [loading, setLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showThumbs, setShowThumbs] = useState(true);
  const [direction, setDirection] = useState(1);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const total = pages.length;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      setDirection(clamped >= page ? 1 : -1);
      setPage(clamped);
    },
    [page, total]
  );

  useEffect(() => {
    thumbRefs.current[page]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [page]);

  useEffect(() => {
    if (!autoScroll) return;
    const id = setInterval(() => {
      setDirection(1);
      setPage((p) => (p + 1) % total);
    }, AUTO_INTERVAL);
    return () => clearInterval(id);
  }, [autoScroll, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (e.key === 'ArrowRight') goTo(page + 1);
      if (e.key === 'ArrowLeft') goTo(page - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, page]);

  const zoom = ZOOM_STEPS[zoomIndex];
  const progress = (page + 1) / total * 100;

  const footer =
  <div className="flex flex-col">
      <div className="h-0.5 w-full bg-muted" aria-hidden="true">
        <motion.div className="h-full bg-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => goTo(page - 1)} disabled={page === 0 || loading}>
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">ก่อนหน้า</span>
          </Button>
          <span className="min-w-[88px] text-center text-sm tabular-nums text-muted-foreground" aria-live="polite">
            หน้า <span className="font-medium text-foreground">{page + 1}</span> / {total}
          </span>
          <Button variant="outline" size="sm" onClick={() => goTo(page + 1)} disabled={page === total - 1 || loading}>
            <span className="hidden sm:inline">ถัดไป</span>
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          {isFree &&
        <Button
          variant={autoScroll ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setAutoScroll((v) => !v)}
          aria-pressed={autoScroll}
          disabled={loading}>
          
              {autoScroll ? <Pause className="size-4" /> : <Play className="size-4" />}
              <span className="hidden sm:inline">เลื่อนอัตโนมัติ</span>
            </Button>
        }
          <div className="ml-1 flex items-center rounded-md border">
            <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
            disabled={zoomIndex === 0}
            aria-label="ซูมออก">
            
              <ZoomOut className="size-4" />
            </Button>
            <span className="w-11 text-center text-xs tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
            <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            aria-label="ซูมเข้า">
            
              <ZoomIn className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>;


  return (
    <PreviewShell
      label={title}
      meta={`${total} หน้า · ${fileSize}`}
      format="PDF"
      expanded={expanded}
      onToggleExpand={() => setExpanded((v) => !v)}
      actions={
      <Button
        variant={showThumbs ? 'secondary' : 'ghost'}
        size="icon-sm"
        className="hidden md:inline-flex"
        onClick={() => setShowThumbs((v) => !v)}
        aria-label="แสดงภาพย่อ"
        aria-pressed={showThumbs}>
        
          <PanelLeft className="size-4" />
        </Button>
      }
      footer={footer}>
      
      <div className={cn('flex', expanded ? 'h-full' : 'h-[520px] md:h-[600px]')}>
        {showThumbs &&
        <nav
          aria-label="ภาพย่อหน้า"
          className="hidden w-28 shrink-0 flex-col gap-3 overflow-y-auto border-r bg-card p-3 md:flex">
          
            {loading ?
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-full" />) :
          pages.map((src, i) =>
          <button
            key={i}
            ref={(el) => thumbRefs.current[i] = el}
            onClick={() => goTo(i)}
            aria-label={`ไปหน้า ${i + 1}`}
            aria-current={i === page ? 'page' : undefined}
            className="group flex flex-col items-center gap-1 focus-visible:outline-none">
            
                    <span
              className={cn(
                'block w-full overflow-hidden rounded-md border bg-white transition-all',
                i === page ?
                'ring-2 ring-primary ring-offset-2 ring-offset-card' :
                'opacity-70 group-hover:opacity-100 group-focus-visible:ring-2 group-focus-visible:ring-ring'
              )}>
              
                      <img src={src} alt="" className="aspect-[3/4] w-full object-cover" loading="lazy" />
                    </span>
                    <span
              className={cn(
                'text-[11px] tabular-nums',
                i === page ? 'font-medium text-foreground' : 'text-muted-foreground'
              )}>
              
                      {i + 1}
                    </span>
                  </button>
          )}
          </nav>
        }

        <div className="relative flex-1 overflow-auto">
          {loading ?
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
              <Skeleton className="aspect-[3/4] h-[80%] max-h-[480px] rounded-sm" />
              <span className="text-xs text-muted-foreground">กำลังโหลดตัวอย่าง PDF…</span>
            </div> :

          <div className="flex min-h-full items-center justify-center p-6">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                key={page}
                custom={direction}
                initial={{ opacity: 0, x: direction * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -24 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="relative shrink-0 overflow-hidden rounded-sm bg-white shadow-lg ring-1 ring-border">
                
                  <img
                  src={pages[page]}
                  alt={`หน้า ${page + 1} จาก ${total}`}
                  className="block h-full w-auto select-none object-contain"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ height: expanded ? `calc((100vh - 200px) * ${zoom})` : 480 * zoom }} />
                
                  <Watermark />
                </motion.div>
              </AnimatePresence>
            </div>
          }

          {!loading &&
          <>
              <button
              onClick={() => goTo(page - 1)}
              disabled={page === 0}
              aria-label="หน้าก่อนหน้า"
              className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background/90 shadow-sm transition hover:bg-background disabled:pointer-events-none disabled:opacity-0 sm:flex">
              
                <ChevronLeft className="size-5" />
              </button>
              <button
              onClick={() => goTo(page + 1)}
              disabled={page === total - 1}
              aria-label="หน้าถัดไป"
              className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background/90 shadow-sm transition hover:bg-background disabled:pointer-events-none disabled:opacity-0 sm:flex">
              
                <ChevronRight className="size-5" />
              </button>
            </>
          }
        </div>
      </div>
    </PreviewShell>);

}