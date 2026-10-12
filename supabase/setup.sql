-- Add this storefront's fields and seed the demo catalog into the existing schema.
-- This migration intentionally preserves the current RLS policies, auth role model,
-- category/product rows, storage buckets, and uploaded media.
begin;

alter table public.categories
  add column if not exists ink text not null default '#2464c6',
  add column if not exists icon text not null default 'worksheet';

alter table public.products
  add column if not exists pages integer not null default 0,
  add column if not exists preview_pages text[] not null default '{}',
  add column if not exists file_size text not null default '',
  add column if not exists grade text not null default '',
  add column if not exists tags text[] not null default '{}';

-- Allow all download file types; uploads remain restricted by the existing admin Storage policy.
update storage.buckets
set allowed_mime_types = null
where id = 'free-products';

insert into public.categories (name, bg_color, ink, icon)
values
  ('ใบงาน', '#fff0c8', '#8a6212', 'worksheet'),
  ('สไลด์', '#eaf3ff', '#2464c6', 'slides'),
  ('บัตรคำ', '#ffe5ef', '#bf356b', 'cards'),
  ('ตกแต่งห้องเรียน', '#dff8ee', '#087c5b', 'decor'),
  ('Template', '#efeaff', '#5b45c9', 'template'),
  ('วิดีโอ', '#e3f6fb', '#0e7490', 'video')
on conflict (name) do update
set bg_color = excluded.bg_color,
    ink = excluded.ink,
    icon = excluded.icon,
    updated_at = now();

