// ============================================================================
// INVENTARIOPRO - CONTROLADOR MINIMALISTA PARA VENTA DE ROPA (LOTES Y RESTOCK)
// ============================================================================

import { db, STANDARD_SIZES } from './supabase-client.js';
import { BUSINESS_PRESETS, SUPABASE_SQL_SCHEMA } from './seed-data.js';
import { downloadCSV, parseCSVProducts } from './csv-utils.js';

const CLOTHING_CATEGORIES = ['Mujer', 'Hombre', 'Accesorios', 'Calzado', 'Conjuntos', 'Ofertas'];

function getProductSizesMap(product) {
  if (!product || product.item_type === 'service') return {};
  if (product.sizes_stock && typeof product.sizes_stock === 'object') {
    return product.sizes_stock;
  }
  const st = Math.max(0, Number(product.stock) || 0);
  if ((product.category || '').toLowerCase().includes('accesorio')) {
    return { XS: 0, S: 0, M: 0, L: 0, XL: 0, 'Única': st };
  }
  const s = Math.floor(st / 3);
  const l = Math.floor((st - s) / 2);
  const m = st - s - l;
  return { XS: 0, S: s, M: m, L: l, XL: 0, 'Única': 0 };
}

function getAvailableSizesList(product) {
  const map = getProductSizesMap(product);
  return STANDARD_SIZES.filter(sz => (Number(map[sz]) || 0) > 0).map(sz => ({
    size: sz,
    qty: Number(map[sz]) || 0
  }));
}

const state = {
  currentView: 'dashboard', // 'dashboard', 'pos', 'inventory', 'costs', 'settings'
  dashboardPeriod: 'all',   // 'today', '7d', '30d', 'all'
  posSubTab: 'new',         // 'new' | 'history'
  posSearch: '',
  posCategory: 'ALL',
  posCart: [],
  posDiscount: '',
  posCustomer: '',
  posPaymentMethod: 'Efectivo USD',
  posPaymentReference: '',
  invSearch: '',
  invCategory: 'ALL',
  invBatchFilter: 'ALL',    // Filtro por Lote de cargamento
  invStockFilter: 'ALL',
  invSortBy: 'restock_desc', // 'restock_desc', 'restock_asc', 'batch_asc', 'stock_asc', 'name_asc'
  batchStatusFilter: 'ALL', // 'ALL', 'adquirido', 'en_via', 'llego'
  salesSearch: '',
  costsTab: 'expenses',     // 'expenses' (Gastos) | 'purchases' (Entradas por prenda)
  pendingImportRows: []
};

