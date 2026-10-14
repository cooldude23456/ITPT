import React, { useState } from 'react';
import { interviewBanks } from '../data/interviewBanks';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle,
  HelpCircle,
  Code2,
  ChevronRight,
  BookOpen,
  Award,
  ShoppingCart,
  Check,
  RotateCcw
} from 'lucide-react';

export default function InterviewPage({ onSelectProduct }) {
  const { products, addToCart, cart, formatPrice } = useApp();

  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [masteredIds, setMasteredIds] = useState([]);

  const currentTrack = interviewBanks[selectedTrackIndex] || interviewBanks[0];
  const currentQuestion = currentTrack?.questions[selectedQuestionIndex] || currentTrack?.questions[0];

  // Speech synthesis for interview simulation audio readout
  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const text = revealed
      ? `Question: ${currentQuestion.question}. Ideal Answer: ${currentQuestion.idealAnswer}`
      : `Question: ${currentQuestion.question}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleMastered = (id) => {
    setMasteredIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Find related catalog product to add to cart
  const relatedProduct = products.find(p =>
    p.category === 'interviews' &&
    p.title.toLowerCase().includes(currentTrack.id.includes('java') ? 'java' : 'qa')
  ) || products.find(p => p.category === 'interviews');

  const isInCart = relatedProduct && cart.some(item => item.id === relatedProduct.id);

  return (
    <div className="min-h-screen bg-[#f7f9fa] py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Technical Interview Simulator</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              IT Technical Interview Practice & Mastery
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Crack senior developer, QA automation, and cloud architect interviews with authentic scenario questions, architectural talking points, code snippets, and audio simulation.
            </p>
          </div>

          {relatedProduct && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center shrink-0 w-full md:w-auto">
              <div className="text-xs text-purple-200">Get All 600+ Questions & PDF</div>
              <div className="text-xl font-extrabold text-white my-1">
                {formatPrice(relatedProduct.priceINR, relatedProduct.priceUSD)}
              </div>
              <button
                onClick={() => addToCart(relatedProduct)}
                className={`w-full text-xs font-bold px-4 py-2 rounded-lg transition ${
                  isInCart
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-purple-950 hover:bg-slate-100'
                }`}
              >
                {isInCart ? '✓ Added to Cart' : 'Unlock Full Bundle'}
              </button>
            </div>
          )}
        </div>

        {/* Track Selection Tabs */}
        <div className="flex flex-wrap gap-2">
          {interviewBanks.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => {
                setSelectedTrackIndex(idx);
                setSelectedQuestionIndex(0);
                setRevealed(false);
                if (speaking) {
                  window.speechSynthesis.cancel();
                  setSpeaking(false);
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                selectedTrackIndex === idx
                  ? 'bg-udemy-dark text-white shadow-sm'
                  : 'bg-white border border-udemy-border text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{track.title.split('Interview')[0]}</span>
              <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                {track.questions.length} Qs
              </span>
            </button>
          ))}
        </div>

        {/* Main Simulator Card */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question List Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-udemy-border p-4 shadow-sm space-y-3">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider pb-2 border-b border-slate-100 flex justify-between items-center">
              <span>Questions in Track</span>
              <span className="text-purple-700">
                {masteredIds.length}/{currentTrack.questions.length} Mastered
              </span>
            </div>

            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {currentTrack.questions.map((q, qIdx) => {
                const isSelected = selectedQuestionIndex === qIdx;
                const isMastered = masteredIds.includes(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setSelectedQuestionIndex(qIdx);
                      setRevealed(false);
                      if (speaking) {
                        window.speechSynthesis.cancel();
                        setSpeaking(false);
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition flex items-start space-x-2 ${
                      isSelected
                        ? 'bg-purple-50 text-purple-900 font-bold border border-purple-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="font-mono text-gray-400 mt-0.5">{qIdx + 1}.</span>
                    <span className="truncate flex-1">{q.topic || q.question}</span>
                    {isMastered && <span className="text-emerald-600 text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Flashcard Simulator */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2.5 py-1 rounded">
                    {currentQuestion.topic}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Level: <strong>{currentQuestion.difficulty}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleSpeak}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition ${
                      speaking
                        ? 'bg-purple-600 text-white border-purple-600 animate-pulse'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                    title="Audio readout by AI voice interviewer"
                  >
                    {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{speaking ? 'Stop Audio' : 'Audio Simulation'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleMastered(currentQuestion.id)}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition ${
                      masteredIds.includes(currentQuestion.id)
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{masteredIds.includes(currentQuestion.id) ? 'Mastered' : 'Mark Mastered'}</span>
                  </button>
                </div>
              </div>

              {/* Question Prompt */}
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  Technical Interviewer Asks:
                </span>
                <h2 className="text-lg md:text-xl font-bold text-udemy-dark leading-snug">
                  "{currentQuestion.question}"
                </h2>
              </div>

              {/* Talking Points (Always Visible to Guide Thinking) */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-2">
                <div className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>Key Talking Points the Interviewer Evaluates:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-amber-950">
                  {currentQuestion.talkingPoints?.map((tp, i) => (
                    <li key={i}>{tp}</li>
                  ))}
                </ul>
              </div>

              {/* Reveal Ideal Answer Box */}
              {!revealed ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <p className="text-xs text-gray-600 mb-3">
                    Formulate your answer mentally or speak aloud, then reveal the model response.
                  </p>
                  <button
                    onClick={() => setRevealed(true)}
                    className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition inline-flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Reveal Ideal Answer & Code Solution</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-5 space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-bold text-purple-900">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>Model Architectural Response:</span>
                    </div>
                    <div className="text-xs md:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                      {currentQuestion.idealAnswer}
                    </div>
                  </div>

                  {/* Code Snippet Box (if available) */}
                  {currentQuestion.codeSnippet && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 text-slate-200 text-xs">
                      <div className="bg-slate-800 px-4 py-2 font-mono text-[11px] text-slate-400 flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                          <Code2 className="w-3.5 h-3.5 text-purple-400" />
                          <span>Implementation Pattern</span>
                        </span>
                        <span>Syntax: Enterprise Grade</span>
                      </div>
                      <pre className="p-4 font-mono text-xs overflow-x-auto text-emerald-300">
                        <code>{currentQuestion.codeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedQuestionIndex(prev => Math.max(0, prev - 1));
                    setRevealed(false);
                  }}
                  disabled={selectedQuestionIndex === 0}
                  className="px-4 py-2 border border-slate-300 text-xs font-bold rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                >
                  Previous Question
                </button>

                <button
                  onClick={() => {
                    setSelectedQuestionIndex(prev =>
                      Math.min(currentTrack.questions.length - 1, prev + 1)
                    );
                    setRevealed(false);
                  }}
                  disabled={selectedQuestionIndex === currentTrack.questions.length - 1}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg disabled:opacity-30 flex items-center space-x-1"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
