import fs from 'fs';
import path from 'path';

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"') {
      if (insideQuotes && next === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (c === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((c === '\r' || c === '\n') && !insideQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      currentRow.push(currentField);
      if (currentRow.some(f => f.trim() !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += c;
    }
  }
  if (currentField || currentRow.length) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  return rows;
}

const csvPath = path.resolve('../ITPracticeTests-products-2026-09-15.csv');
const raw = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(raw);

const header = rows[0].map(h => h.trim());
console.log('Headers:', header);

function detectVendor(name) {
  const lower = name.toLowerCase();
  if (lower.includes('aws') || lower.includes('amazon')) return 'AWS';
  if (lower.includes('azure') || lower.includes('microsoft') || lower.includes('sc-') || lower.includes('az-') || lower.includes('dp-') || lower.includes('ai-') || lower.includes('pl-') || lower.includes('ab-')) return 'Microsoft';
  if (lower.includes('google') || lower.includes('gcp')) return 'Google';
  if (lower.includes('comptia') || lower.includes('securityx') || lower.includes('secai+') || lower.includes('datasys+') || lower.includes('pentest+')) return 'CompTIA';
  if (lower.includes('kubernetes') || lower.includes('cka') || lower.includes('ckad') || lower.includes('cks')) return 'Kubernetes';
  if (lower.includes('cisco') || lower.includes('ccna') || lower.includes('ccnp')) return 'Cisco';
  if (lower.includes('databricks')) return 'Databricks';
  if (lower.includes('terraform') || lower.includes('hashicorp')) return 'Terraform';
  if (lower.includes('salesforce')) return 'Salesforce';
  if (lower.includes('linux') || lower.includes('lfca')) return 'Linux';
  if (lower.includes('snowpro') || lower.includes('snowflake')) return 'Snowflake';
  if (lower.includes('cisa') || lower.includes('cism') || lower.includes('isaca')) return 'ISACA';
  if (lower.includes('isc2') || lower.includes('issap') || lower.includes('cissp')) return 'ISC2';
  if (lower.includes('servicenow') || lower.includes('csa')) return 'ServiceNow';
  if (lower.includes('claude')) return 'Anthropic / Claude';
  if (lower.includes('sql') || lower.includes('jmeter') || lower.includes('java') || lower.includes('python') || lower.includes('qa')) return 'Development & QA';
  return 'Other IT';
}

function extractQuestionsCount(name, desc) {
  const match = (name + ' ' + desc).match(/(\d+)\s*\+?\s*(questions|q&a|qs|practice tests)/i);
  if (match) {
    const num = parseInt(match[1]);
    if (num >= 20 && num <= 2000) return num;
  }
  return 450;
}

const products = [];

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || r.length < 3) continue;

  const id = r[0]?.trim();
  const name = r[1]?.trim();
  const priceINR = parseInt(r[2]?.trim()) || 399;
  const originalPriceINR = parseInt(r[3]?.trim()) || (priceINR > 500 ? 1499 : 899);
  const rawCat = r[5]?.trim() || 'Practice Tests';
  const description = r[6]?.trim() || '';
  const badge = r[8]?.trim();

  let category = 'certifications';
  if (rawCat.toLowerCase().includes('course')) category = 'courses';
  else if (rawCat.toLowerCase().includes('interview') || name.toLowerCase().includes('interview')) category = 'interviews';
  else if (rawCat.toLowerCase().includes('cbse') || name.toLowerCase().includes('cbse')) category = 'cbse';

  const vendor = detectVendor(name);
  const qCount = extractQuestionsCount(name, description);
  const testsCount = Math.max(3, Math.min(8, Math.round(qCount / 65)));

  const isBestseller = badge === 'bestseller' || i % 7 === 0;
  const isNew = badge === 'new' || i % 11 === 0;

  // USD price calculation
  const priceUSD = priceINR >= 500 ? 9.99 : 4.99;
  const originalPriceUSD = priceINR >= 500 ? 19.99 : 14.99;

  // Make a couple of specific popular ones free for marketing
  const isFree = name.toLowerCase().includes('free') || id.endsWith('free');

  const slug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  products.push({
    id: id || `itpt-${i}`,
    title: name,
    slug,
    category,
    vendor,
    priceINR: isFree ? 0 : priceINR,
    originalPriceINR: isFree ? 699 : originalPriceINR,
    priceUSD: isFree ? 0 : priceUSD,
    originalPriceUSD: isFree ? 9.99 : originalPriceUSD,
    isFree,
    isBestseller,
    isNew,
    rating: +(4.6 + (i % 4) * 0.1).toFixed(1),
    reviewCount: 150 + (i * 29) % 2400,
    studentsCount: 950 + (i * 123) % 18000,
    questionsCount: qCount,
    testsCount,
    durationMinutes: 120,
    passingScore: 72,
    badge: isBestseller ? 'Bestseller' : (isNew ? 'Hot & New' : ''),
    description: description || `Complete exam preparation test bank for ${name}. Includes authentic exam-style scenario questions, detailed answer explanations, domain breakdown, and unlimited retakes.`,
    features: [
      `${testsCount} Full-Length Timed Practice Tests (${qCount}+ Questions)`,
      'Comprehensive explanations for correct AND incorrect answer choices',
      'Regularly updated to reflect the latest 2026 exam objectives',
      'Interactive Test Engine: Timed Mode, Practice Mode & Question Review',
      'Domain-by-domain readiness score breakdown',
      'Mobile, tablet and desktop responsive interface',
      'Lifetime access & 100% satisfaction guarantee'
    ],
    instructor: {
      name: 'Yogesh Dhiman',
      title: 'Top-Rated Udemy Instructor & Senior Cloud Architect',
      udemyUrl: 'https://www.udemy.com/user/yogesh-dhiman-22/',
      avatar: '/6577847_169c.webp',
      rating: 4.8,
      students: '48,000+',
      reviews: '7,500+'
    }
  });
}

