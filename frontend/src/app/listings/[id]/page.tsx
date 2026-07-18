'use client';

import React, { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import MobileNav from '../../../components/layout/MobileNav';
import Gallery from '../../../components/listing/Gallery';
import BookingPanel from '../../../components/listing/BookingPanel';
import ReviewList from '../../../components/listing/ReviewList';
import Map from '../../../components/common/Map';
import { ListingDetailSkeleton } from '../../../components/common/Skeleton';
import AuthModals from '../../../components/common/AuthModals';
import SearchModal from '../../../components/common/SearchModal';
import Modal from '../../../components/common/Modal';
import { useToastStore } from '../../../store/toast-store';
import apiClient from '../../../services/api-client';
import { Listing } from '../../../types';
import { ShieldCheck, Calendar, Sparkles, MapPin, Share } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ListingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const listingId = Number(resolvedParams.id);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      addToast('Listing link copied to clipboard!', 'success');
      setIsShareOpen(false);
    }
  };

  // Fetch listing details from API
  const { data: listing, isLoading, isError } = useQuery<Listing>({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const res = await apiClient.get(`/listings/${listingId}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <ListingDetailSkeleton />
        <Footer />
        <MobileNav />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-6">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">Listing not found</h2>
          <p className="text-neutral-500 text-sm mb-6">The listing you are looking for does not exist or has been removed.</p>
          <a href="/" className="px-5 py-3 bg-[#FF385C] hover:bg-[#E61E4D] text-white font-bold rounded-lg transition-colors cursor-pointer text-sm">
            Back to Explore
          </a>
        </div>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-6 md:px-10 py-6 flex flex-col gap-6 bg-white dark:bg-[#121212]">
        {/* Title Header */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-white mb-2">{listing.title}</h1>
            <div className="flex flex-wrap items-center gap-1 text-sm font-semibold text-[#222222] dark:text-neutral-300">
              <span className="underline cursor-pointer">{listing.city}, {listing.country}</span>
            </div>
          </div>
          <button 
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg text-xs font-bold text-neutral-700 dark:text-neutral-350 cursor-pointer active:scale-97 transition-all shrink-0 select-none"
          >
            <Share size={13} className="text-[#222222] dark:text-white" />
            <span>Share</span>
          </button>
        </div>

        {/* Gallery grid */}
        <Gallery images={listing.images} title={listing.title} />

        {/* Grid Split Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 mt-4">
          
          {/* Left Column (Details) */}
          <div className="md:col-span-2 flex flex-col gap-6 font-normal">
            
            {/* Host Details */}
            <div className="flex items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="text-lg font-bold text-[#222222] dark:text-white">
                  Entire villa hosted by {listing.host?.first_name || 'Host'}
                </h2>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {listing.max_guests} guests &bull; {listing.bedrooms} {listing.bedrooms === 1 ? 'bedroom' : 'bedrooms'} &bull; {listing.beds} {listing.beds === 1 ? 'bed' : 'beds'} &bull; {listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'}
                </div>
              </div>
              <img
                src={listing.host?.profile_image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'}
                alt={listing.host?.first_name || 'Host'}
                className="w-12 h-12 rounded-full object-cover shrink-0"
              />
            </div>

            {/* Special highlights */}
            <div className="flex flex-col gap-5 pb-6 border-b border-neutral-200 dark:border-neutral-800 text-sm">
              {listing.host?.host_profile?.is_superhost && (
                <div className="flex gap-4 items-start">
                  <Sparkles className="text-[#FF385C] shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-[#222222] dark:text-white">Superhost</h4>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Superhosts are experienced, highly rated hosts who are committed to providing great stays.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex gap-4 items-start">
                <ShieldCheck className="text-neutral-600 dark:text-neutral-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-[#222222] dark:text-white">Free cancellation options</h4>
                  <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Cancel within 48 hours for a full refund of checkout fees.
                  </p>
                </div>
              </div>
            </div>

            {/* Description Text */}
            <div className="pb-6 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-800 dark:text-white mb-3">About this space</h3>
              <p className="text-neutral-600 dark:text-neutral-350 text-sm leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Amenities Section */}
            <div className="pb-6 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-800 dark:text-white mb-4">What this place offers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {listing.amenities.map((am) => (
                  <div key={am.id} className="flex items-center gap-3 text-neutral-600 dark:text-neutral-350 font-normal">
                    <span className="w-5 h-5 flex items-center justify-center text-[#222222] dark:text-white font-semibold">
                      &bull;
                    </span>
                    <span>{am.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Sticky Reservation Calculator Panel) */}
          <div className="w-full">
            <BookingPanel listing={listing} blockedDates={listing.blocked_dates || []} />
          </div>
        </div>

        {/* Map Section */}
        <div className="py-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-base font-bold text-neutral-800 dark:text-white">
            <MapPin size={20} />
            <span>Where you&apos;ll be</span>
          </div>
          <div className="w-full h-[350px] md:h-[450px] relative">
            <Map listings={[listing]} zoom={13} interactive={true} />
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewList listingId={listing.id} hostId={listing.host_id} />
      </main>

      <Footer />
      <MobileNav />

      {/* Global Modals */}
      <AuthModals />
      <SearchModal />

      {/* Share Modal */}
      <Modal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title="Share this stay" size="sm">
        <div className="flex flex-col gap-4 p-2 text-xs font-normal text-neutral-600 dark:text-neutral-350 select-none">
          <p className="text-sm">Share this unique stay with friends and family to start planning your getaway.</p>
          
          <div className="grid grid-cols-2 gap-3 my-2">
            <a 
              href={`https://api.whatsapp.com/send?text=Check%20out%20this%20amazing%20stay%20on%20Airbnb:%20${listing.title}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 border border-neutral-250 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-850 cursor-pointer transition-colors flex items-center justify-center gap-2 font-bold text-neutral-800 dark:text-white text-center"
            >
              <span>WhatsApp</span>
            </a>
            <a 
              href={`https://twitter.com/intent/tweet?text=Check%20out%20this%20amazing%20stay%20on%20Airbnb:%20${listing.title}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 border border-neutral-250 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-850 cursor-pointer transition-colors flex items-center justify-center gap-2 font-bold text-neutral-800 dark:text-white text-center"
            >
              <span>X (Twitter)</span>
            </a>
          </div>

          <button 
            onClick={handleCopyLink}
            className="w-full py-3.5 bg-[#FF385C] hover:bg-[#E61E4D] text-white font-bold rounded-xl transition-colors cursor-pointer text-sm"
          >
            Copy Link
          </button>
        </div>
      </Modal>
    </div>
  );
}
