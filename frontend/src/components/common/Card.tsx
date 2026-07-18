'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Listing } from '../../types';
import { useAuthStore } from '../../store/auth-store';
import { useModalStore } from '../../store/modal-store';
import { useWishlistStore } from '../../store/wishlist-store';
import apiClient from '../../services/api-client';

interface CardProps {
  listing: Listing;
  recommendationBadge?: 'recommended' | 'match' | 'trending' | null;
}

export default function Card({ listing, recommendationBadge }: CardProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLikeMutating, setIsLikeMutating] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openLogin = useModalStore((state) => state.openLogin);
  
  const hasFavoriteId = useWishlistStore((state) => state.hasFavoriteId);
  const addFavoriteId = useWishlistStore((state) => state.addFavoriteId);
  const removeFavoriteId = useWishlistStore((state) => state.removeFavoriteId);
  
  const isLiked = hasFavoriteId(listing.id);

  // Toggle favorite status
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    if (isLikeMutating) return;
    setIsLikeMutating(true);
    
    // Optimistic Update
    if (isLiked) {
      removeFavoriteId(listing.id);
    } else {
      addFavoriteId(listing.id);
    }

    try {
      await apiClient.post(`/favorites/${listing.id}`);
    } catch {
      // Revert on failure
      if (isLiked) {
        addFavoriteId(listing.id);
      } else {
        removeFavoriteId(listing.id);
      }
    } finally {
      setIsLikeMutating(false);
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (listing.images && listing.images.length > 0) {
      setCurrentIdx((prev) => (prev + 1) % listing.images.length);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (listing.images && listing.images.length > 0) {
      setCurrentIdx((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const images = listing.images && listing.images.length > 0
    ? listing.images.map((img) => img.url)
    : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800']; // Fallback placeholder

  return (
    <Link href={`/listings/${listing.id}`} className="group block w-full">
      <div 
        className="flex flex-col gap-2 w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Photo Container */}
        <div className="relative aspect-square w-full rounded-[12px] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
          
          {/* Recommendation Badge overlay */}
          {recommendationBadge === 'recommended' && (
            <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-neutral-900/90 dark:bg-white/95 text-white dark:text-neutral-900 font-extrabold text-[10px] tracking-wide rounded-md uppercase select-none flex items-center gap-1 shadow-md">
              <span>🏆 AI Recommended</span>
            </div>
          )}
          {recommendationBadge === 'match' && (
            <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-rose-500 text-white font-extrabold text-[10px] tracking-wide rounded-md uppercase select-none flex items-center gap-1 shadow-md">
              <span>⭐ Best Match</span>
            </div>
          )}
          {recommendationBadge === 'trending' && (
            <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-amber-500 text-white font-extrabold text-[10px] tracking-wide rounded-md uppercase select-none flex items-center gap-1 shadow-md">
              <span>🔥 Trending</span>
            </div>
          )}
          
          {/* Wishlist Heart */}
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 z-10 p-1 rounded-full transition-transform hover:scale-110 active:scale-95 duration-100"
          >
            <Heart
              size={24}
              strokeWidth={1.8}
              className={`
                ${isLiked 
                  ? 'fill-[#FF385C] stroke-[#FF385C] drop-shadow-md' 
                  : 'fill-black/30 stroke-white drop-shadow-sm'
                }
                transition-colors duration-200
              `}
            />
          </button>

          {/* Images Slide Show */}
          <div className="w-full h-full relative">
            <AnimatePresence initial={false} mode="wait">
              <motion.img
                key={currentIdx}
                src={images[currentIdx]}
                alt={listing.title}
                loading="lazy"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-cover select-none"
              />
            </AnimatePresence>
          </div>

          {/* Photo Carousel Arrows */}
          {isHovered && images.length > 1 && (
            <>
              {currentIdx > 0 && (
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 dark:bg-[#1C1C1E]/90 hover:bg-white dark:hover:bg-[#1C1C1E] text-neutral-800 dark:text-white rounded-full shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
              )}
              {currentIdx < images.length - 1 && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 dark:bg-[#1C1C1E]/90 hover:bg-white dark:hover:bg-[#1C1C1E] text-neutral-800 dark:text-white rounded-full shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              )}
            </>
          )}

          {/* Carousel dots indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 justify-center max-w-[80%] overflow-hidden">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`
                    h-1.5 rounded-full transition-all duration-200
                    ${idx === currentIdx 
                      ? 'w-3 bg-white' 
                      : 'w-1.5 bg-white/50'
                    }
                  `}
                />
              ))}
            </div>
          )}
        </div>

        {/* Listing card details */}
        <div className="flex flex-col gap-1 text-sm">
          {/* Location & Star Rating */}
          <div className="flex justify-between items-start font-bold">
            <span className="text-[#222222] dark:text-white line-clamp-1">
              {listing.city}, {listing.country}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <Star size={14} className="fill-[#222222] stroke-[#222222] dark:fill-white dark:stroke-white" />
              <span className="font-semibold">{listing.rating !== null ? listing.rating : 'New'}</span>
            </div>
          </div>
          
          {/* Subtitle properties */}
          <span className="text-neutral-500 dark:text-neutral-400 line-clamp-1 font-normal">
            Hosted by {listing.host?.first_name || 'Host'}
          </span>
          <span className="text-neutral-500 dark:text-neutral-400 line-clamp-1 font-normal">
            {listing.bedrooms} {listing.bedrooms === 1 ? 'bedroom' : 'bedrooms'} &bull; {listing.beds} {listing.beds === 1 ? 'bed' : 'beds'}
          </span>

          {/* Price */}
          <div className="mt-1 font-semibold text-[#222222] dark:text-white">
            ${listing.price_per_night}{' '}
            <span className="font-normal text-neutral-500 dark:text-neutral-400">night</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
