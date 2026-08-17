'use client';

import { useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { gsap } from 'gsap';

export default function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const titleRef = useRef<HTMLDivElement>(null);
  const btnsRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLDivElement>(null);

  // Dynamically pick the language-specific brand logo emblem
  const logoSrc = locale === 'ka' ? '/photos/riviera_geo.png' : '/photos/riviera_eng.png';

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 30, scale: 0.96 }, 
      { opacity: 1, y: 0, scale: 1, duration: 1.1, delay: 0.2 }
    )
    .fromTo(btnsRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.4"
    );

    gsap.to(chevronRef.current, {
      y: 12,
      repeat: -1,
      yoyo: true,
      duration: 1.4,
      ease: 'power1.inOut',
    });
  }, []);

  return (
    <section id="home" className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Full-Screen High-Definition Background Photo (22.png) - positioned at 18% vertically to ensure the entire cathedral dome is fully visible on both desktop and mobile */}
      <img
        src="/photos/22.png"
        alt="Mtskheta Riviera"
        className="absolute inset-0 w-full h-full object-cover object-[63%_18%] md:object-[56%_18%] lg:object-[50%_18%] z-0"
        loading="eager"
      />

      {/* Subtle edge gradients for navbar contrast at top and clean section blending at bottom */}
      <div className="absolute inset-x-0 top-0 h-44 z-0 bg-gradient-to-b from-[#06140e]/80 via-[#06140e]/30 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-48 z-0 bg-gradient-to-t from-[#06140e] via-[#06140e]/70 to-transparent pointer-events-none" />

      {/* Central Hero Content Container */}
      <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 max-w-6xl mx-auto flex flex-col items-center justify-center w-full py-24 sm:py-32">
        
        {/* Brand Logo Emblem - Dynamically loading Georgian or English logo based on active language */}
        <div ref={titleRef} className="opacity-0 mb-6 sm:mb-10 flex flex-col items-center justify-center w-full">
          <h1 className="sr-only">{t('title')}</h1>
          <img
            src={logoSrc}
            alt={t('title')}
            className="w-full max-w-[320px] sm:max-w-[460px] md:max-w-[560px] lg:max-w-[660px] h-auto object-contain select-none pointer-events-none"
            loading="eager"
          />
        </div>

        {/* Touch-Optimized CTA Buttons */}
        <div ref={btnsRef} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-5 sm:gap-7 w-full max-w-md sm:max-w-none opacity-0 px-2">
          <a 
            href="#booking" 
            className="btn-gold text-center font-bold text-lg sm:text-xl py-4 px-10 rounded-full shadow-[0_6px_35px_rgba(201,168,76,0.6)] active:scale-95 transition-all duration-200 min-h-[60px] flex items-center justify-center border border-[#e5c973]"
          >
            {t('book_cta')}
          </a>
          <a 
            href="#gallery" 
            className="btn-outline-gold text-center font-bold text-lg sm:text-xl py-4 px-10 rounded-full active:scale-95 transition-all duration-200 min-h-[60px] flex items-center justify-center shadow-[0_6px_30px_rgba(0,0,0,0.8)]"
          >
            {t('explore_cta')}
          </a>
        </div>
      </div>

      {/* Interactive Smooth-Scroll Down Indicator Button */}
      <a 
        href="#about"
        onClick={(e) => {
          e.preventDefault();
          const el = document.querySelector('#about');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 cursor-pointer pointer-events-auto flex flex-col items-center opacity-85 hover:opacity-100 hover:scale-105 active:scale-95 transition-all duration-200 p-2 group"
        aria-label={t('scroll_down')}
      >
        <span className="text-[#e5c973] text-xs sm:text-sm font-bold mb-1.5 uppercase tracking-[0.25em] drop-shadow group-hover:text-white transition-colors">
          {t('scroll_down')}
        </span>
        <div ref={chevronRef} className="text-[#c9a84c] group-hover:text-[#e5c973] transition-colors">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 13l-7 7-7-7" />
          </svg>
        </div>
      </a>
    </section>
  );
}
