'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Listing } from '../../types';

// Dynamically import MapContainer with SSR disabled.
// Leaflet uses client-only window APIs and cannot be rendered on the server.
const DynamicMapContainer = dynamic(
  () => import('./MapContainer'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900 rounded-[12px] flex items-center justify-center border border-neutral-200 dark:border-neutral-800 animate-pulse">
        <span className="text-sm text-neutral-400">Loading interactive map...</span>
      </div>
    ),
  }
);

interface MapProps {
  listings: Listing[];
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
}

export default function Map({ listings, center, zoom, interactive }: MapProps) {
  return <DynamicMapContainer listings={listings} center={center} zoom={zoom} interactive={interactive} />;
}
