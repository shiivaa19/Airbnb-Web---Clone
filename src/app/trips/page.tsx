'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import MobileNav from '../../components/layout/MobileNav';
import AuthModals from '../../components/common/AuthModals';
import SearchModal from '../../components/common/SearchModal';
import { useAuthStore } from '../../store/auth-store';
import { useModalStore } from '../../store/modal-store';
import apiClient from '../../services/api-client';
import { Booking } from '../../types';
import { Calendar, Tag, UserCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function TripsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { openLogin } = useModalStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      openLogin();
    }
  }, [isAuthenticated, openLogin]);

  // Fetch bookings list
  const { data: bookings = [], isLoading, refetch } = useQuery<Booking[]>({
    queryKey: ['my-trips'],
    queryFn: async () => {
      const res = await apiClient.get('/bookings/my-trips');
      return res.data;
    },
    enabled: isAuthenticated,
  });

  // Cancel Booking Mutation
  const cancelMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiClient.post(`/bookings/${bookingId}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const handleCancel = (bookingId: number) => {
    if (window.confirm('Are you sure you want to cancel this reservation? This action will immediately release the blocked dates.')) {
      cancelMutation.mutate(bookingId);
    }
  };

  const formatDateRange = (inStr: string, outStr: string) => {
    const inDate = new Date(inStr);
    const outDate = new Date(outStr);
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const checkInFormatted = inDate.toLocaleDateString(undefined, options);
    
    let checkOutFormatted = '';
    if (inDate.getFullYear() === outDate.getFullYear() && inDate.getMonth() === outDate.getMonth()) {
      checkOutFormatted = outDate.getDate().toString();
    } else {
      checkOutFormatted = outDate.toLocaleDateString(undefined, options);
    }
    
    return `${checkInFormatted} – ${checkOutFormatted}, ${inDate.getFullYear()}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <AlertTriangle size={40} className="text-neutral-400 mb-4" />
          <h2 className="text-xl font-bold text-neutral-800 mb-2">Access denied</h2>
          <p className="text-neutral-500 text-sm mb-6">Please log in to view your booked trips.</p>
          <button onClick={openLogin} className="px-5 py-3 bg-[#FF385C] hover:bg-[#E61E4D] text-white font-bold rounded-lg transition-colors cursor-pointer text-sm">
            Log In
          </button>
        </div>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-6 md:px-10 py-10 flex flex-col gap-6 bg-white dark:bg-[#121212]">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">Trips</h1>
        
        {isLoading ? (
          <div className="flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="w-full h-44 rounded-xl bg-neutral-100 dark:bg-neutral-850 animate-pulse border border-neutral-200 dark:border-neutral-800" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl text-center flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-2">No trips booked yet</h3>
            <p className="text-neutral-500 text-sm mb-6">Time to dust off your bags and start planning your next getaway.</p>
            <Link href="/" className="px-5 py-3 bg-[#FF385C] hover:bg-[#E61E4D] text-white font-bold rounded-lg transition-colors text-sm">
              Start searching
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6 font-normal">
            {bookings.map((booking) => {
              const list = booking.listing;
              if (!list) return null;
              
              const isFutureTrip = new Date(booking.check_in) > new Date();
              const isCancelled = booking.status === 'cancelled';
              const coverImg = list.images && list.images.length > 0 
                ? list.images[0].url 
                : 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800';

              return (
                <div 
                  key={booking.id} 
                  className="flex flex-col sm:flex-row border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow bg-white dark:bg-[#1C1C1E]"
                >
                  {/* Property Image */}
                  <div className="w-full sm:w-48 aspect-video sm:aspect-square relative overflow-hidden bg-neutral-200 shrink-0">
                    <img src={coverImg} alt={list.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Trip Details */}
                  <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-bold">
                          {list.city}, {list.country}
                        </span>
                        {/* Status tag */}
                        <span className={`
                          text-xs font-semibold px-2.5 py-1 rounded-full
                          ${isCancelled 
                            ? 'bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400' 
                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                          }
                        `}>
                          {booking.status}
                        </span>
                      </div>
                      <Link href={`/listings/${list.id}`} className="hover:underline font-bold text-neutral-800 dark:text-white text-base">
                        {list.title}
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-neutral-600 dark:text-neutral-350 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-neutral-400" />
                        <span>{formatDateRange(booking.check_in, booking.check_out)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCheck size={16} className="text-neutral-400" />
                        <span>{booking.guest_count} {booking.guest_count === 1 ? 'guest' : 'guests'}</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                        <Tag size={16} className="text-neutral-400" />
                        <span className="font-bold text-sm text-[#222222] dark:text-white">${booking.total_price}</span>
                      </div>
                    </div>

                    {/* Booking Timeline */}
                    <div className="flex flex-col gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-1 select-none">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Booking Status Timeline</span>
                      <div className="flex items-center justify-between gap-2 mt-1 relative">
                        {/* Background connector line */}
                        <div className="absolute top-2 left-4 right-4 h-0.5 bg-neutral-200 dark:border-neutral-800 -z-10" />
                        
                        {/* Step 1: Booked */}
                        <div className="flex flex-col items-center gap-1 z-10">
                          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[8px] font-bold">✓</div>
                          <span className="text-[9px] font-semibold text-neutral-500">Booked</span>
                        </div>
                        
                        {/* Step 2: Confirmed */}
                        <div className="flex flex-col items-center gap-1 z-10">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold ${isCancelled ? 'bg-red-500' : 'bg-emerald-500'}`}>
                            {isCancelled ? '✕' : '✓'}
                          </div>
                          <span className="text-[9px] font-semibold text-neutral-500">{isCancelled ? 'Cancelled' : 'Confirmed'}</span>
                        </div>

                        {/* Step 3: Check-in */}
                        <div className="flex flex-col items-center gap-1 z-10">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold ${
                            isCancelled 
                              ? 'bg-neutral-300 dark:bg-neutral-700' 
                              : new Date(booking.check_in) <= new Date() 
                                ? 'bg-emerald-500' 
                                : 'bg-neutral-350 dark:bg-neutral-700'
                          }`}>
                            {(!isCancelled && new Date(booking.check_in) <= new Date()) ? '✓' : '•'}
                          </div>
                          <span className="text-[9px] font-semibold text-neutral-500">Check-in</span>
                        </div>

                        {/* Step 4: Completed */}
                        <div className="flex flex-col items-center gap-1 z-10">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold ${
                            (!isCancelled && new Date(booking.check_out) <= new Date()) 
                              ? 'bg-emerald-500' 
                              : 'bg-neutral-350 dark:bg-neutral-700'
                          }`}>
                            {(!isCancelled && new Date(booking.check_out) <= new Date()) ? '✓' : '•'}
                          </div>
                          <span className="text-[9px] font-semibold text-neutral-500">Completed</span>
                        </div>
                      </div>
                    </div>

                    {/* Cancellation Action */}
                    {isFutureTrip && !isCancelled && (
                      <div className="flex justify-end pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-2">
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="px-4 py-2 border border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 font-bold rounded-lg text-xs transition-colors cursor-pointer active:scale-98"
                        >
                          Cancel Reservation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />

      {/* Global Modals */}
      <AuthModals />
      <SearchModal />
    </div>
  );
}
