-- ============================================================================
-- INVENTARIOPRO - ESQUEMA DE BASE DE DATOS PARA SUPABASE (PostgreSQL)
-- Instrucciones: Copia y pega este script en el "SQL Editor" de tu proyecto
-- en Supabase (https://supabase.com/dashboard) y haz clic en "Run".
-- ============================================================================

-- 1. Tabla de Usuarios / Perfiles Internos
CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'vendedor' CHECK (role IN ('admin', 'vendedor')),
    pin_or_password TEXT NOT NULL DEFAULT '123456',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabla de Catálogo de Productos (Inventario)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Mujer',
    item_type TEXT NOT NULL DEFAULT 'product',
    image_url TEXT,
    batch_code TEXT DEFAULT 'LOTE-01',
    last_restock_at TIMESTAMPTZ DEFAULT NOW(),
    stock NUMERIC(12, 2) NOT NULL DEFAULT 0,
    min_stock NUMERIC(12, 2) NOT NULL DEFAULT 5,
    purchase_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sale_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'und',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabla de Ventas (Cabecera y Detalle en JSONB para alta velocidad y atomicidad)
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY,
    receipt_number TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    customer_name TEXT DEFAULT 'Cliente General',
    payment_method TEXT NOT NULL DEFAULT 'Efectivo USD',
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

-- 4. Tabla de Compras / Entradas de Mercancía
CREATE TABLE IF NOT EXISTS public.purchases (
    id TEXT PRIMARY KEY,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    product_id TEXT NOT NULL,
    product_sku TEXT NOT NULL,
    product_name TEXT NOT NULL,
    supplier TEXT DEFAULT 'Proveedor General',
    invoice_ref TEXT,
    quantity NUMERIC(12, 2) NOT NULL,
    purchase_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit_cost NUMERIC(12, 2) NOT NULL,
    total_cost NUMERIC(12, 2) NOT NULL,
    registered_by TEXT NOT NULL DEFAULT 'Administrador',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabla de Costos Operativos y Gastos Fijos
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

-- 6. Tabla de Control y Seguimiento de Lotes (Adquirido -> En Vía -> Llegó / Finalizado)
CREATE TABLE IF NOT EXISTS public.batches (
    id TEXT PRIMARY KEY,
    batch_code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    supplier TEXT DEFAULT 'Proveedor General',
    items_count NUMERIC(12, 2) NOT NULL DEFAULT 0,
    purchase_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'adquirido' CHECK (status IN ('adquirido', 'en_via', 'llego')),
    purchased_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    in_transit_date TIMESTAMPTZ,
    arrived_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas y reportes rápidos
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(date DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON public.purchases(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date DESC);

-- Habilitar Row Level Security (RLS) con políticas de acceso para la app interna
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (Permite lectura/escritura con la clave del proyecto de la empresa)
DROP POLICY IF EXISTS "Acceso interno app_users" ON public.app_users;
CREATE POLICY "Acceso interno app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso interno products" ON public.products;
CREATE POLICY "Acceso interno products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso interno sales" ON public.sales;
CREATE POLICY "Acceso interno sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso interno purchases" ON public.purchases;
CREATE POLICY "Acceso interno purchases" ON public.purchases FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso interno expenses" ON public.expenses;
CREATE POLICY "Acceso interno expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
