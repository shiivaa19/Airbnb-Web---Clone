import { create } from 'zustand';

interface WishlistState {
  favoriteIds: number[];
  setFavorites: (ids: number[]) => void;
  addFavoriteId: (id: number) => void;
  removeFavoriteId: (id: number) => void;
  hasFavoriteId: (id: number) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  favoriteIds: [],
  setFavorites: (ids) => set({ favoriteIds: ids }),
  addFavoriteId: (id) => set((state) => ({ favoriteIds: [...state.favoriteIds, id] })),
  removeFavoriteId: (id) => set((state) => ({ favoriteIds: state.favoriteIds.filter((favId) => favId !== id) })),
  hasFavoriteId: (id) => get().favoriteIds.includes(id),
}));
