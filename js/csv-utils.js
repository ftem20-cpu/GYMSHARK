// ============================================================================
// INVENTARIOPRO - MOTOR DE EXPORTACIÓN E IMPORTACIÓN EXCEL / CSV
// Soporta separadores por coma (,) y punto y coma (;) con UTF-8 BOM para Excel
// ============================================================================

export function downloadCSV(filename, headers, rows) {
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

export function downloadJSON(filename, dataObj) {
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

export function parseCSVProducts(csvText) {
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
