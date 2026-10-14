import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import TestPlayerPage from './pages/TestPlayerPage';
import TestResultPage from './pages/TestResultPage';
import InterviewPage from './pages/InterviewPage';
import InstructorPage from './pages/InstructorPage';
import AdminPanelPage from './pages/AdminPanelPage';
import MyLearningPage from './pages/MyLearningPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

function MainApp() {
  const { setSelectedCategory, setSelectedVendor, currentUser, openLoginModal } = useApp();

  const [currentView, setCurrentView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTestProduct, setActiveTestProduct] = useState(null);
  const [activeTestNumber, setActiveTestNumber] = useState(1);
  const [currentAttempt, setCurrentAttempt] = useState(null);

  // Scroll to top whenever view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedProduct, activeTestProduct, currentAttempt, activeTestNumber]);

  // Stealth Security Portal & Secret Hotkey Listener
  useEffect(() => {
    // 1. Secret URL parameter & hash checker
    const checkSecretPortal = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const secretParam = urlParams.get('portal') || urlParams.get('studio') || urlParams.get('sec');
        const isSecretHash = window.location.hash === '#management-console' || window.location.hash === '#secret-admin-ops';

        if (secretParam === 'secret-yd-ops-2026' || isSecretHash) {
          if (currentUser?.role === 'admin') {
            setCurrentView('admin');
          } else {
            openLoginModal();
          }
        }
      } catch (e) {
        // Safe fail
      }
    };

    checkSecretPortal();

    // 2. Secret Keyboard Hotkey: Ctrl + Shift + A (or Cmd + Shift + A on Mac)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (currentUser?.role === 'admin') {
          setCurrentView(prev => prev === 'admin' ? 'home' : 'admin');
        } else {
          openLoginModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, openLoginModal]);

  // Navigation handlers
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
  };

  const handleTakeTest = (product, testNumber = 1) => {
    setActiveTestProduct(product);
    setActiveTestNumber(testNumber || 1);
    setCurrentView('test-player');
  };

  const handleFinishTest = (attemptData) => {
    setCurrentAttempt(attemptData);
    setCurrentView('test-result');
  };

  const handleViewResult = (attempt) => {
    setCurrentAttempt(attempt);
    setCurrentView('test-result');
  };

  const handleNavigateCategory = (catId, vendor = 'all') => {
    setSelectedCategory(catId);
    setSelectedVendor(vendor);
    setCurrentView('catalog');
  };

  const handleFooterNavigate = (view, catId = 'all', vendor = 'all') => {
    if (catId !== 'all') setSelectedCategory(catId);
    if (vendor !== 'all') setSelectedVendor(vendor);
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-udemy-dark selection:bg-purple-100 selection:text-purple-900">
      {/* Hide standard header during exam simulator for distraction-free mode */}
      {currentView !== 'test-player' && (
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          onSelectProduct={handleSelectProduct}
        />
      )}

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onSelectProduct={handleSelectProduct}
            onTakeTest={handleTakeTest}
            onNavigateCategory={handleNavigateCategory}
          />
        )}

        {currentView === 'catalog' && (
          <CatalogPage
            onSelectProduct={handleSelectProduct}
            onTakeTest={handleTakeTest}
          />
        )}

        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onTakeTest={handleTakeTest}
            onBack={() => setCurrentView('catalog')}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'test-player' && activeTestProduct && (
          <TestPlayerPage
            product={activeTestProduct}
            testNumber={activeTestNumber}
            onFinishTest={handleFinishTest}
            onBack={() => setCurrentView('product-detail')}
          />
        )}

        {currentView === 'test-result' && (
          <TestResultPage
            attempt={currentAttempt}
            onRetake={() => {
              if (activeTestProduct) {
                handleTakeTest(activeTestProduct, currentAttempt?.testNumber || activeTestNumber || 1);
              } else if (currentAttempt) {
                handleTakeTest({
                  id: currentAttempt.testId,
                  title: currentAttempt.productTitle,
                  vendor: currentAttempt.vendor
                }, currentAttempt.testNumber || 1);
              }
            }}
            onBackToCatalog={() => setCurrentView('catalog')}
          />
        )}

        {currentView === 'interviews' && (
          <InterviewPage onSelectProduct={handleSelectProduct} />
        )}

        {currentView === 'blogs' && (
          <BlogPage
            onSelectProduct={handleSelectProduct}
            onTakeTest={handleTakeTest}
          />
        )}

        {currentView === 'instructor' && (
          <InstructorPage onSelectProduct={handleSelectProduct} />
        )}

        {currentView === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminPanelPage onSelectProduct={handleSelectProduct} />
          ) : (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4 font-sans animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-400">
                404
              </div>
              <h1 className="text-2xl font-black text-slate-800">Page Not Found</h1>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                The requested URL or resource was not found on this server. Please check the address or return to the course catalog.
              </p>
              <button
                onClick={() => setCurrentView('home')}
                className="mt-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                Return to Home
              </button>
            </div>
          )
        )}

        {currentView === 'mylearning' && (
          <MyLearningPage
            onTakeTest={handleTakeTest}
            onViewResult={handleViewResult}
            onSelectProduct={handleSelectProduct}
            onNavigate={setCurrentView}
          />
        )}

        {(currentView === 'cart' || currentView === 'checkout') && (
          <CartPage
            initialStep={currentView === 'checkout' ? 'payment' : 'cart'}
            onContinueShopping={() => setCurrentView('catalog')}
            onTakeTest={handleTakeTest}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'wishlist' && (
          <WishlistPage
            onSelectProduct={handleSelectProduct}
            onTakeTest={handleTakeTest}
            onExplore={() => setCurrentView('catalog')}
          />
        )}

        {currentView === 'about' && (
          <AboutPage onExplore={() => setCurrentView('catalog')} />
        )}

        {currentView === 'contact' && <ContactPage />}

        {currentView === 'terms' && (
          <TermsOfServicePage onNavigate={setCurrentView} />
        )}

        {currentView === 'refund' && (
          <RefundPolicyPage onNavigate={setCurrentView} />
        )}

        {currentView === 'privacy' && (
          <PrivacyPolicyPage onNavigate={setCurrentView} />
        )}
      </main>

      {/* Footer is hidden during test-player */}
      {currentView !== 'test-player' && (
        <Footer onNavigate={handleFooterNavigate} />
      )}

      {/* Global Authentication Modal */}
      <AuthModal
        onNavigate={setCurrentView}
        onLoginSuccess={(user) => {
          if (user.role === 'admin') {
            setCurrentView('admin');
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
