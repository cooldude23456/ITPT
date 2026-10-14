import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getQuestionsForProduct } from '../data/questionBanks';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  BookOpen,
  LayoutGrid,
  Pause,
  Play,
  ShieldCheck,
  Award,
  Lock,
  ShoppingCart,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function TestPlayerPage({ product, testNumber = 1, onFinishTest, onBack }) {
  const {
    saveTestAttempt,
    getProductQuestions,
    getCoursePracticeTests,
    currentUser,
    verifyCourseAccess,
    formatPrice,
    addToCart,
    openLoginModal
  } = useApp();

  const isFreeCourse = Boolean(
    product.isFree ||
    product.priceINR === 0 ||
    product.priceUSD === 0 ||
    product.id === 'free-az900-diagnostic' ||
    product.id === '943fcd85-67de-4414-82ef-49fb24be3f74' ||
    product.id === '6804711e-87c7-4bae-a41a-6d80ba4a8f34'
  );

  const [accessState, setAccessState] = useState(() => (isFreeCourse ? 'authorized' : 'checking'));
  const [accessErrorMsg, setAccessErrorMsg] = useState('');

  // Zero-Trust Server Access Verification
  useEffect(() => {
    let isMounted = true;
    if (isFreeCourse) {
      setAccessState('authorized');
      return;
    }

    setAccessState('checking');
    if (verifyCourseAccess) {
      verifyCourseAccess(product.id).then(res => {
        if (!isMounted) return;
        if (res && res.hasAccess) {
          setAccessState('authorized');
        } else {
          setAccessState('denied');
          setAccessErrorMsg(res?.message || 'Verified payment required to access this exam simulator.');
        }
      }).catch(err => {
        if (!isMounted) return;
        setAccessState('denied');
        setAccessErrorMsg('Could not verify course authorization with security server.');
      });
    } else {
      setAccessState('denied');
    }

    return () => { isMounted = false; };
  }, [product.id, currentUser?.email, isFreeCourse]);

  const tNum = Math.max(1, Math.min(6, parseInt(testNumber) || 1));

  // Get practice tests info for this product
  const practiceTests = getCoursePracticeTests
    ? getCoursePracticeTests(product.id)
    : [];
  const currentTestInfo = practiceTests.find(t => t.testNumber === tNum) || {
    id: `${product.id}-test-${tNum}`,
    testNumber: tNum,
    title: `Practice Test ${tNum}: Full-Length Exam Simulator`,
    description: 'Realistic exam simulation matching official certification blueprints.',
    questionsCount: 65,
    maxQuestionsLimit: 250,
    durationMinutes: product.durationMinutes || 120,
    passingScore: product.passingScore || 70
  };

  // Load questions for this specific practice test (ONLY after authorization)
  const rawQuestions = accessState === 'authorized'
    ? (getProductQuestions ? getProductQuestions(product.id, product.title, tNum) : getQuestionsForProduct(product.id, product.title, tNum))
    : [];

  // Enforce maximum 250 questions per practice test (Udemy standard)
  const questions = (rawQuestions && rawQuestions.length > 0 ? rawQuestions : [
    {
      id: `${product.id}-q1`,
      domain: 'Core Principles',
      type: 'single',
      questionType: 'Multi-choice',
      question: `Which architectural pattern best provides horizontal scale and zero downtime deployments for ${product.title}?`,
      options: [
        'Blue/Green deployment using weighted DNS routing and Auto Scaling',
        'Single standalone server with manual reboot schedule',
        'In-place binary replacement on running database',
        'Unencrypted local disk storage without backups'
      ],
      optionExplanations: [
        'Correct. Blue/Green deployment isolates live traffic on Green while staging Blue, allowing instant zero-downtime rollback.',
        'Incorrect. Standalone servers have single points of failure.',
        'Incorrect. In-place binary replacement risks corrupted state and downtime.',
        'Incorrect. Unencrypted local storage violates security best practices.'
      ],
      correctAnswers: [0],
      explanation: 'Blue/Green deployment isolates live traffic on Green while staging Blue, allowing instant zero-downtime rollback if health tests fail.',
      overallExplanation: 'Blue/Green deployment provides instant rollback and zero-downtime staging.',
      reference: 'https://itpracticetests.com'
    }
  ]).slice(0, 250);

  // Pre-test gate state
  const [hasStarted, setHasStarted] = useState(false);

  // Test player states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [qIndex]: [optionIndices] }
  const [flaggedQuestions, setFlaggedQuestions] = useState({}); // { [qIndex]: boolean }
  const [examMode, setExamMode] = useState('exam'); // 'exam' (timed simulation with auto-submit) or 'practice' (study mode with instant check)
  const [revealedInPractice, setRevealedInPractice] = useState({}); // { [qIndex]: boolean }
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Exam Mode Timer: Total seconds based on practice test duration
  const durationMinutes = currentTestInfo.durationMinutes || product.durationMinutes || 120;
  const totalSeconds = durationMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [autoSubmittedNotice, setAutoSubmittedNotice] = useState(false);

  // Reset timer if testNumber changes
  useEffect(() => {
    setTimeLeft(totalSeconds);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setRevealedInPractice({});
    setHasStarted(false);
    setIsPaused(false);
  }, [tNum, product.id]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!hasStarted || examMode !== 'exam' || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAutoSubmittedNotice(true);
          setTimeout(() => {
            handleFinish(true, true);
          }, 1200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, examMode, isPaused]);

  // Format seconds into HH:MM:SS
  const formatTimer = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex] || questions[0];
  const userSelected = selectedAnswers[currentIndex] || [];
  const isFlagged = !!flaggedQuestions[currentIndex];

  // Respect uploaded "Question Type" (Multi-select vs Multi-choice)
  const isMultiple =
    currentQuestion?.questionType === 'Multi-select' ||
    currentQuestion?.type === 'multiple' ||
    (currentQuestion?.correctAnswers && currentQuestion.correctAnswers.length > 1);

  // Handle option selection
  const handleSelectOption = (optIndex) => {
    if (isMultiple) {
      // Multi-select allows student to select 1 or more options
      const current = selectedAnswers[currentIndex] || [];
      let updated;
      if (current.includes(optIndex)) {
        updated = current.filter(i => i !== optIndex);
      } else {
        updated = [...current, optIndex];
      }
      setSelectedAnswers({ ...selectedAnswers, [currentIndex]: updated });
    } else {
      // Multi-choice allows student to select only 1 option
      setSelectedAnswers({ ...selectedAnswers, [currentIndex]: [optIndex] });
    }
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions({
      ...flaggedQuestions,
      [currentIndex]: !flaggedQuestions[currentIndex]
    });
  };

  // Calculate score and complete
  const handleFinish = (forced = false, wasAutoSubmitted = false) => {
    let correctCount = 0;
    const domainStats = {};

    questions.forEach((q, idx) => {
      const userAns = selectedAnswers[idx] || [];
      const correctAns = q.correctAnswers || [];
      const domain = q.domain || 'General Exam Objectives';

      if (!domainStats[domain]) {
        domainStats[domain] = { total: 0, correct: 0 };
      }
      domainStats[domain].total += 1;

      // Check if user answer matches correct answers exactly
      const isCorrect =
        userAns.length === correctAns.length &&
        userAns.every(ans => correctAns.includes(ans));

      if (isCorrect) {
        correctCount += 1;
        domainStats[domain].correct += 1;
      }
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passingScore = currentTestInfo.passingScore || product.passingScore || 70;
    const passed = scorePercentage >= passingScore;

    const timeSpent = wasAutoSubmitted ? totalSeconds : (totalSeconds - timeLeft);

    const attemptData = {
      testId: product.id,
      productTitle: product.title,
      vendor: product.vendor,
      testNumber: tNum,
      practiceTestTitle: currentTestInfo.title,
      date: new Date().toISOString(),
      score: scorePercentage,
      passed,
      correctCount,
      totalCount: questions.length,
      passingScore,
      durationMinutes,
      timeSpentSeconds: timeSpent,
      isExamMode: examMode === 'exam',
      autoSubmitted: wasAutoSubmitted,
      selectedAnswers,
      flaggedQuestions,
      questions,
      domainStats
    };

    saveTestAttempt(attemptData);
    onFinishTest(attemptData);
  };

  // Counts for summary
  const answeredCount = Object.keys(selectedAnswers).filter(k => selectedAnswers[k]?.length > 0).length;
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;

  // -------------------------------------------------------------
  // ZERO-TRUST ACCESS CONTROL: CHECKING STATE
  // -------------------------------------------------------------
  if (accessState === 'checking') {
    return (
      <div className="min-h-screen bg-[#f7f9fa] py-16 px-4 font-sans flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-udemy-border shadow-card p-8 text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 mx-auto flex items-center justify-center animate-pulse">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-udemy-dark">
            Verifying Course Authorization
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Cryptographically authenticating lifetime enrollment license for <strong>{product.title}</strong> with ITPracticeTests security server...
          </p>
          <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-purple-700 pt-2">
            <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]" />
            <span>Validating TLS 1.3 Credentials</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ZERO-TRUST ACCESS CONTROL: ACCESS DENIED / PAYMENT REQUIRED
  // -------------------------------------------------------------
  if (accessState === 'denied') {
    return (
      <div className="min-h-screen bg-[#f7f9fa] py-16 px-4 font-sans flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-rose-200 shadow-card p-8 text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Access Restricted • Verified Payment Required
            </span>
            <h1 className="text-2xl font-extrabold text-udemy-dark pt-1">
              Enrollment Required
            </h1>
            <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
              <strong>{product.title}</strong> is a premium IT certification exam simulator. Full access to questions, domain scorecards, and timed mock exams requires an active verified enrollment.
            </p>
          </div>

          {/* Pricing & Guarantee Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Certification Course:</span>
              <span className="font-bold text-slate-800">{product.vendor} {product.category}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Course Fee:</span>
              <span className="text-lg font-black text-purple-700">
                {formatPrice(product.priceINR, product.priceUSD)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-2 text-[11px] text-emerald-800">
              <span className="flex items-center space-x-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Lifetime Access + Free Updates</span>
              </span>
              <span className="font-bold">6 Practice Tests Included</span>
            </div>
          </div>

          {/* User Account Context */}
          {currentUser ? (
            <p className="text-[11px] text-gray-500">
              Signed in as <strong className="text-slate-800">{currentUser.email}</strong>. If you used a different email to purchase this exam, please switch accounts.
            </p>
          ) : (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-purple-900 flex items-center justify-between">
              <span>Already purchased with another account?</span>
              <button
                type="button"
                onClick={openLoginModal}
                className="text-xs font-bold text-purple-700 underline hover:text-purple-900 cursor-pointer"
              >
                Log In
              </button>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                addToCart(product);
                if (onBack) onBack();
              }}
              className="w-full sm:w-auto bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Enroll Now &amp; Unlock Full Access</span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-5 py-3 rounded-xl transition cursor-pointer"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 1: PRE-TEST CONFIRMATION & EXAM MODE SETTINGS GATE (UDEMY STYLE)
  // -------------------------------------------------------------
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-[#f7f9fa] py-12 px-4 font-sans flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-2xl border border-udemy-border shadow-card p-6 md:p-8 space-y-6 animate-fadeIn">
          {/* Top Tag & Back */}
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-600 hover:text-black transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Course Overview</span>
            </button>
            <span className="text-xs font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 px-2.5 py-1 rounded">
              Practice Test {tNum} of 6
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-udemy-dark leading-tight">
              {currentTestInfo.title}
            </h1>
            <p className="text-xs text-gray-500 font-semibold">
              Course: <span className="text-purple-700">{product.title}</span>
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {currentTestInfo.description}
            </p>
          </div>

          {/* Lifetime Access Freshness Indicator */}
          <div className="flex items-center justify-between text-xs bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2.5 rounded-xl shadow-xs">
            <div className="flex items-center space-x-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Lifetime Access: All questions and tests update automatically when modified by instructor Yogesh Dhiman.</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded shrink-0">Always Latest</span>
          </div>

          {/* Exam Rules & Specifications Grid */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <div className="space-y-1">
              <span className="text-xs text-gray-500 block font-medium">Questions</span>
              <div className="text-lg md:text-xl font-extrabold text-udemy-dark">
                {questions.length} <span className="text-[11px] font-normal text-gray-400">/ 250 max</span>
              </div>
              <span className="text-[10px] text-gray-400">MCQs & MSQs</span>
            </div>
            <div className="space-y-1 border-x border-slate-200">
              <span className="text-xs text-gray-500 block font-medium">Time Limit</span>
              <div className="text-lg md:text-xl font-extrabold text-udemy-dark">
                {durationMinutes} <span className="text-[11px] font-normal text-gray-400">mins</span>
              </div>
              <span className="text-[10px] text-gray-400">Countdown Timer</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-500 block font-medium">Passing Score</span>
              <div className="text-lg md:text-xl font-extrabold text-emerald-700">
                {currentTestInfo.passingScore || 70}%
              </div>
              <span className="text-[10px] text-gray-400">Pass Guarantee</span>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
              Choose Your Simulation Mode:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setExamMode('exam')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  examMode === 'exam'
                    ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-udemy-dark flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span>Exam Mode (Timed)</span>
                    </span>
                    <span className="text-[10px] font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded">
                      Official
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed pt-1">
                    Simulates authentic certification exam pressure. Active countdown clock with <strong>auto-submit on time expiry</strong> and no instant answers.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setExamMode('practice')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  examMode === 'practice'
                    ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-udemy-dark flex items-center space-x-1.5">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <span>Practice Mode (Untimed)</span>
                    </span>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                      Study
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed pt-1">
                    Study at your own pace without timer pressure. Reveal detailed answer explanations and option breakdowns immediately after each question.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Guidelines */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Important Exam Simulator Instructions:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
              <li>You can pause the test at any time using the <strong>Pause Test</strong> button in the top bar.</li>
              <li>In Exam Mode, the test will automatically submit when the timer reaches <code>00:00:00</code>.</li>
              <li>Multi-select questions require choosing all correct options to receive credit.</li>
              <li>You can flag questions to review them later using the Question Palette.</li>
            </ul>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={() => setHasStarted(true)}
              className="w-full bg-udemy-purple hover:bg-udemy-purple-hover text-white font-extrabold py-3.5 px-6 rounded-xl text-sm transition shadow-md flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Practice Test {tNum} ({questions.length} Questions)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 2: ACTIVE EXAM SIMULATOR
  // -------------------------------------------------------------
  const isTimeCritical = timeLeft <= 300; // <= 5 minutes
  const isTimeWarning = timeLeft <= 900 && !isTimeCritical; // <= 15 minutes

  return (
    <div className="min-h-screen bg-[#f7f9fa] flex flex-col font-sans select-none">
      {/* Top Header / Exam Dashboard Bar */}
      <div className="bg-white border-b border-udemy-border sticky top-0 z-40 px-4 py-2.5 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Test title & Exit */}
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to exit the exam? Your current progress will be lost.')) {
                  onBack();
                }
              }}
              className="p-1.5 rounded hover:bg-slate-100 text-udemy-dark transition shrink-0"
              title="Exit Practice Test"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-extrabold text-purple-700 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Practice Test {tNum} of 6
                </span>
                <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                <span className="text-xs text-gray-500 font-semibold hidden sm:inline">
                  {product.vendor}
                </span>
              </div>
              <h1 className="text-xs md:text-sm font-bold text-udemy-dark truncate">
                {currentTestInfo.title}
              </h1>
            </div>
          </div>

          {/* Center: Exam Mode Countdown Timer (Udemy Style) */}
          {examMode === 'exam' && (
            <div className="flex items-center space-x-2">
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition ${
                  isTimeCritical
                    ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                    : isTimeWarning
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-slate-900 border-slate-900 text-white'
                }`}
              >
                <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-600' : isTimeWarning ? 'text-amber-600' : 'text-amber-400'}`} />
                <span className="font-mono font-extrabold text-sm md:text-base tracking-wider">
                  {formatTimer(timeLeft)}
                </span>
              </div>

              {/* Pause Exam Button */}
              <button
                onClick={() => setIsPaused(true)}
                className="bg-slate-100 hover:bg-slate-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-300 flex items-center space-x-1 transition"
                title="Pause Exam Timer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pause</span>
              </button>
            </div>
          )}

          {examMode === 'practice' && (
            <div className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
              <BookOpen className="w-4 h-4" />
              <span>Practice Mode (Untimed)</span>
            </div>
          )}

          {/* Right: Palette & Submit */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowPalette(!showPalette)}
              className="p-2 border border-udemy-border rounded-lg hover:bg-slate-50 transition text-slate-700"
              title="Question Palette"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm"
            >
              Finish Test
            </button>
          </div>
        </div>
      </div>

      {/* Low Time Critical Warning Banner */}
      {examMode === 'exam' && isTimeCritical && (
        <div className="bg-rose-600 text-white text-xs font-bold py-1.5 px-4 text-center animate-pulse flex items-center justify-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Less than 5 minutes remaining! Your exam will automatically submit when the timer expires.</span>
        </div>
      )}

      {/* PAUSE OVERLAY MODAL */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-udemy-border text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Pause className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-xl text-udemy-dark">Exam Paused</h3>
              <p className="text-xs text-gray-500">
                Your exam timer is stopped. Questions and answers are hidden while the test is paused.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Practice Test:</span>
                <strong className="text-udemy-dark">Practice Test {tNum} of 6</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time Remaining:</span>
                <strong className="font-mono text-purple-700 font-bold">{formatTimer(timeLeft)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Progress:</span>
                <strong>{answeredCount} of {questions.length} answered</strong>
              </div>
            </div>

            <button
              onClick={() => setIsPaused(false)}
              className="w-full bg-udemy-purple hover:bg-udemy-purple-hover text-white font-extrabold py-3 rounded-xl text-sm transition shadow-md flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Practice Test</span>
            </button>
          </div>
        </div>
      )}

      {/* AUTO-SUBMITTED POPUP NOTICE */}
      {autoSubmittedNotice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto animate-bounce">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-udemy-dark">Time’s Up!</h2>
            <p className="text-xs text-gray-600">
              The exam time limit has expired. Automatically submitting your answers and generating your certification scorecard...
            </p>
          </div>
        </div>
      )}

      {/* Main Test Body */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left/Center: Question Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base text-udemy-dark">
                  Question {currentIndex + 1}
                </span>
                <span className="text-xs text-gray-500">of {questions.length}</span>
                <span className="bg-purple-100 text-purple-800 text-[11px] font-semibold px-2 py-0.5 rounded ml-2">
                  {currentQuestion?.domain}
                </span>
              </div>

              <button
                onClick={handleToggleFlag}
                className={`flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition border ${
                  isFlagged
                    ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                    : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-current text-amber-500' : ''}`} />
                <span>{isFlagged ? 'Flagged for Review' : 'Mark for Review'}</span>
              </button>
            </div>

            {/* Question Type Callout */}
            <div className="mt-3 text-xs font-semibold text-slate-500 flex items-center justify-between">
              <div>
                {isMultiple ? (
                  <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-bold">
                    ☑️ Multi-select Question: Choose ALL correct options
                  </span>
                ) : (
                  <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                    🔘 Multi-choice Question: Choose ONE correct option
                  </span>
                )}
              </div>
              {isMultiple && (
                <span className="text-xs text-purple-800 font-medium">
                  {userSelected.length} option{userSelected.length === 1 ? '' : 's'} selected
                </span>
              )}
            </div>

            {/* Question Text */}
            <div className="mt-4 text-base md:text-lg font-medium text-udemy-dark leading-relaxed">
              {currentQuestion?.question}
            </div>

            {/* Options List */}
            <div className="mt-6 space-y-3">
              {currentQuestion?.options.map((option, optIdx) => {
                const isSelected = userSelected.includes(optIdx);
                const isPracticeRevealed = examMode === 'practice' && revealedInPractice[currentIndex];
                const isCorrect = currentQuestion.correctAnswers.includes(optIdx);

                let optionClass = 'border-slate-200 hover:border-purple-300 hover:bg-slate-50';
                if (isSelected) {
                  optionClass = 'border-purple-600 bg-purple-50/60 ring-1 ring-purple-600';
                }

                if (isPracticeRevealed) {
                  if (isCorrect) {
                    optionClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium ring-1 ring-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    optionClass = 'border-rose-500 bg-rose-50 text-rose-950 ring-1 ring-rose-500';
                  }
                }

                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-start space-x-3 ${optionClass}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isMultiple ? (
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                            isSelected
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-slate-400 bg-white'
                          }`}
                        >
                          {isSelected && <span className="text-xs font-bold leading-none">✓</span>}
                        </div>
                      ) : (
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                            isSelected
                              ? 'border-purple-600 bg-purple-600'
                              : 'border-slate-400 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      )}
                    </div>
                    <div className="text-sm leading-relaxed flex-1">
                      <span className="font-bold mr-2 text-slate-700">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      {option}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Practice Mode Instant Explanation Box */}
            {examMode === 'practice' && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                {!revealedInPractice[currentIndex] ? (
                  <button
                    onClick={() =>
                      setRevealedInPractice({
                        ...revealedInPractice,
                        [currentIndex]: true
                      })
                    }
                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Check Answer & Show Explanation</span>
                  </button>
                ) : (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2 animate-fadeIn">
                    <div className="flex items-center space-x-2 text-xs font-bold text-purple-900">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <span>Detailed Answer Explanation:</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed">
                      {currentQuestion.overallExplanation || currentQuestion.explanation}
                    </p>

                    {/* Option-by-Option Breakdown */}
                    {currentQuestion.optionExplanations && currentQuestion.optionExplanations.some(Boolean) && (
                      <div className="pt-2 border-t border-purple-200/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-purple-950 uppercase tracking-wider block">
                          Option-by-Option Analysis:
                        </span>
                        {currentQuestion.options.map((opt, i) => {
                          const exp = currentQuestion.optionExplanations[i];
                          if (!exp) return null;
                          const isCorrectChoice = currentQuestion.correctAnswers.includes(i);
                          return (
                            <div key={i} className="text-xs flex items-start space-x-1.5">
                              <span className={`font-bold shrink-0 ${isCorrectChoice ? 'text-emerald-700' : 'text-slate-600'}`}>
                                Option {String.fromCharCode(65 + i)} {isCorrectChoice ? '(Correct):' : '(Incorrect):'}
                              </span>
                              <span className="text-slate-700 leading-snug">{exp}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {currentQuestion.reference && (
                      <div className="pt-1">
                        <a
                          href={currentQuestion.reference}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-purple-700 hover:underline"
                        >
                          <span>Official Reference Documentation</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="bg-white rounded-2xl border border-udemy-border p-4 flex items-center justify-between shadow-sm">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-xs font-bold border border-udemy-border rounded-lg hover:bg-slate-50 transition disabled:opacity-40 disabled:pointer-events-none flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => {
                const next = { ...selectedAnswers };
                delete next[currentIndex];
                setSelectedAnswers(next);
              }}
              className="text-xs font-semibold text-gray-500 hover:text-rose-600 transition"
            >
              Clear Choice
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-5 py-2 rounded-lg transition flex items-center space-x-1"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-lg transition shadow-md"
              >
                Submit Exam
              </button>
            )}
          </div>
        </div>

        {/* Right: Question Palette / Navigator */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-udemy-border p-5 shadow-sm">
            <h3 className="font-bold text-sm text-udemy-dark pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Question Palette</span>
              <span className="text-xs font-medium text-gray-500">
                {answeredCount}/{questions.length} answered
              </span>
            </h3>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 my-4 text-[11px] text-gray-600">
              <div className="flex items-center space-x-1.5">
                <div className="w-3.5 h-3.5 rounded bg-purple-600 text-white" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-3.5 h-3.5 rounded bg-amber-400 text-amber-950" />
                <span>Flagged ({flaggedCount})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-3.5 h-3.5 rounded ring-2 ring-purple-600 bg-white" />
                <span>Current</span>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto p-1">
              {questions.map((_, idx) => {
                const isAns = (selectedAnswers[idx] || []).length > 0;
                const isFlag = !!flaggedQuestions[idx];
                const isCurr = idx === currentIndex;

                let btnClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (isAns) btnClass = 'bg-purple-600 text-white font-bold';
                if (isFlag) btnClass = 'bg-amber-400 text-amber-950 font-bold';
                if (isCurr) btnClass += ' ring-2 ring-offset-1 ring-purple-900';

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition relative ${btnClass}`}
                  >
                    {idx + 1}
                    {isFlag && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Summary statistics */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Practice Test:</span>
                <strong className="text-purple-700">Test {tNum} of 6</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Passing Requirement:</span>
                <strong className="text-udemy-dark">{currentTestInfo.passingScore || 70}%</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Questions in Test:</span>
                <strong className="text-udemy-dark">{questions.length} (Max 250)</strong>
              </div>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="mt-3 w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 rounded-lg transition shadow-md"
              >
                Submit Exam Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-udemy-border space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-udemy-dark">Submit Practice Test {tNum}?</h3>
                <p className="text-xs text-gray-500">Are you ready to calculate your final certification score?</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs border border-slate-200">
              <div className="flex justify-between">
                <span>Answered Questions:</span>
                <span className="font-bold text-emerald-700">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Unanswered Questions:</span>
                <span className="font-bold text-rose-700">{unansweredCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Flagged for Review:</span>
                <span className="font-bold text-amber-700">{flaggedCount}</span>
              </div>
              {examMode === 'exam' && (
                <div className="flex justify-between border-t border-slate-200 pt-2 font-mono">
                  <span>Time Remaining:</span>
                  <span className="font-bold text-purple-700">{formatTimer(timeLeft)}</span>
                </div>
              )}
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                ⚠️ You have <strong>{unansweredCount}</strong> unanswered questions. Unanswered questions are graded as incorrect.
              </p>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 border border-udemy-border rounded-lg text-xs font-semibold text-gray-700 hover:bg-slate-50"
              >
                Resume Test
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleFinish();
                }}
                className="px-5 py-2 bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Confirm & View Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
