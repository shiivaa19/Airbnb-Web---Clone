'use client';

import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  isAfter,
  parseISO,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  blockedDates?: string[]; // Array of 'YYYY-MM-DD'
}

export default function DateRangePicker({
  checkIn,
  checkOut,
  onChange,
  blockedDates = [],
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const checkInDate = checkIn ? parseISO(checkIn) : null;
  const checkOutDate = checkOut ? parseISO(checkOut) : null;

  // Navigate months
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => {
    // Prevent navigating to past months
    const today = new Date();
    if (isBefore(startOfMonth(currentMonth), startOfMonth(today))) return;
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleDateClick = (day: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isBefore(day, today)) return; // Past date
    
    const formatted = format(day, 'yyyy-MM-dd');
    if (blockedDates.includes(formatted)) return; // Blocked date

    if (!checkInDate || (checkInDate && checkOutDate)) {
      // Set Check-in
      onChange(formatted, '');
    } else {
      // Set Check-out
      if (isBefore(day, checkInDate)) {
        onChange(formatted, '');
      } else {
        // Enforce no blocked dates inside the selected range
        let tempDate = new Date(checkInDate);
        let hasBlockedDateInRange = false;
        while (isBefore(tempDate, day)) {
          tempDate.setDate(tempDate.getDate() + 1);
          const tempStr = format(tempDate, 'yyyy-MM-dd');
          if (blockedDates.includes(tempStr) && !isSameDay(tempDate, day)) {
            hasBlockedDateInRange = true;
            break;
          }
        }

        if (hasBlockedDateInRange) {
          // Reset check-in to clicked date instead
          onChange(formatted, '');
        } else {
          onChange(format(checkInDate, 'yyyy-MM-dd'), formatted);
        }
      }
    }
  };

  const renderMonthGrid = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
      <div className="flex flex-col gap-2 w-full select-none">
        {/* Month Header */}
        <div className="text-center font-bold text-sm text-neutral-800 dark:text-white pb-2">
          {format(monthDate, 'MMMM yyyy')}
        </div>

        {/* Weekdays Row */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-neutral-400">
          {weekdays.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#222222] dark:text-neutral-300">
          {days.map((day, idx) => {
            const formatted = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = day.getMonth() === monthDate.getMonth();
            const isPast = isBefore(day, today);
            const isBlocked = blockedDates.includes(formatted);
            const isDisabled = isPast || isBlocked;

            const isStart = checkInDate && isSameDay(day, checkInDate);
            const isEnd = checkOutDate && isSameDay(day, checkOutDate);
            const isInRange =
              checkInDate &&
              checkOutDate &&
              isAfter(day, checkInDate) &&
              isBefore(day, checkOutDate);

            return (
              <button
                key={idx}
                type="button"
                disabled={isDisabled || !isCurrentMonth}
                onClick={() => handleDateClick(day)}
                className={`
                  aspect-square flex items-center justify-center rounded-full transition-all relative cursor-pointer
                  ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
                  ${isDisabled ? 'text-neutral-300 dark:text-neutral-700 line-through cursor-not-allowed' : 'hover:border hover:border-neutral-800 dark:hover:border-white'}
                  ${isStart ? 'bg-[#FF385C] text-white hover:bg-[#FF385C]!' : ''}
                  ${isEnd ? 'bg-[#FF385C] text-white hover:bg-[#FF385C]!' : ''}
                  ${isInRange ? 'bg-[#FF385C]/10 dark:bg-[#FF385C]/20 rounded-none w-full h-full' : ''}
                  ${isToday(day) && !isStart && !isEnd ? 'border border-[#FF385C]' : ''}
                `}
              >
                <span>{day.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#1C1C1E] shadow-sm">
      {/* Month Navigation Control */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 border border-neutral-250 dark:border-neutral-700 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800 text-[#222222] dark:text-white cursor-pointer active:scale-95 transition-transform"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 border border-neutral-250 dark:border-neutral-700 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800 text-[#222222] dark:text-white cursor-pointer active:scale-95 transition-transform"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Calendar Grids side-by-side */}
      <div className="flex flex-col md:flex-row gap-8 justify-between">
        {renderMonthGrid(currentMonth)}
        <div className="hidden md:block w-full">
          {renderMonthGrid(addMonths(currentMonth, 1))}
        </div>
      </div>
    </div>
  );
}
