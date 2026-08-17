'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  parsePhoneNumberFromString,
  getExampleNumber,
  AsYouType,
  type CountryCode,
} from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';

// ─── Types ──────────────────────────────────────────────────────────
interface PricingTier {
  id: number;
  minGuests: number;
  maxGuests: number;
  priceGel: number;
}

interface BookedSlot {
  startTime: string;
  endTime: string;
  status?: string;
}

interface OperatingHoursEntry {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

// ─── Country Data ───────────────────────────────────────────────────
const COUNTRIES: { code: CountryCode; name: string; dialCode: string; flag: string }[] = [
  { code: 'GE', name: 'Georgia', dialCode: '+995', flag: '🇬🇪' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', dialCode: '+380', flag: '🇺🇦' },
  { code: 'AZ', name: 'Azerbaijan', dialCode: '+994', flag: '🇦🇿' },
  { code: 'AM', name: 'Armenia', dialCode: '+374', flag: '🇦🇲' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
];

function detectCountryFromBrowser(): CountryCode {
  if (typeof navigator === 'undefined') return 'GE';
  const lang = navigator.language || '';
  const region = lang.split('-')[1]?.toUpperCase();
  if (region && COUNTRIES.find(c => c.code === region)) return region as CountryCode;
  // Fallback mappings
  const langMap: Record<string, CountryCode> = { ka: 'GE', ru: 'RU', uk: 'UA', tr: 'TR', de: 'DE', fr: 'FR', es: 'ES', it: 'IT', ja: 'JP', ko: 'KR', zh: 'CN' };
  const primary = lang.split('-')[0];
  return langMap[primary] || 'GE';
}

export default function BookingSection() {
  const t = useTranslations('booking');
  const locale = useLocale();

  // ─── State ──────────────────────────────────────────────────────
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>('GE');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [operatingHours, setOperatingHours] = useState<OperatingHoursEntry[]>([]);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState('');
  const [step, setStep] = useState(1); // 1: date+time, 2: details, 3: confirm

  // ─── Auto-detect country ───────────────────────────────────────
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country_code && COUNTRIES.find(c => c.code === data.country_code)) {
          setCountryCode(data.country_code as CountryCode);
        } else {
          setCountryCode(detectCountryFromBrowser());
        }
      })
      .catch(() => {
        setCountryCode(detectCountryFromBrowser());
      });
  }, []);

  // ─── Fetch pricing tiers ───────────────────────────────────────
  useEffect(() => {
    fetch('/api/pricing')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setPricingTiers(data); })
      .catch(() => {});
  }, []);

  // ─── Fetch operating hours ─────────────────────────────────────
  useEffect(() => {
    fetch('/api/operating-hours')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setOperatingHours(data); })
      .catch(() => {});
  }, []);

  const fetchBookingsForDate = useCallback((date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const cacheBuster = new Date().getTime();
    fetch(`/api/bookings?date=${dateStr}&t=${cacheBuster}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setBookedSlots(data); })
      .catch(() => {});
  }, []);

  // ─── Fetch booked slots when date changes & poll for updates ────
  useEffect(() => {
    if (!selectedDate) return;
    
    // Initial fetch
    fetchBookingsForDate(selectedDate);
    
    // Poll every 5 seconds to keep availability real-time
    const interval = setInterval(() => {
      fetchBookingsForDate(selectedDate);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [selectedDate, fetchBookingsForDate]);

  // ─── Calendar Logic ────────────────────────────────────────────
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (date >= today) {
      setSelectedDate(date);
      setSelectedTime(null);
      setBookingStatus('idle');
    }
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (date < today) return true;
    // Check if this day is closed
    const dayOfWeek = date.getDay();
    const dayHours = operatingHours.find(h => h.dayOfWeek === dayOfWeek);
    if (dayHours && dayHours.isClosed) return true;
    return false;
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const getTimeSlots = useCallback((): string[] => {
    if (!selectedDate) return [];

    const dayOfWeek = selectedDate.getDay();
    const dayHours = operatingHours.find(h => h.dayOfWeek === dayOfWeek);
    const openTime = dayHours?.openTime || '09:00';
    const closeTime = dayHours?.closeTime || '21:00';

    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    const slots: string[] = [];
    for (let m = openMinutes; m + 30 <= closeMinutes; m += 15) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
    return slots;
  }, [selectedDate, operatingHours]);

  const getSlotStatus = (timeStr: string): 'booked' | 'blocked' | null => {
    if (!selectedDate) return null;
    const [h, m] = timeStr.split(':').map(Number);
    const slotStart = new Date(selectedDate);
    slotStart.setHours(h, m, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);

    const match = bookedSlots.find(booked => {
      const bookedStart = new Date(booked.startTime);
      const bookedEnd = new Date(booked.endTime);
      return slotStart < bookedEnd && slotEnd > bookedStart;
    });

    return match ? (match.status === 'blocked' ? 'blocked' : 'booked') : null;
  };

  // Check if slot is in the past (for today)
  const isSlotPast = (timeStr: string): boolean => {
    if (!selectedDate) return false;
    const now = new Date();
    const [h, m] = timeStr.split(':').map(Number);
    const slotTime = new Date(selectedDate);
    slotTime.setHours(h, m, 0, 0);
    return slotTime <= now;
  };

  // ─── Price Calculation ─────────────────────────────────────────
  const getPrice = (): { price: number | null; label: string } => {
    for (const tier of pricingTiers) {
      if (guests >= tier.minGuests && guests <= tier.maxGuests) {
        return { price: tier.priceGel, label: `${tier.priceGel} ₾` };
      }
    }
    if (pricingTiers.length > 0) {
      return { price: null, label: t('contactUs') };
    }
    return { price: 0, label: '—' };
  };

  // ─── Phone Validation ─────────────────────────────────────────
  const validatePhone = (phone: string): boolean => {
    if (!phone) { setPhoneError(''); return false; }
    const country = COUNTRIES.find(c => c.code === countryCode);
    const fullNumber = (country?.dialCode || '') + phone.replace(/^0+/, '');
    const parsed = parsePhoneNumberFromString(fullNumber, countryCode);
    if (!parsed || !parsed.isValid()) {
      setPhoneError(t('invalidPhone'));
      return false;
    }
    setPhoneError('');
    return true;
  };

  const getPhonePlaceholder = (): string => {
    try {
      const example = getExampleNumber(countryCode, examples);
      if (example) {
        const national = example.formatNational();
        return national;
      }
    } catch { /* ignore */ }
    return '5XX XXX XXX';
  };

  const formatPhoneAsYouType = (value: string) => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    const fullNumber = (country?.dialCode || '') + value.replace(/^0+/, '');
    const formatter = new AsYouType(countryCode);
    const formatted = formatter.input(fullNumber);
    // Strip the country code prefix back off to show just the national part
    const dialCode = country?.dialCode || '';
    if (formatted.startsWith(dialCode)) {
      return formatted.slice(dialCode.length).trim();
    }
    return value;
  };

  // ─── Submit Booking ────────────────────────────────────────────
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !customerName || !customerPhone) return;

    const country = COUNTRIES.find(c => c.code === countryCode);
    const fullPhone = (country?.dialCode || '') + customerPhone.replace(/[^\d]/g, '').replace(/^0+/, '');

    if (!validatePhone(customerPhone)) return;

    setBookingStatus('processing');
    setBookingError('');

    const [h, m] = selectedTime.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(h, m, 0, 0);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail: customerEmail || undefined,
          customerPhone: fullPhone,
          guestCount: guests,
          startTime: startTime.toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setBookingError(data.error || 'Booking failed');
        setBookingStatus('error');
        return;
      }

      setBookingStatus('success');
      fetchBookingsForDate(selectedDate);
    } catch {
      setBookingError('Network error');
      setBookingStatus('error');
    }
  };

  // ─── Day labels (localized) ───────────────────────────────────
  const dayLabels = locale === 'ka'
    ? ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვრ']
    : locale === 'ru'
    ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const priceInfo = getPrice();
  const timeSlots = getTimeSlots();
  const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];

  // ─── Render ────────────────────────────────────────────────────
  return (
    <section id="booking" className="py-20 sm:py-28 relative overflow-hidden bg-[#06140e]/85 backdrop-blur-sm border-t border-[#c9a84c]/20">
      {/* Ambient background */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#18422e] rounded-full filter blur-[120px] opacity-30 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#1e422b] rounded-full filter blur-[120px] opacity-25 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#e5c973] uppercase mb-3 font-sans">
            {t('subtitle')}
          </h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#f5f0e8] mb-4">
            {t('title')}
          </h3>
        </div>

        {/* Success State */}
        {bookingStatus === 'success' ? (
          <div className="max-w-lg mx-auto bg-[#0e2a1d]/90 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border-2 border-[#c9a84c]/40 shadow-2xl text-center animate-fade-in">
            <div className="w-16 h-16 bg-[#c9a84c] text-[#06140e] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h4 className="text-2xl font-serif font-bold text-[#f5f0e8] mb-2">{t('confirmation.title')}</h4>
            <p className="text-white/70 mb-2 font-sans">{t('confirmation.message')}</p>
            {priceInfo.price && (
              <p className="text-lg font-bold text-[#c9a84c] mb-6">{t('total')}: {priceInfo.price} ₾</p>
            )}
            <button
              onClick={() => {
                setBookingStatus('idle');
                setStep(1);
                setSelectedDate(null);
                setSelectedTime(null);
                setCustomerName('');
                setCustomerEmail('');
                setCustomerPhone('');
                setGuests(2);
              }}
              className="px-8 py-3 bg-[#c9a84c] hover:bg-[#d4b85d] text-[#06140e] font-bold rounded-xl transition-all"
            >
              {t('confirmation.close')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ─── Left Column: Calendar + Timeline ───── */}
            <div className="lg:col-span-8 space-y-6">

              {/* Step 1 Header */}
              <div className="bg-[#0e2a1d]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-[#c9a84c]/30 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#e5c973] mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#c9a84c] text-[#06140e] font-sans font-bold flex items-center justify-center text-sm">1</span>
                  <span>{t('selectDate')}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <div className="bg-[#06140e]/90 rounded-2xl p-5 sm:p-6 border border-[#c9a84c]/20">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-bold font-serif text-[#f5f0e8] capitalize">
                        {currentDate.toLocaleString(locale === 'ka' ? 'ka-GE' : locale === 'ru' ? 'ru-RU' : 'default', { month: 'long', year: 'numeric' })}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={prevMonth} className="w-10 h-10 rounded-full bg-[#0e2a1d] border border-[#c9a84c]/40 hover:bg-[#c9a84c] hover:text-[#06140e] text-[#c9a84c] flex items-center justify-center transition-all active:scale-95" aria-label="Previous Month">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={nextMonth} className="w-10 h-10 rounded-full bg-[#0e2a1d] border border-[#c9a84c]/40 hover:bg-[#c9a84c] hover:text-[#06140e] text-[#c9a84c] flex items-center justify-center transition-all active:scale-95" aria-label="Next Month">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {dayLabels.map((day, idx) => (
                        <div key={idx} className="text-xs font-bold text-[#e5c973]/70 py-1 font-sans">{day}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 text-center">
                      {Array.from({ length: firstDay }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="h-10 sm:h-11" />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, idx) => {
                        const day = idx + 1;
                        const disabled = isDateDisabled(day);
                        const selected = isDateSelected(day);
                        return (
                          <button
                            key={day}
                            onClick={() => !disabled && handleDateClick(day)}
                            disabled={disabled}
                            className={`h-10 sm:h-11 w-full rounded-xl font-sans text-sm font-bold flex items-center justify-center transition-all ${
                              disabled
                                ? 'text-white/20 cursor-not-allowed bg-transparent'
                                : selected
                                ? 'bg-[#c9a84c] text-[#06140e] shadow-[0_0_15px_rgba(201,168,76,0.6)] scale-105'
                                : 'text-[#f5f0e8] bg-[#0e2a1d]/60 hover:bg-[#c9a84c]/20 hover:text-[#e5c973] border border-white/5'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slot Timeline */}
                  <div className="flex flex-col">
                    <h5 className="text-sm font-semibold text-[#e5c973] uppercase tracking-wider mb-3 font-sans">
                      {t('selectTime')}
                    </h5>

                    {!selectedDate ? (
                      <div className="flex-1 flex items-center justify-center bg-[#06140e]/60 rounded-2xl border border-dashed border-[#c9a84c]/20 p-8">
                        <p className="text-white/30 text-sm text-center">
                          {locale === 'ka' ? 'აირჩიეთ თარიღი' : locale === 'ru' ? 'Выберите дату' : 'Select a date first'}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-[#06140e]/90 rounded-2xl border border-[#c9a84c]/20 p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                          {timeSlots.map((time) => {
                            const slotStatus = getSlotStatus(time);
                            const past = isSlotPast(time);
                            const selected = selectedTime === time;
                            const disabled = slotStatus !== null || past;

                            return (
                              <button
                                key={time}
                                onClick={() => !disabled && setSelectedTime(time)}
                                disabled={disabled}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                  disabled
                                    ? 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-50'
                                    : selected
                                    ? 'bg-[#c9a84c] border-[#c9a84c] shadow-[0_0_15px_rgba(201,168,76,0.4)] transform scale-[1.02]'
                                    : 'bg-[#0e2a1d]/40 border-[#c9a84c]/20 hover:bg-[#c9a84c]/15 hover:border-[#c9a84c]/50'
                                }`}
                              >
                                <span className={`text-lg font-mono font-bold ${selected ? 'text-[#06140e]' : disabled ? 'text-white/40' : 'text-[#f5f0e8]'}`}>
                                  {time}
                                </span>
                                
                                {slotStatus === 'blocked' ? (
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500 mt-1">
                                    {locale === 'ka' ? 'მიუწვდომელია' : locale === 'ru' ? 'Недоступно' : 'Unavailable'}
                                  </span>
                                ) : slotStatus === 'booked' ? (
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-red-500 mt-1">
                                    {locale === 'ka' ? 'დაკავებული' : locale === 'ru' ? 'Занято' : 'Booked'}
                                  </span>
                                ) : past ? (
                                  <span className="text-[10px] uppercase tracking-wider text-white/30 mt-1">
                                    {locale === 'ka' ? 'გასული' : locale === 'ru' ? 'Прошло' : 'Past'}
                                  </span>
                                ) : (
                                  <span className={`text-[10px] mt-1 font-bold ${selected ? 'text-[#06140e]/70' : 'text-[#c9a84c]/70'}`}>
                                    30 {locale === 'ka' ? 'წთ' : locale === 'ru' ? 'мин' : 'min'}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Customer Details */}
              {selectedDate && selectedTime && (
                <div className="bg-[#0e2a1d]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-[#c9a84c]/30 shadow-[0_15px_40px_rgba(0,0,0,0.5)] animate-fade-in">
                  <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#e5c973] mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#c9a84c] text-[#06140e] font-sans font-bold flex items-center justify-center text-sm">2</span>
                    <span>{locale === 'ka' ? 'თქვენი მონაცემები' : locale === 'ru' ? 'Ваши данные' : 'Your Details'}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Name */}
                    <div>
                      <label htmlFor="booking-name" className="block text-xs font-semibold text-[#e5c973] uppercase tracking-wider mb-2 font-sans">
                        {locale === 'ka' ? 'სახელი *' : locale === 'ru' ? 'Имя *' : 'Name *'}
                      </label>
                      <input
                        id="booking-name"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={locale === 'ka' ? 'სახელი და გვარი' : locale === 'ru' ? 'Имя и Фамилия' : 'Full Name'}
                        className="w-full bg-[#06140e] border border-[#c9a84c]/30 rounded-xl px-4 py-3 text-[#f5f0e8] placeholder-white/25 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all font-sans"
                      />
                    </div>

                    {/* Email (optional) */}
                    <div>
                      <label htmlFor="booking-email" className="block text-xs font-semibold text-[#e5c973] uppercase tracking-wider mb-2 font-sans">
                        {locale === 'ka' ? 'ელ.ფოსტა' : locale === 'ru' ? 'Email' : 'Email'} <span className="text-white/30 normal-case">({locale === 'ka' ? 'არასავალდებულო' : locale === 'ru' ? 'необязательно' : 'optional'})</span>
                      </label>
                      <input
                        id="booking-email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full bg-[#06140e] border border-[#c9a84c]/30 rounded-xl px-4 py-3 text-[#f5f0e8] placeholder-white/25 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all font-sans"
                      />
                    </div>

                    {/* Phone with country code */}
                    <div className="md:col-span-2">
                      <label htmlFor="booking-phone" className="block text-xs font-semibold text-[#e5c973] uppercase tracking-wider mb-2 font-sans">
                        {locale === 'ka' ? 'ტელეფონი *' : locale === 'ru' ? 'Телефон *' : 'Phone *'}
                      </label>
                      <div className="flex gap-2">
                        {/* Country code picker */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowCountryPicker(!showCountryPicker)}
                            className="h-full bg-[#06140e] border border-[#c9a84c]/30 rounded-xl px-3 py-3 text-[#f5f0e8] font-mono text-sm flex items-center gap-2 hover:border-[#c9a84c] transition-all min-w-[110px]"
                          >
                            <span className="text-lg">{selectedCountry.flag}</span>
                            <span>{selectedCountry.dialCode}</span>
                            <svg className="w-3 h-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>

                          {showCountryPicker && (
                            <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-[#111827] border border-[#c9a84c]/30 rounded-xl shadow-2xl z-50">
                              {COUNTRIES.map((c) => (
                                <button
                                  key={c.code}
                                  onClick={() => { setCountryCode(c.code); setShowCountryPicker(false); setPhoneError(''); }}
                                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-[#c9a84c]/10 transition-all ${countryCode === c.code ? 'bg-[#c9a84c]/15 text-[#c9a84c]' : 'text-white/70'}`}
                                >
                                  <span className="text-lg">{c.flag}</span>
                                  <span className="flex-1">{c.name}</span>
                                  <span className="font-mono text-xs text-white/40">{c.dialCode}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <input
                          id="booking-phone"
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^\d\s\-()]/g, '');
                            setCustomerPhone(val);
                            if (phoneError) validatePhone(val);
                          }}
                          onBlur={() => customerPhone && validatePhone(customerPhone)}
                          placeholder={getPhonePlaceholder()}
                          className={`flex-1 bg-[#06140e] border rounded-xl px-4 py-3 text-[#f5f0e8] placeholder-white/25 focus:outline-none focus:ring-1 transition-all font-sans ${
                            phoneError ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-[#c9a84c]/30 focus:border-[#c9a84c] focus:ring-[#c9a84c]'
                          }`}
                        />
                      </div>
                      {phoneError && (
                        <p className="text-red-400 text-xs mt-1.5 font-sans">{phoneError}</p>
                      )}
                    </div>
                  </div>

                  {/* Guest Counter */}
                  <div className="mt-6 p-5 bg-[#06140e]/95 rounded-2xl border border-[#c9a84c]/30">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm sm:text-base font-bold text-[#e5c973] uppercase tracking-wider font-sans">
                        {t('guests')}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          className="w-11 h-11 rounded-xl bg-[#0e2a1d] border border-[#c9a84c]/40 text-[#c9a84c] font-bold text-xl flex items-center justify-center active:scale-90 hover:bg-[#c9a84c] hover:text-[#06140e] transition-all cursor-pointer"
                          aria-label="Decrease Guests"
                        >
                          &minus;
                        </button>
                        <span className="text-xl font-bold text-[#f5f0e8] min-w-[32px] text-center font-serif">
                          {guests}
                        </span>
                        <button
                          type="button"
                          onClick={() => setGuests(guests + 1)}
                          className="w-11 h-11 rounded-xl bg-[#0e2a1d] border border-[#c9a84c]/40 text-[#c9a84c] font-bold text-xl flex items-center justify-center active:scale-90 hover:bg-[#c9a84c] hover:text-[#06140e] transition-all cursor-pointer"
                          aria-label="Increase Guests"
                        >
                          &#43;
                        </button>
                      </div>
                    </div>

                    {/* Dynamic pricing tiers */}
                    {pricingTiers.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
                        {pricingTiers.map((tier) => {
                          const isActive = guests >= tier.minGuests && guests <= tier.maxGuests;
                          return (
                            <div
                              key={tier.id}
                              className={`p-3 rounded-xl border transition-all duration-300 text-center ${
                                isActive
                                  ? 'bg-gradient-to-b from-[#c9a84c]/25 to-[#0e2a1d] border-[#c9a84c] shadow-[0_0_15px_rgba(201,168,76,0.2)] scale-[1.02]'
                                  : 'bg-[#0a1f16]/60 border-white/10 opacity-50'
                              }`}
                            >
                              <span className="text-xs font-semibold tracking-wide text-white/80 block">
                                {tier.minGuests === tier.maxGuests
                                  ? `${tier.minGuests} ${locale === 'ka' ? 'პერსონა' : locale === 'ru' ? 'Персон' : 'Guest'}`
                                  : `${tier.minGuests}–${tier.maxGuests} ${locale === 'ka' ? 'პერსონა' : locale === 'ru' ? 'Персон' : 'Guests'}`
                                }
                              </span>
                              <span className="text-lg font-extrabold text-[#e5c973] font-serif mt-1 block">
                                {tier.priceGel} ₾
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Contact us for large groups */}
                    {priceInfo.price === null && (
                      <div className="mt-4 pt-4 border-t border-white/10 text-center">
                        <p className="text-sm text-[#e5c973]">
                          {locale === 'ka'
                            ? '📞 დაგვიკავშირდით ან მოგვწერეთ ჯგუფურ ფასზე'
                            : locale === 'ru'
                            ? '📞 Свяжитесь с нами для групповой цены'
                            : '📞 Call us or text us for group pricing'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ─── Right Column: Summary & Book ───── */}
            <div className="lg:col-span-4 bg-[#0e2a1d]/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border-2 border-[#c9a84c]/45 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col justify-between h-full lg:sticky lg:top-8">
              <div>
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#e5c973] mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#c9a84c] text-[#06140e] font-sans font-bold flex items-center justify-center text-sm">
                    {selectedDate && selectedTime ? '3' : '2'}
                  </span>
                  <span>{t('summaryTitle')}</span>
                </h4>

                <div className="bg-[#06140e] rounded-2xl p-5 border border-white/10 mb-6 space-y-4 font-sans">
                  <div className="flex justify-between items-center text-sm pb-3 border-b border-white/10">
                    <span className="text-white/65">{t('dateLabel')}</span>
                    <span className="text-[#f5f0e8] font-bold font-serif">
                      {selectedDate
                        ? selectedDate.toLocaleDateString(locale === 'ka' ? 'ka-GE' : locale === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                        : (locale === 'ka' ? 'აირჩიეთ' : locale === 'ru' ? 'Выбрать' : 'Select')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm pb-3 border-b border-white/10 gap-2">
                    <span className="text-white/65 shrink-0">{t('timeLabel')}</span>
                    <span className="text-[#e5c973] font-bold font-serif">
                      {selectedTime
                        ? `${selectedTime} — ${(() => {
                            const [h, m] = selectedTime.split(':').map(Number);
                            const end = new Date(2000, 0, 1, h, m + 30);
                            return `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
                          })()}`
                        : (locale === 'ka' ? 'აირჩიეთ' : locale === 'ru' ? 'Выбрать' : 'Select')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm pb-3 border-b border-white/10">
                    <span className="text-white/65">{t('guests')}:</span>
                    <span className="text-[#f5f0e8] font-semibold">{guests} {t('guestLabel')}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 gap-4">
                    <span className="text-base font-bold text-[#e5c973] uppercase tracking-wider shrink-0">{t('total')}:</span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#c9a84c] font-serif tracking-tight">
                      {priceInfo.price !== null ? (
                        <>{priceInfo.price} <span className="text-xl font-sans font-normal">{t('currency')}</span></>
                      ) : (
                        <span className="text-lg font-sans">{priceInfo.label}</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Book Now Button */}
              <div className="mt-5 flex flex-col gap-4">
                {bookingError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {bookingError}
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime || !customerName || !customerPhone || bookingStatus === 'processing'}
                  className="group w-full bg-gradient-to-r from-[#b8942f] via-[#c9a84c] to-[#d4b85d] hover:from-[#c9a84c] hover:via-[#d4b85d] hover:to-[#e5c973] text-[#06140e] font-extrabold text-base sm:text-lg py-4 px-5 rounded-2xl shadow-[0_4px_25px_rgba(201,168,76,0.35)] hover:shadow-[0_6px_28px_rgba(201,168,76,0.55)] active:scale-[0.98] transition-all duration-300 min-h-[62px] flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {bookingStatus === 'processing' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#06140e] border-t-transparent rounded-full animate-spin" />
                      {t('processing')}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      {locale === 'ka' ? 'დაჯავშნა' : locale === 'ru' ? 'Забронировать' : 'Book Now'}
                    </>
                  )}
                </button>

                <p className="text-[11px] text-white/40 text-center font-sans">
                  {locale === 'ka'
                    ? '💳 გადახდა ხდება ადგილზე'
                    : locale === 'ru'
                    ? '💳 Оплата на месте'
                    : '💳 Payment is made on-site'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
