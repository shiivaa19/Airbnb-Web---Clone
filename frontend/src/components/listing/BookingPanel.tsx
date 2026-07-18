'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth-store';
import { useModalStore } from '../../store/modal-store';
import { useToastStore } from '../../store/toast-store';
import apiClient from '../../services/api-client';
import { Listing, BookingSummary } from '../../types';
import { Star, CheckCircle, CreditCard, Shield, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import DateRangePicker from '../common/DateRangePicker';
import confetti from 'canvas-confetti';

interface BookingPanelProps {
  listing: Listing;
  blockedDates: string[]; // ISO string dates 'YYYY-MM-DD'
}

export default function BookingPanel({ listing, blockedDates = [] }: BookingPanelProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { openLogin } = useModalStore();
  const addToast = useToastStore((state) => state.addToast);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modals state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Payment mock inputs state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // AI packing checklist state
  const [checklistItems, setChecklistItems] = useState<{ text: string; checked: boolean }[]>([]);

  useEffect(() => {
    if (isSuccessOpen) {
      const cat = listing.category || 'All';
      let items: string[] = [];
      
      if (cat === 'Beachfront' || cat === 'Islands') {
        items = ['👙 Swimwear & beach gear', '🧴 Sunscreen SPF 50+', '🕶️ Polarized sunglasses', '🏖️ Quick-dry beach towel'];
      } else if (cat === 'Cabins' || cat === 'Countryside') {
        items = ['🧥 Heavy windproof jacket', '🥾 Rugged hiking boots', '🔦 Tactical flashlight', '🔋 High-capacity power bank'];
      } else {
        items = ['👟 Comfortable walking shoes', '🔌 Multi-country power adapter', '🎒 Compact daypack backpack', '📄 Offline travel documents'];
      }
      
      setChecklistItems(items.map(item => ({ text: item, checked: false })));
    }
  }, [isSuccessOpen, listing.category]);

  // Check if dates conflict with blocked list
  const isDateBlocked = (dateStr: string) => {
    return blockedDates.includes(dateStr);
  };

  // Run dynamic summary breakdown when inputs change
  useEffect(() => {
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      setSummary(null);
      setError(null);
      return;
    }

    // Check if any date in the range is blocked
    let start = new Date(checkIn);
    const end = new Date(checkOut);
    let hasBlockedDay = false;

    while (start < end) {
      const currentStr = start.toISOString().split('T')[0];
      if (isDateBlocked(currentStr)) {
        hasBlockedDay = true;
        break;
      }
      start.setDate(start.getDate() + 1);
    }

    if (hasBlockedDay) {
      setError('Some selected dates are blocked. Choose other dates.');
      setSummary(null);
      return;
    }

    setError(null);

    // Call API to pre-calculate checkout breakdown
    apiClient
      .post('/bookings/calculate-summary', {
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guest_count: guests,
      })
      .then((res) => {
        setSummary(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Invalid date range.');
      });
  }, [checkIn, checkOut, guests, listing.id]);

  const handleReserveClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    if (!summary || error) return;
    setIsPaymentOpen(true);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation for mock credit card details
    if (paymentMethod === 'card') {
      const rawCard = cardNumber.replace(/\s/g, '');
      if (rawCard.length !== 16) {
        addToast('Please enter a valid 16-digit card number.', 'error');
        return;
      }
      if (!cardExpiry || !cardExpiry.includes('/') || cardExpiry.length < 5) {
        addToast('Please enter card expiry in MM/YY format.', 'error');
        return;
      }
      if (cardCvv.length !== 3) {
        addToast('Please enter a valid 3-digit CVV.', 'error');
        return;
      }
      if (!cardName.trim()) {
        addToast('Please enter cardholder name.', 'error');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/bookings', {
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guest_count: guests,
      });
      addToast('Payment authorized and reservation confirmed!');
      setIsPaymentOpen(false);
      setIsSuccessOpen(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete booking. Try again.');
      addToast('Failed to complete booking.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Add date';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardCvv(value);
  };

  return (
    <>
      <div className="sticky top-28 border border-neutral-200 dark:border-neutral-800 rounded-[12px] p-6 bg-white dark:bg-[#1C1C1E] shadow-lg flex flex-col gap-4">
        
        {/* Price & Rating Header */}
        <div className="flex justify-between items-baseline mb-2">
          <div>
            <span className="text-2xl font-bold text-neutral-800 dark:text-white">${listing.price_per_night}</span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400"> night</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold">
            <Star size={12} className="fill-[#222222] stroke-[#222222] dark:fill-white dark:stroke-white" />
            <span>{listing.rating !== null ? listing.rating : 'New'}</span>
            <span className="text-neutral-400 font-normal">&bull;</span>
            <span className="text-neutral-500 underline font-normal">
              {listing.review_count} {listing.review_count === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleReserveClick} className="flex flex-col gap-4">
          <div className="flex flex-col border border-neutral-350 dark:border-neutral-700 rounded-lg overflow-hidden">
            
            {/* Clickable Date selection displays */}
            <div 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="grid grid-cols-2 border-b border-neutral-300 dark:border-neutral-700 cursor-pointer bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              {/* Check In */}
              <div className="flex flex-col p-2.5">
                <span className="text-[8px] font-bold uppercase text-neutral-500">CHECK-IN</span>
                <span className="text-xs font-semibold text-neutral-800 dark:text-white mt-1">
                  {formatDateDisplay(checkIn)}
                </span>
              </div>
              {/* Check Out */}
              <div className="flex flex-col p-2.5 border-l border-neutral-300 dark:border-neutral-700">
                <span className="text-[8px] font-bold uppercase text-neutral-500">CHECK-OUT</span>
                <span className="text-xs font-semibold text-neutral-800 dark:text-white mt-1">
                  {formatDateDisplay(checkOut)}
                </span>
              </div>
            </div>

            {/* Inline Date Range Picker */}
            {showDatePicker && (
              <div className="p-2 border-b border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1C1C1E]">
                <DateRangePicker
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={(ci, co) => {
                    setCheckIn(ci);
                    setCheckOut(co);
                    if (ci && co) {
                      setShowDatePicker(false);
                    }
                  }}
                  blockedDates={blockedDates}
                />
              </div>
            )}

            {/* Guests selection */}
            <div className="flex flex-col p-2.5">
              <label className="text-[8px] font-bold uppercase text-neutral-500">GUESTS</label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="text-xs font-semibold focus:outline-none bg-transparent text-neutral-800 dark:text-white dark:bg-[#1C1C1E] mt-1 cursor-pointer"
              >
                {Array.from({ length: listing.max_guests }).map((_, idx) => (
                  <option 
                    key={idx} 
                    value={idx + 1}
                    className="bg-white dark:bg-[#1C1C1E] text-neutral-800 dark:text-white"
                  >
                    {idx + 1} {idx === 0 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Validation/Error alerts */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {/* Reserve Button */}
          <button
            type="submit"
            disabled={loading || (checkIn !== '' && checkOut !== '' && !summary)}
            className="w-full py-3.5 text-white font-bold rounded-lg airbnb-gradient active:scale-98 transition-transform disabled:opacity-50 cursor-pointer text-sm"
          >
            {loading ? 'Reserving...' : 'Reserve'}
          </button>
          
          <div className="text-center text-xs text-neutral-500">You won&apos;t be charged yet</div>

          {/* Pricing Summary breakout */}
          {summary && (
            <div className="flex flex-col gap-3 mt-4 text-sm border-t border-neutral-100 dark:border-neutral-800 pt-4 font-normal">
              <div className="flex justify-between">
                <span className="underline text-neutral-500 dark:text-neutral-400">
                  ${summary.price_per_night} x {summary.nights} {summary.nights === 1 ? 'night' : 'nights'}
                </span>
                <span>${summary.base_total}</span>
              </div>
              <div className="flex justify-between">
                <span className="underline text-neutral-500 dark:text-neutral-400">Cleaning fee</span>
                <span>${summary.cleaning_fee}</span>
              </div>
              <div className="flex justify-between">
                <span className="underline text-neutral-500 dark:text-neutral-400">Airbnb service fee</span>
                <span>${summary.service_fee}</span>
              </div>
              <hr className="border-neutral-100 dark:border-neutral-800 my-1" />
              <div className="flex justify-between text-base font-bold text-neutral-800 dark:text-white">
                <span>Total before taxes</span>
                <span>${summary.total_price}</span>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Payment Processing Modal */}
      <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title="Confirm and pay" size="md">
        <div className="flex flex-col gap-5 p-1 font-normal text-xs text-neutral-600 dark:text-neutral-350">
          
          {/* Booking Info Box */}
          <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-neutral-800 dark:text-white text-sm line-clamp-1">{listing.title}</span>
              <span className="text-[10px] text-neutral-500">{listing.city}, {listing.country}</span>
              <div className="flex gap-2 text-[10px] text-neutral-400 mt-1">
                <span>{formatDateDisplay(checkIn)} - {formatDateDisplay(checkOut)}</span>
                <span>&bull;</span>
                <span>{guests} {guests === 1 ? 'guest' : 'guests'}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-[#FF385C]">${summary?.total_price}</span>
              <span className="block text-[9px] text-neutral-400">Total charge</span>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Select Payment Method</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-3.5 flex flex-col items-center justify-center gap-1.5 border rounded-xl font-bold cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#FF385C] bg-[#FF385C]/5 text-[#FF385C]'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-500 dark:text-neutral-300'
                }`}
              >
                <CreditCard size={18} />
                <span>Credit Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`py-3.5 flex flex-col items-center justify-center gap-1.5 border rounded-xl font-bold cursor-pointer transition-all ${
                  paymentMethod === 'paypal'
                    ? 'border-[#FF385C] bg-[#FF385C]/5 text-[#FF385C]'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-500 dark:text-neutral-300'
                }`}
              >
                <span className="text-base italic font-black text-blue-600 dark:text-blue-400">PayPal</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('apple')}
                className={`py-3.5 flex flex-col items-center justify-center gap-1.5 border rounded-xl font-bold cursor-pointer transition-all ${
                  paymentMethod === 'apple'
                    ? 'border-[#FF385C] bg-[#FF385C]/5 text-[#FF385C]'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-500 dark:text-neutral-300'
                }`}
              >
                <span className="text-base font-black text-neutral-800 dark:text-white"> Pay</span>
              </button>
            </div>
          </div>

          {/* PayPal / Apple Pay Mock Messaging */}
          {paymentMethod !== 'card' && (
            <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl my-2">
              <AlertCircle size={20} className="text-neutral-400 shrink-0" />
              <span>
                You will be redirected to complete your {paymentMethod === 'paypal' ? 'PayPal' : 'Apple Pay'} authorization in the next step.
              </span>
            </div>
          )}

          {/* Credit Card Input Form & Visual Mockup */}
          {paymentMethod === 'card' && (
            <div className="flex flex-col gap-4">
              
              {/* Virtual Credit Card Mockup */}
              <div className="relative h-44 w-full rounded-2xl bg-gradient-to-tr from-rose-500 via-[#E61E4D] to-[#FF385C] p-6 text-white flex flex-col justify-between shadow-lg overflow-hidden shrink-0 select-none">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-widest opacity-60">Gold Guest Card</span>
                    <span className="text-sm font-bold">Airbnb Reserve</span>
                  </div>
                  <div className="w-8 h-6 bg-white/20 rounded-md flex items-center justify-center font-bold text-[8px] uppercase tracking-wider">Chip</div>
                </div>
                
                <div className="text-lg font-bold tracking-widest my-2 font-mono">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[7px] uppercase tracking-wider opacity-60">Cardholder Name</span>
                    <span className="text-xs font-bold truncate max-w-[180px] tracking-wide uppercase">
                      {cardName || 'Guest Evaluator'}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[7px] uppercase tracking-wider opacity-60">Expires</span>
                      <span className="text-xs font-bold tracking-wider">{cardExpiry || 'MM/YY'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7px] uppercase tracking-wider opacity-60">CVV</span>
                      <span className="text-xs font-bold tracking-wider">{cardCvv || '•••'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleConfirmPayment} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-neutral-500 uppercase">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="border border-neutral-350 dark:border-neutral-700 rounded-lg p-2.5 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-550 font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-neutral-500 uppercase">Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="1234 5678 1234 5678"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="border border-neutral-350 dark:border-neutral-700 rounded-lg p-2.5 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-555 font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-neutral-500 uppercase">Expiry Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      className="border border-neutral-350 dark:border-neutral-700 rounded-lg p-2.5 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-555 font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-neutral-500 uppercase">CVV</label>
                    <input
                      type="password"
                      required
                      placeholder="123"
                      value={cardCvv}
                      onChange={handleCvvChange}
                      className="border border-neutral-350 dark:border-neutral-700 rounded-lg p-2.5 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-555 font-semibold"
                    />
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Secure Payment Footer Indicator */}
          <div className="flex items-center gap-2 text-[10px] text-neutral-400 bg-neutral-50 dark:bg-neutral-900/40 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800/80 mt-1 select-none">
            <Shield size={14} className="text-emerald-500 shrink-0" />
            <span>Secure 256-bit SSL encrypted connection. All mock transactions are processed immediately.</span>
          </div>

          {/* Action Trigger */}
          <div className="flex justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-1">
            <button
              type="button"
              disabled={loading}
              onClick={() => setIsPaymentOpen(false)}
              className="px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-850 font-bold rounded-lg cursor-pointer transition-colors text-neutral-700 dark:text-neutral-200"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleConfirmPayment}
              className="px-6 py-2.5 bg-[#FF385C] hover:bg-[#E61E4D] text-white font-bold rounded-lg transition-colors cursor-pointer text-center select-none active:scale-97 duration-100 flex items-center gap-2"
            >
              {loading ? 'Processing...' : `Pay $${summary?.total_price}`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Booking Success Modal */}
      <Modal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} title="Booking confirmed!" size="sm">
        <div className="flex flex-col items-center justify-center text-center p-4">
          <CheckCircle size={56} className="text-emerald-500 mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-2">Pack your bags!</h3>
          <p className="text-neutral-500 text-xs mb-4 max-w-xs">
            Your reservation at <span className="font-semibold text-neutral-700 dark:text-white">{listing.title}</span> has been confirmed. You can manage your booking under Trips.
          </p>

          {/* AI Checklist */}
          {checklistItems.length > 0 && (
            <div className="w-full text-left bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl mb-5 select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="text-[9px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-widest block mb-2">AI Packing Assistant</span>
              <div className="flex flex-col gap-2">
                {checklistItems.map((item, idx) => (
                  <label key={idx} className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-600 dark:text-neutral-350 hover:text-black dark:hover:text-white font-semibold">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => {
                        const updated = [...checklistItems];
                        updated[idx].checked = !updated[idx].checked;
                        setChecklistItems(updated);
                      }}
                      className="w-3.5 h-3.5 accent-[#FF385C]"
                    />
                    <span className={item.checked ? 'line-through text-neutral-400 dark:text-neutral-555' : ''}>{item.text}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setIsSuccessOpen(false);
              router.push('/trips');
            }}
            className="w-full py-3.5 text-white font-bold rounded-lg airbnb-gradient cursor-pointer active:scale-98 transition-transform text-sm"
          >
            Go to Trips
          </button>
        </div>
      </Modal>
    </>
  );
}
