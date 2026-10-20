import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  ShoppingCart,
  Heart,
  BookOpen,
  User,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  Award,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  PlusCircle,
  HelpCircle,
  Globe,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  CreditCard,
  Newspaper,
  Layers
} from 'lucide-react';
import SocialLinksBar from './SocialLinks';

export default function Header({ currentView, setCurrentView, onSelectProduct }) {
  const {
    cart,
    wishlist,
    enrolled,
    currency,
    toggleCurrency,
    formatPrice,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    currentUser,
    logoutUser,
    openLoginModal,
    openRegisterModal
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const categoriesRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setCategoriesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    if (setCurrentView) {
      setCurrentView('home');
    }
    try {
      if (window.location.hash === '#management-console' || window.location.hash === '#secret-admin-ops') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch (e) {}
  };

  const searchSuggestions = [
    { label: 'AWS SAA-C03 Solutions Architect', category: 'certifications' },
    { label: 'Microsoft Azure AZ-500 Security', category: 'certifications' },
    { label: 'CompTIA SecurityX CAS-005', category: 'certifications' },
    { label: 'Microsoft DP-600 Fabric Analytics', category: 'certifications' },
    { label: 'Top 600+ Java Developer Interview', category: 'interviews' },
    { label: 'Selenium Java Interview Questions', category: 'interviews' },
    { label: 'Free AZ-900 Mini Mock Test', category: 'free' }
  ];

  const handleSuggestionClick = (item) => {
    setSearchQuery(item.label);
    setSelectedCategory(item.category);
    setCurrentView('catalog');
    setSearchFocused(false);
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentView('catalog');
      setSearchFocused(false);
    }
  };

  const navCategories = [
    { id: 'all', name: 'All Practice Tests & Courses', icon: '⚡' },
    { id: 'certifications', name: 'IT Certification Practice Tests', icon: '🏆', desc: 'AWS, Azure, GCP, CompTIA, CKA' },
    { id: 'courses', name: 'Online Courses & Masterclasses', icon: '🎥', desc: 'Video lectures & hands-on modules' },
    { id: 'interviews', name: 'IT Interview Practice Tests', icon: '💼', desc: 'Java, Selenium, Python, DevSecOps' },
    { id: 'free', name: 'Free Practice Tests', icon: '🎁', desc: '100% Free diagnostic exams' }
  ];

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-udemy-border shadow-sm">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-udemy-dark via-[#2d2f31] to-purple-900 text-white text-xs px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="bg-amber-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              Special Offer
            </span>
            <span className="font-medium truncate">
              🎯 IT Certification Tests & Interview Question Banks at ₹399 / $4.99! Prepared by Lead Instructor Yogesh Dhiman.
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-4 shrink-0 text-[11px] font-medium text-slate-200">
            <button
              onClick={toggleCurrency}
              className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-white/10 transition border border-white/20"
              title="Switch currency"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>Currency:</span>
              <strong className="text-white">{currency === 'INR' ? '₹ INR (India)' : '$ USD (Global)'}</strong>
            </button>
            <span className="text-white/30">|</span>
            <div className="flex items-center space-x-2" title="Follow ITPracticeTests on Official Social Media Channels">
              <span className="text-slate-300 text-[10px]">Follow:</span>
              <SocialLinksBar variant="header" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Udemy-style Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 h-18 py-3 flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-md hover:bg-slate-100 text-udemy-dark"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <div
          onClick={() => {
            setCurrentView('home');
            setSearchQuery('');
            setSelectedCategory('all');
          }}
          className="flex items-center cursor-pointer shrink-0 select-none group"
        >
          <img
            src="/ITPracticeTests_cleanup-removebg-preview.png"
            alt="ITPracticeTests Logo"
            className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </div>

        {/* Categories Mega Dropdown */}
        <div className="relative hidden md:block" ref={categoriesRef}>
          <button
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            className={`flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-udemy-dark rounded-md hover:text-purple-600 transition ${
              categoriesOpen ? 'text-purple-600' : ''
            }`}
          >
            <span>Categories</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
          </button>

          {categoriesOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-udemy-border py-2 z-50 animate-fadeIn">
              <div className="px-3 py-2 text-xs font-bold text-udemy-lightgray uppercase tracking-wider border-b border-slate-100">
                Explore Products
              </div>
              {navCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentView('catalog');
                    setCategoriesOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-purple-50 flex items-start space-x-3 transition group"
                >
                  <span className="text-lg">{cat.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-udemy-dark group-hover:text-purple-700">
                      {cat.name}
                    </div>
                    {cat.desc && <div className="text-xs text-udemy-lightgray">{cat.desc}</div>}
                  </div>
                </button>
              ))}
              <div className="border-t border-slate-100 mt-1 pt-1 px-3">
                <button
                  onClick={() => {
                    setCurrentView('catalog');
                    setSelectedCategory('all');
                    setCategoriesOpen(false);
                  }}
                  className="flex items-center justify-between w-full py-2 text-xs font-semibold text-purple-700 hover:text-purple-900 cursor-pointer"
                >
                  <span>Browse All Practice Tests</span>
                  <BookOpen className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar with Autocomplete Suggestions */}
        <div className="flex-1 max-w-2xl relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search certification tests, AWS, Azure, CompTIA, Interview questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full bg-[#f7f9fa] border border-udemy-dark/20 rounded-full pl-11 pr-24 py-2.5 text-sm text-udemy-dark placeholder-udemy-lightgray focus:bg-white focus:outline-none focus:border-udemy-dark focus:ring-1 focus:ring-udemy-dark transition"
              />
              <Search className="absolute left-4 w-4 h-4 text-udemy-lightgray pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-16 text-xs text-gray-400 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 bg-udemy-purple text-white px-3.5 py-1.5 text-xs font-semibold rounded-full hover:bg-udemy-purple-hover transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {searchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-udemy-border py-2 z-50">
              <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Popular Searches
              </div>
              {searchSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onMouseDown={() => handleSuggestionClick(item)}
                  className="w-full text-left px-4 py-2 text-sm text-udemy-dark hover:bg-slate-50 flex items-center space-x-2"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Nav Action Items */}
        <div className="hidden lg:flex items-center space-x-3">
          {/* Interview Practice Quick Link */}
          <button
            onClick={() => setCurrentView('interviews')}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-md transition flex items-center space-x-1.5 ${
              currentView === 'interviews'
                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                : 'text-udemy-dark hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Interview Prep</span>
          </button>

          {/* Blogs & SEO Tech Articles */}
          <button
            onClick={() => setCurrentView('blogs')}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-md transition flex items-center space-x-1.5 ${
              currentView === 'blogs'
                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                : 'text-udemy-dark hover:text-purple-600 hover:bg-purple-50'
            }`}
            title="SEO Technical Guides, Cheat Sheets & Exam Roadmaps"
          >
            <Newspaper className="w-4 h-4 text-indigo-600" />
            <span>Blogs & Guides</span>
          </button>

          {/* My Learning Button (for students or admins) */}
          <button
            onClick={() => {
              setCurrentView('mylearning');
              if (!currentUser) {
                openLoginModal();
              }
            }}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-md transition flex items-center space-x-1.5 ${
              currentView === 'mylearning'
                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                : 'text-udemy-dark hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>My Learning</span>
            {enrolled.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {enrolled.length}
              </span>
            )}
          </button>

          {/* Wishlist Icon */}
          <button
            onClick={() => setCurrentView('wishlist')}
            className="p-2 text-udemy-dark hover:text-purple-600 relative transition"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-udemy-purple text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Icon with Dropdown Preview */}
          <div className="relative">
            <button
              onClick={() => setCurrentView('cart')}
              onMouseEnter={() => setCartPreviewOpen(true)}
              onMouseLeave={() => setCartPreviewOpen(false)}
              className="p-2 text-udemy-dark hover:text-purple-600 relative transition"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-udemy-purple text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Cart Preview Hover Menu */}
            {cartPreviewOpen && cart.length > 0 && (
              <div
                onMouseEnter={() => setCartPreviewOpen(true)}
                onMouseLeave={() => setCartPreviewOpen(false)}
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-2xl border border-udemy-border p-4 z-50"
              >
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Cart ({cart.length} item{cart.length > 1 ? 's' : ''})
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {cart.map(item => (
                    <div key={item.id} className="py-2.5 flex items-start space-x-3">
                      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-purple-700 shrink-0">
                        {item.vendor?.slice(0, 3) || 'IT'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-udemy-dark truncate">
                          {item.title}
                        </div>
                        <div className="text-xs font-bold text-purple-700">
                          {formatPrice(item.priceINR, item.priceUSD)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setCartPreviewOpen(false);
                    setCurrentView('cart');
                  }}
                  className="mt-3 w-full bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold py-2 rounded-md transition"
                >
                  Go to Cart & Checkout
                </button>
              </div>
            )}
          </div>

          {/* User Authentication / Profile Area */}
          {!currentUser ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <button
                onClick={openLoginModal}
                className="px-3 py-1.5 border border-udemy-dark text-xs font-bold text-udemy-dark rounded hover:bg-slate-50 transition"
              >
                Log In
              </button>
              <button
                onClick={openRegisterModal}
                className="px-3.5 py-1.5 bg-udemy-dark text-white text-xs font-bold rounded hover:bg-black transition shadow-sm"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="relative pl-2 border-l border-slate-200" ref={userMenuRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 transition"
                title={`${currentUser.name} (${currentUser.role})`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white bg-slate-900">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-udemy-border py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 bg-slate-900">
                      {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-udemy-dark truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">{currentUser.email}</div>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded mt-1 inline-block bg-emerald-100 text-emerald-900">
                        {currentUser.role === 'admin' ? 'Verified Instructor' : 'Active Learner'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1 text-xs text-slate-700">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setCurrentView('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2 font-semibold text-slate-800"
                      >
                        <Layers className="w-4 h-4 text-purple-600" />
                        <span>Instructor Studio</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setCurrentView('mylearning');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <BookOpen className="w-4 h-4 text-slate-500" />
                      <span>My Learning &amp; Test Attempts</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentView('wishlist');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <Heart className="w-4 h-4 text-slate-500" />
                      <span>My Wishlist ({wishlist.length})</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-xs font-semibold text-rose-600 flex items-center space-x-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          {currentUser ? (
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-purple-900 text-white font-bold text-xs flex items-center justify-center">
                  {currentUser.name[0]}
                </div>
                <div>
                  <div className="text-xs font-bold text-udemy-dark">{currentUser.name}</div>
                  <div className="text-[10px] text-gray-500 capitalize">{currentUser.role} Account</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded cursor-pointer"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
              <button
                onClick={() => {
                  openLoginModal();
                  setMobileMenuOpen(false);
                }}
                className="py-2 border border-udemy-dark rounded text-xs font-bold"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  openRegisterModal();
                  setMobileMenuOpen(false);
                }}
                className="py-2 bg-udemy-dark text-white rounded text-xs font-bold"
              >
                Sign Up
              </button>
            </div>
          )}

          <div className="space-y-1">
            {isAdmin && (
              <button
                onClick={() => {
                  setCurrentView('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded"
              >
                Instructor Studio
              </button>
            )}

            <button
              onClick={() => {
                setCurrentView('catalog');
                setSelectedCategory('all');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium rounded hover:bg-purple-50 text-udemy-dark"
            >
              Browse All Practice Tests
            </button>

            <button
              onClick={() => {
                setCurrentView('mylearning');
                if (!currentUser) {
                  openLoginModal();
                }
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium rounded hover:bg-purple-50 text-udemy-dark flex items-center justify-between"
            >
              <span>My Learning</span>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
                {enrolled.length}
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('interviews');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium rounded hover:bg-purple-50 text-udemy-dark"
            >
              IT Interview Practice
            </button>

            <button
              onClick={() => {
                setCurrentView('blogs');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium rounded hover:bg-purple-50 text-udemy-dark flex items-center space-x-2"
            >
              <Newspaper className="w-4 h-4 text-indigo-600" />
              <span>Blogs & Exam Guides</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('cart');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium rounded hover:bg-purple-50 text-udemy-dark flex items-center justify-between"
            >
              <span>Shopping Cart</span>
              <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {cart.length}
              </span>
            </button>

            <div className="pt-3 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Official Social Channels
              </div>
              <SocialLinksBar variant="header" className="flex-wrap gap-2" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
