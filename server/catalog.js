import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getProductById } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load canonical catalog from src/data/catalog.json
let cachedCatalog = null;
const dynamicProductsCache = new Map();

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
  if (!productId) return null;
  const catalog = getCanonicalCatalog();
  const found = catalog.find(p => p.id === productId);
  if (found) return found;

  if (dynamicProductsCache.has(productId)) {
    return dynamicProductsCache.get(productId);
  }

  return null;
}

export async function findProductOrCustom(item) {
  if (!item) return null;
  const id = typeof item === 'string' ? item : item.id;
  if (!id) return null;

  // 1. Check local catalog / memory cache
  const localFound = findCanonicalProduct(id);
  if (localFound) return localFound;

  // 2. Check Supabase products table
  try {
    const dbProduct = await getProductById(id);
    if (dbProduct) {
      dynamicProductsCache.set(id, dbProduct);
      return dbProduct;
    }
  } catch (err) {
    console.warn(`[Catalog Warning] Failed to query product "${id}" from database:`, err.message);
  }

  // 3. Fallback for custom instructor / user created courses
  if (typeof item === 'object' && (item.title || item.name)) {
    const pINR = Math.max(0, Number(item.priceINR ?? item.price_inr ?? item.price ?? 0));
    const pUSD = Math.max(0, Number(item.priceUSD ?? item.price_usd ?? (pINR > 0 ? +(pINR / 86).toFixed(2) : 0)));
    const customProd = {
      id: String(item.id).trim(),
      title: String(item.title || item.name).trim().slice(0, 200),
      vendor: item.vendor || 'ITPracticeTests Certified',
      category: item.category || 'Certification Practice Tests',
      priceINR: pINR,
      priceUSD: pUSD,
      isFree: pINR === 0 && pUSD === 0
    };
    dynamicProductsCache.set(customProd.id, customProd);
    return customProd;
  }

  return null;
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
