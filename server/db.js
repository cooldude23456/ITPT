const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dkkvulqgfsiuaqadubum.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_nHZDs5bDhArDsR2X8Nrbdg_uhtWgnam';

// In-memory fallback and cache store for high speed & reliability
const memoryOrders = new Map();
const memoryEnrollments = new Set(); // set of "email:productId"

async function supabaseFetch(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Supabase DB Warning] ${options.method || 'GET'} ${endpoint} -> ${res.status}: ${errText}`);
      return { ok: false, status: res.status, error: errText };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    console.error(`[Supabase DB Error] ${endpoint}:`, err.message);
    return { ok: false, error: err.message };
  }
}

// ---------------- PAYMENT GATEWAYS ----------------
export async function getActiveGateways() {
  const res = await supabaseFetch('payment_gateways?select=*');
  if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
    return res.data;
  }
  // Default fallback if table empty
  return [
    {
      id: 'gw-razorpay',
      provider: 'Razorpay',
      name: 'Razorpay Payment Gateway',
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_SylljWgo1cubKX',
      is_enabled: true,
      is_test_mode: false,
      supported_methods: ['UPI', 'Debit/Credit Cards', 'NetBanking', 'Wallets']
    },
    {
      id: 'gw-paypal',
      provider: 'PayPal',
      name: 'PayPal International',
      key_id: process.env.PAYPAL_CLIENT_ID || 'ARwtJURxNKLGqrBYk3xFab2P90a3xNDloiHTNisj8mLY2Hd_JjARWl7Lf1t9JwOjlHGMqMgD-mgwCNzy',
      is_enabled: true,
      is_test_mode: false,
      supported_methods: ['PayPal Account', 'International Cards']
    }
  ];
}

// ---------------- ORDERS ----------------
export async function insertPendingOrder(order) {
  // Store in memory cache
  memoryOrders.set(order.orderId, { ...order });

  // Map to Supabase table
  const payload = {
    id: order.orderId,
    order_id: order.orderId,
    date: order.date || new Date().toISOString().split('T')[0],
    customer_name: order.customerName,
    customer_email: order.customerEmail.toLowerCase().trim(),
    customer_phone: order.customerPhone || '',
    items: order.items,
    currency: order.currency || 'INR',
    subtotal: Number(order.subtotal || 0),
    discount: Number(order.discount || 0),
    total: Number(order.total || 0),
    payment_method: order.paymentMethod || 'PENDING',
    payment_gateway: order.paymentGateway || 'Razorpay',
    transaction_id: order.transactionId || 'PENDING_INIT',
    admin_notification_sent: false,
    admin_notification_recipient: 'support@itpracticetests.com'
  };

  const res = await supabaseFetch('orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return { success: true, order: { ...payload, status: 'PENDING' } };
}

export async function getOrder(orderId) {
  // Check memory first
  if (memoryOrders.has(orderId)) {
    return memoryOrders.get(orderId);
  }

  const res = await supabaseFetch(`orders?order_id=eq.${encodeURIComponent(orderId)}&limit=1`);
  if (res.ok && res.data && res.data.length > 0) {
    const row = res.data[0];
    const isPaid = row.payment_method?.includes('Verified') ||
                   (row.transaction_id && !row.transaction_id.startsWith('PENDING_'));
    const order = {
      orderId: row.order_id || row.id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      items: row.items,
      currency: row.currency,
      subtotal: row.subtotal,
      discount: row.discount,
      total: row.total,
      paymentMethod: row.payment_method,
      paymentGateway: row.payment_gateway,
      transactionId: row.transaction_id,
      status: isPaid ? 'PAID' : 'PENDING',
      date: row.date,
      createdAt: row.created_at
    };
    memoryOrders.set(order.orderId, order);
    return order;
  }

  return null;
}

export async function markOrderAsPaid({ orderId, transactionId, paymentMethod, paymentGateway, signature }) {
  const existing = await getOrder(orderId);
  const updated = {
    ...(existing || {}),
    orderId,
    transactionId,
    paymentMethod: paymentMethod || 'Verified Payment',
    paymentGateway: paymentGateway || existing?.paymentGateway || 'Razorpay',
    status: 'PAID',
    paidAt: new Date().toISOString(),
    signature
  };

  // Update memory
  memoryOrders.set(orderId, updated);

  // Update in Supabase
  const res = await supabaseFetch(`orders?order_id=eq.${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      transaction_id: transactionId,
      payment_method: updated.paymentMethod,
      admin_notification_sent: true
    })
  });

  return updated;
}

