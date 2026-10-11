import * as db from './db.js'
import './admin.css'

let adminPage = 'dashboard'
let editingProductId = null
let creatingProduct = false

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[char]))

function toast(message) {
  const element = document.getElementById('toast')
  if (!element) return
  element.textContent = message
  element.classList.remove('hidden')
  setTimeout(() => element.classList.add('hidden'), 2500)
}

function signalStoreChanged() {
  window.dispatchEvent(new Event('store-data-changed'))
}

function storageFile(bucket, url) {
  if (!url) return null
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const match = new URL(url).pathname.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)$/)
      if (!match) return null
      return { bucket: match[1], path: decodeURIComponent(match[2]) }
    }
    return { bucket, path: url }
  } catch {
    return null
  }
}

export async function renderAdmin() {
  const content = document.getElementById('adminContent')
  if (!content) return

  try {
    if (adminPage === 'dashboard') {
      const [products, categories] = await Promise.all([
        db.getProducts({ includeUnpublished: true }),
        db.getCategories()
      ])
      content.innerHTML = `
        <div class="panel">
          <h2>Dashboard</h2>
          <div class="stats">
            <div class="stat"><small>สินค้าทั้งหมด</small><strong>${products.length}</strong></div>
            <div class="stat"><small>หมวดหมู่</small><strong>${categories.length}</strong></div>
            <div class="stat"><small>ยอดวิวรวม</small><strong>${products.reduce((sum, product) => sum + (product.views || 0), 0).toLocaleString()}</strong></div>
            <div class="stat"><small>ยอดคลิกรวม</small><strong>${products.reduce((sum, product) => sum + (product.clicks || 0), 0).toLocaleString()}</strong></div>
          </div>
          <p>จัดการสินค้า หมวดหมู่ และตั้งค่าร้าน Kru.Fang Studio</p>
          <p>โหมดจัดเก็บข้อมูล: <strong>${db.isUsingSupabase() ? 'Supabase' : 'localStorage'}</strong></p>
        </div>`
    } else if (adminPage === 'products') {
      await renderProductsPage(content)
    } else if (adminPage === 'categories') {
      await renderCategoriesPage(content)
    } else if (adminPage === 'settings') {
      await renderSettingsPage(content)
    }
  } catch (error) {
    console.error('Could not render admin page:', error)
    content.innerHTML = '<div class="panel"><p>โหลดข้อมูลผู้ดูแลไม่สำเร็จ กรุณาลองอีกครั้ง</p><button id="retryAdmin">ลองอีกครั้ง</button></div>'
    content.querySelector('#retryAdmin')?.addEventListener('click', renderAdmin)
  }
}

export function adminTab(page, button) {
  adminPage = page
  editingProductId = null
  creatingProduct = false
  document.querySelectorAll('.sidebar button').forEach(item => item.classList.remove('active'))
  if (button) button.classList.add('active')
  renderAdmin()
}

