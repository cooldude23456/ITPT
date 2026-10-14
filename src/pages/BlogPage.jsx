import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  User,
  Tag,
  Search,
  ArrowRight,
  ArrowLeft,
  Share2,
  BookOpen,
  Award,
  ExternalLink,
  CheckCircle2,
  Globe,
  Sparkles,
  Layers,
  ChevronRight,
  PlayCircle
} from 'lucide-react';

export default function BlogPage({ onSelectProduct, onTakeTest }) {
  const { blogs, products } = useApp();

  const [selectedBlogSlug, setSelectedBlogSlug] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedLink, setCopiedLink] = useState(false);

  const categories = [
    'all',
    'Cloud Certifications',
    'Azure & Security',
    'IT Interview Preparation',
    'DevOps & Kubernetes'
  ];

  // Filter published blogs (or all if admin)
  const publishedBlogs = (blogs || []).filter(b => b.isPublished !== false);

  const filteredBlogs = publishedBlogs.filter(b => {
    const matchSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.focusKeywords?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory =
      selectedCategory === 'all' || b.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  const selectedBlog = publishedBlogs.find(b => b.slug === selectedBlogSlug);

  const handleCopyLink = () => {
    if (selectedBlog) {
      navigator.clipboard?.writeText(window.location.origin + '#' + selectedBlog.slug);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // ------------------------------------------------------------------
  // VIEW 1: SINGLE BLOG ARTICLE READER VIEW (SEO OPTIMIZED)
  // ------------------------------------------------------------------
  if (selectedBlog) {
    const relatedProduct = selectedBlog.relatedCourseId
      ? products.find(p => p.id === selectedBlog.relatedCourseId)
      : null;

    return (
      <div className="min-h-screen bg-[#f7f9fa] py-10 px-4 font-sans">
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
          {/* Breadcrumb Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
            <button
              onClick={() => setSelectedBlogSlug(null)}
              className="inline-flex items-center space-x-1.5 font-bold text-purple-700 hover:text-purple-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Blogs & Study Guides</span>
            </button>
            <div className="flex items-center space-x-2">
              <span>ITPracticeTests</span>
              <span>/</span>
              <span className="text-gray-700 font-semibold">{selectedBlog.category}</span>
            </div>
          </div>

          {/* Article Header Card */}
          <article className="bg-white rounded-2xl border border-udemy-border shadow-sm overflow-hidden">
            {/* Featured Image */}
            {selectedBlog.featuredImage && (
              <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-900">
                <img
                  src={selectedBlog.featuredImage}
                  alt={selectedBlog.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <span className="inline-block bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedBlog.category}
                  </span>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">
                    {selectedBlog.title}
                  </h1>
                </div>
              </div>
            )}

            {/* Article Metadata Bar */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 text-xs">
                {/* Author Info */}
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedBlog.authorAvatar || '/6577847_169c.webp'}
                    alt={selectedBlog.author}
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-600"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop';
                    }}
                  />
                  <div>
                    <div className="font-extrabold text-sm text-udemy-dark flex items-center space-x-1.5">
                      <span>{selectedBlog.author}</span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded">
                        Udemy Instructor
                      </span>
                    </div>
                    <div className="text-gray-500">{selectedBlog.authorRole}</div>
                  </div>
                </div>

                {/* Date & Reading time */}
                <div className="flex items-center space-x-4 text-gray-500 font-medium">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span>{new Date(selectedBlog.publishedDate).toLocaleDateString()}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>{selectedBlog.readTimeMinutes} min read</span>
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center space-x-1 text-purple-700 hover:text-purple-900 bg-purple-50 px-2.5 py-1 rounded font-bold transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Copied URL!' : 'Share'}</span>
                  </button>
                </div>
              </div>

              {/* SEO Meta Box Preview for Search Engines */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                  <span className="flex items-center space-x-1 text-purple-700">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Google SEO Search Snippet & Meta Tags</span>
                  </span>
                  <span>Target Keywords: {selectedBlog.focusKeywords?.split(',').slice(0, 3).join(', ')}</span>
                </div>
                <div className="text-blue-700 font-bold text-sm hover:underline cursor-pointer">
                  {selectedBlog.metaTitle || selectedBlog.title}
                </div>
                <div className="text-emerald-700 text-[11px] font-mono">
                  {selectedBlog.canonicalUrl || `https://www.itpracticetests.com/blog/${selectedBlog.slug}`}
                </div>
                <p className="text-gray-600 leading-relaxed text-xs">
                  {selectedBlog.metaDescription || selectedBlog.excerpt}
                </p>
              </div>

              {/* Formatted Article Body */}
              <div className="text-slate-800 leading-relaxed space-y-5 text-sm md:text-base font-normal pt-2">
                {selectedBlog.content.split('\n\n').map((paragraph, idx) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;

                  // H2 Headings
                  if (trimmed.startsWith('## ')) {
                    return (
                      <h2 key={idx} className="text-xl md:text-2xl font-extrabold text-udemy-dark pt-4 pb-1 border-b border-slate-200">
                        {trimmed.replace('## ', '')}
                      </h2>
                    );
                  }

                  // H3 Headings
                  if (trimmed.startsWith('### ')) {
                    return (
                      <h3 key={idx} className="text-lg font-bold text-purple-900 pt-2">
                        {trimmed.replace('### ', '')}
                      </h3>
                    );
                  }

                  // Code blocks
                  if (trimmed.startsWith('```')) {
                    const cleanCode = trimmed.replace(/```[a-z]*\n?/gi, '');
                    return (
                      <pre key={idx} className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs md:text-sm font-mono overflow-x-auto shadow-inner">
                        <code>{cleanCode}</code>
                      </pre>
                    );
                  }

                  // Bullet lists
                  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    const items = trimmed.split('\n').filter(Boolean);
                    return (
                      <ul key={idx} className="list-disc list-inside space-y-1.5 pl-2 text-slate-700">
                        {items.map((item, i) => (
                          <li key={i} className="leading-relaxed">
                            {item.replace(/^[-*]\s+/, '')}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  // Blockquotes
                  if (trimmed.startsWith('> ')) {
                    return (
                      <blockquote key={idx} className="border-l-4 border-purple-600 bg-purple-50/70 p-4 rounded-r-xl italic text-slate-700 text-sm">
                        {trimmed.replace('> ', '')}
                      </blockquote>
                    );
                  }

                  // Regular Paragraphs
                  return (
                    <p key={idx} className="leading-relaxed">
                      {trimmed}
                    </p>
                  );
                })}
              </div>

              {/* Tags Row */}
              {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Tags:</span>
                  </span>
                  {selectedBlog.tags.map((t, i) => (
                    <span
                      key={i}
                      className="bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-full text-xs font-semibold"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Related Practice Exam Callout */}
              {relatedProduct && (
                <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                      Official Practice Exam Series
                    </span>
                    <h3 className="font-extrabold text-lg text-white">
                      {relatedProduct.title}
                    </h3>
                    <p className="text-xs text-purple-200">
                      Practice 6 full-length timed mock exams with detailed explanations created by Yogesh Dhiman.
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectProduct ? onSelectProduct(relatedProduct) : onTakeTest(relatedProduct, 1)}
                    className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold px-6 py-2.5 rounded-xl text-xs transition shrink-0 shadow-md flex items-center space-x-1.5"
                  >
                    <PlayCircle className="w-4 h-4 fill-current" />
                    <span>Take Practice Test</span>
                  </button>
                </div>
              )}

              {/* Author Bio Box */}
              <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
                <img
                  src={selectedBlog.authorAvatar || '/6577847_169c.webp'}
                  alt={selectedBlog.author}
                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-600 shrink-0"
                />
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-base text-udemy-dark">
                    About {selectedBlog.author}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Yogesh Dhiman is a Senior Cloud Solutions Architect and popular Udemy instructor with over 48,000 students across AWS, Azure, GCP, and Kubernetes certifications. He is dedicated to helping technical professionals pass high-stakes exams on their first attempt.
                  </p>
                  <a
                    href="https://www.udemy.com/user/yogesh-dhiman-22/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs font-bold text-purple-700 hover:underline"
                  >
                    <span>View all courses by Yogesh Dhiman on Udemy.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // VIEW 2: BLOG DIRECTORY & KNOWLEDGE HUB (PUBLIC LIST)
  // ------------------------------------------------------------------
  const featuredBlog = publishedBlogs[0];
  const regularBlogs = publishedBlogs.slice(1);

  return (
    <div className="min-h-screen bg-[#f7f9fa] py-12 px-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>ITPracticeTests SEO Knowledge Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-udemy-dark tracking-tight">
            Tech Blogs, Exam Strategies & Interview Guides
          </h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            Authentic preparation guides, domain breakdowns, and real-world IT interview questions curated by Senior Cloud Solutions Architect and Udemy Instructor <strong>Yogesh Dhiman</strong>.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative pt-2">
            <input
              type="text"
              placeholder="Search guides by keywords (e.g. AWS SAA-C03, AZ-500, Selenium, CKA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-full pl-11 pr-4 py-3 text-sm text-udemy-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
            />
            <Search className="absolute left-4 top-5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition capitalize ${
                selectedCategory === cat
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? '⚡ All Tech Articles' : cat}
            </button>
          ))}
        </div>

        {/* FEATURED BLOG HERO CARD */}
        {featuredBlog && selectedCategory === 'all' && !searchQuery && (
          <div className="bg-white rounded-2xl border border-udemy-border shadow-sm overflow-hidden hover:shadow-card-hover transition grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative h-64 sm:h-80 lg:h-full bg-slate-900 overflow-hidden">
              <img
                src={featuredBlog.featuredImage}
                alt={featuredBlog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <span className="absolute top-4 left-4 bg-amber-400 text-amber-950 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                Featured Guide
              </span>
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-xs text-gray-500 font-semibold">
                  <span className="text-purple-700 font-extrabold uppercase">{featuredBlog.category}</span>
                  <span>•</span>
                  <span>{featuredBlog.readTimeMinutes} min read</span>
                  <span>•</span>
                  <span>{new Date(featuredBlog.publishedDate).toLocaleDateString()}</span>
                </div>

                <h2
                  onClick={() => setSelectedBlogSlug(featuredBlog.slug)}
                  className="text-xl sm:text-2xl font-extrabold text-udemy-dark leading-snug hover:text-purple-700 cursor-pointer transition"
                >
                  {featuredBlog.title}
                </h2>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {featuredBlog.excerpt}
                </p>

                {/* SEO Keywords tags */}
                {featuredBlog.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {featuredBlog.tags.slice(0, 4).map((tag, i) => (
                      <span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs">
                  <img
                    src={featuredBlog.authorAvatar || '/6577847_169c.webp'}
                    alt={featuredBlog.author}
                    className="w-8 h-8 rounded-full object-cover border border-purple-500"
                  />
                  <span className="font-bold text-gray-800">{featuredBlog.author}</span>
                </div>

                <button
                  onClick={() => setSelectedBlogSlug(featuredBlog.slug)}
                  className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                >
                  <span>Read Complete Guide</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REGULAR BLOGS GRID */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-udemy-dark">
              {searchQuery ? `Search Results (${filteredBlogs.length})` : 'All Preparation Guides & Articles'}
            </h2>
            <span className="text-xs text-gray-500 font-semibold">
              {filteredBlogs.length} SEO optimized articles available
            </span>
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-udemy-border p-12 text-center text-xs text-gray-500 space-y-2">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
              <p>No articles match your search or filter criteria.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-purple-700 font-bold hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <article
                  key={blog.id}
                  className="bg-white rounded-2xl border border-udemy-border overflow-hidden shadow-sm hover:shadow-card-hover transition flex flex-col justify-between group"
                >
                  <div
                    onClick={() => setSelectedBlogSlug(blog.slug)}
                    className="relative h-48 bg-slate-900 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-purple-700 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow">
                      {blog.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-[11px] text-gray-400">
                        <span>{new Date(blog.publishedDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{blog.readTimeMinutes} min read</span>
                      </div>

                      <h3
                        onClick={() => setSelectedBlogSlug(blog.slug)}
                        className="font-extrabold text-sm text-udemy-dark line-clamp-2 leading-snug group-hover:text-purple-700 cursor-pointer transition"
                      >
                        {blog.title}
                      </h3>

                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500 font-medium">
                        By {blog.author}
                      </span>
                      <button
                        onClick={() => setSelectedBlogSlug(blog.slug)}
                        className="text-purple-700 hover:text-purple-900 text-xs font-bold inline-flex items-center space-x-1"
                      >
                        <span>Read More</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
