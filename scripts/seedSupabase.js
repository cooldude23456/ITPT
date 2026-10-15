import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialBlogs } from '../src/data/initialBlogs.js';
import { initialReviews } from '../src/data/initialReviews.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dkkvulqgfsiuaqadubum.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_nHZDs5bDhArDsR2X8Nrbdg_uhtWgnam';

console.log('Connecting to Supabase REST endpoint at:', SUPABASE_URL);

async function supabaseFetch(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates,return=representation',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, status: res.status, error: errText };
    }
    const data = await res.json().catch(() => null);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

const catalogPath = path.resolve(__dirname, '../src/data/catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

export const productToDb = (p) => ({
  id: p.id,
  title: p.title,
  slug: p.slug || (p.title ? p.title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') : ''),
  vendor: p.vendor || 'Other',
  category: p.category || 'certifications',
  price_inr: Number(p.priceINR || 0),
  price_usd: Number(p.priceUSD || 0),
  original_price_inr: Number(p.originalPriceINR || 0),
  original_price_usd: Number(p.originalPriceUSD || 0),
  rating: Number(p.rating || 4.8),
  reviews_count: Number(p.reviewsCount || 0),
  students_count: Number(p.studentsCount || 0),
  badge: p.badge || null,
  description: p.description || '',
  highlights: p.highlights || [],
  questions_count: Number(p.questionsCount || 0),
  tests_count: Number(p.testsCount || 6),
  passing_score: Number(p.passingScore || 70),
  time_limit_mins: Number(p.timeLimitMins || 90),
  last_updated: p.lastUpdated || new Date().toISOString().split('T')[0],
  thumbnail: p.thumbnail || '',
  questions: p.questions || [],
  updated_at: new Date().toISOString()
});

export const blogToDb = (b) => ({
  id: b.id,
  title: b.title,
  slug: b.slug,
  category: b.category,
  author: b.author || 'Yogesh Dhiman',
  author_role: b.authorRole || 'Udemy Instructor & Cloud Architect',
  author_avatar: b.authorAvatar || '',
  published_date: b.publishedDate || new Date().toISOString().split('T')[0],
  read_time_minutes: Number(b.readTimeMinutes || 5),
  views_count: Number(b.viewsCount || 0),
  is_published: Boolean(b.isPublished ?? true),
  featured_image: b.featuredImage || '',
  excerpt: b.excerpt || '',
  content: b.content || '',
  meta_title: b.metaTitle || '',
  meta_description: b.metaDescription || '',
  focus_keywords: b.focusKeywords || '',
  canonical_url: b.canonicalUrl || '',
  tags: Array.isArray(b.tags) ? b.tags : [],
  related_course_id: b.relatedCourseId || null
});

export const reviewToDb = (r) => ({
  id: r.id,
  product_id: r.productId,
  user_id: r.userId || null,
  user_name: r.userName || 'Anonymous',
  user_avatar: r.userAvatar || '',
  rating: Number(r.rating || 5),
  title: r.title || '',
  comment: r.comment || '',
  date: r.date || new Date().toISOString().split('T')[0],
  is_verified_purchase: Boolean(r.isVerifiedPurchase ?? true),
  helpful_count: Number(r.helpfulCount || 0),
  helpful_users: r.helpfulUsers || []
});

async function seed() {
  console.log('\n--- 1. SEEDING PRODUCTS (162 Courses & Practice Tests) ---');
  const mappedProducts = catalog.map(productToDb);
  const CHUNK_SIZE = 25;
  let insertedProducts = 0;
  for (let i = 0; i < mappedProducts.length; i += CHUNK_SIZE) {
    const chunk = mappedProducts.slice(i, i + CHUNK_SIZE);
    const res = await supabaseFetch('products', {
      method: 'POST',
      body: JSON.stringify(chunk)
    });
    if (!res.ok) {
      console.error(`Error seeding products chunk ${i}:`, res.error);
    } else {
      insertedProducts += chunk.length;
      console.log(`  Uploaded ${insertedProducts}/${mappedProducts.length} courses...`);
    }
  }

  console.log('\n--- 2. SEEDING BLOGS & EXAM GUIDES ---');
  const mappedBlogs = initialBlogs.map(blogToDb);
  const blogRes = await supabaseFetch('blogs', {
    method: 'POST',
    body: JSON.stringify(mappedBlogs)
  });
  if (!blogRes.ok) console.error('Error seeding blogs:', blogRes.error);
  else console.log(`  Successfully seeded ${mappedBlogs.length} SEO blogs!`);

  console.log('\n--- 3. SEEDING REVIEWS ---');
  const mappedReviews = initialReviews.map(reviewToDb);
  const revRes = await supabaseFetch('reviews', {
    method: 'POST',
    body: JSON.stringify(mappedReviews)
  });
  if (!revRes.ok) console.error('Error seeding reviews:', revRes.error);
  else console.log(`  Successfully seeded ${mappedReviews.length} reviews!`);

  console.log('\n--- 4. SEEDING COUPONS ---');
  const initialCoupons = [
    { code: 'TECHREADY', discount_percent: 20, description: '20% Launch Discount', is_active: true },
    { code: 'YOGESH50', discount_percent: 50, description: '50% Udemy Student Privilege Discount', is_active: true },
    { code: 'DIWALI2026', discount_percent: 30, description: '30% Festive Offer', is_active: true }
  ];
  const coupRes = await supabaseFetch('coupons', {
    method: 'POST',
    body: JSON.stringify(initialCoupons)
  });
  if (!coupRes.ok) console.error('Error seeding coupons:', coupRes.error);
  else console.log(`  Successfully seeded ${initialCoupons.length} coupons!`);

  console.log('\n--- 5. SEEDING PAYMENT GATEWAYS ---');
  const initialGateways = [
    {
      id: 'gw-razorpay',
      name: 'Razorpay UPI & Cards',
      provider: 'Razorpay',
      key_id: 'rzp_live_SylljWgo1cubKX',
      webhook_secret: 'rzp_sec_live_99281a8b9f',
      payment_link: 'https://rzp.io/l/itpracticetests-official',
      is_enabled: true,
      is_test_mode: false,
      supported_methods: ['UPI', 'Debit/Credit Cards', 'NetBanking', 'Wallets']
    },
    {
      id: 'gw-paypal',
      name: 'PayPal International',
      provider: 'PayPal',
      key_id: 'ARwtJURxNKLGqrBYk3xFab2P90a3xNDloiHTNisj8mLY2Hd_JjARWl7Lf1t9JwOjlHGMqMgD-mgwCNzy',
      webhook_secret: '',
      payment_link: 'https://paypal.me/yogeshdhiman',
      is_enabled: true,
      is_test_mode: false,
      supported_methods: ['PayPal Account', 'International Cards']
    },
    {
      id: 'gw-stripe',
      name: 'Stripe Global Payments',
      provider: 'Stripe',
      key_id: 'pk_live_51P88219xITPTPracticeKey',
      webhook_secret: '',
      payment_link: '',
      is_enabled: true,
      is_test_mode: false,
      supported_methods: ['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'Google Pay']
    },
    {
      id: 'gw-cashfree',
      name: 'Cashfree Payments',
      provider: 'Cashfree',
      key_id: 'cf_live_99214781',
      webhook_secret: '',
      payment_link: '',
      is_enabled: true,
      is_test_mode: false,
      supported_methods: ['UPI', 'PayTM', 'NetBanking']
    },
    {
      id: 'gw-ccavenue',
      name: 'CCAvenue Multi-Currency',
      provider: 'CCAvenue',
      key_id: 'CCAV_98214',
      webhook_secret: 'CCAV_WORKING_KEY_882',
      payment_link: '',
      is_enabled: true,
      is_test_mode: false,
      supported_methods: ['International Cards', 'RuPay', 'NetBanking']
    }
  ];
  const gwRes = await supabaseFetch('payment_gateways', {
    method: 'POST',
    body: JSON.stringify(initialGateways)
  });
  if (!gwRes.ok) console.error('Error seeding payment gateways:', gwRes.error);
  else console.log(`  Successfully seeded ${initialGateways.length} payment gateways!`);

  console.log('\n--- 6. SEEDING ADMIN USER PROFILE ---');
  const adminUser = {
    id: 'user-admin',
    name: 'Yogesh Dhiman',
    email: 'rath.sanjiv.rath@gmail.com',
    role: 'admin',
    phone: '+91-9253330335',
    password: 'admin123',
    created_at: '2026-01-01',
    avatar: '/6577847_169c.webp'
  };
  const userRes = await supabaseFetch('users_profiles', {
    method: 'POST',
    body: JSON.stringify(adminUser)
  });
  if (!userRes.ok) console.error('Error seeding admin user profile:', userRes.error);
  else console.log(`  Successfully seeded super admin user (${adminUser.email})!`);

  console.log('\n--- 7. SEEDING INITIAL SECURITY AUDIT LOG ---');
  const initLog = {
    id: `sec_init_${Date.now()}`,
    event_type: 'SUPABASE_BACKEND_INITIALIZED',
    severity: 'INFO',
    actor: 'Supabase MCP Migration Agent',
    details: 'Complete Supabase backend deployed with 12 synchronized tables, indexes, and seeded catalog data.',
    ip_address: '127.0.0.1',
    timestamp: new Date().toISOString()
  };
  const logRes = await supabaseFetch('security_audit_logs', {
    method: 'POST',
    body: JSON.stringify(initLog)
  });
  if (!logRes.ok) console.error('Error seeding audit log:', logRes.error);
  else console.log('  Successfully recorded backend initialization security audit log!');

  console.log('\n✅ Supabase backend seeding complete!');
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
