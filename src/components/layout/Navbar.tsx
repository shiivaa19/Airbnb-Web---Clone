'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, Menu, Search, User as UserIcon, LogOut, Sun, Moon, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/auth-store';
import { useModalStore } from '../../store/modal-store';
import { useSearchStore } from '../../store/search-store';
import { useWishlistStore } from '../../store/wishlist-store';
import { useToastStore } from '../../store/toast-store';
import apiClient from '../../services/api-client';
import FiltersModal from '../common/FiltersModal';

// Category Icons Mapping
import {
  Compass,
  Flame,
  Waves,
  Mountain,
  Trees,
  Umbrella,
  Building2,
  Palmtree,
} from 'lucide-react';

const categoriesList = [
  { name: 'All', icon: Compass },
  { name: 'Beachfront', icon: Umbrella },
  { name: 'Cabins', icon: Trees },
  { name: 'Mansions', icon: Building2 },
  { name: 'Trending', icon: Flame },
  { name: 'Lakefront', icon: Waves },
  { name: 'Countryside', icon: Mountain },
  { name: 'Desert', icon: Sun },
  { name: 'Islands', icon: Palmtree },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { openLogin, openSignup, openSearch } = useModalStore();
  const { category, setCategory, location, checkIn, checkOut, guests } = useSearchStore();
  const setFavorites = useWishlistStore((state) => state.setFavorites);
  const addToast = useToastStore((state) => state.addToast);

  // Sync favorites on user login
  useEffect(() => {
    if (isAuthenticated) {
      apiClient
        .get('/favorites')
        .then((res) => {
          setFavorites(res.data.map((fav: any) => fav.id));
        })
        .catch(() => {});
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, setFavorites]);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      window.document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      window.document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  // Dark mode toggler
  const toggleDarkMode = () => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };


  // Close dropdown on outside click
  useEffect(() => {
    const handleClose = () => setIsMenuOpen(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogoutClick = () => {
    logout();
    router.push('/');
  };

  const verifyHostAccessAndNavigate = () => {
    const pwd = window.prompt("Enter password to access Host Dashboard:");
    if (pwd === "12301230") {
      router.push('/host');
      setIsMenuOpen(false);
    } else if (pwd !== null) {
      addToast("Invalid password. Access denied.", "error");
    }
  };

  const handleHostClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLogin();
    } else {
      verifyHostAccessAndNavigate();
    }
  };

  const handleHostDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    verifyHostAccessAndNavigate();
  };

  const handleSurpriseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const cities = ['Tokyo', 'Paris', 'Aspen', 'Santorini', 'Kyoto', 'Malibu', 'Rome', 'New York', 'Sydney', 'Cairo'];
    let count = 0;
    
    addToast("🎡 Spinning the wheel of destinations...", "info");
    
    const interval = setInterval(() => {
      const tempCity = cities[Math.floor(Math.random() * cities.length)];
      useSearchStore.getState().setFilters({ location: tempCity });
      count++;
      
      if (count > 7) {
        clearInterval(interval);
        const finalCity = cities[Math.floor(Math.random() * cities.length)];
        useSearchStore.getState().setFilters({ location: finalCity });
        addToast(`🎯 Destination selected: ${finalCity}! Enjoy your trip!`, "success");
      }
    }, 150);
  };

  // Format search tag representation
  const getSearchLabel = () => {
    const parts = [];
    if (location) parts.push(location);
    else parts.push('Anywhere');

    if (checkIn && checkOut) {
      const inDate = new Date(checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      parts.push(inDate);
    } else {
      parts.push('Any week');
    }

    if (guests > 1) parts.push(`${guests} guests`);
    else parts.push('Add guests');

    return parts.join(' • ');
  };

  // Render Category ribbon only on homepage
  const isHomePage = pathname === '/';

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#121212] border-b border-neutral-150 dark:border-neutral-850 shadow-xs">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 h-20 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <svg
            className="hidden md:block h-[32px] w-auto fill-[#FF385C]"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.708-3.386l-.257-.26-.172-.178a31.061 31.061 0 0 1-.366-.396l-.265-.3c-.004-.004-.008-.007-.012-.011L16 26.31l-.283.332-.266.3c-.12.13-.243.262-.367.396l-.171.177-.257.262c-2.152 2.128-4.484 3.386-6.708 3.386-3.48 0-6.357-2.416-6.357-6.478l.002-.228.009-.415c.05-.924.293-1.805.96-3.396l.146-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.298 0-2.275.688-3.23 2.395l-.534 1.024c-1.926 3.774-6.07 12.457-7.051 14.747l-.119.288c-.53 1.263-.73 1.956-.777 2.604l-.008.293-.001.121c0 2.693 1.8 4.25 4.157 4.25 1.542 0 3.364-.99 5.342-2.946l.28-.282.16-.168c.112-.12.227-.246.345-.375l.248-.28.136-.16a10.375 10.375 0 0 0 .61-.832l.065-.102.046-.08.016-.032.008-.018L16 21.31l.07.135.008.018.016.032.046.08.065.102c.162.268.368.547.61.832l.136.16.248.28c.118.13.233.255.345.375l.16.168.28.282c1.978 1.956 3.8 2.946 5.342 2.946 2.358 0 4.157-1.557 4.157-4.25l-.001-.121-.008-.293c-.047-.648-.247-1.341-.777-2.604l-.119-.288c-.98-2.29-5.125-10.973-7.05-14.747l-.535-1.024C18.275 3.688 17.298 3 16 3zm0 9c2.197 0 3.992 1.835 3.992 4.086 0 2.19-1.77 3.974-3.946 4.08l-.228.006c-2.197 0-3.992-1.835-3.992-4.086 0-2.19 1.77-3.974 3.946-4.08l.228-.006zm0 2c-1.1 0-1.992.934-1.992 2.086 0 1.112.853 2.018 1.923 2.08l.069.006c1.1 0 1.992-.934 1.992-2.086 0-1.112-.853-2.018-1.923-2.08L16 14z" />
          </svg>
          {/* SVG Icon for mobile */}
          <svg className="md:hidden h-[32px] w-auto fill-[#FF385C]" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.708-3.386l-.257-.26-.172-.178a31.061 31.061 0 0 1-.366-.396l-.265-.3c-.004-.004-.008-.007-.012-.011L16 26.31l-.283.332-.266.3c-.12.13-.243.262-.367.396l-.171.177-.257.262c-2.152 2.128-4.484 3.386-6.708 3.386-3.48 0-6.357-2.416-6.357-6.478l.002-.228.009-.415c.05-.924.293-1.805.96-3.396l.146-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1z" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-[#FF385C] hidden xl:inline-block">
            airbnb
          </span>
        </Link>

        {/* Dynamic Expandable Search Bar */}
        <button
          onClick={openSearch}
          className="flex items-center h-12 rounded-full border border-neutral-200 dark:border-neutral-800 py-2 pl-6 pr-2 shadow-xs hover:shadow-md transition-shadow cursor-pointer max-w-sm sm:max-w-md md:max-w-lg flex-1"
        >
          <span className="text-sm font-semibold text-[#222222] dark:text-white truncate text-left flex-1">
            {getSearchLabel()}
          </span>
          <div className="w-8 h-8 rounded-full bg-[#FF385C] flex items-center justify-center text-white shrink-0">
            <Search size={14} strokeWidth={3} />
          </div>
        </button>

        {/* User Utilities */}
        <div className="flex items-center gap-3 shrink-0 relative">
          {/* Host Switch Link */}
          <button
            onClick={handleHostClick}
            className="hidden lg:block text-sm font-semibold py-2.5 px-4 rounded-full bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-neutral-800 dark:text-white transition-colors"
          >
            Airbnb your home
          </button>

          {/* Dark Mode Switcher */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-neutral-800 dark:text-white transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Menu Dropdown Button */}
          <button
            onClick={handleMenuToggle}
            className="flex items-center gap-3 h-10 border border-neutral-200 dark:border-neutral-800 rounded-full py-1.5 pl-3 pr-1.5 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-[#1C1C1E]"
          >
            <Menu size={16} className="text-neutral-500 dark:text-neutral-400" />
            <div className="w-8 h-8 rounded-full bg-neutral-500 text-white flex items-center justify-center overflow-hidden">
              {isAuthenticated && user?.profile_image ? (
                <img src={user.profile_image} alt={user.first_name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={18} />
              )}
            </div>
          </button>

          {/* Dropdown Menu Panel */}
          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-60 bg-white dark:bg-[#1C1C1E] border border-neutral-100 dark:border-neutral-800 rounded-[12px] shadow-xl py-2 z-50 text-sm overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="font-semibold text-neutral-800 dark:text-white truncate">
                      Hello, {user?.first_name}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/trips"
                    className="block px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-normal transition-colors text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white"
                  >
                    My trips
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-normal transition-colors text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white"
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={handleHostDashboardClick}
                    className="w-full text-left block px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-normal transition-colors border-t border-neutral-100 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    Host Dashboard
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-red-500 font-semibold transition-colors border-t border-neutral-100 dark:border-neutral-800 cursor-pointer"
                  >
                    <span>Log out</span>
                    <LogOut size={14} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={openSignup}
                    className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-semibold cursor-pointer text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white"
                  >
                    Sign up
                  </button>
                  <button
                    onClick={openLogin}
                    className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-normal cursor-pointer text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white"
                  >
                    Log in
                  </button>
                  <hr className="border-neutral-100 dark:border-neutral-800 my-1" />
                  <button
                    onClick={openLogin}
                    className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-normal cursor-pointer text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white"
                  >
                    Airbnb your home
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Ribbon tabs: Only render on homepage */}
      {isHomePage && (
        <div className="w-full border-t border-neutral-100 dark:border-neutral-850 bg-white dark:bg-[#121212]">
          <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 h-20 flex items-center justify-between gap-6">
            <div className="flex items-center gap-8 overflow-x-auto hide-scrollbar flex-1 py-2">
              {categoriesList.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    className={`
                      flex flex-col items-center gap-2 pb-2 shrink-0 border-b-2 transition-all cursor-pointer select-none group
                      ${isSelected 
                        ? 'border-[#222222] dark:border-white text-[#222222] dark:text-white font-semibold' 
                        : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-[#222222] dark:hover:text-white hover:border-neutral-200 dark:hover:border-neutral-800 font-medium'
                      }
                    `}
                  >
                    <Icon 
                      size={24} 
                      className={`
                        ${isSelected 
                          ? 'text-[#222222] dark:text-white' 
                          : 'text-neutral-500 dark:text-neutral-400 group-hover:text-[#222222] dark:group-hover:text-white'
                        }
                        transition-colors
                      `} 
                    />
                    <span className="text-xs tracking-tight">{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleSurpriseClick}
                className="flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:shadow-md transition-shadow font-bold text-xs text-neutral-800 dark:text-white cursor-pointer select-none"
              >
                <span>Surprise Me 🎡</span>
              </button>
              
              <button
                onClick={() => setIsFiltersOpen(true)}
                className="flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:shadow-md transition-shadow font-semibold text-xs text-neutral-800 dark:text-white cursor-pointer"
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters Modal Panel */}
      <FiltersModal isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} />
    </header>
  );
}
