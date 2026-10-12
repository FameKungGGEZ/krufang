import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Gift, Eye } from 'lucide-react';
import { Button } from '../Button';
import { heroImage } from '../../data/products';

interface HeroSectionProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
}

const POPULAR = ['ใบงาน', 'สไลด์', 'บัตรคำ', 'เกียรติบัตร'];

export function HeroSection({ query, onQueryChange, onSubmit }: HeroSectionProps) {
  return (
    <section id="top" className="bg-brand-sky">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-12 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:pb-24 lg:pt-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-mint-ink shadow-sm ring-1 ring-border">
            <Sparkles className="size-3.5" />
            เติมไอเดียให้ทุกห้องเรียน
          </span>
          <h1 className="mt-5 font-heading text-4xl font-medium leading-[1.25] tracking-tight md:text-5xl">
            สื่อการสอนคุณภาพ
            <br />
            ช่วยให้การสอนของคุณ <span className="text-brand-pink-ink">ง่ายขึ้น!</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            รวม Template ใบงาน สไลด์ และสื่อการสอนหลากหลายรูปแบบ ดูตัวอย่างได้ก่อนดาวน์โหลด พร้อมใช้งานสำหรับคุณครูทุกท่าน
          </p>

          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="mt-7 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-2 shadow-soft ring-1 ring-border focus-within:ring-2 focus-within:ring-primary/40">
            
            <Search className="ml-2 size-5 shrink-0 text-muted-foreground" />
            <label htmlFor="hero-search" className="sr-only">
              ค้นหาสินค้า
            </label>
            <input
              id="hero-search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="ค้นหา เช่น ใบงาน, สไลด์, Template..."
              className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            
            <Button type="submit" size="lg" className="rounded-xl px-6">
              ค้นหา
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">ยอดนิยม:</span>
            {POPULAR.map((tag) =>
            <button
              key={tag}
              type="button"
              onClick={() => {
                onQueryChange(tag);
                onSubmit();
              }}
              className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium ring-1 ring-border transition hover:bg-white hover:ring-primary/40">
              
                {tag}
              </button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mx-auto w-full max-w-lg">
          
          <div className="overflow-hidden rounded-[28px] border-[6px] border-white bg-white shadow-lift">
            <img src={heroImage} alt="โต๊ะทำงานของคุณครูพร้อมใบงานและสไลด์" className="aspect-[4/3] w-full object-cover" />
          </div>
          <div className="absolute -left-4 top-8 hidden items-center gap-2.5 rounded-2xl bg-white p-3 pr-4 shadow-soft ring-1 ring-border sm:flex">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-mint text-brand-mint-ink">
              <Gift className="size-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">ดาวน์โหลดฟรี</p>
              <p className="text-[11px] text-muted-foreground">สื่อใหม่ทุกสัปดาห์</p>
            </div>
          </div>
          <div className="absolute -bottom-5 -right-3 hidden items-center gap-2.5 rounded-2xl bg-white p-3 pr-4 shadow-soft ring-1 ring-border sm:flex">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-pink-soft text-brand-pink-ink">
              <Eye className="size-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">ดูตัวอย่างก่อนซื้อ</p>
              <p className="text-[11px] text-muted-foreground">เปิดดูได้ทุกหน้า</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>);

}