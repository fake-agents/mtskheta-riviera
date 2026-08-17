'use client';

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ScrollReveal } from './ScrollAnimations';

const PHOTOS = [
  { src: '/photos/1.jpg', title: 'Scenic Mtkvari River Views' },
  { src: '/photos/2.jpg', title: 'Ancient Mtskheta Backdrop' },
  { src: '/photos/3.jpg', title: 'Onboard Comfort & Elegance' },
  { src: '/photos/4.jpg', title: 'Sunset Magic Over Svetitskhoveli' },
  { src: '/photos/5.jpg', title: 'Relaxing River Breeze' },
  { src: '/photos/6.jpg', title: 'Unforgettable Private Celebrations' },
  { src: '/photos/7.png', title: 'Cruising the Historical Confluence' },
];

export default function GallerySection() {
  const t = useTranslations('gallery');
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Smooth scroll left/right controls
  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.85;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const cardWidth = carouselRef.current.scrollWidth / PHOTOS.length;
      const currentIndex = Math.round(scrollLeft / cardWidth);
      setActiveSlide(currentIndex);
    }
  };

  return (
    <section id="gallery" className="py-20 sm:py-28 bg-[#06140e] relative overflow-hidden border-t border-[#c9a84c]/20">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(20,66,45,0.4)_0%,_transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#e5c973] uppercase mb-3 font-sans">
              {t('subtitle')}
            </h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#f5f0e8] mb-4 sm:mb-6">
              {t('title')}
            </h3>
            <p className="text-base sm:text-lg text-white/75 leading-relaxed max-w-xl mx-auto font-sans px-2">
              {t('description')}
            </p>
          </div>
        </ScrollReveal>

        {/* Touch-Optimized Horizontal Carousel */}
        <div className="relative group">
          {/* Left Navigation Arrow */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#0e2a1d] border border-[#c9a84c]/60 text-[#c9a84c] items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.8)] hover:bg-[#c9a84c] hover:text-[#06140e] transition-all active:scale-95"
            aria-label="Previous Slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Navigation Arrow */}
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#0e2a1d] border border-[#c9a84c]/60 text-[#c9a84c] items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.8)] hover:bg-[#c9a84c] hover:text-[#06140e] transition-all active:scale-95"
            aria-label="Next Slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Scrollable Track */}
          <div 
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-6 px-2 sm:px-4 no-scrollbar scroll-smooth w-full py-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {PHOTOS.map((photo, index) => (
              <div
                key={photo.src}
                onClick={() => setSelectedIndex(index)}
                className="flex-shrink-0 w-[85vw] sm:w-[60vw] md:w-[42vw] lg:w-[32vw] h-[320px] sm:h-[380px] md:h-[420px] snap-center relative rounded-3xl overflow-hidden border-2 border-[#c9a84c]/35 shadow-[0_12px_35px_rgba(0,0,0,0.6)] cursor-pointer group/card hover:border-[#e5c973] transition-all duration-300 transform hover:-translate-y-1 bg-[#0e2a1d]"
              >
                {/* Image element */}
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                
                {/* Elegant bottom gradient overlay with title */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#06140e]/90 via-transparent to-transparent opacity-80 group-hover/card:opacity-95 transition-opacity" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between">
                  <span className="text-[#f5f0e8] text-lg font-serif font-semibold drop-shadow-md truncate pr-2">
                    {photo.title}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#06140e]/80 border border-[#c9a84c]/40 flex items-center justify-center text-[#c9a84c] flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Touch-First Pagination Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {PHOTOS.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (carouselRef.current) {
                    const scrollWidth = carouselRef.current.scrollWidth / PHOTOS.length;
                    carouselRef.current.scrollTo({ left: i * scrollWidth, behavior: 'smooth' });
                  }
                }}
                className={`transition-all duration-300 rounded-full h-2.5 ${
                  i === activeSlide ? 'w-8 bg-[#c9a84c]' : 'w-2.5 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen High-Resolution Lightbox Modal */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-[#06140e]/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 transition-opacity animate-fade-in"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Close button with large touch dimension */}
          <button 
            className="absolute top-6 right-6 z-10 px-5 py-2.5 rounded-full bg-[#0e2a1d] border border-[#c9a84c]/60 text-[#c9a84c] font-bold uppercase tracking-wider text-sm hover:bg-[#c9a84c] hover:text-[#06140e] transition-all min-h-[48px] min-w-[48px] flex items-center gap-2 shadow-xl"
            onClick={() => setSelectedIndex(null)}
          >
            <span>{t('close')}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Lightbox Image Box */}
          <div 
            className="relative max-w-5xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={PHOTOS[selectedIndex].src} 
              alt={PHOTOS[selectedIndex].title}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl border-2 border-[#c9a84c]/50 shadow-[0_20px_60px_rgba(0,0,0,0.9)]" 
            />
            <p className="mt-4 text-[#e5c973] font-serif text-lg sm:text-xl font-medium tracking-wide text-center">
              {PHOTOS[selectedIndex].title}
            </p>

            {/* Lightbox Previous Button */}
            <button 
              className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0e2a1d]/90 border border-[#c9a84c] text-[#c9a84c] flex items-center justify-center shadow-2xl active:scale-95 hover:bg-[#c9a84c] hover:text-[#06140e] transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((selectedIndex - 1 + PHOTOS.length) % PHOTOS.length);
              }}
              aria-label="Previous Photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Lightbox Next Button */}
            <button 
              className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0e2a1d]/90 border border-[#c9a84c] text-[#c9a84c] flex items-center justify-center shadow-2xl active:scale-95 hover:bg-[#c9a84c] hover:text-[#06140e] transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((selectedIndex + 1) % PHOTOS.length);
              }}
              aria-label="Next Photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
