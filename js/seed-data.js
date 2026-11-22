// ============================================================================
// INVENTARIOPRO - BOUTIQUE Y VENTA DE ROPA (CATEGORÍAS, LOTES, FOTOS Y PRENDAS)
// ============================================================================

const now = new Date();
const daysAgo = (d, hoursOffset = 0) => {
  const dt = new Date(now.getTime() - d * 86400000 - hoursOffset * 3600000);
  return dt.toISOString();
};

// Generador de imagen de referencia minimalista en línea con la estética de la marca
function makeGarmentImg(kind, subtitle, bg = '#E6DAC8', fg = '#4A1C21') {
  const paths = {
    blouse: `<path d="M9 4c1.5 1.5 4.5 1.5 6 0l4 3-2 4-2-1v10H9V10l-2 1-2-4 4-3z" fill="none" stroke="${fg}" stroke-width="1.6" stroke-linejoin="round"/>`,
    dress: `<path d="M9.5 4h5l1.5 5 3 11H5l3-11 1.5-5zM9 9h6" fill="none" stroke="${fg}" stroke-width="1.6" stroke-linejoin="round"/>`,
    pants: `<path d="M7 4h10l1 16h-4.5L12 10l-1.5 10H6L7 4z" fill="none" stroke="${fg}" stroke-width="1.6" stroke-linejoin="round"/>`,
    shirt: `<path d="M8 4h8l4 4-2.5 3-1.5-1.5V20H8V9.5L6.5 11 4 8l4-4zM12 4v16" fill="none" stroke="${fg}" stroke-width="1.6" stroke-linejoin="round"/>`,
    bag: `<rect x="5" y="8" width="14" height="12" rx="2" fill="none" stroke="${fg}" stroke-width="1.6"/><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="${fg}" stroke-width="1.6"/>`,
    belt: `<rect x="3" y="10" width="18" height="4" rx="1" fill="none" stroke="${fg}" stroke-width="1.6"/><rect x="10" y="9" width="4" height="6" rx="1" fill="${bg}" stroke="${fg}" stroke-width="1.6"/>`,
    hanger: `<path d="M12 5a2 2 0 0 1 2 2c0 1.1-.9 2-2 2v1.5l8 5.5v1.5H4V16l8-5.5V9" fill="none" stroke="${fg}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`
  };
  const iconSvg = paths[kind] || paths.hanger;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">
    <rect width="320" height="240" rx="16" fill="${bg}"/>
    <circle cx="160" cy="98" r="46" fill="#FAF8F4" opacity="0.9"/>
    <g transform="translate(133, 71) scale(2.25)">${iconSvg}</g>
    <text x="160" y="188" font-family="Montserrat, sans-serif" font-size="13" font-weight="700" letter-spacing="1" fill="${fg}" text-anchor="middle">${subtitle.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_BUSINESS_PROFILE = {
  businessName: 'GYMSHARK',
  industryPreset: 'clothing',
  primaryCurrency: 'USD',
  secondaryCurrencySymbol: 'Bs.',
  exchangeRate: 0,
  taxPercent: 0,
  units: ['und'],
  suggestedCategories: [
    'Mujer',
    'Hombre',
    'Accesorios',
    'Calzado',
    'Conjuntos',
    'Ofertas'
  ]
};

export const BUSINESS_PRESETS = {
  clothing: {
    id: 'clothing',
    icon: '👗',
    name: 'Tienda de Ropa, Calzado y Accesorios',
    description: 'Categorías listas para Mujer, Hombre, Accesorios, Calzado y control de cargamentos por Lote.',
    categories: ['Mujer', 'Hombre', 'Accesorios', 'Calzado', 'Conjuntos', 'Ofertas'],
    units: ['und']
  },
  general: {
    id: 'general',
    icon: '🏪',
    name: 'Comercio General / Multirubro',
    description: 'Para distribuidoras y tiendas de múltiples categorías.',
    categories: ['General', 'Destacados', 'Accesorios', 'Ofertas'],
    units: ['und']
  },
  beauty: {
    id: 'beauty',
    icon: '💄',
    name: 'Cosméticos y Cuidado Personal',
    description: 'Maquillaje, perfumería, skincare y accesorios.',
    categories: ['Maquillaje', 'Skincare', 'Perfumería', 'Accesorios'],
    units: ['und']
  }
};

export const INITIAL_USERS = [
  {
    id: 'usr-admin-1',
    name: 'Administración',
    email: 'admin@boutique.com',
    role: 'admin',
    pin_or_password: 'Anfitrion',
    active: true,
    created_at: daysAgo(30)
  },
  {
    id: 'usr-vend-1',
    name: 'Vendedor Tienda',
    email: 'ventas@boutique.com',
    role: 'vendedor',
    pin_or_password: '',
    active: true,
    created_at: daysAgo(25)
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-201',
    sku: 'MUJ-BLU-01',
    name: 'Blusa Lino Beige Corte Editorial',
    category: 'Mujer',
    item_type: 'product',
    image_url: makeGarmentImg('blouse', 'Blusa Lino Beige', '#E6DAC8', '#4A1C21'),
    batch_code: 'LOTE-NOV-03',
    last_restock_at: daysAgo(2),
    stock: 14,
    min_stock: 4,
    purchase_cost: 10.00,
    shipping_cost: 2.00,
    unit_cost: 12.00,
    sale_price: 28.00,
    unit: 'und',
    updated_at: daysAgo(2)
  },
  {
    id: 'prod-202',
    sku: 'MUJ-VES-02',
    name: 'Vestido Midi Satinado Vino',
    category: 'Mujer',
    item_type: 'product',
    image_url: makeGarmentImg('dress', 'Vestido Midi Vino', '#DFC9C7', '#4A1C21'),
    batch_code: 'LOTE-NOV-03',
    last_restock_at: daysAgo(2),
    stock: 3,
    min_stock: 5,
    purchase_cost: 16.00,
    shipping_cost: 2.50,
    unit_cost: 18.50,
    sale_price: 42.00,
    unit: 'und',
    updated_at: daysAgo(2)
  },
  {
    id: 'prod-203',
    sku: 'MUJ-JEA-03',
    name: 'Jean Wide Leg Tiro Alto Denim',
    category: 'Mujer',
    item_type: 'product',
    image_url: makeGarmentImg('pants', 'Jean Wide Leg', '#D8D4C5', '#4A1C21'),
    batch_code: 'LOTE-NOV-02',
    last_restock_at: daysAgo(8),
    stock: 10,
    min_stock: 4,
    purchase_cost: 13.00,
    shipping_cost: 3.00,
    unit_cost: 16.00,
    sale_price: 36.00,
    unit: 'und',
    updated_at: daysAgo(8)
  },
  {
    id: 'prod-204',
    sku: 'HOM-CAM-01',
    name: 'Camisa Oxford Manga Larga Oliva',
    category: 'Hombre',
    item_type: 'product',
    image_url: makeGarmentImg('shirt', 'Camisa Oxford Oliva', '#DFE0CF', '#4A1C21'),
    batch_code: 'LOTE-NOV-03',
    last_restock_at: daysAgo(2),
    stock: 12,
    min_stock: 4,
    purchase_cost: 12.00,
    shipping_cost: 2.00,
    unit_cost: 14.00,
    sale_price: 32.00,
    unit: 'und',
    updated_at: daysAgo(2)
  },
  {
    id: 'prod-205',
    sku: 'HOM-PAN-02',
    name: 'Pantalón Chino Slim Fit Arena',
    category: 'Hombre',
    item_type: 'product',
    image_url: makeGarmentImg('pants', 'Pantalón Chino Arena', '#E6DAC8', '#4A1C21'),
    batch_code: 'LOTE-NOV-02',
    last_restock_at: daysAgo(8),
    stock: 2,
    min_stock: 5,
    purchase_cost: 14.50,
    shipping_cost: 2.50,
    unit_cost: 17.00,
    sale_price: 38.00,
    unit: 'und',
    updated_at: daysAgo(8)
  },
  {
    id: 'prod-206',
    sku: 'HOM-FRA-03',
    name: 'Franela Básica Algodón Pima',
    category: 'Hombre',
    item_type: 'product',
    image_url: makeGarmentImg('blouse', 'Franela Algodón Pima', '#EDE5D7', '#4A1C21'),
    batch_code: 'LOTE-NOV-01',
    last_restock_at: daysAgo(16),
    stock: 20,
    min_stock: 6,
    purchase_cost: 6.00,
    shipping_cost: 1.50,
    unit_cost: 7.50,
    sale_price: 18.00,
    unit: 'und',
    updated_at: daysAgo(16)
  },
  {
    id: 'prod-207',
    sku: 'ACC-BOL-01',
    name: 'Cartera Bandolera Cuero Vegano',
    category: 'Accesorios',
    item_type: 'product',
    image_url: makeGarmentImg('bag', 'Cartera Bandolera', '#DECBB6', '#4A1C21'),
    batch_code: 'LOTE-NOV-02',
    last_restock_at: daysAgo(8),
    stock: 7,
    min_stock: 3,
    purchase_cost: 12.50,
    shipping_cost: 2.50,
    unit_cost: 15.00,
    sale_price: 35.00,
    unit: 'und',
    updated_at: daysAgo(8)
  },
  {
    id: 'prod-208',
    sku: 'ACC-CIN-02',
    name: 'Cinturón Hebilla Dorada Clásico',
    category: 'Accesorios',
    item_type: 'product',
    image_url: makeGarmentImg('belt', 'Cinturón Clásico', '#E6DAC8', '#4A1C21'),
    batch_code: 'LOTE-OCT-01',
    last_restock_at: daysAgo(25),
    stock: 0,
    min_stock: 5,
    purchase_cost: 4.00,
    shipping_cost: 1.00,
    unit_cost: 5.00,
    sale_price: 14.00,
    unit: 'und',
    updated_at: daysAgo(25)
  },
  {
    id: 'prod-209',
    sku: 'CON-SET-01',
    name: 'Conjunto Sastre Chaleco y Pantalón',
    category: 'Conjuntos',
    item_type: 'product',
    image_url: makeGarmentImg('hanger', 'Conjunto Sastre', '#D6C6B2', '#4A1C21'),
    batch_code: 'LOTE-NOV-03',
    last_restock_at: daysAgo(2),
    stock: 6,
    min_stock: 3,
    purchase_cost: 20.50,
    shipping_cost: 3.50,
    unit_cost: 24.00,
    sale_price: 55.00,
    unit: 'und',
    updated_at: daysAgo(2)
  }
];

export const INITIAL_SALES = [
  {
    id: 'sal-1001',
    receipt_number: 'VTA-0001',
    date: daysAgo(4, 3),
    customer_name: 'Valeria Gómez',
    payment_method: 'Zelle',
    subtotal: 98.00,
    discount: 0.00,
    total: 98.00,
    total_cost: 42.50,
    profit: 55.50,
    seller_id: 'usr-vend-1',
    seller_name: 'Vendedor Tienda',
    status: 'completada',
    notes: '',
    items: [
      {
        product_id: 'prod-201',
        sku: 'MUJ-BLU-01',
        name: 'Blusa Lino Beige Corte Editorial',
        quantity: 2,
        unit_cost: 12.00,
        sale_price: 28.00,
        subtotal: 56.00,
        cost_total: 24.00,
        profit: 32.00
      },
      {
        product_id: 'prod-202',
        sku: 'MUJ-VES-02',
        name: 'Vestido Midi Satinado Vino',
        quantity: 1,
        unit_cost: 18.50,
        sale_price: 42.00,
        subtotal: 42.00,
        cost_total: 18.50,
        profit: 23.50
      }
    ]
  },
  {
    id: 'sal-1002',
    receipt_number: 'VTA-0002',
    date: daysAgo(2, 5),
    customer_name: 'Andrés Morales',
    payment_method: 'Efectivo USD',
    subtotal: 106.00,
    discount: 6.00,
    total: 100.00,
    total_cost: 46.00,
    profit: 54.00,
    seller_id: 'usr-vend-1',
    seller_name: 'Vendedor Tienda',
    status: 'completada',
    notes: '',
    items: [
      {
        product_id: 'prod-204',
        sku: 'HOM-CAM-01',
        name: 'Camisa Oxford Manga Larga Oliva',
        quantity: 1,
        unit_cost: 14.00,
        sale_price: 32.00,
        subtotal: 32.00,
        cost_total: 14.00,
        profit: 18.00
      },
      {
        product_id: 'prod-205',
        sku: 'HOM-PAN-02',
        name: 'Pantalón Chino Slim Fit Arena',
        quantity: 1,
        unit_cost: 17.00,
        sale_price: 38.00,
        subtotal: 38.00,
        cost_total: 17.00,
        profit: 21.00
      },
      {
        product_id: 'prod-206',
        sku: 'HOM-FRA-03',
        name: 'Franela Básica Algodón Pima',
        quantity: 2,
        unit_cost: 7.50,
        sale_price: 18.00,
        subtotal: 36.00,
        cost_total: 15.00,
        profit: 21.00
      }
    ]
  },
  {
    id: 'sal-1003',
    receipt_number: 'VTA-0003',
    date: daysAgo(0, 3),
    customer_name: 'Sofía Herrera',
    payment_method: 'Transferencia',
    subtotal: 126.00,
    discount: 0.00,
    total: 126.00,
    total_cost: 55.00,
    profit: 71.00,
    seller_id: 'usr-admin-1',
    seller_name: 'Administración',
    status: 'completada',
    notes: '',
    items: [
      {
        product_id: 'prod-209',
        sku: 'CON-SET-01',
        name: 'Conjunto Sastre Chaleco y Pantalón',
        quantity: 1,
        unit_cost: 24.00,
        sale_price: 55.00,
        subtotal: 55.00,
        cost_total: 24.00,
        profit: 31.00
      },
      {
        product_id: 'prod-203',
        sku: 'MUJ-JEA-03',
        name: 'Jean Wide Leg Tiro Alto Denim',
        quantity: 1,
        unit_cost: 16.00,
        sale_price: 36.00,
        subtotal: 36.00,
        cost_total: 16.00,
        profit: 20.00
      },
      {
        product_id: 'prod-207',
        sku: 'ACC-BOL-01',
        name: 'Cartera Bandolera Cuero Vegano',
        quantity: 1,
        unit_cost: 15.00,
        sale_price: 35.00,
        subtotal: 35.00,
        cost_total: 15.00,
        profit: 20.00
      }
    ]
  },
  {
    id: 'sal-1004',
    receipt_number: 'VTA-0004',
    date: daysAgo(0, 1),
    customer_name: 'Camila Rivas (Por confirmar pago)',
    payment_method: 'Pendiente por definir',
    subtotal: 70.00,
    discount: 0.00,
    total: 70.00,
    total_cost: 30.50,
    profit: 39.50,
    seller_id: 'usr-vend-1',
    seller_name: 'Vendedor Tienda',
    status: 'pendiente',
    notes: 'Apartado esperando confirmación de transferencia',
    items: [
      {
        product_id: 'prod-201',
        sku: 'MUJ-BLU-01',
        name: 'Blusa Lino Beige Corte Editorial',
        quantity: 1,
        unit_cost: 12.00,
        sale_price: 28.00,
        subtotal: 28.00,
        cost_total: 12.00,
        profit: 16.00
      },
      {
        product_id: 'prod-202',
        sku: 'MUJ-VES-02',
        name: 'Vestido Midi Satinado Vino',
        quantity: 1,
        unit_cost: 18.50,
        sale_price: 42.00,
        subtotal: 42.00,
        cost_total: 18.50,
        profit: 23.50
      }
    ]
  }
];

export const INITIAL_BATCHES = [
  {
    id: 'bat-4001',
    batch_code: 'LOTE-DIC-01',
    description: 'Pedido Nueva Colección Deportiva Mujer y Hombre',
    supplier: 'Gymshark UK / Oficial',
    items_count: 25,
    purchase_amount: 310.00,
    shipping_amount: 45.00,
    total_cost: 355.00,
    status: 'adquirido', // 'adquirido' | 'en_via' | 'llego'
    purchased_date: daysAgo(1),
    in_transit_date: null,
    arrived_date: null,
    notes: 'Orden comprada, esperando despacho a casillero'
  },
  {
    id: 'bat-4002',
    batch_code: 'LOTE-NOV-04',
    description: 'Cargamento Leggings, Tops y Franelas Oversize',
    supplier: 'Miami Courier Express',
    items_count: 20,
    purchase_amount: 240.00,
    shipping_amount: 40.00,
    total_cost: 280.00,
    status: 'en_via',
    purchased_date: daysAgo(6),
    in_transit_date: daysAgo(3),
    arrived_date: null,
    notes: 'En ruta aérea hacia destino'
  },
  {
    id: 'bat-4003',
    batch_code: 'LOTE-NOV-03',
    description: 'Lote Blusas, Vestidos, Camisas Oxford y Conjuntos',
    supplier: 'Textiles Moda Studio',
    items_count: 35,
    purchase_amount: 455.00,
    shipping_amount: 70.00,
    total_cost: 525.00,
    status: 'llego',
    purchased_date: daysAgo(12),
    in_transit_date: daysAgo(7),
    arrived_date: daysAgo(2),
    notes: 'Recibido completo en tienda'
  },
  {
    id: 'bat-4004',
    batch_code: 'LOTE-NOV-02',
    description: 'Lote Jeans Wide Leg, Pantalones Chino y Accesorios',
    supplier: 'Denim Factory Co.',
    items_count: 19,
    purchase_amount: 255.00,
    shipping_amount: 48.00,
    total_cost: 303.00,
    status: 'llego',
    purchased_date: daysAgo(18),
    in_transit_date: daysAgo(13),
    arrived_date: daysAgo(8),
    notes: 'Recibido y verificado'
  }
];

export const INITIAL_PURCHASES = [
  {
    id: 'pur-2001',
    date: daysAgo(2),
    product_id: 'prod-201',
    product_sku: 'MUJ-BLU-01',
    product_name: 'Blusa Lino Beige Corte Editorial',
    batch_code: 'LOTE-NOV-03',
    supplier: 'Textiles Moda Studio',
    invoice_ref: 'CARGA-03',
    quantity: 16,
    purchase_cost: 10.00,
    shipping_cost: 2.00,
    unit_cost: 12.00,
    total_cost: 192.00,
    registered_by: 'Administración',
    notes: 'Llegada colección noviembre'
  },
  {
    id: 'pur-2002',
    date: daysAgo(8),
    product_id: 'prod-203',
    product_sku: 'MUJ-JEA-03',
    product_name: 'Jean Wide Leg Tiro Alto Denim',
    batch_code: 'LOTE-NOV-02',
    supplier: 'Denim Factory Co.',
    invoice_ref: 'CARGA-02',
    quantity: 12,
    purchase_cost: 13.00,
    shipping_cost: 3.00,
    unit_cost: 16.00,
    total_cost: 192.00,
    registered_by: 'Administración',
    notes: 'Reposición denim'
  }
];

export const INITIAL_EXPENSES = [
  {
    id: 'exp-3001',
    date: daysAgo(10),
    category: 'Alquiler y Local',
    description: 'Alquiler de local / showroom',
    amount: 120.00,
    payment_method: 'Transferencia',
    registered_by: 'Administración',
    notes: ''
  },
  {
    id: 'exp-3002',
    date: daysAgo(3),
    category: 'Logística y Envíos',
    description: 'Bolsas boutique, etiquetas y envíos',
    amount: 25.00,
    payment_method: 'Efectivo USD',
    registered_by: 'Administración',
    notes: ''
  }
];

export const SUPABASE_SQL_SCHEMA = `-- ============================================================================
-- INVENTARIOPRO / GYMBROS - ESQUEMA COMPLETO PARA SUPABASE (PostgreSQL)
-- Incluye: Usuarios, Prendas con Tallas, Ventas (Bs/Ref), Lotes, Restock y Gastos
-- Copia y pega este script en el "SQL Editor" de tu proyecto en Supabase y dale a RUN
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'vendedor' CHECK (role IN ('admin', 'vendedor')),
    pin_or_password TEXT NOT NULL DEFAULT '',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Mujer',
    item_type TEXT NOT NULL DEFAULT 'product',
    image_url TEXT,
    batch_code TEXT DEFAULT 'LOTE-01',
    last_restock_at TIMESTAMPTZ DEFAULT NOW(),
    sizes_stock JSONB NOT NULL DEFAULT '{"XS":0,"S":0,"M":0,"L":0,"XL":0,"Única":0}'::jsonb,
    size TEXT DEFAULT '',
    stock NUMERIC(12, 2) NOT NULL DEFAULT 0,
    min_stock NUMERIC(12, 2) NOT NULL DEFAULT 4,
    purchase_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sale_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'und',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY,
    receipt_number TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    customer_name TEXT DEFAULT 'Cliente General',
    payment_method TEXT NOT NULL DEFAULT 'Efectivo USD',
    payment_reference TEXT DEFAULT '',
    exchange_rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
    secondary_currency TEXT DEFAULT 'Bs.',
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    profit NUMERIC(12, 2) NOT NULL DEFAULT 0,
    seller_id TEXT,
    seller_name TEXT NOT NULL DEFAULT 'Administrador',
    status TEXT NOT NULL DEFAULT 'completada' CHECK (status IN ('completada', 'pendiente', 'anulada')),
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.batches (
    id TEXT PRIMARY KEY,
    batch_code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL DEFAULT 'Cargamento de Ropa',
    supplier TEXT DEFAULT 'Proveedor General',
    items_count NUMERIC(12, 2) NOT NULL DEFAULT 0,
    purchase_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'adquirido' CHECK (status IN ('adquirido', 'en_via', 'llego')),
    purchased_date TIMESTAMPTZ DEFAULT NOW(),
    in_transit_date TIMESTAMPTZ,
    arrived_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchases (
    id TEXT PRIMARY KEY,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    product_id TEXT NOT NULL,
    product_sku TEXT NOT NULL,
    product_name TEXT NOT NULL,
    batch_code TEXT DEFAULT 'LOTE-01',
    supplier TEXT DEFAULT 'Proveedor General',
    invoice_ref TEXT,
    quantity NUMERIC(12, 2) NOT NULL,
    sizes_added JSONB,
    sizes_summary TEXT DEFAULT '',
    purchase_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit_cost NUMERIC(12, 2) NOT NULL,
    total_cost NUMERIC(12, 2) NOT NULL,
    registered_by TEXT NOT NULL DEFAULT 'Administrador',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    category TEXT NOT NULL DEFAULT 'Operativo',
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method TEXT DEFAULT 'Transferencia',
    registered_by TEXT NOT NULL DEFAULT 'Administrador',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.store_profile (
    id TEXT PRIMARY KEY DEFAULT 'main',
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso interno app_users" ON public.app_users;
CREATE POLICY "Acceso interno app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Acceso interno products" ON public.products;
CREATE POLICY "Acceso interno products" ON public.products FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Acceso interno sales" ON public.sales;
CREATE POLICY "Acceso interno sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Acceso interno batches" ON public.batches;
CREATE POLICY "Acceso interno batches" ON public.batches FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Acceso interno purchases" ON public.purchases;
CREATE POLICY "Acceso interno purchases" ON public.purchases FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Acceso interno expenses" ON public.expenses;
CREATE POLICY "Acceso interno expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Acceso interno store_profile" ON public.store_profile;
CREATE POLICY "Acceso interno store_profile" ON public.store_profile FOR ALL USING (true) WITH CHECK (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;`;
