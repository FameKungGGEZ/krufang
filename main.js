// Main Application Script
import * as db from './db.js'
import { supabase, isLocalMode } from './supabase.js'
import { renderAdmin as renderAdminPage } from './admin.js'

// ========================
// Global State
// ========================

let categories = []
let products = []
let storeSettings = { site_name: 'Kru.Fang Studio', logo_url: 'images/logo.svg', hero_slides: [] }
let heroSlideIndex = 0
let heroSlideTimer = null
let selectedCategory = 'ทั้งหมด'
let query = ''
let currentProduct = null
let adminPage = 'dashboard'
let logged = false

// PDF.js state
let pdfDoc = null
let pdfPageNum = 1
let pdfRendering = false
let pdfPending = null
let pdfTimer = null

// Admin logo click counter (for secret access)
let clickCount = 0
let clickTimer = null

// ========================
// Initialization
// ========================

async function init() {
  console.log('🚀 Initializing Kru.Fang Studio...')

  // Test connection
  const conn = await db.testConnection()
  console.log(`📊 Storage mode: ${conn.mode}`)
  if (!conn.success) {
    console.error('Supabase connection failed:', conn.error)
    toast(conn.error?.includes('PGRST205')
      ? 'ยังไม่ได้สร้างตาราง Supabase กรุณารัน supabase-setup.sql'
      : 'เชื่อมต่อ Supabase ไม่สำเร็จ กรุณาตรวจสอบการตั้งค่า')
  }

  // Load data
  await loadData()
  await loadStoreSettings()
  window.addEventListener('store-data-changed', async () => {
    await Promise.all([loadData(), loadStoreSettings()])
    renderCategories()
    renderProducts()
  })

  // Render initial view
  renderCategories()
  renderProducts()

  // Setup logo click handler (5 clicks = admin access)
  const logo = document.getElementById('adminLogo')
  if (logo) {
    logo.addEventListener('click', handleLogoClick)
  }

  async function loadStoreSettings() {
    try {
      const [siteName, logoUrl, heroSlidesValue] = await Promise.all([
        db.getSetting('site_name', 'Kru.Fang Studio'),
        db.getSetting('logo_url', 'images/logo.svg'),
        db.getSetting('hero_slides', '[]')
      ])
      let heroSlides = []
      try {
        const parsedHeroSlides = JSON.parse(heroSlidesValue || '[]')
        if (Array.isArray(parsedHeroSlides) && parsedHeroSlides.every(url => typeof url === 'string')) {
          heroSlides = parsedHeroSlides.filter(Boolean)
        } else {
          throw new Error('Hero slides setting must be a list of image URLs')
        }
      } catch (error) {
        console.error('Could not parse hero slides setting:', error)
      }
      storeSettings = { site_name: siteName, logo_url: logoUrl, hero_slides: heroSlides }
      const name = document.getElementById('storeName')
      if (name) name.textContent = siteName
      document.querySelectorAll('#adminLogo img, #adminView .sidebar h3 img').forEach(image => {
        image.src = logoUrl
      })
      document.title = `${siteName} — สื่อการสอน & Template`
      renderHeroSlides(heroSlides)
    } catch (error) {
      console.error('Could not load store settings:', error)
    }
  }

  function renderHeroSlides(slides) {
    const container = document.getElementById('heroSlides')
    const controls = document.getElementById('heroSlideControls')
    const hero = document.querySelector('.hero')
    if (!container || !controls || !hero) return

    clearInterval(heroSlideTimer)
    heroSlideTimer = null
    hero.classList.toggle('has-slides', slides.length > 0)
    container.replaceChildren()
    controls.replaceChildren()
    controls.hidden = slides.length <= 1
    heroSlideIndex = 0

    slides.forEach((url, index) => {
      const image = document.createElement('img')
      image.className = `hero-slide${index === 0 ? ' active' : ''}`
      image.src = url
      image.alt = ''
      image.setAttribute('aria-hidden', 'true')
      container.append(image)

      if (slides.length > 1) {
        const dot = document.createElement('button')
        dot.className = `hero-slide-dot${index === 0 ? ' active' : ''}`
        dot.type = 'button'
        dot.setAttribute('aria-label', `ไปยังสไลด์ที่ ${index + 1}`)
        dot.setAttribute('aria-current', index === 0 ? 'true' : 'false')
        dot.addEventListener('click', () => showHeroSlide(index))
        controls.append(dot)
      }
    })

    function showHeroSlide(index) {
      heroSlideIndex = (index + slides.length) % slides.length
      container.querySelectorAll('.hero-slide').forEach((image, imageIndex) => {
        image.classList.toggle('active', imageIndex === heroSlideIndex)
      })
      controls.querySelectorAll('.hero-slide-dot').forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === heroSlideIndex)
        dot.setAttribute('aria-current', dotIndex === heroSlideIndex ? 'true' : 'false')
      })
    }

    if (slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      heroSlideTimer = setInterval(() => showHeroSlide(heroSlideIndex + 1), 5000)
    }
  }

  console.log('✅ App initialized')
}

