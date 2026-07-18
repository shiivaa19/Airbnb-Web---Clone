'use client';

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import Modal from '../common/Modal';

const footerDetails: Record<string, { title: string; content: string }> = {
  "Help Center": {
    title: "Airbnb Help Center",
    content: "Welcome to the Airbnb Help Center. Here you can find articles and guides on how to manage your trips, contact hosts, resolve billing issues, or understand guest safety guidelines."
  },
  "AirCover": {
    title: "AirCover Protection",
    content: "AirCover provides comprehensive protection for every guest. It includes booking protection, check-in guarantee, get-what-you-booked guarantee, and a 24-hour safety line."
  },
  "Anti-discrimination": {
    title: "Our Anti-Discrimination Policy",
    content: "Airbnb is committed to building a community where everyone is treated with respect. Our non-discrimination policy ensures all members feel safe, respected, and welcomed regardless of race, religion, or background."
  },
  "Disability support": {
    title: "Accessibility & Disability Support",
    content: "We believe travel should be accessible to all. Read about our accessibility features, request assistance, or review accessibility requirements for hosts listing their homes."
  },
  "Cancellation options": {
    title: "Cancellation Options & Policies",
    content: "Review flexible cancellation options. Learn how refunds work under different policies (flexible, moderate, strict) and how to request cancellations under extenuating circumstances."
  },
  "Airbnb your home": {
    title: "Become an Airbnb Host",
    content: "Become a host on Airbnb! Earn passive income by sharing your extra room, apartment, or vacation villa. Learn about setup guides, pricing models, and safety insurance."
  },
  "AirCover for Hosts": {
    title: "AirCover for Hosts Protection",
    content: "AirCover for Hosts provides top-tier protection. It includes $3M damage protection, $1M liability insurance, income loss protection, deep cleaning protection, and pet damage safety."
  },
  "Hosting resources": {
    title: "Host Resource Center",
    content: "Explore resources for hosts. Discover tips on designing your space, taking professional photos, improving guest reviews, and optimizing search ranking factors."
  },
  "Community forum": {
    title: "Airbnb Host Community Forum",
    content: "Join the Airbnb Host Community Forum. Connect with experienced hosts worldwide, share hosting stories, trade tips, ask questions, and attend local hosting meetups."
  },
  "Hosting responsibly": {
    title: "Hosting Responsibly Guidelines",
    content: "Hosting responsibly is key. Learn about local housing laws, safety requirements (fire safety, occupancy rules), tax regulations, and how to respect neighbors."
  },
  "Newsroom": {
    title: "Airbnb Newsroom",
    content: "Airbnb Newsroom. Read our latest press releases, product updates, winter/summer release highlights, guest travel trends, and stories from our worldwide community."
  },
  "New features": {
    title: "New Product Features",
    content: "Check out what's new in our Summer 2026 Release! Explore features like guest favorites, upgraded host dashboards, custom date ranges, and advanced price density histograms."
  },
  "Careers": {
    title: "Careers at Airbnb",
    content: "Join the Airbnb Team! We are hiring Full Stack SDEs, UI/UX Designers, Product Managers, and Data Engineers. Explore our culture of pairing, clean architecture, and belonging."
  },
  "Investors": {
    title: "Investor Relations",
    content: "Airbnb Investor Relations. Review our quarterly earnings results, financial statements, annual reports, shareholder letters, and governance documentation."
  },
  "Gift cards": {
    title: "Airbnb Gift Cards",
    content: "Airbnb Gift Cards. Give the gift of travel and belonging. Purchase virtual or physical gift cards, redeem codes, or check your card balances here."
  },
  "Terms": {
    title: "Terms of Service",
    content: "Please review our standard terms of service governing payments, user behaviors, host responsibilities, and arbitration guidelines."
  },
  "Sitemap": {
    title: "Website Sitemap",
    content: "Explore the main directories of Airbnb: Explore Grid, Host Dashboard, Trips billing history, and Wishlists."
  },
  "Privacy": {
    title: "Privacy Policy",
    content: "Read our privacy choices. We protect your personal profile details, payment methods data, and listing records with advanced data security tools."
  },
  "Your Privacy Choices": {
    title: "Your Privacy Options",
    content: "Toggle tracking options, cookies consent, personalized listings recommendations, and how your profile metadata is shared under safety rules."
  }
};