function fmtUSD(val) {
  const num = Number(val) || 0;
  const sign = num < 0 ? '-' : '';
  return `${sign}$${Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function fmtSecondary(usdVal, customRate = null, customSym = null) {
  const rate = customRate !== null ? Number(customRate) : (Number(db.profile?.exchangeRate) || 0);
  if (rate <= 0) return '';
  const sym = customSym || db.profile?.secondaryCurrencySymbol || 'Bs.';
  const converted = (Number(usdVal) || 0) * rate;
  return `${sym} ${converted.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function isBsPaymentMethod(method) {
  const m = String(method || '').toLowerCase();
  return m.includes('pago móvil') || m.includes('pago movil') || m.includes('bs') || m.includes('bolívar') || m.includes('bolivar');
}

function fmtDate(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function fmtShortDate(isoStr) {
  if (!isoStr) return 'Sin fecha';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return 'Sin fecha';
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function toInputDate(isoStr) {
  const d = isoStr ? new Date(isoStr) : new Date();
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function escapeHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Iconos vectoriales minimalistas en línea con el diseño de la página
function icon(name, cls = 'ui-icon') {
  const paths = {
    bag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',
    receipt: '<path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 3 2 3-2 3 2 2-2V4a2 2 0 0 0-2-2z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    truck: '<rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    trending: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    hanger: '<path d="M12 3a2 2 0 0 1 2 2c0 1.1-.9 2-2 2v2l9 6v2H3v-2l9-6V7"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    cloud: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
    wallet: '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
  };
  return `<svg class="${cls}" viewBox="0 0 24 24">${paths[name] || paths.box}</svg>`;
}

function compressImageFile(file, maxWidth = 420, maxHeight = 320) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth || h > maxHeight) {
          const ratio = Math.min(maxWidth / w, maxHeight / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FAF8F4';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      img.onerror = () => reject(new Error('No se pudo cargar la imagen.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Error leyendo el archivo.'));
    reader.readAsDataURL(file);
  });
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon('check')}</span><span>${escapeHTML(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s';
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

function openModal({ title, bodyHTML, footerHTML, maxWidth = '540px' }) {
  const modal = document.getElementById('app-modal');
  const box = document.getElementById('app-modal-box');
  if (!modal || !box) return;
  box.style.maxWidth = maxWidth;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-footer').innerHTML = footerHTML || '';
  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('app-modal')?.classList.add('hidden');
}

function isAdmin() {
  const u = db.getCurrentUser();
  return !u || u.role === 'admin';
}

function getAllCategories() {
  const fromProfile = db.profile?.suggestedCategories || [];
  const fromProducts = db.products.map(p => p.category);
  return [...new Set([...CLOTHING_CATEGORIES, ...fromProfile, ...fromProducts])].filter(Boolean);
}

function getAllBatches() {
  const fromProds = db.products
    .filter(p => p.item_type !== 'service' && p.batch_code && p.batch_code !== '-')
    .map(p => p.batch_code.toUpperCase());
  const fromBatches = (db.batches || []).map(b => (b.batch_code || '').toUpperCase());
  return [...new Set([...fromBatches, ...fromProds])].filter(Boolean).sort();
}

function updateChrome() {
  const user = db.getCurrentUser();
  const admin = isAdmin();
  const profile = db.profile || {};

  const bNameEl = document.getElementById('brand-business-name');
  const bSubEl = document.getElementById('brand-industry-label');
  if (bNameEl) bNameEl.textContent = (profile.businessName || 'GYMSHARK').toUpperCase();
  if (bSubEl) {
    if (Number(profile.exchangeRate) > 0) {
      bSubEl.style.display = 'block';
      bSubEl.textContent = `1 USD = ${profile.exchangeRate} ${profile.secondaryCurrencySymbol || 'Bs.'}`;
    } else {
      bSubEl.style.display = 'none';
      bSubEl.textContent = '';
    }
  }

  document.querySelectorAll('[data-admin-only="true"]').forEach(el => {
    el.style.display = admin ? '' : 'none';
  });

  // El Vendedor sí puede ver 'dashboard' (Resumen sin números), 'pos' e 'inventory'
  if (!admin && ['batches', 'costs', 'settings'].includes(state.currentView)) {
    state.currentView = 'dashboard';
  }

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === state.currentView);
  });

  const lowCount = db.products.filter(
    p => p.item_type !== 'service' && p.stock <= p.min_stock
  ).length;
  const badge = document.getElementById('nav-low-stock-badge');
  if (badge) {
    badge.style.display = lowCount > 0 ? 'inline-block' : 'none';
    badge.textContent = lowCount;
  }

  const switcher = document.getElementById('quick-user-switcher');
  if (switcher) {
    switcher.innerHTML = db.users
      .map(
        u => `<option value="${escapeHTML(u.id)}" ${u.id === user?.id ? 'selected' : ''}>
          ${u.role === 'admin' ? 'Admin' : 'Vendedor'} · ${escapeHTML(u.name.split('(')[0].trim())}
        </option>`
      )
      .join('');
  }

  const titles = {
    dashboard: admin
      ? ['Resumen de la Tienda', 'Tus ventas, costos, ganancia libre y rotación de prendas']
      : ['Resumen de Prendas', 'Consulta cuáles prendas son las más buscadas y cuáles están por agotarse'],
    pos: ['Ventas', 'Filtra por Mujer, Hombre o Accesorios y toca las prendas para cobrar'],
    inventory: ['Inventario', 'Tus prendas con foto, lote, costo real (compra + envío) y ganancias'],
    batches: ['Control de Lotes', 'Seguimiento de tus cargamentos desde que se compran (Adquirido), cuando van En Vía y cuando Llegan'],
    costs: ['Gastos de la Tienda', 'Registra gastos fijos y operativos (alquiler, bolsas, publicidad, envíos)'],
    settings: ['Ajustes', 'Personaliza el nombre de tu tienda, usuarios y respaldo en la nube']
  };

  const [t, sub] = titles[state.currentView] || titles.dashboard;
  const titleEl = document.getElementById('page-title');
  const subEl = document.getElementById('page-subtitle');
  if (titleEl) titleEl.textContent = t;
  if (subEl) subEl.textContent = sub;

  updateInfoTicker();
}

function updateInfoTicker() {
  const track = document.getElementById('info-ticker-track');
  if (!track) return;

  const admin = isAdmin();
  const physicalProducts = db.products.filter(p => p.item_type !== 'service');
  const totalStockUnits = physicalProducts.reduce((a, p) => a + Math.max(0, Number(p.stock)), 0);
  const lowStockList = physicalProducts.filter(p => p.stock <= p.min_stock);
  const pendingSales = db.sales.filter(s => s.status === 'pendiente');
  const completedSales = db.sales.filter(s => s.status === 'completada');

  // Prenda más vendida
  const salesMap = {};
  completedSales.forEach(s => {
    (s.items || []).forEach(it => {
      salesMap[it.product_id] = (salesMap[it.product_id] || 0) + Number(it.quantity);
    });
  });
  let topGarmentName = physicalProducts[0]?.name || 'Catálogo Activo';
  let maxSold = 0;
  Object.entries(salesMap).forEach(([pid, qty]) => {
    if (qty > maxSold) {
      maxSold = qty;
      const p = db.products.find(x => x.id === pid);
      if (p) topGarmentName = p.name;
    }
  });

  // Estado de Lotes
  const batches = db.batches || [];
  const inTransitBatches = batches.filter(b => b.status === 'en_via');
  const acquiredBatches = batches.filter(b => b.status === 'adquirido');
  const arrivedBatches = batches.filter(b => b.status === 'llego');

  const items = [];

  // 1. Prenda más vendida
  items.push(`
    <span class="ticker-item">
      <span class="ticker-tag olive">Top Ventas</span>
      <span>Prenda más buscada: <strong>${escapeHTML(topGarmentName)}</strong></span>
    </span>
  `);

  // 2. Alertas de stock bajo
  if (lowStockList.length > 0) {
    const names = lowStockList
      .slice(0, 2)
      .map(p => `${p.name} (${p.stock === 0 ? 'Agotada' : `quedan ${p.stock}`})`)
      .join(' · ');
    items.push(`
      <span class="ticker-item">
        <span class="ticker-tag warn">Stock Bajo</span>
        <span>${lowStockList.length} prenda(s) por reponer: <strong>${escapeHTML(names)}</strong></span>
      </span>
    `);
  } else {
    items.push(`
      <span class="ticker-item">
        <span class="ticker-tag olive">Stock Óptimo</span>
        <span>Todas las prendas cuentan con disponibilidad saludable</span>
      </span>
    `);
  }

  // 3. Ventas en Pendiente
  if (pendingSales.length > 0) {
    items.push(`
      <span class="ticker-item">
        <span class="ticker-tag warn">Pendientes</span>
        <span><strong>${pendingSales.length} venta(s)</strong> esperando confirmación de pago</span>
      </span>
    `);
  }

  // 4. Seguimiento de Lotes (Solo Admin o informativo general de llegada)
  if (admin && batches.length > 0) {
    const viaTxt = inTransitBatches.length > 0 ? `${inTransitBatches.length} En Vía (${inTransitBatches[0].batch_code})` : '0 En Vía';
    const adqTxt = acquiredBatches.length > 0 ? `${acquiredBatches.length} Adquirido` : '0 Adquiridos';
    const llegTxt = arrivedBatches.length > 0 ? `Último recibido: ${arrivedBatches[0].batch_code}` : '';
    items.push(`
      <span class="ticker-item">
        <span class="ticker-tag">Lotes</span>
        <span><strong>${escapeHTML(viaTxt)}</strong> · ${escapeHTML(adqTxt)} ${llegTxt ? `· ${escapeHTML(llegTxt)}` : ''}</span>
      </span>
    `);
  }

  // 5. Inventario general
  items.push(`
    <span class="ticker-item">
      <span class="ticker-tag">Inventario</span>
      <span><strong>${totalStockUnits} prendas</strong> disponibles en ${physicalProducts.length} referencias</span>
    </span>
  `);

  // 6. Tasa de cambio si está activa
  if (Number(db.profile?.exchangeRate) > 0) {
    items.push(`
      <span class="ticker-item">
        <span class="ticker-tag olive">Tasa Activa</span>
        <span>1 USD = <strong>${db.profile.exchangeRate} ${escapeHTML(db.profile.secondaryCurrencySymbol || 'Bs.')}</strong></span>
      </span>
    `);
  }

  const singlePass = items.join('<span class="ticker-sep">✦</span>');
  // Duplicar para animación continua e infinita sin cortes
  track.innerHTML = `${singlePass}<span class="ticker-sep">✦</span>${singlePass}<span class="ticker-sep">✦</span>`;
}

let lastCloudPullAt = 0;
let isCloudPulling = false;

async function syncFromCloudLive(showNotification = false) {
  if (!db.isCloudConnected() || isCloudPulling) return false;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    if (showNotification) showToast('Sin conexión a internet. No se pudo actualizar desde la nube.');
    return false;
  }
  isCloudPulling = true;
  try {
    const ok = await db.pullFromCloud();
    lastCloudPullAt = Date.now();
    if (ok) {
      updateChrome();
      // No re-renderizar si hay un modal abierto para no interrumpir lo que el usuario está escribiendo
      const modalEl = document.getElementById('app-modal');
      const isModalOpen = modalEl && !modalEl.classList.contains('hidden');
      if (!isModalOpen) {
        renderCurrentView();
      }
      if (showNotification) showToast('Datos sincronizados con la nube.');
    }
    return ok;
  } catch (err) {
    console.warn('Error sincronizando con la nube:', err);
    if (showNotification) showToast('Sin conexión con la nube. Verifica tu internet.');
    return false;
  } finally {
    isCloudPulling = false;
  }
}

function navigateTo(view) {
  state.currentView = view;
  updateChrome();
  renderCurrentView();
  // Si pasaron más de 8 segundos desde la última consulta, refrescar silenciosamente desde Supabase
  if (Date.now() - lastCloudPullAt > 8000) {
    syncFromCloudLive(false);
  }
}

function renderCurrentView() {
  const container = document.getElementById('main-content');
  const topActions = document.getElementById('topbar-actions');
  if (!container) return;
  if (topActions) topActions.innerHTML = '';

  switch (state.currentView) {
    case 'dashboard':
      renderDashboard(container, topActions);
      break;
    case 'pos':
      renderPOS(container, topActions);
      break;
    case 'inventory':
      renderInventory(container, topActions);
      break;
    case 'batches':
      renderBatches(container, topActions);
      break;
    case 'costs':
      renderCostsAndPurchases(container, topActions);
      break;
    case 'settings':
      renderSettings(container, topActions);
      break;
    default:
      renderDashboard(container, topActions);
  }
}

// ============================================================================
// 1. RESUMEN (CON VISTA DIFERENCIADA PARA ADMIN Y VENDEDOR)
// ============================================================================
function filterByPeriod(records, period) {
  if (period === 'all') return records;
  const now = new Date();
  let cutoff = new Date(0);
  if (period === 'today') {
    cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === '7d') {
    cutoff = new Date(now.getTime() - 7 * 86400000);
  } else if (period === '30d') {
    cutoff = new Date(now.getTime() - 30 * 86400000);
  }
  return records.filter(r => new Date(r.date) >= cutoff);
}

function renderDashboard(container, topActions) {
  const admin = isAdmin();

  if (topActions) {
    topActions.innerHTML = `
      <div class="tabs">
        <button class="tab-btn ${state.dashboardPeriod === 'today' ? 'active' : ''}" data-period="today">Hoy</button>
        <button class="tab-btn ${state.dashboardPeriod === '7d' ? 'active' : ''}" data-period="7d">7 días</button>
        <button class="tab-btn ${state.dashboardPeriod === '30d' ? 'active' : ''}" data-period="30d">30 días</button>
        <button class="tab-btn ${state.dashboardPeriod === 'all' ? 'active' : ''}" data-period="all">Todo</button>
      </div>
      <button class="btn btn-primary" id="dash-go-pos">${icon('bag')} Nueva Venta</button>
    `;
    topActions.querySelectorAll('[data-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.dashboardPeriod = btn.dataset.period;
        renderCurrentView();
      });
    });
    document.getElementById('dash-go-pos')?.addEventListener('click', () => {
      state.posSubTab = 'new';
      navigateTo('pos');
    });
  }

  const activeSales = filterByPeriod(
    db.sales.filter(s => s.status === 'completada'),
    state.dashboardPeriod
  );
  const periodExpenses = filterByPeriod(db.expenses, state.dashboardPeriod);

  const grossRevenue = activeSales.reduce((acc, s) => acc + Number(s.total), 0);
  const cogs = activeSales.reduce((acc, s) => acc + Number(s.total_cost), 0);
  const operatingExpenses = periodExpenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const netProfit = grossRevenue - cogs - operatingExpenses;

  const physicalProducts = db.products.filter(p => p.item_type !== 'service');
  const invCostValue = physicalProducts.reduce((acc, p) => acc + Math.max(0, p.stock) * p.unit_cost, 0);

  const lowStockProducts = physicalProducts
    .filter(p => p.stock <= p.min_stock)
    .sort((a, b) => a.stock - b.stock);

  // Ranking de prendas más vendidas
  const productSalesMap = {};
  activeSales.forEach(s => {
    (s.items || []).forEach(it => {
      if (!productSalesMap[it.product_id]) {
        const prodObj = db.products.find(p => p.id === it.product_id);
        productSalesMap[it.product_id] = {
          name: it.name,
          category: prodObj?.category || 'Ropa',
          units: 0,
          revenue: 0
        };
      }
      productSalesMap[it.product_id].units += Number(it.quantity);
      productSalesMap[it.product_id].revenue += Number(it.subtotal);
    });
  });

  // Ordenar por unidades vendidas para que sea útil tanto a Vendedor como Admin
  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
    .slice(0, 6);
  const maxUnits = topProducts.length > 0 ? topProducts[0].units : 1;

  container.innerHTML = `
    ${
      admin
        ? `
      <!-- 4 Tarjetas Financieras (EXCLUSIVAS PARA ADMINISTRADOR) -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Ventas Realizadas</div>
          <div class="kpi-value">${fmtUSD(grossRevenue)}</div>
          <div class="kpi-sub">${activeSales.length} ventas en el período</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Costo de Prendas Vendidas</div>
          <div class="kpi-value">${fmtUSD(cogs)}</div>
          <div class="kpi-sub">Costo base de compra</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Gastos de la Tienda</div>
          <div class="kpi-value">${fmtUSD(operatingExpenses)}</div>
          <div class="kpi-sub">${periodExpenses.length} gastos registrados</div>
        </div>

        <div class="kpi-card highlight">
          <div class="kpi-label">Ganancia Neta Libre</div>
          <div class="kpi-value" style="color:${netProfit >= 0 ? 'var(--olive-dark)' : 'var(--danger)'};">
            ${fmtUSD(netProfit)}
          </div>
          <div class="kpi-sub">Capital en mercancía: <strong>${fmtUSD(invCostValue)}</strong></div>
        </div>
      </div>
    `
        : ''
    }

    <!-- 2 Paneles Operativos (Visibles para Vendedor y Admin; sin cifras de dinero ni números de venta para el Vendedor) -->
    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('trending')} Prendas Más Vendidas</div>
          <span class="badge badge-neutral">Top rotación</span>
        </div>
        <div class="card-body">
          ${
            topProducts.length === 0
              ? `<p style="color:var(--text-secondary);">Aún no hay prendas vendidas en este período.</p>`
              : `<div class="bar-list">
                  ${topProducts
                    .map((p, index) => {
                      const pct = Math.max(12, Math.round((p.units / maxUnits) * 100));
                      return `
                        <div>
                          <div class="bar-item-header">
                            <span>
                              <strong>#${index + 1} ${escapeHTML(p.name)}</strong>
                              <span class="badge badge-neutral" style="margin-left:6px;">${escapeHTML(p.category)}</span>
                            </span>
                            ${
                              admin
                                ? `<strong>${fmtUSD(p.revenue)} <small style="color:var(--text-secondary);">(${p.units} und)</small></strong>`
                                : `<span class="badge badge-success">Alta demanda</span>`
                            }
                          </div>
                          <div class="bar-track">
                            <div class="bar-fill" style="width:${pct}%;"></div>
                          </div>
                        </div>
                      `;
                    })
                    .join('')}
                </div>`
          }
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('alert')} Prendas por Agotarse</div>
          <span class="badge ${lowStockProducts.length > 0 ? 'badge-warning' : 'badge-success'}">
            ${lowStockProducts.length} prendas
          </span>
        </div>
        <div class="card-body" style="padding:0;">
          ${
            lowStockProducts.length === 0
              ? `<div style="padding:22px; color:var(--olive-dark); font-weight:600;">✓ Todas las prendas tienen buen stock disponible.</div>`
              : `<table>
                  <thead>
                    <tr>
                      <th>Prenda</th>
                      <th>Lote</th>
                      <th>Quedan</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${lowStockProducts
                      .map(
                        p => {
                          const availSizes = getAvailableSizesList(p);
                          return `
                      <tr>
                        <td>
                          <strong>${escapeHTML(p.name)}</strong>
                          <div style="font-size:11.5px; color:var(--text-secondary);">${escapeHTML(p.category)}</div>
                        </td>
                        <td>
                          <span class="badge badge-neutral" style="font-family:monospace;">${escapeHTML(p.batch_code || 'LOTE-01')}</span>
                        </td>
                        <td>
                          <span class="badge ${p.stock <= 0 ? 'badge-danger' : 'badge-warning'}">
                            ${p.stock <= 0 ? 'Agotada' : `Quedan ${p.stock}`}
                          </span>
                          ${
                            availSizes.length > 0
                              ? `<div class="inv-sizes-wrap" style="margin-top:4px;">
                                  ${availSizes.map(s => `<span class="inv-size-tag"><strong>${escapeHTML(s.size)}</strong> ${s.qty}</span>`).join('')}
                                </div>`
                              : ''
                          }
                        </td>
                      </tr>
                    `;
                        }
                      )
                      .join('')}
                  </tbody>
                </table>`
          }
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// 2. VENDER (CON FILTROS RÁPIDOS DE ROPA: MUJER, HOMBRE, ACCESORIOS...)
// ============================================================================
function addProductToCart(prodId, requestedSize = null) {
  const product = db.products.find(p => p.id === prodId);
  if (!product) return false;
  const isService = product.item_type === 'service';

  if (!isService && product.stock <= 0) {
    showToast(`"${product.name}" está agotada.`);
    return false;
  }

  let selectedSize = requestedSize || '';
  let maxForSize = isService ? 99999 : product.stock;

  if (!isService) {
    const sizesMap = getProductSizesMap(product);
    const availList = getAvailableSizesList(product);
    if (!selectedSize) {
      if (availList.length > 0) {
        selectedSize = availList[0].size;
      } else {
        selectedSize = (product.category || '').toLowerCase().includes('accesorio') ? 'Única' : 'M';
      }
    }
    const sizeStock = Number(sizesMap[selectedSize]) || 0;
    if (availList.length > 0 && sizeStock <= 0) {
      showToast(`Talla ${selectedSize} agotada en "${product.name}".`);
      return false;
    }
    maxForSize = availList.length > 0 ? sizeStock : product.stock;
  }

  const existing = state.posCart.find(
    i => i.product_id === prodId && (i.selected_size || '') === selectedSize
  );
  if (existing) {
    if (!isService && existing.quantity + 1 > maxForSize) {
      showToast(`Solo quedan ${maxForSize} disponibles en Talla ${selectedSize}.`);
      return false;
    }
    existing.quantity += 1;
    existing.max_stock = maxForSize;
  } else {
    state.posCart.push({
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      selected_size: selectedSize,
      image_url: product.image_url || '',
      item_type: product.item_type || 'product',
      unit: 'und',
      sale_price: product.sale_price,
      unit_cost: product.unit_cost,
      quantity: 1,
      max_stock: maxForSize
    });
  }
  return true;
}

function renderPOS(container, topActions) {
  const pendingSalesCount = db.sales.filter(s => s.status === 'pendiente').length;
  const completedSalesCount = db.sales.filter(s => s.status !== 'pendiente').length;

  if (topActions) {
    topActions.innerHTML = `
      <div class="tabs">
        <button class="tab-btn ${state.posSubTab === 'new' ? 'active' : ''}" data-pos-tab="new">
          ${icon('bag')} Nueva Venta
        </button>
        <button class="tab-btn ${state.posSubTab === 'pending' ? 'active' : ''}" data-pos-tab="pending">
          ${icon('clock')} Pendientes (${pendingSalesCount})
        </button>
        <button class="tab-btn ${state.posSubTab === 'history' ? 'active' : ''}" data-pos-tab="history">
          ${icon('receipt')} Ventas Realizadas (${completedSalesCount})
        </button>
      </div>
    `;
    topActions.querySelectorAll('[data-pos-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.posSubTab = btn.dataset.posTab;
        renderCurrentView();
      });
    });
  }

  if (state.posSubTab === 'pending') {
    renderPendingSalesInline(container);
    return;
  }

  if (state.posSubTab === 'history') {
    renderSalesHistoryInline(container);
    return;
  }

  const categories = ['ALL', ...getAllCategories()];
  const q = state.posSearch.trim().toLowerCase();

  const filteredProducts = db.products.filter(p => {
    const matchCat = state.posCategory === 'ALL' || p.category === state.posCategory;
    const matchQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.batch_code || '').toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const subtotal = state.posCart.reduce((acc, item) => acc + item.quantity * item.sale_price, 0);
  const discount = Math.min(subtotal, Math.max(0, Number(state.posDiscount) || 0));
  const total = Math.max(0, subtotal - discount);
  const secondaryTotal = fmtSecondary(total);

  container.innerHTML = `
    <div class="pos-grid">
      <div class="pos-catalog-col">
        <div class="pos-catalog-header">
          <input
            type="text"
            class="input"
            id="pos-search-input"
            placeholder="Buscar prenda por nombre, código o lote..."
            value="${escapeHTML(state.posSearch)}"
            style="width:100%;"
          />
          <div class="category-pills">
            ${categories
              .map(
                c => `
              <button class="cat-pill ${state.posCategory === c ? 'active' : ''}" data-pos-cat="${escapeHTML(c)}">
                ${c === 'ALL' ? 'Todas' : escapeHTML(c)}
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        <div class="pos-catalog-scroll">
        <div class="pos-products-grid">
          ${
            filteredProducts.length === 0
              ? `<p style="color:var(--text-secondary);">No hay prendas en esta categoría.</p>`
              : filteredProducts
                  .map(p => {
                    const isService = p.item_type === 'service';
                    const inCart = state.posCart.find(c => c.product_id === p.id);
                    const disabled = !isService && p.stock <= 0;
                    const sizesMap = getProductSizesMap(p);
                    const activeSizes = STANDARD_SIZES.filter(sz => (Number(sizesMap[sz]) || 0) > 0);

                    return `
                      <div class="pos-product-card ${disabled ? 'disabled' : ''} ${inCart ? 'in-cart' : ''}" data-add-prod="${escapeHTML(p.id)}">
                        <div>
                          <div class="pos-card-media">
                            ${
                              p.image_url
                                ? `<img src="${escapeHTML(p.image_url)}" alt="${escapeHTML(p.name)}" />`
                                : `${icon("hanger", "ui-icon-lg")}`
                            }
                          </div>
                          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <span style="font-size:11px; color:var(--text-secondary); font-weight:600;">${escapeHTML(p.category)}</span>
                            <span style="font-size:10.5px; font-family:monospace; color:var(--text-muted);">${escapeHTML(p.batch_code || '')}</span>
                          </div>
                          <div class="pos-name">${escapeHTML(p.name)}</div>
                          ${
                            !isService && activeSizes.length > 0
                              ? `<div class="pos-sizes-row">
                                  ${activeSizes
                                    .map(sz => {
                                      const qtyInCart = state.posCart
                                        .filter(c => c.product_id === p.id && c.selected_size === sz)
                                        .reduce((sum, c) => sum + Number(c.quantity), 0);
                                      return `<button type="button" class="pos-size-btn" data-add-size-prod="${escapeHTML(p.id)}" data-size="${escapeHTML(sz)}" title="Vender Talla ${escapeHTML(sz)}">
                                        ${escapeHTML(sz)} <span class="sz-count">(${sizesMap[sz]}${qtyInCart > 0 ? ` · ${qtyInCart} en carrito` : ''})</span>
                                      </button>`;
                                    })
                                    .join('')}
                                </div>`
                              : ''
                          }
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                          <span class="pos-price">${fmtUSD(p.sale_price)}</span>
                          <span class="badge ${
                            isService
                              ? 'badge-neutral'
                              : p.stock <= 0
                              ? 'badge-danger'
                              : p.stock <= p.min_stock
                              ? 'badge-warning'
                              : 'badge-success'
                          }">
                            ${isService ? 'Servicio' : p.stock <= 0 ? 'Agotada' : `${p.stock} disp.`}
                          </span>
                        </div>
                      </div>
                    `;
                  })
                  .join('')
          }
        </div>
        </div>
      </div>

      <!-- Carrito -->
      <div class="card pos-cart-panel">
        <div class="card-header">
          <div class="card-title">${icon("bag")} Carrito de Venta</div>
          ${
            state.posCart.length > 0
              ? `<button class="btn btn-outline btn-sm" id="pos-clear-cart">Limpiar</button>`
              : ''
          }
        </div>
        <div class="card-body">
          ${
            state.posCart.length === 0
              ? `<div style="text-align:center; padding:28px 12px; color:var(--text-secondary);">
                  Toca cualquier prenda a la izquierda para sumarla a la venta.
                </div>`
              : `<div class="cart-items-list">
                  ${state.posCart
                    .map(
                      (item, idx) => `
                    <div class="cart-item">
                      <div class="cart-thumb">
                        ${
                          item.image_url
                            ? `<img src="${escapeHTML(item.image_url)}" alt="${escapeHTML(item.name)}" />`
                            : `${icon("hanger")}`
                        }
                      </div>
                      <div style="flex:1; min-width:0;">
                        <div style="font-weight:700; font-size:13.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                          ${escapeHTML(item.name)}
                        </div>
                        <div style="font-size:12px; color:var(--text-secondary); display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-top:2px;">
                          ${
                            item.selected_size
                              ? `<span class="badge badge-neutral" style="padding:1px 7px; font-size:11px; color:var(--primary); border:1px solid var(--border-strong);">Talla: ${escapeHTML(item.selected_size)}</span>`
                              : ''
                          }
                          <span>${fmtUSD(item.sale_price)} c/u</span>
                        </div>
                      </div>
                      <div class="qty-controls">
                        <button class="qty-btn" data-cart-dec="${idx}">−</button>
                        <input type="number" step="any" class="qty-input" data-cart-qty="${idx}" value="${item.quantity}" />
                        <button class="qty-btn" data-cart-inc="${idx}">+</button>
                      </div>
                      <div style="font-weight:700; min-width:64px; text-align:right;">
                        ${fmtUSD(item.quantity * item.sale_price)}
                      </div>
                    </div>
                  `
                    )
                    .join('')}
                </div>`
          }

          <div style="margin-top:16px;">
            <div class="form-group">
              <label>Cliente (Opcional)</label>
              <input type="text" class="input" id="pos-customer" placeholder="Cliente General" value="${escapeHTML(state.posCustomer)}" />
            </div>

            <div class="form-grid" style="grid-template-columns: 1fr 110px;">
              <div class="form-group" style="margin-bottom:0;">
                <label>Forma de Pago</label>
                <select class="select" id="pos-payment">
                  ${['Efectivo USD', 'Pago Móvil', 'Zelle', 'Transferencia', 'Tarjeta', 'Crédito']
                    .map(
                      m =>
                        `<option value="${m}" ${state.posPaymentMethod === m ? 'selected' : ''}>${m}</option>`
                    )
                    .join('')}
                </select>
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label>Descuento ($)</label>
                <input
                  type="text"
                  inputmode="decimal"
                  class="input"
                  id="pos-discount"
                  placeholder="0.00"
                  value="${escapeHTML(state.posDiscount)}"
                />
              </div>
            </div>

            <div class="form-group" id="pos-ref-group" style="margin-top:10px; margin-bottom:0; ${isBsPaymentMethod(state.posPaymentMethod) ? '' : 'display:none;'}">
              <label>Nº de Referencia (Pago Móvil / Bs.)</label>
              <input
                type="text"
                class="input"
                id="pos-payment-ref"
                placeholder="Ej. 048291 (últimos dígitos o ref completa)"
                value="${escapeHTML(state.posPaymentReference)}"
              />
            </div>
          </div>

          <div class="cart-summary">
            <div class="summary-row total" style="border-top:none; padding-top:0; margin-top:0;">
              <span>Total:</span>
              <span id="pos-total-usd">${fmtUSD(total)}</span>
            </div>
            <div
              id="pos-total-bs"
              style="text-align:right; font-size:13px; font-weight:700; color:var(--text-secondary); margin-top:4px; ${secondaryTotal ? '' : 'display:none;'}"
            >
              ${secondaryTotal ? `≈ ${escapeHTML(secondaryTotal)}` : ''}
            </div>
          </div>

          <button
            class="btn btn-success btn-lg"
            id="pos-submit-sale"
            style="width:100%; margin-top:14px;"
            ${state.posCart.length === 0 ? 'disabled' : ''}
          >
            ✓ Cobrar Venta
          </button>

          <button
            class="btn btn-outline"
            id="pos-save-pending"
            style="width:100%; margin-top:8px;"
            ${state.posCart.length === 0 ? 'disabled' : ''}
          >
            ${icon("clock")} Dejar en Pendiente (Por concretar / pagar)
          </button>
        </div>
      </div>
    </div>
  `;

  const searchInput = document.getElementById('pos-search-input');
  searchInput?.addEventListener('input', e => {
    state.posSearch = e.target.value;
    renderCurrentView();
    const el = document.getElementById('pos-search-input');
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  });

  container.querySelectorAll('[data-pos-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.posCategory = btn.dataset.posCat;
      renderCurrentView();
    });
  });

  container.querySelectorAll('[data-add-size-prod]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const prodId = btn.dataset.addSizeProd;
      const sz = btn.dataset.size;
      if (addProductToCart(prodId, sz)) {
        renderCurrentView();
      }
    });
  });

  container.querySelectorAll('[data-add-prod]').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('[data-add-size-prod]')) return;
      if (addProductToCart(card.dataset.addProd)) {
        renderCurrentView();
      }
    });
  });

  container.querySelectorAll('[data-cart-inc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.cartInc);
      const item = state.posCart[idx];
      if (item.item_type !== 'service' && item.quantity + 1 > item.max_stock) {
        showToast(`Máximo disponible: ${item.max_stock}`);
        return;
      }
      item.quantity = Number((item.quantity + 1).toFixed(2));
      renderCurrentView();
    });
  });

  container.querySelectorAll('[data-cart-dec]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.cartDec);
      const item = state.posCart[idx];
      if (item.quantity > 1) {
        item.quantity = Number((item.quantity - 1).toFixed(2));
      } else {
        state.posCart.splice(idx, 1);
      }
      renderCurrentView();
    });
  });

  container.querySelectorAll('[data-cart-qty]').forEach(inp => {
    inp.addEventListener('change', e => {
      const idx = Number(inp.dataset.cartQty);
      const item = state.posCart[idx];
      let val = parseFloat(e.target.value);
      if (isNaN(val) || val <= 0) val = 1;
      if (item.item_type !== 'service' && val > item.max_stock) val = item.max_stock;
      item.quantity = Number(val.toFixed(2));
      renderCurrentView();
    });
  });

  document.getElementById('pos-clear-cart')?.addEventListener('click', () => {
    state.posCart = [];
    state.posDiscount = '';
    state.posPaymentReference = '';
    renderCurrentView();
  });

  document.getElementById('pos-customer')?.addEventListener('input', e => {
    state.posCustomer = e.target.value;
  });

  document.getElementById('pos-payment')?.addEventListener('change', e => {
    state.posPaymentMethod = e.target.value;
    const refGroup = document.getElementById('pos-ref-group');
    if (refGroup) {
      refGroup.style.display = isBsPaymentMethod(state.posPaymentMethod) ? '' : 'none';
    }
  });

  document.getElementById('pos-payment-ref')?.addEventListener('input', e => {
    state.posPaymentReference = e.target.value;
  });

  // Actualización en vivo del descuento sin recargar el DOM (permite escribir números y decimales libremente)
  document.getElementById('pos-discount')?.addEventListener('input', e => {
    state.posDiscount = e.target.value;
    const parsedDisc = parseFloat(String(e.target.value).replace(',', '.')) || 0;
    const currentSub = state.posCart.reduce((acc, item) => acc + item.quantity * item.sale_price, 0);
    const cleanDisc = Math.min(currentSub, Math.max(0, parsedDisc));
    const newTotal = Math.max(0, currentSub - cleanDisc);
    const newSec = fmtSecondary(newTotal);

    const usdEl = document.getElementById('pos-total-usd');
    const bsEl = document.getElementById('pos-total-bs');
    if (usdEl) usdEl.textContent = fmtUSD(newTotal);
    if (bsEl) {
      if (newSec) {
        bsEl.style.display = '';
        bsEl.textContent = `≈ ${newSec}`;
      } else {
        bsEl.style.display = 'none';
      }
    }
  });

  document.getElementById('pos-submit-sale')?.addEventListener('click', () => {
    openCheckoutConfirmModal();
  });

  document.getElementById('pos-save-pending')?.addEventListener('click', async () => {
    await processCartCheckout('pendiente');
  });
}

async function processCartCheckout(status = 'completada', customPaymentMethod = null, customCustomer = null, customReference = null) {
  try {
    const parsedDisc = parseFloat(String(state.posDiscount).replace(',', '.')) || 0;
    const sale = await db.createSale({
      customer_name: (customCustomer ?? state.posCustomer) || 'Cliente General',
      payment_method: customPaymentMethod ?? state.posPaymentMethod,
      payment_reference: customReference ?? state.posPaymentReference,
      discount: parsedDisc,
      status,
      items: state.posCart
    });

    state.posCart = [];
    state.posDiscount = '';
    state.posCustomer = '';
    state.posPaymentReference = '';
    closeModal();
    updateChrome();

    if (status === 'pendiente') {
      state.posSubTab = 'pending';
      renderCurrentView();
      showToast(`Venta ${sale.receipt_number} guardada en Pendientes.`);
    } else {
      renderCurrentView();
      showToast(`Venta cobrada por ${fmtUSD(sale.total)}`);
      openSaleReceiptModal(sale);
    }
  } catch (err) {
    showToast(err.message);
  }
}

