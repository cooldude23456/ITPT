import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load canonical catalog from src/data/catalog.json
let cachedCatalog = null;

export function getCanonicalCatalog() {
  if (cachedCatalog) return cachedCatalog;
  try {
    const catalogPath = path.resolve(__dirname, '../src/data/catalog.json');
    const raw = fs.readFileSync(catalogPath, 'utf8');
    cachedCatalog = JSON.parse(raw);
    return cachedCatalog;
  } catch (err) {
    console.error('[Catalog Error] Failed to read canonical catalog:', err.message);
    return [];
  }
}

export function findCanonicalProduct(productId) {
  const catalog = getCanonicalCatalog();
  return catalog.find(p => p.id === productId) || null;
}

export function isCourseFree(product) {
  if (!product) return false;
  return Boolean(
    product.isFree ||
    product.priceINR === 0 ||
    product.priceUSD === 0 ||
    product.id === 'free-az900-diagnostic' ||
    product.id === '943fcd85-67de-4414-82ef-49fb24be3f74' ||
    product.id === '6804711e-87c7-4bae-a41a-6d80ba4a8f34'
  );
}

// Canonical coupon list & rules
export const CANONICAL_COUPONS = {
  TECHREADY: { code: 'TECHREADY', discountPercent: 20, isActive: true },
  YOGESH50: { code: 'YOGESH50', discountPercent: 50, isActive: true },
  DIWALI2026: { code: 'DIWALI2026', discountPercent: 30, isActive: true }
};

export function validateCoupon(code) {
  if (!code || typeof code !== 'string') return null;
  const clean = code.trim().toUpperCase();
  const found = CANONICAL_COUPONS[clean];
  if (found && found.isActive) return found;
  return null;
}
