import React from 'react';
import { Facebook, Heart } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { facebookUrl } from '../../data/products';

export function SiteFooter() {
  return (
    <footer id="about" className="mt-20 border-t bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
        <div className="space-y-3">
          <BrandMark />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            สร้างสรรค์สื่อการสอนด้วยใจ เพื่อให้ทุกห้องเรียนสนุกและครูสอนได้ง่ายขึ้น
          </p>
        </div>
        <div>
          <h2 className="font-heading text-sm font-medium">ช่วยเหลือ</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>วิธีดาวน์โหลดสื่อฟรี</li>
            <li>วิธีสั่งซื้อผ่าน Facebook</li>
            <li>เงื่อนไขการใช้งานลิขสิทธิ์</li>
          </ul>
        </div>
        <div>
          <h2 className="font-heading text-sm font-medium">ติดต่อเรา</h2>
          <a
            href={facebookUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-secondary">
            
            <Facebook className="size-4 text-primary" />
            Kru.Fang Studio
          </a>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-5 text-xs text-muted-foreground md:px-8">
          © 2026 Kru.Fang Studio · ทำด้วย <Heart className="size-3 fill-brand-pink text-brand-pink" /> สำหรับคุณครูทุกคน
        </p>
        <p className="pb-4 text-center text-xs text-muted-foreground">made by pannathon patto</p>
      </div>
    </footer>);

}