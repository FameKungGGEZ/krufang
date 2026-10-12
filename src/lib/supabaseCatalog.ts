import type { Category, CategoryIcon, Product } from '../types/product';
import { requireSupabase } from './supabase';

type DatabaseRow = Record<string, unknown>;

const CATEGORY_ICONS: CategoryIcon[] = [
  'worksheet',
  'slides',
  'cards',
  'decor',
  'template',
  'video'
];

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function number(value: unknown): number {
  return typeof value === 'number' ? value : Number(value) || 0;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export function categoryFromRow(row: DatabaseRow): Category {
  const icon = text(row.icon);
  return {
    id: text(row.id),
    name: text(row.name),
    color: text(row.bg_color, '#eaf3ff'),
    ink: text(row.ink, '#2464c6'),
    icon: CATEGORY_ICONS.includes(icon as CategoryIcon) ? icon as CategoryIcon : 'worksheet'
  };
}

export function productFromRow(row: DatabaseRow, categories: Category[]): Product {
  const category = categories.find((item) => item.id === text(row.category_id));
  const rawType = text(row.type).toLocaleLowerCase();
  const coverType = text(row.cover_type) === 'video' ? 'video' : 'image';
  const createdAt = text(row.created_at, new Date().toISOString()).slice(0, 10);
  const fileUrl = text(row.file_url);

  return {
    id: text(row.id),
    title: text(row.title),
    description: text(row.description),
    category: text(row.category_name, category?.name ?? ''),
    type: rawType === 'free' || rawType === 'ฟรี' ? 'free' : 'paid',
    price: number(row.price),
    format: text(row.format, 'PDF'),
    cover_type: coverType,
    coverUrl: text(row.cover_url, text(row.thumbnail_url)),
    fileUrl: fileUrl || null,
    fileName: text(row.file_name),
    pages: number(row.pages),
    previewPages: stringList(row.preview_pages),
    fileSize: text(row.file_size),
    grade: text(row.grade),
    tags: stringList(row.tags),
    views: number(row.views),
    clicks: number(row.clicks),
    createdAt,
    published: row.published === true
  };
}

export async function fetchCatalog() {
  const client = requireSupabase();
  const [categoriesResult, productsResult] = await Promise.all([
    client.from('categories').select('*').order('created_at', { ascending: true }),
    client.from('products').select('*').order('created_at', { ascending: false })
  ]);

  if (categoriesResult.error) throw categoriesResult.error;
  if (productsResult.error) throw productsResult.error;

  const categories = (categoriesResult.data ?? []).map((row) => categoryFromRow(row as DatabaseRow));
  const products = (productsResult.data ?? []).map((row) => productFromRow(row as DatabaseRow, categories));
  return { products, categories };
}

export async function persistProduct(product: Product, categories: Category[]) {
  const client = requireSupabase();
  const category = categories.find((item) => item.name === product.category);
  if (!category) throw new Error(`ไม่พบหมวดหมู่ “${product.category}” ในฐานข้อมูล`);

  const { error } = await client.from('products').upsert({
    id: product.id,
    title: product.title,
    description: product.description,
    category_id: category.id,
    category_name: category.name,
    type: product.type === 'free' ? 'ฟรี' : 'ขาย',
    price: product.price,
    format: product.format,
    file_name: product.fileName,
    file_url: product.fileUrl,
    thumbnail_url: product.coverUrl,
    cover_type: product.cover_type,
    cover_url: product.coverUrl,
    pages: product.pages,
    preview_pages: product.previewPages,
    file_size: product.fileSize,
    grade: product.grade,
    tags: product.tags,
    views: product.views,
    clicks: product.clicks,
    published: product.published,
    updated_at: new Date().toISOString()
  });
  if (error) throw error;
}

export async function persistCategory(category: Category) {
  const { error } = await requireSupabase().from('categories').insert({
    id: category.id,
    name: category.name,
    bg_color: category.color,
    ink: category.ink,
    icon: category.icon,
    updated_at: new Date().toISOString()
  });
  if (error) throw error;
}
