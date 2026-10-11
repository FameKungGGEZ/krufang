# 🚀 คู่มือ Deploy Kru.Fang Studio

## 📋 สิ่งที่ต้องเตรียม

1. **บัญชี Vercel** (สมัครฟรีที่ [vercel.com](https://vercel.com))
2. **บัญชี Supabase** (สมัครฟรีที่ [supabase.com](https://supabase.com))
3. **Git Repository** (GitHub, GitLab, หรือ Bitbucket)

---

## 🗄️ ขั้นตอนที่ 1: ตั้งค่า Supabase

### 1.1 สร้าง Project ใหม่
1. เข้า [supabase.com](https://supabase.com) และ Login
2. คลิก **"New Project"**
3. ตั้งชื่อ Project: `kru-fang-studio`
4. ตั้งรหัสผ่าน Database (เก็บไว้ดี!)
5. เลือก Region ใกล้ที่สุด (แนะนำ: **Singapore**)
6. คลิก **"Create new project"** และรอ 1-2 นาที

### 1.2 รัน SQL Schema
1. ไปที่ **SQL Editor** (เมนูด้านซ้าย)
2. คลิก **"New Query"**
3. Copy โค้ดล่าสุดจากไฟล์ `supabase-setup.sql` ทั้งหมด (ตั้งค่าตาราง, RLS, functions และ Storage buckets)
4. วางในช่อง Query
5. คลิก **"Run"** (หรือกด Ctrl+Enter)
6. ตรวจสอบว่าขึ้น ✅ สำเร็จ

ไฟล์ SQL จะสร้าง buckets:
- `free-products` สำหรับไฟล์ต้นฉบับสินค้าฟรี (อ่านและดาวน์โหลดสาธารณะ)
- `paid-products` สำหรับไฟล์ต้นฉบับสินค้าขาย (private; แคตตาล็อกไม่เผยแพร่ไฟล์นี้ เพราะสั่งซื้อผ่าน Facebook)
- `covers` และ `logos` สำหรับภาพตัวอย่างและโลโก้ (อ่านสาธารณะ)

การอัปโหลด/แก้ไข/ลบไฟล์จำกัดไว้สำหรับผู้ใช้ที่มี `app_metadata.role = admin` หากเคยรัน SQL ชุดก่อนแล้ว ให้รันสคริปต์เวอร์ชันล่าสุดซ้ำเพื่อปรับ policy และทำ bucket `products` เดิมให้ private

### 1.3 สร้างบัญชีผู้ดูแล
1. ไปที่ **Authentication → Users** แล้วสร้างบัญชีอีเมล/รหัสผ่าน
2. คัดลอก User ID แล้วกำหนด app metadata ด้วย SQL:

\`\`\`sql
UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
WHERE id = 'USER_UUID';
\`\`\`

อย่าเก็บรหัสผ่านผู้ดูแลใน frontend หรือ environment variable ที่ขึ้นต้นด้วย `VITE_`; ระบบยืนยันตัวตนผ่าน Supabase Auth

### 1.4 เก็บ API Keys
1. ไปที่ **Settings** → **API**
2. เก็บค่าเหล่านี้:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (คีย์ยาวๆ)

---

## 🌐 ขั้นตอนที่ 2: Push โค้ดขึ้น Git

### 2.1 สร้าง Repository
```bash
cd C:\Users\LENOVO\Downloads\teachers-studio-prototype

# เริ่ม Git
git init
git add .
git commit -m "Initial commit: Kru.Fang Studio"

# เชื่อมต่อกับ GitHub (ตัวอย่าง)
git remote add origin https://github.com/your-username/kru-fang-studio.git
git branch -M main
git push -u origin main
```

---

## ☁️ ขั้นตอนที่ 3: Deploy บน Vercel

### 3.1 เชื่อมต่อ Repository
1. เข้า [vercel.com](https://vercel.com) และ Login
2. คลิก **"Add New..." → Project**
3. เลือก Repository: `kru-fang-studio`
4. คลิก **"Import"**

### 3.2 ตั้งค่า Environment Variables
ใน **Environment Variables** ให้เพิ่ม:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` (คีย์จาก Supabase) |

ให้ใช้ Build Command `npm run build` และ Output Directory `dist` (Vercel ตรวจพบค่าจาก `vercel.json` ได้) จากนั้น Vercel จะ deploy ไฟล์ที่ Vite สร้าง พร้อมไฟล์ใน `public/`

### 3.3 Deploy!
1. คลิก **"Deploy"**
2. รอ 1-2 นาที
3. เสร็จแล้ว! 🎉

คุณจะได้ URL เช่น: `https://kru-fang-studio.vercel.app`

---

## 🔧 ขั้นตอนที่ 4: ทดสอบและอัปโหลดสินค้า

### 4.1 เข้าหน้า Admin
1. เปิดเว็บไซต์ที่ Deploy แล้ว
2. **คลิกที่โลโก้ 5 ครั้งติดกัน** (ภายใน 2 วินาที)
3. ลงชื่อเข้าใช้ด้วยอีเมลและรหัสผ่านของบัญชี Supabase Auth ที่มี `app_metadata.role = admin`
4. เข้าหน้า Admin สำเร็จ!

### 4.2 อัปโหลดสินค้าทดสอบ
1. ไปที่ **"จัดการสินค้า"**
2. คลิก **"เพิ่มสินค้าใหม่"**
3. กรอกข้อมูล:
   - ชื่อสินค้า
   - คำอธิบาย
   - หมวดหมู่
   - ประเภท (ฟรี/ขาย)
   - อัปโหลดไฟล์
4. คลิก **"บันทึก"**

ไฟล์ ZIP ที่อยู่ในโฟลเดอร์ตัวอย่างมีภาพตัวอย่างอยู่ภายใน; แตก ZIP ก่อน แล้วเลือกไฟล์ที่ต้องการอัปโหลดเป็นภาพปก/ตัวอย่าง หรือเลือก ZIP ต้นฉบับเองเป็นไฟล์สินค้า.

### 4.3 ตรวจสอบหน้าร้าน
1. กลับไปหน้าหลัก
2. ดูว่าสินค้าแสดงถูกต้อง
3. ทดสอบคลิกดูรายละเอียด
4. ทดสอบดาวน์โหลด (สำหรับสินค้าฟรี)

---

## 🎨 Customization

### เปลี่ยนโลโก้
1. เข้าหน้า Admin
2. ไปที่ **"ตั้งค่า"**
3. อัปโหลดโลโก้ PNG, JPG หรือ WebP แล้วบันทึก; ไฟล์จะถูกเก็บใน Supabase Storage

### เปลี่ยนชื่อร้านและข้อมูลร้าน
ใช้หน้า Admin → ตั้งค่าร้าน เพื่อเปลี่ยนชื่อร้าน ลิงก์ Facebook และโลโก้; ค่าจะถูกบันทึกใน Supabase

### เปลี่ยนสี Theme
แก้ใน `<style>` ของ `index.html`:
```css
:root {
  --primary: #4a90e2;  /* สีหลัก */
  --accent: #f39c12;   /* สีเน้น */
  /* ... */
}
```

---

## 🔒 Security Checklist

- ✅ ใช้บัญชี Supabase Auth และกำหนด `app_metadata.role = admin`
- ✅ เปิด RLS (Row Level Security) ใน Supabase
- ✅ ตั้งค่า Storage Policies ให้ถูกต้อง
- ✅ ไม่ commit ไฟล์ `.env` ขึ้น Git
- ✅ ใช้ HTTPS ทุกครั้ง (Vercel ให้ฟรี)

---

## 📊 การติดตามสถิติ

ดูสถิติใน Admin Dashboard:
- ยอดวิวสินค้า
- ยอดคลิก/ดาวน์โหลด
- จำนวนสินค้าทั้งหมด
- หมวดหมู่ยอดนิยม

---

## ❓ Troubleshooting

### ปัญหา: สินค้าไม่แสดง
- ตรวจสอบว่าสินค้า `published = true`
- ตรวจสอบ Console ว่ามี error หรือไม่ (F12)
- ตรวจสอบ RLS Policies ใน Supabase

### ปัญหา: อัปโหลดไฟล์ไม่ได้
- ตรวจสอบว่ารัน `supabase-setup.sql` เวอร์ชันล่าสุดและผู้ใช้มี `app_metadata.role = admin`
- Bucket `paid-products` ต้องเป็น Private; เฉพาะ bucket `free-products`, `covers` และ `logos` ที่อ่านได้แบบสาธารณะ
- ตรวจสอบขนาดไฟล์ (Supabase Free Plan จำกัด 50 MB/ไฟล์)

### ปัญหา: ไม่เชื่อมต่อ Supabase
- ตรวจสอบ Environment Variables ใน Vercel
- ตรวจสอบ API Keys ว่าถูกต้อง
- ตรวจสอบ Network Tab (F12) ว่ามี CORS error หรือไม่

---

## 📞 ติดต่อ

มีปัญหาหรือข้อสงสัย?
- 📧 Email: support@krufang.studio
- 💬 Facebook: fb.com/krufangstudio

---

✨ **ขอให้ Deploy สำเร็จ!** ✨
