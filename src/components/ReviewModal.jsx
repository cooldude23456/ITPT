import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Star,
  X,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  HelpCircle,
  ThumbsUp
} from 'lucide-react';

export default function ReviewModal({
  product,
  isOpen,
  onClose,
  onSuccess
}) {
  const { currentUser, addReview, getUserProductReview } = useApp();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prepopulate if user already wrote a review
  useEffect(() => {
    if (product && currentUser) {
      const existing = getUserProductReview ? getUserProductReview(product.id) : null;
      if (existing) {
        setRating(existing.rating || 5);
        setTitle(existing.title || '');
        setComment(existing.comment || '');
      } else {
        setRating(5);
        setTitle('');
        setComment('');
      }
    }
  }, [product, currentUser]);

  if (!isOpen || !product) return null;

  const starLabels = {
    1: '1 Star — Poor / Needs major improvements',
    2: '2 Stars — Below Average',
    3: '3 Stars — Average / Met basic expectations',
    4: '4 Stars — Very Good / Recommended',
    5: '5 Stars — Outstanding / Must-have for exam success!'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!rating) {
      setErrorMsg('Please select a star rating (1 to 5 stars).');
      return;
    }

    if (!comment.trim()) {
      setErrorMsg('Please provide a short description or review feedback.');
      return;
    }

    setIsSubmitting(true);

    const res = addReview({
      productId: product.id,
      rating,
      title: title.trim(),
      comment: comment.trim()
    });

    setIsSubmitting(false);

    if (res.success) {
      if (onSuccess) onSuccess(res.review);
      onClose();
    } else {
      setErrorMsg(res.message || 'Failed to submit review.');
    }
  };

  const existing = getUserProductReview ? getUserProductReview(product.id) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-udemy-border space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Verified Student Review
            </span>
            <h3 className="text-lg font-black text-udemy-dark pt-1 leading-snug">
              {existing ? 'Edit Your Course Rating & Review' : 'Rate & Review this Course'}
            </h3>
            <p className="text-xs text-gray-500 font-medium line-clamp-1">
              {product.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black p-1 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Verified Purchaser Notice */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="leading-tight">
            Posting as <strong>{currentUser?.name || 'Verified Learner'}</strong> • Your review will show the <strong>✓ Verified Purchaser</strong> badge.
          </span>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* Star Rating Selector */}
          <div className="space-y-1.5 text-center bg-slate-50 border border-slate-200 rounded-xl p-4">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Select Your Rating *
            </label>
            <div className="flex items-center justify-center space-x-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    title={`${star} Star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-300 hover:text-amber-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="text-xs font-bold text-purple-800 h-4">
              {starLabels[hoverRating || rating]}
            </div>
          </div>

          {/* Headline / Title */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Review Headline (Summary)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cleared AWS SAA-C03 on my first attempt! In-depth explanations."
              className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-purple-600"
            />
          </div>

          {/* Detailed Comment */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Detailed Experience &amp; Feedback *
            </label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like most about this practice test? How did the explanations, multi-select questions, and exam timer help your preparation?"
              className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-purple-600 leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-gray-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{existing ? 'Update My Review' : 'Submit Verified Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
