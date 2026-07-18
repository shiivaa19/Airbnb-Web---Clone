'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Listing } from '../../types';
import Link from 'next/link';

interface MapContainerProps {
  listings: Listing[];
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
}

// Viewport controller to dynamically re-center Leaflet map on searches
function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapContainerComponent({
  listings,
  center = [34.0522, -118.2437], // Default to Los Angeles
  zoom = 10,
  interactive = true,
}: MapContainerProps) {
  // Solve standard Leaflet icon path resolution bugs in Next.js
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Create an authentic Airbnb price bubble icon
  const createPriceIcon = (price: number) => {
    return L.divIcon({
      className: 'custom-map-marker',
      html: `<span>$${Math.round(price)}</span>`,
      iconSize: [64, 28],
      iconAnchor: [32, 14],
    });
  };

  // Determine center based on listings if available
  const mapCenter: [number, number] =
    listings.length === 1
      ? [listings[0].latitude, listings[0].longitude]
      : listings.length > 1
      ? [
          listings.reduce((sum, l) => sum + l.latitude, 0) / listings.length,
          listings.reduce((sum, l) => sum + l.longitude, 0) / listings.length,
        ]
      : center;

  // Determine dynamic zoom based on listings density
  const currentZoom = listings.length === 1 ? 12 : listings.length > 1 ? 10 : 3;

  return (
    <div className="w-full h-full relative rounded-[12px] overflow-hidden border border-neutral-200 dark:border-neutral-800">
      <MapContainer
        center={mapCenter}
        zoom={currentZoom}
        scrollWheelZoom={interactive}
        zoomControl={interactive}
        dragging={interactive}
        className="w-full h-full"
      >
        <ChangeMapView center={mapCenter} zoom={currentZoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Modern clean map tiles
        />
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={createPriceIcon(listing.price_per_night)}
          >
            <Popup closeButton={false}>
              <Link href={`/listings/${listing.id}`} className="block w-[180px] p-2 hover:opacity-95">
                {listing.images && listing.images.length > 0 && (
                  <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    className="w-full h-[95px] object-cover rounded-md mb-2"
                  />
                )}
                <div className="font-bold text-xs line-clamp-1 mb-0.5 text-[#222222] dark:text-neutral-200">{listing.title}</div>
                <div className="text-xs text-neutral-500 mb-1">{listing.city}, {listing.country}</div>
                <div className="text-xs font-bold text-[#222222] dark:text-neutral-200">
                  ${listing.price_per_night} <span className="font-normal text-neutral-500">/ night</span>
                </div>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
