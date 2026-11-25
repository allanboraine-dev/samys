import { Product, ProductCategory } from '@/types';

const VALID_CATEGORIES: ProductCategory[] = [
  'Snacks & Chips',
  'Beverages',
  'Groceries & Staples',
  'Sweets & Confectionery',
  'Household',
];

export const CSV_HEADERS = [
  'id',
  'name',
  'brand',
  'category',
  'description',
  'retailUnit',
  'retailPrice',
  'retailOldPrice',
  'caseUnit',
  'caseUnitsCount',
  'traderCasePrice',
  'traderOldCasePrice',
  'stockQuantity',
  'isMonthEndSpecial',
  'badge',
  'imageUrl',
] as const;

function escapeCsvValue(val: string | number | boolean | undefined): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportProductsToCsv(products: Product[]): string {
  const headerLine = CSV_HEADERS.join(',');
  const lines = products.map((p) => {
    const qty = p.stockQuantity ?? (p.inStock ? 50 : 0);
    return [
      escapeCsvValue(p.id),
      escapeCsvValue(p.name),
      escapeCsvValue(p.brand),
      escapeCsvValue(p.category),
      escapeCsvValue(p.description),
      escapeCsvValue(p.retailUnit),
      escapeCsvValue(p.retailPrice.toFixed(2)),
      escapeCsvValue(p.retailOldPrice !== undefined ? p.retailOldPrice.toFixed(2) : ''),
      escapeCsvValue(p.caseUnit),
      escapeCsvValue(p.caseUnitsCount),
      escapeCsvValue(p.traderCasePrice.toFixed(2)),
      escapeCsvValue(p.traderOldCasePrice !== undefined ? p.traderOldCasePrice.toFixed(2) : ''),
      escapeCsvValue(qty),
      escapeCsvValue(Boolean(p.isMonthEndSpecial)),
      escapeCsvValue(p.badge ?? ''),
      escapeCsvValue(p.imageUrl),
    ].join(',');
  });
  return [headerLine, ...lines].join('\r\n');
}

