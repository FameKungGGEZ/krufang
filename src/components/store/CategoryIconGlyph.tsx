import React from 'react';
import { FileText, Presentation, Layers, Sparkles, LayoutTemplate, PlayCircle, LayoutGrid } from 'lucide-react';
import type { CategoryIcon } from '../../types/product';

const ICONS: Record<CategoryIcon | 'all', React.ElementType> = {
  worksheet: FileText,
  slides: Presentation,
  cards: Layers,
  decor: Sparkles,
  template: LayoutTemplate,
  video: PlayCircle,
  all: LayoutGrid
};

export function CategoryIconGlyph({ icon, className }: {icon: CategoryIcon | 'all';className?: string;}) {
  const Icon = ICONS[icon];
  return <Icon className={className} aria-hidden="true" />;
}