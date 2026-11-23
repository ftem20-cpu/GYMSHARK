// ============================================================================
// INVENTARIOPRO - MOTOR DE DATOS (LOTES, RESTOCK, ROPA Y SUPABASE CLOUD)
// ============================================================================

import {
  INITIAL_BUSINESS_PROFILE,
  BUSINESS_PRESETS,
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_BATCHES,
  INITIAL_PURCHASES,
  INITIAL_EXPENSES
} from './seed-data.js';

const STORAGE_KEYS = {
  CONFIG: 'invpro_supabase_config_v8',
  PROFILE: 'invpro_business_profile_v8',
  USERS: 'invpro_users_v8',
  PRODUCTS: 'invpro_products_v8',
  SALES: 'invpro_sales_v8',
  BATCHES: 'invpro_batches_v8',
  PURCHASES: 'invpro_purchases_v8',
  EXPENSES: 'invpro_expenses_v8',
  SESSION: 'invpro_current_user_v8'
};

export const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Única'];

const DEFAULT_SUPABASE_CONFIG = {
  url: 'https://xscztkuvvvbeodfojhak.supabase.co',
  anonKey: 'sb_publishable_KAmQtKzyerswuUL6UmtJqQ_hyoaPO4i',
  enabled: true,
  lastSync: null
};

