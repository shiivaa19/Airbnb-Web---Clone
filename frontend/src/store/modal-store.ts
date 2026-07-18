import { create } from 'zustand';

interface ModalState {
  isLoginOpen: boolean;
  isSignupOpen: boolean;
  isSearchOpen: boolean;
  isBookingSuccessOpen: boolean;
  
  openLogin: () => void;
  closeLogin: () => void;
  openSignup: () => void;
  closeSignup: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openBookingSuccess: () => void;
  closeBookingSuccess: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isLoginOpen: false,
  isSignupOpen: false,
  isSearchOpen: false,
  isBookingSuccessOpen: false,
  
  openLogin: () => set({ isLoginOpen: true, isSignupOpen: false }),
  closeLogin: () => set({ isLoginOpen: false }),
  openSignup: () => set({ isSignupOpen: true, isLoginOpen: false }),
  closeSignup: () => set({ isSignupOpen: false }),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  openBookingSuccess: () => set({ isBookingSuccessOpen: true }),
  closeBookingSuccess: () => set({ isBookingSuccessOpen: false }),
}));
