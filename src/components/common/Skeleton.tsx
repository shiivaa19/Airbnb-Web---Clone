'use client';

import React from 'react';

export function CardSkeleton() {
  return (
    <div className="w-full flex flex-col gap-3 animate-pulse">
      {/* Photo Carousel Area */}
      <div className="relative aspect-square w-full rounded-[12px] bg-neutral-200 dark:bg-neutral-800" />
      
      {/* Title / Info Lines */}
      <div className="flex justify-between items-start">
        <div className="w-2/3 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
        <div className="w-10 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
      </div>
      
      <div className="w-1/2 h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
      <div className="w-1/3 h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
      
      <div className="w-1/4 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-sm mt-1" />
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10 px-6 sm:px-10 md:px-16 py-6">
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function ListingDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-6 animate-pulse">
      {/* Title */}
      <div className="w-1/2 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-sm mb-4" />
      
      {/* Gallery Placeholder */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[350px] sm:h-[450px] rounded-[12px] overflow-hidden mb-8">
        <div className="col-span-2 row-span-2 bg-neutral-200 dark:bg-neutral-800" />
        <div className="bg-neutral-200 dark:bg-neutral-800" />
        <div className="bg-neutral-200 dark:bg-neutral-800" />
        <div className="bg-neutral-200 dark:bg-neutral-800" />
        <div className="bg-neutral-200 dark:bg-neutral-800" />
      </div>

      {/* Grid Content splits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="w-2/3 h-6 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
          <div className="w-1/2 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
          <hr className="border-neutral-100 dark:border-neutral-850" />
          <div className="w-full h-24 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
        </div>
        
        {/* Sticky booking widget skeleton */}
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-[12px] p-6 h-[300px] bg-white dark:bg-[#1C1C1E] shadow-lg" />
      </div>
    </div>
  );
}