async function loadData() {
  try {
    categories = await db.getCategories()
    products = await db.getProducts()
    console.log(`📦 Loaded ${categories.length} categories, ${products.length} products`)
  } catch (error) {
    console.error('Failed to load data:', error)
    toast('เกิดข้อผิดพลาดในการโหลดข้อมูล')
  }
}

// ========================
// View Management
// ========================

function showView(view) {
  stopAutoScroll()

  // Pause all videos
  document.querySelectorAll('#detailContent video').forEach(v => v.pause())

  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'))

  // Show selected view
  const viewMap = {
    store: 'storeView',
    detail: 'detailView',
    login: 'loginView',
    admin: 'adminView'
  }

  const viewId = viewMap[view]
  if (viewId) {
    document.getElementById(viewId).classList.add('active')
  }

  window.scrollTo(0, 0)

  if (view === 'admin') {
    renderAdmin()
  }
}

// ========================
// Categories
// ========================

function renderCategories() {
  const grid = document.getElementById('categoryGrid')
  if (!grid) return

  const allCat = {
    name: 'ทั้งหมด',
    bg_color: 'linear-gradient(135deg, #fff9e6, #e1f3ff)'
  }

  const cats = [allCat, ...categories]

  grid.innerHTML = cats.map(cat => `
    <div
      class="category ${selectedCategory === cat.name ? 'active' : ''}"
      style="background: ${cat.bg_color || '#f0f9ff'}"
      data-filter-category="${esc(cat.name)}"
    >
      <b>${esc(cat.name)}</b>
      ${cat.name === 'ทั้งหมด' ? '<small>ดูสินค้าทั้งหมด</small>' : ''}
    </div>
  `).join('')
  grid.querySelectorAll('[data-filter-category]').forEach(element => {
    element.addEventListener('click', () => filterCategory(element.dataset.filterCategory))
  })
}

async function filterCategory(cat) {
  selectedCategory = cat
  renderCategories()

  try {
    products = await db.getProducts({ category: cat, search: query })
  } catch (error) {
    console.error('Could not filter products:', error)
    toast('โหลดสินค้าในหมวดหมู่นี้ไม่สำเร็จ')
    return
  }
  renderProducts()

  document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' })
}

// ========================
// Products
// ========================

