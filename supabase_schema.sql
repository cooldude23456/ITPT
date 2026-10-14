-- ==============================================================================
-- ITPRACTICETESTS.COM - SUPABASE DATABASE INITIALIZATION SCHEMA
-- Project ID: dkkvulqgfsiuaqadubum
-- Execute this script in: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. COURSES & PRACTICE TESTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT,
    vendor TEXT,
    category TEXT,
    price_inr NUMERIC DEFAULT 0,
    price_usd NUMERIC DEFAULT 0,
    original_price_inr NUMERIC DEFAULT 0,
    original_price_usd NUMERIC DEFAULT 0,
    rating NUMERIC DEFAULT 4.8,
    reviews_count INTEGER DEFAULT 0,
    students_count INTEGER DEFAULT 0,
    badge TEXT,
    description TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    questions_count INTEGER DEFAULT 0,
    tests_count INTEGER DEFAULT 6,
    passing_score INTEGER DEFAULT 70,
    time_limit_mins INTEGER DEFAULT 90,
    last_updated TEXT,
    thumbnail TEXT,
    questions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RATINGS & REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT,
    user_avatar TEXT,
    rating NUMERIC DEFAULT 5,
    title TEXT,
    comment TEXT,
    date TEXT,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    helpful_users JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SEO BLOGS & EXAM GUIDES TABLE
CREATE TABLE IF NOT EXISTS public.blogs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT,
    author TEXT DEFAULT 'Yogesh Dhiman',
    author_role TEXT DEFAULT 'Udemy Instructor & Cloud Architect',
    author_avatar TEXT,
    published_date TEXT,
    read_time_minutes INTEGER DEFAULT 5,
    views_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    featured_image TEXT,
    excerpt TEXT,
    content TEXT,
    meta_title TEXT,
    meta_description TEXT,
    focus_keywords TEXT,
    canonical_url TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    related_course_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CUSTOM IMPORTED QUESTION BANKS TABLE (Supports Excel 6 Practice Tests up to 250 Questions each)
CREATE TABLE IF NOT EXISTS public.custom_question_banks (
    id TEXT PRIMARY KEY, -- Composite key format: product_id || '__' || test_number
    product_id TEXT NOT NULL,
    test_number TEXT NOT NULL,
    questions JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDERS & INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    date TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    currency TEXT DEFAULT 'INR',
    subtotal NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'PENDING',
    payment_method TEXT,
    payment_gateway TEXT,
    transaction_id TEXT,
    gateway_order_id TEXT,
    signature TEXT,
    admin_notification_sent BOOLEAN DEFAULT TRUE,
    admin_notification_recipient TEXT DEFAULT 'support@itpracticetests.com',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe migration for existing orders table:
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gateway_order_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS signature TEXT;

-- 6. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.users_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    phone TEXT,
    role TEXT DEFAULT 'student',
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DISCOUNT COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    code TEXT PRIMARY KEY,
    discount_percent INTEGER DEFAULT 20,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PAYMENT GATEWAYS CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.payment_gateways (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT,
    key_id TEXT,
    webhook_secret TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    is_test_mode BOOLEAN DEFAULT TRUE,
    supported_methods JSONB DEFAULT '["UPI", "Credit/Debit Cards", "NetBanking"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. STUDENT TEST SIMULATION ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.test_attempts (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    product_title TEXT,
    test_number INTEGER DEFAULT 1,
    score INTEGER DEFAULT 0,
    passing_score INTEGER DEFAULT 70,
    passed BOOLEAN DEFAULT FALSE,
    total_questions INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    time_spent_secs INTEGER DEFAULT 0,
    date TEXT,
    user_answers JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STUDENT ENROLLMENTS TABLE (Server-Verified Lifetime Access)
CREATE TABLE IF NOT EXISTS public.enrollments (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    product_id TEXT NOT NULL,
    order_id TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe migration for existing enrollments table:
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS order_id TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & SET PERMISSIVE ACCESS POLICIES
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Allow public read/write via Publishable/Anon key for seamless web operations:
DROP POLICY IF EXISTS "Public Full Access on products" ON public.products;
CREATE POLICY "Public Full Access on products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access on reviews" ON public.reviews;
CREATE POLICY "Public Full Access on reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access on blogs" ON public.blogs;
CREATE POLICY "Public Full Access on blogs" ON public.blogs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access on custom_question_banks" ON public.custom_question_banks;
CREATE POLICY "Public Full Access on custom_question_banks" ON public.custom_question_banks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access on orders" ON public.orders;
CREATE POLICY "Public Full Access on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access on users_profiles" ON public.users_profiles;
CREATE POLICY "Public Full Access on users_profiles" ON public.users_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access on coupons" ON public.coupons;
CREATE POLICY "Public Full Access on coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access on payment_gateways" ON public.payment_gateways;
CREATE POLICY "Public Full Access on payment_gateways" ON public.payment_gateways FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access on test_attempts" ON public.test_attempts;
CREATE POLICY "Public Full Access on test_attempts" ON public.test_attempts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access on enrollments" ON public.enrollments;
CREATE POLICY "Public Full Access on enrollments" ON public.enrollments FOR ALL USING (true) WITH CHECK (true);

-- Indexes for lightning fast queries:
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs (slug);
CREATE INDEX IF NOT EXISTS idx_question_banks_pid ON public.custom_question_banks (product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users_profiles (email);
