import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function AuthModal({ onLoginSuccess, onNavigate }) {
  const {
    authModalOpen,
    authModalTab,
    setAuthModalTab,
    closeAuthModal,
    loginUser,
    registerUser
  } = useApp();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  if (!authModalOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    const res = loginUser({ email, password });
    if (res.success) {
      setSuccessMessage(`Welcome back, ${res.user.name}!`);
      setTimeout(() => {
        closeAuthModal();
        if (onLoginSuccess) onLoginSuccess(res.user);
      }, 700);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name || !email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    const res = registerUser({ name, email, password, phone, role: 'student' });
    if (res.success) {
      setSuccessMessage(`Account created successfully! Welcome to ITPracticeTests, ${res.user.name}.`);
      setTimeout(() => {
        closeAuthModal();
        if (onLoginSuccess) onLoginSuccess(res.user);
      }, 900);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-udemy-border overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-gray-500 hover:text-black transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Header with Logo & Tabs */}
        <div className="bg-[#f7f9fa] border-b border-udemy-border p-6 text-center space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <span className="font-extrabold text-xl tracking-tight text-udemy-dark">
              ITPractice<span className="text-purple-600">Tests</span>
            </span>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
              .com
            </span>
          </div>

          <p className="text-xs text-gray-500">
            {authModalTab === 'login'
              ? 'Log in to continue your certification prep and practice tests'
              : 'Sign up to unlock lifetime access to practice tests and courses'}
          </p>

          {/* Tab Switcher */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold mt-2">
            <button
              onClick={() => {
                setAuthModalTab('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 rounded-lg transition ${
                authModalTab === 'login'
                  ? 'bg-white text-purple-900 shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setAuthModalTab('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 rounded-lg transition ${
                authModalTab === 'register'
                  ? 'bg-white text-purple-900 shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Sign Up (Register)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOG IN FORM */}
          {authModalTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-udemy-dark focus:bg-white focus:outline-none focus:border-purple-600"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset simulation: Instructions dispatched to ' + (email || 'your email'))}
                    className="text-[11px] font-semibold text-purple-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg pl-9 pr-9 py-2 text-xs text-udemy-dark focus:bg-white focus:outline-none focus:border-purple-600"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Remember me on this browser</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold py-2.5 rounded-lg shadow-sm transition flex items-center justify-center space-x-1.5"
              >
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* SIGN UP / REGISTER FORM */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-udemy-dark focus:bg-white focus:outline-none focus:border-purple-600"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-udemy-dark focus:bg-white focus:outline-none focus:border-purple-600"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Phone / WhatsApp (Optional)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+91-9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-udemy-dark focus:bg-white focus:outline-none focus:border-purple-600"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg pl-9 pr-9 py-2 text-xs text-udemy-dark focus:bg-white focus:outline-none focus:border-purple-600"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 pt-1">
                By registering, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => {
                    closeAuthModal();
                    if (onNavigate) onNavigate('terms');
                  }}
                  className="text-purple-700 underline font-semibold hover:text-purple-900"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => {
                    closeAuthModal();
                    if (onNavigate) onNavigate('privacy');
                  }}
                  className="text-purple-700 underline font-semibold hover:text-purple-900"
                >
                  Privacy Policy
                </button>
                .
              </div>

              <button
                type="submit"
                className="w-full bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold py-2.5 rounded-lg shadow-sm transition flex items-center justify-center space-x-1.5"
              >
                <span>Create Student Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Social login simulation */}
          <div className="pt-2 text-center">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[11px] text-gray-400 font-semibold uppercase">
                Or Continue With
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  registerUser({
                    name: 'Google Learner',
                    email: `google_${Date.now()}@example.com`,
                    password: 'pass',
                    role: 'student'
                  });
                  setSuccessMessage('Authenticated with Google successfully!');
                  setTimeout(() => closeAuthModal(), 600);
                }}
                className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition"
              >
                <span className="font-bold text-red-500">G</span>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  registerUser({
                    name: 'GitHub Dev',
                    email: `github_${Date.now()}@example.com`,
                    password: 'pass',
                    role: 'student'
                  });
                  setSuccessMessage('Authenticated with GitHub successfully!');
                  setTimeout(() => closeAuthModal(), 600);
                }}
                className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition"
              >
                <span className="font-bold text-slate-900">🐙</span>
                <span>GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
