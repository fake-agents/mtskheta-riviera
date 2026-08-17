'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ScrollReveal } from './ScrollAnimations';

// Custom Riverboat Vector Line-Art Icon
const RiverboatIcon = () => (
  <svg className="w-10 h-10 text-[#c9a84c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 17h18l-2 3H5l-2-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 17V9a1 1 0 011-1h12a1 1 0 011 1v8" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8V5a1 1 0 011-1h4a1 1 0 011 1v3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 20c2 0 3 1 4 1s2-1 4-1 3 1 4 1 2-1 4-1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 15h3" />
  </svg>
);

// Custom Private Events & Toasting Line-Art Icon
const EventsIcon = () => (
  <svg className="w-10 h-10 text-[#c9a84c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h4l-1 9H8L7 3zm1 9v8m-3 0h6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 3h-4l1 9h2l1-9zm-1 9v8m-3 0h6" />
    <circle cx="12" cy="7" r="0.5" fill="currentColor" />
    <circle cx="10.5" cy="5" r="0.5" fill="currentColor" />
    <circle cx="13.5" cy="5" r="0.5" fill="currentColor" />
  </svg>
);

// Custom Onboard Dining & Wine Vector Line-Art Icon
const DiningIcon = () => (
  <svg className="w-10 h-10 text-[#c9a84c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 15v6M9 3h6a3 3 0 013 3c0 3.5-3 6-6 6s-6-2.5-6-6a3 3 0 013-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12" />
  </svg>
);

// Custom Sunset over Mountains Line-Art Icon
const SunsetIcon = () => (
  <svg className="w-10 h-10 text-[#c9a84c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 17h18M3 21h18M4 17l6-9 4 5 5-7M12 13a4 4 0 000-8 4 4 0 000 8z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2M6.34 4.34l1.41 1.41M17.66 4.34l-1.41 1.41" />
  </svg>
);

export default function AboutSection() {
  const t = useTranslations('about');

  const features = [
    {
      id: 'cruises',
      icon: <RiverboatIcon />,
      title: t('features.cruises.title'),
      desc: t('features.cruises.desc'),
    },
    {
      id: 'events',
      icon: <EventsIcon />,
      title: t('features.events.title'),
      desc: t('features.events.desc'),
    },
    {
      id: 'dining',
      icon: <DiningIcon />,
      title: t('features.dining.title'),
      desc: t('features.dining.desc'),
    },
    {
      id: 'sunset',
      icon: <SunsetIcon />,
      title: t('features.sunset.title'),
      desc: t('features.sunset.desc'),
    }
  ];

  return (
    <section id="about" className="py-20 sm:py-28 bg-[#06140e]/80 backdrop-blur-sm relative overflow-hidden">
      {/* Decorative top green/gold glow divider */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c9a84c]/35 to-transparent" />
      
      {/* Subtle background ambient glow spots */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-[#18422e] rounded-full filter blur-[90px] opacity-30 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#1e422b] rounded-full filter blur-[100px] opacity-25 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#e5c973] uppercase mb-3 font-sans">
              {t('subtitle')}
            </h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#f5f0e8] mb-6 leading-tight">
              {t('title')}
            </h3>
            <p className="text-base sm:text-lg text-white/75 leading-relaxed font-sans max-w-2xl mx-auto px-2">
              {t('description')}
            </p>
          </div>
        </ScrollReveal>

        {/* Mobile Stack: Clean 1-card-per-row layout on mobile, 2-columns on tablet+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.id} delay={index * 0.1}>
              <div className="group h-full bg-[#0e2a1d]/85 backdrop-blur-xl border border-[#c9a84c]/25 p-7 sm:p-9 rounded-3xl hover:-translate-y-1.5 transition-all duration-300 hover:border-[#c9a84c]/60 shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col justify-between">
                <div>
                  {/* Custom Vector Line-Art Icon Container */}
                  <div className="w-16 h-16 mb-6 p-3 bg-[#06140e] border border-[#c9a84c]/30 rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:border-[#e5c973] transition-all shadow-inner">
                    {feature.icon}
                  </div>
                  
                  <h4 className="text-2xl font-serif font-bold text-[#f5f0e8] mb-3 group-hover:text-[#e5c973] transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-base text-white/75 leading-relaxed font-sans">
                    {feature.desc}
                  </p>
                </div>
                
                {/* Subtle decorative bottom border */}
                <div className="w-12 h-0.5 bg-[#c9a84c]/40 mt-6 group-hover:w-24 group-hover:bg-[#e5c973] transition-all duration-300" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
