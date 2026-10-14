import { supabase, SUPABASE_PROJECT_ID, SUPABASE_URL } from '../lib/supabase';

// ==============================================================================
// 1. DATA MAPPING HELPERS (JavaScript camelCase <=> PostgreSQL snake_case)
// ==============================================================================

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

export const dbToProduct = (row) => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  vendor: row.vendor,
  category: row.category,
  priceINR: Number(row.price_inr || 0),
  priceUSD: Number(row.price_usd || 0),
  originalPriceINR: Number(row.original_price_inr || 0),
  originalPriceUSD: Number(row.original_price_usd || 0),
  rating: Number(row.rating || 4.8),
  reviewsCount: Number(row.reviews_count || 0),
  studentsCount: Number(row.students_count || 0),
  badge: row.badge,
  description: row.description,
  highlights: Array.isArray(row.highlights) ? row.highlights : [],
  questionsCount: Number(row.questions_count || 0),
  testsCount: Number(row.tests_count || 6),
  passingScore: Number(row.passing_score || 70),
  timeLimitMins: Number(row.time_limit_mins || 90),
  lastUpdated: row.last_updated,
  thumbnail: row.thumbnail,
  questions: Array.isArray(row.questions) ? row.questions : []
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

export const dbToReview = (row) => ({
  id: row.id,
  productId: row.product_id,
  userId: row.user_id,
  userName: row.user_name,
  userAvatar: row.user_avatar,
  rating: Number(row.rating || 5),
  title: row.title,
  comment: row.comment,
  date: row.date,
  isVerifiedPurchase: Boolean(row.is_verified_purchase),
  helpfulCount: Number(row.helpful_count || 0),
  helpfulUsers: Array.isArray(row.helpful_users) ? row.helpful_users : []
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

export const dbToBlog = (row) => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  category: row.category,
  author: row.author,
  authorRole: row.author_role,
  authorAvatar: row.author_avatar,
  publishedDate: row.published_date,
  readTimeMinutes: Number(row.read_time_minutes || 5),
  viewsCount: Number(row.views_count || 0),
  isPublished: Boolean(row.is_published),
  featuredImage: row.featured_image,
  excerpt: row.excerpt,
  content: row.content,
  metaTitle: row.meta_title,
  metaDescription: row.meta_description,
  focusKeywords: row.focus_keywords,
  canonicalUrl: row.canonical_url,
  tags: Array.isArray(row.tags) ? row.tags : [],
  relatedCourseId: row.related_course_id
});

export const orderToDb = (o) => ({
  id: o.orderId || o.id,
  order_id: o.orderId || o.id,
  date: o.date || new Date().toISOString().split('T')[0],
  customer_name: o.customerName || 'Student',
  customer_email: o.customerEmail || '',
  customer_phone: o.customerPhone || '',
  items: o.items || [],
  currency: o.currency || 'INR',
  subtotal: Number(o.subtotal || 0),
  discount: Number(o.discount || 0),
  total: Number(o.total || 0),
  payment_method: o.paymentMethod || 'UPI',
  payment_gateway: o.paymentGateway || 'Razorpay',
  transaction_id: o.transactionId || '',
  admin_notification_sent: Boolean(o.adminNotificationSent ?? true),
  admin_notification_recipient: o.adminNotificationRecipient || 'support@itpracticetests.com'
});

export const dbToOrder = (row) => ({
  id: row.id,
  orderId: row.order_id || row.id,
  date: row.date,
  customerName: row.customer_name,
  customerEmail: row.customer_email,
  customerPhone: row.customer_phone,
  items: Array.isArray(row.items) ? row.items : [],
  currency: row.currency || 'INR',
  subtotal: Number(row.subtotal || 0),
  discount: Number(row.discount || 0),
  total: Number(row.total || 0),
  paymentMethod: row.payment_method,
  paymentGateway: row.payment_gateway,
  transactionId: row.transaction_id,
  adminNotificationSent: Boolean(row.admin_notification_sent),
  adminNotificationRecipient: row.admin_notification_recipient
});

// ==============================================================================
// 2. SUPABASE CRUD OPERATIONS WITH SAFE ERROR-HANDLING
// ==============================================================================

