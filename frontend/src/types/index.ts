export interface HostProfile {
  id: number;
  user_id: number;
  is_superhost: boolean;
  response_rate: number;
  response_time: string;
  identity_verified: boolean;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
  host_profile: HostProfile | null;
}

export interface ListingImage {
  id: number;
  listing_id: number;
  url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
}

export interface Listing {
  id: number;
  host_id: number;
  title: string;
  description: string;
  category: string;
  price_per_night: number;
  cleaning_fee: number;
  service_fee: number;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  created_at: string;
  updated_at: string;
  images: ListingImage[];
  amenities: Amenity[];
  rating: number | null;
  review_count: number;
  host?: User;
  blocked_dates?: string[]; // ISO strings 'YYYY-MM-DD'
}

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string; // ISO date
  check_out: string; // ISO date
  total_price: number;
  guest_count: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  listing?: Listing;
}

export interface BookingSummary {
  listing_id: number;
  check_in: string;
  check_out: string;
  guest_count: number;
  nights: number;
  price_per_night: number;
  base_total: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
}

export interface Review {
  id: number;
  listing_id: number;
  author_id: number;
  rating: number;
  comment: string;
  created_at: string;
  author: User;
}

export interface RevenueMonth {
  month: string;
  revenue: number;
}

export interface HostStats {
  total_listings: number;
  active_bookings_count: number;
  total_revenue: number;
  monthly_revenue: RevenueMonth[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