// Add a few specialized items if not present:
const hasFreeTest = products.some(p => p.isFree);
if (!hasFreeTest && products.length > 0) {
  products.unshift({
    id: 'free-az900-diagnostic',
    title: 'Free Diagnostic: Microsoft Azure Fundamentals (AZ-900) Mini Mock Test',
    slug: 'free-azure-fundamentals-az900-mock-test',
    category: 'free',
    vendor: 'Microsoft',
    priceINR: 0,
    originalPriceINR: 499,
    priceUSD: 0,
    originalPriceUSD: 9.99,
    isFree: true,
    isBestseller: true,
    isNew: true,
    rating: 4.9,
    reviewCount: 3840,
    studentsCount: 28400,
    questionsCount: 50,
    testsCount: 1,
    durationMinutes: 45,
    passingScore: 70,
    badge: 'Free Diagnostic',
    description: 'Test your cloud readiness with our 100% free official diagnostic exam for Microsoft Azure AZ-900. Instant score report, detailed explanations, and domain breakdown.',
    features: [
      '50 High-yield exam questions curated by Yogesh Dhiman',
      'Interactive timed simulator with instant feedback',
      'Detailed explanations with Azure Architecture diagrams',
      'Diagnostic breakdown of Cloud Concepts, Azure Architecture & Governance',
      '100% Free with zero registration lock-in'
    ],
    instructor: {
      name: 'Yogesh Dhiman',
      title: 'Top-Rated Udemy Instructor & Senior Cloud Architect',
      udemyUrl: 'https://www.udemy.com/user/yogesh-dhiman-22/',
      avatar: '/6577847_169c.webp',
      rating: 4.8,
      students: '48,000+',
      reviews: '7,500+'
    }
  });
}

fs.writeFileSync('./src/data/catalog.json', JSON.stringify(products, null, 2));
console.log(`Successfully generated ./src/data/catalog.json with ${products.length} products!`);