// ---------------- ENROLLMENTS ----------------
export async function grantEnrollment({ userEmail, productId, orderId }) {
  const email = (userEmail || '').toLowerCase().trim();
  const key = `${email}:${productId}`;
  memoryEnrollments.add(key);

  const payload = {
    id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_email: email,
    product_id: productId
  };

  const res = await supabaseFetch('enrollments', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return { success: true, email, productId };
}

export async function checkAccess({ email, productId }) {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (!cleanEmail || !productId) return false;

  // 1. Check in-memory store
  if (memoryEnrollments.has(`${cleanEmail}:${productId}`)) {
    return true;
  }

  // 2. Query Supabase enrollments table
  const res = await supabaseFetch(`enrollments?user_email=eq.${encodeURIComponent(cleanEmail)}&product_id=eq.${encodeURIComponent(productId)}&limit=1`);
  if (res.ok && res.data && res.data.length > 0) {
    memoryEnrollments.add(`${cleanEmail}:${productId}`);
    return true;
  }

  // 3. Query Supabase orders table for completed/paid order with this item
  const orderRes = await supabaseFetch(`orders?customer_email=eq.${encodeURIComponent(cleanEmail)}`);
  if (orderRes.ok && Array.isArray(orderRes.data)) {
    for (const ord of orderRes.data) {
      const isPaid = ord.payment_method?.includes('Verified') ||
                     (ord.transaction_id && !ord.transaction_id.startsWith('PENDING_'));
      if (isPaid && Array.isArray(ord.items)) {
        if (ord.items.some(item => item.id === productId)) {
          memoryEnrollments.add(`${cleanEmail}:${productId}`);
          return true;
        }
      }
    }
  }

  return false;
}

export async function getEnrolledCourseIds(email) {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (!cleanEmail) return [];

  const enrolledIds = new Set();

  // 1. Add from in-memory set
  for (const item of memoryEnrollments) {
    const [e, pId] = item.split(':');
    if (e === cleanEmail && pId) {
      enrolledIds.add(pId);
    }
  }

  // 2. Supabase enrollments table
  const res = await supabaseFetch(`enrollments?user_email=eq.${encodeURIComponent(cleanEmail)}`);
  if (res.ok && Array.isArray(res.data)) {
    res.data.forEach(row => {
      if (row.product_id) {
        enrolledIds.add(row.product_id);
        memoryEnrollments.add(`${cleanEmail}:${row.product_id}`);
      }
    });
  }

  // 3. Supabase orders table (check paid orders)
  const orderRes = await supabaseFetch(`orders?customer_email=eq.${encodeURIComponent(cleanEmail)}`);
  if (orderRes.ok && Array.isArray(orderRes.data)) {
    orderRes.data.forEach(ord => {
      const isPaid = ord.payment_method?.includes('Verified') ||
                     (ord.transaction_id && !ord.transaction_id.startsWith('PENDING_'));
      if (isPaid && Array.isArray(ord.items)) {
        ord.items.forEach(item => {
          if (item.id) {
            enrolledIds.add(item.id);
            memoryEnrollments.add(`${cleanEmail}:${item.id}`);
          }
        });
      }
    });
  }

  return Array.from(enrolledIds);
}