function openCheckoutConfirmModal() {
  const subtotal = state.posCart.reduce((acc, item) => acc + item.quantity * item.sale_price, 0);
  const parsedDisc = parseFloat(String(state.posDiscount).replace(',', '.')) || 0;
  const discount = Math.min(subtotal, Math.max(0, parsedDisc));
  const total = Math.max(0, subtotal - discount);
  const secTotal = fmtSecondary(total);

  openModal({
    title: 'Confirmar Venta o Dejar en Pendiente',
    bodyHTML: `
      <div class="form-group">
        <label>Cliente</label>
        <input type="text" class="input" id="chk-customer" placeholder="Nombre del cliente (opcional)" value="${escapeHTML(state.posCustomer)}" />
      </div>

      <div class="form-group">
        <label>Forma de Pago</label>
        <select class="select" id="chk-payment">
          ${['Efectivo USD', 'Pago Móvil', 'Zelle', 'Transferencia', 'Tarjeta', 'Pendiente por pagar']
            .map(
              m =>
                `<option value="${m}" ${state.posPaymentMethod === m ? 'selected' : ''}>${m}</option>`
            )
            .join('')}
        </select>
      </div>

      <div class="form-group" id="chk-ref-group" style="${isBsPaymentMethod(state.posPaymentMethod) ? '' : 'display:none;'}">
        <label>Nº de Referencia de Pago Móvil (Bs.)</label>
        <input
          type="text"
          class="input"
          id="chk-payment-ref"
          placeholder="Escribe el número de referencia del Pago Móvil..."
          value="${escapeHTML(state.posPaymentReference)}"
        />
      </div>

      <div class="cart-summary">
        <div class="summary-row">
          <span>Prendas en carrito:</span>
          <strong>${state.posCart.reduce((a, b) => a + Number(b.quantity), 0)} und</strong>
        </div>
        ${
          discount > 0
            ? `<div class="summary-row"><span>Descuento:</span><span>-${fmtUSD(discount)}</span></div>`
            : ''
        }
        <div class="summary-row total">
          <span>Total a Pagar:</span>
          <span>${fmtUSD(total)}</span>
        </div>
        ${
          secTotal
            ? `<div style="text-align:right; font-size:13.5px; font-weight:700; color:var(--primary); margin-top:4px;">
                Monto en Bolívares: ${escapeHTML(secTotal)}
                <div style="font-size:11px; color:var(--text-secondary); font-weight:500;">
                  Tasa del día: 1 USD = ${db.profile?.exchangeRate} ${escapeHTML(db.profile?.secondaryCurrencySymbol || 'Bs.')}
                </div>
              </div>`
            : ''
        }
      </div>
    `,
    footerHTML: `
      <button class="btn btn-outline" id="chk-btn-pending">${icon("clock")} Colocar en Pendiente</button>
      <button class="btn btn-success" id="chk-btn-pay">✓ Confirmar Pago y Cobrar</button>
    `
  });

  document.getElementById('chk-payment')?.addEventListener('change', e => {
    const refGroup = document.getElementById('chk-ref-group');
    if (refGroup) {
      refGroup.style.display = isBsPaymentMethod(e.target.value) ? '' : 'none';
    }
  });

  document.getElementById('chk-btn-pending')?.addEventListener('click', async () => {
    const cust = document.getElementById('chk-customer').value;
    const ref = document.getElementById('chk-payment-ref')?.value || '';
    await processCartCheckout('pendiente', 'Pendiente por pagar', cust, ref);
  });

  document.getElementById('chk-btn-pay')?.addEventListener('click', async () => {
    const cust = document.getElementById('chk-customer').value;
    const pay = document.getElementById('chk-payment').value;
    const ref = document.getElementById('chk-payment-ref')?.value || '';
    if (pay === 'Pendiente por pagar') {
      await processCartCheckout('pendiente', pay, cust, ref);
    } else {
      await processCartCheckout('completada', pay, cust, ref);
    }
  });
}

function renderPendingSalesInline(container) {
  const pendingSales = db.sales.filter(s => s.status === 'pendiente');
  const totalPendingAmount = pendingSales.reduce((a, s) => a + Number(s.total), 0);

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${icon("clock")} Ventas en Pendiente (Por concretar o confirmar pago)</div>
          <div style="font-size:12.5px; color:var(--text-secondary);">
            Las prendas de estas ventas ya están apartadas del stock para que no se vendan por duplicado.
          </div>
        </div>
        <span class="badge badge-warning">Total por cobrar: ${fmtUSD(totalPendingAmount)}</span>
      </div>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Orden</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Prendas Apartadas</th>
              <th>Total a Cobrar</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${
              pendingSales.length === 0
                ? `<tr><td colspan="6" style="text-align:center; padding:28px; color:var(--text-secondary);">No tienes ventas pendientes en este momento.</td></tr>`
                : pendingSales
                    .map(s => {
                      const itemsText = (s.items || [])
                        .map(i => `${i.quantity}x ${i.name}${i.selected_size ? ` (Talla ${i.selected_size})` : ''}`)
                        .join(', ');
                      return `
                        <tr>
                          <td><strong>${escapeHTML(s.receipt_number)}</strong></td>
                          <td>${fmtDate(s.date)}</td>
                          <td>
                            <strong>${escapeHTML(s.customer_name)}</strong>
                            <div style="font-size:11.5px; color:var(--warning);">Esperando pago</div>
                          </td>
                          <td style="max-width:260px;">${escapeHTML(itemsText)}</td>
                          <td><strong style="font-size:15px; color:var(--primary);">${fmtUSD(s.total)}</strong></td>
                          <td style="text-align:right; white-space:nowrap;">
                            <button class="btn btn-success btn-sm" data-pay-pending="${escapeHTML(s.id)}">
                              ✓ Cobrar Ahora
                            </button>
                            <button class="btn btn-outline btn-sm" title="Devolver al carrito para agregar o quitar prendas" data-resume-pending="${escapeHTML(s.id)}">
                              ✏️ Editar
                            </button>
                            <button class="btn btn-outline btn-sm" style="color:var(--danger);" title="Cancelar apartado y devolver prendas al stock" data-cancel-pending="${escapeHTML(s.id)}">
                              ✕ Cancelar
                            </button>
                          </td>
                        </tr>
                      `;
                    })
                    .join('')
            }
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-pay-pending]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sale = db.sales.find(s => s.id === btn.dataset.payPending);
      if (!sale) return;
      const currentRate = Number(db.profile?.exchangeRate) || Number(sale.exchange_rate) || 0;
      const secTotal = fmtSecondary(sale.total, currentRate);

      openModal({
        title: `Cobrar Venta Pendiente ${sale.receipt_number}`,
        bodyHTML: `
          <div style="margin-bottom:14px;">
            <div><strong>Cliente:</strong> ${escapeHTML(sale.customer_name)}</div>
            <div style="font-size:12.5px; color:var(--text-secondary); margin-top:4px;">
              ${(sale.items || []).map(i => `${i.quantity}x ${escapeHTML(i.name)}${i.selected_size ? ` (Talla ${escapeHTML(i.selected_size)})` : ''}`).join(' · ')}
            </div>
          </div>
          <div class="form-group">
            <label>Selecciona con qué método realizó el pago *</label>
            <select class="select" id="pend-pay-method">
              <option value="Efectivo USD">Efectivo USD</option>
              <option value="Pago Móvil">Pago Móvil</option>
              <option value="Zelle">Zelle</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
          </div>
          <div class="form-group" id="pend-ref-group" style="display:none;">
            <label>Nº de Referencia de Pago Móvil (Bs.)</label>
            <input
              type="text"
              class="input"
              id="pend-pay-ref"
              placeholder="Escribe el número de referencia del Pago Móvil..."
              value="${escapeHTML(sale.payment_reference || '')}"
            />
          </div>
          <div class="cart-summary">
            <div class="summary-row total" style="border-top:none; padding-top:0; margin-top:0;">
              <span>Monto a Cobrar:</span>
              <span>${fmtUSD(sale.total)}</span>
            </div>
            ${
              secTotal
                ? `<div style="text-align:right; font-size:13px; font-weight:700; color:var(--primary); margin-top:4px;">
                    ≈ ${escapeHTML(secTotal)}
                    <div style="font-size:11px; color:var(--text-secondary); font-weight:500;">
                      Tasa del día: 1 USD = ${currentRate} ${escapeHTML(db.profile?.secondaryCurrencySymbol || 'Bs.')}
                    </div>
                  </div>`
                : ''
            }
          </div>
        `,
        footerHTML: `
          <button class="btn btn-outline" id="pend-pay-cancel">Cerrar</button>
          <button class="btn btn-success" id="pend-pay-confirm">✓ Confirmar Pago Recibido</button>
        `
      });

      document.getElementById('pend-pay-method')?.addEventListener('change', e => {
        const refG = document.getElementById('pend-ref-group');
        if (refG) refG.style.display = isBsPaymentMethod(e.target.value) ? '' : 'none';
      });

      document.getElementById('pend-pay-cancel')?.addEventListener('click', closeModal);
      document.getElementById('pend-pay-confirm')?.addEventListener('click', async () => {
        try {
          const method = document.getElementById('pend-pay-method').value;
          const ref = document.getElementById('pend-pay-ref')?.value || '';
          const completed = await db.completePendingSale(sale.id, method, ref);
          closeModal();
          updateChrome();
          renderCurrentView();
          showToast(`Venta ${completed.receipt_number} cobrada con éxito.`);
          openSaleReceiptModal(completed);
        } catch (err) {
          showToast(err.message);
        }
      });
    });
  });

  container.querySelectorAll('[data-resume-pending]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const sale = await db.resumePendingSaleToCart(btn.dataset.resumePending);
        state.posCustomer = sale.customer_name;
        state.posDiscount = sale.discount ? String(sale.discount) : '';
        state.posPaymentReference = sale.payment_reference || '';
        state.posCart = (sale.items || []).map(it => {
          const prod = db.products.find(p => p.id === it.product_id);
          const selSize = it.selected_size || '';
          const sizesMap = prod ? getProductSizesMap(prod) : {};
          const maxForSz = selSize && sizesMap[selSize] !== undefined ? Number(sizesMap[selSize]) : (prod ? prod.stock : 999);
          return {
            product_id: it.product_id,
            sku: it.sku,
            name: it.name,
            selected_size: selSize,
            image_url: prod?.image_url || '',
            item_type: it.item_type || 'product',
            unit: it.unit || 'und',
            sale_price: it.sale_price,
            unit_cost: it.unit_cost,
            quantity: it.quantity,
            max_stock: maxForSz
          };
        });
        state.posSubTab = 'new';
        updateChrome();
        renderCurrentView();
        showToast(`Orden de ${sale.customer_name} cargada en el carrito.`);
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  container.querySelectorAll('[data-cancel-pending]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const sale = db.sales.find(s => s.id === btn.dataset.cancelPending);
      if (sale && confirm(`¿Cancelar la venta pendiente de "${sale.customer_name}" y devolver las prendas al stock disponible?`)) {
        await db.cancelSale(sale.id);
        updateChrome();
        renderCurrentView();
        showToast('Venta pendiente cancelada y prendas devueltas al stock.');
      }
    });
  });
}

function renderSalesHistoryInline(container) {
  const admin = isAdmin();
  const q = state.salesSearch.trim().toLowerCase();

  const filtered = db.sales
    .filter(s => s.status !== 'pendiente')
    .filter(s => {
      return (
        !q ||
        s.receipt_number.toLowerCase().includes(q) ||
        (s.customer_name || '').toLowerCase().includes(q) ||
        (s.payment_method || '').toLowerCase().includes(q) ||
        (s.payment_reference || '').toLowerCase().includes(q)
      );
    });

  container.innerHTML = `
    <div class="toolbar">
      <input
        type="text"
        class="input"
        id="sales-search"
        placeholder="Buscar venta por cliente, recibo, pago o referencia..."
        value="${escapeHTML(state.salesSearch)}"
        style="min-width:280px;"
      />
      ${
        admin
          ? `<button class="btn btn-outline" id="btn-export-sales">${icon("download")} Descargar Ventas en Excel</button>`
          : ''
      }
    </div>

    <div class="card" style="margin-bottom:0;">
      <div class="table-responsive inv-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Recibo</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Pago</th>
              <th>Total</th>
              ${admin ? '<th>Ganancia</th>' : ''}
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${
              filtered.length === 0
                ? `<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-secondary);">No hay ventas registradas.</td></tr>`
                : filtered
                    .map(s => {
                      const paidInBs = isBsPaymentMethod(s.payment_method);
                      const saleRate = Number(s.exchange_rate) || Number(db.profile?.exchangeRate) || 0;
                      const saleSym = s.secondary_currency || db.profile?.secondaryCurrencySymbol || 'Bs.';
                      const bsAmountStr = paidInBs && saleRate > 0 ? fmtSecondary(s.total, saleRate, saleSym) : '';

                      return `
                        <tr style="${s.status === 'anulada' ? 'opacity:0.5;' : ''}">
                          <td><strong>${escapeHTML(s.receipt_number)}</strong></td>
                          <td>${fmtDate(s.date)}</td>
                          <td>${escapeHTML(s.customer_name)}</td>
                          <td>
                            <span class="badge badge-neutral">${escapeHTML(s.payment_method)}</span>
                            ${
                              s.payment_reference
                                ? `<div style="font-size:11px; color:var(--text-secondary); margin-top:3px; font-family:monospace;">
                                    Ref: <strong>${escapeHTML(s.payment_reference)}</strong>
                                  </div>`
                                : ''
                            }
                          </td>
                          <td>
                            <strong>${fmtUSD(s.total)}</strong>
                            ${
                              paidInBs && saleRate > 0
                                ? `<div style="font-size:11.5px; color:var(--text-secondary); margin-top:2px;">
                                    ${escapeHTML(bsAmountStr)}
                                    <span style="display:block; font-size:10.5px; color:var(--primary); font-weight:700;">
                                      Tasa del día: ${saleRate.toLocaleString('es-ES')} ${escapeHTML(saleSym)}/$
                                    </span>
                                  </div>`
                                : ''
                            }
                          </td>
                          ${admin ? `<td><span class="badge badge-success">+${fmtUSD(s.profit)}</span></td>` : ''}
                          <td>
                            <span class="badge ${s.status === 'completada' ? 'badge-success' : 'badge-danger'}">
                              ${s.status === 'completada' ? 'Completada' : 'Anulada'}
                            </span>
                          </td>
                          <td style="text-align:right;">
                            <button class="btn btn-outline btn-sm" data-view-sale="${escapeHTML(s.id)}">Ver Recibo</button>
                            ${
                              admin && s.status === 'completada'
                                ? `<button class="btn btn-outline btn-sm" style="color:var(--danger);" data-cancel-sale="${escapeHTML(s.id)}">Anular</button>`
                                : ''
                            }
                          </td>
                        </tr>
                      `;
                    })
                    .join('')
            }
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('sales-search')?.addEventListener('input', e => {
    state.salesSearch = e.target.value;
    renderSalesHistoryInline(container);
    const el = document.getElementById('sales-search');
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  });

  document.getElementById('btn-export-sales')?.addEventListener('click', exportSalesToCSV);

  container.querySelectorAll('[data-view-sale]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sale = db.sales.find(s => s.id === btn.dataset.viewSale);
      if (sale) openSaleReceiptModal(sale);
    });
  });

  container.querySelectorAll('[data-cancel-sale]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const sale = db.sales.find(s => s.id === btn.dataset.cancelSale);
      if (sale && confirm(`¿Anular la venta ${sale.receipt_number} y devolver las prendas al stock?`)) {
        await db.cancelSale(sale.id);
        updateChrome();
        renderSalesHistoryInline(container);
        showToast('Venta anulada y stock restaurado.');
      }
    });
  });
}

