import React, { useState } from 'react';
import { VideoOff } from 'lucide-react';
import { PreviewShell } from './PreviewShell';

interface VideoPreviewProps {
  title: string;
  src: string;
  poster?: string;
  fileSize?: string;
  label?: string;
  showWatermark?: boolean;
  format?: string;
}

export function VideoPreview({ title, src, poster, fileSize, label, showWatermark = true, format = 'MP4' }: VideoPreviewProps) {
  const [error, setError] = useState(false);
  const videoMimeTypes: Record<string, string> = {
    MP4: 'video/mp4',
    WEBM: 'video/webm',
    OGV: 'video/ogg',
    MOV: 'video/quicktime',
    M4V: 'video/x-m4v'
  };

  return (
    <PreviewShell label={label ?? title} meta={fileSize} format={format}>
      <div className="flex aspect-video items-center justify-center bg-black">
        {error ?
        <div className="flex flex-col items-center gap-2 text-center text-white/80">
            <VideoOff className="size-8" />
            <p className="text-sm font-medium">ไม่สามารถเล่นวิดีโอได้</p>
          </div> :

        <div className="relative h-full w-full">
            <video
            controls
            playsInline
            preload="metadata"
            poster={poster}
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            onError={() => setError(true)}
            className="h-full w-full"
            aria-label={title}>
            
              <source src={src} type={videoMimeTypes[format.toUpperCase()]} onError={() => setError(true)} />
            </video>
            {showWatermark &&
          <span className="pointer-events-none absolute right-3 top-3 rounded-md bg-black/50 px-2 py-1 font-mono text-[10px] tracking-widest text-white/80">
                © KRU.FANG STUDIO
              </span>
          }
          </div>
        }
      </div>
    </PreviewShell>);

}