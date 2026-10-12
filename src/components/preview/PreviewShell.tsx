import React, { useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { cn } from '../../utils/cn';

interface PreviewShellProps {
  label: string;
  meta?: string;
  format?: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function PreviewShell({
  label,
  meta,
  format,
  expanded = false,
  onToggleExpand,
  actions,
  footer,
  children
}: PreviewShellProps) {
  useEffect(() => {
    if (!expanded || !onToggleExpand) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onToggleExpand();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded, onToggleExpand]);

  return (
    <section
      aria-label={label}
      className={cn(
        'flex flex-col overflow-hidden border bg-card text-card-foreground',
        expanded ? 'fixed inset-0 z-50 rounded-none' : 'relative rounded-xl shadow-sm'
      )}>
      
      <header className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {format &&
          <Badge variant="secondary" className="font-mono text-[11px]">
              {format}
            </Badge>
          }
          <span className="truncate text-sm font-medium">{label}</span>
          {meta && <span className="hidden text-xs text-muted-foreground sm:inline">· {meta}</span>}
        </div>
        <div className="flex items-center gap-1">
          {actions}
          {onToggleExpand &&
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleExpand}
            aria-label={expanded ? 'ย่อหน้าจอ' : 'ขยายเต็มจอ'}>
            
              {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </Button>
          }
        </div>
      </header>
      <div className={cn('relative flex-1 bg-muted', expanded && 'min-h-0')}>{children}</div>
      {footer && <footer className="border-t bg-card">{footer}</footer>}
    </section>);

}