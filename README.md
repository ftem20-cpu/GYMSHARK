# InventarioPro — Sistema de Control de Inventario, Ventas y Costos (USD $)

Aplicación web diseñada para llevar el control interno de **Inventario, Ventas (POS), Compras a Proveedores, Gastos Operativos y Ganancia Neta en Dólares (USD $)**, con soporte para múltiples usuarios (**Administrador** y **Vendedor**), exportación/importación **Excel (CSV)** y sincronización en la nube con **Supabase (PostgreSQL)**.

---

## 🚀 Cómo abrir y usar la aplicación

### Opción 1: Abrir directamente en tu navegador (Sin instalar nada)
Haz doble clic sobre el archivo [`index.html`](./index.html) en Finder (o ábrelo en Chrome / Safari / Edge):
- Ruta: `/Users/fabianaespinoza/.gemini/antigravity/scratch/inventario-pro/index.html`

### Opción 2: Publicar en Internet (Acceso desde celulares y otras computadoras)
Puedes arrastrar la carpeta `inventario-pro` directamente a **[Netlify Drop](https://app.netlify.com/drop)**, **Vercel** o **GitHub Pages** para obtener un enlace web público gratuito conectado a tu base de datos en **Supabase**.

---

## 👥 Roles y Usuarios Incluidos (Modo Demo)

Puedes alternar entre usuarios en cualquier momento desde el selector superior derecho (**"Vista activa"**) o desde el botón **"Cambiar Usuario / Sesión"**:

| Rol | Usuario / Correo | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@empresa.com` | `admin123` | Acceso completo: Dashboard financiero, costos unitarios, márgenes de ganancia, compras, gastos fijos, Excel/CSV y configuración de Supabase. |
| **Vendedor** | `ventas@empresa.com` | `ventas123` | Acceso operativo: Punto de Venta (POS), historial de ventas y consulta de catálogo/stock (oculta costos de compra, ganancias netas y gastos de la empresa). |

---

## ☁️ Cómo conectar con Supabase (Base de Datos en la Nube Gratuita)

1. Crea una cuenta y un proyecto gratuito en [https://supabase.com](https://supabase.com).
2. En el menú izquierdo de Supabase, entra en **SQL Editor** → **New Query**.
3. Abre el archivo [`supabase_schema.sql`](./supabase_schema.sql) (o cópialo directamente desde la pestaña **☁️ Nube (Supabase) y Usuarios** dentro de la app) y haz clic en **Run**.
4. En Supabase, ve a **Project Settings** → **API** y copia tu **Project URL** y tu **anon public key**.
5. Pégalos en la pestaña **☁️ Nube (Supabase) y Usuarios** de InventarioPro y haz clic en **"Guardar y Conectar con Supabase"** y luego en **"Subir Datos Locales a la Nube"**.
