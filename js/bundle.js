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

const INITIAL_BUSINESS_PROFILE = {
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

const BUSINESS_PRESETS = {
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

const INITIAL_USERS = [
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

const INITIAL_PRODUCTS = [
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

const INITIAL_SALES = [
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

const INITIAL_BATCHES = [
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

const INITIAL_PURCHASES = [
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

const INITIAL_EXPENSES = [
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

const SUPABASE_SQL_SCHEMA = `-- ============================================================================
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
// ============================================================================
// INVENTARIOPRO - MOTOR DE DATOS (LOTES, RESTOCK, ROPA Y SUPABASE CLOUD)
// ============================================================================


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

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Única'];

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

const db = new DataService();
// ============================================================================
// INVENTARIOPRO - MOTOR DE EXPORTACIÓN E IMPORTACIÓN EXCEL / CSV
// Soporta separadores por coma (,) y punto y coma (;) con UTF-8 BOM para Excel
// ============================================================================

function downloadCSV(filename, headers, rows) {
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const lines = [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ];

  // UTF-8 BOM (\uFEFF) garantiza que Microsoft Excel reconozca tildes y columnas automáticamente
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadJSON(filename, dataObj) {
  const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseCSVProducts(csvText) {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) return [];

  const lines = cleanText.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Detectar delimitador automáticamente (, o ;)
  const headerLine = lines[0];
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semiCount = (headerLine.match(/;/g) || []).length;
  const delimiter = semiCount > commaCount ? ';' : ',';

  const splitCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const rawHeaders = splitCSVLine(lines[0]).map(h =>
    h.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '_')
  );

  const findColIndex = (candidates) => {
    for (const c of candidates) {
      const idx = rawHeaders.findIndex(h => h.includes(c));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idxSku = findColIndex(['sku', 'codigo', 'cod', 'ref']);
  const idxName = findColIndex(['nombre', 'name', 'producto', 'prenda', 'descripcion']);
  const idxCat = findColIndex(['categoria', 'category', 'rubro', 'familia']);
  const idxBatch = findColIndex(['lote', 'batch', 'cargamento']);
  const idxStock = findColIndex(['stock_actual', 'stock', 'cantidad', 'existencia']);
  const idxMinStock = findColIndex(['stock_min', 'min_stock', 'minimo', 'alerta']);
  const idxCost = findColIndex(['costo', 'unit_cost', 'cost', 'compra']);
  const idxPrice = findColIndex(['precio', 'sale_price', 'price', 'venta', 'pvp']);

  const parseNumber = (val) => {
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.,-]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : Number(num.toFixed(2));
  };

  const parsedRows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    if (cols.length < 2) continue;

    const sku = idxSku >= 0 ? cols[idxSku] : cols[0];
    const name = idxName >= 0 ? cols[idxName] : cols[1];
    if (!sku || !name) continue;

    parsedRows.push({
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category: (idxCat >= 0 && cols[idxCat]) ? cols[idxCat].trim() : 'Mujer',
      batch_code: (idxBatch >= 0 && cols[idxBatch]) ? cols[idxBatch].trim().toUpperCase() : 'LOTE-01',
      stock: idxStock >= 0 ? parseNumber(cols[idxStock]) : 0,
      min_stock: idxMinStock >= 0 ? parseNumber(cols[idxMinStock]) : 4,
      unit_cost: idxCost >= 0 ? parseNumber(cols[idxCost]) : 0,
      sale_price: idxPrice >= 0 ? parseNumber(cols[idxPrice]) : 0
    });
  }

  return parsedRows;
}
// ============================================================================
// INVENTARIOPRO - CONTROLADOR MINIMALISTA PARA VENTA DE ROPA (LOTES Y RESTOCK)
// ============================================================================


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
  return (
    m.includes('pago móvil') ||
    m.includes('pago movil') ||
    m.includes('transferencia') ||
    m.includes('mixto') ||
    m.includes('bs') ||
    m.includes('bolívar') ||
    m.includes('bolivar')
  );
}

function methodNeedsReference(method) {
  const m = String(method || '').toLowerCase();
  return (
    m.includes('pago móvil') ||
    m.includes('pago movil') ||
    m.includes('zelle') ||
    m.includes('transferencia') ||
    m.includes('tarjeta') ||
    m.includes('mixto')
  );
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
  const nextTickerHTML = `${singlePass}<span class="ticker-sep">✦</span>${singlePass}<span class="ticker-sep">✦</span>`;
  // Solo actualizar el DOM de la tira si cambió el texto, evitando que parpadee o se reinicie la animación
  if (track.dataset.lastHtml !== nextTickerHTML) {
    track.dataset.lastHtml = nextTickerHTML;
    track.innerHTML = nextTickerHTML;
  }
}

let lastCloudPullAt = 0;
let isCloudPulling = false;
let lastRenderedViewName = null;

function getDataFingerprint() {
  const normProducts = (db.products || []).map(p => ({
    id: p.id,
    name: p.name,
    stock: Number(p.stock) || 0,
    sale_price: Number(p.sale_price) || 0,
    unit_cost: Number(p.unit_cost) || 0,
    batch_code: p.batch_code || '',
    sizes_stock: p.sizes_stock || {}
  }));
  const normSales = (db.sales || []).map(s => ({
    id: s.id,
    status: s.status,
    total: Number(s.total) || 0,
    payment_method: s.payment_method,
    payment_reference: s.payment_reference || ''
  }));
  const normBatches = (db.batches || []).map(b => ({
    id: b.id,
    status: b.status,
    total_cost: Number(b.total_cost) || 0,
    items_count: Number(b.items_count) || 0
  }));
  return JSON.stringify({
    name: db.profile?.businessName || '',
    rate: Number(db.profile?.exchangeRate) || 0,
    u: (db.users || []).length,
    pr: normProducts,
    s: normSales,
    b: normBatches,
    pu: (db.purchases || []).length,
    e: (db.expenses || []).length
  });
}

function captureScrollPositions() {
  return {
    winY: typeof window !== 'undefined' ? (window.scrollY || 0) : 0,
    posCatalog: document.querySelector('.pos-catalog-scroll')?.scrollTop || 0,
    invTable: document.querySelector('.inv-table-scroll')?.scrollTop || 0,
    cartBody: document.querySelector('.pos-cart-panel .card-body')?.scrollTop || 0
  };
}

function restoreScrollPositions(pos) {
  if (!pos) return;
  const restore = () => {
    const posEl = document.querySelector('.pos-catalog-scroll');
    const invEl = document.querySelector('.inv-table-scroll');
    const cartEl = document.querySelector('.pos-cart-panel .card-body');
    if (posEl && pos.posCatalog) posEl.scrollTop = pos.posCatalog;
    if (invEl && pos.invTable) invEl.scrollTop = pos.invTable;
    if (cartEl && pos.cartBody) cartEl.scrollTop = pos.cartBody;
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function' && pos.winY) {
      window.scrollTo(0, pos.winY);
    }
  };
  restore();
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(restore);
  }
}

async function syncFromCloudLive(showNotification = false) {
  if (!db.isCloudConnected() || isCloudPulling) return false;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    if (showNotification) showToast('Sin conexión a internet. No se pudo actualizar desde la nube.');
    return false;
  }
  isCloudPulling = true;
  try {
    const beforeFingerprint = getDataFingerprint();
    const ok = await db.pullFromCloud();
    lastCloudPullAt = Date.now();
    if (ok) {
      const afterFingerprint = getDataFingerprint();
      const hasChanges = beforeFingerprint !== afterFingerprint;

      if (hasChanges) {
        updateChrome();
        // No re-renderizar si hay un modal abierto para no interrumpir lo que el usuario está escribiendo
        const modalEl = document.getElementById('app-modal');
        const isModalOpen = modalEl && !modalEl.classList.contains('hidden');
        if (!isModalOpen) {
          renderCurrentView();
        }
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
  renderCurrentView(false);
  // Si pasaron más de 8 segundos desde la última consulta, refrescar silenciosamente desde Supabase
  if (Date.now() - lastCloudPullAt > 8000) {
    syncFromCloudLive(false);
  }
}

function renderCurrentView(preserveScroll = true) {
  const container = document.getElementById('main-content');
  const topActions = document.getElementById('topbar-actions');
  if (!container) return;

  const sameView = preserveScroll && lastRenderedViewName === state.currentView;
  const savedScroll = sameView ? captureScrollPositions() : null;
  lastRenderedViewName = state.currentView;

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

  if (savedScroll) {
    restoreScrollPositions(savedScroll);
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
  const discPct = Math.min(100, Math.max(0, parseFloat(String(state.posDiscount).replace(',', '.')) || 0));
  const discount = Number(((subtotal * discPct) / 100).toFixed(2));
  const total = Math.max(0, Number((subtotal - discount).toFixed(2)));
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
                  ${['Efectivo USD', 'Pago Móvil', 'Zelle', 'Transferencia', 'Tarjeta', 'Pago Mixto', 'Crédito']
                    .map(
                      m =>
                        `<option value="${m}" ${state.posPaymentMethod === m ? 'selected' : ''}>${m}</option>`
                    )
                    .join('')}
                </select>
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label>Descuento (%)</label>
                <input
                  type="text"
                  inputmode="decimal"
                  class="input"
                  id="pos-discount"
                  placeholder="0%"
                  value="${escapeHTML(state.posDiscount)}"
                />
              </div>
            </div>

            <div class="form-group" id="pos-ref-group" style="margin-top:10px; margin-bottom:0; ${methodNeedsReference(state.posPaymentMethod) ? '' : 'display:none;'}">
              <label>Ref. (Zelle / Pago Móvil / Transferencia / Mixto)</label>
              <input
                type="text"
                class="input"
                id="pos-payment-ref"
                placeholder="Ej. 048291 o detalle del pago..."
                value="${escapeHTML(state.posPaymentReference)}"
              />
            </div>
          </div>

          <div class="cart-summary">
            <div
              id="pos-discount-line"
              class="summary-row"
              style="font-size:12.5px; color:var(--olive-dark); font-weight:700; ${discount > 0 ? '' : 'display:none;'}"
            >
              <span id="pos-discount-label">Descuento (${discPct}%):</span>
              <span id="pos-discount-amount">-${fmtUSD(discount)}</span>
            </div>
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
      refGroup.style.display = methodNeedsReference(state.posPaymentMethod) ? '' : 'none';
    }
  });

  document.getElementById('pos-payment-ref')?.addEventListener('input', e => {
    state.posPaymentReference = e.target.value;
  });

  // Actualización en vivo del descuento en PORCENTAJE (%) sin recargar el DOM
  document.getElementById('pos-discount')?.addEventListener('input', e => {
    state.posDiscount = e.target.value;
    const pct = Math.min(100, Math.max(0, parseFloat(String(e.target.value).replace(',', '.')) || 0));
    const currentSub = state.posCart.reduce((acc, item) => acc + item.quantity * item.sale_price, 0);
    const cleanDisc = Number(((currentSub * pct) / 100).toFixed(2));
    const newTotal = Math.max(0, Number((currentSub - cleanDisc).toFixed(2)));
    const newSec = fmtSecondary(newTotal);

    const discLine = document.getElementById('pos-discount-line');
    const discLbl = document.getElementById('pos-discount-label');
    const discAmt = document.getElementById('pos-discount-amount');
    if (discLine) discLine.style.display = cleanDisc > 0 ? '' : 'none';
    if (discLbl) discLbl.textContent = `Descuento (${pct}%):`;
    if (discAmt) discAmt.textContent = `-${fmtUSD(cleanDisc)}`;

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
    const subtotal = state.posCart.reduce((acc, item) => acc + item.quantity * item.sale_price, 0);
    const pct = Math.min(100, Math.max(0, parseFloat(String(state.posDiscount).replace(',', '.')) || 0));
    const discountUSD = Number(((subtotal * pct) / 100).toFixed(2));
    const sale = await db.createSale({
      customer_name: (customCustomer ?? state.posCustomer) || 'Cliente General',
      payment_method: customPaymentMethod ?? state.posPaymentMethod,
      payment_reference: customReference ?? state.posPaymentReference,
      discount: discountUSD,
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
  const discPct = Math.min(100, Math.max(0, parseFloat(String(state.posDiscount).replace(',', '.')) || 0));
  const discount = Number(((subtotal * discPct) / 100).toFixed(2));
  const total = Math.max(0, Number((subtotal - discount).toFixed(2)));
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
          ${['Efectivo USD', 'Pago Móvil', 'Zelle', 'Transferencia', 'Tarjeta', 'Pago Mixto', 'Pendiente por pagar']
            .map(
              m =>
                `<option value="${m}" ${state.posPaymentMethod === m ? 'selected' : ''}>${m}</option>`
            )
            .join('')}
        </select>
      </div>

      <div class="form-group" id="chk-ref-group" style="${methodNeedsReference(state.posPaymentMethod) ? '' : 'display:none;'}">
        <label>Ref.</label>
        <input
          type="text"
          class="input"
          id="chk-payment-ref"
          placeholder="Número de referencia o detalle del pago..."
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
            ? `<div class="summary-row" style="color:var(--olive-dark); font-weight:700;"><span>Descuento (${discPct}%):</span><span>-${fmtUSD(discount)}</span></div>`
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
      refGroup.style.display = methodNeedsReference(e.target.value) ? '' : 'none';
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
              <option value="Pago Mixto">Pago Mixto</option>
            </select>
          </div>
          <div class="form-group" id="pend-ref-group" style="display:none;">
            <label>Ref.</label>
            <input
              type="text"
              class="input"
              id="pend-pay-ref"
              placeholder="Número de referencia o detalle del pago..."
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
        if (refG) refG.style.display = methodNeedsReference(e.target.value) ? '' : 'none';
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
        state.posDiscount =
          sale.discount && sale.subtotal > 0
            ? String(Number(((sale.discount / sale.subtotal) * 100).toFixed(2)))
            : '';
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

  const cancelledCount = db.sales.filter(s => s.status === 'anulada').length;

  container.innerHTML = `
    <div class="toolbar">
      <input
        type="text"
        class="input"
        id="sales-search"
        placeholder="Buscar venta por cliente, recibo, pago o referencia..."
        value="${escapeHTML(state.salesSearch)}"
        style="min-width:260px;"
      />
      ${
        admin
          ? `<div style="display:flex; gap:8px; flex-wrap:wrap;">
              ${
                cancelledCount > 0
                  ? `<button class="btn btn-outline" style="color:var(--danger);" id="btn-purge-cancelled">
                      Limpiar Anuladas (${cancelledCount})
                    </button>`
                  : ''
              }
              <button class="btn btn-outline" id="btn-export-sales">${icon("download")} Descargar Ventas en Excel</button>
            </div>`
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
                          <td style="text-align:right; white-space:nowrap;">
                            <button class="btn btn-outline btn-sm" data-view-sale="${escapeHTML(s.id)}">Ver Recibo</button>
                            ${
                              admin && s.status === 'completada'
                                ? `<button class="btn btn-outline btn-sm" style="color:var(--danger);" data-cancel-sale="${escapeHTML(s.id)}">Anular</button>`
                                : ''
                            }
                            ${
                              admin
                                ? `<button class="btn btn-outline btn-sm" style="color:var(--danger);" title="Eliminar definitivamente este recibo" data-del-sale="${escapeHTML(s.id)}">✕</button>`
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

  document.getElementById('btn-purge-cancelled')?.addEventListener('click', async () => {
    if (!confirm(`¿Eliminar definitivamente las ${cancelledCount} facturas anuladas del historial?`)) return;
    try {
      const removed = await db.deleteCancelledSales();
      updateChrome();
      renderSalesHistoryInline(container);
      showToast(`${removed} recibo(s) anulado(s) eliminado(s).`);
    } catch (err) {
      showToast(err.message);
    }
  });

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
        try {
          await db.cancelSale(sale.id);
          updateChrome();
          renderSalesHistoryInline(container);
          showToast('Venta anulada y stock restaurado.');
        } catch (err) {
          showToast(err.message);
        }
      }
    });
  });

  container.querySelectorAll('[data-del-sale]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const sale = db.sales.find(s => s.id === btn.dataset.delSale);
      if (!sale) return;
      const msg =
        sale.status === 'completada'
          ? `¿Eliminar definitivamente el recibo ${sale.receipt_number} del historial? (Nota: esto NO devuelve stock; si quieres devolver stock usa primero "Anular").`
          : `¿Eliminar definitivamente el recibo anulado ${sale.receipt_number}?`;
      if (confirm(msg)) {
        try {
          await db.deleteSale(sale.id);
          updateChrome();
          renderSalesHistoryInline(container);
          showToast(`Recibo ${sale.receipt_number} eliminado.`);
        } catch (err) {
          showToast(err.message);
        }
      }
    });
  });
}

function printCompactReceipt(sale) {
  const bName = (db.profile?.businessName || 'GYMBROS').toUpperCase();
  const saleRate = Number(sale.exchange_rate) || Number(db.profile?.exchangeRate) || 0;
  const saleSym = sale.secondary_currency || db.profile?.secondaryCurrencySymbol || 'Bs.';
  const showBs = isBsPaymentMethod(sale.payment_method);
  const secTotal = showBs && saleRate > 0 ? fmtSecondary(sale.total, saleRate, saleSym) : '';
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
          ? `<tr><td colspan="2" style="padding-top:3px;"><span class="lbl">Ref: </span><span class="val" style="font-family:monospace; color:#4A1C21;">${escapeHTML(sale.payment_reference)}</span></td></tr>`
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
  const showBs = isBsPaymentMethod(sale.payment_method);
  const secTotal = showBs && saleRate > 0 ? fmtSecondary(sale.total, saleRate, saleSym) : '';

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
  const showBs = isBsPaymentMethod(sale.payment_method);
  const secTotal = showBs && saleRate > 0 ? fmtSecondary(sale.total, saleRate, saleSym) : '';
  const needsRef = methodNeedsReference(sale.payment_method);
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
            <span class="receipt-meta-label">Ref.</span>
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

      <!-- Campo de Ref. solo si el método lleva referencia (Pago Móvil, Zelle, Transferencia, Tarjeta, Pago Mixto) -->
      <div class="no-print" style="margin-top:12px; padding:10px 12px; background:var(--bg-oat-soft); border:1px solid var(--border-strong); border-radius:9px; ${needsRef || sale.payment_reference ? '' : 'display:none;'}">
        <label style="display:block; font-size:11.5px; font-weight:700; color:var(--primary); margin-bottom:5px;">
          Ref. (${escapeHTML(sale.payment_method)})
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
                          <td>
                            <strong style="${profit < 0 && p.sale_price > 0 ? 'color:var(--danger);' : ''}">
                              ${fmtUSD(p.sale_price)}
                            </strong>
                            ${
                              profit < 0 && p.sale_price > 0
                                ? `<div style="font-size:10.5px; color:var(--danger); font-weight:700;">Bajo costo</div>`
                                : ''
                            }
                          </td>
                          ${
                            admin
                              ? `
                            <td>
                              <span class="badge ${profit < 0 ? 'badge-danger' : 'badge-success'}">
                                ${profit >= 0 ? '+' : ''}${fmtUSD(profit)} c/u
                              </span>
                              <div style="font-size:11px; color:${profit < 0 ? 'var(--danger)' : 'var(--text-secondary)'}; font-weight:${profit < 0 ? '700' : '400'}; margin-top:2px;">
                                Lote: ${profit >= 0 ? '+' : ''}${fmtUSD(Math.max(0, p.stock) * profit)}
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
    maxWidth: '500px',
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
        isEdit
          ? `<div style="background:var(--bg-oat-soft); padding:12px; border-radius:10px; border:1px solid var(--border-strong); margin-bottom:10px;">
              <div class="form-grid" style="grid-template-columns: 1fr 1fr; gap:10px;">
                <div class="form-group" style="margin-bottom:0;">
                  <label>Costo Pieza c/u ($)</label>
                  <input type="number" step="0.01" min="0" class="input" id="prod-purchase-cost" value="${initPurchaseCost}" />
                </div>
                <div class="form-group" style="margin-bottom:0;">
                  <label>Precio de Venta ($)</label>
                  <input type="number" step="0.01" min="0" class="input" id="prod-price" value="${p.sale_price}" style="font-weight:800; color:var(--primary);" />
                </div>
              </div>
              <div style="font-size:11.5px; color:var(--text-secondary); margin-top:7px;">
                Lote: <strong>${escapeHTML(p.batch_code || '-')}</strong> · Envío del lote: <strong>${fmtUSD(initShippingCost)} c/u</strong> · Stock: <strong>${initTotalStock}</strong>
              </div>
              <div id="prod-edit-profit-alert" style="margin-top:8px; padding:8px 10px; border-radius:8px; font-size:12px; font-weight:700;"></div>
            </div>`
          : `<div style="background:var(--bg-oat-soft); padding:10px 12px; border-radius:10px; border:1px dashed var(--border-strong); font-size:12px; color:var(--text-secondary);">
              Al guardar la prenda en tu catálogo, ve a <strong>Nuevo Restock / Lote</strong> para ingresar el lote, sus tallas, el costo de la pieza y su precio de venta.
            </div>`
      }
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

  if (isEdit) {
    const updateEditPriceAlert = () => {
      const priceInp = document.getElementById('prod-price');
      const costInp = document.getElementById('prod-purchase-cost');
      const alertBox = document.getElementById('prod-edit-profit-alert');
      if (!priceInp || !alertBox) return;
      const newPrice = Number(priceInp.value) || 0;
      const newPurchaseCost = Number(costInp?.value ?? initPurchaseCost) || 0;
      const baseCost = Number((newPurchaseCost + initShippingCost).toFixed(2));
      const diff = Number((newPrice - baseCost).toFixed(2));
      if (diff < 0) {
        priceInp.style.borderColor = 'var(--danger)';
        priceInp.style.color = 'var(--danger)';
        priceInp.style.backgroundColor = 'var(--danger-bg)';
        alertBox.style.background = 'var(--danger-bg)';
        alertBox.style.color = 'var(--danger)';
        alertBox.style.border = '1px solid var(--danger)';
        alertBox.innerHTML = `⚠ Pérdida: ${fmtUSD(diff)} c/u (Costo total: ${fmtUSD(baseCost)})`;
      } else {
        priceInp.style.borderColor = '';
        priceInp.style.color = 'var(--primary)';
        priceInp.style.backgroundColor = '#FFFFFF';
        alertBox.style.background = 'var(--success-bg)';
        alertBox.style.color = 'var(--olive-dark)';
        alertBox.style.border = '1px solid var(--border-strong)';
        alertBox.innerHTML = `✓ Ganancia: +${fmtUSD(diff)} c/u (Costo total: ${fmtUSD(baseCost)})`;
      }
    };
    updateEditPriceAlert();
    document.getElementById('prod-price')?.addEventListener('input', updateEditPriceAlert);
    document.getElementById('prod-purchase-cost')?.addEventListener('input', updateEditPriceAlert);
  }

  document.getElementById('prod-modal-cancel')?.addEventListener('click', closeModal);

  document.getElementById('prod-modal-save')?.addEventListener('click', async () => {
    try {
      const name = document.getElementById('prod-name').value.trim();
      const sku = document.getElementById('prod-sku').value.trim();
      if (!name || !sku) {
        showToast('Escribe el nombre y código de la prenda.');
        return;
      }
      const salePriceVal = isEdit
        ? (Number(document.getElementById('prod-price')?.value) || 0)
        : 0;
      const purchaseCostVal = isEdit
        ? (Number(document.getElementById('prod-purchase-cost')?.value) || 0)
        : 0;

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
        purchase_cost: purchaseCostVal,
        shipping_cost: isEdit ? initShippingCost : 0,
        unit_cost: isEdit ? Number((purchaseCostVal + initShippingCost).toFixed(2)) : 0,
        sale_price: salePriceVal
      });
      closeModal();
      updateChrome();
      renderCurrentView();
      showToast(isEdit ? 'Prenda actualizada.' : 'Prenda registrada. Ahora ve a "Nuevo Restock / Lote" para ingresar tallas y precio.');
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

function getBatchShippingPerPiece(batchCode) {
  const b = (db.batches || []).find(
    x => (x.batch_code || '').toUpperCase() === String(batchCode || '').trim().toUpperCase()
  );
  if (!b) return { batch: null, perPieceShip: 0 };
  const items = Number(b.items_count) || 0;
  const ship = Number(b.shipping_amount) || 0;
  const perPieceShip = items > 0 && ship > 0 ? Number((ship / items).toFixed(2)) : 0;
  return { batch: b, perPieceShip };
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
  const { perPieceShip: initBatchShip } = getBatchShippingPerPiece(suggestedBatch);
  const initShipCost = initBatchShip > 0 ? initBatchShip : (initialProd.shipping_cost || 0);
  const initSalePrice = Number(initialProd.sale_price) || 0;

  openModal({
    title: 'Registrar Restock / Entrada de Lote',
    maxWidth: '550px',
    bodyHTML: `
      <!-- Vista previa de la prenda seleccionada + Selector de Prenda y Lote apilados -->
      <div class="img-upload-box" style="margin-bottom:14px; align-items:flex-start;">
        <div class="img-preview-frame" id="pur-prod-img-preview" style="width:82px; height:82px;">
          ${
            initialProd.image_url
              ? `<img src="${escapeHTML(initialProd.image_url)}" alt="${escapeHTML(initialProd.name)}" />`
              : `${icon("hanger")}`
          }
        </div>
        <div style="flex:1; min-width:0;">
          <div class="form-group" style="margin-bottom:10px;">
            <label>Prenda que llegó *</label>
            <select class="select" id="pur-product" style="width:100%;">
              ${physicalProducts
                .map(
                  p =>
                    `<option value="${escapeHTML(p.id)}" ${p.id === initialProd.id ? 'selected' : ''}>
                      ${escapeHTML(p.name)} (${p.stock} disp.)
                    </option>`
                )
                .join('')}
            </select>
          </div>

          <div class="form-group" style="margin-bottom:0;">
            <label>Lote en el que llegó *</label>
            ${
              registeredBatches.length > 0
                ? `<select class="select" id="pur-batch" style="width:100%;">
                    ${registeredBatches
                      .map(b => {
                        const items = Number(b.items_count) || 0;
                        const shipPerUnit = items > 0 ? (Number(b.shipping_amount || 0) / items).toFixed(2) : '0.00';
                        return `<option value="${escapeHTML(b.batch_code)}" ${b.batch_code === suggestedBatch ? 'selected' : ''}>
                          ${escapeHTML(b.batch_code)} (Envío c/u: $${shipPerUnit})
                        </option>`;
                      })
                      .join('')}
                  </select>`
                : `<input type="text" class="input" id="pur-batch" value="${escapeHTML(suggestedBatch)}" placeholder="Ej. LOTE-NOV-01" style="width:100%;" />`
            }
          </div>
        </div>
      </div>

      <!-- Tallas que entran -->
      <div style="background:var(--bg-oat-soft); padding:12px; border-radius:12px; border:1px solid var(--border-strong); margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <label style="margin:0; font-weight:800; font-size:13px; color:var(--primary);">
            Tallas que Entran *
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

      <!-- Costo sintetizado: Costo Pieza + Envío automático del Lote -> Precio Venta / Ganancia -->
      <div style="background:var(--bg-oat-soft); padding:12px 14px; border-radius:12px; border:1px solid var(--border-strong); margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font-size:12px;">
          <span style="font-weight:800; color:var(--primary);">Cálculo Rápido de Precio</span>
          <span class="badge badge-neutral" id="pur-batch-ship-pill" style="color:var(--primary); border:1px solid var(--border-strong);">
            Envío del lote: ${fmtUSD(initShipCost)} c/u
          </span>
        </div>

        <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
          <div class="form-group" style="margin-bottom:6px;">
            <label>Valor Unitario Pieza ($)</label>
            <input type="number" step="0.01" min="0" class="input" id="pur-purchase-cost" value="${initPurCost}" placeholder="0.00" />
          </div>
          <div class="form-group" style="margin-bottom:6px;">
            <label>Precio de Venta ($)</label>
            <input type="number" step="0.01" min="0" class="input" id="pur-sale-price" value="${initSalePrice}" style="font-weight:800; color:var(--primary);" placeholder="0.00" />
          </div>
        </div>

        <div class="margin-helper-btns" style="margin-top:4px;">
          <span style="font-size:11px; color:var(--text-secondary); align-self:center; margin-right:4px;">Ganancia rápida:</span>
          <button type="button" class="margin-chip" data-pur-markup="30">+30%</button>
          <button type="button" class="margin-chip" data-pur-markup="50">+50%</button>
          <button type="button" class="margin-chip" data-pur-markup="100">+100%</button>
        </div>
      </div>

      <input type="hidden" id="pur-qty" value="0" />
      <input type="hidden" id="pur-shipping-cost" value="${initShipCost}" />

      <div class="cart-summary" id="pur-calc-preview" style="background:#FAF8F4; margin-top:0; padding:12px 14px;"></div>
    `,
    footerHTML: `
      <button class="btn btn-outline" id="pur-cancel">Cancelar</button>
      <button class="btn btn-primary" id="pur-save">Guardar Restock</button>
    `
  });

  const applyBatchShipping = () => {
    const batchCode = document.getElementById('pur-batch')?.value || '';
    const { batch, perPieceShip } = getBatchShippingPerPiece(batchCode);
    const prodId = document.getElementById('pur-product')?.value;
    const prod = db.products.find(p => p.id === prodId) || initialProd;
    const shipCost = batch ? perPieceShip : (Number(prod?.shipping_cost) || 0);

    const shipInp = document.getElementById('pur-shipping-cost');
    const shipPill = document.getElementById('pur-batch-ship-pill');
    if (shipInp) shipInp.value = shipCost;
    if (shipPill) {
      shipPill.textContent = batch
        ? `Envío ${batch.batch_code}: ${fmtUSD(shipCost)} c/u`
        : `Envío c/u: ${fmtUSD(shipCost)}`;
    }
  };

  const updatePurPreview = () => {
    const qty = Number(document.getElementById('pur-qty')?.value) || 0;
    const pCost = Number(document.getElementById('pur-purchase-cost')?.value) || 0;
    const sCost = Number(document.getElementById('pur-shipping-cost')?.value) || 0;
    const salePrice = Number(document.getElementById('pur-sale-price')?.value) || 0;
    const realUnitCost = Number((pCost + sCost).toFixed(2));
    const unitProfit = Number((salePrice - realUnitCost).toFixed(2));
    const batchProfit = Number((unitProfit * qty).toFixed(2));

    const box = document.getElementById('pur-calc-preview');
    if (box) {
      box.innerHTML = `
        <div class="summary-row">
          <span>Costo Real c/u (${fmtUSD(pCost)} pieza + ${fmtUSD(sCost)} envío):</span>
          <strong>${fmtUSD(realUnitCost)}</strong>
        </div>
        <div class="summary-row" style="margin-bottom:0; padding-top:6px; border-top:1px dashed var(--border-strong);">
          <span><strong>Tu Ganancia Libre:</strong></span>
          <strong style="color:${unitProfit >= 0 ? 'var(--olive-dark)' : 'var(--danger)'};">
            ${unitProfit >= 0 ? '+' : ''}${fmtUSD(unitProfit)} c/u${qty > 0 ? ` · Total (${qty}): ${batchProfit >= 0 ? '+' : ''}${fmtUSD(batchProfit)}` : ''}
          </strong>
        </div>
      `;
    }
  };

  document.getElementById('pur-batch')?.addEventListener('change', () => {
    applyBatchShipping();
    updatePurPreview();
  });

  document.getElementById('pur-product')?.addEventListener('change', e => {
    const prod = db.products.find(p => p.id === e.target.value);
    if (prod) {
      document.getElementById('pur-purchase-cost').value = prod.purchase_cost ?? prod.unit_cost;
      document.getElementById('pur-sale-price').value = Number(prod.sale_price) || 0;
      const previewEl = document.getElementById('pur-prod-img-preview');
      if (previewEl) {
        previewEl.innerHTML = prod.image_url
          ? `<img src="${escapeHTML(prod.image_url)}" alt="${escapeHTML(prod.name)}" />`
          : `${icon("hanger")}`;
      }
      applyBatchShipping();
      updatePurPreview();
    }
  });

  document.querySelectorAll('[data-pur-markup]').forEach(chip => {
    chip.addEventListener('click', () => {
      const pCost = Number(document.getElementById('pur-purchase-cost')?.value) || 0;
      const sCost = Number(document.getElementById('pur-shipping-cost')?.value) || 0;
      const totalUnit = pCost + sCost;
      const pct = Number(chip.dataset.purMarkup) || 50;
      if (totalUnit > 0) {
        document.getElementById('pur-sale-price').value = Number((totalUnit * (1 + pct / 100)).toFixed(2));
        updatePurPreview();
      } else {
        showToast('Ingresa primero el valor unitario de la pieza.');
      }
    });
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
    return { map, total };
  };

  document.querySelectorAll('[data-pur-size]').forEach(inp => {
    inp.addEventListener('input', () => {
      collectPurSizes();
      updatePurPreview();
    });
  });

  document.getElementById('pur-purchase-cost')?.addEventListener('input', updatePurPreview);
  document.getElementById('pur-sale-price')?.addEventListener('input', updatePurPreview);
  applyBatchShipping();
  updatePurPreview();

  document.getElementById('pur-cancel')?.addEventListener('click', closeModal);
  document.getElementById('pur-save')?.addEventListener('click', async () => {
    try {
      const { map: sizesAdded, total: totalQty } = collectPurSizes();
      const batchCode = document.getElementById('pur-batch').value;
      const { batch: linkedBatch, perPieceShip } = getBatchShippingPerPiece(batchCode);
      const autoDate = linkedBatch?.arrived_date || linkedBatch?.purchased_date || new Date().toISOString();
      const autoSupplier = linkedBatch?.supplier || 'Proveedor General';
      const pCost = Number(document.getElementById('pur-purchase-cost').value) || 0;
      const sCost = linkedBatch ? perPieceShip : (Number(document.getElementById('pur-shipping-cost').value) || 0);
      const salePrice = Number(document.getElementById('pur-sale-price').value) || 0;

      const rec = await db.createPurchase({
        product_id: document.getElementById('pur-product').value,
        batch_code: batchCode,
        restock_date: autoDate,
        quantity: totalQty,
        sizes_added: sizesAdded,
        purchase_cost: pCost,
        shipping_cost: sCost,
        unit_cost: Number((pCost + sCost).toFixed(2)),
        sale_price: salePrice,
        supplier: autoSupplier
      });
      closeModal();
      updateChrome();
      renderCurrentView();
      showToast(`Restock guardado en ${rec.batch_code} (+${rec.quantity} prendas · Envío ${fmtUSD(sCost)} c/u).`);
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