function printCompactReceipt(sale) {
  const bName = (db.profile?.businessName || 'GYMBROS').toUpperCase();
  const saleRate = Number(sale.exchange_rate) || Number(db.profile?.exchangeRate) || 0;
  const saleSym = sale.secondary_currency || db.profile?.secondaryCurrencySymbol || 'Bs.';
  const secTotal = saleRate > 0 ? fmtSecondary(sale.total, saleRate, saleSym) : '';
  const totalGarments = (sale.items || []).reduce((acc, it) => acc + Number(it.quantity), 0);

  const itemsHTML = (sale.items || [])
    .map(
      it => `
      <tr>
        <td class="c-qty">${it.quantity}x</td>
        <td class="c-name">
          ${escapeHTML(it.name)}${it.selected_size ? ` <span class="sz">[${escapeHTML(it.selected_size)}]</span>` : ''}
        </td>
        <td class="c-num">${fmtUSD(it.sale_price)}</td>
        <td class="c-num c-bold">${fmtUSD(it.subtotal)}</td>
      </tr>
    `
    )
    .join('');

  const ticketDoc = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Recibo ${escapeHTML(sale.receipt_number)}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 4mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      background: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
      color: #2A1617;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .ticket {
      width: 270px;
      margin: 6px auto;
      padding: 12px 13px;
      border: 1px solid #CBB9A4;
      border-radius: 6px;
      font-size: 11px;
      line-height: 1.3;
    }
    .brand {
      text-align: center;
      border-bottom: 1px dashed #B8A48D;
      padding-bottom: 7px;
      margin-bottom: 7px;
    }
    .brand-name {
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 1px;
      color: #4A1C21;
    }
    .brand-sub {
      font-size: 10px;
      color: #6E5D55;
      margin-top: 2px;
    }
    .meta {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 7px;
      border-bottom: 1px dashed #B8A48D;
    }
    .meta td {
      padding: 2px 0;
      font-size: 10.5px;
      vertical-align: top;
    }
    .meta td.r { text-align: right; }
    .meta .lbl { color: #6E5D55; font-size: 9.5px; }
    .meta .val { font-weight: 700; color: #2A1617; }
    .items {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 7px;
    }
    .items th {
      font-size: 9px;
      text-transform: uppercase;
      color: #4A1C21;
      border-bottom: 1px solid #B8A48D;
      padding: 3px 2px;
      text-align: left;
    }
    .items th.r { text-align: right; }
    .items td {
      padding: 4px 2px;
      border-bottom: 1px dotted #DDD0BE;
      font-size: 10.5px;
      vertical-align: top;
    }
    .items tr:last-child td { border-bottom: none; }
    .c-qty { width: 24px; font-weight: 800; color: #4A1C21; }
    .c-name { font-weight: 600; }
    .c-num { text-align: right; white-space: nowrap; }
    .c-bold { font-weight: 700; }
    .sz { font-size: 9.5px; font-weight: 800; color: #4A1C21; }
    .totals {
      border-top: 1px dashed #B8A48D;
      padding-top: 6px;
    }
    .t-row {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      margin-bottom: 3px;
    }
    .t-grand {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 900;
      color: #4A1C21;
      border-top: 1px solid #B8A48D;
      padding-top: 5px;
      margin-top: 4px;
    }
    .bs-box {
      margin-top: 5px;
      padding: 5px 7px;
      background: #F4F1EA;
      border-radius: 4px;
      text-align: right;
    }
    .bs-val { font-size: 11.5px; font-weight: 800; color: #4A1C21; }
    .bs-rate { font-size: 9.5px; color: #6E5D55; }
    .foot {
      text-align: center;
      font-size: 9.5px;
      color: #6E5D55;
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px dashed #DDD0BE;
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="brand">
      <div class="brand-name">${escapeHTML(bName)}</div>
      <div class="brand-sub">Recibo ${escapeHTML(sale.receipt_number)} · ${fmtDate(sale.date)}</div>
    </div>

    <table class="meta">
      <tr>
        <td><div class="lbl">Cliente</div><div class="val">${escapeHTML(sale.customer_name)}</div></td>
        <td class="r"><div class="lbl">Pago</div><div class="val">${escapeHTML(sale.payment_method)}</div></td>
      </tr>
      ${
        sale.payment_reference
          ? `<tr><td colspan="2" style="padding-top:3px;"><span class="lbl">Ref. Pago Móvil: </span><span class="val" style="font-family:monospace; color:#4A1C21;">${escapeHTML(sale.payment_reference)}</span></td></tr>`
          : ''
      }
    </table>

    <table class="items">
      <thead>
        <tr>
          <th>Cant</th>
          <th>Prenda</th>
          <th class="r">C/U</th>
          <th class="r">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHTML}</tbody>
    </table>

    <div class="totals">
      <div class="t-row" style="color:#6E5D55;">
        <span>Artículos (${totalGarments} und)</span>
        <span>${fmtUSD(sale.subtotal ?? sale.total)}</span>
      </div>
      ${
        sale.discount > 0
          ? `<div class="t-row" style="color:#5C593B; font-weight:700;"><span>Descuento</span><span>-${fmtUSD(sale.discount)}</span></div>`
          : ''
      }
      <div class="t-grand">
        <span>TOTAL PAGADO</span>
        <span>${fmtUSD(sale.total)}</span>
      </div>
      ${
        secTotal
          ? `<div class="bs-box">
              <div class="bs-val">${escapeHTML(secTotal)}</div>
            </div>`
          : ''
      }
    </div>

    <div class="foot">¡Gracias por tu compra!</div>
  </div>
</body>
</html>`;

  // Usar un iframe oculto aislado: garantiza 1 sola página limpia en Safari, Chrome y Firefox
  const oldFrame = document.getElementById('receipt-print-frame');
  if (oldFrame) oldFrame.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'receipt-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(ticketDoc);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 150);
}

function buildWhatsAppReceiptText(sale) {
  const bName = (db.profile?.businessName || 'GYMBROS').toUpperCase();
  const saleRate = Number(sale.exchange_rate) || Number(db.profile?.exchangeRate) || 0;
  const saleSym = sale.secondary_currency || db.profile?.secondaryCurrencySymbol || 'Bs.';
  const secTotal = saleRate > 0 ? fmtSecondary(sale.total, saleRate, saleSym) : '';

  const lines = [
    `*${bName}*`,
    `Recibo: *${sale.receipt_number}*`,
    `Fecha: ${fmtDate(sale.date)}`,
    `Cliente: ${sale.customer_name}`,
    `Pago: ${sale.payment_method}${sale.payment_reference ? ` (Ref: ${sale.payment_reference})` : ''}`,
    `------------------------`,
    ...(sale.items || []).map(it => {
      const sz = it.selected_size ? ` [Talla ${it.selected_size}]` : '';
      return `• ${it.quantity}x ${it.name}${sz} — ${fmtUSD(it.subtotal)}`;
    }),
    `------------------------`
  ];

  if (sale.discount > 0) {
    lines.push(`Descuento: -${fmtUSD(sale.discount)}`);
  }
  lines.push(`*TOTAL PAGADO: ${fmtUSD(sale.total)}*`);
  if (secTotal) {
    lines.push(`Equivalente: ${secTotal}`);
  }
  lines.push(``);
  lines.push(`¡Gracias por tu compra!`);

  return lines.join('\n');
}

function openSaleReceiptModal(sale) {
  const bName = (db.profile?.businessName || 'GYMBROS').toUpperCase();
  const saleRate = Number(sale.exchange_rate) || Number(db.profile?.exchangeRate) || 0;
  const saleSym = sale.secondary_currency || db.profile?.secondaryCurrencySymbol || 'Bs.';
  const secTotal = saleRate > 0 ? fmtSecondary(sale.total, saleRate, saleSym) : '';
  const paidInBs = isBsPaymentMethod(sale.payment_method);
  const totalGarments = (sale.items || []).reduce((acc, it) => acc + Number(it.quantity), 0);

  openModal({
    title: `Recibo ${sale.receipt_number}`,
    maxWidth: '390px',
    bodyHTML: `
      <div id="printable-receipt" class="receipt-ticket">
        <!-- Encabezado compacto de la tienda -->
        <div class="receipt-header-brand">
          <div class="receipt-brand-title">${escapeHTML(bName)}</div>
          <div class="receipt-brand-sub">Comprobante de Venta · ${escapeHTML(sale.receipt_number)}</div>
        </div>

        <!-- Datos organizados en 2 columnas limpias -->
        <div class="receipt-meta-grid">
          <div class="receipt-meta-row">
            <span class="receipt-meta-label">Cliente</span>
            <span class="receipt-meta-val">${escapeHTML(sale.customer_name)}</span>
          </div>
          <div class="receipt-meta-row right">
            <span class="receipt-meta-label">Fecha y Hora</span>
            <span class="receipt-meta-val">${fmtDate(sale.date)}</span>
          </div>
          <div class="receipt-meta-row">
            <span class="receipt-meta-label">Método de Pago</span>
            <span class="receipt-meta-val">${escapeHTML(sale.payment_method)}</span>
          </div>
          <div class="receipt-meta-row right" id="receipt-ref-display" style="${sale.payment_reference ? '' : 'display:none;'}">
            <span class="receipt-meta-label">Ref. Pago Móvil</span>
            <span class="receipt-meta-val" style="font-family:monospace; color:var(--primary);" id="receipt-ref-text">${escapeHTML(sale.payment_reference || '')}</span>
          </div>
        </div>

        <!-- Listado compacto de prendas -->
        <div class="receipt-items-header">
          <span>Cant</span>
          <span>Prenda / Talla</span>
          <span style="text-align:right;">C/U</span>
          <span style="text-align:right;">Total</span>
        </div>

        <div>
          ${(sale.items || [])
            .map(
              it => `
            <div class="receipt-item-row">
              <span class="receipt-item-qty">${it.quantity}x</span>
              <span class="receipt-item-name">
                ${escapeHTML(it.name)}
                ${
                  it.selected_size
                    ? `<span class="receipt-item-size">Talla ${escapeHTML(it.selected_size)}</span>`
                    : ''
                }
              </span>
              <span class="receipt-item-unit">${fmtUSD(it.sale_price)}</span>
              <span class="receipt-item-sub">${fmtUSD(it.subtotal)}</span>
            </div>
          `
            )
            .join('')}
        </div>

        <!-- Totales compactos -->
        <div class="receipt-totals-box">
          <div class="receipt-total-line" style="color:var(--text-secondary);">
            <span>Artículos (${totalGarments} und):</span>
            <span>${fmtUSD(sale.subtotal ?? sale.total)}</span>
          </div>
          ${
            sale.discount > 0
              ? `<div class="receipt-total-line" style="color:var(--olive-dark); font-weight:700;">
                  <span>Descuento aplicado:</span>
                  <span>-${fmtUSD(sale.discount)}</span>
                </div>`
              : ''
          }
          <div class="receipt-total-line grand">
            <span>TOTAL PAGADO:</span>
            <span>${fmtUSD(sale.total)}</span>
          </div>

          ${
            secTotal
              ? `<div class="receipt-bs-box">
                  <div style="font-size:12.5px; font-weight:800; color:var(--primary);">
                    Equivalente: ${escapeHTML(secTotal)}
                  </div>
                </div>`
              : ''
          }
        </div>

        <div class="receipt-footer-note">
          ¡Gracias por tu compra!
        </div>
      </div>

      <!-- Campo opcional (no sale impreso si está vacío, sólo para editar la referencia rápido) -->
      <div class="no-print" style="margin-top:12px; padding:10px 12px; background:var(--bg-oat-soft); border:1px solid var(--border-strong); border-radius:9px; ${paidInBs || secTotal || sale.payment_reference ? '' : 'display:none;'}">
        <label style="display:block; font-size:11.5px; font-weight:700; color:var(--primary); margin-bottom:5px;">
          Nº de Referencia de Pago Móvil (Bs.)
        </label>
        <div style="display:flex; gap:6px;">
          <input
            type="text"
            class="input"
            id="receipt-ref-input"
            placeholder="Nº de referencia..."
            value="${escapeHTML(sale.payment_reference || '')}"
            style="flex:1; padding:6px 10px; font-size:12px;"
          />
          <button type="button" class="btn btn-outline btn-sm" id="receipt-ref-save">
            Guardar Ref.
          </button>
        </div>
      </div>
    `,
    footerHTML: `
      <button class="btn btn-success btn-sm" id="modal-receipt-wa">WhatsApp</button>
      <button class="btn btn-outline btn-sm" id="modal-receipt-print">Imprimir</button>
      <button class="btn btn-primary btn-sm" id="modal-receipt-ok">Cerrar</button>
    `
  });

  document.getElementById('modal-receipt-wa')?.addEventListener('click', () => {
    const latestSale = db.sales.find(s => s.id === sale.id) || sale;
    const text = buildWhatsAppReceiptText(latestSale);
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  });

  document.getElementById('modal-receipt-print')?.addEventListener('click', () => {
    const latestSale = db.sales.find(s => s.id === sale.id) || sale;
    printCompactReceipt(latestSale);
  });

  document.getElementById('receipt-ref-save')?.addEventListener('click', async () => {
    const newRef = (document.getElementById('receipt-ref-input')?.value || '').trim();
    await db.updateSaleReference(sale.id, newRef);
    const refDisp = document.getElementById('receipt-ref-display');
    const refTxt = document.getElementById('receipt-ref-text');
    if (refTxt) refTxt.textContent = newRef;
    if (refDisp) refDisp.style.display = newRef ? '' : 'none';
    renderCurrentView();
    showToast('Número de referencia de Pago Móvil guardado en el recibo.');
  });

  document.getElementById('modal-receipt-ok')?.addEventListener('click', closeModal);
}

// ============================================================================
// 3. INVENTARIO CON HILERA DE LOTE Y FECHA DE ÚLTIMO RESTOCK
// ============================================================================
function renderInventory(container, topActions) {
  const admin = isAdmin();

  if (topActions && admin) {
    topActions.innerHTML = `
      <button class="btn btn-outline" id="inv-btn-excel">${icon("download")} Excel</button>
      <button class="btn btn-outline" id="inv-btn-restock">${icon("box")} Nuevo Restock / Lote</button>
      <button class="btn btn-primary" id="inv-btn-new">${icon("plus")} Nueva Prenda</button>
    `;
    document.getElementById('inv-btn-new')?.addEventListener('click', () => openProductModal(null));
    document.getElementById('inv-btn-restock')?.addEventListener('click', () => openPurchaseModal(null));
    document.getElementById('inv-btn-excel')?.addEventListener('click', openExcelModal);
  }

  const categories = ['ALL', ...getAllCategories()];
  const batches = ['ALL', ...getAllBatches()];
  const q = state.invSearch.trim().toLowerCase();

  const filtered = db.products.filter(p => {
    const isService = p.item_type === 'service';
    const matchCat = state.invCategory === 'ALL' || p.category === state.invCategory;
    const matchBatch =
      state.invBatchFilter === 'ALL' ||
      (p.batch_code || '').toUpperCase() === state.invBatchFilter;
    const matchQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.batch_code || '').toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    let matchStock = true;
    if (state.invStockFilter === 'LOW') matchStock = !isService && p.stock <= p.min_stock;
    return matchCat && matchBatch && matchQ && matchStock;
  });

  // Ordenar según el criterio elegido (por fecha de restock, por código de lote, stock o nombre)
  filtered.sort((a, b) => {
    const timeA = a.last_restock_at ? new Date(a.last_restock_at).getTime() : 0;
    const timeB = b.last_restock_at ? new Date(b.last_restock_at).getTime() : 0;
    if (state.invSortBy === 'restock_desc') return timeB - timeA;
    if (state.invSortBy === 'restock_asc') return timeA - timeB;
    if (state.invSortBy === 'batch_asc') {
      return String(a.batch_code || '').localeCompare(String(b.batch_code || '')) || (timeB - timeA);
    }
    if (state.invSortBy === 'stock_asc') return a.stock - b.stock;
    return a.name.localeCompare(b.name);
  });

  container.innerHTML = `
    <div class="toolbar">
      <div class="filter-group">
        <input
          type="text"
          class="input"
          id="inv-search"
          placeholder="Buscar prenda, código o lote..."
          value="${escapeHTML(state.invSearch)}"
          style="min-width:220px;"
        />

        <!-- Filtro por Categoría (Hombre, Mujer, Accesorios...) -->
        <select class="select" id="inv-cat-filter">
          ${categories
            .map(
              c =>
                `<option value="${escapeHTML(c)}" ${state.invCategory === c ? 'selected' : ''}>${
                  c === 'ALL' ? 'Categoría: Todas' : escapeHTML(c)
                }</option>`
            )
            .join('')}
        </select>

        <!-- Filtro por Lote de Cargamento -->
        <select class="select" id="inv-batch-filter">
          ${batches
            .map(
              b =>
                `<option value="${escapeHTML(b)}" ${state.invBatchFilter === b ? 'selected' : ''}>${
                  b === 'ALL' ? 'Lote: Todos' : `Lote: ${escapeHTML(b)}`
                }</option>`
            )
            .join('')}
        </select>

        <!-- Ordenar por Lote o Último Restock -->
        <select class="select" id="inv-sort-by">
          <option value="restock_desc" ${state.invSortBy === 'restock_desc' ? 'selected' : ''}>Ordenar: Último Restock (Más reciente)</option>
          <option value="restock_asc" ${state.invSortBy === 'restock_asc' ? 'selected' : ''}>Ordenar: Restock más antiguo</option>
          <option value="batch_asc" ${state.invSortBy === 'batch_asc' ? 'selected' : ''}>Ordenar: Agrupar por Lote</option>
          <option value="stock_asc" ${state.invSortBy === 'stock_asc' ? 'selected' : ''}>Ordenar: Menor Stock primero</option>
          <option value="name_asc" ${state.invSortBy === 'name_asc' ? 'selected' : ''}>Ordenar: Nombre (A-Z)</option>
        </select>
      </div>
    </div>

    <div class="card" style="margin-bottom:0;">
      <div class="table-responsive inv-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Prenda</th>
              <th>Categoría</th>
              <th>Lote / Último Restock</th>
              <th>Tallas / Disponible</th>
              ${admin ? '<th>Costo</th>' : ''}
              <th>Precio Venta</th>
              ${admin ? '<th>Ganancia</th><th></th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${
              filtered.length === 0
                ? `<tr><td colspan="8" style="text-align:center; padding:26px; color:var(--text-secondary);">No se encontraron prendas con ese filtro.</td></tr>`
                : filtered
                    .map(p => {
                      const isService = p.item_type === 'service';
                      const profit = p.sale_price - p.unit_cost;
                      const availSizes = getAvailableSizesList(p);

                      return `
                        <tr>
                          <td>
                            <div class="inv-prod-cell">
                              <div class="inv-thumb">
                                ${
                                  p.image_url
                                    ? `<img src="${escapeHTML(p.image_url)}" alt="${escapeHTML(p.name)}" />`
                                    : `${icon("hanger")}`
                                }
                              </div>
                              <div>
                                <strong>${escapeHTML(p.name)}</strong>
                                <div style="font-size:11.5px; color:var(--text-secondary); font-family:monospace;">${escapeHTML(p.sku)}</div>
                              </div>
                            </div>
                          </td>
                          <td><span class="badge badge-neutral">${escapeHTML(p.category)}</span></td>
                          <td>
                            ${
                              isService
                                ? `<span style="color:var(--text-muted);">-</span>`
                                : `<div>
                                    <span class="badge badge-neutral" style="font-family:monospace; color:var(--primary); border:1px solid var(--border-strong);">
                                      ${escapeHTML(p.batch_code || 'LOTE-01')}
                                    </span>
                                    <div style="font-size:11.5px; color:var(--text-secondary); margin-top:3px;">
                                      Llegó: <strong>${fmtShortDate(p.last_restock_at)}</strong>
                                    </div>
                                  </div>`
                            }
                          </td>
                          <td>
                            ${
                              isService
                                ? `<span class="badge badge-neutral">Servicio</span>`
                                : `<div>
                                    <span class="badge ${
                                      p.stock <= 0
                                        ? 'badge-danger'
                                        : p.stock <= p.min_stock
                                        ? 'badge-warning'
                                        : 'badge-success'
                                    }">
                                      ${p.stock <= 0 ? 'Agotada (0)' : `${p.stock} disp.`}
                                    </span>
                                    ${
                                      availSizes.length > 0
                                        ? `<div class="inv-sizes-wrap">
                                            ${availSizes
                                              .map(
                                                s =>
                                                  `<span class="inv-size-tag"><strong>${escapeHTML(s.size)}</strong> ${s.qty}</span>`
                                              )
                                              .join('')}
                                          </div>`
                                        : ''
                                    }
                                  </div>`
                            }
                          </td>
                          ${
                            admin
                              ? `<td>
                                  <strong>${fmtUSD(p.unit_cost)}</strong>
                                  <div style="font-size:11px; color:var(--text-secondary);">
                                    Compra ${fmtUSD(p.purchase_cost ?? p.unit_cost)} + Envío ${fmtUSD(p.shipping_cost || 0)}
                                  </div>
                                </td>`
                              : ''
                          }
                          <td><strong>${fmtUSD(p.sale_price)}</strong></td>
                          ${
                            admin
                              ? `
                            <td>
                              <span class="badge badge-success">+${fmtUSD(profit)} c/u</span>
                              <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                                Lote: +${fmtUSD(Math.max(0, p.stock) * profit)}
                              </div>
                            </td>
                            <td style="text-align:right; white-space:nowrap;">
                              <button class="btn btn-outline btn-sm" data-edit-prod="${escapeHTML(p.id)}">Editar</button>
                              <button class="btn btn-outline btn-sm" style="color:var(--danger);" data-del-prod="${escapeHTML(p.id)}">✕</button>
                            </td>
                          `
                              : ''
                          }
                        </tr>
                      `;
                    })
                    .join('')
            }
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('inv-search')?.addEventListener('input', e => {
    state.invSearch = e.target.value;
    renderCurrentView();
    const el = document.getElementById('inv-search');
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  });

  document.getElementById('inv-cat-filter')?.addEventListener('change', e => {
    state.invCategory = e.target.value;
    renderCurrentView();
  });

  document.getElementById('inv-batch-filter')?.addEventListener('change', e => {
    state.invBatchFilter = e.target.value;
    renderCurrentView();
  });

  document.getElementById('inv-sort-by')?.addEventListener('change', e => {
    state.invSortBy = e.target.value;
    renderCurrentView();
  });

  container.querySelectorAll('[data-edit-prod]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prod = db.products.find(p => p.id === btn.dataset.editProd);
      if (prod) openProductModal(prod);
    });
  });

  container.querySelectorAll('[data-del-prod]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const prod = db.products.find(p => p.id === btn.dataset.delProd);
      if (prod && confirm(`¿Eliminar "${prod.name}"?`)) {
        await db.deleteProduct(prod.id);
        updateChrome();
        renderCurrentView();
        showToast('Prenda eliminada.');
      }
    });
  });
}

