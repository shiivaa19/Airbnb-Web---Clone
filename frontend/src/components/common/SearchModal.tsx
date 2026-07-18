'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useModalStore } from '../../store/modal-store';
import { useSearchStore } from '../../store/search-store';
import { Search, MapPin, Calendar, Users, Minus, Plus } from 'lucide-react';

const worldwideDestinations = [
  'Malibu, California, USA',
  'Aspen, Colorado, USA',
  'Saint-Tropez, French Riviera, France',
  'Queenstown, Otago, New Zealand',
  'Santorini, Cyclades, Greece',
  'Joshua Tree, California, USA',
  'Tokyo, Kanto, Japan',
  'Florence, Tuscany, Italy',
  'Reykjavik, Capital Region, Iceland',
  'Cape Town, Western Cape, South Africa',
  'Maui, Hawaii, USA',
  'Geneva, Lake Geneva, Switzerland',
  'Siena, Tuscany, Italy',
  'Paris, Île-de-France, France',
  'London, Greater London, United Kingdom',
  'New York City, New York, USA',
  'Rome, Lazio, Italy',
  'Bali, Lesser Sunda Islands, Indonesia',
  'Sydney, New South Wales, Australia',
  'Cairo, Nile Valley, Egypt',
  'Rio de Janeiro, Southeast Region, Brazil'
];

export default function SearchModal() {
  const { isSearchOpen, closeSearch } = useModalStore();
  const filters = useSearchStore();

  // Local State representing filters during draft state
  const [locationDraft, setLocationDraft] = useState(filters.location);
  const [checkInDraft, setCheckInDraft] = useState(filters.checkIn || '');
  const [checkOutDraft, setCheckOutDraft] = useState(filters.checkOut || '');
  const [guestsDraft, setGuestsDraft] = useState(filters.guests);
  const [priceMinDraft, setPriceMinDraft] = useState<number | ''>(filters.priceMin || '');
  const [priceMaxDraft, setPriceMaxDraft] = useState<number | ''>(filters.priceMax || '');
  
  const [filteredDestinations, setFilteredDestinations] = useState<string[]>([]);

  // Filter destinations in real-time as user types
  useEffect(() => {
    if (!locationDraft) {
      // Display top 6 popular locations when input is empty
      setFilteredDestinations(worldwideDestinations.slice(0, 6));
      return;
    }

    const matches = worldwideDestinations.filter((dest) =>
      dest.toLowerCase().includes(locationDraft.toLowerCase())
    );
    setFilteredDestinations(matches);
  }, [locationDraft]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filters.setFilters({
      location: locationDraft,
      checkIn: checkInDraft || null,
      checkOut: checkOutDraft || null,
      guests: guestsDraft,
      priceMin: priceMinDraft !== '' ? Number(priceMinDraft) : null,
      priceMax: priceMaxDraft !== '' ? Number(priceMaxDraft) : null,
    });
    closeSearch();
  };

  const handleClearAll = () => {
    setLocationDraft('');
    setCheckInDraft('');
    setCheckOutDraft('');
    setGuestsDraft(1);
    setPriceMinDraft('');
    setPriceMaxDraft('');
    filters.resetFilters();
  };

  const handleSuggestionClick = (dest: string) => {
    // Extract city name (split by comma)
    const city = dest.split(',')[0];
    setLocationDraft(city);
  };

  return (
    <Modal isOpen={isSearchOpen} onClose={closeSearch} title="Search places" size="md">
      <form onSubmit={handleSearch} className="flex flex-col gap-6">
        
        {/* 1. Location Autocomplete Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Where to?</label>
          <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-3 gap-3 bg-neutral-50 dark:bg-neutral-900 focus-within:border-neutral-800 transition-colors">
            <MapPin size={18} className="text-neutral-500" />
            <input
              type="text"
              placeholder="Search destinations worldwide..."
              value={locationDraft}
              onChange={(e) => setLocationDraft(e.target.value)}
              className="w-full focus:outline-none dark:bg-neutral-900 text-sm font-semibold"
            />
          </div>

          {/* Inline Autocomplete List */}
          {filteredDestinations.length > 0 && (
            <div className="flex flex-col border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 max-h-48 overflow-y-auto p-1.5 gap-0.5">
              <div className="px-3 py-1.5 text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {locationDraft ? 'Matches' : 'Popular destinations'}
              </div>
              {filteredDestinations.map((dest) => (
                <button
                  type="button"
                  key={dest}
                  onClick={() => handleSuggestionClick(dest)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left cursor-pointer rounded-lg transition-colors text-xs font-semibold text-neutral-700 dark:text-neutral-200"
                >
                  <MapPin size={12} className="text-neutral-400 shrink-0" />
                  <span>{dest}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Date Selection Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Check in</label>
            <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-3 gap-3 bg-neutral-50 dark:bg-neutral-900">
              <Calendar size={18} className="text-neutral-500" />
              <input
                type="date"
                value={checkInDraft}
                onChange={(e) => setCheckInDraft(e.target.value)}
                className="w-full focus:outline-none dark:bg-neutral-900 text-sm font-semibold cursor-pointer"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Check out</label>
            <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-3 gap-3 bg-neutral-50 dark:bg-neutral-900">
              <Calendar size={18} className="text-neutral-500" />
              <input
                type="date"
                value={checkOutDraft}
                onChange={(e) => setCheckOutDraft(e.target.value)}
                className="w-full focus:outline-none dark:bg-neutral-900 text-sm font-semibold cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. Pricing Boundaries */}
        <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 dark:border-neutral-850 pt-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Min Price ($)</label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={priceMinDraft}
              onChange={(e) => setPriceMinDraft(e.target.value !== '' ? Number(e.target.value) : '')}
              className="w-full border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-3 focus:outline-none dark:bg-neutral-900 text-sm font-semibold text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Max Price ($)</label>
            <input
              type="number"
              placeholder="e.g. 1000"
              value={priceMaxDraft}
              onChange={(e) => setPriceMaxDraft(e.target.value !== '' ? Number(e.target.value) : '')}
              className="w-full border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-3 focus:outline-none dark:bg-neutral-900 text-sm font-semibold text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            />
          </div>
        </div>

        {/* 4. Guest Count Stepper */}
        <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-850 pt-4 pb-2">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-neutral-800 dark:text-white">Guests</span>
            <span className="text-xs text-neutral-500">Ages 13 or above</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled={guestsDraft <= 1}
              onClick={() => setGuestsDraft((g) => g - 1)}
              className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <Minus size={14} />
            </button>
            <span className="font-bold text-base w-6 text-center">{guestsDraft}</span>
            <button
              type="button"
              disabled={guestsDraft >= 16}
              onClick={() => setGuestsDraft((g) => g + 1)}
              className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-850 pt-4 mt-2">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm font-bold underline hover:bg-neutral-50 dark:hover:bg-neutral-850 px-4 py-2 rounded-lg cursor-pointer"
          >
            Clear all
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[#FF385C] hover:bg-[#E61E4D] text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Search size={16} strokeWidth={2.5} />
            <span>Search</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
