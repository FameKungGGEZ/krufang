-- Kru.Fang Studio Supabase setup
-- Run once in the Supabase SQL Editor on a new project.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  bg_color TEXT NOT NULL DEFAULT '#e5f2ff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'ขาย' CHECK (type IN ('ฟรี', 'ขาย')),
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  format TEXT NOT NULL,
  orientation TEXT NOT NULL DEFAULT 'landscape' CHECK (orientation IN ('landscape', 'portrait')),
  file_name TEXT,
  file_url TEXT,
  thumbnail_url TEXT,
  cover_type TEXT NOT NULL DEFAULT 'file' CHECK (cover_type IN ('file', 'image', 'video')),
  cover_url TEXT,
  fb_link TEXT,
  views BIGINT NOT NULL DEFAULT 0 CHECK (views >= 0),
  clicks BIGINT NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_name);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(type);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.categories, public.products, public.settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories, public.products, public.settings TO authenticated;
GRANT INSERT, SELECT ON public.admin_logs TO authenticated;

DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public read access on categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated insert on categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated update on categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated delete on categories" ON public.categories;
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT TO anon, authenticated
  USING (true);
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories"
  ON public.categories FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated insert on products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated update on products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated delete on products" ON public.products;
CREATE POLICY "Anyone can view published products"
  ON public.products FOR SELECT TO anon, authenticated
  USING (published = true OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products"
  ON public.products FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
CREATE POLICY "Anyone can view settings"
  ON public.settings FOR SELECT TO anon, authenticated
  USING (key <> 'admin_password_hash');
DROP POLICY IF EXISTS "Admins manage settings" ON public.settings;
CREATE POLICY "Admins manage settings"
  ON public.settings FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins manage admin logs" ON public.admin_logs;
CREATE POLICY "Admins manage admin logs"
  ON public.admin_logs FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE OR REPLACE FUNCTION public.increment_views(product_id UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.products
  SET views = views + 1
  WHERE id = product_id AND published = true;
$$;

CREATE OR REPLACE FUNCTION public.increment_clicks(product_id UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.products
  SET clicks = clicks + 1
  WHERE id = product_id AND published = true;
$$;

REVOKE ALL ON FUNCTION public.increment_views(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_views(UUID) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_clicks(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_clicks(UUID) TO anon, authenticated;

INSERT INTO public.categories (name, bg_color) VALUES
  ('ใบงาน / แบบฝึกหัด', '#fff4e6'),
  ('สไลด์นำเสนอ', '#e3f2fd'),
  ('Template', '#f3e5f5'),
  ('แผนการสอน', '#e8f5e9'),
  ('สื่อการสอนอื่น ๆ', '#fce4ec')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.settings (key, value) VALUES
  ('site_name', 'Kru.Fang Studio'),
  ('logo_url', 'images/logo.svg'),
  ('facebook_link', 'https://www.facebook.com/')
ON CONFLICT (key) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('products', 'products', false, 52428800, ARRAY[
    'application/pdf',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'video/mp4'
  ]),
  ('free-products', 'free-products', true, 52428800, ARRAY[
    'application/pdf',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'video/mp4'
  ]),
  ('paid-products', 'paid-products', false, 52428800, ARRAY[
    'application/pdf',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'video/mp4'
  ]),
  ('covers', 'covers', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'video/mp4']),
  ('logos', 'logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view product files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view free product files" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage free product files" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage paid product files" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage covers" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access on product-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access on product-covers" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access on product-thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload on product-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload on product-covers" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload on product-thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete on product-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete on product-covers" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete on product-thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update on product-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update on product-covers" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update on product-thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload product files" ON storage.objects;
DROP POLICY IF EXISTS "Admins update product files" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete product files" ON storage.objects;
DO $$
DECLARE
  existing_policy RECORD;
BEGIN
  FOR existing_policy IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND (
        COALESCE(qual, '') ~* 'bucket_id.*(products|covers|logos)'
        OR COALESCE(with_check, '') ~* 'bucket_id.*(products|covers|logos)'
      )
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', existing_policy.policyname);
  END LOOP;
END;
$$;

CREATE POLICY "Public can view free product files"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('free-products', 'covers', 'logos'));

CREATE POLICY "Admins manage free product files"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'free-products' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (bucket_id = 'free-products' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admins manage paid product files"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id IN ('products', 'paid-products') AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (bucket_id IN ('products', 'paid-products') AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admins manage covers"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'covers' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (bucket_id = 'covers' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admins manage logos"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'logos' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (bucket_id = 'logos' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
