-- Read-only export for the current storefront data model.
-- Run in Supabase Dashboard > SQL Editor, then copy the `supabase_export` JSON result.
-- Includes every row in public.categories and public.products plus their schema,
-- constraints, indexes, RLS policies, storage buckets, and storage object policies.
-- Treat the result as private: product rows may contain file URLs or business data.
with target_tables as (
  select
    ns.nspname as schema_name,
    cls.relname as table_name,
    cls.relrowsecurity as rls_enabled,
    cls.relforcerowsecurity as rls_forced
  from pg_class cls
  join pg_namespace ns on ns.oid = cls.relnamespace
  where ns.nspname = 'public'
    and cls.relname in ('categories', 'products')
    and cls.relkind in ('r', 'p')
),
column_metadata as (
  select
    cols.table_schema,
    cols.table_name,
    jsonb_agg(
      jsonb_build_object(
        'name', cols.column_name,
        'position', cols.ordinal_position,
        'type', cols.data_type,
        'udt_name', cols.udt_name,
        'nullable', cols.is_nullable = 'YES',
        'default', cols.column_default
      )
      order by cols.ordinal_position
    ) as columns
  from information_schema.columns cols
  where cols.table_schema = 'public'
    and cols.table_name in ('categories', 'products')
  group by cols.table_schema, cols.table_name
),
constraint_metadata as (
  select
    ns.nspname as schema_name,
    cls.relname as table_name,
    jsonb_agg(
      jsonb_build_object(
        'name', con.conname,
        'type', con.contype,
        'definition', pg_get_constraintdef(con.oid, true),
        'validated', con.convalidated
      )
      order by con.conname
    ) as constraints
  from pg_constraint con
  join pg_class cls on cls.oid = con.conrelid
  join pg_namespace ns on ns.oid = cls.relnamespace
  where ns.nspname = 'public'
    and cls.relname in ('categories', 'products')
  group by ns.nspname, cls.relname
),
index_metadata as (
  select
    idx.schemaname as schema_name,
    idx.tablename as table_name,
    jsonb_agg(
      jsonb_build_object(
        'name', idx.indexname,
        'definition', idx.indexdef
      )
      order by idx.indexname
    ) as indexes
  from pg_indexes idx
  where idx.schemaname = 'public'
    and idx.tablename in ('categories', 'products')
  group by idx.schemaname, idx.tablename
),
policy_metadata as (
  select
    pol.schemaname as schema_name,
    pol.tablename as table_name,
    jsonb_agg(
      jsonb_build_object(
        'name', pol.policyname,
        'permissive', pol.permissive,
        'roles', pol.roles,
        'command', pol.cmd,
        'using', pol.qual,
        'with_check', pol.with_check
      )
      order by pol.policyname
    ) as policies
  from pg_policies pol
  where pol.schemaname = 'public'
    and pol.tablename in ('categories', 'products')
  group by pol.schemaname, pol.tablename
)
select jsonb_pretty(
  jsonb_build_object(
    'exported_at', now(),
    'tables', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'schema', target.schema_name,
            'name', target.table_name,
            'rls_enabled', target.rls_enabled,
            'rls_forced', target.rls_forced,
            'columns', coalesce(columns.columns, '[]'::jsonb),
            'constraints', coalesce(constraints.constraints, '[]'::jsonb),
            'indexes', coalesce(indexes.indexes, '[]'::jsonb),
            'policies', coalesce(policies.policies, '[]'::jsonb)
          )
          order by target.table_name
        )
        from target_tables target
        left join column_metadata columns
          on columns.table_schema = target.schema_name
          and columns.table_name = target.table_name
        left join constraint_metadata constraints
          on constraints.schema_name = target.schema_name
          and constraints.table_name = target.table_name
        left join index_metadata indexes
          on indexes.schema_name = target.schema_name
          and indexes.table_name = target.table_name
        left join policy_metadata policies
          on policies.schema_name = target.schema_name
          and policies.table_name = target.table_name
      ),
      '[]'::jsonb
    ),
    'data', jsonb_build_object(
      'categories', coalesce(
        (select jsonb_agg(to_jsonb(category) order by category.created_at, category.id)
         from public.categories category),
        '[]'::jsonb
      ),
      'products', coalesce(
        (select jsonb_agg(to_jsonb(product) order by product.created_at, product.id)
         from public.products product),
        '[]'::jsonb
      )
    ),
    'storage_buckets', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', bucket.id,
            'name', bucket.name,
            'public', bucket.public,
            'file_size_limit', bucket.file_size_limit,
            'allowed_mime_types', bucket.allowed_mime_types
          )
          order by bucket.id
        )
        from storage.buckets bucket
        where bucket.id in ('covers', 'free-products')
      ),
      '[]'::jsonb
    ),
    'storage_policies', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'name', pol.policyname,
            'permissive', pol.permissive,
            'roles', pol.roles,
            'command', pol.cmd,
            'using', pol.qual,
            'with_check', pol.with_check
          )
          order by pol.policyname
        )
        from pg_policies pol
        where pol.schemaname = 'storage'
          and pol.tablename = 'objects'
      ),
      '[]'::jsonb
    )
  )
) as supabase_export;
