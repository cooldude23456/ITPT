import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ReviewModal from '../components/ReviewModal';
import {
  PlayCircle,
  RotateCcw,
  Award,
  Clock,
  CheckCircle,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  Star,
  BookOpen
} from 'lucide-react';

export default function MyLearningPage({ onTakeTest, onViewResult, onSelectProduct, onNavigate }) {
  const { products, enrolled, testAttempts, currentUser, getCoursePracticeTests, getUserProductReview, openLoginModal } = useApp();
  const user = currentUser || { name: 'Student' };
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'attempts'
  const [search, setSearch] = useState('');
  const [reviewModalProduct, setReviewModalProduct] = useState(null);

  if (!currentUser) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center p-6 space-y-4 font-sans bg-[#f7f9fa] animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 shadow-inner">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-udemy-dark">Log in to view your learning</h2>
        <p className="text-sm text-gray-500 max-w-md leading-relaxed">
          Sign in to access your enrolled practice exams, review past test attempts, and resume your certification prep anytime.
        </p>
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={openLoginModal}
            className="px-6 py-2.5 bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            Log In to Your Account
          </button>
          {onNavigate && (
            <button
              onClick={() => onNavigate('catalog')}
              className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              Browse Catalog
            </button>
          )}
        </div>
      </div>
    );
  }

  // Get enrolled products
  const enrolledProducts = products.filter(p => enrolled.includes(p.id));

  const filteredEnrolled = enrolledProducts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f9fa] py-10 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Student Profile Banner */}
        <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 text-white font-bold text-xl flex items-center justify-center shrink-0">
              {(user.name || 'Student').split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                Student Learning Center
              </span>
              <h1 className="text-xl md:text-2xl font-extrabold text-udemy-dark mt-0.5">
                Welcome back, {user.name}!
              </h1>
              <p className="text-xs text-gray-500">
                {enrolledProducts.length} Practice Exam Bundles Enrolled • {testAttempts.length} Exam Simulations Attempted
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Lifetime Access Active</span>
            </div>
          </div>
        </div>

        {/* Lifetime Access & Automatic Content Update Banner */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                <span>Automatic Content Updates & Lifetime Access</span>
                <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">100% Free Updates</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-xs">
                Whenever instructor Yogesh Dhiman updates practice questions, adds new mock exams, or revises explanations, your enrolled courses update automatically in your dashboard. You are never required to pay or buy the course again.
              </p>
            </div>
          </div>
          <div className="shrink-0 bg-white/80 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-800 font-bold text-[11px] flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Always Synced with Latest Catalog</span>
          </div>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-udemy-border space-x-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 transition relative ${
              activeTab === 'courses'
                ? 'text-purple-700 border-b-2 border-purple-700'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            My Practice Tests & Courses ({enrolledProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('attempts')}
            className={`pb-3 transition relative ${
              activeTab === 'attempts'
                ? 'text-purple-700 border-b-2 border-purple-700'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Exam Attempt History ({testAttempts.length})
          </button>
        </div>

        {/* TAB 1: Enrolled Courses & Tests */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            {/* Search filter */}
            <div className="flex justify-between items-center">
              <div className="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Filter my enrolled courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs text-udemy-dark focus:outline-none focus:border-purple-600"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {filteredEnrolled.length === 0 ? (
              <div className="bg-white rounded-2xl border border-udemy-border p-12 text-center text-xs text-gray-500">
                No enrolled tests match your search query.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEnrolled.map(prod => {
                  const tests = getCoursePracticeTests ? getCoursePracticeTests(prod.id) : [];

                  return (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl border border-udemy-border overflow-hidden shadow-sm hover:shadow-card-hover transition flex flex-col justify-between"
                    >
                      <div className="h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-purple-950 p-4 flex flex-col justify-between text-white relative">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded">
                            {prod.vendor}
                          </span>
                          {prod.isContentUpdated || prod.updatedAt ? (
                            <span className="text-[9px] font-extrabold uppercase tracking-wider bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
                              <span>✨ Content Updated</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold text-emerald-300 flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Lifetime Unlocked</span>
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm line-clamp-2 leading-tight">
                            {prod.title}
                          </h3>
                          {prod.lastUpdateNote && (
                            <p className="text-[10px] text-purple-200 truncate mt-0.5 font-medium">
                              {prod.lastUpdateNote}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        {/* 6 Practice Tests Selector Grid */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-700">6 Practice Tests (Max 250 Qs):</span>
                            <span className="text-[11px] text-purple-700 font-semibold">{prod.passingScore || 70}% Pass</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[1, 2, 3, 4, 5, 6].map(testNum => {
                              const att = (testAttempts || []).find(
                                a => a.testId === prod.id && a.testNumber === testNum
                              );
                              return (
                                <button
                                  key={testNum}
                                  onClick={() => onTakeTest(prod, testNum)}
                                  className={`p-2 rounded-lg text-center transition border text-[11px] font-bold flex flex-col items-center justify-center ${
                                    att
                                      ? att.passed
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                        : 'bg-rose-50 border-rose-300 text-rose-800'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-300'
                                  }`}
                                  title={`Practice Test ${testNum} (${att ? `Score: ${att.score}%` : 'Not Attempted'})`}
                                >
                                  <span>Test {testNum}</span>
                                  <span className="text-[9px] font-normal text-gray-500">
                                    {att ? `${att.score}%` : 'Start'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Student Rating / Review Trigger */}
                        {(() => {
                          const userRev = getUserProductReview ? getUserProductReview(prod.id) : null;
                          return (
                            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-1.5">
                                <div className="flex items-center text-amber-500">
                                  <Star className={`w-3.5 h-3.5 ${userRev ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                                </div>
                                <span className="text-[11px] text-slate-600 font-medium">
                                  {userRev ? `You rated ${userRev.rating}★` : 'Share your feedback'}
                                </span>
                              </div>
                              <button
                                onClick={() => setReviewModalProduct(prod)}
                                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 transition hover:underline"
                              >
                                {userRev ? 'Edit Review' : '★ Rate Course'}
                              </button>
                            </div>
                          );
                        })()}

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => onSelectProduct(prod)}
                            className="text-xs font-semibold text-gray-500 hover:text-black"
                          >
                            All 6 Tests Info
                          </button>
                          <button
                            onClick={() => onTakeTest(prod, 1)}
                            className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 shadow-sm"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Launch Test 1</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Test Attempt History */}
        {activeTab === 'attempts' && (
          <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-4">
            {testAttempts.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-500 space-y-3">
                <FileText className="w-10 h-10 text-gray-300 mx-auto" />
                <p>You haven't completed any practice exam simulations yet.</p>
                <button
                  onClick={() => setActiveTab('courses')}
                  className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                >
                  Start an Exam Now
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {testAttempts.map((att, idx) => (
                  <div
                    key={idx}
                    className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition p-2 rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                          Practice Test {att.testNumber || 1} of 6
                        </span>
                        <span
                          className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                            att.passed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {att.passed ? 'PASSED' : 'NEEDS REVIEW'}
                        </span>
                        <span className="text-xs font-bold text-udemy-dark">{att.score}%</span>
                        <span className="text-xs text-gray-400">
                          ({att.correctCount}/{att.totalCount} correct)
                        </span>
                        {att.autoSubmitted && (
                          <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                            ⏰ Auto-Submitted
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-udemy-dark">
                        {att.practiceTestTitle || att.productTitle}
                      </h3>
                      <div className="text-[11px] text-gray-500 flex items-center space-x-3">
                        <span>Course: {att.productTitle}</span>
                        <span>•</span>
                        <span>Date: {new Date(att.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Time Spent: {Math.round(att.timeSpentSeconds / 60)} mins</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewResult(att)}
                        className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Scorecard & Review
                      </button>
                      <button
                        onClick={() => {
                          const prod = products.find(p => p.id === att.testId);
                          if (prod) onTakeTest(prod, att.testNumber || 1);
                        }}
                        className="border border-purple-600 text-purple-700 hover:bg-purple-50 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Retake Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review & Rating Modal */}
      {reviewModalProduct && (
        <ReviewModal
          isOpen={!!reviewModalProduct}
          onClose={() => setReviewModalProduct(null)}
          product={reviewModalProduct}
          productId={reviewModalProduct.id}
          productTitle={reviewModalProduct.title}
        />
      )}
    </div>
  );
}
