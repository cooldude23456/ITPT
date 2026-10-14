import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import ReviewModal from '../components/ReviewModal';
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Filter,
  Download,
  Share2,
  Sparkles,
  ArrowLeft,
  Star
} from 'lucide-react';

export default function TestResultPage({ attempt, onRetake, onBackToCatalog }) {
  const { getUserProductReview, currentUser } = useApp();
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'incorrect', 'correct', 'flagged'
  const [showCertificate, setShowCertificate] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (attempt?.passed) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Confetti fallback
      }
    }
  }, [attempt?.passed]);

  if (!attempt) {
    return (
      <div className="p-12 text-center">
        <p>No test attempt found.</p>
        <button onClick={onBackToCatalog} className="mt-4 px-4 py-2 bg-udemy-purple text-white rounded">
          Back to Catalog
        </button>
      </div>
    );
  }

  const {
    productTitle,
    vendor,
    score,
    passed,
    correctCount,
    totalCount,
    passingScore,
    timeSpentSeconds,
    selectedAnswers,
    flaggedQuestions,
    questions,
    domainStats
  } = attempt;

  const incorrectCount = totalCount - correctCount;
  const minutes = Math.floor(timeSpentSeconds / 60);
  const seconds = timeSpentSeconds % 60;

  // Filter questions
  const filteredQuestions = questions.filter((q, idx) => {
    const userAns = selectedAnswers[idx] || [];
    const correctAns = q.correctAnswers || [];
    const isCorrect =
      userAns.length === correctAns.length &&
      userAns.every(ans => correctAns.includes(ans));
    const isFlagged = !!flaggedQuestions[idx];

    if (activeFilter === 'incorrect') return !isCorrect;
    if (activeFilter === 'correct') return isCorrect;
    if (activeFilter === 'flagged') return isFlagged;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f7f9fa] py-8 px-4 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToCatalog}
            className="flex items-center space-x-1 text-xs font-semibold text-gray-600 hover:text-black transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Practice Tests</span>
          </button>
          <div className="text-xs text-gray-500">
            Exam Attempt Date: {new Date(attempt.date).toLocaleDateString()}
          </div>
        </div>

        {/* Scorecard Hero Banner */}
        <div className="bg-white rounded-2xl border border-udemy-border p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: Pass/Fail Callout */}
            <div className="space-y-3 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                  <span>Practice Test {attempt.testNumber || 1} of 6</span>
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  {vendor} Certification Series
                </span>
                {attempt.autoSubmitted && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Auto-Submitted on Time Expiry (00:00:00)</span>
                  </span>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-extrabold text-udemy-dark leading-tight">
                {attempt.practiceTestTitle || productTitle}
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Course: <strong>{productTitle}</strong>
              </p>

              <div className="flex items-center space-x-3 justify-center md:justify-start">
                <span
                  className={`text-sm md:text-base font-extrabold px-3 py-1 rounded-lg ${
                    passed
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {passed ? '🎉 PASSED — Exam Ready!' : '⚠️ NEEDS REVIEW — Keep Practicing'}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Passing Required: {passingScore}%
                </span>
              </div>

              <p className="text-xs text-gray-600 max-w-xl leading-relaxed">
                {passed
                  ? `Outstanding achievement! You scored ${score}%, surpassing the official passing threshold of ${passingScore}%. You have demonstrated solid readiness in ${vendor} core competencies.`
                  : `You scored ${score}%, falling just short of the required ${passingScore}%. Review the in-depth answer explanations and domain breakdown below to strengthen key focus areas.`}
              </p>
            </div>

            {/* Right: Circular Score Gauge */}
            <div className="flex flex-col items-center justify-center shrink-0 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={passed ? '#10b981' : '#f43f5e'}
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - score / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-udemy-dark">{score}%</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Your Score
                  </span>
                </div>
              </div>

              {/* Quick stats pills */}
              <div className="flex items-center space-x-3 mt-4 text-xs font-semibold">
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  ✓ {correctCount} Correct
                </span>
                <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  ✕ {incorrectCount} Incorrect
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <span className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>
                  Time: <strong>{minutes}m {seconds}s</strong> / {attempt.durationMinutes || 120}m limit
                </span>
              </span>
              <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
                Mode: <strong>{attempt.isExamMode ? '⏱️ Timed Exam Mode' : '📖 Study Mode'}</strong>
              </span>
              <span>•</span>
              <span>Questions: <strong>{totalCount} (Max 250)</strong></span>
            </div>

            <div className="flex items-center space-x-2">
              {passed && (
                <button
                  onClick={() => setShowCertificate(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Award className="w-4 h-4" />
                  <span>View Certificate</span>
                </button>
              )}

              <button
                onClick={onRetake}
                className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center space-x-1.5 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Test {attempt.testNumber || 1}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Post-Exam Rating & Review Banner */}
        {(() => {
          const userRev = getUserProductReview ? getUserProductReview(attempt.testId) : null;
          return (
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-amber-50 border border-purple-200/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Star className="w-5 h-5 fill-amber-950" />
                </div>
                <div className="space-y-1">
                  <div className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                    <span>{userRev ? 'Your Course Review & Rating' : 'How was your practice test experience?'}</span>
                    <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {userRev ? `Rated ${userRev.rating}★ Verified` : 'Verified Learner Feedback'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {userRev ? (
                      <>You submitted a review for <strong>{attempt.productTitle}</strong>: &ldquo;{userRev.title || userRev.comment.slice(0, 80)}...&rdquo;</>
                    ) : (
                      <>Help instructor Yogesh Dhiman and fellow exam candidates by sharing your honest rating and review of these practice questions and explanations.</>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowReviewModal(true)}
                className="shrink-0 bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-sm"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{userRev ? 'Edit Your Review' : '★ Write a Review'}</span>
              </button>
            </div>
          );
        })()}

        {/* Domain-by-Domain Proficiency Breakdown */}
        {domainStats && Object.keys(domainStats).length > 0 && (
          <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm">
            <h2 className="font-extrabold text-base text-udemy-dark mb-4 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span>Official Exam Objectives & Domain Proficiency</span>
            </h2>

            <div className="space-y-4">
              {Object.entries(domainStats).map(([domain, stats]) => {
                const domainPct = Math.round((stats.correct / stats.total) * 100);
                const isProficient = domainPct >= passingScore;

                return (
                  <div key={domain} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-udemy-dark">{domain}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">
                          {stats.correct}/{stats.total} correct
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            isProficient
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {domainPct}% ({isProficient ? 'Proficient' : 'Needs Review'})
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isProficient ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${domainPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Question-by-Question Review Section */}
        <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-base text-udemy-dark">
                Question Review & Detailed Explanations
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Review detailed explanations for both correct and incorrect choices.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg text-xs font-semibold shrink-0">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded transition ${
                  activeFilter === 'all' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-600'
                }`}
              >
                All ({questions.length})
              </button>
              <button
                onClick={() => setActiveFilter('incorrect')}
                className={`px-3 py-1 rounded transition ${
                  activeFilter === 'incorrect' ? 'bg-white shadow-sm text-rose-600' : 'text-gray-600'
                }`}
              >
                Incorrect ({incorrectCount})
              </button>
              <button
                onClick={() => setActiveFilter('correct')}
                className={`px-3 py-1 rounded transition ${
                  activeFilter === 'correct' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-600'
                }`}
              >
                Correct ({correctCount})
              </button>
            </div>
          </div>

          {/* List of Filtered Questions */}
          <div className="space-y-6">
            {filteredQuestions.map((q, filteredIdx) => {
              const originalIndex = questions.findIndex(orig => orig.id === q.id);
              const userAns = selectedAnswers[originalIndex] || [];
              const correctAns = q.correctAnswers || [];
              const isCorrect =
                userAns.length === correctAns.length &&
                userAns.every(ans => correctAns.includes(ans));

              return (
                <div
                  key={q.id || filteredIdx}
                  className={`rounded-xl border p-5 space-y-4 transition ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  {/* Question header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                          isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      >
                        {isCorrect ? '✓' : '✕'}
                      </span>
                      <span className="font-extrabold text-sm text-udemy-dark">
                        Question {originalIndex + 1}
                      </span>
                      <span className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        {q.domain}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCorrect ? 'Correct (+1 pt)' : 'Incorrect (0 pts)'}
                    </span>
                  </div>

                  {/* Question text */}
                  <div className="text-sm font-medium text-udemy-dark leading-relaxed pl-8">
                    {q.question}
                  </div>

                  {/* Choices options */}
                  <div className="pl-8 space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isUserChoice = userAns.includes(optIdx);
                      const isCorrectChoice = correctAns.includes(optIdx);

                      let badge = null;
                      let bgClass = 'bg-white border-slate-200 text-slate-700';

                      if (isCorrectChoice) {
                        bgClass = 'bg-emerald-100/70 border-emerald-400 text-emerald-950 font-medium';
                        badge = (
                          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded ml-auto">
                            Correct Answer
                          </span>
                        );
                      } else if (isUserChoice && !isCorrectChoice) {
                        bgClass = 'bg-rose-100/70 border-rose-400 text-rose-950 font-medium';
                        badge = (
                          <span className="text-[10px] font-extrabold text-rose-800 bg-rose-200 px-2 py-0.5 rounded ml-auto">
                            Your Incorrect Selection
                          </span>
                        );
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${bgClass}`}
                        >
                          <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                          <span className="flex-1">{opt}</span>
                          {badge}
                        </div>
                      );
                    })}
                  </div>

                  {/* In-depth Explanation Box */}
                  <div className="ml-8 bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-purple-900 font-bold">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Answer Explanation & Architecture Insights:</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {q.overallExplanation || q.explanation}
                    </p>

                    {/* Option-by-Option Breakdown */}
                    {q.optionExplanations && q.optionExplanations.some(Boolean) && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                          Option-by-Option Analysis:
                        </span>
                        {q.options.map((opt, i) => {
                          const exp = q.optionExplanations[i];
                          if (!exp) return null;
                          const isCorrectChoice = q.correctAnswers.includes(i);
                          return (
                            <div key={i} className="text-xs flex items-start space-x-1.5">
                              <span className={`font-bold shrink-0 ${isCorrectChoice ? 'text-emerald-700' : 'text-slate-600'}`}>
                                Option {String.fromCharCode(65 + i)} {isCorrectChoice ? '(Correct):' : '(Incorrect):'}
                              </span>
                              <span className="text-slate-600 leading-snug">{exp}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.reference && (
                      <div className="pt-2">
                        <a
                          href={q.reference}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 font-semibold text-purple-700 hover:underline"
                        >
                          <span>Official Vendor Documentation Reference</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border-4 border-amber-300 relative space-y-6 text-center">
            {/* Certificate Header */}
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center shadow-inner">
                <Award className="w-10 h-10" />
              </div>
              <span className="text-xs font-bold text-amber-800 tracking-widest uppercase">
                Official Certificate of Readiness
              </span>
              <h2 className="text-2xl font-serif font-extrabold text-slate-900">
                ITPracticeTests.com
              </h2>
              <p className="text-xs text-gray-500">
                Registered Office: Office No. 715, Block D&E, Chandigarh Citi Center, Zirakpur, Punjab | GSTIN: 03AKXPD3010G1ZM
              </p>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 py-4 border-y border-amber-100">
              <p className="text-xs text-slate-600">This certifies that</p>
              <h3 className="text-2xl font-bold text-purple-900 underline decoration-amber-400 underline-offset-8">
                {currentUser?.name || 'Verified Candidate'}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                has successfully completed the full-length practice examination for
              </p>
              <h4 className="text-lg font-extrabold text-slate-800">{productTitle}</h4>
              <p className="text-xs text-slate-700">
                Achieving a passing score of <strong className="text-emerald-700 text-sm">{score}%</strong> (Passing Standard: {passingScore}%)
              </p>
            </div>

            {/* Signature & Date */}
            <div className="flex items-center justify-between text-xs text-gray-600 pt-2 px-6">
              <div className="text-left">
                <div className="font-semibold text-slate-800">
                  {new Date(attempt.date).toLocaleDateString()}
                </div>
                <div className="text-[10px] text-gray-400">Date Issued</div>
              </div>
              <div className="text-right">
                <div className="font-serif italic font-bold text-base text-purple-950">
                  Yogesh Dhiman
                </div>
                <div className="text-[10px] text-gray-500 font-medium">
                  Udemy Bestselling Instructor & Cloud Architect
                </div>
              </div>
            </div>

            {/* Certificate Actions */}
            <div className="flex items-center justify-center space-x-4 pt-4">
              <button
                onClick={() => window.print()}
                className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-md transition flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="border border-slate-300 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-md hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          productId={attempt.testId}
          productTitle={attempt.productTitle}
        />
      )}
    </div>
  );
}
