import { create } from 'zustand';

export interface SearchFilters {
  location: string;
  checkIn: string | null;
  checkOut: string | null;
  guests: number;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  amenities: string[];
  recommendationType: 'all' | 'family' | 'couples' | 'budget' | 'luxury' | 'work' | 'none';
}

interface SearchState extends SearchFilters {
  setFilters: (filters: Partial<SearchFilters>) => void;
  setCategory: (category: string) => void;
  toggleAmenity: (amenity: string) => void;
  resetFilters: () => void;
}

const initialFilters: SearchFilters = {
  location: '',
  checkIn: null,
  checkOut: null,
  guests: 1,
  category: 'All', // Default category
  priceMin: null,
  priceMax: null,
  amenities: [],
  recommendationType: 'none',
};

export const useSearchStore = create<SearchState>((set) => ({
  ...initialFilters,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  setCategory: (category) => set({ category }),
  toggleAmenity: (amenity) => set((state) => {
    const exists = state.amenities.includes(amenity);
    const newAmenities = exists
      ? state.amenities.filter((a) => a !== amenity)
      : [...state.amenities, amenity];
    return { amenities: newAmenities };
  }),
  resetFilters: () => set({
    location: '',
    checkIn: null,
    checkOut: null,
    guests: 1,
    priceMin: null,
    priceMax: null,
    amenities: [],
    recommendationType: 'none',
  }),
}));