export default function Footer() {
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);

  const handleLinkClick = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    const info = footerDetails[label];
    if (info) {
      setModalContent(info);
    }
  };

  return (
    <footer className="w-full bg-[#F7F7F7] dark:bg-[#1A1A1A] border-t border-neutral-200 dark:border-neutral-800 text-sm text-[#222222] dark:text-neutral-400 py-10 mt-auto select-none">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h3 className="font-bold text-neutral-800 dark:text-white mb-4">Support</h3>
          <ul className="flex flex-col gap-3 font-normal">
            <li><button onClick={(e) => handleLinkClick(e, "Help Center")} className="hover:underline cursor-pointer text-left">Help Center</button></li>
            <li><button onClick={(e) => handleLinkClick(e, "AirCover")} className="hover:underline cursor-pointer text-left">AirCover</button></li>
            <li><button onClick={(e) => handleLinkClick(e, "Anti-discrimination")} className="hover:underline cursor-pointer text-left">Anti-discrimination</button></li>
            <li><button onClick={(e) => handleLinkClick(e, "Disability support")} className="hover:underline cursor-pointer text-left">Disability support</button></li>
            <li><button onClick={(e) => handleLinkClick(e, "Cancellation options")} className="hover:underline cursor-pointer text-left">Cancellation options</button></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-neutral-800 dark:text-white mb-4">Hosting</h3>
          <ul className="flex flex-col gap-3 font-normal">
            <li><button onClick={(e) => handleLinkClick(e, "Airbnb your home")} className="hover:underline cursor-pointer text-left">Airbnb your home</button></li>
            <li><button onClick={(e) => handleLinkClick(e, "AirCover for Hosts")} className="hover:underline cursor-pointer text-left">AirCover for Hosts</button></li>
            <li><button onClick={(e) => handleLinkClick(e, "Hosting resources")} className="hover:underline cursor-pointer text-left">Hosting resources</button></li>
            <li><button onClick={(e) => handleLinkClick(e, "Community forum")} className="hover:underline cursor-pointer text-left">Community forum</button></li>
            <li><button onClick={(e) => handleLinkClick(e, "Hosting responsibly")} className="hover:underline cursor-pointer text-left">Hosting responsibly</button></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-neutral-800 dark:text-white mb-4">Airbnb</h3>
          <ul className="flex flex-col gap-3 font-normal">
            <li><button onClick={(e) => handleLinkClick(e, "Newsroom")} className="hover:underline cursor-pointer text-left">Newsroom</button></li>
            <li><button onClick={(e) => handleLinkClick(e, "New features")} className="hover:underline cursor-pointer text-left">New features</button></li>
            <li><button onClick={(e) => handleLinkClick(e, "Careers")} className="hover:underline cursor-pointer text-left">Careers</button></li>
            <li><button onClick={(e) => handleLinkClick(e, "Investors")} className="hover:underline cursor-pointer text-left">Investors</button></li>
            <li><button onClick={(e) => handleLinkClick(e, "Gift cards")} className="hover:underline cursor-pointer text-left">Gift cards</button></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 font-normal text-xs text-neutral-500">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <span>&copy; {new Date().getFullYear()} Airbnb, Inc.</span>
          <span>&bull;</span>
          <button onClick={(e) => handleLinkClick(e, "Terms")} className="hover:underline cursor-pointer">Terms</button>
          <span>&bull;</span>
          <button onClick={(e) => handleLinkClick(e, "Sitemap")} className="hover:underline cursor-pointer">Sitemap</button>
          <span>&bull;</span>
          <button onClick={(e) => handleLinkClick(e, "Privacy")} className="hover:underline cursor-pointer">Privacy</button>
          <span>&bull;</span>
          <button onClick={(e) => handleLinkClick(e, "Your Privacy Choices")} className="hover:underline cursor-pointer">Your Privacy Choices</button>
        </div>
        <div className="flex items-center gap-6 font-semibold text-[#222222] dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <Globe size={14} />
            <span>English (US)</span>
          </div>
          <span>$ USD</span>
        </div>
      </div>

      {/* Info Detail Modal */}
      <Modal 
        isOpen={modalContent !== null} 
        onClose={() => setModalContent(null)} 
        title={modalContent?.title || ''} 
        size="sm"
      >
        <div className="p-2 flex flex-col gap-4 font-normal text-sm text-neutral-600 dark:text-neutral-350 leading-relaxed">
          <p>{modalContent?.content}</p>
          <button 
            onClick={() => setModalContent(null)}
            className="w-full py-2.5 bg-[#222222] dark:bg-white text-white dark:text-[#222222] hover:bg-black dark:hover:bg-neutral-100 font-bold rounded-lg transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </Modal>
    </footer>
  );
}
