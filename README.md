# Kru.Fang Studio

Thai-language storefront for educational resources, backed by Supabase Database, Auth, and Storage.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the values for your Supabase project.
4. Run `npm run dev`.

The Supabase setup and access policies are defined in `supabase-setup.sql`. Run it in the SQL Editor for a new project, and run the updated script again when applying the public/private Storage bucket changes to an existing project. Public visitors can browse published resources; only authenticated users whose Supabase `app_metadata.role` is `admin` can manage records and upload files.

Original free-product files are stored in public `free-products`, while paid-product originals are stored in private `paid-products` and are not served by this catalogue (orders are handled through Facebook). Product previews and the storefront logo are stored in public `covers` and `logos` buckets.

## Provision an administrator

1. Create the administrator account under Supabase **Authentication → Users** and set its password there.
2. In the SQL Editor, assign the admin role to that user's UUID:

   ```sql
   UPDATE auth.users
   SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   WHERE id = 'USER_UUID';
   ```

3. Sign in using the account's email and password on the admin page. Do not put a service-role key, database password, or admin password in a `VITE_` variable.

The storefront opens the admin sign-in form after five clicks on the logo. The password is checked by Supabase Auth; there is no client-side demo-password bypass.

## Build and deploy

Run `npm run build`. In Vercel, configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as build environment variables, then deploy the project. Never expose a Supabase service-role key in browser code.

The optional `VITE_USE_LOCAL_STORAGE=true` mode is for isolated UI development only. It disables Supabase and admin sign-in; it is not a production fallback.
