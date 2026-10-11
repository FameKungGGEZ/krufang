// Data layer for Supabase, with localStorage available only when explicitly enabled.
import { supabase, isLocalMode } from './supabase.js'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

function getLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null')
  } catch (error) {
    console.error(`Could not read local data "${key}":`, error)
    return null
  }
}

function setLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function productRecord(product) {
  return {
    title: product.title,
    description: product.description ?? product.desc ?? '',
    category_name: product.category_name ?? product.category ?? '',
    type: product.type,
    price: Number(product.price) || 0,
    format: product.format,
    orientation: product.orientation || 'landscape',
    file_name: product.file_name ?? product.fileName ?? null,
    file_url: product.file_url ?? product.fileData ?? null,
    thumbnail_url: product.thumbnail_url ?? product.thumbnailData ?? null,
    cover_type: product.cover_type ?? product.coverType ?? 'file',
    cover_url: product.cover_url ?? product.coverData ?? null,
    fb_link: product.fb_link ?? product.fb ?? '',
    published: product.published ?? true
  }
}

// Categories
export async function getCategories() {
  if (isLocalMode) return getLocal('ts_categories') || []

  const { data, error } = await requireSupabase()
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export async function addCategory(name, bgColor = '#e5f2ff') {
  if (isLocalMode) {
    const categories = getLocal('ts_categories') || []
    const category = { id: crypto.randomUUID(), name, bg_color: bgColor }
    categories.push(category)
    setLocal('ts_categories', categories)
    return category
  }

  const { data, error } = await requireSupabase()
    .from('categories')
    .insert({ name, bg_color: bgColor })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCategory(id) {
  if (isLocalMode) {
    const categories = getLocal('ts_categories') || []
    setLocal('ts_categories', categories.filter(category => category.id !== id && category.name !== id))
    return
  }

  const { error } = await requireSupabase().from('categories').delete().eq('id', id)
  if (error) throw error
}

// Products
export async function getProducts(filters = {}) {
  if (isLocalMode) {
    let products = getLocal('ts_products_v2') || []
    if (!filters.includeUnpublished) products = products.filter(product => product.published !== false)
    if (filters.category && filters.category !== 'ทั้งหมด') {
      products = products.filter(product => (product.category_name || product.category) === filters.category)
    }
    if (filters.search) {
      const search = filters.search.toLocaleLowerCase()
      products = products.filter(product =>
        `${product.title || ''} ${product.description || product.desc || ''}`.toLocaleLowerCase().includes(search)
      )
    }
    return products
  }

  const client = requireSupabase()
  let query = client.from('products').select('*')
  if (!filters.includeUnpublished) query = query.eq('published', true)
  if (filters.category && filters.category !== 'ทั้งหมด') {
    query = query.eq('category_name', filters.category)
  }
  if (filters.search) {
    const search = filters.search.replace(/[,%()"]/g, ' ').trim()
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getProductById(id) {
  if (isLocalMode) {
    return (getLocal('ts_products_v2') || []).find(product => product.id === id) || null
  }

  const { data, error } = await requireSupabase()
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function addProduct(product) {
  if (isLocalMode) {
    const products = getLocal('ts_products_v2') || []
    const newProduct = { id: crypto.randomUUID(), views: 0, clicks: 0, ...productRecord(product) }
    products.push(newProduct)
    setLocal('ts_products_v2', products)
    return newProduct
  }

  const { data, error } = await requireSupabase()
    .from('products')
    .insert(productRecord(product))
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(id, updates) {
  if (isLocalMode) {
    const products = getLocal('ts_products_v2') || []
    const index = products.findIndex(product => product.id === id)
    if (index === -1) throw new Error('Product not found')
    products[index] = { ...products[index], ...productRecord(updates) }
    setLocal('ts_products_v2', products)
    return products[index]
  }

  const { data, error } = await requireSupabase()
    .from('products')
    .update(productRecord(updates))
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  if (isLocalMode) {
    setLocal('ts_products_v2', (getLocal('ts_products_v2') || []).filter(product => product.id !== id))
    return
  }

  const { error } = await requireSupabase().from('products').delete().eq('id', id)
  if (error) throw error
}

export async function incrementViews(id) {
  if (isLocalMode) {
    const products = getLocal('ts_products_v2') || []
    const product = products.find(item => item.id === id)
    if (product) {
      product.views = (product.views || 0) + 1
      setLocal('ts_products_v2', products)
    }
    return
  }

  const { error } = await requireSupabase().rpc('increment_views', { product_id: id })
  if (error) throw error
}

export async function incrementClicks(id) {
  if (isLocalMode) {
    const products = getLocal('ts_products_v2') || []
    const product = products.find(item => item.id === id)
    if (product) {
      product.clicks = (product.clicks || 0) + 1
      setLocal('ts_products_v2', products)
    }
    return
  }

  const { error } = await requireSupabase().rpc('increment_clicks', { product_id: id })
  if (error) throw error
}

// Settings
export async function getSetting(key, defaultValue = null) {
  if (isLocalMode) return localStorage.getItem(key) ?? defaultValue

  const { data, error } = await requireSupabase()
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()

  if (error) throw error
  return data?.value ?? defaultValue
}

export async function saveSetting(key, value) {
  if (isLocalMode) {
    localStorage.setItem(key, value)
    return
  }

  const { error } = await requireSupabase()
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' })

  if (error) throw error
}

// Public Storage buckets are configured in supabase-setup.sql.
export async function uploadFile(bucket, path, file) {
  const { data, error } = await requireSupabase().storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw error
  const { data: urlData } = requireSupabase().storage.from(bucket).getPublicUrl(data.path)
  return urlData.publicUrl
}

export async function uploadPrivateFile(bucket, path, file) {
  const { data, error } = await requireSupabase().storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw error
  return data.path
}

export async function deleteFile(bucket, path) {
  const { error } = await requireSupabase().storage.from(bucket).remove([path])
  if (error) throw error
}

export async function logAdminAction(action, details = {}) {
  const { error } = await requireSupabase().from('admin_logs').insert({ action, details })
  if (error) throw error
}

export function isUsingSupabase() {
  return !isLocalMode && Boolean(supabase)
}

export async function testConnection() {
  if (isLocalMode) return { success: true, mode: 'localStorage' }
  if (!supabase) {
    return {
      success: false,
      mode: 'Supabase',
      error: 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    }
  }

  try {
    const { error } = await supabase.from('categories').select('id').limit(1)
    if (error) {
      return {
        success: false,
        mode: 'Supabase',
        error: `${error.code ? `${error.code}: ` : ''}${error.message}`
      }
    }
    return { success: true, mode: 'Supabase' }
  } catch (error) {
    console.error('Supabase connection check failed:', error)
    return {
      success: false,
      mode: 'Supabase',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