async function renderProductsPage(content) {
  const [products, categories] = await Promise.all([
    db.getProducts({ includeUnpublished: true }),
    db.getCategories()
  ])
  const product = editingProductId
    ? products.find(item => String(item.id) === String(editingProductId))
    : null
  const options = categories.map(category =>
    `<option value="${esc(category.name)}" ${product?.category_name === category.name || product?.category === category.name || (!product && category === categories[0]) ? 'selected' : ''}>${esc(category.name)}</option>`
  ).join('')

  content.innerHTML = `
    <div class="section-head">
      <div><h2>จัดการสินค้า</h2><p>เพิ่ม แก้ไข เผยแพร่ และลบสินค้า</p></div>
      <button class="primary" id="newProduct">เพิ่มสินค้าใหม่</button>
    </div>
    ${product || creatingProduct ? `
      <div class="panel">
        <h3>${product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h3>
        <form id="productAdminForm">
          <div class="form-grid">
            <div class="field"><label for="productTitle">ชื่อสินค้า *</label><input id="productTitle" required value="${esc(product?.title || '')}"></div>
            <div class="field"><label for="productCategory">หมวดหมู่ *</label><select id="productCategory" required>${options}</select></div>
            <div class="field"><label for="productType">ประเภทสินค้า</label><select id="productType"><option value="ฟรี" ${product?.type === 'ฟรี' ? 'selected' : ''}>ฟรี</option><option value="ขาย" ${!product || product.type === 'ขาย' ? 'selected' : ''}>ขาย</option></select></div>
            <div class="field"><label for="productPrice">ราคา</label><input id="productPrice" type="number" min="0" step="0.01" value="${esc(product?.price ?? 0)}"></div>
            <div class="field"><label for="productFormat">รูปแบบไฟล์ *</label><input id="productFormat" required value="${esc(product?.format || '')}" placeholder="PDF, PPTX, ZIP"></div>
            <div class="field"><label for="productOrientation">แนวกระดาษ</label><select id="productOrientation"><option value="landscape" ${product?.orientation !== 'portrait' ? 'selected' : ''}>แนวนอน</option><option value="portrait" ${product?.orientation === 'portrait' ? 'selected' : ''}>แนวตั้ง</option></select></div>
            <div class="field"><label for="productFile">ไฟล์สินค้า${product?.file_name ? ` (ปัจจุบัน: ${esc(product.file_name)})` : ''}</label><input id="productFile" type="file"></div>
            <div class="field"><label for="productThumbnail">รูปตัวอย่าง/ภาพปก</label><input id="productThumbnail" type="file" accept="image/*,video/mp4"></div>
            <div class="field"><label for="productFacebook">ลิงก์ Facebook สำหรับสั่งซื้อ</label><input id="productFacebook" type="url" value="${esc(product?.fb_link || '')}"></div>
            <div class="field"><label><input id="productPublished" type="checkbox" ${product?.published !== false ? 'checked' : ''}> เผยแพร่หน้าร้าน</label></div>
            <div class="field" style="grid-column:1/-1"><label for="productDescription">รายละเอียด</label><textarea id="productDescription" rows="4">${esc(product?.description || product?.desc || '')}</textarea></div>
          </div>
          <div class="actions"><button class="primary" type="submit">บันทึกสินค้า</button><button class="outline" type="button" id="cancelProduct">ยกเลิก</button></div>
        </form>
      </div>` : ''}
    <div class="panel">
      ${products.length ? `<div style="overflow-x:auto"><table style="width:100%;text-align:left"><thead><tr><th>สินค้า</th><th>หมวดหมู่</th><th>ราคา</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>
      ${products.map(item => `<tr><td>${esc(item.title)}</td><td>${esc(item.category_name || item.category)}</td><td>${item.type === 'ฟรี' ? 'ฟรี' : `฿${Number(item.price || 0).toLocaleString()}`}</td><td>${item.published === false ? 'ฉบับร่าง' : 'เผยแพร่'}</td><td><button class="outline" data-edit-product="${esc(item.id)}">แก้ไข</button> <button class="outline" data-delete-product="${esc(item.id)}">ลบ</button></td></tr>`).join('')}
      </tbody></table></div>` : '<p>ยังไม่มีสินค้า</p>'}
    </div>`

  content.querySelector('#newProduct')?.addEventListener('click', () => {
    editingProductId = null
    creatingProduct = true
    renderAdmin()
  })
  content.querySelector('#cancelProduct')?.addEventListener('click', () => {
    editingProductId = null
    creatingProduct = false
    renderAdmin()
  })
  content.querySelectorAll('[data-edit-product]').forEach(button => button.addEventListener('click', () => {
    editingProductId = button.dataset.editProduct
    creatingProduct = false
    renderAdmin()
  }))
  content.querySelectorAll('[data-delete-product]').forEach(button => button.addEventListener('click', async () => {
    if (!confirm('ต้องการลบสินค้านี้หรือไม่?')) return
    try {
      const product = products.find(item => String(item.id) === button.dataset.deleteProduct)
      await db.deleteProduct(button.dataset.deleteProduct)
      const files = [
        storageFile(product?.type === 'ฟรี' ? 'free-products' : 'paid-products', product?.file_url),
        storageFile('covers', product?.thumbnail_url),
        storageFile('covers', product?.cover_url)
      ].filter(Boolean)
      const uniqueFiles = [...new Map(files.map(file => [`${file.bucket}/${file.path}`, file])).values()]
      const cleanup = await Promise.allSettled(uniqueFiles.map(file => db.deleteFile(file.bucket, file.path)))
      if (cleanup.some(result => result.status === 'rejected')) {
        console.error('Some uploaded product files could not be removed:', cleanup)
      }
      toast('ลบสินค้าแล้ว')
      signalStoreChanged()
      renderAdmin()
    } catch (error) {
      console.error('Could not delete product:', error)
      toast('ลบสินค้าไม่สำเร็จ')
    }
  }))
  content.querySelector('#productAdminForm')?.addEventListener('submit', saveProduct)
}

async function saveProduct(event) {
  event.preventDefault()
  const form = event.currentTarget
  const file = form.querySelector('#productFile').files[0]
  const thumbnail = form.querySelector('#productThumbnail').files[0]
  const id = editingProductId

  let uploadedFileUrl = null
  let uploadedThumbnailUrl = null
  let saved = false
  try {
    const previous = id
      ? (await db.getProducts({ includeUnpublished: true })).find(product => String(product.id) === String(id))
      : null
    const type = form.querySelector('#productType').value
    const oldType = previous?.type === 'free' ? 'ฟรี' : previous?.type
    if (previous?.file_url && oldType !== type && !file) {
      throw new Error('เปลี่ยนประเภทสินค้าต้องอัปโหลดไฟล์ต้นฉบับใหม่')
    }
    if (!id && !file) throw new Error('กรุณาเลือกไฟล์สินค้า')

    const oldFile = storageFile(oldType === 'ฟรี' ? 'free-products' : 'paid-products', previous?.file_url)
    let fileUrl = previous && oldType === type ? previous.file_url : null
    let thumbnailUrl = previous?.thumbnail_url || null
    if (file) {
      const fileName = file.name.replace(/[^\w.-]+/g, '_')
      const path = `${crypto.randomUUID()}-${fileName}`
      fileUrl = type === 'ฟรี'
        ? await db.uploadFile('free-products', path, file)
        : await db.uploadPrivateFile('paid-products', path, file)
      uploadedFileUrl = fileUrl
    }
    if (thumbnail) {
      const fileName = thumbnail.name.replace(/[^\w.-]+/g, '_')
      thumbnailUrl = await db.uploadFile('covers', `${crypto.randomUUID()}-${fileName}`, thumbnail)
      uploadedThumbnailUrl = thumbnailUrl
    }

    const product = {
      title: form.querySelector('#productTitle').value.trim(),
      category_name: form.querySelector('#productCategory').value,
      type,
      price: form.querySelector('#productPrice').value,
      format: form.querySelector('#productFormat').value.trim().toUpperCase(),
      orientation: form.querySelector('#productOrientation').value,
      file_name: file?.name || previous?.file_name || null,
      file_url: fileUrl,
      thumbnail_url: thumbnailUrl,
      cover_url: thumbnailUrl,
      cover_type: thumbnail?.type.startsWith('video/') ? 'video' : thumbnail ? 'image' : previous?.cover_type || 'file',
      fb_link: form.querySelector('#productFacebook').value.trim(),
      description: form.querySelector('#productDescription').value.trim(),
      published: form.querySelector('#productPublished').checked
    }

    if (id) await db.updateProduct(id, product)
    else await db.addProduct(product)
    saved = true
    creatingProduct = false
    const obsoleteFiles = [
      file && oldFile,
      thumbnail && storageFile('covers', previous?.thumbnail_url)
    ].filter(item => item?.path)
    const cleanup = await Promise.allSettled(obsoleteFiles.map(item => db.deleteFile(item.bucket, item.path)))
    if (cleanup.some(result => result.status === 'rejected')) {
      console.error('Could not remove replaced product files:', cleanup)
    }
    editingProductId = null
    toast('บันทึกสินค้าแล้ว')
    signalStoreChanged()
    renderAdmin()
  } catch (error) {
    console.error('Could not save product:', error)
    if (!saved) {
      const cleanup = await Promise.allSettled([
        uploadedFileUrl && db.deleteFile(
          form.querySelector('#productType').value === 'ฟรี' ? 'free-products' : 'paid-products',
          storageFile(form.querySelector('#productType').value === 'ฟรี' ? 'free-products' : 'paid-products', uploadedFileUrl)?.path
        ),
        uploadedThumbnailUrl && db.deleteFile('covers', storageFile('covers', uploadedThumbnailUrl)?.path)
      ].filter(Boolean))
      if (cleanup.some(result => result.status === 'rejected')) {
        console.error('Could not clean up uploaded files after save failure:', cleanup)
      }
    } else {
      editingProductId = null
      toast('บันทึกสินค้าแล้ว แต่ลบไฟล์เดิมไม่สำเร็จ')
      signalStoreChanged()
      renderAdmin()
      return
    }
    toast(`บันทึกสินค้าไม่สำเร็จ: ${error.message || 'ตรวจสอบการเชื่อมต่อและสิทธิ์ผู้ดูแล'}`)
  }
}

async function renderCategoriesPage(content) {
  const categories = await db.getCategories()
  content.innerHTML = `
    <div class="section-head"><div><h2>จัดการหมวดหมู่</h2></div></div>
    <div class="panel">
      <form id="categoryForm" class="actions"><input id="categoryName" required maxlength="100" placeholder="ชื่อหมวดหมู่"><input id="categoryColor" type="color" value="#e5f2ff"><button class="primary" type="submit">เพิ่มหมวดหมู่</button></form>
    </div>
    <div class="panel category-list">${categories.length ? categories.map(category => `
      <div class="category-row">
        <span class="category-name"><i style="background:${esc(category.bg_color || '#e5f2ff')}"></i>${esc(category.name)}</span>
        <button class="category-delete" data-delete-category="${esc(category.id)}" aria-label="ลบหมวดหมู่ ${esc(category.name)}">ลบ</button>
      </div>
    `).join('') : '<p>ยังไม่มีหมวดหมู่</p>'}</div>`

  content.querySelector('#categoryForm').addEventListener('submit', async event => {
    event.preventDefault()
    const name = content.querySelector('#categoryName').value.trim()
    try {
      await db.addCategory(name, content.querySelector('#categoryColor').value)
      toast('เพิ่มหมวดหมู่แล้ว')
      signalStoreChanged()
      renderAdmin()
    } catch (error) {
      console.error('Could not add category:', error)
      toast(`เพิ่มหมวดหมู่ไม่สำเร็จ: ${error.message || ''}`)
    }
  })
  content.querySelectorAll('[data-delete-category]').forEach(button => button.addEventListener('click', async () => {
    if (!confirm('ต้องการลบหมวดหมู่นี้หรือไม่?')) return
    try {
      await db.deleteCategory(button.dataset.deleteCategory)
      toast('ลบหมวดหมู่แล้ว')
      signalStoreChanged()
      renderAdmin()
    } catch (error) {
      console.error('Could not delete category:', error)
      toast(`ลบหมวดหมู่ไม่สำเร็จ: ${error.message || ''}`)
    }
  }))
}

async function renderSettingsPage(content) {
  const [siteName, facebookLink, logoUrl, heroSlidesValue] = await Promise.all([
    db.getSetting('site_name', 'Kru.Fang Studio'),
    db.getSetting('facebook_link', 'https://www.facebook.com/'),
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
    throw new Error('อ่านรายการสไลด์ไม่สำเร็จ กรุณาตรวจสอบค่า hero_slides ใน Supabase')
  }

  content.innerHTML = `
    <div class="section-head"><div><h2>ตั้งค่าร้าน</h2></div></div>
    <div class="panel"><form id="settingsForm">
      <div class="field"><label for="siteName">ชื่อร้าน</label><input id="siteName" value="${esc(siteName)}" required></div>
      <div class="field"><label for="facebookLink">ลิงก์ Facebook</label><input id="facebookLink" type="url" value="${esc(facebookLink)}"></div>
      <div class="field"><label for="logoFile">อัปโหลดโลโก้ (PNG, JPG, WebP)</label><input id="logoFile" type="file" accept="image/png,image/jpeg,image/webp"></div>
      <div class="field"><label for="logoUrl">หรือใส่ URL โลโก้</label><input id="logoUrl" type="url" value="${esc(logoUrl)}"></div>
      <img src="${esc(logoUrl)}" alt="ตัวอย่างโลโก้" style="width:80px;height:80px;object-fit:contain" onerror="this.style.display='none'">
      <section class="hero-slides-settings">
        <h3>ภาพสไลด์หน้าแรก</h3>
        <p>อัปโหลดรูปได้หลายภาพ ภาพจะสลับอัตโนมัติทุก 5 วินาที หากไม่มีภาพจะแสดงพื้นหลังไล่สีเดิม</p>
        <div class="field"><label for="heroSlideFiles">เพิ่มภาพสไลด์ (PNG, JPG, WebP ไม่เกิน 10 MB ต่อภาพ)</label><input id="heroSlideFiles" type="file" accept="image/png,image/jpeg,image/webp" multiple></div>
        <div class="hero-slide-settings-grid">
          ${heroSlides.map((url, index) => `
            <label class="hero-slide-settings-item">
              <img src="${esc(url)}" alt="ภาพสไลด์ที่ ${index + 1}" onerror="this.classList.add('image-unavailable')">
              <span><input type="checkbox" data-keep-hero-slide="${esc(url)}" checked> ใช้ภาพนี้</span>
            </label>
          `).join('') || '<p class="hero-slides-empty">ยังไม่มีภาพที่บันทึกไว้</p>'}
        </div>
      </section>
      <button class="primary" type="submit">บันทึกการตั้งค่า</button>
    </form></div>`
  content.querySelector('#settingsForm').addEventListener('submit', async event => {
    event.preventDefault()
    const form = event.currentTarget
    const uploadedHeroUrls = []
    let uploadedLogoUrl = null
    try {
      const logoFile = form.querySelector('#logoFile').files[0]
      const heroFiles = Array.from(form.querySelector('#heroSlideFiles').files)
      const retainedHeroUrls = [...form.querySelectorAll('[data-keep-hero-slide]:checked')]
        .map(input => input.dataset.keepHeroSlide)
      const allowedImageTypes = new Set(['image/png', 'image/jpeg', 'image/webp'])
      const oversizedHeroImage = heroFiles.find(file => file.size > 10 * 1024 * 1024)
      const invalidHeroImage = heroFiles.find(file => !allowedImageTypes.has(file.type))
      if (oversizedHeroImage) throw new Error(`ภาพ "${oversizedHeroImage.name}" มีขนาดเกิน 10 MB`)
      if (invalidHeroImage) throw new Error(`ไฟล์ "${invalidHeroImage.name}" ต้องเป็น PNG, JPG หรือ WebP`)

      let nextLogoUrl = form.querySelector('#logoUrl').value.trim()
      if (logoFile) {
        const path = `${crypto.randomUUID()}-${logoFile.name.replace(/[^\w.-]+/g, '_')}`
        nextLogoUrl = await db.uploadFile('logos', path, logoFile)
        uploadedLogoUrl = nextLogoUrl
      }
      for (const file of heroFiles) {
        const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]+/g, '_')}`
        uploadedHeroUrls.push(await db.uploadFile('covers', path, file))
      }

      const nextHeroSlides = [...retainedHeroUrls, ...uploadedHeroUrls]
      await Promise.all([
        db.saveSetting('site_name', form.querySelector('#siteName').value.trim()),
        db.saveSetting('facebook_link', form.querySelector('#facebookLink').value.trim()),
        db.saveSetting('logo_url', nextLogoUrl)
      ])
      await db.saveSetting('hero_slides', JSON.stringify(nextHeroSlides))

      if (logoFile && logoUrl?.includes('/storage/v1/object/')) {
        const oldLogo = storageFile('logos', logoUrl)
        if (oldLogo) {
          try {
            await db.deleteFile(oldLogo.bucket, oldLogo.path)
          } catch (error) {
            console.error('Could not remove replaced logo:', error)
          }
        }
      }

      const retainedHeroSet = new Set(nextHeroSlides)
      const removedSlideFiles = heroSlides
        .filter(url => !retainedHeroSet.has(url))
        .map(url => storageFile('covers', url))
        .filter(file => file?.bucket === 'covers')
      const cleanupResults = await Promise.allSettled(
        removedSlideFiles.map(file => db.deleteFile(file.bucket, file.path))
      )
      const cleanupFailed = cleanupResults.some(result => result.status === 'rejected')
      if (cleanupFailed) {
        console.error('Could not remove replaced hero slide files:', cleanupResults)
      }
      toast(cleanupFailed ? 'บันทึกแล้ว แต่ลบภาพสไลด์เก่าไม่สำเร็จ' : 'บันทึกการตั้งค่าแล้ว')
      signalStoreChanged()
    } catch (error) {
      const uploadedFiles = [
        ...uploadedHeroUrls.map(url => storageFile('covers', url)),
        uploadedLogoUrl ? storageFile('logos', uploadedLogoUrl) : null
      ].filter(Boolean)
      const cleanupResults = await Promise.allSettled(
        uploadedFiles.map(file => db.deleteFile(file.bucket, file.path))
      )
      if (cleanupResults.some(result => result.status === 'rejected')) {
        console.error('Could not clean up uploaded settings images:', cleanupResults)
      }
      console.error('Could not save settings:', error)
      toast(`บันทึกการตั้งค่าไม่สำเร็จ: ${error.message || ''}`)
    }
  })
}

window.adminTab = adminTab