function renderProducts() {
  const grid = document.getElementById('productGrid')
  if (!grid) return

  let filtered = products

  // Apply search filter
  if (query) {
    const q = query.toLowerCase()
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.desc || p.description || '').toLowerCase().includes(q)
    )
  }

  // Apply sorting
  const sortBy = document.getElementById('sortSelect')?.value || 'popular'

  if (sortBy === 'popular') {
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
  } else if (sortBy === 'new') {
    filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
  } else if (sortBy === 'price') {
    filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
  }

  // Update count
  const countEl = document.getElementById('productCount')
  if (countEl) {
    countEl.textContent = `${filtered.length} สินค้า`
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty" style="grid-column: 1/-1">ไม่พบสินค้าที่ตรงกับการค้นหา</div>'
    return
  }

  grid.innerHTML = filtered.map(p => {
    const isFree = p.type === 'ฟรี' || p.type === 'free'
    const coverUrl = p.cover_url || p.coverData || p.thumbnailData || p.thumbnail_url
    const thumbnailUrl = coverUrl || (isFree ? p.fileData || p.file_url : null)
    const orientation = p.orientation || 'landscape'
    const thumbHeight = orientation === 'portrait' ? '210px' : '155px'

    let thumbContent = ''

    if (thumbnailUrl) {
      const mediaExtension = String(thumbnailUrl).split('?')[0].split('.').pop().toLowerCase()
      const coverIsVideo = p.cover_type === 'video' || (!coverUrl && p.format === 'MP4') || mediaExtension === 'mp4'
      const coverIsImage = p.cover_type === 'image' || ['png', 'jpg', 'jpeg', 'webp'].includes(mediaExtension)
      if (coverIsVideo) {
        thumbContent = `<video muted loop autoplay playsinline style="width:100%;height:100%;object-fit:cover"><source src="${thumbnailUrl}" type="video/mp4"></video>`
      } else if (coverIsImage) {
        thumbContent = `<img src="${thumbnailUrl}" style="width:100%;height:100%;object-fit:cover" alt="">`
      } else if (p.format === 'PDF' && thumbnailUrl.endsWith('.pdf')) {
        thumbContent = `<embed src="${thumbnailUrl}#page=1&toolbar=0&navpanes=0" type="application/pdf" style="width:100%;height:100%;pointer-events:none" onerror="this.outerHTML='<div style=\\\"font-size:62px\\\">📄</div>'">`
      } else if (isFree && ['PNG', 'JPG', 'JPEG'].includes(p.format)) {
        thumbContent = `<img src="${thumbnailUrl}" style="width:100%;height:100%;object-fit:cover" onerror="this.outerHTML='<div style=\\\"font-size:62px\\\">🖼️</div>'">`
      } else if (isFree && p.format === 'MP4') {
        thumbContent = `<video muted loop autoplay playsinline style="width:100%;height:100%;object-fit:cover"><source src="${thumbnailUrl}" type="video/mp4"></video>`
      } else {
        thumbContent = '<div style="font-size:62px">📄</div>'
      }
    } else {
      thumbContent = '<div style="font-size:62px">📄</div>'
    }

    return `
      <div class="product">
        <div class="thumb" style="height:${thumbHeight};position:relative;overflow:hidden">
          ${thumbContent}
          <div class="copyright">KRU.FANG</div>
        </div>
        <div class="product-body">
          <span class="pill ${p.type === 'ฟรี' || p.type === 'free' ? '' : 'paid'}">
            ${p.type === 'ฟรี' || p.type === 'free' ? 'ดาวน์โหลดฟรี' : 'สินค้าลิขสิทธิ์'}
          </span>
          <h3>${esc(p.title)}</h3>
          <div class="desc">${esc(p.desc || p.description || '')}</div>
          <div class="meta">
            <span>${esc(p.format)} · ${esc(p.category || p.category_name || '')}</span>
          </div>
          ${p.type === 'ฟรี' || p.type === 'free' ?
            `<div class="actions"><button class="green" data-open-product="${esc(p.id)}">ดูรายละเอียด</button></div>` :
            `<div><div class="price">฿${Number(p.price || 0).toLocaleString()}</div><div class="actions"><button class="primary" data-open-product="${esc(p.id)}">ดูรายละเอียด</button></div></div>`
          }
        </div>
      </div>
    `
  }).join('')
  grid.querySelectorAll('[data-open-product]').forEach(button => {
    button.addEventListener('click', () => openDetail(button.dataset.openProduct))
  })
}

async function searchProducts(q) {
  query = q

  // Sync search boxes
  const topSearch = document.getElementById('topSearch')
  const heroSearch = document.getElementById('heroSearch')
  if (topSearch) topSearch.value = q
  if (heroSearch) heroSearch.value = q

  // Reload products with filter
  try {
    products = await db.getProducts({ category: selectedCategory, search: q })
    renderProducts()
  } catch (error) {
    console.error('Could not search products:', error)
    toast('ค้นหาสินค้าไม่สำเร็จ')
  }
}

// ========================
// Product Detail
// ========================

async function openDetail(id) {
  currentProduct = products.find(p => String(p.id) === String(id))
  if (!currentProduct) {
    toast('ไม่พบสินค้า')
    return
  }

  // Increment views
  try {
    await db.incrementViews(id)
  } catch (error) {
    console.error('Could not record product view:', error)
  }
  currentProduct.views = (currentProduct.views || 0) + 1

  showView('detail')
  renderProductDetail()
}

