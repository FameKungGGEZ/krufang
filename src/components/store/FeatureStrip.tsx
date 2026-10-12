import React from 'react';
import { LayoutGrid, Search, Eye, Download } from 'lucide-react';

const FEATURES = [
{ icon: LayoutGrid, title: 'หมวดหมู่ชัดเจน', text: 'แยกตามประเภทสื่อ', tone: 'bg-brand-yellow text-brand-yellow-ink' },
{ icon: Search, title: 'ค้นหาและกรอง', text: 'เจอสื่อที่ต้องการได้เร็ว', tone: 'bg-secondary text-secondary-foreground' },
{ icon: Eye, title: 'ดูตัวอย่างผลงาน', text: 'ก่อนดาวน์โหลดหรือซื้อ', tone: 'bg-brand-pink-soft text-brand-pink-ink' },
{ icon: Download, title: 'ดาวน์โหลดหรือสั่งซื้อ', text: 'ฟรี หรือผ่าน Facebook', tone: 'bg-brand-mint text-brand-mint-ink' }];


export function FeatureStrip() {
  return (
    <div className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 md:px-8">
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border shadow-soft lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, text, tone }) =>
        <li key={title} className="flex items-center gap-3 bg-white p-4 md:p-5">
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground">{text}</p>
            </div>
          </li>
        )}
      </ul>
    </div>);

}