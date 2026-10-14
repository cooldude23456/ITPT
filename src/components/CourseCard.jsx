import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Star, Heart, ShoppingCart, Check, PlayCircle, Clock, Award } from 'lucide-react';

export default function CourseCard({ product, onSelect, onTakeTest }) {
  const { formatPrice, currency, addToCart, cart, wishlist, toggleWishlist, enrolled } = useApp();
  const [hovered, setHovered] = useState(false);

  const isInCart = cart.some(item => item.id === product.id);
  const isWishlisted = wishlist.includes(product.id);
  const isEnrolled = enrolled.includes(product.id);

  // Vendor color themes for badges
  const getVendorBadgeColor = (vendor) => {
    switch (vendor) {
      case 'AWS': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Microsoft': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Google': return 'bg-red-50 text-red-700 border-red-200';
      case 'CompTIA': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Kubernetes': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Databricks': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Linux': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <div
      className="relative group bg-white border border-udemy-border rounded-lg overflow-hidden flex flex-col hover:shadow-card-hover transition-all duration-200 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(product)}
    >
      {/* Thumbnail area */}
      <div className="relative h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-purple-950 flex flex-col justify-between p-4 overflow-hidden">
        {/* Subtle decorative grid/pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getVendorBadgeColor(product.vendor)} bg-white/90 backdrop-blur-sm`}>
            {product.vendor}
          </span>
          {product.badge && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
              product.badge.toLowerCase().includes('bestseller')
                ? 'bg-amber-300 text-amber-950'
                : 'bg-emerald-400 text-emerald-950'
            }`}>
              {product.badge}
            </span>
          )}
        </div>

        {/* Center Emblem / Exam Code */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-2">
          <span className="text-white/70 text-[11px] font-medium uppercase tracking-widest">
            {product.category === 'interviews' ? 'Interview Bank' : (product.category === 'courses' ? 'Masterclass' : 'Practice Exam')}
          </span>
          <span className="text-white font-extrabold text-base md:text-lg leading-tight line-clamp-2 mt-0.5">
            {product.title.split('|')[0].trim()}
          </span>
        </div>

        {/* Bottom stats overlay */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-300 border-t border-white/10 pt-2">
          <span>{product.questionsCount || 400}+ Questions</span>
          <span>{product.testsCount || 6} Tests</span>
          <span>Timed Simulation</span>
        </div>

        {/* Wishlist button overlay */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-1.5 rounded-full z-20 backdrop-blur-md transition ${
            isWishlisted
              ? 'bg-rose-500 text-white'
              : 'bg-black/40 text-white hover:bg-black/60'
          }`}
          title="Save to wishlist"
        >
          <Heart className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Card Content (Udemy layout) */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-bold text-sm text-udemy-dark leading-snug line-clamp-2 group-hover:text-purple-700 transition">
            {product.title}
          </h3>

          {/* Instructor Byline */}
          <p className="text-xs text-udemy-lightgray mt-1 truncate">
            {product.instructor?.name || 'Yogesh Dhiman'}
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-1.5 mt-1.5">
            <span className="font-bold text-xs text-udemy-gold">{product.rating || 4.8}</span>
            <div className="flex text-udemy-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current text-amber-500" />
              ))}
            </div>
            <span className="text-[11px] text-udemy-lightgray">
              ({product.reviewCount?.toLocaleString() || 240})
            </span>
          </div>

          {/* Meta specs */}
          <div className="text-[11px] text-udemy-lightgray mt-1.5 flex items-center space-x-2">
            <span>{product.questionsCount || 400} Practice Questions</span>
            <span>•</span>
            <span>Pass: {product.passingScore || 70}%</span>
          </div>
        </div>

        {/* Price & CTA Section */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="font-extrabold text-base text-udemy-dark">
              {formatPrice(product.priceINR, product.priceUSD)}
            </span>
            {product.originalPriceINR > 0 && !product.isFree && (
              <span className="text-xs text-udemy-lightgray line-through">
                {formatPrice(product.originalPriceINR, product.originalPriceUSD)}
              </span>
            )}
          </div>

          {isEnrolled ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTakeTest(product);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded transition flex items-center space-x-1"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Start</span>
            </button>
          ) : product.isFree ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTakeTest(product);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded transition flex items-center space-x-1"
            >
              <span>Free Test</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded transition flex items-center space-x-1 ${
                isInCart
                  ? 'bg-slate-100 text-emerald-700 border border-emerald-300'
                  : 'bg-udemy-purple hover:bg-udemy-purple-hover text-white'
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>In Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
