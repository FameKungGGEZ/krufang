import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { PreviewShell } from './PreviewShell';

interface ImageGalleryPreviewProps {
  title: string;
  images: string[];
  format: string;
  fileSize: string;
}

export function ImageGalleryPreview({ title, images, format, fileSize }: ImageGalleryPreviewProps) {
  const [failedImages, setFailedImages] = useState<number[]>([]);

  useEffect(() => {
    setFailedImages([]);
  }, [images]);

  return (
    <PreviewShell
      label={title}
      meta={`${images.length} ภาพตัวอย่าง · ${fileSize}`}
      format={format}
    >
      <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((src, index) => (
          <figure key={`${src}-${index}`} className="overflow-hidden rounded-lg border bg-white p-2 shadow-sm">
            {failedImages.includes(index) ? (
              <div
                role="img"
                aria-label={`โหลดภาพตัวอย่างที่ ${index + 1} ไม่สำเร็จ`}
                className="flex min-h-64 flex-col items-center justify-center gap-2 bg-muted p-4 text-center text-muted-foreground"
              >
                <ImageOff className="size-7" />
                <span className="text-sm">ไม่สามารถโหลดภาพตัวอย่างที่ {index + 1}</span>
              </div>
            ) : (
              <img
                src={src}
                alt={`${title} ภาพตัวอย่างที่ ${index + 1}`}
                loading="lazy"
                onError={() => setFailedImages((current) => [...current, index])}
                className="mx-auto max-h-[520px] w-full object-contain"
              />
            )}
            <figcaption className="pt-2 text-center text-xs text-muted-foreground">
              ภาพตัวอย่างที่ {index + 1}
            </figcaption>
          </figure>
        ))}
      </div>
    </PreviewShell>
  );
}