function openProductModal(product = null) {
  const isEdit = Boolean(product);
  const allCats = getAllCategories();

  const p = product || {
    sku: `ROP-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    category: 'Mujer',
    item_type: 'product',
    image_url: '',
    batch_code: '-',
    last_restock_at: null,
    sizes_stock: { XS: 0, S: 0, M: 0, L: 0, XL: 0, 'Única': 0 },
    stock: 0,
    min_stock: 4,
    purchase_cost: 0,
    shipping_cost: 0,
    unit_cost: 0,
    sale_price: 0,
    unit: 'und'
  };

  const initSizesMap = getProductSizesMap(p);
  const initTotalStock = STANDARD_SIZES.reduce((sum, sz) => sum + (Number(initSizesMap[sz]) || 0), 0);
  const initPurchaseCost = p.purchase_cost !== undefined ? p.purchase_cost : p.unit_cost;
  const initShippingCost = p.shipping_cost !== undefined ? p.shipping_cost : 0;
  let currentImageUrl = p.image_url || '';

  openModal({
    title: isEdit ? `Editar Prenda: ${p.name}` : 'Registrar Nueva Prenda en Catálogo',
    maxWidth: '580px',
    bodyHTML: `
      <!-- Imagen de referencia de la prenda -->
      <div class="img-upload-box">
        <div class="img-preview-frame" id="prod-img-preview">
          ${
            currentImageUrl
              ? `<img src="${escapeHTML(currentImageUrl)}" alt="Vista previa" />`
              : `${icon("hanger")}`
          }
        </div>
        <div style="flex:1;">
          <div style="font-weight:700; font-size:13px; color:var(--primary); margin-bottom:4px;">
            ${icon("camera")} Imagen de Referencia
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <label class="btn btn-outline btn-sm" style="cursor:pointer; margin:0;">
              Elegir Foto...
              <input type="file" id="prod-img-input" accept="image/*" style="display:none;" />
            </label>
            <button type="button" class="btn btn-outline btn-sm" id="prod-img-clear" style="${currentImageUrl ? '' : 'display:none;'} color:var(--danger);">
              Quitar Foto
            </button>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Nombre de la Prenda / Artículo *</label>
        <input type="text" class="input" id="prod-name" value="${escapeHTML(p.name)}" placeholder="Ej. Blusa Lino Beige / Legging Seamless / Franela" />
      </div>

      <div class="form-grid" style="grid-template-columns: 1fr 1fr 110px;">
        <div class="form-group">
          <label>Categoría *</label>
          <select class="select" id="prod-cat">
            ${allCats
              .map(
                c =>
                  `<option value="${escapeHTML(c)}" ${p.category === c ? 'selected' : ''}>${escapeHTML(c)}</option>`
              )
              .join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Código / Referencia</label>
          <input type="text" class="input" id="prod-sku" value="${escapeHTML(p.sku)}" />
        </div>
        <div class="form-group">
          <label>Alerta Mín.</label>
          <input type="number" step="1" min="0" class="input" id="prod-min-stock" value="${p.min_stock}" />
        </div>
      </div>

      ${
        !isEdit
          ? `<div style="background:var(--bg-oat-soft); padding:10px 12px; border-radius:10px; border:1px dashed var(--border-strong); margin-bottom:14px; font-size:12px; color:var(--text-secondary);">
              Aquí solo registras la ficha de la prenda en tu catálogo (inicia en <strong>0</strong>). Luego, en <strong>Nuevo Restock / Lote</strong>, indicas en qué lote llegó y cuántas unidades entraron por talla.
            </div>`
          : `<div style="background:var(--bg-oat-soft); padding:10px 12px; border-radius:10px; border:1px solid var(--border-strong); margin-bottom:14px; font-size:12px; color:var(--text-secondary); display:flex; justify-content:space-between; align-items:center;">
              <span>Stock actual: <strong style="color:var(--primary);">${initTotalStock} prendas</strong> (Lote: <strong>${escapeHTML(p.batch_code || '-')}</strong>)</span>
              <span>Para sumar stock usa <strong>Nuevo Restock / Lote</strong></span>
            </div>`
      }

      <!-- CALCULADORA DE COSTO POR PRENDA (COMPRA + ENVÍO) Y PRECIO DE VENTA -->
      <div style="background:var(--bg-oat-soft); padding:14px; border-radius:12px; border:1px solid var(--border-strong); margin-bottom:12px;">
        <div style="font-weight:800; font-size:13px; color:var(--primary); margin-bottom:10px;">
          ${icon("box")} Costo de Referencia (Compra + Envío) y Precio de Venta
        </div>

        <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
          <div class="form-group" style="margin-bottom:8px;">
            <label>1. Costo Compra c/u ($)</label>
            <input type="number" step="0.01" min="0" class="input" id="prod-purchase-cost" value="${initPurchaseCost}" placeholder="Lo que costó comprarla" />
          </div>
          <div class="form-group" style="margin-bottom:8px;">
            <label>2. Costo Envío c/u ($)</label>
            <input type="number" step="0.01" min="0" class="input" id="prod-shipping-cost" value="${initShippingCost}" placeholder="Envío por cada prenda" />
          </div>
        </div>

        <div class="form-group" style="margin-bottom:0;">
          <label>3. Precio de Venta al Cliente ($)</label>
          <input type="number" step="0.01" min="0" class="input" id="prod-price" value="${p.sale_price}" style="font-weight:800; font-size:15px; color:var(--primary);" />
          <div class="margin-helper-btns">
            <span style="font-size:11.5px; color:var(--text-secondary); align-self:center; margin-right:4px;">Calcular precio sobre (Compra + Envío):</span>
            <button type="button" class="margin-chip" data-markup="30">+30%</button>
            <button type="button" class="margin-chip" data-markup="50">+50%</button>
            <button type="button" class="margin-chip" data-markup="100">+100% (x2)</button>
            <button type="button" class="margin-chip" data-markup="150">+150%</button>
          </div>
        </div>
      </div>

      <!-- DESGLOSE DETALLADO DE CUENTAS Y GANANCIA -->
      <div class="cart-summary" id="prod-margin-preview" style="margin-top:4px; background:#FAF8F4;"></div>
    `,
    footerHTML: `
      <button class="btn btn-outline" id="prod-modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="prod-modal-save">Guardar Prenda</button>
    `
  });

  // Eventos de carga y vista previa de imagen
  const imgInput = document.getElementById('prod-img-input');
  const imgPreview = document.getElementById('prod-img-preview');
  const imgClearBtn = document.getElementById('prod-img-clear');

  imgInput?.addEventListener('change', async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      currentImageUrl = await compressImageFile(file);
      if (imgPreview) {
        imgPreview.innerHTML = `<img src="${escapeHTML(currentImageUrl)}" alt="Vista previa" />`;
      }
      if (imgClearBtn) imgClearBtn.style.display = '';
    } catch (err) {
      showToast(err.message);
    }
  });

  imgClearBtn?.addEventListener('click', () => {
    currentImageUrl = '';
    if (imgPreview) imgPreview.innerHTML = `${icon("hanger")}`;
    imgClearBtn.style.display = 'none';
    if (imgInput) imgInput.value = '';
  });

  const updateMarginPreview = () => {
    const purchaseCost = Number(document.getElementById('prod-purchase-cost')?.value) || 0;
    const shippingCost = Number(document.getElementById('prod-shipping-cost')?.value) || 0;
    const totalUnitCost = Number((purchaseCost + shippingCost).toFixed(2));
    const price = Number(document.getElementById('prod-price')?.value) || 0;
    const unitProfit = Number((price - totalUnitCost).toFixed(2));
    const marginPct = price > 0 ? ((unitProfit / price) * 100).toFixed(0) : '0';

    const box = document.getElementById('prod-margin-preview');
    if (box) {
      box.innerHTML = `
        <div style="font-weight:800; font-size:12.5px; color:var(--primary); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.3px;">
          Resumen de Ganancia por Prenda
        </div>
        <div class="summary-row">
          <span>Costo Compra (${fmtUSD(purchaseCost)}) + Envío (${fmtUSD(shippingCost)}):</span>
          <strong>Te sale c/u en: ${fmtUSD(totalUnitCost)}</strong>
        </div>
        <div class="summary-row">
          <span>Precio de Venta por prenda:</span>
          <strong>${fmtUSD(price)}</strong>
        </div>
        <div class="summary-row" style="padding-top:6px; border-top:1px dashed var(--border-strong); margin-top:6px; margin-bottom:0;">
          <span><strong>Ganancia Libre por cada 1 prenda:</strong></span>
          <strong style="font-size:16px; color:${unitProfit >= 0 ? 'var(--olive-dark)' : 'var(--danger)'};">
            ${unitProfit >= 0 ? '+' : ''}${fmtUSD(unitProfit)} (${marginPct}%)
          </strong>
        </div>
      `;
    }
  };

  document.querySelectorAll('[data-markup]').forEach(chip => {
    chip.addEventListener('click', () => {
      const pCost = Number(document.getElementById('prod-purchase-cost')?.value) || 0;
      const sCost = Number(document.getElementById('prod-shipping-cost')?.value) || 0;
      const totalUnitCost = pCost + sCost;
      const pct = Number(chip.dataset.markup) || 50;
      if (totalUnitCost > 0) {
        document.getElementById('prod-price').value = Number((totalUnitCost * (1 + pct / 100)).toFixed(2));
        updateMarginPreview();
      } else {
        showToast('Primero ingresa el costo de compra y envío.');
      }
    });
  });

  updateMarginPreview();
  document.getElementById('prod-purchase-cost')?.addEventListener('input', updateMarginPreview);
  document.getElementById('prod-shipping-cost')?.addEventListener('input', updateMarginPreview);
  document.getElementById('prod-price')?.addEventListener('input', updateMarginPreview);
  document.getElementById('prod-modal-cancel')?.addEventListener('click', closeModal);

  document.getElementById('prod-modal-save')?.addEventListener('click', async () => {
    try {
      const name = document.getElementById('prod-name').value.trim();
      const sku = document.getElementById('prod-sku').value.trim();
      if (!name || !sku) {
        showToast('Escribe el nombre y código de la prenda.');
        return;
      }
      const purchaseCost = Number(document.getElementById('prod-purchase-cost').value) || 0;
      const shippingCost = Number(document.getElementById('prod-shipping-cost').value) || 0;

      await db.saveProduct({
        id: product ? product.id : null,
        sku,
        name,
        category: document.getElementById('prod-cat').value,
        item_type: 'product',
        image_url: currentImageUrl,
        batch_code: isEdit ? (p.batch_code || '-') : '-',
        last_restock_at: isEdit ? p.last_restock_at : null,
        sizes_stock: isEdit ? initSizesMap : { XS: 0, S: 0, M: 0, L: 0, XL: 0, 'Única': 0 },
        stock: isEdit ? initTotalStock : 0,
        min_stock: document.getElementById('prod-min-stock').value,
        unit: 'und',
        purchase_cost: purchaseCost,
        shipping_cost: shippingCost,
        unit_cost: Number((purchaseCost + shippingCost).toFixed(2)),
        sale_price: document.getElementById('prod-price').value
      });
      closeModal();
      updateChrome();
      renderCurrentView();
      showToast(isEdit ? 'Prenda actualizada.' : 'Prenda registrada. Usa "Nuevo Restock / Lote" para ingresar sus tallas.');
    } catch (err) {
      showToast(err.message);
    }
  });
}

function openExcelModal() {
  openModal({
    title: 'Excel / CSV (Copia de Seguridad y Reportes)',
    bodyHTML: `
      <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:18px;">
        <button class="btn btn-primary" id="xl-down-full" style="justify-content:space-between;">
          <span>${icon("download")} Copia de Seguridad Completa (Inventario, Ventas y Costos)</span><span>Descargar →</span>
        </button>
        <button class="btn btn-outline" id="xl-down-inv" style="justify-content:space-between;">
          <span>Descargar Solo Inventario, Tallas y Lotes</span><span>Descargar →</span>
        </button>
        <button class="btn btn-outline" id="xl-down-sales" style="justify-content:space-between;">
          <span>Descargar Solo Ventas y Ganancias</span><span>Descargar →</span>
        </button>
        <button class="btn btn-outline" id="xl-down-costs" style="justify-content:space-between;">
          <span>Descargar Solo Cargamentos y Gastos</span><span>Descargar →</span>
        </button>
      </div>

      <div style="border-top:1px solid var(--border-color); padding-top:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong>Subir Prendas desde Archivo CSV</strong>
          <button class="btn btn-outline btn-sm" id="xl-template">Bajar Plantilla</button>
        </div>
        <input type="file" id="csv-file-input" accept=".csv,text/csv" class="input" style="width:100%;" />
        <div id="csv-preview-area" style="margin-top:10px;"></div>
      </div>
    `,
    footerHTML: `<button class="btn btn-primary" id="xl-close">Listo</button>`
  });

  document.getElementById('xl-close')?.addEventListener('click', closeModal);
  document.getElementById('xl-down-full')?.addEventListener('click', exportFullOptimizedBackupCSV);
  document.getElementById('xl-down-inv')?.addEventListener('click', exportInventoryToCSV);
  document.getElementById('xl-down-sales')?.addEventListener('click', exportSalesToCSV);
  document.getElementById('xl-down-costs')?.addEventListener('click', exportCostsToCSV);
  document.getElementById('xl-template')?.addEventListener('click', () => {
    downloadCSV(
      'plantilla_ropa_lotes.csv',
      ['SKU', 'Nombre', 'Categoria', 'Lote', 'Stock_Actual', 'Stock_Minimo', 'Costo_Unitario_USD', 'Precio_Venta_USD'],
      [
        ['MUJ-01', 'Blusa Lino Beige', 'Mujer', 'LOTE-NOV-03', '15', '4', '12.00', '28.00'],
        ['HOM-01', 'Camisa Oxford Oliva', 'Hombre', 'LOTE-NOV-03', '12', '4', '14.00', '32.00']
      ]
    );
  });

  document.getElementById('csv-file-input')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const rows = parseCSVProducts(evt.target.result);
      const previewEl = document.getElementById('csv-preview-area');
      if (!rows.length) {
        previewEl.innerHTML = `<span class="badge badge-danger">No se detectaron prendas válidas.</span>`;
        return;
      }
      previewEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-oat); padding:10px 12px; border-radius:8px;">
          <strong>${rows.length} prendas listas</strong>
          <button class="btn btn-success btn-sm" id="btn-confirm-csv-import">Cargar Ahora</button>
        </div>
      `;
      document.getElementById('btn-confirm-csv-import')?.addEventListener('click', async () => {
        const res = await db.bulkUpsertProducts(rows);
        closeModal();
        updateChrome();
        renderCurrentView();
        showToast(`${res.created} nuevas y ${res.updated} actualizadas.`);
      });
    };
    reader.readAsText(file, 'UTF-8');
  });
}

// ============================================================================
// 4. SECCIÓN DE LOTES (ADQUIRIDO -> EN VÍA -> LLEGÓ / FINALIZADO)
// ============================================================================
function renderBatches(container, topActions) {
  const allBatches = db.batches || [];
  const countAdq = allBatches.filter(b => b.status === 'adquirido').length;
  const countVia = allBatches.filter(b => b.status === 'en_via').length;
  const countLlego = allBatches.filter(b => b.status === 'llego').length;

  if (topActions) {
    topActions.innerHTML = `
      <div class="tabs">
        <button class="tab-btn ${state.batchStatusFilter === 'ALL' ? 'active' : ''}" data-bat-filter="ALL">
          Todos (${allBatches.length})
        </button>
        <button class="tab-btn ${state.batchStatusFilter === 'adquirido' ? 'active' : ''}" data-bat-filter="adquirido">
          ${icon("bag")} Adquirido (${countAdq})
        </button>
        <button class="tab-btn ${state.batchStatusFilter === 'en_via' ? 'active' : ''}" data-bat-filter="en_via">
          ${icon("truck")} En Vía (${countVia})
        </button>
        <button class="tab-btn ${state.batchStatusFilter === 'llego' ? 'active' : ''}" data-bat-filter="llego">
          ${icon("check")} Llegó (${countLlego})
        </button>
      </div>
      <button class="btn btn-primary" id="btn-new-batch">${icon("plus")} Nuevo Lote</button>
    `;
    topActions.querySelectorAll('[data-bat-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.batchStatusFilter = btn.dataset.batFilter;
        renderCurrentView();
      });
    });
    document.getElementById('btn-new-batch')?.addEventListener('click', () => openBatchModal(null));
  }

  const totalSpentAll = allBatches.reduce((a, b) => a + Number(b.total_cost), 0);
  const inTransitSpent = allBatches
    .filter(b => b.status === 'adquirido' || b.status === 'en_via')
    .reduce((a, b) => a + Number(b.total_cost), 0);
  const arrivedSpent = allBatches
    .filter(b => b.status === 'llego')
    .reduce((a, b) => a + Number(b.total_cost), 0);

  const filteredBatches = allBatches.filter(b => {
    if (state.batchStatusFilter === 'ALL') return true;
    return b.status === state.batchStatusFilter;
  });

  container.innerHTML = `
    <!-- Resumen de Inversión en Lotes -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Gasto Total en Lotes</div>
        <div class="kpi-value">${fmtUSD(totalSpentAll)}</div>
        <div class="kpi-sub">${allBatches.length} lotes registrados (Compra + Envío)</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">En Proceso / En Camino</div>
        <div class="kpi-value" style="color:var(--warning);">${fmtUSD(inTransitSpent)}</div>
        <div class="kpi-sub">${countAdq} adquirido(s) · ${countVia} en vía</div>
      </div>

      <div class="kpi-card highlight">
        <div class="kpi-label">Lotes Recibidos (Llegó)</div>
        <div class="kpi-value" style="color:var(--olive-dark);">${fmtUSD(arrivedSpent)}</div>
        <div class="kpi-sub">${countLlego} lote(s) recibidos en tienda</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${icon("box")} Registro y Seguimiento de Lotes</div>
          <div style="font-size:12.5px; color:var(--text-secondary);">
            Haz clic en <strong>1. Adquirido</strong>, <strong>2. En Vía</strong> o <strong>3. Llegó</strong> para actualizar el estatus manualmente
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Lote / Contenido</th>
              <th>Bitácora de Fechas</th>
              <th>Gasto Total del Lote</th>
              <th>Actualizar Estado (1 Clic)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${
              filteredBatches.length === 0
                ? `<tr><td colspan="5" style="text-align:center; padding:28px; color:var(--text-secondary);">No hay lotes en este estado.</td></tr>`
                : filteredBatches
                    .map(b => {
                      const avgPerItem =
                        b.items_count > 0 ? Number((b.total_cost / b.items_count).toFixed(2)) : 0;
                      const linkedProdsCount = db.products.filter(
                        p => (p.batch_code || '').toUpperCase() === (b.batch_code || '').toUpperCase()
                      ).length;

                      return `
                        <tr>
                          <td>
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:3px;">
                              <span class="badge badge-neutral" style="font-family:monospace; font-size:12.5px; color:var(--primary); border:1px solid var(--border-strong);">
                                ${escapeHTML(b.batch_code)}
                              </span>
                              ${
                                b.items_count > 0
                                  ? `<span class="badge badge-neutral">${b.items_count} prendas</span>`
                                  : ''
                              }
                            </div>
                            <strong>${escapeHTML(b.description)}</strong>
                            <div style="font-size:11.5px; color:var(--text-secondary);">
                              Proveedor/Courier: ${escapeHTML(b.supplier)}
                              ${b.notes ? ` · <em>${escapeHTML(b.notes)}</em>` : ''}
                            </div>
                          </td>

                          <td>
                            <div class="batch-dates-timeline">
                              <div class="batch-date-line">
                                <span><strong>Comprado:</strong> ${fmtShortDate(b.purchased_date)}</span>
                              </div>
                              <div class="batch-date-line">
                                <span><strong>En Vía:</strong> ${
                                  b.in_transit_date
                                    ? `<strong>${fmtShortDate(b.in_transit_date)}</strong>`
                                    : '<span style="color:var(--text-muted);">Pendiente</span>'
                                }</span>
                              </div>
                              <div class="batch-date-line">
                                <span><strong>Llegó:</strong> ${
                                  b.arrived_date
                                    ? `<strong style="color:var(--olive-dark);">${fmtShortDate(b.arrived_date)}</strong>`
                                    : '<span style="color:var(--text-muted);">En espera</span>'
                                }</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <strong style="font-size:16px; color:var(--primary);">${fmtUSD(b.total_cost)}</strong>
                            <div style="font-size:11.5px; color:var(--text-secondary);">
                              Compra ${fmtUSD(b.purchase_amount)} + Envío ${fmtUSD(b.shipping_amount)}
                            </div>
                            ${
                              avgPerItem > 0
                                ? `<div style="font-size:11px; color:var(--olive-dark); font-weight:600;">
                                    ≈ ${fmtUSD(avgPerItem)} por prenda
                                  </div>`
                                : ''
                            }
                          </td>

                          <td>
                            <div class="batch-stepper">
                              <button
                                class="batch-step-btn ${b.status === 'adquirido' ? 'active-adquirido' : ''}"
                                data-set-batch-status="${escapeHTML(b.id)}"
                                data-status="adquirido"
                              >
                                ${icon("bag")} 1. Adquirido
                              </button>
                              <button
                                class="batch-step-btn ${b.status === 'en_via' ? 'active-en_via' : ''}"
                                data-set-batch-status="${escapeHTML(b.id)}"
                                data-status="en_via"
                              >
                                ${icon("truck")} 2. En Vía
                              </button>
                              <button
                                class="batch-step-btn ${b.status === 'llego' ? 'active-llego' : ''}"
                                data-set-batch-status="${escapeHTML(b.id)}"
                                data-status="llego"
                              >
                                ${icon("check")} 3. Llegó
                              </button>
                            </div>
                          </td>

                          <td style="text-align:right; white-space:nowrap;">
                            ${
                              linkedProdsCount > 0
                                ? `<button class="btn btn-outline btn-sm" title="Ver las prendas de este lote en Inventario" data-view-batch-inv="${escapeHTML(b.batch_code)}">
                                    Ver (${linkedProdsCount})
                                  </button>`
                                : ''
                            }
                            <button class="btn btn-outline btn-sm" data-edit-batch="${escapeHTML(b.id)}">Editar</button>
                            <button class="btn btn-outline btn-sm" style="color:var(--danger);" data-del-batch="${escapeHTML(b.id)}">✕</button>
                          </td>
                        </tr>
                      `;
                    })
                    .join('')
            }
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Cambio manual de estado en 1 clic (Adquirido -> En Vía -> Llegó)
  container.querySelectorAll('[data-set-batch-status]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const batchId = btn.dataset.setBatchStatus;
      const newStatus = btn.dataset.status;
      const updated = await db.updateBatchStatus(batchId, newStatus);
      renderCurrentView();
      const labelMap = {
        adquirido: 'Adquirido',
        en_via: 'En Vía (En Ruta)',
        llego: 'Llegó'
      };
      showToast(`${updated.batch_code} actualizado a: ${labelMap[newStatus]}`);
    });
  });

  // Ver prendas de este lote en Inventario
  container.querySelectorAll('[data-view-batch-inv]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.invBatchFilter = btn.dataset.viewBatchInv.toUpperCase();
      navigateTo('inventory');
    });
  });

  // Editar lote
  container.querySelectorAll('[data-edit-batch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const b = (db.batches || []).find(x => x.id === btn.dataset.editBatch);
      if (b) openBatchModal(b);
    });
  });

  // Eliminar lote
  container.querySelectorAll('[data-del-batch]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const b = (db.batches || []).find(x => x.id === btn.dataset.delBatch);
      if (b && confirm(`¿Eliminar el registro del lote ${b.batch_code}?`)) {
        await db.deleteBatch(b.id);
        renderCurrentView();
        showToast('Lote eliminado.');
      }
    });
  });
}

function openBatchModal(batch = null) {
  const isEdit = Boolean(batch);
  const nextNum = (db.batches?.length || 0) + 1;
  const defaultCode = `LOTE-${new Date().toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().replace(/[^A-Z]/g, '')}-${String(nextNum).padStart(2, '0')}`;

  const b = batch || {
    batch_code: defaultCode,
    description: '',
    supplier: 'Gymshark / Proveedor',
    items_count: 20,
    purchase_amount: 0,
    shipping_amount: 0,
    total_cost: 0,
    status: 'adquirido',
    purchased_date: new Date().toISOString(),
    in_transit_date: null,
    arrived_date: null,
    notes: ''
  };

  openModal({
    title: isEdit ? `Editar Lote: ${b.batch_code}` : 'Registrar Nuevo Lote / Cargamento',
    maxWidth: '560px',
    bodyHTML: `
      <div class="form-grid">
        <div class="form-group">
          <label>Código del Lote *</label>
          <input type="text" class="input" id="bat-code" value="${escapeHTML(b.batch_code)}" placeholder="Ej. LOTE-DIC-01" />
        </div>
        <div class="form-group">
          <label>Estado Actual *</label>
          <select class="select" id="bat-status">
            <option value="adquirido" ${b.status === 'adquirido' ? 'selected' : ''}>${icon("bag")} 1. Adquirido (Comprado)</option>
            <option value="en_via" ${b.status === 'en_via' ? 'selected' : ''}>${icon("truck")} 2. En Vía (En Ruta)</option>
            <option value="llego" ${b.status === 'llego' ? 'selected' : ''}>${icon("check")} 3. Llegó</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Descripción del Cargamento (¿Qué trae este lote?) *</label>
        <input type="text" class="input" id="bat-desc" value="${escapeHTML(b.description)}" placeholder="Ej. 25 prendas: Leggings, Tops y Franelas" />
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label>Proveedor / Tienda / Courier</label>
          <input type="text" class="input" id="bat-supplier" value="${escapeHTML(b.supplier)}" />
        </div>
        <div class="form-group">
          <label>Cantidad Total de Prendas en el Lote</label>
          <input type="number" step="1" min="0" class="input" id="bat-items" value="${b.items_count}" />
        </div>
      </div>

      <!-- GASTO TOTAL DEL LOTE (COMPRA + ENVÍO) -->
      <div style="background:var(--bg-oat-soft); padding:14px; border-radius:12px; border:1px solid var(--border-strong); margin-bottom:14px;">
        <div style="font-weight:800; font-size:13px; color:var(--primary); margin-bottom:10px;">
          Gasto Total del Lote (Compra + Envío)
        </div>
        <div class="form-grid">
          <div class="form-group" style="margin-bottom:0;">
            <label>Costo de Compra del Lote ($)</label>
            <input type="number" step="0.01" min="0" class="input" id="bat-purchase" value="${b.purchase_amount}" />
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label>Costo de Envío / Flete del Lote ($)</label>
            <input type="number" step="0.01" min="0" class="input" id="bat-shipping" value="${b.shipping_amount}" />
          </div>
        </div>
        <div id="bat-cost-summary" style="margin-top:10px; padding-top:10px; border-top:1px dashed var(--border-strong); font-size:13px;"></div>
      </div>

      <!-- FECHA DE COMPRA (En Vía y Llegó se marcan automáticamente al cambiar el estado en 1 clic) -->
      <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
        <div class="form-group" style="margin-bottom:0;">
          <label>Fecha de Compra *</label>
          <input type="date" class="input" id="bat-date-pur" value="${toInputDate(b.purchased_date)}" />
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>Nota / Guía de Tracking (Opcional)</label>
          <input type="text" class="input" id="bat-notes" value="${escapeHTML(b.notes || '')}" placeholder="Ej. Nº de guía o detalle..." />
        </div>
      </div>
      <div style="font-size:11.5px; color:var(--text-secondary); margin-top:8px;">
        Las fechas de <strong>En Vía</strong> y <strong>Llegó</strong> se guardarán automáticamente cuando marques el botón correspondiente en la lista de lotes.
      </div>
    `,
    footerHTML: `
      <button class="btn btn-outline" id="bat-cancel">Cancelar</button>
      <button class="btn btn-primary" id="bat-save">Guardar Lote</button>
    `
  });

  const updateBatSummary = () => {
    const p = Number(document.getElementById('bat-purchase')?.value) || 0;
    const s = Number(document.getElementById('bat-shipping')?.value) || 0;
    const items = Math.max(1, Number(document.getElementById('bat-items')?.value) || 1);
    const total = Number((p + s).toFixed(2));
    const perItem = Number((total / items).toFixed(2));
    const perItemShip = Number((s / items).toFixed(2));

    const box = document.getElementById('bat-cost-summary');
    if (box) {
      box.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span><strong>Gasto Total del Lote:</strong></span>
          <strong style="font-size:17px; color:var(--primary);">${fmtUSD(total)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-secondary); margin-top:3px;">
          <span>Promedio por prenda (${items} prendas):</span>
          <strong>Te sale c/u en ≈ ${fmtUSD(perItem)} (Envío c/u: ${fmtUSD(perItemShip)})</strong>
        </div>
      `;
    }
  };

  updateBatSummary();
  document.getElementById('bat-purchase')?.addEventListener('input', updateBatSummary);
  document.getElementById('bat-shipping')?.addEventListener('input', updateBatSummary);
  document.getElementById('bat-items')?.addEventListener('input', updateBatSummary);

  document.getElementById('bat-cancel')?.addEventListener('click', closeModal);
  document.getElementById('bat-save')?.addEventListener('click', async () => {
    try {
      const code = document.getElementById('bat-code').value.trim();
      const desc = document.getElementById('bat-desc').value.trim();
      if (!code || !desc) {
        showToast('Escribe el código y la descripción del lote.');
        return;
      }
      await db.saveBatch({
        id: batch ? batch.id : null,
        batch_code: code,
        description: desc,
        supplier: document.getElementById('bat-supplier').value,
        items_count: document.getElementById('bat-items').value,
        purchase_amount: document.getElementById('bat-purchase').value,
        shipping_amount: document.getElementById('bat-shipping').value,
        status: document.getElementById('bat-status').value,
        purchased_date: document.getElementById('bat-date-pur').value || null,
        notes: document.getElementById('bat-notes').value
      });
      closeModal();
      updateChrome();
      renderCurrentView();
      showToast('Lote guardado correctamente.');
    } catch (err) {
      showToast(err.message);
    }
  });
}

