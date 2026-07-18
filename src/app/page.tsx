'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MobileNav from '../components/layout/MobileNav';
import Card from '../components/common/Card';
import Map from '../components/common/Map';
import { GridSkeleton } from '../components/common/Skeleton';
import AuthModals from '../components/common/AuthModals';
import SearchModal from '../components/common/SearchModal';
import { useSearchStore } from '../store/search-store';
import { useToastStore } from '../store/toast-store';
import apiClient from '../services/api-client';
import { Listing } from '../types';
import { Map as MapIcon, List as ListIcon, Info } from 'lucide-react';

export default function HomePage() {
  const [showMap, setShowMap] = useState(false);
  const filters = useSearchStore();
  const addToast = useToastStore((state) => state.addToast);

  const handleMoodClick = (mood: string) => {
    addToast(`✨ Matchmaking stay candidates for ${mood} vibe...`, "info");
    
    setTimeout(() => {
      if (mood.includes('Relax')) {
        filters.setFilters({ category: 'Islands', priceMin: null, priceMax: null, location: '' });
        addToast("😌 Found beachside retreats ideal for relaxation!", "success");
      } else if (mood.includes('Adventure')) {
        filters.setFilters({ category: 'Countryside', priceMin: null, priceMax: null, location: '' });
        addToast("🏔 Countryside cabins and mountain tours matched!", "success");
      } else if (mood.includes('Workation')) {
        filters.setFilters({ category: 'Cabins', priceMin: null, priceMax: null, location: '' });
        addToast("💼 Quiet cabins with workspace utilities matched!", "success");
      } else if (mood.includes('Romantic')) {
        filters.setFilters({ category: 'Lakefront', priceMin: null, priceMax: null, location: '' });
        addToast("💑 Scenic lakefront escapes matched for dates!", "success");
      } else if (mood.includes('Party')) {
        filters.setFilters({ category: 'Mansions', priceMin: 350, priceMax: null, location: '' });
        addToast("🎉 Large luxury mansions matched for celebration!", "success");
      } else if (mood.includes('Family')) {
        filters.setFilters({ guests: 4, category: 'All', priceMin: null, priceMax: null, location: '' });
        addToast("👨‍👩‍👧 Spacious listings matched with 4+ guest capacity!", "success");
      }
    }, 600);
  };

  // Fetch listings from backend using a production-grade multi-stage fallback search pipeline
  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ['listings', filters.category, filters.location, filters.checkIn, filters.checkOut, filters.guests, filters.priceMin, filters.priceMax, filters.amenities],
    queryFn: async () => {
      const params: Record<string, any> = {};
      
      if (filters.category && filters.category !== 'All') {
        params.category = filters.category;
      }

      const countries = ['india', 'japan', 'france', 'italy', 'egypt', 'greece', 'united states', 'australia'];
      let loc = filters.location || '';
      
      if (loc) {
        if (countries.includes(loc.toLowerCase())) {
          params.country = loc;
        } else {
          params.city = loc;
        }
      }
      
      if (filters.checkIn) params.check_in = filters.checkIn;
      if (filters.checkOut) params.check_out = filters.checkOut;
      if (filters.guests > 1) params.guests = filters.guests;
      if (filters.priceMin !== null) params.price_min = filters.priceMin;
      if (filters.priceMax !== null) params.price_max = filters.priceMax;
      if (filters.amenities.length > 0) params.amenities = filters.amenities.join(',');

      // Stage 1: Exact / Primary Search
      let res = await apiClient.get('/listings', { params });
      let results = res.data;

      // Stage 2: Typo-Fuzzy City to Country Fallback
      if (results.length === 0 && params.city) {
        const cityLower = params.city.toLowerCase();
        let fallbackCountry = '';
        if (['goa', 'mumbai', 'delhi', 'bangalore', 'kerala', 'himalayas', 'rajasthan', 'hyderabad', 'jaipur', 'pune', 'chennai'].includes(cityLower)) {
          fallbackCountry = 'India';
        } else if (['tokyo', 'kyoto'].includes(cityLower)) {
          fallbackCountry = 'Japan';
        } else if (['paris'].includes(cityLower)) {
          fallbackCountry = 'France';
        } else if (['rome', 'florence'].includes(cityLower)) {
          fallbackCountry = 'Italy';
        } else if (['aspen', 'malibu', 'new york'].includes(cityLower)) {
          fallbackCountry = 'United States';
        }

        if (fallbackCountry) {
          addToast(`No direct stays in ${params.city}. Showing top recommendations in ${fallbackCountry}!`, 'info');
          const fallbackParams = { ...params };
          delete fallbackParams.city;
          fallbackParams.country = fallbackCountry;
          const fallbackRes = await apiClient.get('/listings', { params: fallbackParams });
          results = fallbackRes.data;
        }
      }

      // Stage 3: Relax Strict Parameters (category, price boundaries, amenities)
      if (results.length === 0 && (params.category || params.price_max || params.amenities)) {
        addToast('Widening filters to find available properties...', 'info');
        const wideParams = { ...params };
        delete wideParams.category;
        delete wideParams.price_max;
        delete wideParams.price_min;
        delete wideParams.amenities;
        const wideRes = await apiClient.get('/listings', { params: wideParams });
        results = wideRes.data;
      }

      // Stage 4: Ultimate Global Recommended Stays Fallback
      if (results.length === 0) {
        addToast('Showing overall guest favorites worldwide!', 'info');
        const generalRes = await apiClient.get('/listings');
        results = generalRes.data;
      }

      return results;
    },
  });

  const calculateScore = (listing: Listing, type: string) => {
    const rating = listing.rating || 4.5;
    const reviewCount = listing.review_count || 0;
    const isSuperhost = listing.host?.host_profile?.is_superhost || listing.host_id === 1 ? 1 : 0;
    const price = listing.price_per_night;

    // Base score (Rating weight 35% + Reviews weight 20% + Superhost 10%)
    let ratingScore = (rating / 5.0) * 100 * 0.35;
    let reviewsScore = Math.min((reviewCount / 200) * 100, 100) * 0.20;
    let superhostScore = isSuperhost * 100 * 0.10;
    let baseScore = ratingScore + reviewsScore + superhostScore;

    if (type === 'family') {
      const bedroomsScore = Math.min((listing.bedrooms / 3) * 100, 100) * 0.15;
      const hasKitchen = listing.amenities?.some(a => a.name.toLowerCase().includes('kitchen')) ? 100 : 0;
      const hasParking = listing.amenities?.some(a => a.name.toLowerCase().includes('parking') || a.name.toLowerCase().includes('garage')) ? 100 : 0;
      const hasWasher = listing.amenities?.some(a => a.name.toLowerCase().includes('washer') || a.name.toLowerCase().includes('laundry')) ? 100 : 0;
      const amenitiesScore = ((hasKitchen + hasParking + hasWasher) / 3) * 0.20;
      return baseScore + bedroomsScore + amenitiesScore;
    }

    if (type === 'couples') {
      const isRomantic = (listing.category === 'Islands' || listing.category === 'Beachfront' || listing.category === 'Trending') ? 100 : 0;
      const categoryScore = isRomantic * 0.15;
      const poolScore = listing.amenities?.some(a => a.name.toLowerCase().includes('pool') || a.name.toLowerCase().includes('tub')) ? 100 * 0.20 : 0;
      return baseScore + categoryScore + poolScore;
    }

    if (type === 'budget') {
      const priceScore = Math.max(0, 100 - (price / 5.0)) * 0.35;
      return baseScore + priceScore;
    }

    if (type === 'luxury') {
      const priceScore = Math.min((price / 500.0) * 100, 100) * 0.15;
      const isMansion = listing.category === 'Mansions' ? 100 * 0.20 : 0;
      const hasPool = listing.amenities?.some(a => a.name.toLowerCase().includes('pool')) ? 100 * 0.15 : 0;
      return baseScore + priceScore + isMansion + hasPool;
    }

    if (type === 'work') {
      const hasWifi = listing.amenities?.some(a => a.name.toLowerCase().includes('wifi') || a.name.toLowerCase().includes('internet')) ? 100 : 0;
      const hasDesk = listing.amenities?.some(a => a.name.toLowerCase().includes('workspace') || a.name.toLowerCase().includes('desk')) ? 100 : 0;
      const amenitiesScore = ((hasWifi + hasDesk) / 2) * 0.35;
      return baseScore + amenitiesScore;
    }

    return baseScore;
  };

  // Sort listings if recommendationType is active
  let rankedListings = [...listings];
  if (filters.recommendationType && filters.recommendationType !== 'none') {
    rankedListings = rankedListings
      .map(list => ({
        ...list,
        recommendationScore: calculateScore(list, filters.recommendationType)
      }))
      .sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  return (
    <div className="flex flex-col min-h-screen relative pb-16 md:pb-0">
      {/* Sticky Header Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-white dark:bg-[#0C0C0E]">
        
        {/* Mood-Based Stay Matcher */}
        <div className="w-full bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-150 dark:border-neutral-850/40 py-3.5 px-6 md:px-12 lg:px-20 select-none flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF385C]">AI Mood Matcher</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-300 font-medium hidden sm:inline">&bull; Select your vibe, AI recommends stays:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {['😌 Relax', '🏔 Adventure', '💼 Workation', '💑 Romantic', '🎉 Party', '👨‍👩‍👧 Family'].map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodClick(mood)}
                className="px-3.5 py-1.5 bg-white dark:bg-neutral-800 hover:border-[#FF385C] hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-full text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white cursor-pointer active:scale-97 transition-all shrink-0 shadow-xs"
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
        
        {/* Toggle Button for Map / Grid view */}
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2 px-5 py-3.5 bg-[#222222] dark:bg-white text-white dark:text-[#222222] font-semibold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform duration-100 cursor-pointer text-sm"
          >
            {showMap ? (
              <>
                <span>Show list</span>
                <ListIcon size={16} />
              </>
            ) : (
              <>
                <span>Show map</span>
                <MapIcon size={16} />
              </>
            )}
          </button>
        </div>

        {/* Dynamic Loading, Error and Grid/Map layouts */}
        {isLoading ? (
          <GridSkeleton count={10} />
        ) : listings.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-md mx-auto">
            <Info size={40} className="text-neutral-400 mb-4" />
            <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">No exact matches</h2>
            <p className="text-neutral-500 text-sm mb-6">
              Try changing or removing some of your filters or updating your search location.
            </p>
            <button
              onClick={filters.resetFilters}
              className="px-5 py-3 border border-[#222222] dark:border-white font-bold rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors cursor-pointer text-sm text-[#222222] dark:text-white"
            >
              Remove all filters
            </button>
          </div>
        ) : showMap ? (
          /* Map Split Screen View */
          <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-160px)] overflow-hidden">
            {/* Split List (2 columns on left) */}
            <div className="w-full md:w-[60%] lg:w-[50%] overflow-y-auto px-6 py-6 h-full hide-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8">
                {rankedListings.map((listing, idx) => {
                  let badge: 'recommended' | 'match' | 'trending' | null = null;
                  if (filters.recommendationType && filters.recommendationType !== 'none') {
                    if (idx === 0) badge = 'recommended';
                    else if (idx === 1 || idx === 2) badge = 'match';
                    else if (idx >= 3 && idx <= 5) badge = 'trending';
                  }
                  return (
                    <Card key={listing.id} listing={listing} recommendationBadge={badge} />
                  );
                })}
              </div>
            </div>
            
            {/* Split Map (right side) */}
            <div className="hidden md:block w-[40%] lg:w-[50%] h-full p-4">
              <Map listings={rankedListings} zoom={11} />
            </div>
          </div>
        ) : (
          /* Normal Listings Grid View */
          <div className="max-w-[1920px] mx-auto w-full px-6 md:px-12 lg:px-20 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
              {rankedListings.map((listing, idx) => {
                let badge: 'recommended' | 'match' | 'trending' | null = null;
                if (filters.recommendationType && filters.recommendationType !== 'none') {
                  if (idx === 0) badge = 'recommended';
                  else if (idx === 1 || idx === 2) badge = 'match';
                  else if (idx >= 3 && idx <= 5) badge = 'trending';
                }
                return (
                  <Card key={listing.id} listing={listing} recommendationBadge={badge} />
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Mobile Sticky Tab Bar */}
      <MobileNav />

      {/* Global Modals triggers */}
      <AuthModals />
      <SearchModal />
    </div>
  );
}
