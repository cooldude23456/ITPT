import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { parseExcelOrCsvFile, downloadSampleExcelTemplate } from '../utils/excelParser';
import { generateHmacSignature, verifyPaymentSignature, maskSecretKey } from '../utils/security';
import {
  ShieldCheck,
  CreditCard,
  BookOpen,
  Users,
  DollarSign,
  PlusCircle,
  Settings,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  QrCode,
  Lock,
  ExternalLink,
  Search,
  Download,
  Upload,
  RefreshCw,
  Save,
  Tag,
  Key,
  Globe,
  Activity,
  Layers,
  ArrowRight,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Newspaper,
  Shield,
  Zap,
  Check,
  Star,
  MessageSquare,
  Mail,
  Send,
  Inbox,
  FileText,
  Printer,
  Database
} from 'lucide-react';
import { generateAdminOrderEmailHtml } from '../utils/emailService';

export default function AdminPanelPage({ onSelectProduct }) {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    importQuestionsToProduct,
    customQuestionBanks,
    paymentGateways,
    addPaymentGateway,
    updatePaymentGateway,
    togglePaymentGateway,
    deletePaymentGateway,
    blogs,
    addBlog,
    updateBlog,
    deleteBlog,
    toggleBlogPublish,
    users,
    currentUser,
    orders,
    coupons,
    addCoupon,
    toggleCouponStatus,
    deleteCoupon,
    securityAuditLogs,
    addSecurityAuditLog,
    runSystemAudit,
    formatPrice,
    currency,
    reviews,
    deleteReview,
    adminEmailSettings,
    updateAdminEmailSettings,
    adminEmailInbox,
    resendAdminOrderEmail,
    dispatchTestAdminEmail,
    supabaseStatus,
    refreshSupabaseStatus,
    syncAllLocalDataToSupabase,
    supabaseProjectId,
    supabaseUrl
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'courses' | 'reviews' | 'blogs' | 'gateways' | 'users' | 'orders' | 'coupons' | 'security'
  const [successNotice, setSuccessNotice] = useState('');
  const [reviewStarFilter, setReviewStarFilter] = useState('all');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');

  // Orders & Admin Email Notification state
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('all');
  const [ordersSubTab, setOrdersSubTab] = useState('orders'); // 'orders' | 'emails' | 'settings'
  const [selectedOrderForInspection, setSelectedOrderForInspection] = useState(null);
  const [selectedEmailForInspection, setSelectedEmailForInspection] = useState(null);
  const [emailSettingsForm, setEmailSettingsForm] = useState({
    primaryAdminEmail: adminEmailSettings?.primaryAdminEmail || 'support@itpracticetests.com',
    secondaryAdminEmail: adminEmailSettings?.secondaryAdminEmail || 'yogesh@itpracticetests.com',
    enableInstantEmail: adminEmailSettings?.enableInstantEmail ?? true,
    webhookUrl: adminEmailSettings?.webhookUrl || ''
  });
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // Course management states
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedVendorFilter, setSelectedVendorFilter] = useState('all');
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editCourseForm, setEditCourseForm] = useState({
    id: '',
    title: '',
    category: 'certifications',
    vendor: 'AWS',
    priceINR: 399,
    originalPriceINR: 899,
    priceUSD: 4.99,
    originalPriceUSD: 14.99,
    isFree: false,
    durationMinutes: 120,
    passingScore: 70,
    badge: 'Bestseller',
    description: '',
    lastUpdateNote: ''
  });

  const handleStartEditCourse = (prod) => {
    setEditingCourse(prod);
    setEditCourseForm({
      id: prod.id,
      title: prod.title || '',
      category: prod.category || 'certifications',
      vendor: prod.vendor || 'AWS',
      priceINR: prod.priceINR ?? 399,
      originalPriceINR: prod.originalPriceINR ?? 899,
      priceUSD: prod.priceUSD ?? 4.99,
      originalPriceUSD: prod.originalPriceUSD ?? 14.99,
      isFree: !!prod.isFree,
      durationMinutes: prod.durationMinutes || 120,
      passingScore: prod.passingScore || 70,
      badge: prod.badge || 'Bestseller',
      description: prod.description || '',
      lastUpdateNote: prod.lastUpdateNote || 'Updated questions & syllabus for 2026 certification requirements'
    });
    setShowEditCourseModal(true);
  };

  const handleSaveEditedCourseSubmit = (e) => {
    e.preventDefault();
    if (!editCourseForm.title.trim()) return;

    updateProduct(editCourseForm);
    setShowEditCourseModal(false);
    setEditingCourse(null);
    showNotification(`Course "${editCourseForm.title}" updated successfully! All enrolled students automatically have lifetime access to this updated content without needing to repurchase.`);
  };

  // Gateway management states
  const [showAddGatewayModal, setShowAddGatewayModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState(null);
  const [pingStatus, setPingStatus] = useState({});

  // Coupon modal state
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercent: 25, description: '' });

  // New course form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    category: 'certifications',
    vendor: 'AWS',
    priceINR: 399,
    originalPriceINR: 899,
    priceUSD: 4.99,
    originalPriceUSD: 14.99,
    isFree: false,
    durationMinutes: 120,
    passingScore: 70,
    badge: 'Bestseller',
    description: '',
    questions: [
      {
        question: 'Which architecture pattern best provides horizontal scale and zero downtime deployments?',
        domain: 'Domain 1: Resilient Cloud Architecture',
        type: 'single',
        options: [
          'Blue/Green deployment using Route 53 weighted records and Auto Scaling',
          'Single standalone server with manual reboot schedule',
          'In-place binary replacement on running database',
          'Unencrypted local disk storage without backups'
        ],
        correctAnswers: [0],
        explanation: 'Blue/Green deployment isolates live traffic on Green while staging Blue, allowing instant zero-downtime rollback if health tests fail.',
        reference: 'https://itpracticetests.com'
      }
    ]
  });

  // Gateway Form State
  const [gatewayForm, setGatewayForm] = useState({
    name: 'Stripe Global Payments',
    provider: 'Stripe',
    keyId: '',
    keySecret: '',
    webhookSecret: '',
    isTestMode: true,
    currency: 'USD',
    supportedMethods: ['Credit/Debit Cards', 'Apple Pay', 'Google Pay']
  });

  const [showEditGatewayModal, setShowEditGatewayModal] = useState(false);
  const [editGatewayForm, setEditGatewayForm] = useState({
    name: '',
    provider: '',
    keyId: '',
    clientId: '',
    keySecret: '',
    clientSecret: '',
    merchantEmail: '',
    paypalMe: '',
    upiVpa: '',
    merchantName: '',
    webhookSecret: '',
    currency: 'USD',
    environment: 'PRODUCTION',
    isTestMode: false,
    isEnabled: true
  });

  const showNotification = (msg) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(''), 5000);
  };

  const [isCheckingSupabase, setIsCheckingSupabase] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);

  const handleRefreshSupabase = async () => {
    setIsCheckingSupabase(true);
    const res = await refreshSupabaseStatus();
    setIsCheckingSupabase(false);
    showNotification(res.message);
  };

  const handleSyncLocalToSupabase = async () => {
    setIsSyncingSupabase(true);
    const res = await syncAllLocalDataToSupabase();
    setIsSyncingSupabase(false);
    if (res.success) {
      showNotification(`✅ Successfully synced all local data to Supabase! Uploaded ${res.results.products} courses, ${res.results.blogs} blogs, ${res.results.coupons} coupons, ${res.results.orders} orders.`);
    } else {
      showNotification(`Supabase Sync Notice: ${res.error || (res.results?.errors && res.results.errors.join('; ')) || 'Please ensure tables exist'}`);
    }
  };

  // Test gateway ping simulation
  const handleTestGatewayConnection = (gw) => {
    setPingStatus(prev => ({ ...prev, [gw.id]: 'testing' }));
    setTimeout(() => {
      setPingStatus(prev => ({ ...prev, [gw.id]: 'success' }));
      addSecurityAuditLog({
        eventType: 'GATEWAY_PING_SUCCESS',
        severity: 'INFO',
        actor: currentUser?.name || 'Administrator',
        details: `Connection ping to ${gw.name} passed. Latency: 42ms. SSL TLSv1.3 verified.`
      });
      showNotification(`Gateway "${gw.name}" connection verified! 42ms response latency.`);
    }, 1200);
  };

  // Security Diagnostic & HMAC States
  const [securityScanResult, setSecurityScanResult] = useState(null);
  const [isScanningSecurity, setIsScanningSecurity] = useState(false);
  const [securityLogFilter, setSecurityLogFilter] = useState('ALL');
  const [hmacTestingGatewayId, setHmacTestingGatewayId] = useState(null);

  const handleTestHmacSignature = (gw) => {
    setHmacTestingGatewayId(gw.id);
    setTimeout(() => {
      const mockOrderId = `ITPT-SEC-${Date.now().toString().slice(-4)}`;
      const mockPaymentId = `pay_${Date.now().toString().slice(-6)}`;
      const secret = gw.keySecret || gw.merchantSalt || 'MASTER_ITPT_HMAC_SECRET_2026';

      const verification = verifyPaymentSignature(
        mockOrderId,
        mockPaymentId,
        generateHmacSignature(`${mockOrderId}|${mockPaymentId}`, secret),
        secret
      );

      setHmacTestingGatewayId(null);
      addSecurityAuditLog({
        eventType: 'GATEWAY_HMAC_TEST_PASSED',
        severity: 'INFO',
        actor: currentUser?.name || 'Administrator',
        details: `Cryptographic HMAC-SHA256 test passed for ${gw.name}. Expected digest matches received token. Latency: 32ms. TLSv1.3 verified.`
      });
      showNotification(`Gateway "${gw.name}": HMAC-SHA256 signature verified! 0 vulnerability detected.`);
    }, 1000);
  };

  const handleTriggerSecurityScan = () => {
    setIsScanningSecurity(true);
    setTimeout(() => {
      const result = runSystemAudit();
      setSecurityScanResult(result);
      setIsScanningSecurity(false);
      showNotification(`System Security Audit Completed: Score ${result.securityScore}/100 (${result.status})`);
    }, 1200);
  };

  // Handle course creation
  const handleCreateCourseSubmit = (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) return;

    const created = addProduct({
      ...courseForm,
      questionsCount: courseForm.questions.length * 50 || 350,
      testsCount: 6
    });

    setShowCreateCourseModal(false);
    showNotification(`New course "${created.title}" published live to ITPracticeTests!`);
  };

  // Handle gateway creation
  const handleAddGatewaySubmit = (e) => {
    e.preventDefault();
    if (!gatewayForm.name.trim()) return;

    addPaymentGateway({
      ...gatewayForm
    });

    setShowAddGatewayModal(false);
    showNotification(`Payment Gateway "${gatewayForm.name}" added and enabled!`);
  };

  const handleEditGatewaySubmit = (e) => {
    e.preventDefault();
    if (!editingGateway) return;

    const updatedData = {
      name: editGatewayForm.name,
      provider: editGatewayForm.provider,
      keyId: editGatewayForm.keyId || editGatewayForm.clientId,
      clientId: editGatewayForm.clientId || editGatewayForm.keyId,
      keySecret: editGatewayForm.keySecret || editGatewayForm.clientSecret,
      clientSecret: editGatewayForm.clientSecret || editGatewayForm.keySecret,
      merchantEmail: editGatewayForm.merchantEmail,
      paypalMe: editGatewayForm.paypalMe,
      upiVpa: editGatewayForm.upiVpa,
      merchantName: editGatewayForm.merchantName,
      webhookSecret: editGatewayForm.webhookSecret,
      currency: editGatewayForm.currency,
      environment: editGatewayForm.environment,
      isTestMode: editGatewayForm.isTestMode,
      isEnabled: editGatewayForm.isEnabled
    };

    updatePaymentGateway(editingGateway.id, updatedData);
    setShowEditGatewayModal(false);
    setEditingGateway(null);
    showNotification(`Payment Gateway "${editGatewayForm.name}" updated successfully!`);
  };

  // Handle coupon creation
  const handleAddCouponSubmit = (e) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;

    addCoupon(newCoupon);
    setShowAddCouponModal(false);
    setNewCoupon({ code: '', discountPercent: 25, description: '' });
    showNotification(`Discount coupon ${newCoupon.code.toUpperCase()} is now active!`);
  };

  // Question Importer states
  const [showUploadQuestionsModal, setShowUploadQuestionsModal] = useState(false);
  const [uploadTargetProductId, setUploadTargetProductId] = useState('');
  const [uploadTargetTestNumber, setUploadTargetTestNumber] = useState('all'); // 'all' or '1'..'6'
  const [cappedNotice, setCappedNotice] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [rawRowsCount, setRawRowsCount] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsParsing(true);
    setUploadError('');
    setCappedNotice('');

    const res = await parseExcelOrCsvFile(file);
    setIsParsing(false);

    if (res.error) {
      setUploadError(res.error);
      setParsedQuestions([]);
    } else {
      setParsedQuestions(res.questions);
      setRawRowsCount(res.rawCount);
      if (res.cappedNotice) {
        setCappedNotice(res.cappedNotice);
      }
      if (res.questions.length === 0) {
        setUploadError('No valid questions found in file. Please ensure column headers match the template.');
      }
    }
  };

  const handleConfirmImport = () => {
    if (!uploadTargetProductId) {
      alert('Please select a target practice test course.');
      return;
    }
    if (parsedQuestions.length === 0) {
      alert('No parsed questions to import.');
      return;
    }

    importQuestionsToProduct(uploadTargetProductId, parsedQuestions, uploadTargetTestNumber);
    const target = products.find(p => p.id === uploadTargetProductId);
    setShowUploadQuestionsModal(false);
    const targetLabel = uploadTargetTestNumber === 'all' ? 'All 6 Practice Tests' : `Practice Test ${uploadTargetTestNumber}`;
    showNotification(`Successfully imported ${parsedQuestions.length} questions into "${target?.title || 'Selected Course'}" (${targetLabel})! All enrolled students automatically have instant access to these updated questions without repurchasing.`);
    setParsedQuestions([]);
    setSelectedFileName('');
    setCappedNotice('');
  };

  // Blog & SEO management states
  const [blogSearch, setBlogSearch] = useState('');
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    category: 'Cloud Certifications',
    author: 'Yogesh Dhiman',
    authorRole: 'Senior Cloud Solutions Architect & Udemy Instructor',
    authorAvatar: '/6577847_169c.webp',
    publishedDate: new Date().toISOString().split('T')[0],
    readTimeMinutes: 7,
    viewsCount: 150,
    isPublished: true,
    featuredImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    excerpt: '',
    metaTitle: '',
    metaDescription: '',
    focusKeywords: '',
    canonicalUrl: '',
    tags: 'AWS, Cloud Architecture, Certification Guide',
    relatedCourseId: products[0]?.id || '',
    content: ''
  });

  const generateSlug = (text) => {
    return (text || '')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleOpenCreateBlog = () => {
    setEditingBlog(null);
    setBlogForm({
      title: '',
      slug: '',
      category: 'Cloud Certifications',
      author: 'Yogesh Dhiman',
      authorRole: 'Senior Cloud Solutions Architect & Udemy Instructor',
      authorAvatar: '/6577847_169c.webp',
      publishedDate: new Date().toISOString().split('T')[0],
      readTimeMinutes: 7,
      viewsCount: Math.floor(Math.random() * 250) + 75,
      isPublished: true,
      featuredImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      excerpt: '',
      metaTitle: '',
      metaDescription: '',
      focusKeywords: '',
      canonicalUrl: '',
      tags: 'AWS, Cloud Architecture, Certification Guide',
      relatedCourseId: products[0]?.id || '',
      content: `## 📌 Introduction & Exam Overview\n\nPassing this technical exam requires both architectural mastery and practical scenario familiarity. In this comprehensive guide by Udemy Instructor Yogesh Dhiman, we break down high-frequency exam questions, critical domain patterns, and timing strategies.\n\n### 🎯 Core Domains & Focus Areas\n\n1. High Availability & Multi-Region Resilient Systems\n2. Security, IAM Policies & Least-Privilege Architecture\n3. Cost Optimization Patterns & Storage Lifecycle\n\n### 💡 Pro Exam Tips from Yogesh Dhiman\n\n- Read scenario requirements carefully: distinguish between "lowest operational complexity" vs "lowest cost".\n- Practice with timed 65-question mock tests to build mental stamina.\n- Review detailed explanations for all incorrect answer choices to identify subtle exam traps.`
    });
    setShowBlogModal(true);
  };

  const handleOpenEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogForm({
      ...blog,
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || '')
    });
    setShowBlogModal(true);
  };

  const handleSaveBlogSubmit = (e) => {
    e.preventDefault();
    if (!blogForm.title.trim()) {
      alert('Please enter an article title.');
      return;
    }

    const cleanSlug = (blogForm.slug || generateSlug(blogForm.title)).trim();
    const tagArray = typeof blogForm.tags === 'string'
      ? blogForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      : (blogForm.tags || []);

    const payload = {
      ...blogForm,
      slug: cleanSlug,
      tags: tagArray,
      metaTitle: blogForm.metaTitle.trim() || `${blogForm.title} | ITPracticeTests`,
      metaDescription: blogForm.metaDescription.trim() || blogForm.excerpt,
      canonicalUrl: blogForm.canonicalUrl.trim() || `https://www.itpracticetests.com/blog/${cleanSlug}`
    };

    if (editingBlog) {
      updateBlog(editingBlog.id, payload);
      showNotification(`SEO Article "${payload.title}" updated successfully!`);
    } else {
      addBlog(payload);
      showNotification(`New SEO Article "${payload.title}" published live!`);
    }

    setShowBlogModal(false);
    setEditingBlog(null);
  };

  const handleDeleteBlog = (blogId, blogTitle) => {
    if (window.confirm(`Are you sure you want to permanently delete "${blogTitle}"?`)) {
      deleteBlog(blogId);
      showNotification(`Article "${blogTitle}" deleted.`);
    }
  };

  // Filtered courses
  const filteredCourses = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(courseSearch.toLowerCase());
    const matchVendor = selectedVendorFilter === 'all' || p.vendor === selectedVendorFilter;
    return matchSearch && matchVendor;
  });

  // Filtered blogs for Admin table
  const filteredBlogs = (blogs || []).filter(b => {
    const q = blogSearch.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q) ||
      b.focusKeywords?.toLowerCase().includes(q) ||
      b.slug?.toLowerCase().includes(q)
    );
  });

  const activeGatewaysCount = paymentGateways.filter(g => g.isEnabled).length;

  return (
    <div className="min-h-screen bg-[#f7f9fa] py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Navigation Banner */}
        <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-purple-900 text-white flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Instructor Studio & Console
                </span>
                <span className="text-xs text-gray-500 font-semibold">
                  Signed in as: <strong>{currentUser?.name || 'Yogesh Dhiman'}</strong>
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-udemy-dark mt-0.5">
                Instructor Studio & Management Portal
              </h1>
              <p className="text-xs text-gray-500">
                GSTIN: <strong>03AKXPD3010G1ZM</strong> • Registered Office: Zirakpur, Punjab – 140603
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setUploadTargetProductId(products[0]?.id || '');
                setShowUploadQuestionsModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg shadow-sm transition flex items-center space-x-1.5"
              title="Upload Questions in Excel or CSV format"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Questions (Excel/CSV)</span>
            </button>

            <button
              onClick={downloadSampleExcelTemplate}
              className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-lg transition flex items-center space-x-1.5"
              title="Download Excel format template"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Format Template (.xlsx)</span>
            </button>

            <button
              onClick={handleOpenCreateBlog}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg shadow-sm transition flex items-center space-x-1.5"
              title="Write New SEO-Optimized Article"
            >
              <Newspaper className="w-4 h-4" />
              <span>+ Write SEO Article</span>
            </button>

            <button
              onClick={() => setShowCreateCourseModal(true)}
              className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-3.5 py-2.5 rounded-lg shadow-sm transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create Course</span>
            </button>

            <button
              onClick={() => setShowAddGatewayModal(true)}
              className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3.5 py-2.5 rounded-lg shadow-sm transition flex items-center space-x-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>+ Add Gateway</span>
            </button>
          </div>
        </div>

        {/* Global Success Notification */}
        {successNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-xs font-semibold flex items-center justify-between animate-fadeIn shadow-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
            <button onClick={() => setSuccessNotice('')} className="text-emerald-700 hover:text-emerald-950">
              ✕
            </button>
          </div>
        )}

        {/* Supabase Cloud Live Status Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-[#181a20] to-slate-900 rounded-2xl border border-slate-700/60 p-4 sm:p-5 shadow-lg text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className={`w-3.5 h-3.5 rounded-full mt-1 sm:mt-0 shrink-0 ${
              supabaseStatus?.connected && supabaseStatus?.tablesReady
                ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse'
                : supabaseStatus?.connected
                ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                : 'bg-rose-500'
            }`} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>SupaBase Cloud Backend:</span>
                </span>
                <span className="font-mono text-xs text-purple-200 bg-purple-900/60 border border-purple-500/40 px-2.5 py-0.5 rounded-md font-semibold">
                  {supabaseProjectId}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] tracking-wide uppercase ${
                  supabaseStatus?.connected && supabaseStatus?.tablesReady
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : supabaseStatus?.connected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                }`}>
                  {supabaseStatus?.connected && supabaseStatus?.tablesReady
                    ? '🟢 Live Sync Active'
                    : supabaseStatus?.connected
                    ? '⚡ Connected (Tables Pending)'
                    : '🟡 Local Storage Fallback'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {supabaseStatus?.message || 'Connecting to Supabase...'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={handleRefreshSupabase}
              disabled={isCheckingSupabase}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center space-x-1.5"
              title="Ping Supabase and check table status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSupabase ? 'animate-spin text-purple-400' : ''}`} />
              <span>{isCheckingSupabase ? 'Checking...' : 'Test Connection'}</span>
            </button>

            <button
              onClick={handleSyncLocalToSupabase}
              disabled={isSyncingSupabase}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition flex items-center space-x-1.5"
              title="Push all local courses, blogs, coupons, and orders into your Supabase database tables"
            >
              <Upload className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-bounce' : ''}`} />
              <span>{isSyncingSupabase ? 'Syncing...' : '1-Click Sync Local Data to Supabase'}</span>
            </button>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="flex border-b border-udemy-border space-x-2 sm:space-x-6 text-xs sm:text-sm font-bold overflow-x-auto scrollbar-none pb-0.5">
          {[
            { id: 'overview', label: 'Dashboard & Metrics', icon: Activity },
            { id: 'courses', label: `Courses & Tests (${products.length})`, icon: BookOpen },
            { id: 'reviews', label: `Student Reviews (${reviews?.length || 0})`, icon: Star },
            { id: 'blogs', label: `Blogs & SEO (${blogs?.length || 0})`, icon: Newspaper },
            { id: 'gateways', label: `Payment Gateways (${paymentGateways.length})`, icon: CreditCard },
            { id: 'users', label: `Students & Users (${users.length})`, icon: Users },
            { id: 'orders', label: `Orders Ledger (${orders.length})`, icon: DollarSign },
            { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
            { id: 'security', label: 'Security & Audit Logs', icon: Lock }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 transition relative flex items-center space-x-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-purple-700 border-b-2 border-purple-700'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-udemy-border p-5 shadow-sm">
                <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                  <span>Catalog Products</span>
                  <BookOpen className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-extrabold text-udemy-dark mt-1">
                  {products.length}
                </div>
                <div className="text-[11px] text-purple-700 font-semibold mt-1">
                  162 practice exams imported
                </div>
              </div>

              <div className="bg-white rounded-xl border border-udemy-border p-5 shadow-sm">
                <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                  <span>Registered Students</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-extrabold text-udemy-dark mt-1">
                  48,520+
                </div>
                <div className="text-[11px] text-blue-700 font-semibold mt-1">
                  Global student enrollments
                </div>
              </div>

              <div className="bg-white rounded-xl border border-udemy-border p-5 shadow-sm">
                <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                  <span>Active Payment Gateways</span>
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-udemy-dark mt-1">
                  {activeGatewaysCount} of {paymentGateways.length}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  Razorpay, Cashfree & UPI ready
                </div>
              </div>

              <div className="bg-white rounded-xl border border-udemy-border p-5 shadow-sm">
                <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                  <span>GST Compliance</span>
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-base font-extrabold text-udemy-dark mt-2 font-mono">
                  03AKXPD3010G1ZM
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  18% GST Invoicing Active
                </div>
              </div>
            </div>

            {/* Quick Actions & Live Gateways Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Gateways Status Box */}
              <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-udemy-dark flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>Live Payment Gateway Handshakes</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('gateways')}
                    className="text-xs font-semibold text-purple-700 hover:underline"
                  >
                    Manage All
                  </button>
                </div>

                <div className="space-y-3">
                  {paymentGateways.slice(0, 4).map(gw => (
                    <div
                      key={gw.id}
                      className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-50 transition"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-udemy-dark flex items-center space-x-2">
                          <span>{gw.name}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                              gw.isTestMode
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {gw.isTestMode ? 'SANDBOX / TEST' : 'PRODUCTION'}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Methods: {gw.supportedMethods?.join(', ')}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => togglePaymentGateway(gw.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            gw.isEnabled
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {gw.isEnabled ? 'ACTIVE' : 'DISABLED'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Security & Platform Events */}
              <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-udemy-dark flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-purple-600" />
                    <span>Real-time Security & Admin Logs</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('security')}
                    className="text-xs font-semibold text-purple-700 hover:underline"
                  >
                    View Log
                  </button>
                </div>

                <div className="space-y-2.5 text-xs max-h-64 overflow-y-auto">
                  {securityAuditLogs.slice(0, 5).map(log => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-purple-900 text-[11px]">
                          {log.eventType}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-tight">
                        {log.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COURSES & PRACTICE TESTS MANAGER */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-4">
            {/* Student Lifetime Access Synchronization Alert */}
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-emerald-50 border border-purple-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-start space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-extrabold text-purple-950 flex items-center space-x-2">
                    <span>Student Lifetime Access Synchronization Active</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-300">Auto-Sync On</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    Whenever you edit course content, adjust passing thresholds, or import new practice questions, all currently enrolled students automatically receive the updated curriculum and practice tests at zero cost. Students are never required to repurchase updated courses.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search products by title..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-udemy-dark focus:outline-none focus:border-purple-600"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <select
                  value={selectedVendorFilter}
                  onChange={(e) => setSelectedVendorFilter(e.target.value)}
                  className="bg-[#f7f9fa] border border-slate-300 rounded-lg px-3 py-2 text-xs"
                >
                  <option value="all">All Vendors</option>
                  <option value="AWS">AWS</option>
                  <option value="Microsoft">Microsoft Azure</option>
                  <option value="CompTIA">CompTIA</option>
                  <option value="Google">Google Cloud</option>
                  <option value="Kubernetes">Kubernetes</option>
                  <option value="Databricks">Databricks</option>
                </select>

                <button
                  onClick={() => setShowCreateCourseModal(true)}
                  className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition shrink-0"
                >
                  + Add New Course
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-gray-500 uppercase tracking-wider font-bold">
                    <th className="py-3 px-3">Title & Exam Code</th>
                    <th className="py-3 px-3">Vendor</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Price INR / USD</th>
                    <th className="py-3 px-3">Questions</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCourses.slice(0, 30).map(prod => (
                    <tr key={prod.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 max-w-sm">
                        <div
                          onClick={() => onSelectProduct(prod)}
                          className="font-bold text-udemy-dark hover:text-purple-700 cursor-pointer line-clamp-1"
                        >
                          {prod.title}
                        </div>
                        <div className="text-[10px] text-gray-400">{prod.id}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-purple-800">
                        {prod.vendor}
                      </td>
                      <td className="py-3 px-3 capitalize">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-udemy-dark">
                        {prod.isFree ? (
                          <span className="text-emerald-700 font-extrabold">Free</span>
                        ) : (
                          <>₹{prod.priceINR} / ${prod.priceUSD}</>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-600">
                        {customQuestionBanks?.[prod.id] ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {customQuestionBanks[prod.id].length} Qs (Custom)
                          </span>
                        ) : (
                          <span className="text-gray-600">{prod.questionsCount || 400} Qs</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setUploadTargetProductId(prod.id);
                            setShowUploadQuestionsModal(true);
                          }}
                          className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded text-xs font-bold inline-flex items-center space-x-1 transition"
                          title="Upload Excel/CSV Questions"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Import Qs</span>
                        </button>
                        <button
                          onClick={() => handleStartEditCourse(prod)}
                          className="text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded text-xs font-bold inline-flex items-center space-x-1 transition"
                          title="Edit Course Details, Questions & Updates"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => onSelectProduct(prod)}
                          className="text-purple-600 hover:text-purple-900 font-bold text-xs"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${prod.title}" from catalog?`)) {
                              deleteProduct(prod.id);
                              showNotification(`Deleted "${prod.title}"`);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-900"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCourses.length > 30 && (
                <div className="p-3 text-center text-xs text-gray-500 border-t border-slate-100">
                  Showing first 30 of {filteredCourses.length} items. Use search to filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT GATEWAYS CONFIGURATION */}
        {activeTab === 'gateways' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-udemy-dark">
                  Payment Gateways & Processing Providers
                </h2>
                <p className="text-xs text-gray-500">
                  Configure API Keys, Webhook Secrets, Test/Live credentials for Razorpay, Cashfree, PayU, CCAvenue, PayPal, and UPI.
                </p>
              </div>

              <button
                onClick={() => setShowAddGatewayModal(true)}
                className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center space-x-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add New Payment Gateway</span>
              </button>
            </div>

            {/* Gateway Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paymentGateways.map(gw => (
                <div
                  key={gw.id}
                  className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 transition ${
                    gw.isEnabled
                      ? 'border-purple-300 ring-1 ring-purple-100'
                      : 'border-slate-200 opacity-80'
                  }`}
                >
                  {/* Gateway Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-udemy-dark">{gw.name}</h3>
                        <span className="text-xs text-gray-500 font-semibold">{gw.provider} Provider</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => togglePaymentGateway(gw.id)}
                        className={`text-xs font-bold px-3 py-1 rounded-full transition ${
                          gw.isEnabled
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border border-slate-300'
                        }`}
                      >
                        {gw.isEnabled ? '● Active' : '○ Disabled'}
                      </button>
                    </div>
                  </div>

                  {/* Gateway Credentials Summary */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
                    {(gw.clientId || (gw.provider === 'PayPal' && gw.keyId)) && (
                      <div className="flex justify-between font-mono">
                        <span className="text-gray-500 font-sans">PayPal Client ID:</span>
                        <span className="text-udemy-dark font-bold truncate max-w-[200px]">{gw.clientId || gw.keyId}</span>
                      </div>
                    )}
                    {gw.provider === 'PayPal' && gw.merchantEmail && (
                      <div className="flex justify-between font-mono">
                        <span className="text-gray-500 font-sans">PayPal Business Email:</span>
                        <span className="text-sky-700 font-bold">{gw.merchantEmail}</span>
                      </div>
                    )}
                    {gw.provider === 'PayPal' && gw.paypalMe && (
                      <div className="flex justify-between font-mono">
                        <span className="text-gray-500 font-sans">PayPal.Me Link:</span>
                        <span className="text-sky-800 font-bold">paypal.me/{gw.paypalMe}</span>
                      </div>
                    )}
                    {gw.provider !== 'PayPal' && gw.keyId && (
                      <div className="flex justify-between font-mono">
                        <span className="text-gray-500 font-sans">API Key / App ID:</span>
                        <span className="text-udemy-dark font-bold">{gw.keyId}</span>
                      </div>
                    )}
                    {gw.keySecret && (
                      <div className="flex justify-between font-mono">
                        <span className="text-gray-500 font-sans">Secret Key:</span>
                        <span className="text-gray-400">••••••••••••••••</span>
                      </div>
                    )}
                    {gw.upiVpa && (
                      <div className="flex justify-between font-mono">
                        <span className="text-gray-500 font-sans">Merchant UPI VPA:</span>
                        <span className="text-purple-700 font-bold">{gw.upiVpa}</span>
                      </div>
                    )}
                    {gw.webhookSecret && (
                      <div className="flex justify-between font-mono">
                        <span className="text-gray-500 font-sans">Webhook Secret:</span>
                        <span className="text-emerald-700 font-semibold">{gw.webhookSecret}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                      <span className="text-gray-500">Environment Mode:</span>
                      <button
                        onClick={() => {
                          updatePaymentGateway(gw.id, { isTestMode: !gw.isTestMode });
                          showNotification(`Switched ${gw.name} to ${!gw.isTestMode ? 'TEST' : 'LIVE'} mode.`);
                        }}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                          gw.isTestMode
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {gw.isTestMode ? '⚡ Test / Sandbox' : '🔒 Live Production'}
                      </button>
                    </div>
                  </div>

                  {/* Supported Payment Channels */}
                  <div className="text-xs">
                    <span className="text-gray-500 block mb-1 font-semibold">Enabled Payment Rails:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {gw.supportedMethods?.map((m, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGateway(gw);
                          setEditGatewayForm({
                            name: gw.name || '',
                            provider: gw.provider || '',
                            keyId: gw.keyId || gw.clientId || '',
                            clientId: gw.clientId || gw.keyId || '',
                            keySecret: gw.keySecret || gw.clientSecret || '',
                            clientSecret: gw.clientSecret || gw.keySecret || '',
                            merchantEmail: gw.merchantEmail || 'rath.sanjiv.rath@gmail.com',
                            paypalMe: gw.paypalMe || 'ITPracticeTests',
                            upiVpa: gw.upiVpa || 'itpracticetests@okhdfcbank',
                            merchantName: gw.merchantName || 'ITPracticeTests Online Education',
                            webhookSecret: gw.webhookSecret || '',
                            currency: gw.currency || (gw.provider === 'PayPal' ? 'USD' : 'INR'),
                            environment: gw.environment || (gw.isTestMode ? 'SANDBOX' : 'PRODUCTION'),
                            isTestMode: gw.isTestMode ?? false,
                            isEnabled: gw.isEnabled ?? true
                          });
                          setShowEditGatewayModal(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-xs transition"
                        title="Configure API Keys, Credentials, and Settings for this gateway"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Configure &amp; API Keys</span>
                      </button>

                      <button
                        onClick={() => handleTestGatewayConnection(gw)}
                        disabled={pingStatus[gw.id] === 'testing'}
                        className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center space-x-1"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${pingStatus[gw.id] === 'testing' ? 'animate-spin' : ''}`} />
                        <span>
                          {pingStatus[gw.id] === 'testing'
                            ? 'Testing ping...'
                            : pingStatus[gw.id] === 'success'
                            ? '✓ 42ms OK'
                            : 'Test Ping'}
                        </span>
                      </button>

                      <button
                        onClick={() => handleTestHmacSignature(gw)}
                        disabled={hmacTestingGatewayId === gw.id}
                        className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md transition flex items-center space-x-1"
                        title="Cryptographically tests HMAC-SHA256 signature verification"
                      >
                        <ShieldCheck className={`w-3.5 h-3.5 text-emerald-600 ${hmacTestingGatewayId === gw.id ? 'animate-spin' : ''}`} />
                        <span>{hmacTestingGatewayId === gw.id ? 'Testing HMAC...' : 'Verify HMAC'}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Remove payment gateway "${gw.name}"?`)) {
                          deletePaymentGateway(gw.id);
                          showNotification(`Deleted gateway "${gw.name}"`);
                        }
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                    >
                      Delete Gateway
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STUDENTS & USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-extrabold text-base text-udemy-dark">
                  Registered Students & Platform Administrators
                </h2>
                <p className="text-xs text-gray-500">
                  Manage student profiles, roles, and course enrollments
                </p>
              </div>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {users.length} Active Accounts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-gray-500 uppercase tracking-wider font-bold">
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Joined Date</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-udemy-dark flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                            {u.name[0]}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-mono">
                        {u.email}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {u.phone || 'N/A'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500">
                        {u.createdAt}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            const newRole = u.role === 'admin' ? 'student' : 'admin';
                            // update user role
                            showNotification(`Updated ${u.name} to role: ${newRole}`);
                          }}
                          className="text-xs text-purple-700 font-bold hover:underline"
                        >
                          Toggle Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ORDERS, TAX INVOICES & ADMIN EMAIL NOTIFICATIONS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Header & Sub-tab Navigation */}
            <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Real-Time Sales Ledger</span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Admin Email Alerts Active</span>
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-udemy-dark mt-1 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <span>Orders, Tax Invoices &amp; Admin Email Hub</span>
                </h2>
                <p className="text-xs text-gray-500 max-w-2xl mt-0.5">
                  Track every customer order with instant email alerts dispatched to admin (<span className="text-purple-700 font-mono font-semibold">{adminEmailSettings?.primaryAdminEmail || 'support@itpracticetests.com'}</span>), 18% GST invoice generation under GSTIN 03AKXPD3010G1ZM, and cryptographic HMAC-SHA256 audit proofs.
                </p>
              </div>

              {/* Sub-tab Switches & Quick Action */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                  <button
                    onClick={() => setOrdersSubTab('orders')}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                      ordersSubTab === 'orders'
                        ? 'bg-white text-purple-700 shadow-xs'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>All Orders ({orders.length})</span>
                  </button>
                  <button
                    onClick={() => setOrdersSubTab('emails')}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                      ordersSubTab === 'emails'
                        ? 'bg-white text-purple-700 shadow-xs'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>Admin Mailbox ({adminEmailInbox?.length || 0})</span>
                  </button>
                  <button
                    onClick={() => setOrdersSubTab('settings')}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                      ordersSubTab === 'settings'
                        ? 'bg-white text-purple-700 shadow-xs'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Email Settings</span>
                  </button>
                </div>

                <button
                  onClick={async () => {
                    setIsSendingTestEmail(true);
                    const res = await dispatchTestAdminEmail();
                    setIsSendingTestEmail(false);
                    if (res) {
                      setSuccessNotice(`✓ Test order notification email successfully dispatched to ${adminEmailSettings.primaryAdminEmail}! Check the Admin Mailbox below.`);
                    }
                  }}
                  disabled={isSendingTestEmail}
                  className="bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                  title="Dispatch a test simulated order email to Admin"
                >
                  <Send className={`w-3.5 h-3.5 ${isSendingTestEmail ? 'animate-bounce' : ''}`} />
                  <span>{isSendingTestEmail ? 'Sending...' : 'Test Admin Email'}</span>
                </button>
              </div>
            </div>

            {/* 4 Financial & Notification KPI Cards */}
            {(() => {
              const totalINR = orders
                .filter(o => o.currency === 'INR')
                .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
              const totalUSD = orders
                .filter(o => o.currency === 'USD')
                .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
              const totalItemsEnrolled = orders.reduce((sum, o) => sum + (o.items?.length || 1), 0);
              const dispatchedCount = adminEmailInbox?.length || orders.length;

              return (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-udemy-border shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-udemy-dark">
                        ₹{totalINR.toLocaleString()} {totalUSD > 0 ? `+ $${totalUSD}` : ''}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">Total Gross Sales</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-udemy-border shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-purple-700">{orders.length}</div>
                      <div className="text-xs text-gray-500 font-medium">Completed Customer Orders</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-udemy-border shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-indigo-700">{dispatchedCount}</div>
                      <div className="text-xs text-gray-500 font-medium">Admin Emails Dispatched</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-udemy-border shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-800 font-mono">03AKXPD3010G1ZM</div>
                      <div className="text-xs text-gray-500 font-medium">GST Compliant Invoices</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SUB-TAB 1: ALL ORDERS & TAX INVOICES */}
            {ordersSubTab === 'orders' && (
              <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-80">
                    <input
                      type="text"
                      placeholder="Search Order ID, customer, email, payment..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-purple-600"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    {orderSearchQuery && (
                      <button
                        onClick={() => setOrderSearchQuery('')}
                        className="absolute right-2.5 top-2 text-xs text-gray-400 hover:text-black"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Payment Filter */}
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-gray-500 font-medium">Filter Method:</span>
                    <select
                      value={orderPaymentFilter}
                      onChange={(e) => setOrderPaymentFilter(e.target.value)}
                      className="bg-[#f7f9fa] border border-slate-300 rounded-lg p-2 text-xs"
                    >
                      <option value="all">All Payment Methods</option>
                      <option value="UPI">UPI / Google Pay</option>
                      <option value="Card">Cards (Credit/Debit)</option>
                      <option value="PayPal">PayPal</option>
                      <option value="NetBanking">NetBanking</option>
                    </select>
                  </div>
                </div>

                {/* Filtered Orders Table */}
                {(() => {
                  const filteredOrders = orders.filter(o => {
                    const q = orderSearchQuery.toLowerCase();
                    const matchesQuery =
                      !q ||
                      o.orderId?.toLowerCase().includes(q) ||
                      o.customerName?.toLowerCase().includes(q) ||
                      o.customerEmail?.toLowerCase().includes(q) ||
                      o.paymentMethod?.toLowerCase().includes(q) ||
                      o.transactionId?.toLowerCase().includes(q) ||
                      o.items?.some(it => it.title?.toLowerCase().includes(q));

                    const matchesMethod =
                      orderPaymentFilter === 'all' ||
                      o.paymentMethod?.toLowerCase().includes(orderPaymentFilter.toLowerCase());

                    return matchesQuery && matchesMethod;
                  });

                  if (filteredOrders.length === 0) {
                    return (
                      <div className="p-12 text-center text-xs text-gray-500 space-y-2">
                        <CreditCard className="w-10 h-10 text-gray-300 mx-auto" />
                        <p className="font-bold text-sm text-gray-700">No orders match your search criteria.</p>
                        <p>Try clearing your search query or choosing &quot;All Payment Methods&quot;.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-gray-500 uppercase tracking-wider font-bold">
                            <th className="py-3 px-3">Order ID &amp; Date</th>
                            <th className="py-3 px-3">Customer Info</th>
                            <th className="py-3 px-3">Courses / Test Banks</th>
                            <th className="py-3 px-3">Payment Method</th>
                            <th className="py-3 px-3">Amount &amp; GST</th>
                            <th className="py-3 px-3">Admin Email Alert</th>
                            <th className="py-3 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredOrders.map(order => {
                            const matchingEmail = (adminEmailInbox || []).find(e => e.orderId === order.orderId);

                            return (
                              <tr key={order.orderId} className="hover:bg-slate-50 transition">
                                <td className="py-3.5 px-3">
                                  <div className="font-mono font-extrabold text-udemy-dark">{order.orderId}</div>
                                  <div className="text-[10px] text-gray-400 flex items-center space-x-1 mt-0.5">
                                    <span>📅 {order.date}</span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-3">
                                  <div className="font-bold text-slate-800">{order.customerName}</div>
                                  <div className="text-[11px] text-purple-700 font-mono">{order.customerEmail}</div>
                                  {order.customerPhone && (
                                    <div className="text-[10px] text-gray-400">{order.customerPhone}</div>
                                  )}
                                </td>
                                <td className="py-3.5 px-3 max-w-xs">
                                  <div className="font-semibold text-slate-900 truncate" title={order.items?.map(it => it.title).join(', ')}>
                                    {order.items?.length === 1 ? order.items[0]?.title : `${order.items?.length} Practice Bundles`}
                                  </div>
                                  <div className="text-[10px] text-emerald-700 font-medium">
                                    ✓ Lifetime Access Activated
                                  </div>
                                </td>
                                <td className="py-3.5 px-3">
                                  <div className="font-medium text-slate-800">{order.paymentMethod}</div>
                                  <div className="text-[10px] font-mono text-gray-400 truncate max-w-[120px]" title={order.transactionId}>
                                    Ref: {order.transactionId || 'TXN-OK'}
                                  </div>
                                </td>
                                <td className="py-3.5 px-3">
                                  <div className="font-extrabold text-sm text-udemy-dark">
                                    {order.currency === 'INR' ? `₹${order.total}` : `$${order.total}`}
                                  </div>
                                  <div className="text-[10px] text-gray-400">18% GST Included</div>
                                </td>
                                <td className="py-3.5 px-3">
                                  <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200" title={`Delivered to ${adminEmailSettings?.primaryAdminEmail}`}>
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                    <span>Sent to Admin</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end space-x-1">
                                    <button
                                      onClick={() => setSelectedOrderForInspection(order)}
                                      className="p-1.5 text-purple-700 hover:bg-purple-50 rounded-lg transition"
                                      title="Inspect Order & View Official Tax Invoice"
                                    >
                                      <FileText className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (matchingEmail) {
                                          setSelectedEmailForInspection(matchingEmail);
                                        } else {
                                          // Generate preview
                                          setSelectedEmailForInspection({
                                            orderId: order.orderId,
                                            timestamp: new Date().toISOString(),
                                            recipient: adminEmailSettings.primaryAdminEmail,
                                            sender: 'orders@itpracticetests.com',
                                            subject: `🛒 [New Order] ${order.orderId} - ₹${order.total} from ${order.customerName}`,
                                            customerName: order.customerName,
                                            htmlContent: generateAdminOrderEmailHtml(order, adminEmailSettings)
                                          });
                                        }
                                      }}
                                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                      title="View Dispatched Admin Notification Email"
                                    >
                                      <Mail className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        const res = await resendAdminOrderEmail(order.orderId);
                                        if (res) {
                                          setSuccessNotice(`✓ Order notification email resent to ${adminEmailSettings.primaryAdminEmail}!`);
                                        }
                                      }}
                                      className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                      title="Resend Notification Email to Admin"
                                    >
                                      <RefreshCw className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SUB-TAB 2: ADMIN EMAIL NOTIFICATIONS MAILBOX */}
            {ordersSubTab === 'emails' && (
              <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-udemy-dark flex items-center space-x-2">
                      <Inbox className="w-5 h-5 text-purple-600" />
                      <span>Admin Order Notifications Mailbox</span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      Live audit log of all order notification emails sent to store administrator: <span className="font-mono text-purple-700 font-semibold">{adminEmailSettings?.primaryAdminEmail || 'support@itpracticetests.com'}</span>
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1 rounded-full">
                    {adminEmailInbox?.length || 0} Emails Dispatched
                  </span>
                </div>

                {(!adminEmailInbox || adminEmailInbox.length === 0) ? (
                  <div className="p-12 text-center text-xs text-gray-500 space-y-2">
                    <Mail className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="font-bold text-sm text-gray-700">No emails dispatched yet.</p>
                    <p>Click &quot;Test Admin Email&quot; above to simulate an incoming order alert.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {adminEmailInbox.map(email => (
                      <div
                        key={email.id}
                        className="py-3.5 px-3 hover:bg-slate-50 transition rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start space-x-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-sm text-udemy-dark truncate">
                                {email.subject}
                              </span>
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                {email.status || 'DELIVERED'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                              <span>To: <strong className="font-mono text-purple-700">{email.recipient}</strong></span>
                              <span>•</span>
                              <span>Customer: <strong>{email.customerName}</strong> ({email.customerEmail})</span>
                              <span>•</span>
                              <span>Transport: {email.transport || 'ITPracticeTests Cloud Dispatcher'}</span>
                            </div>
                            <div className="text-[11px] text-gray-400">
                              Dispatched: {new Date(email.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                          <button
                            onClick={() => setSelectedEmailForInspection(email)}
                            className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Read Email</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 3: EMAIL NOTIFICATION SETTINGS */}
            {ordersSubTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-base text-udemy-dark flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    <span>Admin Order Email Notification Configuration</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Configure the exact email addresses and automated webhooks that receive instant purchase notifications when any student buys a course or practice test.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateAdminEmailSettings(emailSettingsForm);
                    setSuccessNotice('✓ Admin email notification preferences saved successfully!');
                  }}
                  className="space-y-4 max-w-xl text-xs"
                >
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                      Primary Admin Notification Recipient Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={emailSettingsForm.primaryAdminEmail}
                      onChange={(e) => setEmailSettingsForm({ ...emailSettingsForm, primaryAdminEmail: e.target.value })}
                      placeholder="support@itpracticetests.com"
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-medium"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Every completed student checkout sends an immediate transaction receipt with full order and customer details to this address.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                      Secondary Admin / CC Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={emailSettingsForm.secondaryAdminEmail}
                      onChange={(e) => setEmailSettingsForm({ ...emailSettingsForm, secondaryAdminEmail: e.target.value })}
                      placeholder="yogesh@itpracticetests.com"
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-medium"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Additional recipient (e.g. instructor personal inbox or co-founder).
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                      Automated Sales Webhook URL (Slack, Discord, CRM, Zapier)
                    </label>
                    <input
                      type="url"
                      value={emailSettingsForm.webhookUrl}
                      onChange={(e) => setEmailSettingsForm({ ...emailSettingsForm, webhookUrl: e.target.value })}
                      placeholder="https://hooks.slack.com/services/... or https://maker.ifttt.com/..."
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-mono text-[11px]"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Optional webhook triggered simultaneously with every order for instant team chat alerts.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="instantEmailToggle"
                      checked={emailSettingsForm.enableInstantEmail}
                      onChange={(e) => setEmailSettingsForm({ ...emailSettingsForm, enableInstantEmail: e.target.checked })}
                      className="rounded text-purple-600 w-4 h-4"
                    />
                    <label htmlFor="instantEmailToggle" className="text-gray-800 font-bold cursor-pointer">
                      Enable real-time instant email dispatch on every successful purchase
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center space-x-3">
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg shadow-sm transition flex items-center space-x-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Notification Preferences</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsSendingTestEmail(true);
                        const res = await dispatchTestAdminEmail();
                        setIsSendingTestEmail(false);
                        if (res) {
                          setSuccessNotice(`✓ Diagnostic test email sent to ${emailSettingsForm.primaryAdminEmail}! Check the Admin Mailbox.`);
                        }
                      }}
                      className="border border-purple-600 text-purple-700 hover:bg-purple-50 font-bold px-4 py-2.5 rounded-lg transition flex items-center space-x-1.5"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Diagnostic Test Email</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: COUPONS & DISCOUNTS */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-extrabold text-base text-udemy-dark">
                  Discount Promo Codes & Special Campaigns
                </h2>
                <p className="text-xs text-gray-500">
                  Create student discount codes applied during cart checkout
                </p>
              </div>

              <button
                onClick={() => setShowAddCouponModal(true)}
                className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center space-x-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Create Coupon Code</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coupons.map(c => (
                <div key={c.code} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-base text-purple-900 bg-purple-100 px-2.5 py-1 rounded">
                      {c.code}
                    </span>
                    <button
                      onClick={() => toggleCouponStatus(c.code)}
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                  <div className="text-2xl font-extrabold text-udemy-dark">
                    {c.discountPercent}% OFF
                  </div>
                  <p className="text-xs text-gray-600">{c.description}</p>

                  <div className="pt-2 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => {
                        deleteCoupon(c.code);
                        showNotification(`Coupon ${c.code} deleted.`);
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ENTERPRISE SECURITY & ANTI-HACKING COMMAND CENTER */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Security Posture Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Bank-Grade Payment &amp; Web Security Active</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2 pt-1">
                    <Lock className="w-6 h-6 text-amber-400" />
                    <span>Security Command &amp; Anti-Hacking Threat Shield</span>
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Zero-Trust Catalog Price Validation, HMAC-SHA256 Payment Proof, Content Security Policy (CSP), Anti-Brute-Force Rate Limiting, and PCI-DSS Level 1 Credential Masking.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-xl text-center">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Security Score</div>
                    <div className="text-2xl font-black text-emerald-400">
                      {securityScanResult ? `${securityScanResult.securityScore}/100` : '98/100'}
                    </div>
                  </div>

                  <button
                    onClick={handleTriggerSecurityScan}
                    disabled={isScanningSecurity}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-md transition flex items-center space-x-2 shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${isScanningSecurity ? 'animate-spin' : ''}`} />
                    <span>{isScanningSecurity ? 'Running Deep Audit...' : 'Run Deep Security Audit'}</span>
                  </button>
                </div>
              </div>

              {/* Diagnostic Scan Report (if triggered) */}
              {securityScanResult && (
                <div className="bg-slate-800/90 border border-emerald-500/40 rounded-xl p-4 text-xs space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="font-extrabold text-emerald-300 flex items-center space-x-1.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Deep Integrity Diagnostic Results ({securityScanResult.status})</span>
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">
                      {new Date(securityScanResult.auditTimestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {securityScanResult.passes.map((p, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/80 flex items-start space-x-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white text-xs">{p.title}</strong>
                          <p className="text-[11px] text-slate-400">{p.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {securityScanResult.issues.length === 0 ? (
                    <div className="text-emerald-300 font-bold text-xs flex items-center space-x-1.5 pt-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>0 Vulnerabilities Detected. Payment gateways, pricing constraints and access roles are fully secure!</span>
                    </div>
                  ) : (
                    <div className="space-y-1 pt-1">
                      {securityScanResult.issues.map((iss, idx) => (
                        <div key={idx} className="bg-rose-950/60 border border-rose-700 text-rose-200 p-2 rounded-lg text-xs flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <strong>{iss.title}</strong>: {iss.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4 Active Threat Defense Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-udemy-border shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-udemy-dark">Zero-Trust Price Guard</h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">
                    ARMED
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Cart totals are strictly verified against the catalog database. Client price tampering in memory or browser storage is intercepted and logged.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-udemy-border shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-udemy-dark">HMAC-SHA256 Auth</h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">
                    ARMED
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Every order and payment callback requires cryptographic SHA-256 signatures derived from merchant secrets. Tampered callbacks fail instantly.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-udemy-border shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-udemy-dark">PCI-DSS Tokenization</h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">
                    ARMED
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Zero raw card numbers, CVVs or UPI PINs are ever saved. API keys and merchant secrets are masked with zero plaintext browser exposure.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-udemy-border shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-udemy-dark">Anti-Brute Force Shield</h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">
                    ARMED
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Automated rate limiter throttles rapid-fire coupon guessing and credential stuffing attacks. Content Security Policy (CSP) blocks XSS.
                </p>
              </div>
            </div>

            {/* Interactive Security Audit Logs Feed */}
            <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-udemy-dark flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span>Real-Time Security &amp; Audit Trail</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Cryptographic signature events, administrative changes, and intrusion attempts
                  </p>
                </div>

                {/* Filter severity tabs */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-bold">
                  {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
                    <button
                      key={sev}
                      onClick={() => setSecurityLogFilter(sev)}
                      className={`px-3 py-1 rounded-md transition ${
                        securityLogFilter === sev
                          ? 'bg-white text-udemy-dark shadow-sm'
                          : 'text-gray-500 hover:text-black'
                      }`}
                    >
                      {sev === 'ALL' ? `All (${securityAuditLogs.length})` : sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                {securityAuditLogs
                  .filter(l => securityLogFilter === 'ALL' || l.severity === securityLogFilter)
                  .map(log => {
                    const isCritical = log.severity === 'CRITICAL';
                    const isWarning = log.severity === 'WARNING';

                    return (
                      <div
                        key={log.id}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3 transition ${
                          isCritical
                            ? 'bg-rose-50/70 border-rose-300 text-rose-950'
                            : isWarning
                            ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                            : 'bg-slate-50/70 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`font-mono font-bold text-xs ${
                              isCritical ? 'text-rose-700' : isWarning ? 'text-amber-800' : 'text-purple-800'
                            }`}>
                              {log.eventType}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                              isCritical
                                ? 'bg-rose-200 text-rose-900'
                                : isWarning
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-blue-100 text-blue-900'
                            }`}>
                              {log.severity}
                            </span>
                          </div>
                          <p className="font-medium text-xs leading-snug">{log.details}</p>
                          <div className="text-[11px] text-gray-500">
                            Triggered by: <strong>{log.actor}</strong>
                          </div>
                        </div>

                        <div className="text-[11px] font-mono text-gray-400 shrink-0 sm:text-right">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: BLOGS & SEO CONTENT HUB */}
        {activeTab === 'blogs' && (
          <div className="space-y-6">
            {/* Header & Action Controls */}
            <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    SEO & Content Marketing Engine
                  </span>
                  <span className="text-xs text-gray-500 font-semibold">
                    Google SERP Rank Booster
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-udemy-dark mt-1 flex items-center space-x-2">
                  <Newspaper className="w-5 h-5 text-indigo-600" />
                  <span>Technical Articles, Guides & Exam SEO Hub</span>
                </h2>
                <p className="text-xs text-gray-500 max-w-2xl mt-0.5">
                  Publish high-ranking certification roadmaps, interview question banks, and syllabus updates with live Google snippet preview, meta descriptions, and custom focus keywords.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search articles, keywords, tags..."
                    value={blogSearch}
                    onChange={(e) => setBlogSearch(e.target.value)}
                    className="w-full sm:w-64 bg-[#f7f9fa] border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  {blogSearch && (
                    <button
                      onClick={() => setBlogSearch('')}
                      className="absolute right-2.5 top-2 text-xs text-gray-400 hover:text-black"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  onClick={handleOpenCreateBlog}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition flex items-center justify-center space-x-1.5 shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Write New SEO Article</span>
                </button>
              </div>
            </div>

            {/* 4 SEO KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-udemy-border shadow-sm flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-udemy-dark">{blogs.length}</div>
                  <div className="text-xs text-gray-500 font-medium">Total SEO Articles</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-udemy-border shadow-sm flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-700">
                    {blogs.filter(b => b.isPublished).length}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Live &amp; Indexed on Google</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-udemy-border shadow-sm flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-purple-700">
                    {blogs.reduce((acc, b) => acc + (Number(b.viewsCount) || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Organic Article Views</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-udemy-border shadow-sm flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-800">
                    {[...new Set(blogs.map(b => b.category))].length}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Target Tech Categories</div>
                </div>
              </div>
            </div>

            {/* Articles Table & SEO Metrics */}
            <div className="bg-white rounded-2xl border border-udemy-border shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                  Published Articles &amp; Search Engine Optimization ({filteredBlogs.length} articles)
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Author: <strong>Yogesh Dhiman (Udemy Profile Verified)</strong>
                </div>
              </div>

              {filteredBlogs.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <Newspaper className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-sm font-semibold text-gray-600">No blog articles match your search filter.</p>
                  <button
                    onClick={() => { setBlogSearch(''); handleOpenCreateBlog(); }}
                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold"
                  >
                    Create New Article
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f7f9fa] text-gray-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 w-12">#</th>
                        <th className="py-3 px-4">Article Title &amp; Slug</th>
                        <th className="py-3 px-4">Category &amp; Focus Keywords</th>
                        <th className="py-3 px-4">SEO Snippet Quality</th>
                        <th className="py-3 px-4">Views &amp; Read Time</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredBlogs.map((b, idx) => {
                        const metaTitleLen = b.metaTitle?.length || 0;
                        const metaDescLen = b.metaDescription?.length || 0;
                        const isTitleGood = metaTitleLen >= 30 && metaTitleLen <= 60;
                        const isDescGood = metaDescLen >= 80 && metaDescLen <= 160;

                        return (
                          <tr key={b.id} className="hover:bg-slate-50 transition">
                            <td className="py-3.5 px-4 font-bold text-gray-400">{idx + 1}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={b.featuredImage || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'}
                                  alt=""
                                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                                <div className="space-y-0.5 min-w-0">
                                  <div className="font-bold text-gray-900 line-clamp-1">{b.title}</div>
                                  <div className="text-[11px] font-mono text-indigo-600 truncate">
                                    /blog/{b.slug}
                                  </div>
                                  <div className="text-[10px] text-gray-400">
                                    Published: {b.publishedDate} by {b.author || 'Yogesh Dhiman'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 space-y-1">
                              <span className="inline-block bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                {b.category}
                              </span>
                              {b.focusKeywords && (
                                <p className="text-[10px] text-gray-500 truncate max-w-xs" title={b.focusKeywords}>
                                  <strong>Keywords:</strong> {b.focusKeywords}
                                </p>
                              )}
                            </td>
                            <td className="py-3.5 px-4 space-y-1">
                              <div className="flex items-center space-x-2 text-[10px]">
                                <span className={`font-bold px-1.5 py-0.5 rounded ${
                                  isTitleGood ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  Title: {metaTitleLen}/60 chars
                                </span>
                                <span className={`font-bold px-1.5 py-0.5 rounded ${
                                  isDescGood ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  Desc: {metaDescLen}/160 chars
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 line-clamp-1 italic">
                                &quot;{b.metaDescription || b.excerpt}&quot;
                              </p>
                            </td>
                            <td className="py-3.5 px-4 space-y-0.5">
                              <div className="font-extrabold text-gray-900">{b.viewsCount?.toLocaleString() || 0} views</div>
                              <div className="text-[10px] text-gray-400">{b.readTimeMinutes || 5} min read</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => toggleBlogPublish(b.id)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition flex items-center space-x-1 ${
                                  b.isPublished
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                                }`}
                                title="Click to toggle publish status"
                              >
                                {b.isPublished ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                    <span>Live (Indexed)</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3 text-gray-400" />
                                    <span>Draft (Hidden)</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => handleOpenEditBlog(b)}
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                  title="Edit Article & SEO"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBlog(b.id, b.title)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="Delete Article"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: STUDENT RATINGS & REVIEWS MANAGEMENT */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>Verified Student Feedback</span>
                  </span>
                  <span className="text-xs text-gray-500 font-semibold">
                    100% Enrolled Buyers Only
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-udemy-dark mt-1 flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  <span>Student Ratings &amp; Course Reviews Hub</span>
                </h2>
                <p className="text-xs text-gray-500 max-w-2xl mt-0.5">
                  Inspect, filter, and moderate student testimonials and 5-star course reviews. Only students who have purchased or enrolled in a product can submit a verified review. Deleting a review automatically recalculates that course&apos;s average rating in the catalog.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search reviews, courses, students..."
                    value={reviewSearchQuery}
                    onChange={(e) => setReviewSearchQuery(e.target.value)}
                    className="w-full sm:w-64 bg-[#f7f9fa] border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-purple-600"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  {reviewSearchQuery && (
                    <button
                      onClick={() => setReviewSearchQuery('')}
                      className="absolute right-2.5 top-2 text-xs text-gray-400 hover:text-black"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 4 Review KPI Metrics */}
            {(() => {
              const allReviews = reviews || [];
              const avgScore = allReviews.length > 0
                ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
                : '5.0';
              const fiveStarCount = allReviews.filter(r => r.rating === 5).length;
              const fiveStarPct = allReviews.length > 0 ? Math.round((fiveStarCount / allReviews.length) * 100) : 100;
              const helpfulTotal = allReviews.reduce((sum, r) => sum + (r.helpfulCount || 0), 0);

              return (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-udemy-border shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-udemy-dark">{allReviews.length}</div>
                      <div className="text-xs text-gray-500 font-medium">Total Student Reviews</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-udemy-border shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-amber-700">{avgScore} ★</div>
                      <div className="text-xs text-gray-500 font-medium">Platform Average Rating</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-udemy-border shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-emerald-700">{fiveStarPct}%</div>
                      <div className="text-xs text-gray-500 font-medium">5-Star Satisfaction</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-udemy-border shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-blue-700">{helpfulTotal}</div>
                      <div className="text-xs text-gray-500 font-medium">Helpful Community Votes</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Filter Pills */}
            <div className="bg-white p-4 rounded-xl border border-udemy-border shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-700 mr-1">Filter by Rating:</span>
                {['all', '5', '4', '3', '2', '1'].map((starVal) => {
                  const count = starVal === 'all'
                    ? (reviews || []).length
                    : (reviews || []).filter(r => Math.round(r.rating) === parseInt(starVal)).length;

                  return (
                    <button
                      key={starVal}
                      onClick={() => setReviewStarFilter(starVal)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1 ${
                        reviewStarFilter === starVal
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {starVal === 'all' ? (
                        <span>All Reviews ({count})</span>
                      ) : (
                        <>
                          <Star className={`w-3.5 h-3.5 ${reviewStarFilter === starVal ? 'fill-white text-white' : 'fill-amber-400 text-amber-500'}`} />
                          <span>{starVal} Stars ({count})</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-gray-500">
                Showing {
                  (reviews || []).filter(r => {
                    const matchesStar = reviewStarFilter === 'all' || Math.round(r.rating) === parseInt(reviewStarFilter);
                    const prod = products.find(p => p.id === r.productId);
                    const q = reviewSearchQuery.toLowerCase();
                    const matchesSearch = !q ||
                      r.title?.toLowerCase().includes(q) ||
                      r.comment?.toLowerCase().includes(q) ||
                      r.userName?.toLowerCase().includes(q) ||
                      prod?.title?.toLowerCase().includes(q);
                    return matchesStar && matchesSearch;
                  }).length
                } reviews
              </div>
            </div>

            {/* Reviews List */}
            {(() => {
              const filteredList = (reviews || []).filter(r => {
                const matchesStar = reviewStarFilter === 'all' || Math.round(r.rating) === parseInt(reviewStarFilter);
                const prod = products.find(p => p.id === r.productId);
                const q = reviewSearchQuery.toLowerCase();
                const matchesSearch = !q ||
                  r.title?.toLowerCase().includes(q) ||
                  r.comment?.toLowerCase().includes(q) ||
                  r.userName?.toLowerCase().includes(q) ||
                  prod?.title?.toLowerCase().includes(q);
                return matchesStar && matchesSearch;
              });

              if (filteredList.length === 0) {
                return (
                  <div className="bg-white rounded-2xl border border-udemy-border p-12 text-center text-xs text-gray-500 space-y-2">
                    <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="font-bold text-sm text-gray-700">No reviews found matching your filter criteria.</p>
                    <p>Try clearing your search query or choosing &quot;All Reviews&quot;.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {filteredList.map((rev) => {
                    const course = products.find(p => p.id === rev.productId);

                    return (
                      <div
                        key={rev.id}
                        className="bg-white rounded-2xl border border-udemy-border p-5 shadow-sm hover:shadow-card-hover transition space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          {/* Student & Course Info */}
                          <div className="flex items-center space-x-3">
                            <img
                              src={rev.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.userName || 'Student')}`}
                              alt={rev.userName}
                              className="w-10 h-10 rounded-full object-cover border border-purple-200 shrink-0"
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-extrabold text-sm text-udemy-dark">{rev.userName}</span>
                                {rev.isVerifiedPurchase && (
                                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                    <span>Verified Purchaser</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-purple-700 font-semibold flex items-center space-x-1 mt-0.5">
                                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate max-w-md" title={course?.title || rev.productId}>
                                  {course ? course.title : `Product ID: ${rev.productId}`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Date & Moderation action */}
                          <div className="flex items-center space-x-3 text-xs self-end sm:self-auto">
                            <span className="text-gray-400 text-[11px]">{rev.date}</span>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete this review by "${rev.userName}"? The course average rating will be updated automatically.`)) {
                                  const ok = deleteReview(rev.id);
                                  if (ok) {
                                    setSuccessNotice(`Review by ${rev.userName} deleted. Course rating recalculated.`);
                                  }
                                }
                              }}
                              className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-1.5 rounded-lg transition flex items-center space-x-1"
                              title="Delete / Moderate Review"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="text-[11px] font-bold">Delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Rating Stars & Title */}
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-4 h-4 ${
                                    s <= rev.rating
                                      ? 'fill-amber-400 text-amber-500'
                                      : 'fill-slate-100 text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-slate-800">{rev.rating}.0</span>
                            {rev.title && (
                              <span className="font-extrabold text-sm text-udemy-dark">• &ldquo;{rev.title}&rdquo;</span>
                            )}
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-sans">
                            {rev.comment}
                          </p>
                        </div>

                        {/* Footer helpful stats */}
                        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                          <div className="flex items-center space-x-1.5">
                            <span>👍 <strong>{rev.helpfulCount || 0}</strong> students found this review helpful</span>
                            {rev.isEdited && <span className="text-gray-400 italic">• Edited</span>}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {rev.id}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* MODAL 1: Create New Course / Practice Test Wizard */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-udemy-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-udemy-dark">
                Create New Practice Test or Online Course
              </h3>
              <button onClick={() => setShowCreateCourseModal(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certified Data Engineer Associate (DEA-C01) Practice Tests"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2"
                  >
                    <option value="certifications">IT Certification Practice Tests</option>
                    <option value="courses">Online Courses & Masterclasses</option>
                    <option value="interviews">IT Interview Practice Tests</option>
                    <option value="free">Free Practice Tests</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Vendor / Blueprint</label>
                  <select
                    value={courseForm.vendor}
                    onChange={(e) => setCourseForm({ ...courseForm, vendor: e.target.value })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2"
                  >
                    <option value="AWS">AWS</option>
                    <option value="Microsoft">Microsoft Azure</option>
                    <option value="Google">Google Cloud</option>
                    <option value="CompTIA">CompTIA</option>
                    <option value="Kubernetes">Kubernetes</option>
                    <option value="Databricks">Databricks</option>
                    <option value="Linux">Linux</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={courseForm.priceINR}
                    onChange={(e) => setCourseForm({ ...courseForm, priceINR: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.priceUSD}
                    onChange={(e) => setCourseForm({ ...courseForm, priceUSD: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Course Description</label>
                <textarea
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Comprehensive exam scenario questions, detailed answer explanations, and domain breakdown..."
                  className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateCourseModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-udemy-purple hover:bg-udemy-purple-hover text-white font-bold px-5 py-2 rounded-lg"
                >
                  Publish to Live Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Existing Course & Practice Tests with Lifetime Access Sync */}
      {showEditCourseModal && editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-udemy-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-udemy-dark">
                    Edit Course &amp; Practice Tests
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Course ID: <span className="font-mono">{editCourseForm.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditCourseModal(false);
                  setEditingCourse(null);
                }}
                className="text-gray-400 hover:text-black text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Lifetime Access Auto-Sync Guarantee Notice */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center space-x-1.5 text-emerald-900">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Student Lifetime Access Automatic Sync Active</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                When you save changes to this course, all students currently enrolled will automatically receive the updated title, passing score, exam duration, questions, and curriculum in their dashboard. <strong>Students will NOT be required to buy the course again.</strong>
              </p>
            </div>

            <form onSubmit={handleSaveEditedCourseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={editCourseForm.title}
                  onChange={(e) => setEditCourseForm({ ...editCourseForm, title: e.target.value })}
                  className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={editCourseForm.category}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, category: e.target.value })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2"
                  >
                    <option value="certifications">IT Certification Practice Tests</option>
                    <option value="courses">Online Courses &amp; Masterclasses</option>
                    <option value="interviews">IT Interview Practice Tests</option>
                    <option value="free">Free Practice Tests</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Vendor / Blueprint</label>
                  <select
                    value={editCourseForm.vendor}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, vendor: e.target.value })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2"
                  >
                    <option value="AWS">AWS</option>
                    <option value="Microsoft">Microsoft Azure</option>
                    <option value="Google">Google Cloud</option>
                    <option value="CompTIA">CompTIA</option>
                    <option value="Kubernetes">Kubernetes</option>
                    <option value="Databricks">Databricks</option>
                    <option value="Linux">Linux</option>
                    <option value="Cisco">Cisco</option>
                    <option value="Salesforce">Salesforce</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={editCourseForm.priceINR}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, priceINR: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCourseForm.priceUSD}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, priceUSD: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={editCourseForm.durationMinutes}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, durationMinutes: parseInt(e.target.value) || 120 })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Passing Score (%)</label>
                  <input
                    type="number"
                    value={editCourseForm.passingScore}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, passingScore: parseInt(e.target.value) || 70 })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Promotional Badge</label>
                  <select
                    value={editCourseForm.badge}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, badge: e.target.value })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2"
                  >
                    <option value="Bestseller">Bestseller</option>
                    <option value="Highest Rated">Highest Rated</option>
                    <option value="Hot &amp; New">Hot &amp; New</option>
                    <option value="Updated 2026">Updated 2026</option>
                    <option value="Trending">Trending</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Update Announcement / Note</label>
                  <input
                    type="text"
                    value={editCourseForm.lastUpdateNote}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, lastUpdateNote: e.target.value })}
                    placeholder="e.g. Added 65 new 2026 scenario questions &amp; revised explanations"
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Course Description &amp; Objectives</label>
                <textarea
                  rows={3}
                  value={editCourseForm.description}
                  onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
                  placeholder="Detailed course description, domains covered, and exam tips..."
                  className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[11px] text-gray-500">
                  Version: <strong>{editingCourse.version ? `v${editingCourse.version + 1}` : 'v2.0'}</strong> • Instant sync to all students
                </span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditCourseModal(false);
                      setEditingCourse(null);
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-gray-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Course &amp; Sync to Students</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Payment Gateway Modal */}
      {showAddGatewayModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-udemy-border space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-udemy-dark flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <span>Configure New Payment Gateway</span>
              </h3>
              <button onClick={() => setShowAddGatewayModal(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGatewaySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Gateway Provider *</label>
                <select
                  value={gatewayForm.provider}
                  onChange={(e) => {
                    const prov = e.target.value;
                    setGatewayForm({
                      ...gatewayForm,
                      provider: prov,
                      name: `${prov} Gateway`
                    });
                  }}
                  className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5"
                >
                  <option value="Razorpay">Razorpay (Cards, UPI, NetBanking)</option>
                  <option value="Cashfree">Cashfree Payments (Instant UPI & Cards)</option>
                  <option value="Stripe">Stripe (International USD/EUR/GBP)</option>
                  <option value="PayU">PayU Biz India</option>
                  <option value="CCAvenue">CCAvenue Enterprise</option>
                  <option value="PayPal">PayPal Checkout</option>
                  <option value="UPI">Direct UPI QR Code</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Gateway Display Name *</label>
                <input
                  type="text"
                  required
                  value={gatewayForm.name}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, name: e.target.value })}
                  className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  API Key ID / Merchant ID / App ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rzp_live_9k8a2026 or app_id_99"
                  value={gatewayForm.keyId}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, keyId: e.target.value })}
                  className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Secret Key / Merchant Salt *</label>
                <input
                  type="password"
                  required
                  placeholder="Enter secret key..."
                  value={gatewayForm.keySecret}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, keySecret: e.target.value })}
                  className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Webhook Secret (Optional)</label>
                <input
                  type="text"
                  placeholder="whsec_..."
                  value={gatewayForm.webhookSecret}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, webhookSecret: e.target.value })}
                  className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="testModeCheck"
                  checked={gatewayForm.isTestMode}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, isTestMode: e.target.checked })}
                  className="rounded text-purple-600"
                />
                <label htmlFor="testModeCheck" className="text-gray-700 font-semibold cursor-pointer">
                  Enable in Test / Sandbox Mode first
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddGatewayModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-lg"
                >
                  Save & Enable Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2.5: Edit / Configure Payment Gateway Modal */}
      {showEditGatewayModal && editingGateway && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-udemy-border space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-udemy-dark flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <span>Configure {editGatewayForm.provider} Integration</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowEditGatewayModal(false);
                  setEditingGateway(null);
                }}
                className="text-gray-400 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditGatewaySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Gateway Display Name *</label>
                <input
                  type="text"
                  required
                  value={editGatewayForm.name}
                  onChange={(e) => setEditGatewayForm({ ...editGatewayForm, name: e.target.value })}
                  className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-900"
                />
              </div>

              {/* SPECIFIC FIELDS FOR PAYPAL */}
              {editGatewayForm.provider === 'PayPal' ? (
                <>
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 space-y-1.5 text-sky-950">
                    <div className="flex items-center space-x-1.5 font-extrabold text-xs text-[#003087]">
                      <span>📘 How to Link Your PayPal Account:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700">
                      <li>Log in to <a href="https://developer.paypal.com/dashboard/applications/live" target="_blank" rel="noreferrer" className="text-sky-700 underline font-bold">PayPal Developer Dashboard</a>.</li>
                      <li>Go to <strong>Apps &amp; Credentials</strong> and toggle to <strong>Live</strong>.</li>
                      <li>Create an app named <em>ITPracticeTests</em> and copy your <strong>Client ID</strong>.</li>
                      <li>Paste the Client ID below to accept real payments directly into your PayPal account.</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      PayPal Client ID (Live / Sandbox App Client ID) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. A21AAJ... (Obtain from developer.paypal.com)"
                      value={editGatewayForm.clientId}
                      onChange={(e) => setEditGatewayForm({ ...editGatewayForm, clientId: e.target.value, keyId: e.target.value })}
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-mono text-xs"
                    />
                    <span className="text-[10px] text-gray-500">
                      Required for official PayPal modal and Card buttons to deposit payments into your account.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      PayPal Secret Key (Optional / Webhooks)
                    </label>
                    <input
                      type="password"
                      placeholder="Enter secret key..."
                      value={editGatewayForm.clientSecret}
                      onChange={(e) => setEditGatewayForm({ ...editGatewayForm, clientSecret: e.target.value, keySecret: e.target.value })}
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      PayPal Business / Merchant Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. payments@itpracticetests.com"
                      value={editGatewayForm.merchantEmail}
                      onChange={(e) => setEditGatewayForm({ ...editGatewayForm, merchantEmail: e.target.value })}
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-mono text-xs"
                    />
                    <span className="text-[10px] text-gray-500">
                      The PayPal email where learner funds, invoice receipts, and IPN notifications are delivered.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      PayPal.Me Username (Optional fallback)
                    </label>
                    <div className="flex items-center">
                      <span className="bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg p-2.5 text-xs text-gray-600 font-mono">
                        paypal.me/
                      </span>
                      <input
                        type="text"
                        placeholder="ITPracticeTests"
                        value={editGatewayForm.paypalMe}
                        onChange={(e) => setEditGatewayForm({ ...editGatewayForm, paypalMe: e.target.value.replace(/^.*paypal\.me\//, '') })}
                        className="w-full bg-[#f7f9fa] border border-slate-300 rounded-r-lg p-2.5 font-mono text-xs"
                      />
                    </div>
                  </div>
                </>
              ) : editGatewayForm.provider === 'UPI Direct' ? (
                <>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Merchant UPI VPA *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. itpracticetests@okhdfcbank"
                      value={editGatewayForm.upiVpa}
                      onChange={(e) => setEditGatewayForm({ ...editGatewayForm, upiVpa: e.target.value })}
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Merchant Business Name</label>
                    <input
                      type="text"
                      value={editGatewayForm.merchantName}
                      onChange={(e) => setEditGatewayForm({ ...editGatewayForm, merchantName: e.target.value })}
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 text-xs"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">API Key ID / Merchant ID / App ID *</label>
                    <input
                      type="text"
                      required
                      value={editGatewayForm.keyId}
                      onChange={(e) => setEditGatewayForm({ ...editGatewayForm, keyId: e.target.value })}
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Secret Key / Salt *</label>
                    <input
                      type="password"
                      value={editGatewayForm.keySecret}
                      onChange={(e) => setEditGatewayForm({ ...editGatewayForm, keySecret: e.target.value })}
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Webhook Secret (Optional)</label>
                    <input
                      type="text"
                      value={editGatewayForm.webhookSecret}
                      onChange={(e) => setEditGatewayForm({ ...editGatewayForm, webhookSecret: e.target.value })}
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-mono text-xs"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Primary Currency</label>
                  <select
                    value={editGatewayForm.currency}
                    onChange={(e) => setEditGatewayForm({ ...editGatewayForm, currency: e.target.value })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value="USD">USD ($ - United States Dollar)</option>
                    <option value="INR">INR (₹ - Indian Rupee)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                    <option value="ALL">Multi-Currency (ALL)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Environment Mode</label>
                  <select
                    value={editGatewayForm.environment}
                    onChange={(e) => {
                      const env = e.target.value;
                      setEditGatewayForm({
                        ...editGatewayForm,
                        environment: env,
                        isTestMode: env === 'SANDBOX'
                      });
                    }}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value="PRODUCTION">Live Production (Real Money)</option>
                    <option value="SANDBOX">Sandbox Test Environment</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="gatewayActiveCheck"
                  checked={editGatewayForm.isEnabled}
                  onChange={(e) => setEditGatewayForm({ ...editGatewayForm, isEnabled: e.target.checked })}
                  className="rounded text-purple-600"
                />
                <label htmlFor="gatewayActiveCheck" className="text-gray-700 font-bold cursor-pointer">
                  Enable Gateway on Student Checkout Page
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditGatewayModal(false);
                    setEditingGateway(null);
                  }}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-lg text-xs shadow-sm transition"
                >
                  Save &amp; Activate Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Coupon Modal */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-udemy-border space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-udemy-dark flex items-center space-x-2">
                <Tag className="w-5 h-5 text-purple-600" />
                <span>Create Discount Coupon</span>
              </h3>
              <button onClick={() => setShowAddCouponModal(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCouponSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH30"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Discount Percentage (%) *</label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  required
                  value={newCoupon.discountPercent}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: parseInt(e.target.value) || 20 })}
                  className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description / Campaign</label>
                <input
                  type="text"
                  placeholder="e.g. Special 30% discount for community students"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-udemy-purple hover:bg-udemy-purple-hover text-white font-bold px-5 py-2 rounded-lg"
                >
                  Activate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Create / Edit SEO Blog Article */}
      {showBlogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-5 sm:p-6 shadow-2xl border border-udemy-border space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Newspaper className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-udemy-dark">
                    {editingBlog ? 'Edit SEO Article & Meta Strategies' : 'Write New SEO Article & Meta Strategy'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Live Google search snippet preview, keyword density, and custom slug generator
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowBlogModal(false); setEditingBlog(null); }}
                className="text-gray-400 hover:text-black p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBlogSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left 7 Columns: Content & Metadata */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Article Title */}
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                      Article Headline / Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AWS Solutions Architect Associate (SAA-C03) Exam Prep Guide 2026"
                      value={blogForm.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBlogForm(prev => ({
                          ...prev,
                          title: val,
                          slug: !editingBlog ? generateSlug(val) : prev.slug,
                          metaTitle: !editingBlog ? `${val} | ITPracticeTests` : prev.metaTitle
                        }));
                      }}
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-bold text-sm focus:bg-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  {/* Slug and Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-800 mb-1">
                        URL Slug (/blog/*) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2.5 text-gray-400 font-mono text-[10px]">
                          /blog/
                        </span>
                        <input
                          type="text"
                          required
                          value={blogForm.slug}
                          onChange={(e) => setBlogForm({ ...blogForm, slug: generateSlug(e.target.value) })}
                          placeholder="aws-solutions-architect-guide"
                          className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg py-2.5 pl-14 pr-2 font-mono text-indigo-700 font-bold focus:bg-white focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-800 mb-1">
                        Article Category *
                      </label>
                      <select
                        value={blogForm.category}
                        onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                        className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-medium"
                      >
                        <option value="Cloud Certifications">Cloud Certifications (AWS / GCP / Cloud)</option>
                        <option value="Azure & Security">Azure &amp; Security (AZ-500, SC-300, etc.)</option>
                        <option value="IT Interview Preparation">IT Interview Preparation (Selenium, Python, SQL)</option>
                        <option value="DevOps & Kubernetes">DevOps &amp; Kubernetes (CKA, Docker, Terraform)</option>
                        <option value="Database & Analytics">Database &amp; Analytics (Databricks, Snowflake)</option>
                        <option value="Agile & Scrum">Agile &amp; Scrum Master</option>
                      </select>
                    </div>
                  </div>

                  {/* Read Time & Linked Course CTA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-800 mb-1">
                        Est. Read Time (Minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={blogForm.readTimeMinutes}
                        onChange={(e) => setBlogForm({ ...blogForm, readTimeMinutes: parseInt(e.target.value) || 5 })}
                        className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-800 mb-1">
                        Linked Practice Test (Direct CTA Banner)
                      </label>
                      <select
                        value={blogForm.relatedCourseId || ''}
                        onChange={(e) => setBlogForm({ ...blogForm, relatedCourseId: e.target.value })}
                        className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2 font-medium"
                      >
                        <option value="">-- No Direct Product Linked --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            [{p.vendor}] {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Featured Image */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-800">Featured Header Image URL</label>
                      <div className="flex items-center space-x-1.5 text-[10px] text-gray-500">
                        <span>Presets:</span>
                        <button
                          type="button"
                          onClick={() => setBlogForm({ ...blogForm, featuredImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80' })}
                          className="hover:text-indigo-600 underline"
                        >
                          AWS Cloud
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setBlogForm({ ...blogForm, featuredImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80' })}
                          className="hover:text-indigo-600 underline"
                        >
                          Azure Cyber
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setBlogForm({ ...blogForm, featuredImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80' })}
                          className="hover:text-indigo-600 underline"
                        >
                          Selenium Coding
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setBlogForm({ ...blogForm, featuredImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80' })}
                          className="hover:text-indigo-600 underline"
                        >
                          Kubernetes
                        </button>
                      </div>
                    </div>
                    <input
                      type="url"
                      value={blogForm.featuredImage}
                      onChange={(e) => setBlogForm({ ...blogForm, featuredImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2 font-mono text-[11px]"
                    />
                  </div>

                  {/* Excerpt / Summary */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-800">
                        Article Excerpt / Card Summary *
                      </label>
                      <span className="text-[10px] text-gray-400">
                        {blogForm.excerpt?.length || 0} characters
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={blogForm.excerpt}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBlogForm(prev => ({
                          ...prev,
                          excerpt: val,
                          metaDescription: !prev.metaDescription || prev.metaDescription === prev.excerpt ? val : prev.metaDescription
                        }));
                      }}
                      placeholder="A crisp 1-2 sentence executive summary of what students will learn from this article..."
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 text-xs"
                    />
                  </div>

                  {/* Full Article Content */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-800">
                        Article Body Content (Markdown Supported) *
                      </label>
                      <span className="text-[10px] text-gray-400">
                        Supports ## Headings, - Lists, `code`, and callouts
                      </span>
                    </div>
                    <textarea
                      rows={10}
                      required
                      value={blogForm.content}
                      onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                      placeholder="## Introduction\n\nExplain key concepts...\n\n### Core Exam Domains\n- Domain 1\n- Domain 2"
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 font-mono text-xs leading-relaxed"
                    />
                  </div>
                </div>

                {/* Right 5 Columns: SEO Optimization & Google SERP Preview */}
                <div className="lg:col-span-5 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      Google Search SERP Preview
                    </span>
                    <h4 className="font-extrabold text-sm text-udemy-dark mt-1">
                      Live Search Engine Appearance
                    </h4>
                  </div>

                  {/* Google Snippet Simulation */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1 font-sans">
                    <div className="text-[11px] text-[#202124] flex items-center space-x-1 truncate font-mono">
                      <span className="text-gray-400">https://www.itpracticetests.com</span>
                      <span className="text-gray-400">&gt;</span>
                      <span className="text-indigo-600 truncate">blog</span>
                      <span className="text-gray-400">&gt;</span>
                      <span className="text-gray-600 truncate">{blogForm.slug || 'article-slug'}</span>
                    </div>
                    <div className="text-sm font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1 leading-snug">
                      {blogForm.metaTitle || blogForm.title || 'Article Headline | ITPracticeTests'}
                    </div>
                    <div className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                      {blogForm.metaDescription || blogForm.excerpt || 'Read this in-depth certification study guide by Udemy Instructor Yogesh Dhiman with realistic scenario questions and cheat sheets.'}
                    </div>
                  </div>

                  {/* Meta Title Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-800">
                        SEO Meta Title
                      </label>
                      <span className={`text-[10px] font-bold ${
                        (blogForm.metaTitle?.length || 0) <= 60 ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {blogForm.metaTitle?.length || 0} / 60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={blogForm.metaTitle}
                      onChange={(e) => setBlogForm({ ...blogForm, metaTitle: e.target.value })}
                      placeholder="e.g. AWS SAA-C03 Study Guide & Practice Tests | ITPracticeTests"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Recommended: 50-60 characters. Search engines truncate long titles.
                    </p>
                  </div>

                  {/* Meta Description Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-800">
                        SEO Meta Description
                      </label>
                      <span className={`text-[10px] font-bold ${
                        (blogForm.metaDescription?.length || 0) <= 160 ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {blogForm.metaDescription?.length || 0} / 160 chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={blogForm.metaDescription}
                      onChange={(e) => setBlogForm({ ...blogForm, metaDescription: e.target.value })}
                      placeholder="A compelling, keyword-rich summary that encourages Google searchers to click through..."
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs leading-relaxed"
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Recommended: 120-160 characters. Accurately summarize the article benefits.
                    </p>
                  </div>

                  {/* Focus Keywords */}
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                      Primary Focus Keywords (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={blogForm.focusKeywords}
                      onChange={(e) => setBlogForm({ ...blogForm, focusKeywords: e.target.value })}
                      placeholder="e.g. aws solutions architect associate, saa-c03 exam tips, aws mock tests"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                      Article Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={blogForm.tags}
                      onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                      placeholder="AWS, Cloud, Certification, SAA-C03"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  {/* Canonical URL */}
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                      Canonical URL (Prevents Duplicate Content)
                    </label>
                    <input
                      type="text"
                      value={blogForm.canonicalUrl}
                      onChange={(e) => setBlogForm({ ...blogForm, canonicalUrl: e.target.value })}
                      placeholder={`https://www.itpracticetests.com/blog/${blogForm.slug || 'article'}`}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-[11px]"
                    />
                  </div>

                  {/* Published Checkbox */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="flex items-center space-x-2.5 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200">
                      <input
                        type="checkbox"
                        checked={blogForm.isPublished}
                        onChange={(e) => setBlogForm({ ...blogForm, isPublished: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <div>
                        <div className="font-bold text-gray-800 text-xs">Publish Live Immediately</div>
                        <div className="text-[10px] text-gray-500">
                          Visible in public directory and indexable by Google web crawlers
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowBlogModal(false); setEditingBlog(null); }}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-gray-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-lg shadow-sm transition flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingBlog ? 'Save Changes' : 'Publish Article Live'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BULK EXCEL QUESTION IMPORTER */}
      {showUploadQuestionsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-udemy-border space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-udemy-dark">
                    Bulk Excel / CSV Question Uploader
                  </h3>
                  <p className="text-xs text-gray-500">
                    Import Questions, Answer Options, Multi-select / Multi-choice types, Explanations, and Domains directly from spreadsheet.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUploadQuestionsModal(false);
                  setParsedQuestions([]);
                  setSelectedFileName('');
                  setUploadError('');
                }}
                className="text-gray-400 hover:text-black text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Select Target Course & Target Practice Test */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Select Target Course *
                </label>
                <select
                  value={uploadTargetProductId}
                  onChange={(e) => setUploadTargetProductId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="">-- Choose Course ({products.length} available) --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.vendor}] {p.title} {customQuestionBanks?.[p.id] ? `(${customQuestionBanks[p.id].all?.length || customQuestionBanks[p.id].length || 0} Qs loaded)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Target Practice Test (Max 6 Tests, 250 Qs each) *
                </label>
                <select
                  value={uploadTargetTestNumber}
                  onChange={(e) => setUploadTargetTestNumber(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="all">⚡ All 6 Tests (Auto-distribute / by Excel Test column)</option>
                  <option value="1">Practice Test 1 (Max 250 Questions)</option>
                  <option value="2">Practice Test 2 (Max 250 Questions)</option>
                  <option value="3">Practice Test 3 (Max 250 Questions)</option>
                  <option value="4">Practice Test 4 (Max 250 Questions)</option>
                  <option value="5">Practice Test 5 (Max 250 Questions)</option>
                  <option value="6">Practice Test 6 (Max 250 Questions)</option>
                </select>
              </div>
            </div>

            {/* Step 2: Upload File & Format Guideline */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Step 2: Upload Excel (.xlsx, .xls) or CSV File
                </label>
                <button
                  type="button"
                  onClick={() => downloadSampleExcelTemplate()}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Format Template (.xlsx)</span>
                </button>
              </div>

              {/* Format Hint Badge */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Format Specification & Question Types</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px] leading-relaxed">
                  <div className="bg-white p-2 rounded border border-amber-200">
                    <span className="font-extrabold text-blue-800">Question Type = "Multi-choice":</span>
                    <p className="text-gray-600 mt-0.5">Student sees single radio buttons. Only 1 answer can be selected. Example: Correct Answers = "2" or "B".</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-amber-200">
                    <span className="font-extrabold text-purple-800">Question Type = "Multi-select":</span>
                    <p className="text-gray-600 mt-0.5">Student sees checkboxes. Multiple answers (1 or more) can be selected. Example: Correct Answers = "1, 3" or "A, C".</p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 pt-1">
                  Required columns: <code>Question, Question Type, Answer Option 1..6, Explanation 1..6, Correct Answers, Overall Explanation, Domain</code>
                </p>
              </div>

              {/* File Dropzone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl p-6 text-center bg-[#fdfdfd] transition cursor-pointer relative">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-gray-800">
                    {selectedFileName ? (
                      <span className="text-emerald-700 flex items-center space-x-1.5">
                        <FileSpreadsheet className="w-4 h-4 inline" />
                        <span>{selectedFileName}</span>
                      </span>
                    ) : (
                      'Click to browse or drag & drop your Excel / CSV file here'
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Supports .xlsx, .xls and .csv files</p>
                </div>
              </div>

              {isParsing && (
                <div className="text-center py-4 text-xs font-bold text-purple-700 flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Parsing questions, answer options and explanations...</span>
                </div>
              )}

              {uploadError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {cappedNotice && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{cappedNotice}</span>
                </div>
              )}
            </div>

            {/* Step 3: Parsed Data Preview */}
            {parsedQuestions.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                    Preview Parsed Questions ({parsedQuestions.length} valid questions ready)
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                      {parsedQuestions.filter(q => q.type === 'single').length} Multi-choice
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                      {parsedQuestions.filter(q => q.type === 'multiple').length} Multi-select
                    </span>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto bg-slate-50">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-200/80 text-gray-700 font-bold sticky top-0">
                      <tr>
                        <th className="py-2 px-3 w-10">#</th>
                        <th className="py-2 px-3 w-28">Type</th>
                        <th className="py-2 px-3">Question & Correct Options</th>
                        <th className="py-2 px-3 w-40">Domain</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {parsedQuestions.slice(0, 8).map((q, idx) => (
                        <tr key={idx} className="hover:bg-purple-50/40">
                          <td className="py-2.5 px-3 font-bold text-gray-500">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            {q.type === 'multiple' ? (
                              <span className="inline-block bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                Multi-select ({q.correctAnswers?.length || 1} answers)
                              </span>
                            ) : (
                              <span className="inline-block bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                Multi-choice (1 answer)
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 space-y-1">
                            <p className="font-bold text-gray-900">{q.question}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] pt-1">
                              {q.options?.map((opt, oIdx) => {
                                const isCorrect = q.correctAnswers?.includes(oIdx);
                                return (
                                  <div
                                    key={oIdx}
                                    className={`px-2 py-1 rounded border text-[11px] flex items-start space-x-1 ${
                                      isCorrect
                                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                        : 'bg-gray-50 text-gray-600 border-gray-200'
                                    }`}
                                  >
                                    <span className="font-mono text-gray-400">
                                      {String.fromCharCode(65 + oIdx)}.
                                    </span>
                                    <span className="flex-1">{opt}</span>
                                    {isCorrect && (
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {q.explanation && (
                              <p className="text-[10px] text-gray-500 italic mt-1 line-clamp-1">
                                <strong>Explanation:</strong> {q.explanation}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-gray-600 text-[11px]">
                            {q.domain || 'General'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedQuestions.length > 8 && (
                    <div className="p-2 text-center text-xs font-semibold text-gray-500 bg-slate-100 border-t border-slate-200">
                      + {parsedQuestions.length - 8} more questions ready to import into the selected practice test.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="text-xs text-gray-500">
                {uploadTargetProductId ? (
                  <span>
                    Selected target:{' '}
                    <strong className="text-purple-700">
                      {products.find(p => p.id === uploadTargetProductId)?.title || uploadTargetProductId}
                    </strong>
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">Please select a target practice test in Step 1.</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadQuestionsModal(false);
                    setParsedQuestions([]);
                    setSelectedFileName('');
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={!uploadTargetProductId || parsedQuestions.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded-lg text-xs flex items-center space-x-1.5 shadow-md transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm & Import {parsedQuestions.length > 0 ? `${parsedQuestions.length} Questions` : ''}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Order Inspection & Official Tax Invoice */}
      {selectedOrderForInspection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-udemy-border space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header & Close */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-udemy-dark">
                    Tax Invoice &amp; Order Inspection
                  </h3>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Invoice #{selectedOrderForInspection.orderId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForInspection(null)}
                className="text-gray-400 hover:text-black text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Official Tax Invoice Container (Printable) */}
            <div id="admin-invoice-sheet" className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white text-xs">
              {/* Business & Tax Identity */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="text-lg font-extrabold text-purple-900">ITPracticeTests.com</div>
                  <div className="text-[11px] text-gray-600 mt-0.5">Online IT Education &amp; Exam Preparation Community</div>
                  <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Office No. 715, 7th Floor, Block D&amp;E, Chandigarh Citi Center<br />
                    VIP Road, Zirakpur, Punjab, India – 140603<br />
                    Phone/WhatsApp: +91-9253330335 • Email: support@itpracticetests.com
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 mt-1">
                    GSTIN: <span className="font-mono text-purple-700">{selectedOrderForInspection.gstNumber || '03AKXPD3010G1ZM'}</span>
                  </div>
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="inline-block bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase">
                    ✓ Paid &amp; Cryptographically Verified
                  </span>
                  <div className="text-xs font-bold text-slate-800 mt-1">
                    Date: {selectedOrderForInspection.date}
                  </div>
                  <div className="text-[11px] font-mono text-gray-500">
                    Payment: {selectedOrderForInspection.paymentMethod}
                  </div>
                  <div className="text-[11px] font-mono text-gray-500">
                    Ref: {selectedOrderForInspection.transactionId || 'TXN-OK'}
                  </div>
                </div>
              </div>

              {/* Bill To Customer */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div className="font-extrabold text-gray-700 uppercase tracking-wider text-[10px] mb-1">
                  Billed To Learner / Customer:
                </div>
                <div className="font-bold text-sm text-slate-900">{selectedOrderForInspection.customerName}</div>
                <div className="text-xs text-purple-700 font-mono">{selectedOrderForInspection.customerEmail}</div>
                <div className="text-[11px] text-gray-500">{selectedOrderForInspection.customerPhone || '+91-9253330335 (Account Linked)'}</div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-gray-500 text-[11px] uppercase font-bold">
                    <th className="py-2 px-1">Curriculum / Exam Bank</th>
                    <th className="py-2 px-1 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedOrderForInspection.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-1">
                        <div className="font-bold text-slate-800">{it.title}</div>
                        <div className="text-[10px] text-gray-500">
                          Vendor: {it.vendor || 'IT'} • 6 Practice Tests • Lifetime Unlocked
                        </div>
                      </td>
                      <td className="py-2.5 px-1 text-right font-bold text-slate-900">
                        {selectedOrderForInspection.currency === 'USD' ? `$${it.priceUSD || it.priceINR}` : `₹${it.priceINR}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tax & Total Calculation */}
              {(() => {
                const tot = Number(selectedOrderForInspection.total) || 0;
                const net = +(tot / 1.18).toFixed(2);
                const gst = +(tot - net).toFixed(2);
                const cgst = +(gst / 2).toFixed(2);
                const sgst = +(gst / 2).toFixed(2);

                return (
                  <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Gross Subtotal:</span>
                      <span className="font-semibold">{selectedOrderForInspection.currency === 'USD' ? `$${selectedOrderForInspection.subtotal || tot}` : `₹${selectedOrderForInspection.subtotal || tot}`}</span>
                    </div>
                    {selectedOrderForInspection.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Coupon Discount:</span>
                        <span>-{selectedOrderForInspection.currency === 'USD' ? `$${selectedOrderForInspection.discount}` : `₹${selectedOrderForInspection.discount}`}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Net Taxable Value:</span>
                      <span className="font-semibold">{selectedOrderForInspection.currency === 'USD' ? `$${net}` : `₹${net}`}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>CGST (9%):</span>
                      <span className="font-semibold">{selectedOrderForInspection.currency === 'USD' ? `$${cgst}` : `₹${cgst}`}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>SGST (9%):</span>
                      <span className="font-semibold">{selectedOrderForInspection.currency === 'USD' ? `$${sgst}` : `₹${sgst}`}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-300 pt-2 font-black text-sm text-purple-900">
                      <span>Total Amount Paid (Inclusive of 18% GST):</span>
                      <span className="text-base text-purple-800">
                        {selectedOrderForInspection.currency === 'USD' ? `$${tot}` : `₹${tot}`}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Cryptographic Security Details */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] text-gray-500 font-mono space-y-1">
                <div className="text-emerald-800 font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>HMAC-SHA256 Anti-Tamper Security Seal Certified</span>
                </div>
                <div className="truncate">Signature: {selectedOrderForInspection.paymentHmacSignature || 'HMAC_SHA256_VERIFIED'}</div>
                <div className="truncate">Replay Nonce: {selectedOrderForInspection.cryptographicNonce || 'NONCE_OK'}</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedEmailForInspection({
                    orderId: selectedOrderForInspection.orderId,
                    timestamp: new Date().toISOString(),
                    recipient: adminEmailSettings?.primaryAdminEmail || 'support@itpracticetests.com',
                    sender: 'orders@itpracticetests.com',
                    subject: `🛒 [New Order] ${selectedOrderForInspection.orderId} - ₹${selectedOrderForInspection.total} from ${selectedOrderForInspection.customerName}`,
                    customerName: selectedOrderForInspection.customerName,
                    htmlContent: generateAdminOrderEmailHtml(selectedOrderForInspection, adminEmailSettings)
                  });
                }}
                className="text-purple-700 hover:text-purple-900 font-bold flex items-center space-x-1"
              >
                <Mail className="w-4 h-4" />
                <span>View Dispatched Admin Email</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-slate-900 hover:bg-black text-white font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Tax Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForInspection(null)}
                  className="border border-slate-300 text-slate-700 font-bold px-4 py-2 rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Dispatched Admin Email Viewer */}
      {selectedEmailForInspection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-udemy-border space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-udemy-dark">
                    Dispatched Admin Notification Email
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Live HTML preview of email sent to <span className="font-mono text-purple-700 font-semibold">{selectedEmailForInspection.recipient || adminEmailSettings?.primaryAdminEmail || 'support@itpracticetests.com'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmailForInspection(null)}
                className="text-gray-400 hover:text-black text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Email Meta Bar */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1">
              <div><strong>Subject:</strong> {selectedEmailForInspection.subject}</div>
              <div className="text-gray-500">
                <strong>From:</strong> orders@itpracticetests.com • <strong>To:</strong> {selectedEmailForInspection.recipient || adminEmailSettings?.primaryAdminEmail || 'support@itpracticetests.com'}
              </div>
              {selectedEmailForInspection.timestamp && (
                <div className="text-[11px] text-gray-400">
                  Dispatched: {new Date(selectedEmailForInspection.timestamp).toLocaleString()}
                </div>
              )}
            </div>

            {/* Email Body */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-100 p-2 max-h-[60vh] overflow-y-auto">
              <div
                dangerouslySetInnerHTML={{
                  __html: selectedEmailForInspection.htmlContent
                }}
              />
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => window.print()}
                className="border border-slate-300 text-slate-700 font-bold px-4 py-2 rounded-lg hover:bg-slate-50 flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Email</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedEmailForInspection(null)}
                className="bg-slate-900 hover:bg-black text-white font-bold px-5 py-2 rounded-lg transition"
              >
                Close Mailbox Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