function renderProductDetail() {
  const p = currentProduct
  if (!p) return

  const isFree = p.type === 'ฟรี' || p.type === 'free'
  const fileUrl = isFree ? p.fileData || p.file_url : null
  const coverUrl = !isFree ? p.cover_url || p.thumbnail_url : null

  let previewHtml = ''

  if (!isFree && coverUrl) {
    const coverIsVideo = p.cover_type === 'video' || String(coverUrl).split('?')[0].toLowerCase().endsWith('.mp4')
    previewHtml = coverIsVideo
      ? `<video controls style="width:100%;max-height:400px"><source src="${coverUrl}" type="video/mp4"></video>`
      : `<img src="${coverUrl}" alt="${esc(p.title)}" style="width:100%;height:auto;display:block">`
  } else if (fileUrl) {
    if (p.format === 'PDF') {
      previewHtml = `
        <div style="position:relative">
          <div id="pdfLoading" style="padding:20px;text-align:center;background:#f5f5f5;border-bottom:1px solid var(--line)">
            <small style="color:var(--muted)">กำลังโหลด PDF Viewer...</small>
          </div>
          <div id="pdfViewer" style="width:100%;height:500px;position:relative;overflow:hidden;background:#f5f5f5"></div>
          <div style="display:flex;justify-content:center;align-items:center;gap:15px;padding:15px;background:white;border-top:1px solid var(--line)">
            <button class="outline" onclick="prevPDFPage()" id="prevBtn">← ก่อนหน้า</button>
            <span id="pdfPageInfo" style="color:var(--muted);font-size:14px">หน้า 1</span>
            <button class="outline" onclick="nextPDFPage()" id="nextBtn">ถัดไป →</button>
            ${isFree ? '<label style="margin-left:15px;display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="autoScroll" onchange="toggleAutoScroll()"><span style="font-size:13px">เลื่อนอัตโนมัติ</span></label>' : ''}
          </div>
          <div class="copyright">KRU.FANG STUDIO</div>
        </div>
      `
    } else if (['PNG', 'JPG', 'JPEG'].includes(p.format)) {
      previewHtml = `
        <div style="position:relative">
          <img src="${fileUrl}" style="width:100%;height:auto;display:block" onerror="this.outerHTML='<div style=\\\"padding:40px;text-align:center\\\">ไม่สามารถโหลดรูปภาพ</div>'">
          <div class="copyright">KRU.FANG STUDIO</div>
        </div>
      `
    } else if (p.format === 'MP4') {
      previewHtml = `
        <div style="position:relative">
          <video controls style="width:100%;max-height:400px"><source src="${fileUrl}" type="video/mp4"></video>
          <div class="copyright">KRU.FANG STUDIO</div>
        </div>
      `
    } else {
      previewHtml = `
        <div style="padding:40px;text-align:center;color:var(--muted);position:relative">
          <div style="font-size:48px;margin-bottom:12px">📄</div>
          ไฟล์ ${p.format}<br>
          <small>ดาวน์โหลดเพื่อดูเนื้อหา</small>
          <div class="copyright">KRU.FANG STUDIO</div>
        </div>
      `
    }
  } else {
    previewHtml = '<div style="padding:40px;text-align:center"><small style="color:var(--muted)">ยังไม่มีไฟล์อัปโหลด</small></div>'
  }

  const detailContent = document.getElementById('detailContent')
  if (detailContent) {
    detailContent.innerHTML = `
      <div class="detail-layout">
        <div class="preview">
          <div class="preview-cover" style="height:auto;min-height:300px;display:block">
            ${previewHtml}
          </div>
        </div>
        <div class="detail-info">
          <span class="pill ${isFree ? '' : 'paid'}">
            ${isFree ? 'ดาวน์โหลดฟรี' : 'สินค้าลิขสิทธิ์'}
          </span>
          <h1>${esc(p.title)}</h1>
          <p style="color:var(--muted);line-height:1.8">${esc(p.desc || p.description || '')}</p>
          <h2>${isFree ? 'ฟรี' : `฿${p.price || 0}`}</h2>
          <ul>
            <li>รูปแบบไฟล์: ${esc(p.format)}</li>
            <li>หมวดหมู่: ${esc(p.category || p.category_name || '')}</li>
          </ul>
          ${isFree ?
            `<button class="green" data-download-product="${esc(p.id)}">📥 ดาวน์โหลดฟรี</button>` :
            `<button class="primary" data-buy-product="${esc(p.id)}">💬 ซื้อผ่าน Facebook · ฿${Number(p.price || 0).toLocaleString()}</button>`
          }
          <p style="font-size:12px;color:var(--muted);margin-top:18px">
            👁️ ${(p.views || 0).toLocaleString()} ครั้งที่เข้าชม
          </p>
        </div>
      </div>
    `
    detailContent.querySelector('[data-download-product]')?.addEventListener('click', event =>
      downloadProduct(event.currentTarget.dataset.downloadProduct))
    detailContent.querySelector('[data-buy-product]')?.addEventListener('click', event =>
      buyProduct(event.currentTarget.dataset.buyProduct))
  }

  // Load PDF if applicable
  if (isFree && p.format === 'PDF' && fileUrl) {
    loadPDF(fileUrl)
  }
}

