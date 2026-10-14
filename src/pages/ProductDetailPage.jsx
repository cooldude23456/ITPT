import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ReviewsSection from '../components/ReviewsSection';
import {
  Star,
  CheckCircle,
  Clock,
  Award,
  Globe,
  Share2,
  Heart,
  ShoppingCart,
  PlayCircle,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  HelpCircle,
  AlertCircle,
  Check,
  RotateCcw
} from 'lucide-react';

export default function ProductDetailPage({ product, onTakeTest, onBack, onNavigate }) {
  const {
    formatPrice,
    addToCart,
    cart,
    wishlist,
    toggleWishlist,
    enrolled,
    currency,
    getCoursePracticeTests,
    testAttempts
  } = useApp();

  const [expandedTest, setExpandedTest] = useState(0);

  const isInCart = cart.some(item => item.id === product.id);
  const isWishlisted = wishlist.includes(product.id);
  const isEnrolled = enrolled.includes(product.id);

  // Get the 6 Practice Tests for this course (max 250 questions each)
  const testBundle = getCoursePracticeTests ? getCoursePracticeTests(product.id) : [
    {
      testNumber: 1,
      title: 'Practice Test 1: Full-Length Exam Simulator',
      description: 'Core concepts, architectural design, and fundamental official certification objectives.',
      questionsCount: 65,
      durationMinutes: product.durationMinutes || 120,
      passingScore: product.passingScore || 70
    },
    {
      testNumber: 2,
      title: 'Practice Test 2: Core Domain Deep Dive & Architecture',
      description: 'Multi-AZ redundancy, disaster recovery, fault tolerance, and workload scaling.',
      questionsCount: 65,
      durationMinutes: product.durationMinutes || 120,
      passingScore: product.passingScore || 70
    },
    {
      testNumber: 3,
      title: 'Practice Test 3: Multi-Select MSQs & Scenario Troubleshooting',
      description: 'Complex multi-choice and multi-select scenario questions with diagnostic logs.',
      questionsCount: 65,
      durationMinutes: product.durationMinutes || 120,
      passingScore: product.passingScore || 70
    },
    {
      testNumber: 4,
      title: 'Practice Test 4: Security, Identity & Governance Mastery',
      description: 'Zero trust architecture, IAM permissions, encryption at rest and in transit.',
      questionsCount: 65,
      durationMinutes: product.durationMinutes || 120,
      passingScore: product.passingScore || 70
    },
    {
      testNumber: 5,
      title: 'Practice Test 5: Cost Optimization, Scaling & Resiliency',
      description: 'Right-sizing resources, storage tiering, metrics monitoring, and budgeting.',
      questionsCount: 65,
      durationMinutes: product.durationMinutes || 120,
      passingScore: product.passingScore || 70
    },
    {
      testNumber: 6,
      title: 'Practice Test 6: Final Timed Benchmark Mock Exam',
      description: 'Comprehensive timed simulation replicating exact exam pressure and pass criteria.',
      questionsCount: 65,
      durationMinutes: product.durationMinutes || 120,
      passingScore: product.passingScore || 70
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Top Udemy Dark Header Banner */}
      <div className="bg-udemy-dark text-white py-10 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Course Overview */}
          <div className="lg:col-span-2 space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-xs text-purple-300">
              <button onClick={onBack} className="hover:underline">Home</button>
              <span>/</span>
              <span className="capitalize">{product.category}</span>
              <span>/</span>
              <span className="text-white font-semibold">{product.vendor}</span>
            </div>

            {/* Badges & Title */}
            <div className="space-y-2">
              {product.badge && (
                <span className="inline-block bg-amber-400 text-amber-950 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {product.badge}
                </span>
              )}
              <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                {product.title}
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              {product.description?.slice(0, 180)}... Authentic exam questions, detailed answer explanations, domain breakdown, and unlimited retakes.
            </p>

            {/* Rating & Author Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-amber-400 text-sm">{product.rating}</span>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-purple-200">
                  ({product.reviewCount?.toLocaleString()} ratings)
                </span>
              </div>
              <span className="text-slate-400">•</span>
              <span className="text-slate-200">
                {product.studentsCount?.toLocaleString()} students enrolled
              </span>
            </div>

            {/* Instructor credit */}
            <div className="text-xs text-slate-300 flex items-center space-x-2 pt-1">
              <span>Created by</span>
              <a
                href="https://www.udemy.com/user/yogesh-dhiman-22/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-white font-bold underline flex items-center space-x-1"
              >
                <span>Yogesh Dhiman (Udemy Instructor)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Language & Specs */}
            <div className="flex items-center space-x-4 text-xs text-slate-300 pt-2">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Last updated 2026</span>
              </span>
              <span className="flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>English</span>
              </span>
              <span className="flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Pass Guarantee: {product.passingScore || 70}%</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body with Sticky Purchase Card */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Course Detail Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* What you'll learn / Exam Objectives Box */}
          <div className="border border-udemy-border rounded-xl p-6 bg-slate-50/60 space-y-4">
            <h2 className="font-extrabold text-lg text-udemy-dark">
              What you will master in this practice exam
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(product.features || [
                'Complete coverage of 2026 official vendor certification blueprint',
                'Comprehensive explanations for both correct AND incorrect answer choices',
                'Realistic timed simulation mimicking real exam UI & countdown clock',
                'Multi-select MSQs & complex troubleshooting scenario questions',
                'In-depth domain proficiency scorecard with radar breakdown',
                'Instant access on desktop, tablet, and mobile with unlimited attempts'
              ]).map((feat, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Practice Tests Bundle Breakdown (Udemy Style: 6 Practice Tests, max 250 Qs) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-extrabold text-lg text-udemy-dark">
                  Practice Tests Included in this Course (6 Practice Tests)
                </h2>
                <p className="text-xs text-gray-500">
                  Maximum 250 questions per practice test with timed exam mode and countdown clock.
                </p>
              </div>
              <span className="text-xs text-purple-700 bg-purple-50 font-bold px-2.5 py-1 rounded-full border border-purple-200">
                6 Full Practice Tests Available
              </span>
            </div>

            <div className="border border-udemy-border rounded-2xl divide-y divide-slate-200 overflow-hidden shadow-sm">
              {testBundle.map((test, idx) => {
                const testAttemptsList = (testAttempts || []).filter(
                  a => a.testId === product.id && (a.testNumber === test.testNumber || (!a.testNumber && test.testNumber === 1))
                );
                const latestAttempt = testAttemptsList[0];

                return (
                  <div key={idx} className="bg-white">
                    <button
                      onClick={() => setExpandedTest(expandedTest === idx ? -1 : idx)}
                      className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center shrink-0 text-xs">
                          {test.testNumber}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-udemy-dark truncate">{test.title}</span>
                            {latestAttempt && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  latestAttempt.passed
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {latestAttempt.passed ? 'PASSED' : 'NEEDS PRACTICE'} ({latestAttempt.score}%)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center space-x-3 mt-0.5">
                            <span>{test.questionsCount} questions (Max 250)</span>
                            <span>•</span>
                            <span>{test.durationMinutes || 120} mins</span>
                            <span>•</span>
                            <span>Passing score: {test.passingScore || 70}%</span>
                          </div>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-2 ${
                          expandedTest === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {expandedTest === idx && (
                      <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 space-y-3">
                        <p className="leading-relaxed">
                          {test.description || 'Authentic vendor certification simulation featuring both single-choice MCQs and multi-select MSQs with in-depth answer explanations.'}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div className="flex items-center space-x-3 text-[11px] text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-purple-600" />
                              <span>Timed Countdown Mode</span>
                            </span>
                            <span>•</span>
                            <span>Auto-submit on 00:00:00</span>
                          </div>
                          <button
                            onClick={() => onTakeTest(product, test.testNumber)}
                            className="bg-udemy-purple hover:bg-udemy-purple-hover text-white font-bold px-4 py-2 rounded-lg transition text-xs flex items-center space-x-1.5 shadow-sm"
                          >
                            <PlayCircle className="w-4 h-4" />
                            <span>Start Practice Test {test.testNumber}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-3">
            <h2 className="font-extrabold text-lg text-udemy-dark">Description</h2>
            <div className="text-xs md:text-sm text-slate-700 leading-relaxed space-y-3">
              <p>
                Are you preparing for your <strong>{product.title}</strong>? Don’t leave your certification to chance. Passing on the first attempt requires thorough familiarity with authentic question styles, time management under pressure, and understanding the subtleties behind each choice.
              </p>
              <p>
                Curated by <strong>Yogesh Dhiman</strong>, Senior Cloud Architect and Udemy Bestselling Instructor, this comprehensive test series replicates the exact difficulty and question types encountered on the official exam.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-1 text-xs">
                  Why students love ITPracticeTests:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs">
                  <li>Detailed explanations for every correct AND incorrect answer choice</li>
                  <li>Direct citation links to official documentation (Microsoft Learn, AWS Docs, NIST)</li>
                  <li>Domain-by-domain diagnostic scorecards to pinpoint weaknesses</li>
                  <li>Retake each exam as many times as you need to achieve 90%+ readiness</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Instructor Bio Section */}
          <div className="border border-udemy-border rounded-xl p-6 space-y-4">
            <h2 className="font-extrabold text-lg text-udemy-dark">Instructor</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
              <img
                src="/6577847_169c.webp"
                alt="Yogesh Dhiman"
                className="w-20 h-20 rounded-full object-cover border-2 border-purple-600 shrink-0"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop';
                }}
              />
              <div className="space-y-1">
                <h3 className="font-bold text-base text-udemy-dark">Yogesh Dhiman</h3>
                <p className="text-xs text-purple-700 font-semibold">
                  Senior Cloud Solutions Architect & Udemy Instructor
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
                  <span>⭐ <strong>4.8</strong> Instructor Rating</span>
                  <span>👥 <strong>48,000+</strong> Students</span>
                  <span>🎓 <strong>24</strong> Courses & Test Banks</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Yogesh Dhiman is an accomplished IT professional, Cloud Solutions Architect, and acclaimed Udemy instructor specializing in cloud certifications (AWS, Azure, GCP), cybersecurity, and test automation. With extensive hands-on enterprise experience, Yogesh is dedicated to making exam preparation practical, accessible, and affordable.
            </p>

            <a
              href="https://www.udemy.com/user/yogesh-dhiman-22/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-md transition"
            >
              <span>View Yogesh Dhiman’s Courses on Udemy.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Student Feedback & Reviews Section */}
          <ReviewsSection product={product} />
        </div>

        {/* Right Column: Sticky Purchase Card (Udemy style) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-udemy-border rounded-2xl shadow-card overflow-hidden p-6 space-y-5">
            {/* Thumbnail Header */}
            <div className="relative h-40 bg-gradient-to-br from-slate-900 to-purple-950 rounded-xl flex items-center justify-center text-center p-4">
              <span className="text-white font-extrabold text-base leading-snug">
                {product.title.split('|')[0]}
              </span>
            </div>

            {/* Pricing Section */}
            <div className="space-y-1">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-extrabold text-udemy-dark">
                  {formatPrice(product.priceINR, product.priceUSD)}
                </span>
                {product.originalPriceINR > 0 && !product.isFree && (
                  <span className="text-sm text-udemy-lightgray line-through">
                    {formatPrice(product.originalPriceINR, product.originalPriceUSD)}
                  </span>
                )}
                {product.originalPriceINR > 0 && !product.isFree && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Save {Math.round(((product.originalPriceINR - product.priceINR) / product.originalPriceINR) * 100)}%
                  </span>
                )}
              </div>
              <div className="text-[11px] text-rose-600 font-semibold flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Special discounted price ends soon!</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {isEnrolled ? (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1.5 text-xs text-emerald-950">
                    <div className="font-extrabold flex items-center space-x-1.5 text-emerald-800">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Enrolled • Free Lifetime Access Active</span>
                    </div>
                    <p className="text-[11px] text-emerald-900 leading-relaxed">
                      You own this course! Whenever instructor Yogesh Dhiman updates questions, revises exams, or adds new practice tests, your access updates automatically with zero repurchase required.
                    </p>
                    {product.updatedAt && (
                      <div className="text-[10px] font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded border border-emerald-200 w-fit">
                        ✨ Updated {new Date(product.updatedAt).toLocaleDateString()} {product.version ? `(v${product.version})` : ''}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onTakeTest(product, 1)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Launch Practice Test 1 (of 6)</span>
                  </button>
                </div>
              ) : product.isFree ? (
                <button
                  onClick={() => onTakeTest(product, 1)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center space-x-2 shadow-sm"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Start Free Diagnostic Test 1</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => addToCart(product)}
                    className={`w-full font-bold py-3 rounded-lg text-sm transition flex items-center justify-center space-x-2 ${
                      isInCart
                        ? 'bg-slate-100 text-emerald-700 border border-emerald-300'
                        : 'bg-udemy-purple hover:bg-udemy-purple-hover text-white shadow-sm'
                    }`}
                  >
                    {isInCart ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      let added = true;
                      if (!isInCart) {
                        added = addToCart(product);
                      }
                      if (added !== false && onNavigate) {
                        onNavigate('checkout');
                      }
                    }}
                    className="w-full border-2 border-udemy-dark hover:bg-slate-900 hover:text-white text-udemy-dark font-bold py-3 rounded-lg text-sm transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Buy Now</span>
                  </button>
                </>
              )}

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-full py-2 rounded-lg text-xs font-semibold border flex items-center justify-center space-x-1.5 transition ${
                  isWishlisted
                    ? 'border-rose-300 bg-rose-50 text-rose-700'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current text-rose-600' : ''}`} />
                <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>

            {/* Guarantee Callout */}
            <div className="text-center pt-2">
              <button
                onClick={() => onNavigate && onNavigate('refund')}
                className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg transition shadow-sm group"
                title="View our 100% 30-Day Money-Back Guarantee Refund Policy"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600 group-hover:-rotate-45 transition-transform" />
                <span>30-Day 100% Money-Back Guarantee</span>
              </button>
            </div>

            {/* Course Features List */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-700">
              <span className="font-bold text-udemy-dark block text-xs mb-1">
                This course package includes:
              </span>
              <div className="flex items-center space-x-2">
                <PlayCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>{product.testsCount || 6} Full-Length Practice Exams</span>
              </div>
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>{product.questionsCount || 400} Practice Questions with Explanations</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Lifetime Access & Free Updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span>Certificate of Readiness on Passing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
