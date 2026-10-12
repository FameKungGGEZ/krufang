import React from 'react';
import { cn } from '../../utils/cn';
import type { Category } from '../../types/product';
import { CategoryIconGlyph } from './CategoryIconGlyph';

interface CategoryGridProps {
  categories: Category[];
  counts: Record<string, number>;
  selected: string;
  onSelect: (name: string) => void;
}

export function CategoryGrid({ categories, counts, selected, onSelect }: CategoryGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((cat) => {
        const active = selected === cat.name;
        return (
          <li key={cat.id}>
            <button
              type="button"
              onClick={() => onSelect(active ? 'ทั้งหมด' : cat.name)}
              aria-pressed={active}
              className={cn(
                'group flex w-full flex-col items-start gap-4 rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active && 'border-primary ring-2 ring-primary/20'
              )}>
              
              <span
                className="flex size-11 items-center justify-center rounded-xl transition group-hover:scale-105"
                style={{ backgroundColor: cat.color, color: cat.ink }}>
                
                <CategoryIconGlyph icon={cat.icon} className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{cat.name}</span>
                <span className="text-xs text-muted-foreground">{counts[cat.name] ?? 0} รายการ</span>
              </span>
            </button>
          </li>);

      })}
    </ul>);

}