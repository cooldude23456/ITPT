import React from 'react';
import { useApp } from '../context/AppContext';
import CourseCard from '../components/CourseCard';
import { Heart, ArrowRight } from 'lucide-react';

export default function WishlistPage({ onSelectProduct, onTakeTest, onExplore }) {
  const { products, wishlist } = useApp();

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-[#f7f9fa] py-10 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-udemy-dark flex items-center space-x-2">
            <Heart className="w-6 h-6 text-rose-500 fill-current" />
            <span>My Wishlist</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {wishlistedProducts.length} Saved Practice Test{wishlistedProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-udemy-border p-12 text-center space-y-4 shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-udemy-dark">Your wishlist is empty</h2>
            <p className="text-xs text-gray-500">
              Browse our practice tests and click the heart icon on any course to save it for later.
            </p>
            <button
              onClick={onExplore}
              className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-6 py-3 rounded-lg transition"
            >
              Explore Practice Tests
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistedProducts.map(product => (
              <CourseCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onTakeTest={onTakeTest}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
