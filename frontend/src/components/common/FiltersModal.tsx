'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import { useSearchStore } from '../../store/search-store';
import { SlidersHorizontal, Check } from 'lucide-react';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FiltersModal({ isOpen, onClose }: FiltersModalProps) {
  const filters = useSearchStore();

  const [priceMin, setPriceMin] = useState<number | ''>(filters.priceMin || '');
  const [priceMax, setPriceMax] = useState<number | ''>(filters.priceMax || '');
  const [amenitiesDraft, setAmenitiesDraft] = useState<string[]>(filters.amenities);

  // Mock Pricing Distribution Histogram values (24 values, representing listing density by price)
  const histogramValues = [
    5, 10, 15, 25, 45, 60, 75, 90, 100, 85, 70, 55, 40, 30, 25, 18, 12, 8, 6, 4, 3, 2, 1, 1,
  ];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    filters.setFilters({
      priceMin: priceMin !== '' ? Number(priceMin) : null,
      priceMax: priceMax !== '' ? Number(priceMax) : null,
      amenities: amenitiesDraft,
    });
    onClose();
  };

  const handleClearAll = () => {
    setPriceMin('');
    setPriceMax('');
    setAmenitiesDraft([]);
    filters.setFilters({
      priceMin: null,
      priceMax: null,
      amenities: [],
    });
  };

  const toggleAmenity = (name: string) => {
    if (amenitiesDraft.includes(name)) {
      setAmenitiesDraft(amenitiesDraft.filter((a) => a !== name));
    } else {
      setAmenitiesDraft([...amenitiesDraft, name]);
    }
  };

  const amenitiesList = [
    'WiFi', 'Kitchen', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning',
    'Heating', 'Washer', 'Dryer', 'TV', 'Workspace', 'Gym'
  ];

  // Helper to color histogram bars based on selected min/max ranges
  const isBarHighlighted = (index: number) => {
    const minVal = priceMin !== '' ? Number(priceMin) : 0;
    const maxVal = priceMax !== '' ? Number(priceMax) : 1000;
    
    // Divide price range $0 - $1000 into 24 steps
    const stepPrice = 1000 / 24;
    const barPrice = index * stepPrice;
    
    return barPrice >= minVal && barPrice <= maxVal;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filters" size="lg">
      <form onSubmit={handleApply} className="flex flex-col gap-6 text-sm">
        
        {/* 1. Price Range Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold text-neutral-800 dark:text-white">Price range</h3>
          <span className="text-xs text-neutral-500">Nightly prices before fees and taxes.</span>

          {/* Pricing Histogram display */}
          <div className="h-20 flex items-end justify-between gap-1 w-full border-b border-neutral-100 dark:border-neutral-800 pb-2">
            {histogramValues.map((height, idx) => {
              const highlighted = isBarHighlighted(idx);
              return (
                <div
                  key={idx}
                  style={{ height: `${height}%` }}
                  className={`
                    flex-1 rounded-t-xs transition-colors duration-200
                    ${highlighted 
                      ? 'bg-[#FF385C]' 
                      : 'bg-neutral-200 dark:bg-neutral-800'
                    }
                  `}
                />
              );
            })}
          </div>

          {/* Input fields boundaries */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 focus-within:border-neutral-800 transition-colors">
              <label className="text-[9px] font-bold text-neutral-500 uppercase">Minimum</label>
              <div className="flex items-center gap-1">
                <span className="text-neutral-400 font-semibold">$</span>
                <input
                  type="number"
                  placeholder="0"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="w-full focus:outline-none dark:bg-neutral-900 font-semibold text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 focus-within:border-neutral-800 transition-colors">
              <label className="text-[9px] font-bold text-neutral-500 uppercase">Maximum</label>
              <div className="flex items-center gap-1">
                <span className="text-neutral-400 font-semibold">$</span>
                <input
                  type="number"
                  placeholder="1000+"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="w-full focus:outline-none dark:bg-neutral-900 font-semibold text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Amenities Checklist Grid */}
        <div className="flex flex-col gap-3 border-t border-neutral-100 dark:border-neutral-850 pt-4">
          <h3 className="text-base font-bold text-neutral-800 dark:text-white">Amenities</h3>
          <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto">
            {amenitiesList.map((item) => {
              const isChecked = amenitiesDraft.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleAmenity(item)}
                  className="flex items-center gap-3 p-2 hover:bg-neutral-55 dark:hover:bg-neutral-850 rounded-lg text-left font-normal cursor-pointer transition-colors border border-transparent hover:border-neutral-100"
                >
                  <div
                    className={`
                      w-5 h-5 rounded-md border flex items-center justify-center text-white shrink-0 transition-colors
                      ${isChecked 
                        ? 'bg-[#FF385C] border-[#FF385C]' 
                        : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900'
                      }
                    `}
                  >
                    {isChecked && <Check size={12} strokeWidth={4} />}
                  </div>
                  <span className="text-xs text-neutral-700 dark:text-neutral-300">{item}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-850 pt-4 mt-2">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-bold underline hover:bg-neutral-50 dark:hover:bg-neutral-850 px-4 py-2 rounded-lg cursor-pointer text-neutral-800 dark:text-white"
          >
            Clear all
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-[#222222] dark:bg-white text-white dark:text-[#222222] hover:bg-black dark:hover:bg-neutral-100 font-bold rounded-lg transition-colors cursor-pointer text-xs active:scale-98 transition-transform"
          >
            Show results
          </button>
        </div>
      </form>
    </Modal>
  );
}
