import type { PreviewProps } from '../../types/product';
import { CoverPreview } from './CoverPreview';
import { ImageGalleryPreview } from './ImageGalleryPreview';
import { ImagePreview } from './ImagePreview';
import { VideoPreview } from './VideoPreview';
import { FilePreview, EmptyPreview } from './FilePreview';

const SAMPLE_VIDEO_PREVIEW_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

export function ProductPreview({ product, isFree, fileUrl, coverUrl }: PreviewProps) {
  const format = String(product.format || '').toUpperCase();
  const isVideo = ['MP4', 'WEBM', 'OGV', 'MOV', 'M4V'].includes(format);

  if (!isFree && coverUrl) {
    const isVideoCover = product.cover_type === 'video' || String(coverUrl).split('?')[0].toLowerCase().endsWith('.mp4');
    return (
      <CoverPreview title={product.title} coverUrl={coverUrl} isVideo={isVideoCover} format={format} pages={product.pages} />);

  }

  if (isFree && product.previewPages.length > 0) {
    return (
      <ImageGalleryPreview
        title={product.fileName || product.title}
        images={product.previewPages}
        format={format}
        fileSize={product.fileSize}
      />
    );
  }

  if (isVideo) {
    if (fileUrl) {
      return <VideoPreview title={product.fileName || product.title} src={fileUrl} poster={product.coverUrl} fileSize={product.fileSize} format={format} />;
    }

    return (
      <div>
        <VideoPreview
          title="คลิปตัวอย่างวิดีโอ"
          label="คลิปตัวอย่างวิดีโอ"
          src={SAMPLE_VIDEO_PREVIEW_URL}
          poster={product.coverUrl}
          format={format}
        />
        <p className="mt-3 text-xs text-muted-foreground">
          คลิปนี้ใช้สำหรับทดสอบการเล่นวิดีโอเท่านั้น ยังไม่มีไฟล์วิดีโอของสินค้านี้ให้อัปโหลดหรือดาวน์โหลด
        </p>
      </div>
    );
  }

  if (!fileUrl) return <EmptyPreview />;

  if (format === 'PDF') {
    return <FilePreview title={product.fileName} format={format} fileSize={product.fileSize} src={fileUrl} />;
  }

  if (['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP', 'BMP', 'SVG', 'AVIF'].includes(format)) {
    return <ImagePreview title={product.fileName} src={fileUrl} format={format} fileSize={product.fileSize} />;
  }

  return <FilePreview title={product.fileName} format={format} fileSize={product.fileSize} src={fileUrl} />;
}