// ============================================================================
// 5. CARGAMENTOS (ENTRADAS POR PRENDA) Y GASTOS DE TIENDA
// ============================================================================
function renderCostsAndPurchases(container, topActions) {
  if (topActions) {
    topActions.innerHTML = `
      <div class="tabs">
        <button class="tab-btn ${state.costsTab === 'purchases' ? 'active' : ''}" data-cost-tab="purchases">
          ${icon("box")} Llegada de Lotes / Restock (${db.purchases.length})
        </button>
        <button class="tab-btn ${state.costsTab === 'expenses' ? 'active' : ''}" data-cost-tab="expenses">
          ${icon("wallet")} Gastos de la Tienda (${db.expenses.length})
        </button>
      </div>
      ${
        state.costsTab === 'purchases'
          ? `<button class="btn btn-primary" id="btn-add-pur">${icon("box")} Registrar Nuevo Lote / Restock</button>`
          : `<button class="btn btn-primary" id="btn-add-exp">${icon("plus")} Anotar Gasto</button>`
      }
    `;
    topActions.querySelectorAll('[data-cost-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.costsTab = btn.dataset.costTab;
        renderCurrentView();
      });
    });
    document.getElementById('btn-add-exp')?.addEventListener('click', openExpenseModal);
    document.getElementById('btn-add-pur')?.addEventListener('click', () => openPurchaseModal(null));
  }

  if (state.costsTab === 'purchases') {
    const totalPurchases = db.purchases.reduce((a, p) => a + Number(p.total_cost), 0);
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Historial de Lotes y Cargamentos Recibidos</div>
          <strong>Total invertido: ${fmtUSD(totalPurchases)}</strong>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Fecha de Llegada</th>
                <th>Lote / Cargamento</th>
                <th>Prenda</th>
                <th>Proveedor</th>
                <th>Cant. Recibida</th>
                <th>Compra + Envío (c/u)</th>
                <th>Total Cargamento</th>
              </tr>
            </thead>
            <tbody>
              ${
                db.purchases.length === 0
                  ? `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-secondary);">No hay cargamentos registrados.</td></tr>`
                  : db.purchases
                      .map(
                        p => `
                    <tr>
                      <td><strong>${fmtShortDate(p.date)}</strong></td>
                      <td>
                        <span class="badge badge-neutral" style="font-family:monospace; color:var(--primary); border:1px solid var(--border-strong);">
                          ${escapeHTML(p.batch_code || 'LOTE-01')}
                        </span>
                      </td>
                      <td><strong>${escapeHTML(p.product_name)}</strong></td>
                      <td>${escapeHTML(p.supplier)}</td>
                      <td>
                        <span class="badge badge-success">+${p.quantity}</span>
                        ${
                          p.sizes_summary
                            ? `<div style="font-size:11px; color:var(--text-secondary); margin-top:3px;">${escapeHTML(p.sizes_summary)}</div>`
                            : ''
                        }
                      </td>
                      <td>
                        <strong>${fmtUSD(p.unit_cost)} c/u</strong>
                        <div style="font-size:11px; color:var(--text-secondary);">
                          Compra ${fmtUSD(p.purchase_cost ?? p.unit_cost)} + Envío ${fmtUSD(p.shipping_cost || 0)}
                        </div>
                      </td>
                      <td><strong>${fmtUSD(p.total_cost)}</strong></td>
                    </tr>
                  `
                      )
                      .join('')
              }
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else {
    const totalExpenses = db.expenses.reduce((a, e) => a + Number(e.amount), 0);
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Gastos Fijos y Operativos de la Tienda</div>
          <strong>Total: ${fmtUSD(totalExpenses)}</strong>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Concepto</th>
                <th>Monto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${
                db.expenses.length === 0
                  ? `<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--text-secondary);">No hay gastos registrados.</td></tr>`
                  : db.expenses
                      .map(
                        e => `
                    <tr>
                      <td>${fmtDate(e.date)}</td>
                      <td><span class="badge badge-neutral">${escapeHTML(e.category)}</span></td>
                      <td><strong>${escapeHTML(e.description)}</strong></td>
                      <td><strong style="color:var(--danger);">${fmtUSD(e.amount)}</strong></td>
                      <td style="text-align:right;">
                        <button class="btn btn-outline btn-sm" style="color:var(--danger);" data-del-exp="${escapeHTML(e.id)}">✕</button>
                      </td>
                    </tr>
                  `
                      )
                      .join('')
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.querySelectorAll('[data-del-exp]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await db.deleteExpense(btn.dataset.delExp);
        renderCurrentView();
        showToast('Gasto eliminado.');
      });
    });
  }
}

function openPurchaseModal(preselectedProductId = null) {
  const physicalProducts = db.products.filter(p => p.item_type !== 'service');
  if (!physicalProducts.length) {
    showToast('Primero crea una prenda en Inventario.');
    return;
  }
  const initialProd =
    physicalProducts.find(p => p.id === preselectedProductId) || physicalProducts[0];
  const registeredBatches = db.batches || [];
  const suggestedBatch =
    registeredBatches[0]?.batch_code ||
    (initialProd.batch_code && initialProd.batch_code !== '-' ? initialProd.batch_code : 'LOTE-01');

  const initPurCost = initialProd.purchase_cost !== undefined ? initialProd.purchase_cost : initialProd.unit_cost;
  const initShipCost = initialProd.shipping_cost !== undefined ? initialProd.shipping_cost : 0;

  openModal({
    title: 'Registrar Restock / Entrada de Lote',
    maxWidth: '560px',
    bodyHTML: `
      <div class="form-group">
        <label>Prenda que llegó *</label>
        <select class="select" id="pur-product">
          ${physicalProducts
            .map(
              p =>
                `<option value="${escapeHTML(p.id)}" ${p.id === initialProd.id ? 'selected' : ''}>
                  [${escapeHTML(p.category)}] ${escapeHTML(p.name)} (Stock actual: ${p.stock} · Venta: ${fmtUSD(p.sale_price)})
                </option>`
            )
            .join('')}
        </select>
      </div>

      <!-- Solo selección de Lote registrado (la fecha se toma automáticamente del Lote) -->
      <div class="form-group" style="background:var(--bg-oat-soft); padding:12px; border-radius:10px; border:1px solid var(--border-strong); margin-bottom:14px;">
        <label>Lote en el que llegó *</label>
        ${
          registeredBatches.length > 0
            ? `<select class="select" id="pur-batch">
                ${registeredBatches
                  .map(b => {
                    const stLabel = b.status === 'llego' ? 'Llegó' : b.status === 'en_via' ? 'En Vía' : 'Adquirido';
                    const dtLabel = b.arrived_date ? fmtShortDate(b.arrived_date) : fmtShortDate(b.purchased_date);
                    return `<option value="${escapeHTML(b.batch_code)}" ${b.batch_code === suggestedBatch ? 'selected' : ''}>
                      ${escapeHTML(b.batch_code)} · ${escapeHTML(b.description)} (${stLabel} · ${dtLabel})
                    </option>`;
                  })
                  .join('')}
              </select>`
            : `<input type="text" class="input" id="pur-batch" value="${escapeHTML(suggestedBatch)}" placeholder="Ej. LOTE-NOV-01" />`
        }
        <small style="font-size:11px; color:var(--text-secondary); margin-top:4px;">
          La fecha de entrada se enlaza automáticamente con la fecha de este lote.
        </small>
      </div>

      <div style="background:var(--bg-oat-soft); padding:12px; border-radius:12px; border:1px solid var(--border-strong); margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <label style="margin:0; font-weight:800; font-size:13px; color:var(--primary);">
            Tallas que Entran en este Restock *
          </label>
          <span class="badge badge-success" id="pur-total-qty-badge">Total: 0 prendas</span>
        </div>
        <div class="size-inputs-grid">
          ${STANDARD_SIZES.map(
            sz => `
            <div class="size-input-box">
              <label>${escapeHTML(sz)}</label>
              <input
                type="number"
                step="1"
                min="0"
                data-pur-size="${escapeHTML(sz)}"
                value="0"
              />
            </div>
          `
          ).join('')}
        </div>
      </div>

      <div class="form-grid" style="grid-template-columns: 1fr 1fr 1fr;">
        <div class="form-group">
          <label>Total Prendas</label>
          <input type="number" step="1" min="0" class="input" id="pur-qty" value="0" readonly style="background:var(--bg-oat); font-weight:800; color:var(--primary);" />
        </div>
        <div class="form-group">
          <label>Costo Compra c/u ($)</label>
          <input type="number" step="0.01" min="0" class="input" id="pur-purchase-cost" value="${initPurCost}" />
        </div>
        <div class="form-group">
          <label>Costo Envío c/u ($)</label>
          <input type="number" step="0.01" min="0" class="input" id="pur-shipping-cost" value="${initShipCost}" />
        </div>
      </div>

      <div style="display:flex; align-items:center; gap:8px; font-size:12px; color:var(--text-secondary); margin-bottom:12px; flex-wrap:wrap;">
        <span>¿Pagaste un envío total por este paquete?</span>
        <input type="number" step="0.01" min="0" class="input" id="pur-total-box-ship" placeholder="Envío total caja ($)" style="width:145px; padding:5px 9px; font-size:12px;" />
        <span>(Se divide entre la cantidad)</span>
      </div>

      <div class="cart-summary" id="pur-calc-preview" style="background:#FAF8F4;"></div>
    `,
    footerHTML: `
      <button class="btn btn-outline" id="pur-cancel">Cancelar</button>
      <button class="btn btn-primary" id="pur-save">Guardar Lote y Sumar Stock</button>
    `
  });

  const updatePurPreview = () => {
    const prodId = document.getElementById('pur-product')?.value;
    const prod = db.products.find(p => p.id === prodId) || initialProd;
    const qty = Math.max(1, Number(document.getElementById('pur-qty')?.value) || 1);
    const pCost = Number(document.getElementById('pur-purchase-cost')?.value) || 0;
    const sCost = Number(document.getElementById('pur-shipping-cost')?.value) || 0;
    const realUnitCost = Number((pCost + sCost).toFixed(2));
    const totalShipmentCost = Number((realUnitCost * qty).toFixed(2));
    const unitProfit = Number((prod.sale_price - realUnitCost).toFixed(2));
    const batchProfit = Number((unitProfit * qty).toFixed(2));

    const box = document.getElementById('pur-calc-preview');
    if (box) {
      box.innerHTML = `
        <div class="summary-row">
          <span>Compra (${fmtUSD(pCost)}) + Envío (${fmtUSD(sCost)}):</span>
          <strong>Te sale c/u en: ${fmtUSD(realUnitCost)}</strong>
        </div>
        <div class="summary-row">
          <span>Inversión Total de este Lote (${qty} prendas):</span>
          <strong>${fmtUSD(totalShipmentCost)}</strong>
        </div>
        <div class="summary-row" style="margin-bottom:0; padding-top:6px; border-top:1px dashed var(--border-strong);">
          <span>Tu Ganancia Libre (vendiendo a ${fmtUSD(prod.sale_price)} c/u):</span>
          <strong style="color:var(--olive-dark);">+${fmtUSD(unitProfit)} c/u (Lote: +${fmtUSD(batchProfit)})</strong>
        </div>
      `;
    }
  };

  document.getElementById('pur-total-box-ship')?.addEventListener('input', e => {
    const boxShip = Number(e.target.value) || 0;
    const qty = Math.max(1, Number(document.getElementById('pur-qty')?.value) || 1);
    document.getElementById('pur-shipping-cost').value = Number((boxShip / qty).toFixed(2));
    updatePurPreview();
  });

  document.getElementById('pur-product')?.addEventListener('change', e => {
    const prod = db.products.find(p => p.id === e.target.value);
    if (prod) {
      document.getElementById('pur-purchase-cost').value = prod.purchase_cost ?? prod.unit_cost;
      document.getElementById('pur-shipping-cost').value = prod.shipping_cost || 0;
      if (prod.batch_code && prod.batch_code !== '-') {
        document.getElementById('pur-batch').value = prod.batch_code;
      }
      updatePurPreview();
    }
  });

  const collectPurSizes = () => {
    const map = { XS: 0, S: 0, M: 0, L: 0, XL: 0, 'Única': 0 };
    let total = 0;
    document.querySelectorAll('[data-pur-size]').forEach(inp => {
      const sz = inp.dataset.purSize;
      const val = Math.max(0, parseInt(inp.value, 10) || 0);
      map[sz] = val;
      total += val;
    });
    const qtyInp = document.getElementById('pur-qty');
    const badgeEl = document.getElementById('pur-total-qty-badge');
    if (qtyInp) qtyInp.value = total;
    if (badgeEl) badgeEl.textContent = `Total: ${total} prendas`;

    const boxShip = Number(document.getElementById('pur-total-box-ship')?.value) || 0;
    if (boxShip > 0 && total > 0) {
      document.getElementById('pur-shipping-cost').value = Number((boxShip / total).toFixed(2));
    }
    return { map, total };
  };

  document.querySelectorAll('[data-pur-size]').forEach(inp => {
    inp.addEventListener('input', () => {
      collectPurSizes();
      updatePurPreview();
    });
  });

  document.getElementById('pur-qty')?.addEventListener('input', updatePurPreview);
  document.getElementById('pur-purchase-cost')?.addEventListener('input', updatePurPreview);
  document.getElementById('pur-shipping-cost')?.addEventListener('input', updatePurPreview);
  updatePurPreview();

  document.getElementById('pur-cancel')?.addEventListener('click', closeModal);
  document.getElementById('pur-save')?.addEventListener('click', async () => {
    try {
      const { map: sizesAdded, total: totalQty } = collectPurSizes();
      const batchCode = document.getElementById('pur-batch').value;
      const linkedBatch = (db.batches || []).find(
        b => (b.batch_code || '').toUpperCase() === String(batchCode || '').trim().toUpperCase()
      );
      const autoDate = linkedBatch?.arrived_date || linkedBatch?.purchased_date || new Date().toISOString();
      const autoSupplier = linkedBatch?.supplier || 'Proveedor General';
      const pCost = Number(document.getElementById('pur-purchase-cost').value) || 0;
      const sCost = Number(document.getElementById('pur-shipping-cost').value) || 0;
      const rec = await db.createPurchase({
        product_id: document.getElementById('pur-product').value,
        batch_code: batchCode,
        restock_date: autoDate,
        quantity: totalQty,
        sizes_added: sizesAdded,
        purchase_cost: pCost,
        shipping_cost: sCost,
        unit_cost: Number((pCost + sCost).toFixed(2)),
        supplier: autoSupplier
      });
      closeModal();
      updateChrome();
      renderCurrentView();
      showToast(`Restock por tallas guardado en ${rec.batch_code} (+${rec.quantity} prendas).`);
    } catch (err) {
      showToast(err.message);
    }
  });
}