/**
 * Test connectivity to Supabase backend and check if tables exist
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, title')
      .limit(1);

    if (error) {
      // Check if table missing error (404/42P01)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          connected: true,
          tablesReady: false,
          message: 'Supabase connected! Database tables have not been created yet. Run supabase_schema.sql in Supabase SQL Editor.',
          error: error.message
        };
      }
      return {
        connected: false,
        tablesReady: false,
        message: `Supabase error: ${error.message}`,
        error
      };
    }

    return {
      connected: true,
      tablesReady: true,
      message: `🟢 Live Connected to Supabase (Project: ${SUPABASE_PROJECT_ID})`,
      count: data ? data.length : 0
    };
  } catch (err) {
    return {
      connected: false,
      tablesReady: false,
      message: `Connection failed: ${err.message}`,
      error: err
    };
  }
}

// ---------------- PRODUCTS ----------------

export async function fetchProductsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(dbToProduct);
    }
    return null;
  } catch (err) {
    console.warn('[Supabase] Failed to fetch products:', err.message);
    return null;
  }
}

export async function saveProductToSupabase(product) {
  try {
    const payload = productToDb(product);
    const { data, error } = await supabase
      .from('products')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: dbToProduct(data) };
  } catch (err) {
    console.warn('[Supabase] Failed to save product:', err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteProductFromSupabase(productId) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn('[Supabase] Failed to delete product:', err.message);
    return { success: false, error: err.message };
  }
}

// ---------------- REVIEWS ----------------

export async function fetchReviewsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(dbToReview);
    }
    return null;
  } catch (err) {
    console.warn('[Supabase] Failed to fetch reviews:', err.message);
    return null;
  }
}

export async function saveReviewToSupabase(review) {
  try {
    const payload = reviewToDb(review);
    const { data, error } = await supabase
      .from('reviews')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: dbToReview(data) };
  } catch (err) {
    console.warn('[Supabase] Failed to save review:', err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteReviewFromSupabase(reviewId) {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn('[Supabase] Failed to delete review:', err.message);
    return { success: false, error: err.message };
  }
}

// ---------------- BLOGS ----------------

export async function fetchBlogsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('published_date', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(dbToBlog);
    }
    return null;
  } catch (err) {
    console.warn('[Supabase] Failed to fetch blogs:', err.message);
    return null;
  }
}

export async function saveBlogToSupabase(blog) {
  try {
    const payload = blogToDb(blog);
    const { data, error } = await supabase
      .from('blogs')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: dbToBlog(data) };
  } catch (err) {
    console.warn('[Supabase] Failed to save blog:', err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteBlogFromSupabase(blogId) {
  try {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', blogId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn('[Supabase] Failed to delete blog:', err.message);
    return { success: false, error: err.message };
  }
}

// ---------------- ORDERS ----------------

export async function fetchOrdersFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(dbToOrder);
    }
    return null;
  } catch (err) {
    console.warn('[Supabase] Failed to fetch orders:', err.message);
    return null;
  }
}

export async function saveOrderToSupabase(order) {
  try {
    const payload = orderToDb(order);
    const { data, error } = await supabase
      .from('orders')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: dbToOrder(data) };
  } catch (err) {
    console.warn('[Supabase] Failed to save order:', err.message);
    return { success: false, error: err.message };
  }
}

// ---------------- USERS & PROFILES ----------------

export async function fetchUsersFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('users_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password,
        phone: u.phone,
        role: u.role,
        avatar: u.avatar,
        createdAt: u.created_at
      }));
    }
    return null;
  } catch (err) {
    console.warn('[Supabase] Failed to fetch users:', err.message);
    return null;
  }
}

export async function saveUserToSupabase(user) {
  try {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email.toLowerCase(),
      password: user.password || 'student123',
      phone: user.phone || '',
      role: user.role || 'student',
      avatar: user.avatar || '',
      created_at: user.createdAt || new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('users_profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase] Failed to save user:', err.message);
    return { success: false, error: err.message };
  }
}

// ---------------- CUSTOM QUESTION BANKS ----------------

export async function fetchQuestionBanksFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('custom_question_banks')
      .select('*');

    if (error) throw error;
    if (data && data.length > 0) {
      const bankMap = {};
      data.forEach(row => {
        if (!bankMap[row.product_id]) {
          bankMap[row.product_id] = {};
        }
        bankMap[row.product_id][row.test_number] = Array.isArray(row.questions) ? row.questions : [];
      });
      return bankMap;
    }
    return null;
  } catch (err) {
    console.warn('[Supabase] Failed to fetch custom question banks:', err.message);
    return null;
  }
}

export async function saveQuestionBankToSupabase(productId, testNumber, questions) {
  try {
    const id = `${productId}__${testNumber}`;
    const payload = {
      id,
      product_id: productId,
      test_number: String(testNumber),
      questions: Array.isArray(questions) ? questions : [],
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('custom_question_banks')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn('[Supabase] Failed to save question bank:', err.message);
    return { success: false, error: err.message };
  }
}

// ---------------- COUPONS ----------------

export async function fetchCouponsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*');

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(c => ({
        code: c.code,
        discountPercent: Number(c.discount_percent || 0),
        description: c.description,
        isActive: Boolean(c.is_active)
      }));
    }
    return null;
  } catch (err) {
    console.warn('[Supabase] Failed to fetch coupons:', err.message);
    return null;
  }
}

export async function saveCouponToSupabase(coupon) {
  try {
    const payload = {
      code: coupon.code.toUpperCase(),
      discount_percent: Number(coupon.discountPercent || 20),
      description: coupon.description || '',
      is_active: Boolean(coupon.isActive ?? true)
    };
    const { error } = await supabase
      .from('coupons')
      .upsert(payload, { onConflict: 'code' });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn('[Supabase] Failed to save coupon:', err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteCouponFromSupabase(code) {
  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('code', code.toUpperCase());

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn('[Supabase] Failed to delete coupon:', err.message);
    return { success: false, error: err.message };
  }
}

// ---------------- PAYMENT GATEWAYS ----------------

export async function fetchGatewaysFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('payment_gateways')
      .select('*');

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(g => ({
        id: g.id,
        name: g.name,
        provider: g.provider,
        keyId: g.key_id,
        webhookSecret: g.webhook_secret,
        isEnabled: Boolean(g.is_enabled),
        isTestMode: Boolean(g.is_test_mode),
        supportedMethods: Array.isArray(g.supported_methods) ? g.supported_methods : []
      }));
    }
    return null;
  } catch (err) {
    console.warn('[Supabase] Failed to fetch gateways:', err.message);
    return null;
  }
}

export async function saveGatewayToSupabase(gw) {
  try {
    const payload = {
      id: gw.id,
      name: gw.name,
      provider: gw.provider,
      key_id: gw.keyId,
      webhook_secret: gw.webhookSecret,
      is_enabled: Boolean(gw.isEnabled ?? true),
      is_test_mode: Boolean(gw.isTestMode ?? true),
      supported_methods: Array.isArray(gw.supportedMethods) ? gw.supportedMethods : []
    };
    const { error } = await supabase
      .from('payment_gateways')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn('[Supabase] Failed to save gateway:', err.message);
    return { success: false, error: err.message };
  }
}

// ---------------- TEST ATTEMPTS ----------------

export async function fetchAttemptsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('test_attempts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(a => ({
        id: a.id,
        productId: a.product_id,
        productTitle: a.product_title,
        testNumber: Number(a.test_number || 1),
        score: Number(a.score || 0),
        passingScore: Number(a.passing_score || 70),
        passed: Boolean(a.passed),
        totalQuestions: Number(a.total_questions || 0),
        correctCount: Number(a.correct_count || 0),
        timeSpentSecs: Number(a.time_spent_secs || 0),
        date: a.date,
        userAnswers: a.user_answers || {}
      }));
    }
    return null;
  } catch (err) {
    console.warn('[Supabase] Failed to fetch test attempts:', err.message);
    return null;
  }
}

export async function saveAttemptToSupabase(attempt) {
  try {
    const payload = {
      id: attempt.id,
      product_id: attempt.productId,
      product_title: attempt.productTitle,
      test_number: Number(attempt.testNumber || 1),
      score: Number(attempt.score || 0),
      passing_score: Number(attempt.passingScore || 70),
      passed: Boolean(attempt.passed),
      total_questions: Number(attempt.totalQuestions || 0),
      correct_count: Number(attempt.correctCount || 0),
      time_spent_secs: Number(attempt.timeSpentSecs || 0),
      date: attempt.date || new Date().toISOString().split('T')[0],
      user_answers: attempt.userAnswers || {}
    };
    const { error } = await supabase
      .from('test_attempts')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn('[Supabase] Failed to save attempt:', err.message);
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// 3. ONE-CLICK BULK SEED / SYNC LOCAL DATA INTO SUPABASE TABLES
// ==============================================================================

export async function syncAllLocalDataToSupabase({ products, blogs, coupons, gateways, orders, users, reviews }) {
  const results = {
    products: 0,
    blogs: 0,
    coupons: 0,
    gateways: 0,
    orders: 0,
    users: 0,
    reviews: 0,
    errors: []
  };

  try {
    // 1. Products
    if (Array.isArray(products) && products.length > 0) {
      const mapped = products.map(productToDb);
      const { error } = await supabase.from('products').upsert(mapped, { onConflict: 'id' });
      if (error) results.errors.push(`Products: ${error.message}`);
      else results.products = mapped.length;
    }

    // 2. Blogs
    if (Array.isArray(blogs) && blogs.length > 0) {
      const mapped = blogs.map(blogToDb);
      const { error } = await supabase.from('blogs').upsert(mapped, { onConflict: 'id' });
      if (error) results.errors.push(`Blogs: ${error.message}`);
      else results.blogs = mapped.length;
    }

    // 3. Coupons
    if (Array.isArray(coupons) && coupons.length > 0) {
      const mapped = coupons.map(c => ({
        code: c.code.toUpperCase(),
        discount_percent: Number(c.discountPercent || 20),
        description: c.description || '',
        is_active: Boolean(c.isActive ?? true)
      }));
      const { error } = await supabase.from('coupons').upsert(mapped, { onConflict: 'code' });
      if (error) results.errors.push(`Coupons: ${error.message}`);
      else results.coupons = mapped.length;
    }

    // 4. Gateways
    if (Array.isArray(gateways) && gateways.length > 0) {
      const mapped = gateways.map(g => ({
        id: g.id,
        name: g.name,
        provider: g.provider,
        key_id: g.keyId,
        webhook_secret: g.webhookSecret,
        is_enabled: Boolean(g.isEnabled ?? true),
        is_test_mode: Boolean(g.isTestMode ?? true),
        supported_methods: Array.isArray(g.supportedMethods) ? g.supportedMethods : []
      }));
      const { error } = await supabase.from('payment_gateways').upsert(mapped, { onConflict: 'id' });
      if (error) results.errors.push(`Gateways: ${error.message}`);
      else results.gateways = mapped.length;
    }

    // 5. Orders
    if (Array.isArray(orders) && orders.length > 0) {
      const mapped = orders.map(orderToDb);
      const { error } = await supabase.from('orders').upsert(mapped, { onConflict: 'id' });
      if (error) results.errors.push(`Orders: ${error.message}`);
      else results.orders = mapped.length;
    }

    // 6. Users
    if (Array.isArray(users) && users.length > 0) {
      const mapped = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email.toLowerCase(),
        password: u.password || 'student123',
        phone: u.phone || '',
        role: u.role || 'student',
        avatar: u.avatar || '',
        created_at: u.createdAt || new Date().toISOString()
      }));
      const { error } = await supabase.from('users_profiles').upsert(mapped, { onConflict: 'id' });
      if (error) results.errors.push(`Users: ${error.message}`);
      else results.users = mapped.length;
    }

    // 7. Reviews
    if (Array.isArray(reviews) && reviews.length > 0) {
      const mapped = reviews.map(reviewToDb);
      const { error } = await supabase.from('reviews').upsert(mapped, { onConflict: 'id' });
      if (error) results.errors.push(`Reviews: ${error.message}`);
      else results.reviews = mapped.length;
    }

    return {
      success: results.errors.length === 0,
      results
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      results
    };
  }
}

// ==============================================================================
// 4. SECURE SERVER API GATEWAY CLIENT (Zero-Trust Backend Verification)
// ==============================================================================

export async function createPendingOrderApi(orderData) {
  try {
    const res = await fetch('/api/orders/create-pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return await res.json();
  } catch (err) {
    console.error('[API Error] createPendingOrderApi:', err);
    return { success: false, error: err.message };
  }
}

export async function verifyPaymentApi(verificationData) {
  try {
    const res = await fetch('/api/orders/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verificationData)
    });
    return await res.json();
  } catch (err) {
    console.error('[API Error] verifyPaymentApi:', err);
    return { success: false, error: err.message };
  }
}

export async function verifyServerCourseAccess(email, productId) {
  try {
    const res = await fetch('/api/access/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, productId })
    });
    return await res.json();
  } catch (err) {
    console.error('[API Error] verifyServerCourseAccess:', err);
    return { hasAccess: false, error: err.message };
  }
}

export async function fetchServerEnrolledCourses(email) {
  try {
    if (!email) return [];
    const res = await fetch(`/api/access/enrolled?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    return data?.enrolledProductIds || [];
  } catch (err) {
    console.error('[API Error] fetchServerEnrolledCourses:', err);
    return [];
  }
}

export async function fetchActiveGatewaysApi() {
  try {
    const res = await fetch('/api/gateways');
    const data = await res.json();
    return data?.gateways || [];
  } catch (err) {
    console.error('[API Error] fetchActiveGatewaysApi:', err);
    return [];
  }
}
