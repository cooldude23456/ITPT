import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import CourseCard from '../components/CourseCard';
import {
  Award,
  Sparkles,
  CheckCircle,
  PlayCircle,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowRight,
  Star,
  Users,
  BookOpen,
  GraduationCap,
  Layers,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export default function HomePage({ onSelectProduct, onTakeTest, onNavigateCategory }) {
  const { products, formatPrice, currency } = useApp();
  const [activeTab, setActiveTab] = useState('all');

  // Filtered by selected ribbon tab
  const tabProducts = products.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'AWS') return p.vendor === 'AWS';
    if (activeTab === 'Microsoft') return p.vendor === 'Microsoft';
    if (activeTab === 'CompTIA') return p.vendor === 'CompTIA';
    if (activeTab === 'Kubernetes') return p.vendor === 'Kubernetes';
    if (activeTab === 'interviews') return p.category === 'interviews';
    if (activeTab === 'courses') return p.category === 'courses';
    if (activeTab === 'free') return p.isFree;
    return true;
  });

  const bestsellers = products.filter(p => p.isBestseller).slice(0, 8);
  const freeTests = products.filter(p => p.isFree);

  // Dynamic Featured Diagnostic Mock Test (reactive to Admin Panel updates)
  const featuredDiagnostic = products.find(p => p.id === 'free-az900-diagnostic') ||
    products.find(p => p.title.toLowerCase().includes('az-900') && (p.isFree || p.priceINR === 0)) ||
    products.find(p => p.isFree || p.priceINR === 0) || {
      id: 'free-az900-diagnostic',
      title: 'Microsoft Azure Fundamentals (AZ-900) Mini Mock Test',
      vendor: 'Microsoft',
      category: 'certifications',
      isFree: true,
      priceINR: 0,
      priceUSD: 0,
      passingScore: 70,
      durationMinutes: 45,
      questionsCount: 50,
      badge: 'Featured Free Exam',
      highlights: [
        'Cloud Concepts & Architectural Components',
        'Microsoft Entra ID, Governance & Security',
        'Comprehensive answer explanations & docs citations'
      ]
    };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* 1. Udemy-Style Hero Banner Carousel Section */}
      <section className="bg-gradient-to-r from-slate-900 via-[#1c1d1f] to-purple-950 text-white relative overflow-hidden py-12 md:py-20 px-4">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Text Block */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center space-x-2 bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Udemy Top-Rated Instructor Platform • 2026 Updated Blueprint</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Master IT Certifications &amp; <br className="hidden sm:inline" />
              Technical Interviews with Confidence.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Authentic, full-length practice tests curated by <strong className="text-white">Yogesh Dhiman</strong>. Master AWS, Azure, CompTIA, Google Cloud, and Kubernetes with realistic exam simulations, verified answer explanations, and unlimited retakes.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateCategory('all')}
                className="bg-udemy-purple hover:bg-udemy-purple-hover text-white font-extrabold px-6 py-3.5 rounded-lg text-sm transition shadow-lg flex items-center space-x-2"
              >
                <span>Browse 160+ Practice Tests</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onTakeTest(featuredDiagnostic)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-5 py-3.5 rounded-lg text-sm transition flex items-center space-x-2 backdrop-blur-sm"
              >
                <PlayCircle className="w-4 h-4 text-emerald-400" />
                <span>Take Free Diagnostic Exam</span>
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-white">48,000+</div>
                <div className="text-slate-400 font-medium">Students Enrolled</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-white">160+</div>
                <div className="text-slate-400 font-medium">Exam Practice Tests</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-amber-400 flex items-center">
                  <span>4.8</span>
                  <Star className="w-4 h-4 ml-1 fill-current text-amber-400" />
                </div>
                <div className="text-slate-400 font-medium">Instructor Rating</div>
              </div>
            </div>
          </div>

          {/* Right Hero Card: Featured Diagnostic Test Box */}
          <div className="lg:col-span-5">
            <div className="bg-white text-udemy-dark rounded-2xl p-6 shadow-2xl border border-white/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {featuredDiagnostic.badge || 'Featured Free Exam'}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {featuredDiagnostic.isFree || featuredDiagnostic.priceINR === 0 ? '100% Free' : formatPrice(featuredDiagnostic.priceINR, featuredDiagnostic.priceUSD)}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-udemy-dark leading-snug">
                  {featuredDiagnostic.title}
                </h3>
                <p className="text-xs text-gray-500">
                  By Yogesh Dhiman • {featuredDiagnostic.questionsCount || 50} Exam Questions • {featuredDiagnostic.durationMinutes || featuredDiagnostic.timeLimitMins || 45} Mins • Instant Detailed Scorecard
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {(featuredDiagnostic.highlights && featuredDiagnostic.highlights.length > 0 ? featuredDiagnostic.highlights : [
                  'Cloud Concepts & Architectural Components',
                  'Microsoft Entra ID, Governance & Security',
                  'Comprehensive answer explanations & docs citations'
                ]).map((h, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onTakeTest(featuredDiagnostic)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg text-sm transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Start Free Exam Simulation Now</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Tabs Ribbon (Udemy-Style "Skills to transform your future") */}
      <section className="border-b border-udemy-border bg-white sticky top-18 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 shrink-0">
            Top Categories:
          </span>
          {[
            { id: 'all', label: 'All Practice Tests' },
            { id: 'AWS', label: 'AWS Certifications' },
            { id: 'Microsoft', label: 'Microsoft Azure' },
            { id: 'CompTIA', label: 'CompTIA & Security' },
            { id: 'Kubernetes', label: 'Kubernetes & CKA' },
            { id: 'interviews', label: 'IT Interview Prep' },
            { id: 'courses', label: 'Online Courses' },
            { id: 'free', label: 'Free Tests' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-udemy-dark text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Filtered Category Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-udemy-dark">
              {activeTab === 'all'
                ? 'Featured Practice Exams & Question Banks'
                : `${activeTab} Practice Tests & Study Resources`}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Over 160 authentic exams designed to prepare you for first-attempt success
            </p>
          </div>

          <button
            onClick={() => onNavigateCategory(activeTab)}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center space-x-1 shrink-0"
          >
            <span>Explore all in {activeTab === 'all' ? 'catalog' : activeTab}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tabProducts.slice(0, 8).map(product => (
            <CourseCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onTakeTest={onTakeTest}
            />
          ))}
        </div>
      </section>

      {/* 4. Instructor Spotlight: Yogesh Dhiman */}
      <section className="bg-[#f7f9fa] border-y border-udemy-border py-16 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-udemy-border p-8 md:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 text-white font-extrabold text-4xl flex items-center justify-center border-4 border-purple-600 shadow-xl tracking-wider select-none">
                YD
              </div>
              <span className="absolute bottom-1 right-2 bg-amber-400 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                Top Rated
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-xl text-udemy-dark">Yogesh Dhiman</h3>
              <p className="text-xs text-purple-700 font-bold">
                Bestselling Author & Senior Cloud Solutions Architect
              </p>
            </div>

            <div className="flex items-center space-x-4 text-xs font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <span className="flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                <span>4.8 Rating</span>
              </span>
              <span>•</span>
              <span>48,000+ Students</span>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded">
              Meet Your Lead Instructor & Examiner
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-udemy-dark leading-tight">
              Passionate about making IT certification prep rigorous, accessible, and affordable.
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Yogesh Dhiman has spent over a decade leading enterprise cloud architectures, designing resilient multi-tier infrastructures, and training engineering teams worldwide. On ITPracticeTests, Yogesh’s test series have helped tens of thousands of professionals pass Microsoft, AWS, CompTIA, Google Cloud, and Kubernetes examinations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Hands-on scenario questions that mirror actual Pearson VUE exam criteria</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verified answer explanations with citations to official cloud documentation</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Comprehensive IT interview questions for Java, QA Automation, and Python</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Direct student support, continuous 2026 syllabus updates, and community Q&A</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigateCategory('all')}
                className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-6 py-3 rounded-lg transition inline-flex items-center space-x-2 shadow-md cursor-pointer"
              >
                <span>Explore Yogesh's Practice Test Catalog</span>
                <BookOpen className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bestsellers Section (Udemy-Style) */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl md:text-2xl font-extrabold text-udemy-dark">
                Students Are Viewing & Passing With These Tests
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Highest rated practice exams across AWS, Azure, CompTIA, and IT Interviews
            </p>
          </div>
          <button
            onClick={() => onNavigateCategory('all')}
            className="text-xs font-bold text-purple-700 hover:underline hidden sm:block"
          >
            View All Bestsellers →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestsellers.map(product => (
            <CourseCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onTakeTest={onTakeTest}
            />
          ))}
        </div>
      </section>

      {/* 6. Why Choose ITPracticeTests Feature Matrix */}
      <section className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950 px-3 py-1 rounded-full border border-purple-800">
              The ITPracticeTests Advantage
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Why 48,000+ IT Professionals Trust Our Practice Exams
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              We focus on pedagogical accuracy, realistic exam pressures, and deep architectural comprehension.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-white">
                Detailed Explanations for EVERY Option
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We don’t just state the correct choice. We clearly analyze why distractors are wrong and provide direct citations to vendor documentation.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-white">
                Authentic Pearson VUE Exam Simulator
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Practice under realistic timed conditions with a countdown clock, question palette, flag for review, and pass/fail score calculations.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-white">
                Lifetime Access & Free Updates
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Certifications evolve continuously. When Microsoft or AWS update their objectives, our test banks are automatically revised at zero additional cost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Verified Student Testimonials */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-xl md:text-2xl font-extrabold text-udemy-dark">
            What Our Certified Students Say
          </h2>
          <p className="text-xs text-gray-500">
            Real feedback from candidates who passed their exams using ITPracticeTests
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Rohit Sharma',
              role: 'Cloud Architect, Bengaluru',
              cert: 'AWS Solutions Architect SAA-C03 (Scored 890/1000)',
              review:
                'Yogesh Dhiman’s practice tests are the closest thing to the actual AWS exam. The scenario-based questions tested real architecture trade-offs. The in-depth explanations saved me weeks of manual research.'
            },
            {
              name: 'Priya Sundaram',
              role: 'DevSecOps Specialist, Hyderabad',
              cert: 'Microsoft Azure Security AZ-500 (Passed)',
              review:
                'The multi-select questions and detailed breakdown of Microsoft Entra ID and Key Vault policies were spot on. The timed simulator prepared me to manage exam anxiety effortlessly.'
            },
            {
              name: 'David Miller',
              role: 'Lead QA Automation Engineer, London',
              cert: 'Selenium Java + Playwright Technical Interview',
              review:
                'I bought both the certification practice test and the Selenium Java interview pack. The talking points and code examples directly helped me clear my senior technical interview.'
            }
          ].map((t, idx) => (
            <div
              key={idx}
              className="bg-white border border-udemy-border rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{t.review}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-udemy-dark">{t.name}</h4>
                  <p className="text-[11px] text-gray-500">{t.role}</p>
                  <p className="text-[10px] text-purple-700 font-semibold">{t.cert}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Call to Action Banner */}
      <section className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Ready to pass your IT certification on the first attempt?
          </h2>
          <p className="text-xs md:text-sm text-purple-200">
            Join 48,000+ students preparing with Yogesh Dhiman. Practice tests starting from just ₹399 / $4.99 with full lifetime access.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => onNavigateCategory('all')}
              className="bg-white text-purple-900 hover:bg-slate-100 font-extrabold px-6 py-3 rounded-lg text-xs transition shadow-md"
            >
              Start Exploring Practice Tests
            </button>
            <button
              onClick={() => onTakeTest(featuredDiagnostic)}
              className="bg-purple-950/60 border border-purple-400/40 hover:bg-purple-950 text-white font-bold px-6 py-3 rounded-lg text-xs transition"
            >
              Try Free Diagnostic Mock Test
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