class DataService {
  constructor() {
    const savedCfg = this._loadJSON(STORAGE_KEYS.CONFIG, DEFAULT_SUPABASE_CONFIG);
    if (!savedCfg.url || !savedCfg.anonKey) {
      this.config = { ...DEFAULT_SUPABASE_CONFIG };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
    } else {
      this.config = savedCfg;
    }

    this.profile = this._loadJSON(STORAGE_KEYS.PROFILE, INITIAL_BUSINESS_PROFILE);
    this.users = this._loadJSON(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.products = this._loadJSON(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    this.sales = this._loadJSON(STORAGE_KEYS.SALES, INITIAL_SALES);
    this.batches = this._loadJSON(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
    this.purchases = this._loadJSON(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
    this.expenses = this._loadJSON(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    // Por seguridad, siempre iniciar como Vendedor (empleado) al abrir la web;
    // el acceso de Administrador siempre requiere contraseña al cambiar de vista.
    const defaultVendor =
      this.users.find(u => u.role === 'vendedor') ||
      INITIAL_USERS.find(u => u.role === 'vendedor') ||
      this.users[0];
    this.currentUser = defaultVendor;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(defaultVendor));

    // Actualizar contraseña de administrador predeterminada a 'Anfitrion' sin tocar lotes ni inventario
    let usersChanged = false;
    this.users.forEach(u => {
      if (u.role === 'admin' && (!u.pin_or_password || u.pin_or_password === 'admin123' || u.pin_or_password === '123456')) {
        u.pin_or_password = 'Anfitrion';
        usersChanged = true;
      } else if (u.role === 'vendedor' && u.pin_or_password === 'ventas123') {
        u.pin_or_password = '';
        usersChanged = true;
      }
    });
    if (usersChanged) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    }

    // Normalizar tallas en todas las prendas existentes sin perder stock ni lotes
    let prodsChanged = false;
    this.products.forEach(p => {
      if (this._normalizeProductSizes(p)) {
        prodsChanged = true;
      }
    });
    if (prodsChanged) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    }
  }

  _normalizeProductSizes(p) {
    if (!p || p.item_type === 'service') return false;
    let changed = false;
    if (!p.sizes_stock || typeof p.sizes_stock !== 'object') {
      p.sizes_stock = { XS: 0, S: 0, M: 0, L: 0, XL: 0, 'Única': 0 };
      const st = Math.max(0, Number(p.stock) || 0);
      if (st > 0) {
        if ((p.category || '').toLowerCase().includes('accesorio')) {
          p.sizes_stock['Única'] = st;
        } else {
          const s = Math.floor(st / 3);
          const l = Math.floor((st - s) / 2);
          const m = st - s - l;
          p.sizes_stock.S = s;
          p.sizes_stock.M = m;
          p.sizes_stock.L = l;
        }
      }
      changed = true;
    } else {
      STANDARD_SIZES.forEach(sz => {
        if (p.sizes_stock[sz] === undefined) {
          p.sizes_stock[sz] = 0;
          changed = true;
        } else {
          p.sizes_stock[sz] = Math.max(0, Number(p.sizes_stock[sz]) || 0);
        }
      });
    }
    const activeSizes = STANDARD_SIZES.filter(sz => Number(p.sizes_stock[sz]) > 0);
    const sizeLabel = activeSizes.length > 0 ? activeSizes.join(', ') : (p.size || 'S, M, L');
    if (p.size !== sizeLabel) {
      p.size = sizeLabel;
      changed = true;
    }
    return changed;
  }

  _loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return JSON.parse(JSON.stringify(fallback));
      }
      return JSON.parse(raw);
    } catch (e) {
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  _saveAllLocal() {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(this.profile));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(this.sales));
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(this.batches));
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(this.purchases));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(this.expenses));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
  }

  saveBusinessProfile(updates) {
    this.profile = {
      ...this.profile,
      ...updates,
      exchangeRate: Math.max(0, Number(updates.exchangeRate ?? this.profile.exchangeRate) || 0),
      taxPercent: Math.max(0, Number(updates.taxPercent ?? this.profile.taxPercent) || 0)
    };
    this._saveAllLocal();
    if (this.isCloudConnected()) {
      this._supabaseRequest(
        'store_profile',
        'POST',
        [{ id: 'main', data: this.profile, updated_at: new Date().toISOString() }],
        'on_conflict=id'
      ).catch(e => console.warn('Error sincronizando perfil:', e));
    }
    return this.profile;
  }

  applyIndustryPreset(presetId) {
    const preset = BUSINESS_PRESETS[presetId] || BUSINESS_PRESETS.clothing;
    this.profile.industryPreset = preset.id;
    this.profile.suggestedCategories = [...new Set([...preset.categories, ...(this.profile.suggestedCategories || [])])];
    this.profile.units = [...new Set([...preset.units, ...(this.profile.units || [])])];
    this._saveAllLocal();
    return preset;
  }

  isCloudConnected() {
    return Boolean(this.config.enabled && this.config.url && this.config.anonKey);
  }

  async _supabaseRequest(table, method = 'GET', body = null, query = '') {
    if (!this.isCloudConnected()) return null;
    const baseUrl = this.config.url.replace(/\/+$/, '');
    const endpoint = `${baseUrl}/rest/v1/${table}${query ? `?${query}` : ''}`;

    const headers = {
      'apikey': this.config.anonKey,
      'Authorization': `Bearer ${this.config.anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation,resolution=merge-duplicates'
    };

    const options = { method, headers, cache: 'no-store' };
    if (body !== null) {
      options.body = JSON.stringify(body);
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new Error('Sin conexión a internet. Conéctate para sincronizar con la nube.');
    }

    const response = await fetch(endpoint, options);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Supabase (${response.status}): ${errText}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async configureSupabase(url, anonKey) {
    const cleanUrl = (url || '').trim().replace(/\/+$/, '');
    const cleanKey = (anonKey || '').trim();

    if (!cleanUrl || !cleanKey) {
      this.config = { url: '', anonKey: '', enabled: false, lastSync: null };
      this._saveAllLocal();
      return { ok: true, mode: 'local', message: 'Modo local activado.' };
    }

    this.config = {
      url: cleanUrl,
      anonKey: cleanKey,
      enabled: true,
      lastSync: this.config.lastSync
    };
    this._saveAllLocal();

    try {
      await this._supabaseRequest('products', 'GET', null, 'select=id&limit=1');
      return {
        ok: true,
        mode: 'cloud',
        message: 'Conexión exitosa con Supabase Cloud.'
      };
    } catch (err) {
      return {
        ok: false,
        mode: 'error',
        message: `Error al conectar con Supabase. Verifica haber ejecutado el código SQL. (${err.message})`
      };
    }
  }

  async syncLocalToCloud() {
    if (!this.isCloudConnected()) {
      throw new Error('Supabase no está configurado.');
    }

    await this._supabaseRequest(
      'store_profile',
      'POST',
      [{ id: 'main', data: this.profile, updated_at: new Date().toISOString() }],
      'on_conflict=id'
    );
    if (this.users.length > 0) {
      await this._supabaseRequest('app_users', 'POST', this.users, 'on_conflict=id');
    }
    if (this.products.length > 0) {
      await this._supabaseRequest('products', 'POST', this.products, 'on_conflict=id');
    }
    if (this.sales.length > 0) {
      await this._supabaseRequest('sales', 'POST', this.sales, 'on_conflict=id');
    }
    if (this.batches && this.batches.length > 0) {
      await this._supabaseRequest('batches', 'POST', this.batches, 'on_conflict=id');
    }
    if (this.purchases.length > 0) {
      await this._supabaseRequest('purchases', 'POST', this.purchases, 'on_conflict=id');
    }
    if (this.expenses.length > 0) {
      await this._supabaseRequest('expenses', 'POST', this.expenses, 'on_conflict=id');
    }

    this.config.lastSync = new Date().toISOString();
    this._saveAllLocal();
    return true;
  }

  async pullFromCloud() {
    if (!this.isCloudConnected()) return false;

    const [cloudProfile, cloudUsers, cloudProducts, cloudSales, cloudBatches, cloudPurchases, cloudExpenses] = await Promise.all([
      this._supabaseRequest('store_profile', 'GET', null, 'select=*&id=eq.main').catch(() => null),
      this._supabaseRequest('app_users', 'GET', null, 'select=*&order=created_at.asc'),
      this._supabaseRequest('products', 'GET', null, 'select=*&order=name.asc'),
      this._supabaseRequest('sales', 'GET', null, 'select=*&order=date.desc'),
      this._supabaseRequest('batches', 'GET', null, 'select=*&order=purchased_date.desc').catch(() => null),
      this._supabaseRequest('purchases', 'GET', null, 'select=*&order=date.desc'),
      this._supabaseRequest('expenses', 'GET', null, 'select=*&order=date.desc')
    ]);

    if (Array.isArray(cloudProfile) && cloudProfile.length > 0 && cloudProfile[0].data) {
      this.profile = { ...this.profile, ...cloudProfile[0].data };
    }
    if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
      this.users = cloudUsers;
      // Si el usuario actual no está en la lista o es vendedor, sincronizar sus datos sin elevar permisos a admin
      const refreshedCurrent = this.users.find(u => u.id === this.currentUser?.id);
      if (refreshedCurrent) {
        this.currentUser = refreshedCurrent;
      } else {
        const v = this.users.find(u => u.role === 'vendedor');
        if (v) this.currentUser = v;
      }
    }
    if (Array.isArray(cloudProducts)) {
      this.products = cloudProducts.map(p => {
        const mapped = {
          ...p,
          item_type: p.item_type || 'product',
          batch_code: p.batch_code || 'LOTE-01',
          last_restock_at: p.last_restock_at || p.updated_at || new Date().toISOString(),
          stock: Number(p.stock),
          min_stock: Number(p.min_stock),
          purchase_cost: p.purchase_cost !== undefined && p.purchase_cost !== null ? Number(p.purchase_cost) : Number(p.unit_cost),
          shipping_cost: Number(p.shipping_cost) || 0,
          unit_cost: Number(p.unit_cost),
          sale_price: Number(p.sale_price)
        };
        this._normalizeProductSizes(mapped);
        return mapped;
      });
    }
    if (Array.isArray(cloudSales)) {
      this.sales = cloudSales.map(s => ({
        ...s,
        payment_reference: s.payment_reference || '',
        exchange_rate: Number(s.exchange_rate) || 0,
        secondary_currency: s.secondary_currency || 'Bs.',
        subtotal: Number(s.subtotal),
        discount: Number(s.discount),
        total: Number(s.total),
        total_cost: Number(s.total_cost),
        profit: Number(s.profit)
      }));
    }
    if (Array.isArray(cloudBatches)) {
      this.batches = cloudBatches.map(b => ({
        ...b,
        items_count: Number(b.items_count) || 0,
        purchase_amount: Number(b.purchase_amount) || 0,
        shipping_amount: Number(b.shipping_amount) || 0,
        total_cost: Number(b.total_cost) || 0
      }));
    }
    if (Array.isArray(cloudPurchases)) {
      this.purchases = cloudPurchases.map(p => ({
        ...p,
        batch_code: p.batch_code || 'LOTE-01',
        quantity: Number(p.quantity),
        purchase_cost: p.purchase_cost !== undefined && p.purchase_cost !== null ? Number(p.purchase_cost) : Number(p.unit_cost),
        shipping_cost: Number(p.shipping_cost) || 0,
        unit_cost: Number(p.unit_cost),
        total_cost: Number(p.total_cost)
      }));
    }
    if (Array.isArray(cloudExpenses)) {
      this.expenses = cloudExpenses.map(e => ({
        ...e,
        amount: Number(e.amount)
      }));
    }

    this.config.lastSync = new Date().toISOString();
    this._saveAllLocal();
    return true;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  }

  switchUserById(userId) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.setCurrentUser(user);
    }
    return user;
  }

  async saveUser(userData) {
    const existingIdx = this.users.findIndex(u => u.id === userData.id);
    const isRoleAdmin = userData.role === 'admin';
    const record = {
      id: userData.id || `usr-${Date.now()}`,
      name: userData.name.trim(),
      email: (userData.email || `${userData.name.trim().toLowerCase().replace(/\s+/g, '')}@tienda.com`).trim().toLowerCase(),
      role: isRoleAdmin ? 'admin' : 'vendedor',
      pin_or_password: isRoleAdmin ? (userData.pin_or_password || 'Anfitrion') : '',
      active: userData.active !== false,
      created_at: userData.created_at || new Date().toISOString()
    };

    if (this.isCloudConnected()) {
      await this._supabaseRequest('app_users', 'POST', [record], 'on_conflict=id');
    }

    if (existingIdx >= 0) {
      this.users[existingIdx] = record;
    } else {
      this.users.push(record);
    }

    if (this.currentUser && this.currentUser.id === record.id) {
      this.setCurrentUser(record);
    }

    this._saveAllLocal();
    return record;
  }

  async deleteUser(userId) {
    if (this.users.length <= 1) {
      throw new Error('No puedes eliminar el único usuario del sistema.');
    }
    this.users = this.users.filter(u => u.id !== userId);
    this._saveAllLocal();
    if (this.isCloudConnected()) {
      try {
        await this._supabaseRequest('app_users', 'DELETE', null, `id=eq.${encodeURIComponent(userId)}`);
      } catch (e) {
        console.warn('Error eliminando usuario:', e);
      }
    }
  }

  // --------------------------------------------------------------------------
  // GESTIÓN DE PRENDAS / PRODUCTOS Y LOTES DE CARGAMENTO
  // --------------------------------------------------------------------------
  async saveProduct(productData) {
    const cleanSku = productData.sku.trim().toUpperCase();
    const duplicate = this.products.find(
      p => p.sku.toUpperCase() === cleanSku && p.id !== productData.id
    );
    if (duplicate) {
      throw new Error(`Ya existe una prenda con el código "${cleanSku}" (${duplicate.name}).`);
    }

    const isService = productData.item_type === 'service';
    const category = (productData.category || 'Mujer').trim();
    const unit = (productData.unit || (isService ? 'servicio' : 'und')).trim();
    const batchCode = isService
      ? '-'
      : (productData.batch_code || 'LOTE-01').trim().toUpperCase();

    let restockIso = null;
    if (productData.last_restock_at) {
      const parsedDate = new Date(productData.last_restock_at);
      if (!isNaN(parsedDate.getTime())) {
        restockIso = parsedDate.toISOString();
      }
    }

    if (category && !this.profile.suggestedCategories.includes(category)) {
      this.profile.suggestedCategories.push(category);
    }

    const purchaseCost = Number(productData.purchase_cost ?? productData.unit_cost) || 0;
    const shippingCost = Number(productData.shipping_cost) || 0;
    const totalUnitCost =
      productData.purchase_cost !== undefined || productData.shipping_cost !== undefined
        ? Number((purchaseCost + shippingCost).toFixed(2))
        : (Number(productData.unit_cost) || 0);

    // Procesar inventario por tallas (XS, S, M, L, XL, Única)
    const sizesStock = { XS: 0, S: 0, M: 0, L: 0, XL: 0, 'Única': 0 };
    let hasSizesInput = false;
    if (productData.sizes_stock && typeof productData.sizes_stock === 'object') {
      hasSizesInput = true;
      STANDARD_SIZES.forEach(sz => {
        sizesStock[sz] = Math.max(0, Number(productData.sizes_stock[sz]) || 0);
      });
    }

    let finalStock = isService ? 999 : (Number(productData.stock) || 0);
    if (!isService && hasSizesInput) {
      finalStock = STANDARD_SIZES.reduce((sum, sz) => sum + sizesStock[sz], 0);
    } else if (!isService && finalStock > 0) {
      if (category.toLowerCase().includes('accesorio')) {
        sizesStock['Única'] = finalStock;
      } else {
        const s = Math.floor(finalStock / 3);
        const l = Math.floor((finalStock - s) / 2);
        const m = finalStock - s - l;
        sizesStock.S = s;
        sizesStock.M = m;
        sizesStock.L = l;
      }
    }

    const activeSizes = STANDARD_SIZES.filter(sz => sizesStock[sz] > 0);
    const sizeSummary = activeSizes.length > 0 ? activeSizes.join(', ') : 'Sin stock';

    const record = {
      id: productData.id || `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sku: cleanSku,
      name: productData.name.trim(),
      category,
      item_type: isService ? 'service' : 'product',
      image_url: productData.image_url !== undefined ? productData.image_url : '',
      batch_code: batchCode,
      last_restock_at: isService ? null : restockIso,
      sizes_stock: sizesStock,
      size: sizeSummary,
      stock: finalStock,
      min_stock: isService ? 0 : (Number(productData.min_stock) || 0),
      purchase_cost: Number(purchaseCost.toFixed(2)),
      shipping_cost: Number(shippingCost.toFixed(2)),
      unit_cost: totalUnitCost,
      sale_price: Number(productData.sale_price) || 0,
      unit: 'und',
      updated_at: new Date().toISOString()
    };

    if (this.isCloudConnected()) {
      await this._supabaseRequest('products', 'POST', [record], 'on_conflict=id');
    }
    const idx = this.products.findIndex(p => p.id === record.id);
    if (idx >= 0) {
      this.products[idx] = record;
    } else {
      this.products.unshift(record);
    }
    this._saveAllLocal();
    return record;
  }

  async adjustProductStock(productId, delta) {
    const product = this.products.find(p => p.id === productId);
    if (!product || product.item_type === 'service') return null;
    product.stock = Math.max(0, Number((Number(product.stock) + Number(delta)).toFixed(2)));
    if (delta > 0) {
      product.last_restock_at = new Date().toISOString();
    }
    product.updated_at = new Date().toISOString();
    this._saveAllLocal();
    if (this.isCloudConnected()) {
      try {
        await this._supabaseRequest('products', 'POST', [product], 'on_conflict=id');
      } catch (e) {
        console.warn('Error ajustando stock:', e);
      }
    }
    return product;
  }

  async deleteProduct(productId) {
    this.products = this.products.filter(p => p.id !== productId);
    this._saveAllLocal();
    if (this.isCloudConnected()) {
      try {
        await this._supabaseRequest('products', 'DELETE', null, `id=eq.${encodeURIComponent(productId)}`);
      } catch (e) {
        console.warn('Error eliminando producto:', e);
      }
    }
  }

  async bulkUpsertProducts(rows) {
    let created = 0;
    let updated = 0;
    const touched = [];
    const nowIso = new Date().toISOString();

    for (const r of rows) {
      const cleanSku = String(r.sku || '').trim().toUpperCase();
      if (!cleanSku || !r.name) continue;

      const existing = this.products.find(p => p.sku.toUpperCase() === cleanSku);
      if (existing) {
        existing.name = String(r.name).trim();
        existing.category = String(r.category || existing.category || 'Mujer').trim();
        if (r.batch_code) existing.batch_code = String(r.batch_code).trim().toUpperCase();
        existing.last_restock_at = nowIso;
        existing.stock = !isNaN(Number(r.stock)) ? Number(r.stock) : existing.stock;
        existing.min_stock = !isNaN(Number(r.min_stock)) ? Number(r.min_stock) : existing.min_stock;
        existing.unit_cost = !isNaN(Number(r.unit_cost)) ? Number(r.unit_cost) : existing.unit_cost;
        existing.sale_price = !isNaN(Number(r.sale_price)) ? Number(r.sale_price) : existing.sale_price;
        existing.updated_at = nowIso;
        touched.push(existing);
        updated++;
      } else {
        const newProd = {
          id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sku: cleanSku,
          name: String(r.name).trim(),
          category: String(r.category || 'Mujer').trim(),
          item_type: 'product',
          batch_code: String(r.batch_code || 'LOTE-01').trim().toUpperCase(),
          last_restock_at: nowIso,
          stock: Number(r.stock) || 0,
          min_stock: Number(r.min_stock) || 4,
          unit_cost: Number(r.unit_cost) || 0,
          sale_price: Number(r.sale_price) || 0,
          unit: 'und',
          updated_at: nowIso
        };
        this.products.push(newProd);
        touched.push(newProd);
        created++;
      }
    }

    this._saveAllLocal();
    if (this.isCloudConnected() && touched.length > 0) {
      try {
        await this._supabaseRequest('products', 'POST', touched, 'on_conflict=id');
      } catch (e) {
        console.warn('Error subiendo lote:', e);
      }
    }
    return { created, updated };
  }

  // --------------------------------------------------------------------------
  // REGISTRO DE VENTAS (COMPLETADAS O EN PENDIENTE, CON TASA DEL DÍA Y REFERENCIA)
  // --------------------------------------------------------------------------
  async createSale({ customer_name, payment_method, payment_reference = '', discount = 0, notes = '', status = 'completada', items }) {
    if (!items || items.length === 0) {
      throw new Error('El carrito de venta está vacío.');
    }

    for (const item of items) {
      const product = this.products.find(p => p.id === item.product_id);
      if (!product) {
        throw new Error(`Prenda no encontrada: ${item.name}`);
      }
      if (product.item_type !== 'service') {
        const selSize = item.selected_size || '';
        if (selSize && product.sizes_stock && product.sizes_stock[selSize] !== undefined) {
          if (product.sizes_stock[selSize] < item.quantity) {
            throw new Error(`Stock insuficiente para "${product.name}" en Talla ${selSize}. Disponible: ${product.sizes_stock[selSize]}`);
          }
        } else if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}`);
        }
      }
    }

    let subtotal = 0;
    let totalCost = 0;
    const processedItems = [];
    const updatedProducts = [];

    for (const item of items) {
      const product = this.products.find(p => p.id === item.product_id);
      const qty = Number(item.quantity);
      const price = Number(item.sale_price ?? product.sale_price);
      const cost = Number(product.unit_cost);
      const selSize = item.selected_size || '';

      const lineSubtotal = Number((qty * price).toFixed(2));
      const lineCost = Number((qty * cost).toFixed(2));
      const lineProfit = Number((lineSubtotal - lineCost).toFixed(2));

      subtotal += lineSubtotal;
      totalCost += lineCost;

      processedItems.push({
        product_id: product.id,
        sku: product.sku,
        name: product.name,
        selected_size: selSize,
        item_type: product.item_type || 'product',
        unit: product.unit || 'und',
        quantity: qty,
        unit_cost: cost,
        sale_price: price,
        subtotal: lineSubtotal,
        cost_total: lineCost,
        profit: lineProfit
      });

      if (product.item_type !== 'service') {
        this._normalizeProductSizes(product);
        if (selSize && product.sizes_stock && product.sizes_stock[selSize] !== undefined) {
          product.sizes_stock[selSize] = Math.max(0, Number((product.sizes_stock[selSize] - qty).toFixed(2)));
          product.stock = STANDARD_SIZES.reduce((sum, sz) => sum + (Number(product.sizes_stock[sz]) || 0), 0);
        } else {
          product.stock = Math.max(0, Number((product.stock - qty).toFixed(2)));
        }
        this._normalizeProductSizes(product);
        product.updated_at = new Date().toISOString();
        updatedProducts.push(product);
      }
    }

    subtotal = Number(subtotal.toFixed(2));
    totalCost = Number(totalCost.toFixed(2));
    const cleanDiscount = Math.min(subtotal, Math.max(0, Number(discount) || 0));
    const total = Number((subtotal - cleanDiscount).toFixed(2));
    const profit = Number((total - totalCost).toFixed(2));

    // Garantizar número de recibo único (tomando el máximo existente + 1 para evitar duplicados)
    const maxReceiptNum = this.sales.reduce((max, s) => {
      const m = String(s.receipt_number || '').match(/(\d+)$/);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, this.sales.length);
    const nextNum = maxReceiptNum + 1;
    const receiptNumber = `VTA-${String(nextNum).padStart(4, '0')}`;
    const saleStatus = status === 'pendiente' ? 'pendiente' : 'completada';
    const currentRate = Number(this.profile?.exchangeRate) || 0;
    const currentSym = this.profile?.secondaryCurrencySymbol || 'Bs.';

    const saleRecord = {
      id: `sal-${Date.now()}`,
      receipt_number: receiptNumber,
      date: new Date().toISOString(),
      customer_name: (customer_name || 'Cliente General').trim(),
      payment_method: saleStatus === 'pendiente' ? (payment_method || 'Pendiente por pagar') : (payment_method || 'Efectivo USD'),
      payment_reference: (payment_reference || '').trim(),
      exchange_rate: currentRate,
      secondary_currency: currentSym,
      subtotal,
      discount: cleanDiscount,
      total,
      total_cost: totalCost,
      profit,
      seller_id: this.currentUser ? this.currentUser.id : 'usr-admin-1',
      seller_name: this.currentUser ? this.currentUser.name : 'Administrador',
      status: saleStatus,
      notes: (notes || '').trim(),
      items: processedItems
    };

    const uniqueUpdatedProducts = Array.from(
      new Map(updatedProducts.map(p => [p.id, p])).values()
    );

    if (this.isCloudConnected()) {
      await Promise.all([
        this._supabaseRequest('sales', 'POST', [saleRecord], 'on_conflict=id'),
        uniqueUpdatedProducts.length > 0
          ? this._supabaseRequest('products', 'POST', uniqueUpdatedProducts, 'on_conflict=id')
          : Promise.resolve()
      ]);
    }

    this.sales.unshift(saleRecord);
    this._saveAllLocal();

    return saleRecord;
  }

  async completePendingSale(saleId, payment_method = 'Efectivo USD', payment_reference = '') {
    const sale = this.sales.find(s => s.id === saleId);
    if (!sale) throw new Error('Venta pendiente no encontrada.');
    if (sale.status !== 'pendiente') throw new Error('Esta venta ya fue procesada.');

    sale.status = 'completada';
    sale.payment_method = payment_method || 'Efectivo USD';
    sale.payment_reference = (payment_reference || sale.payment_reference || '').trim();
    sale.exchange_rate = Number(this.profile?.exchangeRate) || sale.exchange_rate || 0;
    sale.secondary_currency = this.profile?.secondaryCurrencySymbol || sale.secondary_currency || 'Bs.';
    sale.date = new Date().toISOString();

    this._saveAllLocal();
    if (this.isCloudConnected()) {
      try {
        await this._supabaseRequest('sales', 'POST', [sale], 'on_conflict=id');
      } catch (e) {
        console.warn('Error sincronizando cobro de venta pendiente:', e);
      }
    }
    return sale;
  }

  async updateSaleReference(saleId, payment_reference) {
    const sale = this.sales.find(s => s.id === saleId);
    if (!sale) throw new Error('Venta no encontrada.');
    sale.payment_reference = (payment_reference || '').trim();
    if (!sale.exchange_rate && Number(this.profile?.exchangeRate) > 0) {
      sale.exchange_rate = Number(this.profile.exchangeRate);
      sale.secondary_currency = this.profile?.secondaryCurrencySymbol || 'Bs.';
    }
    this._saveAllLocal();
    if (this.isCloudConnected()) {
      try {
        await this._supabaseRequest('sales', 'POST', [sale], 'on_conflict=id');
      } catch (e) {
        console.warn('Error actualizando referencia de venta:', e);
      }
    }
    return sale;
  }

  async resumePendingSaleToCart(saleId) {
    const idx = this.sales.findIndex(s => s.id === saleId);
    if (idx === -1) throw new Error('Venta pendiente no encontrada.');
    const sale = this.sales[idx];

    const updatedProducts = [];
    for (const item of sale.items) {
      const product = this.products.find(p => p.id === item.product_id);
      if (product && product.item_type !== 'service') {
        this._normalizeProductSizes(product);
        const selSize = item.selected_size || '';
        if (selSize && product.sizes_stock && product.sizes_stock[selSize] !== undefined) {
          product.sizes_stock[selSize] = Number((product.sizes_stock[selSize] + Number(item.quantity)).toFixed(2));
          product.stock = STANDARD_SIZES.reduce((sum, sz) => sum + (Number(product.sizes_stock[sz]) || 0), 0);
        } else {
          product.stock = Number((product.stock + Number(item.quantity)).toFixed(2));
        }
        this._normalizeProductSizes(product);
        product.updated_at = new Date().toISOString();
        updatedProducts.push(product);
      }
    }

    const uniqueUpdatedProducts = Array.from(
      new Map(updatedProducts.map(p => [p.id, p])).values()
    );

    if (this.isCloudConnected()) {
      await Promise.all([
        this._supabaseRequest('sales', 'DELETE', null, `id=eq.${encodeURIComponent(saleId)}`),
        uniqueUpdatedProducts.length > 0
          ? this._supabaseRequest('products', 'POST', uniqueUpdatedProducts, 'on_conflict=id')
          : Promise.resolve()
      ]);
    }

    this.sales.splice(idx, 1);
    this._saveAllLocal();

    return sale;
  }

  async cancelSale(saleId) {
    const sale = this.sales.find(s => s.id === saleId);
    if (!sale) throw new Error('Venta no encontrada.');
    if (sale.status === 'anulada') throw new Error('Esta venta ya fue anulada.');

    sale.status = 'anulada';
    const updatedProducts = [];

    for (const item of sale.items) {
      const product = this.products.find(p => p.id === item.product_id);
      if (product && product.item_type !== 'service') {
        this._normalizeProductSizes(product);
        const selSize = item.selected_size || '';
        if (selSize && product.sizes_stock && product.sizes_stock[selSize] !== undefined) {
          product.sizes_stock[selSize] = Number((product.sizes_stock[selSize] + Number(item.quantity)).toFixed(2));
          product.stock = STANDARD_SIZES.reduce((sum, sz) => sum + (Number(product.sizes_stock[sz]) || 0), 0);
        } else {
          product.stock = Number((product.stock + Number(item.quantity)).toFixed(2));
        }
        this._normalizeProductSizes(product);
        product.updated_at = new Date().toISOString();
        updatedProducts.push(product);
      }
    }

    const uniqueUpdatedProducts = Array.from(
      new Map(updatedProducts.map(p => [p.id, p])).values()
    );

    if (this.isCloudConnected()) {
      await Promise.all([
        this._supabaseRequest('sales', 'POST', [sale], 'on_conflict=id'),
        uniqueUpdatedProducts.length > 0
          ? this._supabaseRequest('products', 'POST', uniqueUpdatedProducts, 'on_conflict=id')
          : Promise.resolve()
      ]);
    }

    this._saveAllLocal();
    return sale;
  }

  async deleteSale(saleId) {
    const idx = this.sales.findIndex(s => s.id === saleId);
    if (idx === -1) throw new Error('Venta no encontrada.');
    if (this.isCloudConnected()) {
      await this._supabaseRequest('sales', 'DELETE', null, `id=eq.${encodeURIComponent(saleId)}`);
    }
    this.sales.splice(idx, 1);
    this._saveAllLocal();
    return true;
  }

  async deleteCancelledSales() {
    const cancelled = this.sales.filter(s => s.status === 'anulada');
    if (cancelled.length === 0) return 0;
    if (this.isCloudConnected()) {
      await this._supabaseRequest('sales', 'DELETE', null, 'status=eq.anulada');
    }
    this.sales = this.sales.filter(s => s.status !== 'anulada');
    this._saveAllLocal();
    return cancelled.length;
  }

  // --------------------------------------------------------------------------
  // CONTROL Y SEGUIMIENTO DE LOTES (ADQUIRIDO -> EN VÍA -> LLEGÓ / FINALIZADO)
  // --------------------------------------------------------------------------
  async saveBatch(batchData) {
    const cleanCode = (batchData.batch_code || '').trim().toUpperCase();
    if (!cleanCode) throw new Error('Escribe el código o nombre del lote.');

    const duplicate = this.batches.find(
      b => b.batch_code.toUpperCase() === cleanCode && b.id !== batchData.id
    );
    if (duplicate) {
      throw new Error(`Ya existe un lote con el código "${cleanCode}".`);
    }

    const pAmount = Number(batchData.purchase_amount) || 0;
    const sAmount = Number(batchData.shipping_amount) || 0;
    const totalCost = Number((pAmount + sAmount).toFixed(2));
    const status = ['adquirido', 'en_via', 'llego'].includes(batchData.status)
      ? batchData.status
      : 'adquirido';

    const existing = this.batches.find(b => b.id === batchData.id);
    const nowIso = new Date().toISOString();

    const purchasedDate = batchData.purchased_date
      ? new Date(batchData.purchased_date).toISOString()
      : (existing?.purchased_date || nowIso);

    let inTransitDate =
      batchData.in_transit_date !== undefined
        ? (batchData.in_transit_date ? new Date(batchData.in_transit_date).toISOString() : null)
        : (existing?.in_transit_date || null);

    let arrivedDate =
      batchData.arrived_date !== undefined
        ? (batchData.arrived_date ? new Date(batchData.arrived_date).toISOString() : null)
        : (existing?.arrived_date || null);

    if (status === 'adquirido') {
      inTransitDate = null;
      arrivedDate = null;
    } else if (status === 'en_via') {
      if (!inTransitDate) inTransitDate = nowIso;
      arrivedDate = null;
    } else if (status === 'llego') {
      if (!inTransitDate) inTransitDate = nowIso;
      if (!arrivedDate) arrivedDate = nowIso;
    }

    const record = {
      id: batchData.id || `bat-${Date.now()}`,
      batch_code: cleanCode,
      description: (batchData.description || 'Cargamento de Ropa').trim(),
      supplier: (batchData.supplier || 'Proveedor General').trim(),
      items_count: Number(batchData.items_count) || 0,
      purchase_amount: Number(pAmount.toFixed(2)),
      shipping_amount: Number(sAmount.toFixed(2)),
      total_cost: totalCost,
      status,
      purchased_date: purchasedDate,
      in_transit_date: inTransitDate,
      arrived_date: arrivedDate,
      notes: (batchData.notes || '').trim()
    };

    if (this.isCloudConnected()) {
      await this._supabaseRequest('batches', 'POST', [record], 'on_conflict=id');
    }

    const idx = this.batches.findIndex(b => b.id === record.id);
    if (idx >= 0) {
      this.batches[idx] = record;
    } else {
      this.batches.unshift(record);
    }

    // Sincronizar cambios del lote con las prendas asociadas:
    // 1) Si el lote tiene envío y cantidad de piezas, actualizar shipping_cost y unit_cost de sus prendas
    // 2) Si el lote llegó, actualizar last_restock_at
    const touchedProds = [];
    const newShipPerPiece =
      record.items_count > 0 && record.shipping_amount >= 0
        ? Number((record.shipping_amount / record.items_count).toFixed(2))
        : null;

    this.products.forEach(p => {
      if ((p.batch_code || '').toUpperCase() === cleanCode) {
        let prodUpdated = false;
        if (newShipPerPiece !== null) {
          const basePurchase = Number(p.purchase_cost ?? p.unit_cost) || 0;
          p.shipping_cost = newShipPerPiece;
          p.unit_cost = Number((basePurchase + newShipPerPiece).toFixed(2));
          prodUpdated = true;
        }
        if (status === 'llego' && arrivedDate) {
          p.last_restock_at = arrivedDate;
          prodUpdated = true;
        }
        if (prodUpdated) {
          p.updated_at = new Date().toISOString();
          touchedProds.push(p);
        }
      }
    });

    if (this.isCloudConnected() && touchedProds.length > 0) {
      await this._supabaseRequest('products', 'POST', touchedProds, 'on_conflict=id');
    }

    this._saveAllLocal();
    return record;
  }

  async updateBatchStatus(batchId, newStatus) {
    const batch = this.batches.find(b => b.id === batchId);
    if (!batch) throw new Error('Lote no encontrado.');

    const nowIso = new Date().toISOString();
    batch.status = newStatus;

    if (newStatus === 'adquirido') {
      if (!batch.purchased_date) batch.purchased_date = nowIso;
      batch.in_transit_date = null;
      batch.arrived_date = null;
    } else if (newStatus === 'en_via') {
      batch.in_transit_date = nowIso;
      batch.arrived_date = null;
    } else if (newStatus === 'llego') {
      if (!batch.in_transit_date) batch.in_transit_date = nowIso;
      batch.arrived_date = nowIso;
      // Actualizar fecha de llegada en las prendas de este lote
      this.products.forEach(p => {
        if ((p.batch_code || '').toUpperCase() === batch.batch_code.toUpperCase()) {
          p.last_restock_at = nowIso;
        }
      });
    }

    if (this.isCloudConnected()) {
      await this._supabaseRequest('batches', 'POST', [batch], 'on_conflict=id');
      if (newStatus === 'llego') {
        const touchedProds = this.products.filter(
          p => (p.batch_code || '').toUpperCase() === batch.batch_code.toUpperCase()
        );
        if (touchedProds.length > 0) {
          await this._supabaseRequest('products', 'POST', touchedProds, 'on_conflict=id');
        }
      }
    }

    this._saveAllLocal();
    return batch;
  }

  async deleteBatch(batchId) {
    this.batches = this.batches.filter(b => b.id !== batchId);
    this._saveAllLocal();
    if (this.isCloudConnected()) {
      try {
        await this._supabaseRequest('batches', 'DELETE', null, `id=eq.${encodeURIComponent(batchId)}`);
      } catch (e) {
        console.warn('Error eliminando lote:', e);
      }
    }
  }

  // --------------------------------------------------------------------------
  // ENTRADAS DE CARGAMENTO / RESTOCK POR LOTE
  // --------------------------------------------------------------------------
  async createPurchase({
    product_id,
    quantity,
    sizes_added = null,
    purchase_cost,
    shipping_cost = 0,
    unit_cost,
    sale_price = null,
    batch_code,
    restock_date,
    supplier,
    invoice_ref = '',
    notes = '',
    update_cost_mode = 'replace'
  }) {
    const product = this.products.find(p => p.id === product_id);
    if (!product) throw new Error('Prenda no encontrada.');

    this._normalizeProductSizes(product);

    let qty = Number(quantity) || 0;
    const cleanSizesAdded = {};
    let hasSizesAdded = false;
    if (sizes_added && typeof sizes_added === 'object') {
      let sumSizes = 0;
      STANDARD_SIZES.forEach(sz => {
        const v = Math.max(0, Number(sizes_added[sz]) || 0);
        cleanSizesAdded[sz] = v;
        sumSizes += v;
      });
      if (sumSizes > 0) {
        qty = sumSizes;
        hasSizesAdded = true;
      }
    }

    const pCost = purchase_cost !== undefined ? Number(purchase_cost) : (Number(unit_cost) || 0);
    const sCost = Number(shipping_cost) || 0;
    const newCost = Number((pCost + sCost).toFixed(2));

    if (qty <= 0) throw new Error('Ingresa al menos 1 prenda en las tallas que entraron.');
    if (newCost < 0) throw new Error('El costo unitario no puede ser negativo.');

    const totalCost = Number((qty * newCost).toFixed(2));
    const cleanBatch = (batch_code || product.batch_code || 'LOTE-01').trim().toUpperCase();

    let restockIso = new Date().toISOString();
    if (restock_date) {
      const parsed = new Date(restock_date);
      if (!isNaN(parsed.getTime())) {
        restockIso = parsed.toISOString();
      }
    }

    product.purchase_cost = Number(pCost.toFixed(2));
    product.shipping_cost = Number(sCost.toFixed(2));
    product.unit_cost = newCost;
    if (sale_price !== null && sale_price !== undefined && !isNaN(Number(sale_price)) && Number(sale_price) >= 0) {
      product.sale_price = Number(Number(sale_price).toFixed(2));
    }
    if (hasSizesAdded) {
      STANDARD_SIZES.forEach(sz => {
        product.sizes_stock[sz] = Number((Number(product.sizes_stock[sz] || 0) + cleanSizesAdded[sz]).toFixed(2));
      });
      product.stock = STANDARD_SIZES.reduce((sum, sz) => sum + (Number(product.sizes_stock[sz]) || 0), 0);
    } else {
      product.stock = Number((Number(product.stock) + qty).toFixed(2));
      product.sizes_stock['M'] = Number((Number(product.sizes_stock['M'] || 0) + qty).toFixed(2));
    }
    this._normalizeProductSizes(product);
    product.batch_code = cleanBatch;
    product.last_restock_at = restockIso;
    product.updated_at = new Date().toISOString();

    const sizesSummaryStr = hasSizesAdded
      ? STANDARD_SIZES.filter(sz => cleanSizesAdded[sz] > 0).map(sz => `${sz}: +${cleanSizesAdded[sz]}`).join(', ')
      : '';

    const purchaseRecord = {
      id: `pur-${Date.now()}`,
      date: restockIso,
      product_id: product.id,
      product_sku: product.sku,
      product_name: product.name,
      batch_code: cleanBatch,
      supplier: (supplier || 'Proveedor General').trim(),
      invoice_ref: (invoice_ref || '').trim(),
      quantity: qty,
      sizes_added: hasSizesAdded ? cleanSizesAdded : null,
      sizes_summary: sizesSummaryStr,
      purchase_cost: Number(pCost.toFixed(2)),
      shipping_cost: Number(sCost.toFixed(2)),
      unit_cost: newCost,
      total_cost: totalCost,
      registered_by: this.currentUser ? this.currentUser.name : 'Administrador',
      notes: (notes || '').trim()
    };

    if (this.isCloudConnected()) {
      await Promise.all([
        this._supabaseRequest('purchases', 'POST', [purchaseRecord], 'on_conflict=id'),
        this._supabaseRequest('products', 'POST', [product], 'on_conflict=id')
      ]);
    }

    this.purchases.unshift(purchaseRecord);
    this._saveAllLocal();

    return purchaseRecord;
  }

  async createExpense({ category, description, amount, payment_method, date, notes }) {
    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      throw new Error('El monto del gasto debe ser mayor a $0.00');
    }

    const expenseRecord = {
      id: `exp-${Date.now()}`,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      category: (category || 'Operativo').trim(),
      description: (description || '').trim(),
      amount: Number(cleanAmount.toFixed(2)),
      payment_method: payment_method || 'Transferencia',
      registered_by: this.currentUser ? this.currentUser.name : 'Administrador',
      notes: (notes || '').trim()
    };

    if (this.isCloudConnected()) {
      await this._supabaseRequest('expenses', 'POST', [expenseRecord], 'on_conflict=id');
    }

    this.expenses.unshift(expenseRecord);
    this._saveAllLocal();

    return expenseRecord;
  }

  async deleteExpense(expenseId) {
    this.expenses = this.expenses.filter(e => e.id !== expenseId);
    this._saveAllLocal();
    if (this.isCloudConnected()) {
      try {
        await this._supabaseRequest('expenses', 'DELETE', null, `id=eq.${encodeURIComponent(expenseId)}`);
      } catch (e) {
        console.warn('Error eliminando gasto:', e);
      }
    }
  }

  resetToDemoData() {
    this.profile = JSON.parse(JSON.stringify(INITIAL_BUSINESS_PROFILE));
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    this.sales = JSON.parse(JSON.stringify(INITIAL_SALES));
    this.purchases = JSON.parse(JSON.stringify(INITIAL_PURCHASES));
    this.expenses = JSON.parse(JSON.stringify(INITIAL_EXPENSES));
    this.setCurrentUser(this.users[0]);
    this._saveAllLocal();
  }

  clearAllBusinessData() {
    this.products = [];
    this.sales = [];
    this.purchases = [];
    this.expenses = [];
    this._saveAllLocal();
  }
}

export const db = new DataService();