function openExpenseModal() {
  openModal({
    title: 'Anotar Gasto de la Tienda',
    bodyHTML: `
      <div class="form-group">
        <label>¿En qué se gastó? *</label>
        <input type="text" class="input" id="exp-desc" placeholder="Ej. Bolsas boutique, Alquiler, Envío, Publicidad..." />
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>Categoría</label>
          <select class="select" id="exp-cat">
            <option value="Alquiler y Local">Alquiler y Local</option>
            <option value="Nómina y Comisiones">Nómina y Comisiones</option>
            <option value="Logística y Envíos">Bolsas, Etiquetas y Envíos</option>
            <option value="Publicidad">Publicidad / Redes</option>
            <option value="Servicios">Servicios (Luz, Internet)</option>
            <option value="Otros Gastos">Otros Gastos</option>
          </select>
        </div>
        <div class="form-group">
          <label>Monto ($ USD) *</label>
          <input type="number" step="0.01" min="0.01" class="input" id="exp-amount" placeholder="0.00" />
        </div>
      </div>
    `,
    footerHTML: `
      <button class="btn btn-outline" id="exp-cancel">Cancelar</button>
      <button class="btn btn-primary" id="exp-save">Guardar Gasto</button>
    `
  });

  document.getElementById('exp-cancel')?.addEventListener('click', closeModal);
  document.getElementById('exp-save')?.addEventListener('click', async () => {
    try {
      const desc = document.getElementById('exp-desc').value.trim();
      if (!desc) {
        showToast('Escribe el concepto del gasto.');
        return;
      }
      await db.createExpense({
        category: document.getElementById('exp-cat').value,
        amount: document.getElementById('exp-amount').value,
        description: desc,
        payment_method: 'Efectivo USD'
      });
      closeModal();
      renderCurrentView();
      showToast('Gasto guardado.');
    } catch (err) {
      showToast(err.message);
    }
  });
}

// ============================================================================
// 5. AJUSTES
// ============================================================================
function renderSettings(container) {
  const p = db.profile;
  const cfg = db.config;

  container.innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Datos de la Tienda</div>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>Nombre de la Tienda (se muestra debajo del logo)</label>
            <input type="text" class="input" id="set-bname" value="${escapeHTML(p.businessName)}" placeholder="Escribe el nombre de tu tienda..." />
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Moneda Secundaria (Opcional)</label>
              <input type="text" class="input" id="set-sym" value="${escapeHTML(p.secondaryCurrencySymbol || 'Bs.')}" placeholder="Bs. / COP" />
            </div>
            <div class="form-group">
              <label>Tasa de Cambio (0 = Solo USD)</label>
              <input type="number" step="0.01" min="0" class="input" id="set-rate" value="${p.exchangeRate || 0}" />
            </div>
          </div>

          <button class="btn btn-primary" id="btn-save-profile" style="width:100%;">Guardar Cambios</button>

          <!-- Seguridad del Administrador y Recuperación -->
          <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--border-color);">
            <div style="font-weight:800; font-size:13px; color:var(--primary); margin-bottom:10px;">
              ${icon("lock")} Seguridad de Administrador
            </div>
            <div class="form-group">
              <label>Palabra de Recuperación (por si olvidas la contraseña)</label>
              <div style="display:flex; gap:8px; align-items:center;">
                <input
                  type="text"
                  class="input"
                  id="set-recovery-word"
                  value="${escapeHTML(p.recoveryWord || 'GYMSHARK')}"
                  placeholder="Ej. GYMBROS o tu palabra secreta"
                  style="flex:1;"
                />
                <button type="button" class="btn btn-primary btn-sm" id="btn-save-recovery-word" style="padding:9px 14px;">
                  Confirmar
                </button>
              </div>
              <small style="font-size:11.5px; color:var(--text-secondary);">
                Si algún día olvidas tu contraseña, podrás recuperarla en la ventana de Administrador escribiendo esta palabra.
              </small>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn btn-outline btn-sm" id="btn-open-change-admin-pwd" style="flex:1;">
                ${icon("lock")} Cambiar Contraseña de Admin
              </button>
              <button class="btn btn-outline btn-sm" id="btn-backup-data" style="flex:1;">
                ${icon("download")} Copia de Seguridad
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="card">
          <div class="card-header">
            <div class="card-title">${icon("users")} Usuarios (Admin / Vendedor)</div>
            <button class="btn btn-outline btn-sm" id="btn-new-user">+ Agregar</button>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Rol</th>
                  <th>Acceso / Contraseña</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${db.users
                  .map(
                    u => `
                  <tr>
                    <td>
                      <strong>${escapeHTML(u.name)}</strong>
                      <div style="font-size:11.5px; color:var(--text-secondary);">${escapeHTML(u.email)}</div>
                    </td>
                    <td>
                      <span class="badge ${u.role === 'admin' ? 'badge-success' : 'badge-neutral'}">
                        ${u.role === 'admin' ? 'Administrador' : 'Vendedor'}
                      </span>
                    </td>
                    <td>
                      ${
                        u.role === 'admin'
                          ? `<div style="display:flex; align-items:center; gap:6px;">
                              <span style="font-family:monospace; font-size:12.5px;" id="pwd-mask-${escapeHTML(u.id)}" data-pwd="${escapeHTML(u.pin_or_password || 'Anfitrion')}" data-visible="false">•••••••••</span>
                              <button class="btn btn-outline btn-sm" style="padding:3px 7px;" title="Ver u ocultar contraseña" data-toggle-table-pwd="${escapeHTML(u.id)}">
                                ${icon('eye')}
                              </button>
                            </div>`
                          : `<span style="font-size:12px; color:var(--text-secondary);">Sin contraseña</span>`
                      }
                    </td>
                    <td style="text-align:right; white-space:nowrap;">
                      <button class="btn btn-outline btn-sm" data-edit-usr="${escapeHTML(u.id)}">Editar</button>
                      <button class="btn btn-outline btn-sm" style="color:var(--danger);" data-del-usr="${escapeHTML(u.id)}">✕</button>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">${icon("cloud")} Sincronización en la Nube (Supabase)</div>
            <span class="badge ${db.isCloudConnected() ? 'badge-success' : 'badge-neutral'}">
              ${db.isCloudConnected() ? 'Conectado' : 'Modo Local'}
            </span>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label>Supabase Project URL</label>
              <input type="url" class="input" id="sb-url" placeholder="https://tu-proyecto.supabase.co" value="${escapeHTML(cfg.url)}" />
            </div>
            <div class="form-group">
              <label>Supabase Anon Key</label>
              <input type="password" class="input" id="sb-key" placeholder="Clave pública anon..." value="${escapeHTML(cfg.anonKey)}" />
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn btn-primary btn-sm" id="btn-save-sb">Conectar Nube</button>
              ${
                db.isCloudConnected()
                  ? `<button class="btn btn-success btn-sm" id="btn-push-sb">Subir Datos</button>`
                  : ''
              }
              <button class="btn btn-outline btn-sm" id="btn-copy-sql">Copiar SQL Tablas</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-save-profile')?.addEventListener('click', () => {
    db.saveBusinessProfile({
      businessName: document.getElementById('set-bname').value.trim() || 'GYMSHARK',
      secondaryCurrencySymbol: document.getElementById('set-sym').value.trim() || 'Bs.',
      exchangeRate: Number(document.getElementById('set-rate').value) || 0,
      recoveryWord: (document.getElementById('set-recovery-word')?.value || 'GYMSHARK').trim()
    });
    updateChrome();
    renderCurrentView();
    showToast('Ajustes y palabra de recuperación guardados.');
  });

  const saveRecoveryOnly = () => {
    const word = (document.getElementById('set-recovery-word')?.value || '').trim();
    if (!word) {
      showToast('Escribe una palabra de recuperación.');
      return;
    }
    db.saveBusinessProfile({ recoveryWord: word });
    showToast(`Palabra de recuperación "${word}" confirmada y guardada.`);
  };

  document.getElementById('btn-save-recovery-word')?.addEventListener('click', saveRecoveryOnly);
  document.getElementById('set-recovery-word')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveRecoveryOnly();
    }
  });

  document.getElementById('btn-open-change-admin-pwd')?.addEventListener('click', () => {
    const adminUser = db.users.find(u => u.role === 'admin') || db.users[0];
    openAdminAuthModal(adminUser, 'change');
  });

  document.getElementById('btn-backup-data')?.addEventListener('click', () => {
    exportFullOptimizedBackupCSV();
  });

  document.getElementById('btn-new-user')?.addEventListener('click', () => {
    openUserFormModal(null);
  });

  container.querySelectorAll('[data-edit-usr]').forEach(btn => {
    btn.addEventListener('click', () => {
      const usr = db.users.find(u => u.id === btn.dataset.editUsr);
      if (usr) openUserFormModal(usr);
    });
  });

  container.querySelectorAll('[data-toggle-table-pwd]').forEach(btn => {
    btn.addEventListener('click', () => {
      const uid = btn.dataset.toggleTablePwd;
      const span = document.getElementById(`pwd-mask-${uid}`);
      if (!span) return;
      const isVisible = span.dataset.visible === 'true';
      if (isVisible) {
        span.textContent = '•••••••••';
        span.dataset.visible = 'false';
        btn.innerHTML = icon('eye');
      } else {
        span.textContent = span.dataset.pwd || 'Anfitrion';
        span.dataset.visible = 'true';
        btn.innerHTML = icon('eyeOff');
      }
    });
  });

  container.querySelectorAll('[data-del-usr]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await db.deleteUser(btn.dataset.delUsr);
        updateChrome();
        renderCurrentView();
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  document.getElementById('btn-save-sb')?.addEventListener('click', async () => {
    const res = await db.configureSupabase(
      document.getElementById('sb-url').value,
      document.getElementById('sb-key').value
    );
    updateChrome();
    renderCurrentView();
    showToast(res.message);
  });

  document.getElementById('btn-push-sb')?.addEventListener('click', async () => {
    try {
      await db.syncLocalToCloud();
      showToast('Datos subidos a Supabase.');
    } catch (err) {
      showToast(err.message);
    }
  });

  document.getElementById('btn-copy-sql')?.addEventListener('click', () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    showToast('Código SQL copiado al portapapeles.');
  });
}

function openUserFormModal(user = null) {
  const isEdit = Boolean(user);
  const u = user || {
    name: '',
    email: '',
    role: 'vendedor',
    pin_or_password: 'Anfitrion'
  };

  openModal({
    title: isEdit ? `Editar Usuario: ${u.name}` : 'Nuevo Usuario',
    bodyHTML: `
      <div class="form-group">
        <label>Nombre *</label>
        <input type="text" class="input" id="usr-name" value="${escapeHTML(u.name)}" placeholder="Ej. Ana" />
      </div>
      <div class="form-group">
        <label>Correo / Identificador</label>
        <input type="email" class="input" id="usr-email" value="${escapeHTML(u.email)}" placeholder="ana@tienda.com" />
      </div>
      <div class="form-group">
        <label>Rol en la Tienda *</label>
        <select class="select" id="usr-role">
          <option value="vendedor" ${u.role === 'vendedor' ? 'selected' : ''}>Vendedor (Entra sin contraseña · Ve resumen sin ganancias, vende y ve stock)</option>
          <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Administrador (Requiere contraseña · Acceso total)</option>
        </select>
      </div>

      <div class="form-group" id="usr-pwd-group" style="${u.role === 'admin' ? '' : 'display:none;'}">
        <label>Contraseña de Administrador *</label>
        <div style="display:flex; gap:8px; align-items:center;">
          <input
            type="password"
            class="input"
            id="usr-pwd"
            value="${escapeHTML(u.role === 'admin' ? (u.pin_or_password || 'Anfitrion') : 'Anfitrion')}"
            style="flex:1;"
          />
          <button type="button" class="btn btn-outline" id="usr-toggle-pwd" title="Mostrar u ocultar contraseña">
            ${icon('eye')} <span id="usr-toggle-pwd-text">Ver</span>
          </button>
        </div>
      </div>

      <div id="usr-vendor-note" style="${u.role === 'vendedor' ? '' : 'display:none;'} font-size:12.5px; color:var(--text-secondary); background:var(--bg-oat-soft); padding:10px 12px; border-radius:8px;">
        Los usuarios con rol <strong>Vendedor</strong> ingresan directamente sin contraseña.
      </div>
    `,
    footerHTML: `
      <button class="btn btn-outline" id="usr-cancel">Cancelar</button>
      <button class="btn btn-primary" id="usr-save">Guardar Usuario</button>
    `
  });

  const roleSelect = document.getElementById('usr-role');
  const pwdGroup = document.getElementById('usr-pwd-group');
  const vendorNote = document.getElementById('usr-vendor-note');
  const pwdInput = document.getElementById('usr-pwd');
  const toggleBtn = document.getElementById('usr-toggle-pwd');

  roleSelect?.addEventListener('change', e => {
    const isAdm = e.target.value === 'admin';
    if (pwdGroup) pwdGroup.style.display = isAdm ? '' : 'none';
    if (vendorNote) vendorNote.style.display = isAdm ? 'none' : '';
  });

  toggleBtn?.addEventListener('click', () => {
    if (!pwdInput) return;
    const isHidden = pwdInput.type === 'password';
    pwdInput.type = isHidden ? 'text' : 'password';
    toggleBtn.innerHTML = `${icon(isHidden ? 'eyeOff' : 'eye')} <span>${isHidden ? 'Ocultar' : 'Ver'}</span>`;
  });

  document.getElementById('usr-cancel')?.addEventListener('click', closeModal);
  document.getElementById('usr-save')?.addEventListener('click', async () => {
    const name = document.getElementById('usr-name').value.trim();
    const email = document.getElementById('usr-email').value.trim();
    const role = document.getElementById('usr-role').value;
    const pwd = document.getElementById('usr-pwd')?.value.trim() || 'Anfitrion';
    if (!name) {
      showToast('Escribe el nombre del usuario.');
      return;
    }
    await db.saveUser({
      id: user ? user.id : null,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@tienda.com`,
      role,
      pin_or_password: role === 'admin' ? pwd : ''
    });
    closeModal();
    updateChrome();
    renderCurrentView();
    showToast(isEdit ? 'Usuario actualizado.' : 'Usuario agregado.');
  });
}