// ========================
// PDF Viewer
// ========================

async function loadPDF(url) {
  try {
    const loading = document.getElementById('pdfLoading')
    if (loading) loading.style.display = 'block'

    pdfDoc = await pdfjsLib.getDocument(url).promise
    pdfPageNum = 1
    pdfInfo()
    await renderPdfPage(pdfPageNum)

    if (loading) loading.style.display = 'none'

    // Canvas click navigation
    const viewer = document.getElementById('pdfViewer')
    if (viewer) {
      viewer.addEventListener('click', (e) => {
        const rect = viewer.getBoundingClientRect()
        const x = e.clientX - rect.left
        if (x < rect.width / 2) prevPDFPage()
        else nextPDFPage()
      })
    }
  } catch (error) {
    console.error('PDF load error:', error)
    const loading = document.getElementById('pdfLoading')
    if (loading) {
      loading.innerHTML = '<small style="color:red">ไม่สามารถโหลด PDF ได้</small>'
    }
  }
}

function pdfInfo() {
  const info = document.getElementById('pdfPageInfo')
  if (info && pdfDoc) {
    info.textContent = `หน้า ${pdfPageNum} / ${pdfDoc.numPages}`
  }
}

async function renderPdfPage(num) {
  if (!pdfDoc) return

  pdfRendering = true

  try {
    const page = await pdfDoc.getPage(num)
    const viewport = page.getViewport({ scale: 1.5 })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = viewport.width
    canvas.height = viewport.height
    canvas.style.cssText = 'display:block;margin:0 auto;max-width:100%;max-height:100%'

    const viewer = document.getElementById('pdfViewer')
    if (!viewer) {
      pdfRendering = false
      return
    }

    viewer.innerHTML = ''
    viewer.appendChild(canvas)

    await page.render({ canvasContext: ctx, viewport }).promise

    pdfRendering = false

    if (pdfPending !== null) {
      const n = pdfPending
      pdfPending = null
      renderPdfPage(n)
    }
  } catch (error) {
    console.error('PDF render error:', error)
    pdfRendering = false
  }
}

function queuePdfPage(n) {
  if (pdfRendering) pdfPending = n
  else renderPdfPage(n)
}

function prevPDFPage() {
  if (!pdfDoc || pdfPageNum <= 1) return
  pdfPageNum--
  pdfInfo()
  queuePdfPage(pdfPageNum)
  stopAutoScroll()
  const c = document.getElementById('autoScroll')
  if (c) c.checked = false
}

function nextPDFPage() {
  if (!pdfDoc || pdfPageNum >= pdfDoc.numPages) return
  pdfPageNum++
  pdfInfo()
  queuePdfPage(pdfPageNum)
  stopAutoScroll()
  const c = document.getElementById('autoScroll')
  if (c) c.checked = false
}

function startAutoScroll() {
  stopAutoScroll()
  pdfTimer = setInterval(() => {
    if (!pdfDoc) return
    pdfPageNum = pdfPageNum < pdfDoc.numPages ? pdfPageNum + 1 : 1
    pdfInfo()
    queuePdfPage(pdfPageNum)
  }, 3000)
}

function stopAutoScroll() {
  if (pdfTimer) {
    clearInterval(pdfTimer)
    pdfTimer = null
  }
}

function toggleAutoScroll() {
  const c = document.getElementById('autoScroll')
  if (c && c.checked) startAutoScroll()
  else stopAutoScroll()
}

// ========================
// Download & Purchase
// ========================