insert into public.products (
  id, title, description, category_id, category_name, type, price, format,
  orientation, file_name, file_url, thumbnail_url, cover_type, cover_url,
  pages, preview_pages, file_size, grade, tags, views, clicks, published, created_at
)
values
  (
    '00000000-0000-4000-8000-000000000101',
    'ชุดฝึกเขียน ก-ฮ สำหรับเด็กอนุบาล',
    'ใบงานฝึกลากเส้น นับเลข และระบายสี พร้อมพิมพ์ใช้ในห้องเรียน เหมาะกับเด็กอายุ 3-6 ปี',
    (select id from public.categories where name = 'ใบงาน'),
    'ใบงาน', 'ฟรี', 0, 'PDF', 'portrait',
    'thai-alphabet-tracing.pdf', null,
    '/51ab3d18-ebe8-499e-a800-5ce73dbbc959.jpg', 'image',
    '/51ab3d18-ebe8-499e-a800-5ce73dbbc959.jpg', 9,
    array[
      '/e016aae8-3f83-4074-a860-fbdbf90fcba4.jpg',
      '/ad8f71c2-e449-43d0-b928-94a4103a0632.jpg',
      '/4590ce46-e42c-41c3-9c39-b2021d3b77cb.jpg'
    ],
    '4.2 MB', 'อนุบาล 1-3', array['ภาษาไทย', 'พร้อมพิมพ์'],
    1840, 612, false, '2026-09-28'
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    'สไลด์การสอนคณิตศาสตร์ ป.1 เรื่องจำนวน',
    'สไลด์ 24 หน้าพร้อมแอนิเมชัน อธิบายจำนวนนับ 1-100 ด้วยภาพประกอบ',
    (select id from public.categories where name = 'สไลด์'),
    'สไลด์', 'ขาย', 89, 'PPTX', 'landscape',
    'math-p1-numbers.pptx', null,
    '/c3be285a-d3d7-405e-a46e-fb219fd1639f.jpg', 'image',
    '/c3be285a-d3d7-405e-a46e-fb219fd1639f.jpg', 24, '{}',
    '12.8 MB', 'ประถม 1', array['คณิตศาสตร์', 'แก้ไขได้'],
    1320, 204, true, '2026-10-02'
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    'แฟลชการ์ดคำศัพท์ภาษาอังกฤษ 120 คำ',
    'บัตรคำศัพท์หมวดสัตว์ ผลไม้ และสิ่งของรอบตัว ภาพสวย สีพาสเทล',
    (select id from public.categories where name = 'บัตรคำ'),
    'บัตรคำ', 'ขาย', 49, 'PDF', 'portrait',
    'english-flashcards-120.pdf', null,
    '/61cc40c0-e650-4a4d-ad07-e62355806674.jpg', 'image',
    '/61cc40c0-e650-4a4d-ad07-e62355806674.jpg', 30, '{}',
    '8.1 MB', 'อนุบาล - ป.3', array['ภาษาอังกฤษ', 'บัตรคำ'],
    2210, 488, true, '2026-09-10'
  ),
  (
    '00000000-0000-4000-8000-000000000104',
    'ชุดตกแต่งห้องเรียนธีมสายรุ้ง',
    'ป้ายต้อนรับ ธงราว และสติกเกอร์ตกแต่งบอร์ด ธีมสายรุ้งสดใส',
    (select id from public.categories where name = 'ตกแต่งห้องเรียน'),
    'ตกแต่งห้องเรียน', 'ฟรี', 0, 'PNG', 'landscape',
    'rainbow-classroom-decor.png', null,
    '/5fe11525-921b-438e-9052-5c2dbf8e0218.jpg', 'image',
    '/5fe11525-921b-438e-9052-5c2dbf8e0218.jpg', 1, '{}',
    '3.4 MB', 'ทุกระดับชั้น', array['ตกแต่ง', 'บอร์ด'],
    980, 351, false, '2026-10-06'
  ),
  (
    '00000000-0000-4000-8000-000000000105',
    'เกียรติบัตรนักเรียน แก้ไขชื่อได้',
    'Template เกียรติบัตร 6 แบบ สำหรับมอบรางวัลนักเรียน แก้ไขได้ใน Word และ Canva',
    (select id from public.categories where name = 'Template'),
    'Template', 'ขาย', 39, 'ZIP', 'landscape',
    'student-certificates.zip', null,
    '/b1add61e-3af2-46e2-b4fc-5f01089ab8f1.jpg', 'image',
    '/b1add61e-3af2-46e2-b4fc-5f01089ab8f1.jpg', 6, '{}',
    '6.6 MB', 'ทุกระดับชั้น', array['Template', 'แก้ไขได้'],
    760, 97, true, '2026-10-08'
  ),
  (
    '00000000-0000-4000-8000-000000000106',
    'ใบงานนับเลข 1-10 แสนสนุก',
    'ฝึกนับจำนวนผลไม้และเขียนตัวเลข ช่วยให้เด็กเข้าใจจำนวนผ่านภาพ',
    (select id from public.categories where name = 'ใบงาน'),
    'ใบงาน', 'ฟรี', 0, 'PDF', 'portrait',
    'counting-1-10.pdf', null,
    '/ad8f71c2-e449-43d0-b928-94a4103a0632.jpg', 'image',
    '/ad8f71c2-e449-43d0-b928-94a4103a0632.jpg', 6,
    array[
      '/ad8f71c2-e449-43d0-b928-94a4103a0632.jpg',
      '/e016aae8-3f83-4074-a860-fbdbf90fcba4.jpg',
      '/4590ce46-e42c-41c3-9c39-b2021d3b77cb.jpg'
    ],
    '2.9 MB', 'อนุบาล 2-3', array['คณิตศาสตร์', 'พร้อมพิมพ์'],
    1505, 540, false, '2026-08-30'
  ),
  (
    '00000000-0000-4000-8000-000000000107',
    'สมุดระบายสีสัตว์น่ารัก 20 หน้า',
    'ภาพลายเส้นสัตว์น่ารักสำหรับระบายสี ฝึกกล้ามเนื้อมัดเล็กและสมาธิ',
    (select id from public.categories where name = 'ใบงาน'),
    'ใบงาน', 'ขาย', 59, 'PDF', 'portrait',
    'animal-coloring-book.pdf', null,
    '/4590ce46-e42c-41c3-9c39-b2021d3b77cb.jpg', 'image',
    '/4590ce46-e42c-41c3-9c39-b2021d3b77cb.jpg', 20, '{}',
    '5.2 MB', 'อนุบาล - ป.2', array['ศิลปะ', 'ระบายสี'],
    640, 83, true, '2026-10-09'
  ),
  (
    '00000000-0000-4000-8000-000000000108',
    'วิดีโอเพลงสอนสระภาษาไทย',
    'คลิปเพลงสั้นช่วยจำสระไทยทั้ง 32 ตัว ใช้เปิดในห้องเรียนได้',
    (select id from public.categories where name = 'วิดีโอ'),
    'วิดีโอ', 'ฟรี', 0, 'MP4', 'landscape',
    'thai-vowels-song.mp4', null,
    '/e016aae8-3f83-4074-a860-fbdbf90fcba4.jpg', 'image',
    '/e016aae8-3f83-4074-a860-fbdbf90fcba4.jpg', 0, '{}',
    '18.4 MB', 'อนุบาล - ป.1', array['ภาษาไทย', 'เพลง'],
    1120, 302, false, '2026-09-18'
  )
on conflict (id) do nothing;

commit;

-- New demo rows are idempotent and preserve existing rows. Free products are drafts
-- until their real files are uploaded to the existing `free-products` bucket.
