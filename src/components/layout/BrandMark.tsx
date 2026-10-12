import React from 'react';
import { GraduationCap } from 'lucide-react';

interface BrandMarkProps {
  onLogoClick?: () => void;
  compact?: boolean;
}

export function BrandMark({ onLogoClick, compact = false }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={onLogoClick}
        aria-label="Kru.Fang Studio"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition active:scale-95">
        
        <GraduationCap className="size-5" />
      </button>
      {!compact &&
      <div className="leading-tight">
          <p className="whitespace-nowrap font-heading text-lg font-medium">Kru.Fang Studio</p>
          <p className="hidden text-[11px] text-muted-foreground sm:block">สื่อการสอน & Template สำหรับครู</p>
        </div>
      }
    </div>);

}