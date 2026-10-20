import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import CookieConsentBanner from './components/CookieConsentBanner';
import { FloatingQuickConnect } from './components/SocialLinks';
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

  // Scroll to top instantly whenever view or active product changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView, selectedProduct?.id]);

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

  // Automatically redirect to home if user logs out or loses admin authorization
  useEffect(() => {
    if (currentView === 'admin' && currentUser?.role !== 'admin') {
      setCurrentView('home');
    }
  }, [currentView, currentUser]);

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
            <HomePage
              onSelectProduct={handleSelectProduct}
              onTakeTest={handleTakeTest}
              onNavigateCategory={handleNavigateCategory}
            />
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

      {/* Floating Quick Connect (WhatsApp & Telegram Support) */}
      {currentView !== 'test-player' && <FloatingQuickConnect />}

      {/* Cookie & Privacy Consent Banner */}
      <CookieConsentBanner onNavigate={setCurrentView} />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ITPT Critical Error Caught]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-purple-600/30 text-purple-400 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/40">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Something went wrong while loading the page</h1>
          <p className="text-slate-400 text-sm max-w-md mb-6">
            A temporary script error occurred. Please click the button below to reload and restore normal application state.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                try { localStorage.clear(); } catch(e) {}
                window.location.reload();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl transition cursor-pointer text-sm"
            >
              Clear Cache &amp; Reload
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-2.5 rounded-xl transition cursor-pointer text-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </ErrorBoundary>
  );
}
