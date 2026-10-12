-- Allow every file MIME type in the existing free-products bucket.
-- The bucket remains public, keeps its configured size limit, and existing
-- Storage RLS policies still control who can upload or manage objects.
update storage.buckets
set allowed_mime_types = null
where id = 'free-products'
returning id, allowed_mime_types, file_size_limit, public;
