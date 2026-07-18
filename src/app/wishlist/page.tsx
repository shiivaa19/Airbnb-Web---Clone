'use client';

import React, { useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import MobileNav from '../../components/layout/MobileNav';
import Card from '../../components/common/Card';
import { GridSkeleton } from '../../components/common/Skeleton';
import AuthModals from '../../components/common/AuthModals';
import SearchModal from '../../components/common/SearchModal';
import { useAuthStore } from '../../store/auth-store';
import { useModalStore } from '../../store/modal-store';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/api-client';
import { Listing } from '../../types';
import { Heart, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore();
  const { openLogin } = useModalStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      openLogin();
    }
  }, [isAuthenticated, openLogin]);

  // Query favorited listings
  const { data: wishlist = [], isLoading } = useQuery<Listing[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await apiClient.get('/favorites');
      return res.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <AlertTriangle size={40} className="text-neutral-400 mb-4" />
          <h2 className="text-xl font-bold text-neutral-800 mb-2">Access denied</h2>
          <p className="text-neutral-500 text-sm mb-6">Please log in to view your favorited places.</p>
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

      <main className="max-w-[1920px] mx-auto w-full px-6 md:px-12 lg:px-20 py-10 flex flex-col gap-6 bg-white dark:bg-[#121212]">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-white flex items-center gap-2">
          <span>Wishlists</span>
          <Heart size={24} className="fill-[#FF385C] stroke-[#FF385C]" />
        </h1>

        {isLoading ? (
          <GridSkeleton count={8} />
        ) : wishlist.length === 0 ? (
          <div className="py-16 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl text-center flex flex-col items-center justify-center max-w-lg mx-auto w-full px-6 mt-4">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-2">Create your first wishlist</h3>
            <p className="text-neutral-500 text-sm mb-6">As you search, click the heart icon on properties you like to save them here.</p>
            <Link href="/" className="px-5 py-3 bg-[#FF385C] hover:bg-[#E61E4D] text-white font-bold rounded-lg transition-colors text-sm">
              Find places to save
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {wishlist.map((listing) => (
              <Card key={listing.id} listing={listing} />
            ))}
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
