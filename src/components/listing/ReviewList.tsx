'use client';

import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth-store';
import { useModalStore } from '../../store/modal-store';
import apiClient from '../../services/api-client';
import { Review } from '../../types';

interface ReviewListProps {
  listingId: number;
  hostId: number;
}

export default function ReviewList({ listingId, hostId }: ReviewListProps) {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { openLogin } = useModalStore();

  // Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews for the listing
  const { data: reviews = [], refetch } = useQuery<Review[]>({
    queryKey: ['reviews', listingId],
    queryFn: async () => {
      const res = await apiClient.get(`/reviews/listing/${listingId}`);
      return res.data;
    },
  });

  // Submit Review Mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/reviews', {
        listing_id: listingId,
        rating,
        comment,
      });
      return res.data;
    },
    onSuccess: () => {
      // Clear inputs & update cache
      setComment('');
      setRating(5);
      refetch();
      // Also update listing query to refresh overall rating score
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to submit review.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    if (!comment.trim()) return;
    setError(null);
    submitMutation.mutate();
  };

  // Determine if current user can write a review (must not be the listing host)
  const isHost = user?.id === hostId;

  return (
    <div className="flex flex-col gap-6 py-6 border-t border-neutral-200 dark:border-neutral-800">
      
      {/* Header */}
      <div className="flex items-center gap-2 font-bold text-lg text-neutral-800 dark:text-white">
        <Star size={20} className="fill-[#222222] stroke-[#222222] dark:fill-white dark:stroke-white" />
        <span>
          {reviews.length === 0 
            ? 'No reviews yet' 
            : `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`
          }
        </span>
      </div>

      {/* Reviews list grid (2 columns) */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 font-normal">
          {reviews.map((rev) => (
            <div key={rev.id} className="flex flex-col gap-3">
              {/* Reviewer Profile */}
              <div className="flex items-center gap-3">
                <img
                  src={rev.author.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                  alt={rev.author.first_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-neutral-800 dark:text-white">{rev.author.first_name}</h4>
                  <span className="text-xs text-neutral-500">
                    {new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>
              
              {/* Rating stars display */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={12}
                    className={`
                      ${idx < rev.rating 
                        ? 'fill-amber-400 stroke-amber-400' 
                        : 'fill-neutral-200 stroke-neutral-200 dark:fill-neutral-800 dark:stroke-neutral-800'
                      }
                    `}
                  />
                ))}
              </div>

              {/* Comment text */}
              <p className="text-neutral-600 dark:text-neutral-350 text-sm leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-neutral-500 text-sm flex items-center gap-2">
          <MessageSquare size={16} />
          <span>Guests who stay here will see reviews here.</span>
        </div>
      )}

      {/* Add Review Panel (Only for guests, not hosts) */}
      {isAuthenticated && !isHost && (
        <div className="mt-8 p-6 bg-neutral-50 dark:bg-[#1A1A1D] border border-neutral-200 dark:border-neutral-800 rounded-[12px] max-w-xl">
          <h3 className="font-bold text-base text-neutral-800 dark:text-white mb-4">Write a review</h3>
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg text-xs font-semibold mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Interactive Stars select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-500">How was your stay?</label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const starVal = idx + 1;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRating(starVal)}
                      className="p-0.5 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    >
                      <Star
                        size={24}
                        className={`
                          ${starVal <= rating 
                            ? 'fill-amber-400 stroke-amber-400' 
                            : 'fill-transparent stroke-neutral-400 dark:stroke-neutral-600'
                          }
                          transition-colors
                        `}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-500">Your review comment</label>
              <textarea
                placeholder="Share details of your experience staying here (cleanliness, accuracy, check-in process, communication...)"
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-neutral-350 dark:border-neutral-700 rounded-lg p-3 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-550 text-sm font-normal"
              />
            </div>

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-fit px-6 py-2.5 bg-[#222222] dark:bg-white text-white dark:text-[#222222] hover:bg-black dark:hover:bg-neutral-100 font-bold rounded-lg transition-colors cursor-pointer text-sm"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Post review'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
