'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, Map, User } from 'lucide-react';
import { useAuthStore } from '../../store/auth-store';
import { useModalStore } from '../../store/modal-store';

export default function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const openLogin = useModalStore((state) => state.openLogin);

  const tabs = [
    {
      label: 'Explore',
      icon: Search,
      href: '/',
    },
    {
      label: 'Wishlists',
      icon: Heart,
      href: '/wishlist',
      auth: true,
    },
    {
      label: 'Trips',
      icon: Map,
      href: '/trips',
      auth: true,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#121212] border-t border-neutral-200 dark:border-neutral-800 h-16 px-6 flex items-center justify-between">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        
        const handleClick = (e: React.MouseEvent) => {
          if (tab.auth && !isAuthenticated) {
            e.preventDefault();
            openLogin();
          }
        };

        return (
          <Link
            key={tab.label}
            href={tab.href}
            onClick={handleClick}
            className={`
              flex flex-col items-center gap-1 text-[10px] cursor-pointer select-none
              ${isActive 
                ? 'text-[#FF385C] font-semibold' 
                : 'text-neutral-500 hover:text-[#222222] dark:hover:text-white'
              }
            `}
          >
            <Icon size={20} className={isActive ? 'text-[#FF385C]' : 'text-neutral-500'} />
            <span>{tab.label}</span>
          </Link>
        );
      })}

      {/* Profile Tab */}
      <button
        onClick={() => {
          if (!isAuthenticated) openLogin();
        }}
        className={`
          flex flex-col items-center gap-1 text-[10px] cursor-pointer select-none
          ${pathname.startsWith('/host') || pathname === '/trips'
            ? 'text-[#FF385C] font-semibold'
            : 'text-neutral-500'
          }
        `}
      >
        {isAuthenticated && user?.profile_image ? (
          <img
            src={user.profile_image}
            alt={user.first_name}
            className="w-5 h-5 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
          />
        ) : (
          <User size={20} />
        )}
        <span>{isAuthenticated ? user?.first_name : 'Log in'}</span>
      </button>
    </div>
  );
}
