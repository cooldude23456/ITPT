import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Award,
  Lock,
  CreditCard,
  Zap,
  Shield,
  FileCheck,
  CheckCircle2,
  RotateCcw,
  Cookie
} from 'lucide-react';
import SocialLinksBar from './SocialLinks';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-[#121315] text-slate-200 pt-16 pb-12 border-t-2 border-purple-600 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ======================================================== */}
        {/* 1. TOP VALUE PROPOSITION BANNER (Large & Readable) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-10 border-b border-slate-800">
          <div className="flex items-start space-x-3.5 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="font-bold text-base text-white">Udemy Top Instructor</div>
              <p className="text-sm text-slate-300 mt-1 leading-snug">
                Curated by Yogesh Dhiman with 48,000+ satisfied learners globally.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-base text-white">100% Verified Explanations</div>
              <p className="text-sm text-slate-300 mt-1 leading-snug">
                In-depth choice-by-choice breakdowns with official documentation links.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="font-bold text-base text-white">Lifetime Access & Updates</div>
              <p className="text-sm text-slate-300 mt-1 leading-snug">
                Free updates for 2026 exam revisions with unlimited simulation retakes.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="font-bold text-base text-white">100% Safe & Secure</div>
              <p className="text-sm text-slate-300 mt-1 leading-snug">
                Bank-grade 256-bit encryption with instant automated access.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. 100% SAFE PAYMENTS & RECOGNIZED PAYMENT LOGOS TRUST BOX */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1a1c23] to-slate-900 border-2 border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left: Security Guarantee Message */}
            <div className="space-y-3 text-center lg:text-left flex-1">
              <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>100% Safe & Secure Checkout Guaranteed</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Bank-Grade 256-Bit SSL Encrypted Payments
              </h3>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                All transactions are processed through RBI-licensed and globally certified payment aggregators including <strong>Razorpay</strong>, <strong>Cashfree</strong>, <strong>CCAvenue</strong>, and <strong>PayPal</strong>. Your financial information is end-to-end encrypted. We never store credit/debit card numbers or UPI PINs.
              </p>
              {/* Trust Badges Row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-1 text-xs text-slate-300 font-bold">
                <button
                  onClick={() => onNavigate('refund')}
                  className="flex items-center space-x-1.5 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/60 hover:border-emerald-400 transition cursor-pointer shadow-sm group"
                  title="Click to read our 100% 30-Day Money-Back Guarantee Refund Policy"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-400 group-hover:-rotate-45 transition-transform" />
                  <span className="font-extrabold text-emerald-300">30-Day Money-Back Guarantee</span>
                </button>
                <span className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>PCI-DSS Level 1 Certified</span>
                </span>
                <span className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                  <Lock className="w-4 h-4 text-blue-400" />
                  <span>TLS 1.3 / 256-Bit SSL Encryption</span>
                </span>
                <span className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Instant Exam Activation</span>
                </span>
                <span className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                  <FileCheck className="w-4 h-4 text-purple-400" />
                  <span>Official GST Tax Invoice</span>
                </span>
              </div>
            </div>

            {/* Right: Crisp, Authentic Payment Logos Grid */}
            <div className="shrink-0 flex flex-col items-center lg:items-end space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Payment Methods Accepted
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                {/* 1. UPI */}
                <div className="h-10 px-3 bg-white rounded-lg flex items-center justify-center shadow-sm hover:scale-105 transition cursor-default" title="UPI (Unified Payments Interface)">
                  <svg className="h-6 w-auto" viewBox="0 0 100 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5L20 20L12 35H3L11 20L3 5H12Z" fill="#097939" />
                    <path d="M21 5L29 20L21 35H12L20 20L12 5H21Z" fill="#ED752E" />
                    <text x="34" y="25" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="20" fill="#000">UPI</text>
                  </svg>
                </div>

                {/* 2. Google Pay */}
                <div className="h-10 px-3 bg-white rounded-lg flex items-center justify-center shadow-sm hover:scale-105 transition cursor-default" title="Google Pay (GPay)">
                  <span className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center space-x-0.5">
                    <span className="text-blue-600 font-black">G</span>
                    <span className="text-gray-700 font-bold">Pay</span>
                  </span>
                </div>

                {/* 3. PhonePe */}
                <div className="h-10 px-3 bg-[#5f259f] rounded-lg flex items-center justify-center shadow-sm hover:scale-105 transition cursor-default" title="PhonePe">
                  <span className="text-white font-extrabold text-xs tracking-wide">PhonePe</span>
                </div>

                {/* 4. Paytm */}
                <div className="h-10 px-3 bg-white rounded-lg flex items-center justify-center shadow-sm hover:scale-105 transition cursor-default" title="Paytm">
                  <span className="text-[#002e6e] font-extrabold text-sm tracking-tighter">
                    Pay<span className="text-[#00baf2]">tm</span>
                  </span>
                </div>

                {/* 5. Visa */}
                <div className="h-10 px-3 bg-white rounded-lg flex items-center justify-center shadow-sm hover:scale-105 transition cursor-default" title="Visa">
                  <span className="font-black italic text-base text-[#1a1f71] tracking-wider">VISA</span>
                </div>

                {/* 6. Mastercard */}
                <div className="h-10 px-3 bg-[#22252a] rounded-lg flex items-center justify-center shadow-sm hover:scale-105 transition cursor-default" title="Mastercard">
                  <div className="flex items-center -space-x-2">
                    <div className="w-5 h-5 rounded-full bg-[#eb001b]" />
                    <div className="w-5 h-5 rounded-full bg-[#f79e1b] opacity-90" />
                  </div>
                </div>

                {/* 7. RuPay */}
                <div className="h-10 px-3 bg-white rounded-lg flex items-center justify-center shadow-sm hover:scale-105 transition cursor-default" title="RuPay">
                  <span className="font-extrabold text-xs text-[#092e6b]">
                    Ru<span className="text-[#f37021]">Pay</span>
                  </span>
                </div>

                {/* 8. PayPal */}
                <div className="h-10 px-3 bg-white rounded-lg flex items-center justify-center shadow-sm hover:scale-105 transition cursor-default" title="PayPal">
                  <span className="font-extrabold italic text-sm text-[#003087]">
                    Pay<span className="text-[#0079c1]">Pal</span>
                  </span>
                </div>

                {/* 9. Amex */}
                <div className="h-10 px-3 bg-[#016fd0] rounded-lg flex items-center justify-center shadow-sm hover:scale-105 transition cursor-default" title="American Express">
                  <span className="font-black text-[11px] text-white tracking-widest">AMEX</span>
                </div>

                {/* 10. Net Banking */}
                <div className="h-10 px-3 bg-slate-800 text-white border border-slate-700 rounded-lg flex items-center justify-center space-x-1 shadow-sm hover:scale-105 transition cursor-default" title="All Indian Net Banking Supported">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-[10px]">NetBanking</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">
                Gateways: <strong>Razorpay</strong> • <strong>Cashfree</strong> • <strong>CCAvenue</strong> • <strong>PayU</strong>
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. MAIN NAVIGATION & INFORMATION COLUMNS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pt-4 pb-8 border-b border-slate-800">
          {/* Col 1: Brand & Lead Instructor (Span 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-2xl md:text-3xl tracking-tight text-white">
                ITPractice<span className="text-purple-400">Tests</span>
              </span>
              <span className="text-xs bg-purple-900 text-purple-200 border border-purple-500/40 font-bold px-2 py-0.5 rounded">
                .com
              </span>
            </div>

            <p className="text-sm md:text-base text-slate-300 leading-relaxed pr-4">
              <strong>ITPracticeTests.com</strong> (formerly <span className="text-white font-semibold">ExpertsTeachers</span>) is India's leading IT exam-preparation community. We provide affordable, high-yield practice tests, technical interview questions, and direct-to-consumer online courses for students, software engineers, and IT professionals worldwide.
            </p>

            {/* Instructor Box */}
            <div className="pt-2 bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 text-white font-extrabold text-sm flex items-center justify-center border-2 border-purple-400 shadow-md shrink-0 tracking-wider select-none">
                  YD
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white">Curated by Yogesh Dhiman</div>
                  <div className="text-xs text-purple-300 font-semibold">
                    Senior Cloud Solutions Architect & Lead Instructor
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => onNavigate('catalog')}
                  className="inline-flex items-center space-x-2 bg-purple-700 hover:bg-purple-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <span>Browse All Practice Tests</span>
                </button>
              </div>
            </div>
          </div>

          {/* Col 2: Top Practice Tests */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-purple-500/40 pb-2">
              Top Practice Tests
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'certifications', 'AWS')}
                  className="hover:text-purple-300 hover:underline transition text-left"
                >
                  AWS Solutions Architect (SAA-C03)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'certifications', 'Microsoft')}
                  className="hover:text-purple-300 hover:underline transition text-left"
                >
                  Microsoft Azure Security (AZ-500)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'certifications', 'Microsoft')}
                  className="hover:text-purple-300 hover:underline transition text-left"
                >
                  Microsoft Fabric Analytics (DP-600)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'certifications', 'CompTIA')}
                  className="hover:text-purple-300 hover:underline transition text-left"
                >
                  CompTIA SecurityX (CAS-005)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'certifications', 'Kubernetes')}
                  className="hover:text-purple-300 hover:underline transition text-left"
                >
                  Kubernetes CKA & CKAD Certified
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'certifications', 'Databricks')}
                  className="hover:text-purple-300 hover:underline transition text-left"
                >
                  Databricks Certified Data Engineer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'certifications', 'Google')}
                  className="hover:text-purple-300 hover:underline transition text-left"
                >
                  Google Cloud Professional Data Engineer
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Interview Q&A & Courses */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-purple-500/40 pb-2">
              Interview & Learning
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate('interviews')}
                  className="hover:text-purple-300 hover:underline transition text-left"
                >
                  Selenium Java Technical Interview Prep
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('interviews')}
                  className="hover:text-purple-300 hover:underline transition text-left"
                >
                  600+ Core Java Developer Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('interviews')}
                  className="hover:text-purple-300 hover:underline transition text-left"
                >
                  Playwright with TypeScript Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('interviews')}
                  className="hover:text-purple-300 hover:underline transition text-left"
                >
                  Python Data Science & SQL Tests
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'free')}
                  className="hover:text-purple-300 hover:underline transition text-left font-bold text-amber-300"
                >
                  Free AZ-900 Mock Diagnostic Exam
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'courses')}
                  className="hover:text-purple-300 hover:underline transition text-left"
                >
                  All Video Masterclasses & Notes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('instructor')}
                  className="hover:text-purple-300 hover:underline transition text-left"
                >
                  Instructor Creator Hub & Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('blogs')}
                  className="hover:text-purple-300 hover:underline transition text-left font-bold text-emerald-400"
                >
                  📰 Tech Blogs &amp; SEO Exam Guides
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Registered Office & Direct Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-purple-500/40 pb-2">
              Registered Office & Support
            </h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <strong className="text-white">ITPracticeTests Head Office:</strong>
                  <br />
                  Office No. 715, Seventh Floor, Block D&amp;E,
                  <br />
                  Chandigarh Citi Center, VIP Road,
                  <br />
                  Zirakpur, Punjab, India – 140603
                </div>
              </div>

              <div className="flex items-center space-x-2.5 pt-1">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <strong className="text-white">GSTIN:</strong> 03AKXPD3010G1ZM
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                <a
                  href="mailto:support@itpracticetests.com"
                  className="hover:text-white hover:underline transition font-medium"
                >
                  support@itpracticetests.com
                </a>
              </div>

              <div className="flex items-center space-x-2.5">
                <Phone className="w-5 h-5 text-amber-400 shrink-0" />
                <a
                  href="tel:+919253330335"
                  className="hover:text-white hover:underline transition font-medium"
                >
                  +91-9253330335 (Phone/WhatsApp)
                </a>
              </div>

              <div className="flex items-center space-x-2.5 text-xs text-slate-400">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Mon–Sat: 9:00 AM – 6:00 PM IST (Online Portal 24/7)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3.5. OFFICIAL SOCIAL MEDIA CHANNELS (All 10 Platforms) */}
        {/* ======================================================== */}
        <div className="py-6 border-b border-slate-800">
          <SocialLinksBar variant="footer" />
        </div>

        {/* ======================================================== */}
        {/* 4. BOTTOM COPYRIGHT & LEGAL BAR (Readable & High Contrast) */}
        {/* ======================================================== */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-300 gap-4">
          <p
            onDoubleClick={() => onNavigate('admin')}
            className="text-center sm:text-left leading-relaxed select-none cursor-default"
            title=""
          >
            © 2026 <strong>ITPracticeTests.com</strong> (formerly ExpertsTeachers). All rights reserved. Registered in Punjab, India.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold">
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-white hover:underline transition"
            >
              Contact Us
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-white hover:underline transition"
            >
              About Us
            </button>
            <button
              onClick={() => onNavigate('blogs')}
              className="hover:text-white hover:underline transition text-purple-300 font-semibold"
            >
              Blogs &amp; Exam Guides
            </button>
            <button
              onClick={() => onNavigate('privacy')}
              className="hover:text-white hover:underline transition"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="hover:text-white hover:underline transition"
            >
              Terms of Service
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('itpt_open_cookie_preferences'))}
              className="hover:text-white hover:underline transition flex items-center space-x-1"
              title="Manage Cookie and Privacy Preferences"
            >
              <Cookie className="w-3.5 h-3.5 text-amber-400" />
              <span>Cookie Settings</span>
            </button>
            <button
              onClick={() => onNavigate('refund')}
              className="text-emerald-400 hover:text-emerald-300 font-extrabold transition flex items-center space-x-1.5 underline decoration-emerald-500 underline-offset-4 hover:decoration-emerald-300"
              title="Read our 30-Day Money-Back Guarantee Refund Policy"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>30-Day Money-Back Guarantee</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
