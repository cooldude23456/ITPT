import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import CourseCard from '../components/CourseCard';
import { Filter, Search, RotateCcw, ChevronDown, Check, SlidersHorizontal } from 'lucide-react';

export default function CatalogPage({ onSelectProduct, onTakeTest }) {
  const {
    products,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedVendor,
    setSelectedVendor
  } = useApp();

  const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'under500', 'free'
  const [ratingFilter, setRatingFilter] = useState('all'); // 'all', '4.7+'
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'price-low', 'price-high', 'rating'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'certifications', label: 'IT Certification Tests' },
    { id: 'courses', label: 'Online Courses' },
    { id: 'interviews', label: 'IT Interview Questions' },
    { id: 'free', label: 'Free Diagnostic Tests' }
  ];

  const vendors = [
    'all',
    'AWS',
    'Microsoft',
    'Google',
    'CompTIA',
    'Kubernetes',
    'Databricks',
    'Terraform',
    'Cisco',
    'Linux',
    'Snowflake'
  ];

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Search
        if (searchQuery) {
          const q = searchQuery.toLowerCase().trim();
          const target = `${p.title} ${p.vendor} ${p.category} ${p.description || ''} ${p.isFree ? 'free diagnostic test' : ''}`.toLowerCase();
          const tokens = q.split(/\s+/).filter(Boolean);
          const matches = target.includes(q) || tokens.every(token => target.includes(token));
          if (!matches) return false;
        }

        // Category
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'free' && !(p.isFree || p.priceINR === 0)) return false;
          if (selectedCategory !== 'free' && p.category !== selectedCategory) return false;
        }

        // Vendor
        if (selectedVendor !== 'all' && p.vendor !== selectedVendor) {
          return false;
        }

        // Price
        if (priceFilter === 'free' && !(p.isFree || p.priceINR === 0)) return false;
        if (priceFilter === 'under500' && p.priceINR > 499) return false;

        // Rating
        if (ratingFilter === '4.7+' && p.rating < 4.7) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return (b.studentsCount || 0) - (a.studentsCount || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'price-low') return (a.priceINR || 0) - (b.priceINR || 0);
        if (sortBy === 'price-high') return (b.priceINR || 0) - (a.priceINR || 0);
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedVendor, priceFilter, ratingFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedVendor('all');
    setPriceFilter('all');
    setRatingFilter('all');
    setSortBy('popular');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa] py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header / Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-udemy-dark capitalize">
              {selectedCategory === 'all'
                ? 'All IT Practice Tests & Courses'
                : categories.find(c => c.id === selectedCategory)?.label || selectedCategory}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing <strong>{filteredProducts.length}</strong> certification practice exams & interview resources
            </p>
          </div>

          {/* Sort & Mobile filter trigger */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 bg-white flex items-center space-x-1"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter ({filteredProducts.length})</span>
            </button>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-gray-500 font-semibold hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-udemy-dark focus:outline-none"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left Column: Filter Sidebar */}
          <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} bg-white rounded-2xl border border-udemy-border p-5 space-y-6 shadow-sm`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-extrabold text-sm text-udemy-dark flex items-center space-x-1.5">
                <Filter className="w-4 h-4 text-purple-600" />
                <span>Filters</span>
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-purple-700 hover:underline flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-udemy-dark uppercase tracking-wider block">
                Category
              </span>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                      selectedCategory === cat.id
                        ? 'bg-purple-100 text-purple-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {selectedCategory === cat.id && <Check className="w-3.5 h-3.5 text-purple-700" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Vendor / Technology */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-udemy-dark uppercase tracking-wider block">
                Cloud & Technology Vendor
              </span>
              <div className="flex flex-wrap gap-1.5">
                {vendors.map(v => (
                  <button
                    key={v}
                    onClick={() => setSelectedVendor(v)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                      selectedVendor === v
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {v === 'all' ? 'All Vendors' : v}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing Filter */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-udemy-dark uppercase tracking-wider block">
                Price
              </span>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under500', label: 'Under ₹499 / $5' },
                  { id: 'free', label: 'Free Tests' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPriceFilter(p.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                      priceFilter === p.id
                        ? 'bg-purple-100 text-purple-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{p.label}</span>
                    {priceFilter === p.id && <Check className="w-3.5 h-3.5 text-purple-700" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-udemy-dark uppercase tracking-wider block">
                Ratings
              </span>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'All Ratings' },
                  { id: '4.7+', label: '4.7 ★ and above' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRatingFilter(r.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                      ratingFilter === r.id
                        ? 'bg-purple-100 text-purple-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{r.label}</span>
                    {ratingFilter === r.id && <Check className="w-3.5 h-3.5 text-purple-700" />}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Column: Products Grid */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-udemy-border p-12 text-center space-y-3">
                <p className="text-sm font-semibold text-gray-700">
                  No courses or practice tests matched your search criteria.
                </p>
                <p className="text-xs text-gray-500">
                  Try clearing your search query or resetting filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <CourseCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                    onTakeTest={onTakeTest}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