function parseCsvMatrix(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  // Strip UTF-8 BOM if present
  const cleanText = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  for (let i = 0; i < cleanText.length; i++) {
    const ch = cleanText[i];
    const next = cleanText[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (ch === '\r' && next === '\n') {
      row.push(cell.trim());
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
      cell = '';
      i++;
    } else if (ch === '\n' || ch === '\r') {
      row.push(cell.trim());
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }

  row.push(cell.trim());
  if (row.some((v) => v !== '')) rows.push(row);

  return rows;
}

function parseBool(val: string | undefined): boolean {
  if (!val) return false;
  const normalized = val.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

function parseCategory(val: string | undefined): ProductCategory {
  if (!val) return 'Groceries & Staples';
  const match = VALID_CATEGORIES.find(
    (c) => c.toLowerCase() === val.trim().toLowerCase()
  );
  return match || 'Groceries & Staples';
}

export interface CsvParseResult {
  products: Product[];
  errors: string[];
}

export function parseStockCsv(text: string): CsvParseResult {
  const matrix = parseCsvMatrix(text);
  if (matrix.length < 2) {
    return {
      products: [],
      errors: ['CSV must include a header row and at least one product row.'],
    };
  }

  const rawHeaders = matrix[0].map((h) => h.trim().toLowerCase().replace(/[\s_-]+/g, ''));
  const colIndex = (aliases: string[]): number => {
    for (const alias of aliases) {
      const idx = rawHeaders.indexOf(alias.toLowerCase().replace(/[\s_-]+/g, ''));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idxId = colIndex(['id', 'sku']);
  const idxName = colIndex(['name', 'productname', 'title']);
  const idxBrand = colIndex(['brand']);
  const idxCategory = colIndex(['category']);
  const idxDesc = colIndex(['description', 'desc']);
  const idxRetailUnit = colIndex(['retailunit', 'unit']);
  const idxRetailPrice = colIndex(['retailprice', 'price']);
  const idxRetailOld = colIndex(['retailoldprice', 'oldprice', 'wasprice']);
  const idxCaseUnit = colIndex(['caseunit', 'bulkunit']);
  const idxCaseCount = colIndex(['caseunitscount', 'unitspercase', 'casecount']);
  const idxTraderPrice = colIndex(['tradercaseprice', 'caseprice', 'wholesaleprice']);
  const idxTraderOld = colIndex(['traderoldcaseprice', 'oldcaseprice']);
  const idxStock = colIndex(['stockquantity', 'stock', 'qty', 'quantity']);
  const idxSpecial = colIndex(['ismonthendspecial', 'special', 'promo']);
  const idxBadge = colIndex(['badge']);
  const idxImage = colIndex(['imageurl', 'image']);

  if (idxName === -1 || idxRetailPrice === -1 || idxTraderPrice === -1) {
    return {
      products: [],
      errors: [
        'Missing required columns: "name", "retailPrice", and "traderCasePrice" are required.',
      ],
    };
  }

  const products: Product[] = [];
  const errors: string[] = [];

  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r];
    const rowNum = r + 1;
    const get = (idx: number) => (idx !== -1 && idx < row.length ? row[idx] : '');

    const name = get(idxName).trim();
    const brand = get(idxBrand).trim() || 'Samy\'s';
    const retailPrice = parseFloat(get(idxRetailPrice));
    const traderCasePrice = parseFloat(get(idxTraderPrice));

    if (!name) {
      errors.push(`Row ${rowNum}: Missing product name (skipped).`);
      continue;
    }
    if (Number.isNaN(retailPrice) || retailPrice <= 0) {
      errors.push(`Row ${rowNum} ("${name}"): Invalid retailPrice "${get(idxRetailPrice)}" (skipped).`);
      continue;
    }
    if (Number.isNaN(traderCasePrice) || traderCasePrice <= 0) {
      errors.push(`Row ${rowNum} ("${name}"): Invalid traderCasePrice "${get(idxTraderPrice)}" (skipped).`);
      continue;
    }

    const parsedCaseCount = parseInt(get(idxCaseCount), 10);
    const caseUnitsCount = !Number.isNaN(parsedCaseCount) && parsedCaseCount >= 1 ? parsedCaseCount : 12;

    const parsedStock = parseInt(get(idxStock), 10);
    const stockQuantity = !Number.isNaN(parsedStock) ? Math.max(0, parsedStock) : 50;

    const retailOldVal = parseFloat(get(idxRetailOld));
    const traderOldVal = parseFloat(get(idxTraderOld));
    const isMonthEndSpecial = parseBool(get(idxSpecial));
    const badge = get(idxBadge).trim() || (isMonthEndSpecial ? 'MONTH-END SPECIAL' : undefined);

    products.push({
      id: get(idxId).trim() || `sam-csv-${Date.now()}-${r}`,
      name,
      brand,
      category: parseCategory(get(idxCategory)),
      description: get(idxDesc).trim() || `${brand} — available at Samy's Cash & Carry.`,
      imageUrl: get(idxImage).trim(),
      retailUnit: get(idxRetailUnit).trim() || '1 unit',
      retailPrice: Number(retailPrice.toFixed(2)),
      retailOldPrice: !Number.isNaN(retailOldVal) && retailOldVal > 0 ? Number(retailOldVal.toFixed(2)) : undefined,
      caseUnit: get(idxCaseUnit).trim() || `Case of ${caseUnitsCount}`,
      caseUnitsCount,
      traderCasePrice: Number(traderCasePrice.toFixed(2)),
      traderOldCasePrice: !Number.isNaN(traderOldVal) && traderOldVal > 0 ? Number(traderOldVal.toFixed(2)) : undefined,
      stockQuantity,
      inStock: stockQuantity > 0,
      isMonthEndSpecial,
      badge,
    });
  }

  return { products, errors };
}
