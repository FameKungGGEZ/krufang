import { requireSupabase } from './supabase';

const COVER_BUCKET = 'covers';
const DOWNLOAD_BUCKET = 'free-products';

function safeFileName(fileName: string) {
  return fileName.replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '') || 'file';
}

export async function uploadProductCover(file: File, productId: string) {
  const client = requireSupabase();
  const path = `${productId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error } = await client.storage.from(COVER_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false
  });
  if (error) throw error;
  return client.storage.from(COVER_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function uploadProductDownload(file: File, productId: string) {
  const path = `${productId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const client = requireSupabase();
  const { error } = await client.storage.from(DOWNLOAD_BUCKET).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false
  });
  if (error) throw error;
  return client.storage.from(DOWNLOAD_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function getProductDownloadUrl(fileUrl: string, download?: string | boolean) {
  if (download && /^https?:\/\//i.test(fileUrl)) {
    const url = new URL(fileUrl);
    if (url.pathname.includes(`/storage/v1/object/public/${DOWNLOAD_BUCKET}/`)) {
      url.searchParams.set('download', typeof download === 'string' ? download : 'true');
      return url.toString();
    }
  }
  return fileUrl;
}
