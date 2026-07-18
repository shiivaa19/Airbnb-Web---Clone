'use client';

import React, { useState } from 'react';
import { Grid, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryProps {
  images: { id: number; url: string }[];
  title: string;
}

export default function Gallery({ images, title }: GalleryProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // Fill up grid with high-quality unsplash placeholders if we have less than 5 images
  const defaultPlaceholders = [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
  ];

  const gridImages = [...images.map((img) => img.url)];
  while (gridImages.length < 5) {
    gridImages.push(defaultPlaceholders[gridImages.length]);
  }

  return (
    <div className="relative w-full">
      {/* Grid gallery */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[260px] sm:h-[350px] md:h-[450px] rounded-[12px] overflow-hidden relative">
        {/* Large Left Photo */}
        <div className="col-span-2 row-span-2 relative overflow-hidden bg-neutral-200 cursor-pointer">
          <img
            src={gridImages[0]}
            alt={title}
            onClick={() => setShowAllPhotos(true)}
            className="w-full h-full object-cover hover:brightness-90 transition-all duration-200"
          />
        </div>
        
        {/* Four smaller photos on the right */}
        <div className="relative overflow-hidden bg-neutral-200 cursor-pointer">
          <img
            src={gridImages[1]}
            alt={title}
            onClick={() => setShowAllPhotos(true)}
            className="w-full h-full object-cover hover:brightness-90 transition-all duration-200"
          />
        </div>
        <div className="relative overflow-hidden bg-neutral-200 rounded-tr-[12px] cursor-pointer">
          <img
            src={gridImages[2]}
            alt={title}
            onClick={() => setShowAllPhotos(true)}
            className="w-full h-full object-cover hover:brightness-90 transition-all duration-200"
          />
        </div>
        <div className="relative overflow-hidden bg-neutral-200 cursor-pointer">
          <img
            src={gridImages[3]}
            alt={title}
            onClick={() => setShowAllPhotos(true)}
            className="w-full h-full object-cover hover:brightness-90 transition-all duration-200"
          />
        </div>
        <div className="relative overflow-hidden bg-neutral-200 rounded-br-[12px] cursor-pointer">
          <img
            src={gridImages[4]}
            alt={title}
            onClick={() => setShowAllPhotos(true)}
            className="w-full h-full object-cover hover:brightness-90 transition-all duration-200"
          />
        </div>

        {/* Show all photos button */}
        <button
          onClick={() => setShowAllPhotos(true)}
          className="absolute bottom-6 right-6 z-10 flex items-center gap-2 px-4 py-2 border border-neutral-800 bg-white hover:bg-neutral-50 text-[#222222] font-semibold text-xs rounded-lg shadow-md cursor-pointer transition-transform active:scale-95"
        >
          <Grid size={14} />
          <span>Show all photos</span>
        </button>
      </div>

      {/* Full screen photos modal */}
      <AnimatePresence>
        {showAllPhotos && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed inset-0 z-50 bg-white dark:bg-[#121212] overflow-y-auto"
          >
            {/* Header control */}
            <div className="sticky top-0 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xs flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-850 z-20">
              <button
                onClick={() => setShowAllPhotos(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-full transition-colors cursor-pointer text-[#222222] dark:text-white"
              >
                <X size={18} />
              </button>
              <h2 className="text-sm font-bold text-[#222222] dark:text-white">Photos of {title}</h2>
              <div className="w-8 h-8" />
            </div>

            {/* Scrollable Photos list */}
            <div className="max-w-3xl mx-auto flex flex-col gap-4 py-8 px-6">
              {images.map((img) => (
                <div key={img.id} className="w-full aspect-video rounded-lg overflow-hidden bg-neutral-200">
                  <img src={img.url} alt={title} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
