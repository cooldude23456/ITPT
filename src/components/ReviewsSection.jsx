import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ReviewModal from './ReviewModal';
import {
  Star,
  CheckCircle,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Search,
  Filter,
  Trash2,
  Edit3,
  Award,
  Sparkles
} from 'lucide-react';

export default function ReviewsSection({ product }) {
  const {
    currentUser,
    enrolled,
    getProductReviews,
    getProductRatingStats,
    getUserProductReview,
    voteReviewHelpful,
    deleteReview,
    openLoginModal
  } = useApp();

  const [selectedStarFilter, setSelectedStarFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [votedNotice, setVotedNotice] = useState('');

  if (!product) return null;

  const isEnrolled = enrolled?.includes(product.id);
  const stats = getProductRatingStats ? getProductRatingStats(product.id) : {
    averageRating: product.rating || 4.8,
    reviewCount: product.reviewCount || 150,
    starPercentages: { 5: 78, 4: 16, 3: 4, 2: 1, 1: 1 },
    reviews: []
  };

  const userReview = getUserProductReview ? getUserProductReview(product.id) : null;
  const reviewsList = getProductReviews ? getProductReviews(product.id) : [];

  // Filter reviews
  const filteredReviews = reviewsList.filter(rev => {
    const matchesStar =
      selectedStarFilter === 'all' || Math.round(rev.rating) === parseInt(selectedStarFilter);
    const matchesSearch =
      !searchTerm.trim() ||
      rev.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStar && matchesSearch;
  });

  const handleHelpfulClick = (revId) => {
    if (!currentUser) {
      if (openLoginModal) openLoginModal();
      return;
    }
    const res = voteReviewHelpful(revId);
    if (res) {
      setVotedNotice('Thank you for your feedback!');
      setTimeout(() => setVotedNotice(''), 3000);
    }
  };

  return (
    <section className="space-y-6 pt-6 border-t border-slate-200">
      {/* Title & Review CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
              Student Feedback &amp; Ratings
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-udemy-dark mt-1">
            Student Reviews ({stats.reviewCount})
          </h2>
        </div>

        {/* Action Button for Enrolled Learners */}
        <div>
          {isEnrolled ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm flex items-center space-x-2 shrink-0"
            >
              {userReview ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Your Rating ({userReview.rating}★)</span>
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>Leave a Course Rating &amp; Review</span>
                </>
              )}
            </button>
          ) : (
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Enroll in this course to leave a verified rating</span>
            </div>
          )}
        </div>
      </div>

      {votedNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-2.5 rounded-lg flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{votedNotice}</span>
        </div>
      )}

      {/* Ratings Breakdown Grid (Udemy Style) */}
      <div className="bg-white rounded-2xl border border-udemy-border p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left Column: Big Numeric Score */}
        <div className="text-center md:border-r border-slate-200 md:pr-6 space-y-1">
          <div className="text-5xl font-black text-udemy-dark tracking-tight">
            {stats.averageRating}
          </div>
          <div className="flex items-center justify-center text-amber-400 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(stats.averageRating)
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <div className="text-xs font-bold text-slate-600">
            Course Rating
          </div>
          <p className="text-[11px] text-gray-400">
            Based on {stats.reviewCount} verified reviews
          </p>
        </div>

        {/* Right 2 Columns: Star Percentage Distribution Bars */}
        <div className="md:col-span-2 space-y-2 text-xs">
          {[5, 4, 3, 2, 1].map((stars) => {
            const pct = stats.starPercentages?.[stars] || 0;
            return (
              <div
                key={stars}
                onClick={() => setSelectedStarFilter(selectedStarFilter === String(stars) ? 'all' : String(stars))}
                className="flex items-center space-x-3 cursor-pointer group py-0.5"
                title={`Filter by ${stars} Stars (${pct}%)`}
              >
                <div className="flex items-center space-x-1 w-16 text-slate-600 font-semibold group-hover:text-purple-700">
                  <span>{stars} stars</span>
                </div>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500 rounded-full group-hover:bg-amber-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right font-mono font-bold text-gray-500 text-[11px]">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {/* Star Filter Badges */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none text-xs">
          <span className="text-gray-500 font-bold flex items-center space-x-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          {['all', '5', '4', '3', '2', '1'].map((starVal) => (
            <button
              key={starVal}
              onClick={() => setSelectedStarFilter(starVal)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap ${
                selectedStarFilter === starVal
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {starVal === 'all' ? 'All Ratings' : `${starVal} Stars`}
            </button>
          ))}
        </div>

        {/* Search Reviews Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search reviews & feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-udemy-dark focus:bg-white focus:outline-none focus:border-purple-600"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center text-xs text-gray-500 space-y-2">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
            <p>No reviews match your selected filter criteria.</p>
            {selectedStarFilter !== 'all' && (
              <button
                onClick={() => setSelectedStarFilter('all')}
                className="text-purple-700 font-bold hover:underline"
              >
                Reset filters to view all reviews
              </button>
            )}
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isUserAuthor = currentUser && rev.userId === currentUser.id;
            const canDelete = isUserAuthor || currentUser?.role === 'admin';

            return (
              <div
                key={rev.id}
                className="bg-white rounded-2xl border border-udemy-border p-5 shadow-xs space-y-3 transition hover:shadow-card-hover"
              >
                {/* Reviewer Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={rev.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.userName || 'Student')}`}
                      alt={rev.userName}
                      className="w-10 h-10 rounded-full object-cover border border-purple-200"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop';
                      }}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-udemy-dark">
                          {rev.userName}
                        </span>
                        {rev.isVerifiedPurchase && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center space-x-0.5">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Verified Purchaser</span>
                          </span>
                        )}
                        {isUserAuthor && (
                          <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                            Your Review
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span>•</span>
                        <span>{rev.date}</span>
                        {rev.isEdited && <span className="italic">(edited)</span>}
                      </div>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => {
                        if (confirm('Delete this review?')) {
                          deleteReview(rev.id);
                        }
                      }}
                      className="text-gray-400 hover:text-rose-600 p-1 transition"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Review Headline & Content */}
                <div className="space-y-1.5 pl-13">
                  {rev.title && (
                    <h4 className="font-bold text-sm text-udemy-dark leading-snug">
                      {rev.title}
                    </h4>
                  )}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>

                {/* Helpful voting & footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <span className="text-[11px]">Helpful?</span>
                    <button
                      onClick={() => handleHelpfulClick(rev.id)}
                      className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-purple-700 font-semibold bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 transition"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-slate-500" />
                      <span>Yes ({rev.helpfulCount || 0})</span>
                    </button>
                  </div>

                  {isUserAuthor && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-xs font-bold text-purple-700 hover:underline inline-flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit My Review</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setVotedNotice('Your review has been published successfully!');
          setTimeout(() => setVotedNotice(''), 4000);
        }}
      />
    </section>
  );
}