async function downloadProduct(id) {
  const p = products.find(x => String(x.id) === String(id))
  if (!p) {
    toast('❌ ไม่พบสินค้า')
    return
  }

  try {
    await db.incrementClicks(id)
    p.clicks = (p.clicks || 0) + 1
  } catch (error) {
    console.error('Could not record product download:', error)
  }

  const fileUrl = p.fileData || p.file_url

  if (fileUrl && fileUrl.startsWith('data:')) {
    // Data URI - download directly
    const a = document.createElement('a')
    a.href = fileUrl
    a.download = p.fileName || p.file_name || `product-${id}.${String(p.format || 'file').toLowerCase()}`
    a.click()
    toast('📥 กำลังดาวน์โหลดไฟล์...')
  } else if (fileUrl) {
    // URL - fetch and download
    try {
      const res = await fetch(fileUrl)
      if (!res.ok) throw new Error(`Download failed (${res.status})`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = p.fileName || p.file_name || `product-${id}.${String(p.format || 'file').toLowerCase()}`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast('📥 กำลังดาวน์โหลดไฟล์...')
    } catch (error) {
      console.error('Download error:', error)
      toast('❌ ไม่สามารถดาวน์โหลดไฟล์ได้')
    }
  } else {
    toast('❌ ไม่พบไฟล์ดาวน์โหลด')
  }

  renderProducts()
}

async function buyProduct(id) {
  const p = products.find(x => String(x.id) === String(id))
  if (!p) {
    toast('❌ ไม่พบสินค้า')
    return
  }

  let purchaseWindow = null
  try {
    purchaseWindow = window.open('about:blank', '_blank')
    if (!purchaseWindow) {
      toast('อนุญาตป๊อปอัปเพื่อเปิดลิงก์สั่งซื้อ')
      return
    }
    purchaseWindow.opener = null
    await db.incrementClicks(id)
    p.clicks = (p.clicks || 0) + 1
    const url = p.fb || p.fb_link || await db.getSetting('facebook_link', 'https://www.facebook.com/')
    const purchaseUrl = new URL(url, window.location.href)
    if (!['http:', 'https:'].includes(purchaseUrl.protocol)) throw new Error('Invalid purchase link')
    purchaseWindow.location = purchaseUrl.href
    renderProducts()
  } catch (error) {
    purchaseWindow?.close()
    console.error('Could not open purchase link:', error)
    toast('เปิดลิงก์สั่งซื้อไม่สำเร็จ กรุณาลองอีกครั้ง')
  }
}

// ========================
// Admin Access (Secret)
// ========================

function handleLogoClick() {
  clickCount++

  clearTimeout(clickTimer)
  clickTimer = setTimeout(() => {
    clickCount = 0
  }, 2000)

  if (clickCount === 5) {
    clickCount = 0
    showView('login')
  }
}

async function login() {
  const email = document.getElementById('adminEmail')?.value.trim()
  const pass = document.getElementById('adminPass')?.value
  if (!email || !pass) return

  if (isLocalMode) {
    toast('โหมด localStorage ไม่มีระบบเข้าสู่ระบบผู้ดูแล กรุณาใช้ Supabase Auth')
    return
  }
  if (!supabase) {
    toast('ตั้งค่าข้อมูลเชื่อมต่อ Supabase ก่อนเข้าสู่ระบบ')
    return
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) throw error
    if (data.user?.app_metadata?.role !== 'admin') {
      await supabase.auth.signOut()
      throw new Error('บัญชีนี้ยังไม่ได้รับสิทธิ์ผู้ดูแล')
    }
    logged = true
    showView('admin')
    toast('✅ เข้าสู่ระบบสำเร็จ')
  } catch (error) {
    console.error('Admin sign-in failed:', error)
    toast(error.message === 'Invalid login credentials'
      ? '❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      : `เข้าสู่ระบบไม่สำเร็จ: ${error.message}`)
  }
}

async function logout() {
  if (!confirm('ต้องการออกจากระบบหรือไม่?')) return
  try {
    if (supabase) {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
    logged = false
    showView('store')
    toast('👋 ออกจากระบบแล้ว')
  } catch (error) {
    console.error('Admin sign-out failed:', error)
    toast('ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง')
  }
}

// ========================
// Admin Panel
// ========================

function renderAdmin() {
  if (!logged) {
    showView('login')
    return
  }
  const content = document.getElementById('adminContent')
  if (content) renderAdminPage()
}

// ========================
// Utilities
// ========================

function esc(str) {
  if (!str) return ''
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

function toast(msg) {
  const t = document.getElementById('toast')
  if (!t) return

  t.textContent = msg
  t.classList.remove('hidden')

  setTimeout(() => {
    t.classList.add('hidden')
  }, 2500)
}

// ========================
// Export for HTML inline handlers
// ========================

window.showView = showView
window.filterCategory = filterCategory
window.searchProducts = searchProducts
window.openDetail = openDetail
window.downloadProduct = downloadProduct
window.buyProduct = buyProduct
window.login = login
window.logout = logout
window.prevPDFPage = prevPDFPage
window.nextPDFPage = nextPDFPage
window.toggleAutoScroll = toggleAutoScroll

// ========================
// Start App
// ========================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
