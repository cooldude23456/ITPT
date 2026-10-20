import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PlusCircle,
  BookOpen,
  DollarSign,
  Users,
  Star,
  Trash2,
  Edit3,
  Download,
  Upload,
  Search,
  CheckCircle,
  HelpCircle,
  Save,
  X,
  ExternalLink,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export default function InstructorPage({ onSelectProduct }) {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetCatalogToDefault,
    formatPrice,
    currency,
    orders
  } = useApp();

  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'create', 'orders'
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorFilter, setVendorFilter] = useState('all');

  // Form state for creating a new course/test
  const [form, setForm] = useState({
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
    badge: 'Hot & New',
    description: '',
    features: [
      '6 Full-length timed practice tests',
      'Detailed explanations for all choices',
      'Domain proficiency score report',
      'Lifetime access & 2026 exam updates'
    ],
    questions: [
      {
        question: 'Sample initial question for this practice exam:',
        domain: 'Domain 1: Core Architecture Principles',
        type: 'single',
        options: [
          'Option A: Recommended enterprise best practice',
          'Option B: Suboptimal configuration',
          'Option C: Deprecated API',
          'Option D: Unencrypted network endpoint'
        ],
        correctAnswers: [0],
        explanation: 'Option A implements high availability and automated resilience according to cloud architecture frameworks.',
        reference: 'https://itpracticetests.com'
      }
    ]
  });

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    domain: 'Domain 1: Core Fundamentals',
    type: 'single',
    options: ['', '', '', ''],
    correctAnswers: [0],
    explanation: '',
    reference: ''
  });

  const [successNotice, setSuccessNotice] = useState('');

  // Handle adding question to builder
  const handleAddQuestionToForm = () => {
    if (!newQuestion.question.trim()) {
      alert('Please enter question text');
      return;
    }
    const finalQuestion = {
      ...newQuestion,
      questionType: newQuestion.type === 'multiple' ? 'Multi-select' : 'Multi-choice',
      overallExplanation: newQuestion.explanation
    };
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, finalQuestion]
    }));
    setNewQuestion({
      question: '',
      domain: 'Domain 1: Core Fundamentals',
      type: 'single',
      options: ['', '', '', ''],
      correctAnswers: [0],
      explanation: '',
      reference: ''
    });
  };

  // Submit new product
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please provide a title');
      return;
    }

    const created = addProduct({
      ...form,
      questionsCount: form.questions.length * 60 || 360,
      testsCount: 6
    });

    setSuccessNotice(`Successfully published "${created.title}" to the live catalog!`);
    setActiveTab('courses');
    setTimeout(() => setSuccessNotice(''), 5000);
  };

  // Filtered catalog
  const filtered = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchVendor = vendorFilter === 'all' || p.vendor === vendorFilter;
    return matchSearch && matchVendor;
  });

  // Export JSON backup
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `itpracticetests-catalog-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa] py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Banner / Header */}
        <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                Instructor Dashboard & Test Engine Hub
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Instructor: Yogesh Dhiman
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-udemy-dark mt-1">
              Course & Practice Test Creator Portal
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Build full-length timed practice tests, add questions with rich explanations, manage catalog pricing, and review student orders.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('create')}
              className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-4 py-2.5 rounded-lg transition flex items-center space-x-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Practice Test</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-lg transition flex items-center space-x-1.5"
              title="Export complete database backup as JSON"
            >
              <Download className="w-4 h-4" />
              <span>Export DB</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
            <button onClick={() => setSuccessNotice('')} className="text-emerald-700 hover:text-emerald-950">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Analytics Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-udemy-border p-4 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
              <span>Total Products in Store</span>
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-udemy-dark mt-1">
              {products.length}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              162 active products in catalog
            </div>
          </div>

          <div className="bg-white rounded-xl border border-udemy-border p-4 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
              <span>Total Enrolled Students</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-udemy-dark mt-1">
              48,520+
            </div>
            <div className="text-[11px] text-blue-700 font-semibold mt-1">
              Across Udemy & ITPracticeTests
            </div>
          </div>

          <div className="bg-white rounded-xl border border-udemy-border p-4 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
              <span>Platform Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-udemy-dark mt-1">
              {currency === 'INR' ? '₹18,45,200' : '$24,850'}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              Direct-to-consumer sales
            </div>
          </div>

          <div className="bg-white rounded-xl border border-udemy-border p-4 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
              <span>Instructor Rating</span>
              <Star className="w-4 h-4 text-amber-500 fill-current" />
            </div>
            <div className="text-2xl font-extrabold text-udemy-dark mt-1">
              4.85 ★
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1">
              From 7,500+ verified reviews
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-udemy-border space-x-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 transition relative ${
              activeTab === 'courses'
                ? 'text-purple-700 border-b-2 border-purple-700'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Manage Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-3 transition relative ${
              activeTab === 'create'
                ? 'text-purple-700 border-b-2 border-purple-700'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            + Create New Practice Test
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 transition relative ${
              activeTab === 'orders'
                ? 'text-purple-700 border-b-2 border-purple-700'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Orders & Revenue Ledger ({orders.length})
          </button>
        </div>

        {/* TAB 1: Manage Catalog */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search products by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-udemy-dark focus:bg-white focus:outline-none focus:border-purple-600"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <select
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                  className="bg-[#f7f9fa] border border-slate-300 rounded-lg px-3 py-2 text-xs text-udemy-dark focus:outline-none"
                >
                  <option value="all">All Vendors</option>
                  <option value="AWS">AWS</option>
                  <option value="Microsoft">Microsoft Azure</option>
                  <option value="Google">Google Cloud</option>
                  <option value="CompTIA">CompTIA</option>
                  <option value="Kubernetes">Kubernetes</option>
                  <option value="Databricks">Databricks</option>
                  <option value="Linux">Linux Foundation</option>
                </select>

                <button
                  onClick={() => {
                    if (confirm('Reset catalog to the default 162 imported products? Any custom creations will be refreshed.')) {
                      resetCatalogToDefault();
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-rose-600 flex items-center space-x-1"
                  title="Reset to original 162 items"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>

            {/* Catalog Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-gray-500 uppercase tracking-wider font-bold">
                    <th className="py-3 px-3">Title & Exam Code</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Vendor</th>
                    <th className="py-3 px-3">Price (INR / USD)</th>
                    <th className="py-3 px-3">Rating</th>
                    <th className="py-3 px-3">Questions</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.slice(0, 40).map(prod => (
                    <tr key={prod.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 max-w-xs">
                        <div
                          onClick={() => onSelectProduct(prod)}
                          className="font-bold text-udemy-dark hover:text-purple-700 cursor-pointer line-clamp-1"
                        >
                          {prod.title}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          ID: {prod.id.slice(0, 16)}...
                        </div>
                      </td>
                      <td className="py-3 px-3 capitalize">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-purple-800">
                        {prod.vendor}
                      </td>
                      <td className="py-3 px-3 font-bold text-udemy-dark">
                        {prod.isFree ? (
                          <span className="text-emerald-700 font-extrabold">Free</span>
                        ) : (
                          <>
                            ₹{prod.priceINR} / ${prod.priceUSD}
                          </>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-amber-600 font-bold">★ {prod.rating}</span>{' '}
                        <span className="text-gray-400">({prod.reviewCount})</span>
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-medium">
                        {prod.questionsCount || 400} Qs
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => onSelectProduct(prod)}
                          className="text-purple-600 hover:text-purple-800 font-bold"
                          title="Preview Product"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${prod.title}" from store?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800"
                          title="Delete from store"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length > 40 && (
                <div className="p-3 text-center text-xs text-gray-500 border-t border-slate-100">
                  Showing first 40 of {filtered.length} matching products. Use search above to narrow down.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Create New Practice Test / Course Wizard */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-6">
              <h2 className="font-extrabold text-base text-udemy-dark border-b border-slate-100 pb-3">
                1. General Information & Pricing
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Course / Test Bank Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Certified DevOps Engineer Professional (DOP-C02) Practice Exams"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 text-xs text-udemy-dark focus:bg-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 text-xs text-udemy-dark focus:outline-none"
                  >
                    <option value="certifications">IT Certification Practice Tests</option>
                    <option value="courses">Online Courses & Masterclasses</option>
                    <option value="interviews">IT Interview Practice Questions</option>
                    <option value="free">Free Diagnostic Practice Tests</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Vendor / Topic</label>
                  <select
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 text-xs text-udemy-dark focus:outline-none"
                  >
                    <option value="AWS">AWS</option>
                    <option value="Microsoft">Microsoft Azure</option>
                    <option value="Google">Google Cloud</option>
                    <option value="CompTIA">CompTIA</option>
                    <option value="Kubernetes">Kubernetes</option>
                    <option value="Databricks">Databricks</option>
                    <option value="Terraform">Terraform</option>
                    <option value="Cisco">Cisco</option>
                    <option value="Linux">Linux Foundation</option>
                    <option value="Other IT">Other IT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={form.priceINR}
                    onChange={(e) => setForm({ ...form, priceINR: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 text-xs text-udemy-dark focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.priceUSD}
                    onChange={(e) => setForm({ ...form, priceUSD: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 text-xs text-udemy-dark focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Time Limit (Minutes)</label>
                  <input
                    type="number"
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 120 })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 text-xs text-udemy-dark focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Passing Score (%)</label>
                  <input
                    type="number"
                    value={form.passingScore}
                    onChange={(e) => setForm({ ...form, passingScore: parseInt(e.target.value) || 70 })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 text-xs text-udemy-dark focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Course Description</label>
                  <textarea
                    rows={3}
                    placeholder="Comprehensive overview of exam domains, target candidates, prerequisites, and features..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 text-xs text-udemy-dark focus:bg-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Question Builder */}
            <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-extrabold text-base text-udemy-dark">
                    2. Question Bank Builder
                  </h2>
                  <p className="text-xs text-gray-500">
                    Draft authentic exam questions with detailed explanations and official references.
                  </p>
                </div>
                <span className="text-xs font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  {form.questions.length} Question{form.questions.length > 1 ? 's' : ''} in Test Bank
                </span>
              </div>

              {/* Draft Question Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Exam Domain</label>
                    <input
                      type="text"
                      placeholder="e.g. Domain 1: Cloud Architecture & Resilience"
                      value={newQuestion.domain}
                      onChange={(e) => setNewQuestion({ ...newQuestion, domain: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-udemy-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Question Type</label>
                    <select
                      value={newQuestion.type}
                      onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-udemy-dark"
                    >
                      <option value="single">Single Choice (1 Correct Answer)</option>
                      <option value="multiple">Multiple Response MSQ (2 Correct Answers)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Question Scenario Text</label>
                  <textarea
                    rows={2}
                    placeholder="An enterprise client has an auto scaling cluster behind an Application Load Balancer..."
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-udemy-dark"
                  />
                </div>

                {/* Options 0..3 */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Options & Correct Answer Selection:
                  </label>
                  {newQuestion.options.map((opt, oIdx) => {
                    const isChecked = newQuestion.correctAnswers.includes(oIdx);
                    return (
                      <div key={oIdx} className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (newQuestion.type === 'multiple') {
                              const updated = isChecked
                                ? newQuestion.correctAnswers.filter(a => a !== oIdx)
                                : [...newQuestion.correctAnswers, oIdx];
                              setNewQuestion({ ...newQuestion, correctAnswers: updated });
                            } else {
                              setNewQuestion({ ...newQuestion, correctAnswers: [oIdx] });
                            }
                          }}
                          className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 transition ${
                            isChecked
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {isChecked ? '✓' : String.fromCharCode(65 + oIdx)}
                        </button>
                        <input
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)} text...`}
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...newQuestion.options];
                            newOpts[oIdx] = e.target.value;
                            setNewQuestion({ ...newQuestion, options: newOpts });
                          }}
                          className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs text-udemy-dark"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Detailed Answer Explanation (Why correct choice works, why distractors fail)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Using Amazon SQS FIFO guarantees order and decouples the transactional tier..."
                    value={newQuestion.explanation}
                    onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-udemy-dark"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddQuestionToForm}
                    className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                  >
                    + Add Question to Test
                  </button>
                </div>
              </div>

              {/* List of Questions Added */}
              {form.questions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-gray-700">Questions in this draft:</span>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white">
                    {form.questions.map((q, idx) => (
                      <div key={idx} className="p-3 text-xs flex items-center justify-between">
                        <div className="truncate mr-4">
                          <span className="font-bold mr-2 text-purple-700">Q{idx + 1}:</span>
                          <span className="text-slate-700">{q.question}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setForm({
                              ...form,
                              questions: form.questions.filter((_, i) => i !== idx)
                            });
                          }}
                          className="text-rose-600 hover:text-rose-800 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('courses')}
                className="px-5 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-sm transition flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Publish Course to Live Store</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Orders & Revenue Ledger */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-extrabold text-base text-udemy-dark">
                  Direct-to-Consumer Orders & Invoices
                </h2>
                <p className="text-xs text-gray-500">
                  Registered under GSTIN: 03AKXPD3010G1ZM | ITPracticeTests.com
                </p>
              </div>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                {orders.length} Verified Transactions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-gray-500 uppercase tracking-wider font-bold">
                    <th className="py-3 px-3">Order ID & Date</th>
                    <th className="py-3 px-3">Purchased Items</th>
                    <th className="py-3 px-3">Payment Gateway</th>
                    <th className="py-3 px-3">Transaction ID</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map(order => (
                    <tr key={order.orderId} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-udemy-dark">{order.orderId}</div>
                        <div className="text-[11px] text-gray-400">{order.date}</div>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        {order.items?.map((it, i) => (
                          <div key={i} className="truncate text-slate-800 font-medium">
                            • {it.title}
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded font-semibold text-[11px]">
                          {order.paymentMethod || 'Razorpay / UPI'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-500 text-[11px]">
                        {order.transactionId || 'TXN-902148281'}
                      </td>
                      <td className="py-3 px-3 font-bold text-udemy-dark">
                        {order.currency === 'INR' ? `₹${order.total}` : `$${order.total}`}
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          {order.status || 'PAID'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
