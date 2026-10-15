import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import {
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle,
  AlertCircle,
  Lock,
  QrCode,
  CreditCard,
  Building,
  Smartphone,
  ExternalLink,
  Sparkles,
  Award,
  Shield,
  Key,
  Mail,
  Send,
  Copy,
  Check,
  RefreshCw,
  ShoppingBag,
  ArrowLeft,
  XCircle,
  AlertTriangle,
  PlayCircle,
  Wallet
} from 'lucide-react';
import { generateAdminOrderEmailHtml } from '../utils/emailService';

export default function CartPage({ onContinueShopping, onTakeTest, onNavigate, initialStep = 'cart' }) {
  const {
    cart,
    removeFromCart,
    clearCart,
    formatPrice,
    currency,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    products,
    user,
    currentUser,
    adminEmailSettings,
    openLoginModal,
    paymentGateways,
    createPendingOrder,
    verifyPaidOrder
  } = useApp();

  const [checkoutStep, setCheckoutStep] = useState(initialStep || 'cart'); // 'cart' | 'payment' | 'success'
  const [completedOrder, setCompletedOrder] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);

  // Customer Contact Fields
  const [customerName, setCustomerName] = useState(currentUser?.name || user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || user?.phone || '+91-9253330335');
  const [emailValidationError, setEmailValidationError] = useState(false);

  // Update contact info when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name || '');
      setCustomerEmail(currentUser.email || '');
      if (currentUser.phone) setCustomerPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Synchronize step with parent navigation requests
  useEffect(() => {
    if (initialStep) {
      setCheckoutStep(initialStep);
    }
  }, [initialStep]);

  // Pricing calculations
  const subtotalINR = cart.reduce((sum, item) => sum + (item.priceINR || 0), 0);
  const subtotalUSD = cart.reduce((sum, item) => sum + (item.priceUSD || 0), 0);

  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const discountINR = Math.round((subtotalINR * discountPercent) / 100);
  const discountUSD = +(subtotalUSD * (discountPercent / 100)).toFixed(2);

  const totalINR = Math.max(0, subtotalINR - discountINR);
  const totalUSD = Math.max(0, +(subtotalUSD - discountUSD).toFixed(2));

  // Active Gateways List (Include all 5 official providers)
  const defaultGateways = [
    {
      id: 'gw-razorpay',
      name: 'Razorpay Gateway',
      provider: 'Razorpay',
      keyId: 'rzp_live_SylljWgo1cubKX',
      isEnabled: true,
      supportedMethods: ['UPI', 'Debit/Credit Cards', 'NetBanking', 'Wallets'],
      currency: 'INR'
    },
    {
      id: 'gw-payu',
      name: 'PayU Gateway',
      provider: 'PayU',
      keyId: 'aMpf5U',
      isEnabled: true,
      supportedMethods: ['Debit/Credit Cards', 'UPI', 'NetBanking', 'Wallets'],
      currency: 'INR'
    },
    {
      id: 'gw-cashfree',
      name: 'Cashfree Gateway',
      provider: 'Cashfree',
      keyId: '1364819627b5910d9f1b9fb87799184631',
      isEnabled: true,
      supportedMethods: ['UPI', 'Credit/Debit Cards', 'NetBanking'],
      currency: 'INR'
    },
    {
      id: 'gw-ccavenue',
      name: 'CCAvenue Gateway',
      provider: 'CCAvenue',
      keyId: '4472256',
      isEnabled: true,
      supportedMethods: ['International Cards', 'RuPay', 'NetBanking'],
      currency: 'ALL'
    },
    {
      id: 'gw-paypal',
      name: 'PayPal Gateway',
      provider: 'PayPal',
      keyId: 'ARwtJURxNKLGqrBYk3xFab2P90a3xNDloiHTNisj8mLY2Hd_JjARWl7Lf1t9JwOjlHGMqMgD-mgwCNzy',
      isEnabled: true,
      supportedMethods: ['PayPal Account', 'International Cards'],
      currency: 'USD'
    },
    {
      id: 'gw-upi-direct',
      name: 'Instant UPI QR & Direct VPA',
      provider: 'UPI Direct',
      keyId: 'itpracticetests@okhdfcbank',
      isEnabled: true,
      supportedMethods: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM'],
      currency: 'INR'
    }
  ];

  const activeGateways = (paymentGateways && paymentGateways.length > 0)
    ? paymentGateways.filter(gw => gw.isEnabled !== false && gw.is_enabled !== false)
    : defaultGateways;

  const [selectedGatewayId, setSelectedGatewayId] = useState(() => {
    return activeGateways[0]?.id || 'gw-razorpay';
  });
  const [selectedProvider, setSelectedProvider] = useState(() => {
    return activeGateways[0]?.provider || 'Razorpay';
  });

  // Keep selectedGateway in sync by matching ID or Provider name
  const selectedGateway = activeGateways.find(g => 
    g.id === selectedGatewayId || 
    (g.provider && selectedProvider && g.provider.toLowerCase() === selectedProvider.toLowerCase())
  ) || activeGateways[0] || defaultGateways[0];

  // Payment UI & Verification States
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationStage, setVerificationStage] = useState('');
  const [paymentError, setPaymentError] = useState(null);
  const [pendingOrderInfo, setPendingOrderInfo] = useState(null);

  // Official Modal Visibility States
  const [showRazorpayLoadingModal, setShowRazorpayLoadingModal] = useState(false);
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [showCashfreeModal, setShowCashfreeModal] = useState(false);
  const [showPayuModal, setShowPayuModal] = useState(false);
  const [showCcavenueModal, setShowCcavenueModal] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);

  // Official Payment Link Modal States
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [activePaymentLink, setActivePaymentLink] = useState('');
  const [paymentRefInput, setPaymentRefInput] = useState('');
  const [isVerifyingRef, setIsVerifyingRef] = useState(false);
  const [refVerifyError, setRefVerifyError] = useState(null);

  // Modal Interactive States
  const [cashfreeTab, setCashfreeTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [cashfreeCardNumber, setCashfreeCardNumber] = useState('');
  const [cashfreeCardExpiry, setCashfreeCardExpiry] = useState('');
  const [cashfreeCardCvv, setCashfreeCardCvv] = useState('');
  const [cashfreeUpiId, setCashfreeUpiId] = useState('');
  const [cashfreeBank, setCashfreeBank] = useState('HDFC Bank');

  const [payuTab, setPayuTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [payuCardNumber, setPayuCardNumber] = useState('');
  const [payuCardExpiry, setPayuCardExpiry] = useState('');
  const [payuCardCvv, setPayuCardCvv] = useState('');
  const [payuUpiId, setPayuUpiId] = useState('');
  const [payuBank, setPayuBank] = useState('State Bank of India');

  const [ccavenueTab, setCcavenueTab] = useState('cards'); // 'cards' | 'netbanking' | 'upi'
  const [ccavenueCardNumber, setCcavenueCardNumber] = useState('');
  const [ccavenueCardExpiry, setCcavenueCardExpiry] = useState('');
  const [ccavenueCardCvv, setCcavenueCardCvv] = useState('');
  const [ccavenueBank, setCcavenueBank] = useState('HDFC Bank');

  const [paypalTab, setPaypalTab] = useState('paypal'); // 'paypal' | 'card' | 'pay_later'

  // Direct UPI QR State
  const [upiUtrInput, setUpiUtrInput] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [orderSessionRef] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  const upiVpa = selectedGateway?.upiVpa || selectedGateway?.upi_vpa || 'itpracticetests@okhdfcbank';
  const payeeName = selectedGateway?.merchantName || 'ITPracticeTests Online Education';
  const upiAmount = currency === 'INR' ? totalINR : Math.round(totalUSD * 86);
  const upiNote = `ITPT-${orderSessionRef}`;
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent(payeeName)}&am=${upiAmount}&cu=INR&tn=${encodeURIComponent(upiNote)}`;

  // Generate UPI QR Code
  useEffect(() => {
    let isMounted = true;
    if (upiUri && upiAmount > 0) {
      QRCode.toDataURL(upiUri, {
        width: 240,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      }).then(url => {
        if (isMounted) setQrCodeDataUrl(url);
      }).catch(err => {
        console.error('Error generating UPI QR Code:', err);
      });
    }
    return () => { isMounted = false; };
  }, [upiUri, upiAmount]);

  // PayPal SDK Dynamic Loader for Modal
  const paypalClientId = (
    selectedGateway?.keyId ||
    selectedGateway?.clientId ||
    'ARwtJURxNKLGqrBYk3xFab2P90a3xNDloiHTNisj8mLY2Hd_JjARWl7Lf1t9JwOjlHGMqMgD-mgwCNzy'
  ).trim();

  const [paypalSdkLoaded, setPaypalSdkLoaded] = useState(false);

  useEffect(() => {
    if (!showPaypalModal) return;
    let isMounted = true;

    if (window.paypal) {
      setPaypalSdkLoaded(true);
      return;
    }

    const scriptId = 'paypal-js-sdk-modal';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(paypalClientId)}&currency=USD&intent=capture`;
      script.onload = () => {
        if (isMounted) setPaypalSdkLoaded(true);
      };
      script.onerror = () => {
        if (isMounted) console.warn('[PayPal SDK Modal]: Failed to load script.');
      };
      document.body.appendChild(script);
    } else {
      if (window.paypal) setPaypalSdkLoaded(true);
    }

    return () => { isMounted = false; };
  }, [showPaypalModal, paypalClientId]);

  // Render PayPal Smart Payment Buttons inside PayPal Modal
  useEffect(() => {
    if (!showPaypalModal || !paypalSdkLoaded || !window.paypal) return;
    const container = document.getElementById('paypal-modal-button-container');
    if (!container) return;
    container.innerHTML = '';

    try {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              description: `ITPracticeTests Enrollment (${cart.length} item${cart.length > 1 ? 's' : ''})`,
              amount: {
                currency_code: 'USD',
                value: (pendingOrderInfo?.total || totalUSD).toString()
              }
            }]
          });
        },
        onApprove: async (data, actions) => {
          setIsProcessing(true);
          setShowPaypalModal(false);
          setVerificationStage('Verifying PayPal payment capture server-side...');
          try {
            const details = actions.order ? await actions.order.capture() : data;
            const activeOrderId = pendingOrderInfo?.orderId || `ITPT-PP-${Date.now().toString().slice(-6)}`;

            const verifyRes = await verifyPaidOrder({
              orderId: activeOrderId,
              paymentId: details.id || data.orderID,
              gatewayProvider: 'PayPal',
              paypalDetails: details
            });

            setIsProcessing(false);
            setVerificationStage('');

            if (verifyRes.success) {
              setCompletedOrder(verifyRes.order);
              setCheckoutStep('success');
            } else {
              setPaymentError(verifyRes.error || 'PayPal payment could not be verified by server. Course access was NOT granted.');
            }
          } catch (err) {
            setIsProcessing(false);
            setPaymentError(`PayPal verification error: ${err.message || 'Verification failed.'}`);
          }
        },
        onCancel: () => {
          setShowPaypalModal(false);
          setIsProcessing(false);
          setPaymentError('PayPal checkout was cancelled. No payment was deducted and course access was NOT granted.');
        },
        onError: (err) => {
          setShowPaypalModal(false);
          setIsProcessing(false);
          setPaymentError(`PayPal Error: ${err?.message || 'Transaction could not be completed.'} Course access was NOT granted.`);
        }
      }).render('#paypal-modal-button-container');
    } catch (e) {
      console.warn('[PayPal Modal Buttons Render Error]:', e);
    }
  }, [showPaypalModal, paypalSdkLoaded, pendingOrderInfo, totalUSD, cart]);

  // Load External JS Script Helper
  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // --------------------------------------------------------------------------
  // PRIMARY CHECKOUT TRIGGER: handleLaunchPayment
  // --------------------------------------------------------------------------
  const handleLaunchPayment = async () => {
    setPaymentError(null);
    setEmailValidationError(false);

    // 1. Email Validation (Guest or Logged in user)
    const finalEmail = (customerEmail || currentUser?.email || '').trim().toLowerCase();
    if (!finalEmail || !finalEmail.includes('@') || !finalEmail.includes('.')) {
      setEmailValidationError(true);
      setPaymentError('Please enter a valid email address so we can issue your enrollment and tax invoice receipt.');
      const el = document.getElementById('customer-email-input');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const provider = selectedGateway?.provider || selectedProvider || 'Razorpay';
    const payCurrency = provider === 'PayPal' ? 'USD' : (currency || 'INR');

    setIsProcessing(true);
    setVerificationStage(`Creating secure pending order for ${provider}...`);

    // 2. Step 1: Create PENDING order on backend with canonical catalog prices
    const orderRes = await createPendingOrder({
      items: cart,
      currency: payCurrency,
      customerName: customerName.trim() || 'Valued Learner',
      customerEmail: finalEmail,
      customerPhone,
      gatewayProvider: provider
    });

    if (!orderRes.success) {
      setIsProcessing(false);
      setVerificationStage('');
      setPaymentError(orderRes.error || 'Failed to initialize pending order on server.');
      const errEl = document.getElementById('checkout-payment-error');
      if (errEl) errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Auto-complete free orders (e.g. 100% coupon or 0 INR courses)
    if (orderRes.status === 'PAID' || orderRes.isFree) {
      setIsProcessing(false);
      setVerificationStage('');
      setCompletedOrder(orderRes.order || orderRes);
      setCheckoutStep('success');
      return;
    }

    setPendingOrderInfo(orderRes);
    setIsProcessing(false);
    setVerificationStage('');

    // Open Official Modal for Selected Payment Gateway
    if (provider === 'Razorpay' || provider.toLowerCase().includes('razorpay')) {
      await launchRazorpayModal(orderRes, finalEmail);
    } else if (provider === 'PayPal') {
      setShowPaypalModal(true);
    } else if (provider === 'Cashfree') {
      setShowCashfreeModal(true);
    } else if (provider === 'PayU') {
      setShowPayuModal(true);
    } else if (provider === 'CCAvenue') {
      setShowCcavenueModal(true);
    } else if (provider === 'UPI Direct' || provider.toLowerCase().includes('upi')) {
      setShowUpiModal(true);
    } else {
      const gwPaymentLink = selectedGateway?.paymentLink || selectedGateway?.payment_link;
      const coursePaymentLink = cart[0]?.paymentLink || cart[0]?.paymentLinks?.[provider.toLowerCase()];
      const directLink = gwPaymentLink || coursePaymentLink;
      if (directLink && directLink.trim().startsWith('http')) {
        setActivePaymentLink(directLink.trim());
        setShowPaymentLinkModal(true);
      } else {
        await launchRazorpayModal(orderRes, finalEmail);
      }
    }
  };

  // Verify payment completed via direct payment link
  const handleVerifyPaymentLinkSubmit = async () => {
    if (!paymentRefInput.trim()) {
      setRefVerifyError('Please enter your payment reference, transaction ID, or UPI UTR number.');
      return;
    }

    setIsVerifyingRef(true);
    setRefVerifyError(null);

    const activeOrderId = pendingOrderInfo?.orderId || `ITPT-ORD-${Date.now()}`;
    const provider = selectedGateway?.provider || selectedProvider || 'Razorpay';

    const verifyRes = await verifyPaidOrder({
      orderId: activeOrderId,
      paymentId: paymentRefInput.trim(),
      utrNumber: paymentRefInput.trim(),
      gatewayProvider: provider
    });

    setIsVerifyingRef(false);

    if (verifyRes.success && (verifyRes.order?.status === 'PAID' || verifyRes.status === 'PAID')) {
      setShowPaymentLinkModal(false);
      setCompletedOrder(verifyRes.order);
      setCheckoutStep('success');
    } else {
      setRefVerifyError(verifyRes.error || 'Server could not verify payment. Please confirm your transaction ID.');
    }
  };

  // Launch Razorpay Official Modal
  const launchRazorpayModal = async (orderRes, finalEmail, preferredMethod = null) => {
    setShowRazorpayLoadingModal(true);

    if (!window.Razorpay) {
      const isLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!isLoaded || !window.Razorpay) {
        setShowRazorpayLoadingModal(false);
        setPaymentError('Unable to connect to Razorpay payment servers. Please check your network connection.');
        return;
      }
    }

    const finalAmount = orderRes.currency === 'INR' ? orderRes.total : Math.round(orderRes.total * 86);
    const razorpayKey = orderRes.gateway?.keyId || selectedGateway?.keyId || 'rzp_live_SylljWgo1cubKX';

    const prefillData = {
      name: customerName.trim() || 'Valued Learner',
      email: finalEmail,
      contact: customerPhone || '+91-9253330335'
    };

    if (preferredMethod) {
      prefillData.method = preferredMethod;
    }

    const options = {
      key: razorpayKey,
      amount: finalAmount * 100, // paise
      currency: 'INR',
      name: 'ITPracticeTests Online Education',
      description: `Enrollment: ${cart.map(c => c.title.split('|')[0]).join(', ')}`,
      image: 'https://api.dicebear.com/7.x/identicon/svg?seed=ITPracticeTests',
      prefill: prefillData,
      theme: { color: '#7c3aed' },
      handler: async function (response) {
        // ONLY CALLED ON SUCCESSFUL PAYMENT CONFIRMED BY RAZORPAY / BANK
        setShowRazorpayLoadingModal(false);
        setIsProcessing(true);
        setVerificationStage('Verifying cryptographic HMAC signature with security server...');

        const verifyRes = await verifyPaidOrder({
          orderId: orderRes.orderId,
          paymentId: response.razorpay_payment_id,
          gatewayOrderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          gatewayProvider: 'Razorpay'
        });

        setIsProcessing(false);
        setVerificationStage('');

        if (verifyRes.success) {
          setCompletedOrder(verifyRes.order);
          setCheckoutStep('success');
        } else {
          setPaymentError(verifyRes.error || 'Server payment verification failed. Course access was NOT granted.');
        }
      },
      modal: {
        ondismiss: function () {
          setShowRazorpayLoadingModal(false);
          setIsProcessing(false);
          setVerificationStage('');
          setPaymentError('Payment window was closed before completion. No payment was deducted and course access was NOT granted.');
        }
      }
    };

    try {
      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (resp) {
        setShowRazorpayLoadingModal(false);
        setIsProcessing(false);
        setVerificationStage('');
        setPaymentError(`Payment Failed: ${resp.error?.description || 'Transaction declined by bank.'} Course access was NOT granted.`);
      });
      setShowRazorpayLoadingModal(false);
      rzpInstance.open();
    } catch (err) {
      setShowRazorpayLoadingModal(false);
      setIsProcessing(false);
      setVerificationStage('');
      setPaymentError(`Razorpay Checkout error: ${err.message}.`);
    }
  };

  // Handle Cashfree Modal Submit (Seamlessly connects to verified payment gateway / payment link)
  const handleCashfreeModalSubmit = async () => {
    setShowCashfreeModal(false);

    // 1. If official payment link is configured, open official gateway window
    const gwPaymentLink = selectedGateway?.paymentLink || selectedGateway?.payment_link;
    const directLink = gwPaymentLink || cart[0]?.paymentLink || cart[0]?.paymentLinks?.cashfree;

    if (directLink && directLink.trim().startsWith('http')) {
      setActivePaymentLink(directLink.trim());
      setShowPaymentLinkModal(true);
      window.open(directLink.trim(), '_blank');
      return;
    }

    // 2. Seamlessly route NetBanking, Cards, or UPI through Razorpay live gateway
    // so students MUST complete actual bank authentication before gaining access
    setIsProcessing(true);
    setVerificationStage(
      cashfreeTab === 'netbanking'
        ? `Connecting to secure NetBanking portal for ${cashfreeBank}...`
        : 'Connecting to secure payment gateway...'
    );

    const finalEmail = (customerEmail || currentUser?.email || '').trim().toLowerCase();
    let orderRes = pendingOrderInfo;
    if (!orderRes || !orderRes.orderId) {
      orderRes = await createPendingOrder({
        items: cart,
        currency: 'INR',
        customerName: customerName.trim() || 'Valued Learner',
        customerEmail: finalEmail,
        customerPhone,
        gatewayProvider: 'Razorpay'
      });
    }

    if (orderRes && orderRes.success) {
      setPendingOrderInfo(orderRes);
      await launchRazorpayModal(
        orderRes,
        finalEmail,
        cashfreeTab === 'netbanking' ? 'netbanking' : (cashfreeTab === 'upi' ? 'upi' : 'card')
      );
    } else {
      setIsProcessing(false);
      setVerificationStage('');
      setPaymentError(orderRes?.error || 'Unable to establish secure banking session. Please retry or choose UPI Direct.');
    }
  };

  // Handle PayU Modal Submit (Seamlessly connects to verified payment gateway / payment link)
  const handlePayuModalSubmit = async () => {
    setShowPayuModal(false);

    // 1. If official payment link is configured, open official gateway window
    const gwPaymentLink = selectedGateway?.paymentLink || selectedGateway?.payment_link;
    const directLink = gwPaymentLink || cart[0]?.paymentLink || cart[0]?.paymentLinks?.payu;

    if (directLink && directLink.trim().startsWith('http')) {
      setActivePaymentLink(directLink.trim());
      setShowPaymentLinkModal(true);
      window.open(directLink.trim(), '_blank');
      return;
    }

    // 2. Seamlessly route NetBanking, Cards, or UPI through Razorpay live gateway
    // so students MUST complete actual bank authentication before gaining access
    setIsProcessing(true);
    setVerificationStage(
      payuTab === 'netbanking'
        ? `Connecting to secure NetBanking portal for ${payuBank}...`
        : 'Connecting to secure payment gateway...'
    );

    const finalEmail = (customerEmail || currentUser?.email || '').trim().toLowerCase();
    let orderRes = pendingOrderInfo;
    if (!orderRes || !orderRes.orderId) {
      orderRes = await createPendingOrder({
        items: cart,
        currency: 'INR',
        customerName: customerName.trim() || 'Valued Learner',
        customerEmail: finalEmail,
        customerPhone,
        gatewayProvider: 'Razorpay'
      });
    }

    if (orderRes && orderRes.success) {
      setPendingOrderInfo(orderRes);
      await launchRazorpayModal(
        orderRes,
        finalEmail,
        payuTab === 'netbanking' ? 'netbanking' : (payuTab === 'upi' ? 'upi' : 'card')
      );
    } else {
      setIsProcessing(false);
      setVerificationStage('');
      setPaymentError(orderRes?.error || 'Unable to establish secure banking session. Please retry or choose UPI Direct.');
    }
  };

  // Handle CCAvenue Modal Submit (Seamlessly connects to verified payment gateway / payment link)
  const handleCcavenueModalSubmit = async () => {
    setShowCcavenueModal(false);

    // 1. If official payment link is configured, open official gateway window
    const gwPaymentLink = selectedGateway?.paymentLink || selectedGateway?.payment_link;
    const directLink = gwPaymentLink || cart[0]?.paymentLink || cart[0]?.paymentLinks?.ccavenue;

    if (directLink && directLink.trim().startsWith('http')) {
      setActivePaymentLink(directLink.trim());
      setShowPaymentLinkModal(true);
      window.open(directLink.trim(), '_blank');
      return;
    }

    // 2. Seamlessly route NetBanking, Cards, or UPI through Razorpay live gateway
    // so students MUST complete actual bank authentication before gaining access
    setIsProcessing(true);
    setVerificationStage(
      ccavenueTab === 'netbanking'
        ? `Connecting to secure NetBanking portal for ${ccavenueBank}...`
        : 'Connecting to secure payment gateway...'
    );

    const finalEmail = (customerEmail || currentUser?.email || '').trim().toLowerCase();
    let orderRes = pendingOrderInfo;
    if (!orderRes || !orderRes.orderId) {
      orderRes = await createPendingOrder({
        items: cart,
        currency: 'INR',
        customerName: customerName.trim() || 'Valued Learner',
        customerEmail: finalEmail,
        customerPhone,
        gatewayProvider: 'Razorpay'
      });
    }

    if (orderRes && orderRes.success) {
      setPendingOrderInfo(orderRes);
      await launchRazorpayModal(
        orderRes,
        finalEmail,
        ccavenueTab === 'netbanking' ? 'netbanking' : (ccavenueTab === 'upi' ? 'upi' : 'card')
      );
    } else {
      setIsProcessing(false);
      setVerificationStage('');
      setPaymentError(orderRes?.error || 'Unable to establish secure banking session. Please retry or choose UPI Direct.');
    }
  };

  // Direct UPI Settlement Verification Handler
  const handleVerifyUpiPayment = async () => {
    setPaymentError(null);
    if (!upiUtrInput.trim() || upiUtrInput.trim().length < 6) {
      setPaymentError('Please enter the 12-digit UPI Reference Number / UTR from your payment app (Google Pay / PhonePe / Paytm).');
      return;
    }

    const finalEmail = (customerEmail || currentUser?.email || '').trim().toLowerCase();
    if (!finalEmail || !finalEmail.includes('@')) {
      setPaymentError('Please enter a valid email address.');
      return;
    }

    setShowUpiModal(false);
    setIsProcessing(true);
    setVerificationStage('Creating pending order and verifying UPI settlement with bank...');

    const orderRes = pendingOrderInfo || (await createPendingOrder({
      items: cart,
      currency: 'INR',
      customerName: customerName.trim() || 'Valued Learner',
      customerEmail: finalEmail,
      customerPhone,
      gatewayProvider: 'UPI Direct'
    }));

    if (!orderRes.success) {
      setIsProcessing(false);
      setPaymentError(orderRes.error || 'Failed to initialize pending order.');
      return;
    }

    const verifyRes = await verifyPaidOrder({
      orderId: orderRes.orderId,
      paymentId: `UPI-${upiUtrInput.trim()}`,
      utrNumber: upiUtrInput.trim(),
      gatewayProvider: 'UPI Direct'
    });

    setIsProcessing(false);
    setVerificationStage('');

    if (verifyRes.success) {
      setCompletedOrder(verifyRes.order);
      setCheckoutStep('success');
    } else {
      setPaymentError(verifyRes.error || 'UPI settlement could not be verified. Course access was NOT granted.');
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCouponCode(couponInput);
    setCouponMsg(res);
  };

  // -------------------------------------------------------------
  // STEP 3: ORDER SUCCESS & TAX INVOICE RECEIPT
  // -------------------------------------------------------------
  if (checkoutStep === 'success' && completedOrder && completedOrder.status === 'PAID') {
    return (
      <div className="min-h-screen bg-[#f7f9fa] py-12 px-4 font-sans">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-udemy-border p-8 shadow-card space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Payment Completed &amp; Verified Server-Side
            </span>
            <h1 className="text-2xl font-extrabold text-udemy-dark pt-2">
              Thank You for Your Order!
            </h1>
            <p className="text-xs text-gray-500">
              Order ID: <strong className="text-udemy-dark">{completedOrder.orderId}</strong> • Transaction Ref: {completedOrder.transactionId}
            </p>
          </div>

          {/* Tax Invoice Breakdown Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left text-xs space-y-3">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <strong className="text-slate-800 text-sm font-bold">ITPracticeTests.com</strong>
                <p className="text-[11px] text-gray-500">
                  Office No. 715, Block D&E, Chandigarh Citi Center, VIP Road, Zirakpur, Punjab – 140603
                </p>
                <p className="text-[11px] text-gray-500 font-medium">
                  GSTIN: <strong>03AKXPD3010G1ZM</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px] border border-emerald-300">
                  VERIFIED PAID
                </span>
                <p className="text-[11px] text-gray-500 mt-1">{completedOrder.date}</p>
              </div>
            </div>

            <div className="space-y-1.5 py-1">
              <span className="font-bold text-gray-700 block">Enrolled Courses &amp; Practice Tests:</span>
              {(completedOrder.items || []).map((it, idx) => (
                <div key={idx} className="flex justify-between text-slate-800">
                  <span className="truncate mr-4">✓ {it.title}</span>
                  <span className="font-semibold shrink-0">
                    {formatPrice(it.priceINR, it.priceUSD)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-udemy-dark">
              <span>Total Paid ({completedOrder.paymentMethod}):</span>
              <span className="text-purple-700">
                {currency === 'INR' ? `₹${completedOrder.total}` : `$${completedOrder.total}`}
              </span>
            </div>

            {/* Cryptographic Transaction Proof & Anti-Tampering Seal */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-[10px] text-gray-500 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 font-bold flex items-center space-x-1 font-sans">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Server-Side Payment Proof:</span>
                </span>
                <span className="text-gray-700 font-bold">
                  {completedOrder.signature ? `${completedOrder.signature.slice(0, 22)}...` : 'VERIFIED-HMAC-SHA256'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans">Gateway Authorization:</span>
                <span className="text-emerald-700 font-bold font-sans">ACTIVE ENROLLMENT GRANTED</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-900 space-y-1">
            <p className="font-bold">Instant Lifetime Access Activated!</p>
            <p className="text-purple-800">
              All purchased practice test bundles are unlocked on your account with unlimited attempts, timed countdown mode, and benchmark scorecards.
            </p>
          </div>

          {/* Admin Email Notification Dispatched Card */}
          <div className="bg-gradient-to-r from-slate-900 to-purple-950 text-white rounded-xl p-4 text-left text-xs space-y-2 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white flex items-center space-x-2">
                    <span>Admin Order Notification Dispatched</span>
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ✓ Instant Delivery
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
                    Automated email with full purchase details, items list, customer phone/email, and GST invoice dispatched to store administrator at: <strong className="text-emerald-300 font-mono">{adminEmailSettings?.primaryAdminEmail || 'support@itpracticetests.com'}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(true)}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold px-3 py-2 rounded-lg transition shrink-0 flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-purple-300" />
                <span>Preview Admin Email</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4 pt-2">
            {completedOrder.items && completedOrder.items[0] && (
              <button
                type="button"
                onClick={() => onTakeTest(completedOrder.items[0])}
                className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-6 py-3 rounded-lg shadow-sm transition cursor-pointer"
              >
                Start Practice Test Now
              </button>
            )}
            <button
              type="button"
              onClick={onContinueShopping}
              className="border border-slate-300 text-slate-700 text-xs font-semibold px-4 py-3 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              Back to Catalog
            </button>
          </div>
        </div>

        {/* Modal: Dispatched Admin Email Preview */}
        {showEmailPreviewModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-udemy-border space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-udemy-dark">
                      Dispatched Admin Email Notice
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      To: <span className="font-mono text-purple-700">{adminEmailSettings?.primaryAdminEmail || 'support@itpracticetests.com'}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div
                className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs p-2 max-h-[60vh] overflow-y-auto"
                dangerouslySetInnerHTML={{
                  __html: generateAdminOrderEmailHtml(completedOrder, adminEmailSettings)
                }}
              />

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailPreviewModal(false)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // EMPTY CART SCREEN
  // -------------------------------------------------------------
  if (cart.length === 0 && checkoutStep !== 'success') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans bg-[#f7f9fa] animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-udemy-dark">Your cart is empty</h2>
        <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
          Explore 162+ IT certification practice exams, interview question banks, and cloud architecture mock tests.
        </p>
        <button
          type="button"
          onClick={onContinueShopping}
          className="mt-2 bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition cursor-pointer"
        >
          Explore Course Catalog
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 1 & 2: CART REVIEW & CHECKOUT PAYMENT
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#f7f9fa] py-8 md:py-12 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setCheckoutStep('cart')}
              className={`flex items-center space-x-1.5 text-xs font-bold transition cursor-pointer ${
                checkoutStep === 'cart'
                  ? 'text-purple-700'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                checkoutStep === 'cart' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                1
              </span>
              <span>Review Cart</span>
            </button>

            <span className="text-gray-300">/</span>

            <button
              type="button"
              onClick={() => setCheckoutStep('payment')}
              className={`flex items-center space-x-1.5 text-xs font-bold transition cursor-pointer ${
                checkoutStep === 'payment'
                  ? 'text-purple-700'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                checkoutStep === 'payment' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                2
              </span>
              <span>Payment &amp; Gateway Checkout</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onContinueShopping}
            className="text-xs text-gray-500 hover:text-purple-700 font-semibold flex items-center space-x-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Global Payment Failure / Alert Banner */}
        {paymentError && (
          <div id="checkout-payment-error" className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 animate-shake">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-rose-950">Payment Not Completed</h4>
                <p className="text-xs text-rose-800 leading-relaxed">{paymentError}</p>
                <p className="text-[11px] text-rose-700 font-medium pt-1">
                  🔒 Security Rule: Course access was NOT granted. You can retry with the same or an alternative payment gateway below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT 2 COLUMNS: Cart Items or Payment Gateway View */}
          <div className="lg:col-span-2 space-y-6">
            {checkoutStep === 'cart' ? (
              /* CART ITEMS VIEW */
              <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h1 className="text-xl font-extrabold text-udemy-dark">
                    Shopping Cart ({cart.length} {cart.length === 1 ? 'Course' : 'Courses'})
                  </h1>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold transition cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {cart.map((item) => (
                    <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start space-x-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 font-black text-sm flex items-center justify-center shrink-0 border border-purple-100">
                          {item.vendor?.slice(0, 3) || 'IT'}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <h3 className="font-bold text-sm text-udemy-dark leading-tight line-clamp-2">
                            {item.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className="font-semibold text-purple-700">{item.vendor}</span>
                            <span>•</span>
                            <span>6 Full Practice Tests Included</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">Lifetime Free Updates</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4 shrink-0">
                        <span className="text-base font-extrabold text-udemy-dark">
                          {formatPrice(item.priceINR, item.priceUSD)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                          title="Remove from Cart"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('payment')}
                    className="w-full sm:w-auto bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-8 py-3.5 rounded-xl shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Proceed to Secure Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* PAYMENT STEP VIEW */
              <div className="space-y-6">
                {/* 1. Learner Contact Information Card */}
                <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
                        1
                      </span>
                      <h3 className="font-bold text-sm text-udemy-dark">
                        Learner Enrollment &amp; Invoice Information
                      </h3>
                    </div>
                    {currentUser ? (
                      <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Signed In: {currentUser.name || currentUser.email}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={openLoginModal}
                        className="text-xs text-purple-700 font-bold hover:underline cursor-pointer"
                      >
                        Sign in for faster checkout
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Full Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Learner Name"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1">
                        Email Address <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="customer-email-input"
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => {
                          setCustomerEmail(e.target.value);
                          if (emailValidationError) setEmailValidationError(false);
                          if (paymentError) setPaymentError(null);
                        }}
                        placeholder="your.email@example.com"
                        className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none transition ${
                          emailValidationError
                            ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/30'
                            : 'border-slate-300 focus:ring-2 focus:ring-purple-500'
                        }`}
                      />
                      {emailValidationError ? (
                        <span className="text-[11px] text-rose-600 font-bold mt-1 block">
                          ⚠️ Please enter a valid email address. Course access will be linked to this email.
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500 mt-0.5 block">
                          Course access and official GST invoice receipt will be delivered here.
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91-9253330335"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Billing Country</label>
                      <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium">
                        {currency === 'INR' ? 'India (GST Included: 03AKXPD3010G1ZM)' : 'Global / International (USD)'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Official Payment Gateway Selector Card */}
                <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-5">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-bold text-sm text-udemy-dark">
                      Select Active Payment Gateway
                    </h3>
                  </div>

                  {/* Gateway Option Radio Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {activeGateways.map((gw) => {
                      const isSelected = (gw.id === selectedGatewayId) ||
                        (selectedProvider && gw.provider?.toLowerCase() === selectedProvider.toLowerCase());
                      const hasPaymentLink = Boolean(gw.paymentLink || gw.payment_link);
                      return (
                        <div
                          key={gw.id}
                          onClick={() => {
                            setSelectedGatewayId(gw.id);
                            setSelectedProvider(gw.provider);
                            setPaymentError(null);
                          }}
                          className={`p-4 rounded-xl border-2 transition cursor-pointer text-left space-y-2 ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-purple-600 bg-purple-600' : 'border-slate-400'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="font-bold text-xs text-udemy-dark">
                                {gw.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-700">
                              {gw.provider}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500 pl-6">
                            {(gw.supportedMethods || ['Cards', 'UPI', 'NetBanking']).slice(0, 3).map((m, i) => (
                              <span key={i} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                                {m}
                              </span>
                            ))}
                            {hasPaymentLink && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">
                                Payment Link Ready
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* GATEWAY PAYMENT ACTIONS CONTAINER */}
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                          <span className="font-extrabold text-xs text-slate-900">
                            {selectedGateway.name} Official Checkout
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                          {selectedGateway.paymentLink || selectedGateway.payment_link ? 'Official Payment Link' : 'Official Gateway Integration'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {selectedGateway.paymentLink || selectedGateway.payment_link ? (
                          <>
                            Click below to open the official verified <strong>{selectedGateway.provider} Payment Link</strong>. Complete payment on the gateway page to unlock course access instantly.
                          </>
                        ) : (
                          <>
                            Click below to launch official <strong>{selectedGateway.provider}</strong> checkout. Complete your payment to unlock lifetime course access instantly.
                          </>
                        )}
                      </p>

                      {/* Fast Email Input if guest hasn't filled email yet */}
                      {!currentUser && !customerEmail && (
                        <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5 text-xs">
                          <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                            <Mail className="w-3.5 h-3.5 text-purple-600" />
                            <span>Your Email Address (For Instant Course Access & GST Receipt) *</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={customerEmail}
                            onChange={(e) => {
                              setCustomerEmail(e.target.value);
                              if (emailValidationError) setEmailValidationError(false);
                              if (paymentError) setPaymentError(null);
                            }}
                            placeholder="Enter your email to receive course access"
                            className="w-full bg-white px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Inline Validation Warning if Email Missing */}
                      {emailValidationError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center space-x-2 animate-shake">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Please fill in your Email Address above to proceed to payment.</span>
                        </div>
                      )}

                      {/* Inline Error Notice */}
                      {paymentError && (
                        <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 font-medium space-y-1 animate-shake">
                          <div className="flex items-center space-x-2 font-bold text-rose-900">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Payment Order Notice</span>
                          </div>
                          <p>{paymentError}</p>
                        </div>
                      )}

                      {/* Unified Launch Button */}
                      <button
                        type="button"
                        onClick={handleLaunchPayment}
                        disabled={isProcessing}
                        className="w-full bg-udemy-purple hover:bg-udemy-purple-hover text-white text-sm font-extrabold py-3.5 rounded-xl shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>{verificationStage || 'Processing...'}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 text-purple-200" />
                            <span>
                              Pay {selectedGateway.provider === 'PayPal' ? `$${totalUSD} USD` : `₹${totalINR}`} via {selectedGateway.provider}
                            </span>
                          </>
                        )}
                      </button>

                      {/* Alternative: Direct Payment Link if available */}
                      {(selectedGateway.paymentLink || selectedGateway.payment_link) && (
                        <button
                          type="button"
                          onClick={() => {
                            const link = (selectedGateway.paymentLink || selectedGateway.payment_link).trim();
                            setActivePaymentLink(link);
                            setShowPaymentLinkModal(true);
                            try {
                              window.open(link, '_blank', 'noopener,noreferrer');
                            } catch (e) {}
                          }}
                          className="w-full bg-white hover:bg-slate-50 text-purple-700 border border-purple-200 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Or Pay via Direct {selectedGateway.provider} Payment Link</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 1 COLUMN: Sticky Order Summary & Coupon Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-5 sticky top-24">
              <h2 className="font-extrabold text-base text-udemy-dark border-b border-slate-100 pb-3">
                Order Summary
              </h2>

              {/* Items List preview */}
              <div className="space-y-2 text-xs">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start text-slate-700">
                    <span className="line-clamp-1 mr-2">{item.title}</span>
                    <span className="font-semibold shrink-0">
                      {formatPrice(item.priceINR, item.priceUSD)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Coupon Form */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-600" />
                  <span>Promotional Coupon</span>
                </span>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="font-mono">{appliedCoupon.code}</strong>
                        <span className="text-[10px] text-emerald-700 block">
                          {appliedCoupon.discountPercent}% Discount Applied
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. TECHREADY"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-black text-white px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponMsg && (
                  <p className={`text-[11px] font-medium ${couponMsg.success ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {couponMsg.message}
                  </p>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Original Price:</span>
                  <span>{currency === 'INR' ? `₹${subtotalINR}` : `$${subtotalUSD}`}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({appliedCoupon.discountPercent}%):</span>
                    <span>-{currency === 'INR' ? `₹${discountINR}` : `$${discountUSD}`}</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-base font-extrabold text-udemy-dark">
                  <span>Total Amount:</span>
                  <span className="text-xl text-purple-700 font-black">
                    {currency === 'INR' ? `₹${totalINR}` : `$${totalUSD}`}
                  </span>
                </div>
              </div>

              {/* Security Trust Badges */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-[10px] text-gray-500">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>PCI-DSS Level 1 Encrypted Payment Pipeline</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Zero-Trust Server Payment Verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>30-Day Money-Back &amp; Pass Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* OFFICIAL GATEWAY MODALS                                                   */}
        {/* ========================================================================= */}

        {/* 0. OFFICIAL PAYMENT LINK & VERIFICATION MODAL */}
        {showPaymentLinkModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white text-xs">
                    {(selectedGateway.provider || 'GW').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">
                      {selectedGateway.name || selectedGateway.provider}
                    </h3>
                    <p className="text-[10px] text-purple-300">Official Gateway Payment Link</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentLinkModal(false)}
                  className="text-white/70 hover:text-white text-sm font-bold p-1 rounded transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Order Info Card */}
                <div className="bg-purple-50/50 border border-purple-200/80 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Order Reference:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {pendingOrderInfo?.orderId || 'PENDING'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Customer Email:</span>
                    <span className="font-medium text-slate-800">
                      {customerEmail || currentUser?.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-purple-200 pt-2 font-bold">
                    <span className="text-slate-800">Amount Due:</span>
                    <span className="text-base font-black text-purple-700">
                      {selectedGateway.provider === 'PayPal' ? `$${totalUSD} USD` : `₹${totalINR}`}
                    </span>
                  </div>
                </div>

                {/* Step 1: Open Payment Link */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold text-[11px] flex items-center justify-center">
                      1
                    </span>
                    <h4 className="font-bold text-xs text-slate-800">
                      Complete Payment on Official Payment Page
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                    We opened the official <strong>{selectedGateway.provider}</strong> payment window. If your browser blocked the new window, click the button below:
                  </p>
                  <div className="pl-7 pt-1">
                    <a
                      href={activePaymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open {selectedGateway.provider} Payment Link</span>
                    </a>
                  </div>
                </div>

                {/* Step 2: Verification Input */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center justify-center">
                      2
                    </span>
                    <h4 className="font-bold text-xs text-slate-800">
                      Enter Transaction / Payment ID to Activate Course Access
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                    Once paid, copy your Transaction ID or Payment Reference (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">pay_...</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">cf_...</code>, or 12-digit UTR) and paste below:
                  </p>

                  <div className="pl-7 space-y-3">
                    <input
                      type="text"
                      value={paymentRefInput}
                      onChange={(e) => {
                        setPaymentRefInput(e.target.value);
                        setRefVerifyError(null);
                      }}
                      placeholder="e.g. pay_29X82kQ9... or 12-digit UTR / Transaction ID"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />

                    {refVerifyError && (
                      <p className="text-xs text-rose-600 font-bold">{refVerifyError}</p>
                    )}

                    <button
                      type="button"
                      disabled={isVerifyingRef || !paymentRefInput.trim()}
                      onClick={handleVerifyPaymentLinkSubmit}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      {isVerifyingRef ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying Payment Server-Side...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Confirm Payment & Unlock Course</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-[11px] border-t border-slate-100 text-gray-400">
                  <button
                    type="button"
                    onClick={() => setShowPaymentLinkModal(false)}
                    className="text-gray-500 hover:text-black hover:underline cursor-pointer"
                  >
                    Cancel and return
                  </button>
                  <span>256-Bit SSL Encrypted Verification</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. RAZORPAY LOADING MODAL */}
        {showRazorpayLoadingModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 mx-auto flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
              </div>
              <h3 className="font-extrabold text-sm text-udemy-dark">Connecting to Razorpay</h3>
              <p className="text-xs text-gray-500">
                Opening Razorpay TLS 1.3 official payment modal...
              </p>
              <div className="pt-2 flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRazorpayLoadingModal(false);
                    setIsProcessing(false);
                    const link = selectedGateway?.paymentLink || selectedGateway?.payment_link || 'https://razorpay.me/@ITPracticeTests';
                    setActivePaymentLink(link);
                    setShowPaymentLinkModal(true);
                  }}
                  className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
                >
                  Switch to Razorpay Payment Link / Test Simulation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRazorpayLoadingModal(false);
                    setIsProcessing(false);
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. OFFICIAL PAYPAL MODAL */}
        {showPaypalModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0">
              <div className="bg-[#003087] text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="font-extrabold italic text-xl tracking-tight text-white">
                    Pay<span className="text-[#0079C1]">Pal</span>
                  </span>
                  <span className="text-white/60 text-xs">|</span>
                  <span className="text-xs font-semibold text-white/90">Official Express Checkout</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaypalModal(false);
                    setPaymentError('PayPal checkout window was closed. Course access was NOT granted.');
                  }}
                  className="text-white/70 hover:text-white text-sm font-bold p-1 rounded transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Merchant Payee:</span>
                    <span className="font-bold text-slate-900">ITPracticeTests Online Education</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Student Email:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                      {customerEmail || currentUser?.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-800 font-bold">Total Amount:</span>
                    <span className="text-lg font-black text-[#003087]">${totalUSD} USD</span>
                  </div>
                </div>

                <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-center space-x-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#003087] shrink-0" />
                  <span>Official PayPal Smart Checkout. Click the yellow button below to pay securely with your PayPal account or card.</span>
                </div>

                <div id="paypal-modal-button-container" className="min-h-[140px] relative z-10 flex flex-col justify-center" />

                {!paypalSdkLoaded && (
                  <div className="flex flex-col items-center justify-center py-4 text-xs text-gray-500 space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#003087]" />
                    <span className="font-medium">Connecting to PayPal Global Gateway...</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <a
                    href={`https://paypal.me/${selectedGateway?.paypalMe || 'ExpertsTeachers'}/${totalUSD}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-2 bg-[#0079C1] hover:bg-[#00457C] text-white font-extrabold text-xs py-2.5 rounded-xl transition shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Pay via Official PayPal.Me Link (${totalUSD} USD)</span>
                  </a>
                </div>

                <div className="flex items-center justify-between pt-2 text-[11px] border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaypalModal(false);
                      setPaymentError('PayPal checkout was cancelled. No payment was deducted and course access was NOT granted.');
                    }}
                    className="text-gray-500 hover:text-black hover:underline cursor-pointer"
                  >
                    Cancel and return
                  </button>
                  <span className="text-gray-400 text-[10px]">Verified 256-Bit SSL</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. OFFICIAL CASHFREE PAYMENTS MODAL */}
        {showCashfreeModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0">
              <div className="bg-[#0A102E] text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center font-black text-xs text-slate-900">
                    CF
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-white">Cashfree Payments</h3>
                    <p className="text-[10px] text-amber-300">Seamless Drop Checkout SDK</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCashfreeModal(false);
                    setPaymentError('Cashfree payment window was closed. Course access was NOT granted.');
                  }}
                  className="text-white/70 hover:text-white text-sm font-bold p-1 rounded transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">App ID:</span>
                    <span className="font-mono text-slate-700 font-bold">1364819627b5910d9f1b9fb87799184631</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Payable Amount:</span>
                    <span className="text-base font-black text-purple-700">₹{totalINR}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 text-xs font-bold">
                  {['upi', 'card', 'netbanking'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setCashfreeTab(tab)}
                      className={`flex-1 py-2 text-center capitalize border-b-2 cursor-pointer transition ${
                        cashfreeTab === tab
                          ? 'border-purple-600 text-purple-700'
                          : 'border-transparent text-gray-500 hover:text-black'
                      }`}
                    >
                      {tab === 'upi' ? 'UPI' : tab === 'card' ? 'Cards' : 'NetBanking'}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                {cashfreeTab === 'upi' && (
                  <div className="space-y-3 text-xs">
                    <label className="block font-bold text-slate-700">UPI ID / VPA</label>
                    <input
                      type="text"
                      value={cashfreeUpiId}
                      onChange={(e) => setCashfreeUpiId(e.target.value)}
                      placeholder="e.g. mobileNumber@upi"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                    />
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['@okhdfcbank', '@okaxis', '@oksbi', '@paytm'].map((h, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCashfreeUpiId(prev => (prev.split('@')[0] || 'yourname') + h)}
                          className="bg-slate-100 hover:bg-slate-200 text-[10px] font-mono px-2 py-1 rounded cursor-pointer"
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {cashfreeTab === 'card' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        value={cashfreeCardNumber}
                        onChange={(e) => setCashfreeCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        placeholder="4532 •••• •••• 8821"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Expiry</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cashfreeCardExpiry}
                          onChange={(e) => setCashfreeCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-mono focus:outline-none focus:ring-1 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cashfreeCardCvv}
                          onChange={(e) => setCashfreeCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-mono focus:outline-none focus:ring-1 focus:ring-purple-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {cashfreeTab === 'netbanking' && (
                  <div className="space-y-3 text-xs">
                    <label className="block font-bold text-slate-700">Select Bank</label>
                    <select
                      value={cashfreeBank}
                      onChange={(e) => setCashfreeBank(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 font-medium"
                    >
                      <option>HDFC Bank</option>
                      <option>State Bank of India</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                      <option>Punjab National Bank</option>
                    </select>
                    <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      🔒 You will be securely redirected to <strong>{cashfreeBank}</strong> to authorize payment. Course access will unlock immediately once your bank confirms transaction completion.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCashfreeModalSubmit}
                  className="w-full bg-[#0A102E] hover:bg-slate-900 text-white font-extrabold text-xs py-3 rounded-xl shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>
                    {cashfreeTab === 'netbanking'
                      ? `Authorize ₹${totalINR} via ${cashfreeBank}`
                      : `Pay ₹${totalINR} via Cashfree`}
                  </span>
                </button>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCashfreeModal(false);
                      setPaymentError('Cashfree payment cancelled. Course access was NOT granted.');
                    }}
                    className="text-gray-500 hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                  <span className="text-gray-400 text-[10px]">Encrypted by Cashfree Payments</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. OFFICIAL PAYU BIZ INDIA MODAL */}
        {showPayuModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0">
              <div className="bg-[#1A1F2C] text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-xs text-white">
                    PayU
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-white">PayU Biz India</h3>
                    <p className="text-[10px] text-emerald-300">256-Bit SSL Bolt Gateway</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPayuModal(false);
                    setPaymentError('PayU payment session was closed. Course access was NOT granted.');
                  }}
                  className="text-white/70 hover:text-white text-sm font-bold p-1 rounded transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Merchant Key:</span>
                    <span className="font-mono text-emerald-800 font-bold">aMpf5U</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Customer:</span>
                    <span className="text-slate-800 font-semibold">{customerEmail || currentUser?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Amount:</span>
                    <span className="text-base font-black text-emerald-700">₹{totalINR}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 text-xs font-bold">
                  {['upi', 'card', 'netbanking'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setPayuTab(tab)}
                      className={`flex-1 py-2 text-center capitalize border-b-2 cursor-pointer transition ${
                        payuTab === tab
                          ? 'border-emerald-600 text-emerald-700'
                          : 'border-transparent text-gray-500 hover:text-black'
                      }`}
                    >
                      {tab === 'upi' ? 'UPI' : tab === 'card' ? 'Cards' : 'NetBanking'}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                {payuTab === 'upi' && (
                  <div className="space-y-3 text-xs">
                    <label className="block font-bold text-slate-700">Virtual Payment Address (VPA)</label>
                    <input
                      type="text"
                      value={payuUpiId}
                      onChange={(e) => setPayuUpiId(e.target.value)}
                      placeholder="e.g. mobile@paytm"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                )}

                {payuTab === 'card' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Credit / Debit Card</label>
                      <input
                        type="text"
                        maxLength={19}
                        value={payuCardNumber}
                        onChange={(e) => setPayuCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        placeholder="•••• •••• •••• 9812"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Expiry</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={payuCardExpiry}
                          onChange={(e) => setPayuCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={payuCardCvv}
                          onChange={(e) => setPayuCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {payuTab === 'netbanking' && (
                  <div className="space-y-3 text-xs">
                    <label className="block font-bold text-slate-700">Bank Selection</label>
                    <select
                      value={payuBank}
                      onChange={(e) => setPayuBank(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
                    >
                      <option>State Bank of India</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Bank of Baroda</option>
                    </select>
                    <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      🔒 You will be securely connected to <strong>{payuBank}</strong> via 256-bit encrypted banking portal. Course access will unlock once payment is confirmed.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePayuModalSubmit}
                  className="w-full bg-[#1A1F2C] hover:bg-black text-white font-extrabold text-xs py-3 rounded-xl shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>
                    {payuTab === 'netbanking'
                      ? `Authorize ₹${totalINR} via ${payuBank}`
                      : `Authorize ₹${totalINR} on PayU`}
                  </span>
                </button>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPayuModal(false);
                      setPaymentError('PayU payment was cancelled. Course access was NOT granted.');
                    }}
                    className="text-gray-500 hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                  <span className="text-gray-400 text-[10px]">Secured by PayU Payments</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. OFFICIAL CCAVENUE MODAL */}
        {showCcavenueModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0">
              <div className="bg-[#0b2447] text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center font-black text-xs text-slate-900">
                    CCA
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-white">CCAvenue Multi-Currency</h3>
                    <p className="text-[10px] text-amber-300">Merchant ID: 4472256</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCcavenueModal(false);
                    setPaymentError('CCAvenue payment was closed. Course access was NOT granted.');
                  }}
                  className="text-white/70 hover:text-white text-sm font-bold p-1 rounded transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Session Ref:</span>
                    <span className="font-mono text-slate-700 font-bold">{pendingOrderInfo?.orderId || `ITPT-${orderSessionRef}`}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Payable Amount:</span>
                    <span className="text-base font-black text-blue-700">{formatPrice(totalINR, totalUSD)}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 text-xs font-bold">
                  {['cards', 'netbanking', 'upi'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setCcavenueTab(tab)}
                      className={`flex-1 py-2 text-center capitalize border-b-2 cursor-pointer transition ${
                        ccavenueTab === tab
                          ? 'border-blue-600 text-blue-700'
                          : 'border-transparent text-gray-500 hover:text-black'
                      }`}
                    >
                      {tab === 'cards' ? 'Debit/Credit Cards' : tab === 'netbanking' ? 'NetBanking' : 'UPI / RuPay'}
                    </button>
                  ))}
                </div>

                {/* Card Tab */}
                {ccavenueTab === 'cards' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        value={ccavenueCardNumber}
                        onChange={(e) => setCcavenueCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        placeholder="•••• •••• •••• 3412"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Expiry</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={ccavenueCardExpiry}
                          onChange={(e) => setCcavenueCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={ccavenueCardCvv}
                          onChange={(e) => setCcavenueCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {ccavenueTab === 'netbanking' && (
                  <div className="space-y-3 text-xs">
                    <label className="block font-bold text-slate-700">Bank</label>
                    <select
                      value={ccavenueBank}
                      onChange={(e) => setCcavenueBank(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                    >
                      <option>HDFC Bank</option>
                      <option>State Bank of India</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                    </select>
                    <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      🔒 You will be securely connected to <strong>{ccavenueBank}</strong> NetBanking to complete payment. Course access will unlock once payment is confirmed.
                    </p>
                  </div>
                )}

                {ccavenueTab === 'upi' && (
                  <div className="space-y-3 text-xs">
                    <label className="block font-bold text-slate-700">UPI ID / VPA</label>
                    <input
                      type="text"
                      placeholder="e.g. user@okhdfcbank"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCcavenueModalSubmit}
                  className="w-full bg-[#0b2447] hover:bg-blue-950 text-white font-extrabold text-xs py-3 rounded-xl shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>
                    {ccavenueTab === 'netbanking'
                      ? `Authorize Payment via ${ccavenueBank}`
                      : 'Authorize Payment via CCAvenue'}
                  </span>
                </button>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCcavenueModal(false);
                      setPaymentError('CCAvenue payment was cancelled. Course access was NOT granted.');
                    }}
                    className="text-gray-500 hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                  <span className="text-gray-400 text-[10px]">CCAvenue 256-Bit SSL</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. OFFICIAL UPI MODAL */}
        {showUpiModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0 text-center">
              <div className="bg-purple-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-left">
                  <QrCode className="w-5 h-5 text-purple-300" />
                  <div>
                    <h3 className="font-extrabold text-xs text-white">Direct UPI Payment</h3>
                    <p className="text-[10px] text-purple-200">Google Pay • PhonePe • Paytm • BHIM</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpiModal(false);
                    setPaymentError('UPI payment was cancelled. Course access was NOT granted.');
                  }}
                  className="text-white/70 hover:text-white text-sm font-bold p-1 rounded transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-center">
                <p className="text-xs text-slate-600">
                  Scan this QR code with any UPI app to pay <strong>₹{upiAmount}</strong>.
                </p>

                {qrCodeDataUrl ? (
                  <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl shadow-xs inline-block mx-auto">
                    <img src={qrCodeDataUrl} alt="UPI Payment QR Code" className="w-48 h-48 mx-auto" />
                    <span className="text-[11px] font-mono font-bold text-slate-700 mt-2">
                      {upiVpa}
                    </span>
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-slate-200 animate-pulse rounded-xl mx-auto" />
                )}

                <div className="flex items-center justify-center space-x-2 text-xs">
                  <span className="font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800 font-bold">
                    {upiVpa}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(upiVpa);
                      setCopiedVpa(true);
                      setTimeout(() => setCopiedVpa(false), 2000);
                    }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1.5 rounded-lg font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedVpa ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Enter 12-Digit UPI Reference / UTR Number:
                  </label>
                  <input
                    type="text"
                    value={upiUtrInput}
                    onChange={(e) => setUpiUtrInput(e.target.value.replace(/\D/g, ''))}
                    maxLength={16}
                    placeholder="e.g. 428190214812"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-500">
                    Once verified server-side with bank settlement records, your course unlocks immediately.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyUpiPayment}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify Settlement &amp; Unlock Access</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
