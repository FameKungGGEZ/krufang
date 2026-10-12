import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Gift, Lock, Play } from 'lucide-react';
import type { Product } from '../../types/product';
import { formatNumber, formatPrice } from '../../utils/format';

export function ProductCard({ product }: {product: Product;}) {
  const isFree = product.type === 'free';

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition duration-200 hover:-translate-y-1 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.coverUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${
          isFree ? 'bg-brand-mint text-brand-mint-ink' : 'bg-brand-pink-soft text-brand-pink-ink'}`
          }>
          
          {isFree ? <Gift className="size-3" /> : <Lock className="size-3" />}
          {isFree ? 'ดาวน์โหลดฟรี' : 'สินค้าลิขสิทธิ์'}
        </span>
        <span className="absolute right-3 top-3 rounded-md bg-white/90 px-1.5 py-0.5 font-mono text-[10px] font-semibold shadow-sm">
          {product.format}
        </span>
        {product.format === 'MP4' &&
        <span className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md">
            <Play className="ml-0.5 size-5 fill-primary text-primary" />
          </span>
        }
        <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[9px] font-semibold tracking-[0.2em] text-white/80 drop-shadow">
          KRU.FANG
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-muted-foreground">
          {product.category} · {product.grade}
        </p>
        <h3 className="mt-1 line-clamp-2 font-semibold leading-snug">{product.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className={`font-heading text-lg font-medium ${isFree ? 'text-brand-mint-ink' : 'text-brand-pink-ink'}`}>
            {isFree ? 'ฟรี' : formatPrice(product.price)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="size-3.5" />
            {formatNumber(product.views)}
          </span>
        </div>
      </div>
    </Link>);

}