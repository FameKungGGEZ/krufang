import React from 'react';
import { Download, ExternalLink, FileArchive, UploadCloud } from 'lucide-react';
import { PreviewShell } from './PreviewShell';
import { Watermark } from './Watermark';

interface FilePreviewProps {
  title: string;
  format: string;
  fileSize: string;
  src?: string | null;
}

export function FilePreview({ title, format, fileSize, src }: FilePreviewProps) {
  const normalizedFormat = format.toUpperCase();
  const isPdf = normalizedFormat === 'PDF';
  const isAudio = ['MP3', 'WAV', 'OGG', 'M4A', 'AAC', 'FLAC'].includes(normalizedFormat);
  const isText = ['TXT', 'CSV', 'JSON', 'XML', 'MD', 'LOG'].includes(normalizedFormat);
  const canEmbed = isPdf || isText;

  return (
    <PreviewShell label={title} meta={fileSize} format={format || 'FILE'}>
      {src && canEmbed ? (
        <div>
          <div className="flex items-center justify-end gap-2 border-b bg-card px-3 py-2">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-2 rounded-lg border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted"
            >
              <ExternalLink className="size-3.5" />
              เปิดไฟล์
            </a>
            <a
              href={src}
              download={title}
              className="inline-flex h-8 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Download className="size-3.5" />
              ดาวน์โหลด
            </a>
          </div>
          <iframe
            title={`ตัวอย่างไฟล์ ${title}`}
            src={isPdf ? `${src}#toolbar=1&navpanes=0` : src}
            className="h-[480px] w-full bg-white md:h-[560px]"
          />
        </div>
      ) : (
        <div className="relative flex min-h-[360px] flex-col items-center justify-center gap-4 p-8 text-center">
          {src && isAudio ? (
            <audio controls preload="metadata" className="w-full max-w-lg" aria-label={title}>
              <source src={src} />
              เบราว์เซอร์นี้ไม่รองรับการเล่นไฟล์เสียง
            </audio>
          ) : (
            <div className="relative">
              <div className="flex h-28 w-24 flex-col items-center justify-center rounded-lg border bg-card shadow-sm">
                <FileArchive className="size-9 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <span className="absolute -bottom-2 -right-3 rounded-md bg-primary px-2 py-0.5 font-mono text-[11px] font-semibold text-primary-foreground">
                .{(format || 'file').toLowerCase()}
              </span>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isAudio ? 'เล่นตัวอย่างไฟล์เสียง' : `ไฟล์ ${format || 'ไม่ระบุชนิด'}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {isPdf ? 'หากตัวอย่างไม่แสดงในเบราว์เซอร์ ให้เปิดหรือดาวน์โหลดไฟล์' : 'รูปแบบนี้อาจต้องใช้แอปที่รองรับเพื่อเปิดดู'}
            </p>
          </div>
          {src && (
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                <ExternalLink className="size-4" />
                เปิดไฟล์
              </a>
              <a
                href={src}
                download={title}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Download className="size-4" />
                ดาวน์โหลด
              </a>
            </div>
          )}
          {!src && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <UploadCloud className="size-4" />
              ยังไม่มีไฟล์สำหรับแสดงตัวอย่าง
            </div>
          )}
          <Watermark />
        </div>
      )}
    </PreviewShell>);

}

export function EmptyPreview() {
  return (
    <PreviewShell label="ตัวอย่างไฟล์">
      <div className="flex h-[360px] items-center justify-center p-6">
        <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border-2 border-dashed bg-card p-10 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-muted">
            <UploadCloud className="size-5 text-muted-foreground" />
          </span>
          <p className="text-sm font-medium">ยังไม่มีไฟล์อัปโหลด</p>
          <p className="text-xs text-muted-foreground">ตัวอย่างจะแสดงที่นี่เมื่อผู้ขายอัปโหลดไฟล์แล้ว</p>
        </div>
      </div>
    </PreviewShell>);

}