function openAdminAuthModal(targetAdminUser, initialMode = 'login') {
  let mode = initialMode; // 'login' | 'change' | 'recover'

  const renderAuthView = () => {
    if (mode === 'login') {
      openModal({
        title: 'Ventana de Administrador',
        maxWidth: '440px',
        bodyHTML: `
          <div style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;">
            Ingresa la contraseña para entrar como <strong>${escapeHTML(targetAdminUser.name)}</strong>:
          </div>
          <div class="form-group" style="margin-bottom:10px;">
            <label>Contraseña de Administrador</label>
            <div style="display:flex; gap:8px; align-items:center;">
              <input
                type="password"
                class="input"
                id="auth-admin-pwd"
                placeholder="Escribe la contraseña..."
                style="flex:1;"
              />
              <button type="button" class="btn btn-outline" id="auth-toggle-pwd" title="Ver u ocultar contraseña">
                ${icon('eye')} <span>Ver</span>
              </button>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; padding-top:8px; border-top:1px solid var(--border-color); font-size:12.5px;">
            <button type="button" class="btn btn-outline btn-sm" id="auth-go-change">
              Cambiar contraseña
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="auth-go-recover" style="color:var(--primary);">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        `,
        footerHTML: `
          <button class="btn btn-outline" id="auth-admin-cancel">Cancelar</button>
          <button class="btn btn-primary" id="auth-admin-submit">Entrar</button>
        `
      });

      const pwdInput = document.getElementById('auth-admin-pwd');
      const toggleBtn = document.getElementById('auth-toggle-pwd');
      setTimeout(() => pwdInput?.focus(), 40);

      toggleBtn?.addEventListener('click', () => {
        if (!pwdInput) return;
        const isHidden = pwdInput.type === 'password';
        pwdInput.type = isHidden ? 'text' : 'password';
        toggleBtn.innerHTML = `${icon(isHidden ? 'eyeOff' : 'eye')} <span>${isHidden ? 'Ocultar' : 'Ver'}</span>`;
        pwdInput.focus();
      });

      const tryLogin = () => {
        const entered = (pwdInput?.value || '').trim();
        const expected = targetAdminUser.pin_or_password || 'Anfitrion';
        if (entered === expected) {
          db.switchUserById(targetAdminUser.id);
          closeModal();
          updateChrome();
          renderCurrentView();
          showToast(`Sesión iniciada como ${targetAdminUser.name}`);
        } else {
          showToast('Contraseña incorrecta.');
          pwdInput?.focus();
        }
      };

      pwdInput?.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          tryLogin();
        }
      });

      document.getElementById('auth-go-change')?.addEventListener('click', () => {
        mode = 'change';
        renderAuthView();
      });
      document.getElementById('auth-go-recover')?.addEventListener('click', () => {
        mode = 'recover';
        renderAuthView();
      });
      document.getElementById('auth-admin-cancel')?.addEventListener('click', () => {
        closeModal();
        updateChrome();
      });
      document.getElementById('auth-admin-submit')?.addEventListener('click', tryLogin);
    } else if (mode === 'change') {
      openModal({
        title: 'Cambiar Contraseña de Administrador',
        maxWidth: '440px',
        bodyHTML: `
          <div class="form-group">
            <label>Contraseña Actual *</label>
            <div style="display:flex; gap:8px; align-items:center;">
              <input type="password" class="input" id="chg-old-pwd" placeholder="Contraseña actual..." style="flex:1;" />
              <button type="button" class="btn btn-outline" id="chg-toggle-old">
                ${icon('eye')} <span>Ver</span>
              </button>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:10px;">
            <label>Nueva Contraseña *</label>
            <div style="display:flex; gap:8px; align-items:center;">
              <input type="password" class="input" id="chg-new-pwd" placeholder="Escribe la nueva contraseña..." style="flex:1;" />
              <button type="button" class="btn btn-outline" id="chg-toggle-new">
                ${icon('eye')} <span>Ver</span>
              </button>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; padding-top:8px; border-top:1px solid var(--border-color);">
            <button type="button" class="btn btn-outline btn-sm" id="chg-back-login">← Volver</button>
            <button type="button" class="btn btn-outline btn-sm" id="chg-go-recover">¿Olvidaste la actual?</button>
          </div>
        `,
        footerHTML: `
          <button class="btn btn-outline" id="chg-cancel">Cancelar</button>
          <button class="btn btn-primary" id="chg-save">Guardar Nueva Contraseña</button>
        `
      });

      const bindEye = (inputId, btnId) => {
        const inp = document.getElementById(inputId);
        const btn = document.getElementById(btnId);
        btn?.addEventListener('click', () => {
          if (!inp) return;
          const isHidden = inp.type === 'password';
          inp.type = isHidden ? 'text' : 'password';
          btn.innerHTML = `${icon(isHidden ? 'eyeOff' : 'eye')} <span>${isHidden ? 'Ocultar' : 'Ver'}</span>`;
        });
      };
      bindEye('chg-old-pwd', 'chg-toggle-old');
      bindEye('chg-new-pwd', 'chg-toggle-new');

      document.getElementById('chg-back-login')?.addEventListener('click', () => {
        mode = 'login';
        renderAuthView();
      });
      document.getElementById('chg-go-recover')?.addEventListener('click', () => {
        mode = 'recover';
        renderAuthView();
      });
      document.getElementById('chg-cancel')?.addEventListener('click', () => {
        closeModal();
        updateChrome();
      });
      document.getElementById('chg-save')?.addEventListener('click', async () => {
        const oldVal = (document.getElementById('chg-old-pwd')?.value || '').trim();
        const newVal = (document.getElementById('chg-new-pwd')?.value || '').trim();
        const expected = targetAdminUser.pin_or_password || 'Anfitrion';
        if (oldVal !== expected) {
          showToast('La contraseña actual no coincide. Si la olvidaste usa "¿Olvidaste la actual?".');
          return;
        }
        if (!newVal) {
          showToast('Escribe la nueva contraseña.');
          return;
        }
        await db.saveUser({
          ...targetAdminUser,
          pin_or_password: newVal
        });
        db.switchUserById(targetAdminUser.id);
        closeModal();
        updateChrome();
        renderCurrentView();
        showToast('Contraseña de Administrador actualizada.');
      });
    } else if (mode === 'recover') {
      const hintName = (db.profile?.businessName || 'GYMSHARK').toUpperCase();
      openModal({
        title: 'Recuperar / Restablecer Contraseña',
        maxWidth: '450px',
        bodyHTML: `
          <div style="font-size:12.5px; color:var(--text-secondary); background:var(--bg-oat-soft); padding:10px 12px; border-radius:8px; margin-bottom:12px;">
            Por si olvidaste tu clave: escribe el <strong>Nombre de tu Tienda (${escapeHTML(hintName)})</strong> o tu <strong>Palabra de Recuperación</strong> para ver o restablecer tu contraseña.
          </div>

          <div class="form-group">
            <label>Palabra de Recuperación o Nombre de la Tienda *</label>
            <input type="text" class="input" id="rec-word-input" placeholder="Ej. ${escapeHTML(hintName)}" />
          </div>

          <div class="form-group" style="margin-bottom:10px;">
            <label>Nueva Contraseña a Asignar *</label>
            <div style="display:flex; gap:8px; align-items:center;">
              <input type="text" class="input" id="rec-new-pwd" value="Anfitrion" style="flex:1;" />
              <button type="button" class="btn btn-outline" id="rec-toggle-pwd">
                ${icon('eyeOff')} <span>Ocultar</span>
              </button>
            </div>
          </div>

          <div style="padding-top:8px; border-top:1px solid var(--border-color);">
            <button type="button" class="btn btn-outline btn-sm" id="rec-back-login">← Volver al inicio</button>
          </div>
        `,
        footerHTML: `
          <button class="btn btn-outline" id="rec-cancel">Cancelar</button>
          <button class="btn btn-primary" id="rec-submit">Restablecer y Entrar</button>
        `
      });

      const recPwdInp = document.getElementById('rec-new-pwd');
      const recToggleBtn = document.getElementById('rec-toggle-pwd');
      recToggleBtn?.addEventListener('click', () => {
        if (!recPwdInp) return;
        const isHidden = recPwdInp.type === 'password';
        recPwdInp.type = isHidden ? 'text' : 'password';
        recToggleBtn.innerHTML = `${icon(isHidden ? 'eyeOff' : 'eye')} <span>${isHidden ? 'Ocultar' : 'Ver'}</span>`;
      });

      document.getElementById('rec-back-login')?.addEventListener('click', () => {
        mode = 'login';
        renderAuthView();
      });
      document.getElementById('rec-cancel')?.addEventListener('click', () => {
        closeModal();
        updateChrome();
      });
      document.getElementById('rec-submit')?.addEventListener('click', async () => {
        const enteredWord = (document.getElementById('rec-word-input')?.value || '').trim().toLowerCase();
        const validWords = [
          (db.profile?.recoveryWord || 'GYMSHARK').trim().toLowerCase(),
          (db.profile?.businessName || 'GYMSHARK').trim().toLowerCase(),
          'gymshark',
          'anfitrion'
        ];
        if (!enteredWord || !validWords.includes(enteredWord)) {
          showToast(`Palabra incorrecta. Escribe "${hintName}" para recuperar el acceso.`);
          return;
        }
        const newPwd = (recPwdInp?.value || 'Anfitrion').trim() || 'Anfitrion';
        await db.saveUser({
          ...targetAdminUser,
          pin_or_password: newPwd
        });
        db.switchUserById(targetAdminUser.id);
        closeModal();
        updateChrome();
        renderCurrentView();
        showToast(`Contraseña restablecida a "${newPwd}".`);
      });
    }
  };

  renderAuthView();
}

// ============================================================================
// EXPORTACIONES CSV (INCLUYE LOTE Y FECHA DE ÚLTIMO RESTOCK)
// ============================================================================
function exportInventoryToCSV() {
  const headers = [
    'SKU',
    'Nombre',
    'Categoria',
    'Lote',
    'Fecha_Ultimo_Restock',
    'Tallas_Desglose',
    'Stock_Actual',
    'Stock_Minimo',
    'Costo_Compra_USD',
    'Costo_Envio_USD',
    'Costo_Real_Total_USD',
    'Precio_Venta_USD',
    'Ganancia_Por_Prenda_USD'
  ];
  const rows = db.products.map(p => {
    const availSizes = getAvailableSizesList(p)
      .map(s => `${s.size}:${s.qty}`)
      .join(' | ');
    return [
      p.sku,
      p.name,
      p.category,
      p.batch_code || 'LOTE-01',
      fmtShortDate(p.last_restock_at),
      availSizes || '-',
      p.item_type === 'service' ? 0 : p.stock,
      p.min_stock,
      (p.purchase_cost ?? p.unit_cost).toFixed(2),
      (p.shipping_cost || 0).toFixed(2),
      p.unit_cost.toFixed(2),
      p.sale_price.toFixed(2),
      (p.sale_price - p.unit_cost).toFixed(2)
    ];
  });
  downloadCSV(`inventario_lotes_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  showToast('Inventario con tallas, costos y lotes descargado.');
}

function exportSalesToCSV() {
  const headers = ['Recibo', 'Fecha', 'Cliente', 'Pago', 'Total_USD', 'Costo_USD', 'Ganancia_USD', 'Estado'];
  const rows = db.sales.map(s => [
    s.receipt_number,
    s.date,
    s.customer_name,
    s.payment_method,
    s.total.toFixed(2),
    s.total_cost.toFixed(2),
    s.profit.toFixed(2),
    s.status
  ]);
  downloadCSV(`ventas_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  showToast('Reporte de ventas descargado.');
}

function exportCostsToCSV() {
  const headers = ['Tipo', 'Fecha', 'Lote_o_Categoria', 'Concepto', 'Monto_USD'];
  const rows = [
    ...db.purchases.map(p => ['RESTOCK_LOTE', p.date, p.batch_code || 'LOTE-01', `${p.quantity}x ${p.product_name}${p.sizes_summary ? ` (${p.sizes_summary})` : ''}`, p.total_cost.toFixed(2)]),
    ...db.expenses.map(e => ['GASTO', e.date, e.category, e.description, e.amount.toFixed(2)])
  ];
  downloadCSV(`lotes_y_gastos_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  showToast('Reporte de lotes y gastos descargado.');
}

function exportFullOptimizedBackupCSV() {
  const bName = (db.profile?.businessName || 'GYMBROS').toUpperCase();
  const dateStr = new Date().toISOString().slice(0, 10);
  const completedSales = db.sales.filter(s => s.status === 'completada');
  const pendingSales = db.sales.filter(s => s.status === 'pendiente');
  const physicalProducts = db.products.filter(p => p.item_type !== 'service');

  const totalRevenue = completedSales.reduce((a, s) => a + Number(s.total), 0);
  const totalCOGS = completedSales.reduce((a, s) => a + Number(s.total_cost), 0);
  const totalExpenses = db.expenses.reduce((a, e) => a + Number(e.amount), 0);
  const totalBatchesSpent = (db.batches || []).reduce((a, b) => a + Number(b.total_cost), 0);
  const invCostVal = physicalProducts.reduce((a, p) => a + Math.max(0, Number(p.stock)) * Number(p.unit_cost), 0);
  const invSaleVal = physicalProducts.reduce((a, p) => a + Math.max(0, Number(p.stock)) * Number(p.sale_price), 0);
  const netProfit = totalRevenue - totalCOGS - totalExpenses;

  const headers = [
    'SECCION',
    'CODIGO / RECIBO',
    'FECHA / ESTADO',
    'NOMBRE / CLIENTE / CONCEPTO',
    'CATEGORIA / PAGO / PROVEEDOR',
    'TALLAS / DETALLE / REF',
    'CANTIDAD / STOCK',
    'COSTO COMPRA + ENVIO ($)',
    'PRECIO VENTA / MONTO ($)',
    'GANANCIA / TOTAL ($)'
  ];

  const rows = [];

  // 1. RESUMEN GENERAL
  rows.push(['=== 1. RESUMEN FINANCIERO ===', bName, fmtShortDate(new Date().toISOString()), `Tasa configurada: 1 USD = ${db.profile?.exchangeRate || 0} ${db.profile?.secondaryCurrencySymbol || 'Bs.'}`, '-', '-', '-', '-', '-', '-']);
  rows.push(['RESUMEN', 'VENTAS COBRADAS', `${completedSales.length} ventas`, 'Ingresos por ventas completadas', '-', `Pendientes por cobrar: ${pendingSales.length}`, '-', `Costo prendas: $${totalCOGS.toFixed(2)}`, `Ventas: $${totalRevenue.toFixed(2)}`, `Ganancia Neta: $${netProfit.toFixed(2)}`]);
  rows.push(['RESUMEN', 'CAPITAL EN INVENTARIO', `${physicalProducts.length} referencias`, 'Valor actual de la mercancía en stock', '-', '-', `${physicalProducts.reduce((a, p) => a + Math.max(0, Number(p.stock)), 0)} prendas`, `Costo inv.: $${invCostVal.toFixed(2)}`, `Venta proyectada: $${invSaleVal.toFixed(2)}`, `Ganancia proyectada: $${(invSaleVal - invCostVal).toFixed(2)}`]);
  rows.push(['RESUMEN', 'LOTES Y GASTOS', `${(db.batches || []).length} lotes / ${db.expenses.length} gastos`, 'Inversión en lotes y gastos operativos', '-', '-', '-', `Inversión Lotes: $${totalBatchesSpent.toFixed(2)}`, `Gastos Tienda: $${totalExpenses.toFixed(2)}`, '-']);
  rows.push(['', '', '', '', '', '', '', '', '', '']);

  // 2. INVENTARIO DE PRENDAS Y TALLAS
  rows.push(['=== 2. INVENTARIO Y TALLAS ===', 'SKU', 'LOTE / LLEGADA', 'PRENDA', 'CATEGORIA', 'TALLAS DISPONIBLES', 'STOCK TOTAL', 'COSTO (COMPRA + ENVIO)', 'PRECIO VENTA ($)', 'GANANCIA C/U Y LOTE ($)']);
  db.products.forEach(p => {
    const availSizes = getAvailableSizesList(p)
      .map(s => `${s.size}:${s.qty}`)
      .join(' | ');
    const unitProf = Number(p.sale_price) - Number(p.unit_cost);
    const totalProf = Math.max(0, Number(p.stock)) * unitProf;
    rows.push([
      'INVENTARIO',
      p.sku,
      `${p.batch_code || 'LOTE-01'} (${fmtShortDate(p.last_restock_at)})`,
      p.name,
      p.category,
      availSizes || 'Sin stock',
      `${p.stock} und (Mín: ${p.min_stock})`,
      `$${Number(p.unit_cost).toFixed(2)} (Compra $${Number(p.purchase_cost ?? p.unit_cost).toFixed(2)} + Envío $${Number(p.shipping_cost || 0).toFixed(2)})`,
      `$${Number(p.sale_price).toFixed(2)}`,
      `+$${unitProf.toFixed(2)} c/u (Lote: +$${totalProf.toFixed(2)})`
    ]);
  });
  rows.push(['', '', '', '', '', '', '', '', '', '']);

  // 3. VENTAS (COMPLETADAS Y PENDIENTES)
  rows.push(['=== 3. HISTORIAL DE VENTAS ===', 'RECIBO', 'FECHA / ESTADO', 'CLIENTE', 'METODO DE PAGO', 'PRENDAS, TALLAS Y REFERENCIA', 'CANT. PRENDAS', 'COSTO VENTA ($)', 'TOTAL COBRADO ($ / Bs.)', 'GANANCIA LIBRE ($)']);
  db.sales.forEach(s => {
    const itemsDesc = (s.items || [])
      .map(i => `${i.quantity}x ${i.name}${i.selected_size ? ` [Talla ${i.selected_size}]` : ''}`)
      .join(' + ');
    const totalQty = (s.items || []).reduce((a, i) => a + Number(i.quantity), 0);
    const refPart = s.payment_reference ? ` | Ref: ${s.payment_reference}` : '';
    const rate = Number(s.exchange_rate) || 0;
    const sym = s.secondary_currency || 'Bs.';
    const bsPart = isBsPaymentMethod(s.payment_method) && rate > 0
      ? ` (${fmtSecondary(s.total, rate, sym)} @ Tasa ${rate} ${sym}/$)`
      : '';

    rows.push([
      'VENTA',
      s.receipt_number,
      `${fmtShortDate(s.date)} [${(s.status || 'completada').toUpperCase()}]`,
      s.customer_name,
      s.payment_method,
      `${itemsDesc}${refPart}`,
      `${totalQty} und`,
      `$${Number(s.total_cost).toFixed(2)}`,
      `$${Number(s.total).toFixed(2)}${bsPart}`,
      `+$${Number(s.profit).toFixed(2)}`
    ]);
  });
  rows.push(['', '', '', '', '', '', '', '', '', '']);

  // 4. CONTROL DE LOTES Y CARGAMENTOS
  rows.push(['=== 4. LOTES DE CARGAMENTO ===', 'CODIGO LOTE', 'ESTATUS / FECHAS', 'DESCRIPCION DEL LOTE', 'PROVEEDOR / COURIER', 'NOTAS / TRACKING', 'PRENDAS EN LOTE', 'COMPRA + ENVIO ($)', 'COSTO PROMEDIO C/U ($)', 'GASTO TOTAL LOTE ($)']);
  (db.batches || []).forEach(b => {
    const avg = b.items_count > 0 ? (Number(b.total_cost) / Number(b.items_count)).toFixed(2) : '0.00';
    const datesInfo = [
      `Comprado: ${fmtShortDate(b.purchased_date)}`,
      b.in_transit_date ? `En Vía: ${fmtShortDate(b.in_transit_date)}` : null,
      b.arrived_date ? `Llegó: ${fmtShortDate(b.arrived_date)}` : null
    ].filter(Boolean).join(' -> ');

    rows.push([
      'LOTE',
      b.batch_code,
      `[${(b.status || 'adquirido').toUpperCase()}] ${datesInfo}`,
      b.description,
      b.supplier,
      b.notes || '-',
      `${b.items_count} prendas`,
      `Compra $${Number(b.purchase_amount).toFixed(2)} + Envío $${Number(b.shipping_amount).toFixed(2)}`,
      `$${avg} c/u`,
      `$${Number(b.total_cost).toFixed(2)}`
    ]);
  });
  rows.push(['', '', '', '', '', '', '', '', '', '']);

  // 5. COSTOS: ENTRADAS DE RESTOCK Y GASTOS OPERATIVOS
  rows.push(['=== 5. GASTOS Y RESTOCK ===', 'ID / LOTE', 'FECHA', 'CONCEPTO / PRENDA', 'CATEGORIA / PROVEEDOR', 'DETALLE TALLAS / NOTAS', 'CANTIDAD', 'COSTO UNITARIO ($)', 'MONTO TOTAL ($)', 'REGISTRADO POR']);
  db.purchases.forEach(pur => {
    rows.push([
      'RESTOCK',
      pur.batch_code || 'LOTE-01',
      fmtShortDate(pur.date),
      pur.product_name,
      pur.supplier,
      pur.sizes_summary || 'Restock general',
      `+${pur.quantity} und`,
      `$${Number(pur.unit_cost).toFixed(2)} (Compra $${Number(pur.purchase_cost ?? pur.unit_cost).toFixed(2)} + Envío $${Number(pur.shipping_cost || 0).toFixed(2)})`,
      `$${Number(pur.total_cost).toFixed(2)}`,
      pur.registered_by || 'Administrador'
    ]);
  });
  db.expenses.forEach(exp => {
    rows.push([
      'GASTO TIENDA',
      exp.id,
      fmtShortDate(exp.date),
      exp.description,
      exp.category,
      exp.payment_method || '-',
      '1',
      `$${Number(exp.amount).toFixed(2)}`,
      `$${Number(exp.amount).toFixed(2)}`,
      exp.registered_by || 'Administrador'
    ]);
  });

  downloadCSV(`copia_seguridad_${bName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${dateStr}.csv`, headers, rows);
  showToast('Copia de seguridad completa (Inventario, Ventas, Lotes y Costos) descargada.');
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================
function initApp() {
  document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.view));
  });

  document.getElementById('brand-header-btn')?.addEventListener('click', () => {
    if (isAdmin()) navigateTo('settings');
  });

  document.getElementById('quick-user-switcher')?.addEventListener('change', e => {
    const targetId = e.target.value;
    const targetUser = db.users.find(u => u.id === targetId);
    if (!targetUser) return;

    if (targetUser.role === 'vendedor') {
      // Vendedores entran sin contraseña
      db.switchUserById(targetUser.id);
      updateChrome();
      renderCurrentView();
      showToast(`Vista activa: ${targetUser.name} (Vendedor)`);
    } else {
      // Administrador pide contraseña (por defecto: Anfitrion)
      updateChrome(); // Mantiene la selección visual actual hasta que ingrese la clave
      openAdminAuthModal(targetUser);
    }
  });

  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('app-modal')?.addEventListener('click', e => {
    if (e.target.id === 'app-modal') closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  if (db.isCloudConnected()) {
    syncFromCloudLive(false);
  }

  // En iPhone / Android al volver a abrir la app desde pantalla de inicio, sincronizar automáticamente
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncFromCloudLive(false);
    }
  });
  window.addEventListener('focus', () => {
    if (Date.now() - lastCloudPullAt > 6000) {
      syncFromCloudLive(false);
    }
  });
  window.addEventListener('online', () => {
    showToast('Conexión restaurada. Sincronizando con la nube...');
    syncFromCloudLive(false);
  });
  window.addEventListener('offline', () => {
    showToast('Sin conexión a internet. Los cambios no se sincronizarán hasta reconectar.');
  });

  // Auto-sincronización cada 20 segundos si la app está abierta y con internet
  setInterval(() => {
    if (document.visibilityState === 'visible' && navigator.onLine !== false) {
      const modalEl = document.getElementById('app-modal');
      const isModalOpen = modalEl && !modalEl.classList.contains('hidden');
      if (!isModalOpen && state.posCart.length === 0) {
        syncFromCloudLive(false);
      }
    }
  }, 20000);

  updateChrome();
  renderCurrentView();
}

document.addEventListener('DOMContentLoaded', initApp);
