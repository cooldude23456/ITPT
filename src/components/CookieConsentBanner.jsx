import React, { useState, useEffect } from 'react';
import {
  Cookie,
  ShieldCheck,
  Check,
  Settings,
  X,
  ChevronDown,
  ChevronUp,
  Sliders,
  ExternalLink,
  Info
} from 'lucide-react';

const STORAGE_KEY = 'itpt_cookie_consent_preferences';

export default function CookieConsentBanner({ onNavigate }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: true,
    functional: true
  });

  // Check consent status on mount & listen for re-open requests
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Slight delay on initial load for a smooth, natural entrance
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setPreferences({
            necessary: true,
            analytics: parsed.analytics ?? true,
            functional: parsed.functional ?? true
          });
        }
      }
    } catch (e) {
      setIsVisible(true);
    }
  }, []);

  // Listen for custom event from footer "Cookie Settings"
  useEffect(() => {
    const handleOpen = () => {
      setIsCustomizing(true);
      setIsVisible(true);
    };
    window.addEventListener('itpt_open_cookie_preferences', handleOpen);
    return () => window.removeEventListener('itpt_open_cookie_preferences', handleOpen);
  }, []);

  const saveConsent = (prefs) => {
    const payload = {
      ...prefs,
      necessary: true,
      timestamp: new Date().toISOString(),
      version: '2026.1'
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('itpt_cookie_consent_updated', { detail: payload }));
    setIsVisible(false);
    setIsCustomizing(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, analytics: true, functional: true });
  };

  const handleEssentialOnly = () => {
    saveConsent({ necessary: true, analytics: false, functional: false });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto sm:max-w-xl z-[9999] animate-in fade-in slide-in-from-bottom-8 duration-500"
    >
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-purple-500/30 text-white rounded-2xl shadow-2xl shadow-purple-950/40 p-5 sm:p-6 space-y-4 ring-1 ring-white/10">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/30 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-inner">
              <Cookie className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center space-x-2">
                <span>Cookie &amp; Privacy Preferences</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                  GDPR / DPDP
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                We respect your personal data and learning journey.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEssentialOnly}
            aria-label="Close and use essential only"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition shrink-0"
            title="Reject non-essential cookies"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative text */}
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>ITPracticeTests.com</strong> uses cookies to ensure our secure exam simulator runs seamlessly, maintain active student accounts, remember practice quiz progress, and process zero-trust verified checkouts.
        </p>

        {/* Expandable Customization Panel */}
        {isCustomizing && (
          <div className="space-y-3 pt-2 border-t border-slate-800 animate-in fade-in duration-300">
            {/* 1. Necessary (Strictly required) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-xs text-white flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Strictly Essential (Required)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Required for user login sessions, practice test answers, security tokens, and payment processing.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                Always Active
              </span>
            </div>

            {/* 2. Analytics / Performance */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-xs text-white flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>Performance &amp; Diagnostics</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Helps us analyze question completion rates and optimize website speed anonymously.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* 3. Functional / Experience */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-xs text-white flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>Preferences &amp; User Experience</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Saves your preferred currency (INR / USD), question filter states, and timer alerts.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400 order-2 sm:order-1">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('privacy')}
              className="hover:text-purple-300 underline underline-offset-2 transition"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('terms')}
              className="hover:text-purple-300 underline underline-offset-2 transition"
            >
              Terms of Service
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 order-1 sm:order-2 justify-end">
            <button
              type="button"
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="text-xs text-slate-300 hover:text-white px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 font-semibold transition flex items-center space-x-1"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>{isCustomizing ? 'Hide Options' : 'Preferences'}</span>
              {isCustomizing ? (
                <ChevronUp className="w-3 h-3 ml-0.5" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-0.5" />
              )}
            </button>

            {isCustomizing ? (
              <button
                type="button"
                onClick={handleSaveCustom}
                className="text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-4 py-2 rounded-xl shadow-md transition flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Preferences</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className="text-xs text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold transition"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold px-4 py-2 rounded-xl shadow-lg shadow-purple-900/30 transition flex items-center space-x-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept All</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
