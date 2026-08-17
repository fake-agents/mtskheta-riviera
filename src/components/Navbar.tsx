'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('home'), href: '#home' },
    { name: t('about'), href: '#about' },
    { name: t('gallery'), href: '#gallery' },
    { name: t('booking'), href: '#booking' },
    { name: t('location'), href: '#location' },
    { name: t('contact'), href: '#contact' },
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const switchLocale = () => {
    let nextLocale = 'en';
    if (locale === 'en') nextLocale = 'ka';
    else if (locale === 'ka') nextLocale = 'ru';
    else nextLocale = 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#06140e]/95 backdrop-blur-xl border-b border-[#c9a84c]/25 shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-3' 
          : 'bg-[#06140e]/70 backdrop-blur-md border-b border-[#c9a84c]/15 py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
        <div className="flex items-center justify-between gap-3 sm:gap-6 lg:gap-4 xl:gap-8">
          {/* Logo */}
          <a 
            href="#home" 
            onClick={(e) => handleSmoothScroll(e, '#home')} 
            className="flex items-center gap-2 sm:gap-3 group py-1 shrink-0 whitespace-nowrap"
          >
            <img
              src="/photos/555.png"
              alt="Mtskheta Riviera Logo"
              className="w-auto h-5 sm:h-6 md:h-7 object-contain group-hover:scale-105 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] select-none shrink-0"
            />
            <span className="text-base sm:text-lg md:text-xl font-bold tracking-wider text-[#c9a84c] uppercase font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap shrink-0">
              {locale === 'ka' ? 'მცხეთა რივიერა' : locale === 'ru' ? 'МЦХЕТА РИВЬЕРА' : 'MTSKHETA RIVIERA'}
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-7 shrink-0">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-xs xl:text-sm font-semibold text-[#f5f0e8] hover:text-[#c9a84c] transition-colors uppercase tracking-wider py-2 relative whitespace-nowrap shrink-0 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#c9a84c] after:transition-all hover:after:w-full"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action Buttons (Language Toggle + Socials) */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {/* Language Selection Segmented Control */}
            <div className="flex items-center bg-[#0e2a1d] border border-[#c9a84c]/40 rounded-full p-1 gap-1">
              {[
                { code: 'ka', label: 'KA' },
                { code: 'en', label: 'EN' },
                { code: 'ru', label: 'RU' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => router.replace(pathname, { locale: lang.code })}
                  className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all flex items-center justify-center uppercase min-w-[36px] min-h-[32px] ${
                    locale === lang.code 
                      ? 'bg-[#c9a84c] text-[#06140e] shadow-sm' 
                      : 'text-[#c9a84c] hover:bg-white/5'
                  }`}
                  aria-label={`Switch to ${lang.label}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            
            {/* Facebook Button with gold accent */}
            <a 
              href="https://www.facebook.com/MtskhetaRiviera" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full border border-[#c9a84c]/40 bg-[#0e2a1d] flex items-center justify-center text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#06140e] transition-all duration-300 shadow-sm"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* Instagram Button in header */}
            <a 
              href="https://www.instagram.com/mtskhetariviera" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full border border-[#c9a84c]/40 bg-[#0e2a1d] flex items-center justify-center text-[#c9a84c] hover:bg-[#E4405F] hover:text-white hover:border-[#E4405F] transition-all duration-300 shadow-sm"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>

            {/* WhatsApp Button in header */}
            <a 
              href="https://wa.me/995599455353" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full border border-[#c9a84c]/40 bg-[#0e2a1d] flex items-center justify-center text-[#c9a84c] hover:bg-[#25D366] hover:text-[#06140e] hover:border-[#25D366] transition-all duration-300 shadow-sm"
              aria-label="WhatsApp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
          </div>

          {/* Mobile Hamburger Menu Toggle (Clean, Stylized, Large Touch Target) */}
          <button 
            className="lg:hidden w-12 h-12 rounded-xl border border-[#c9a84c]/40 bg-[#0e2a1d] flex items-center justify-center text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#06140e] transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Touch-Optimized Mobile Drawer */}
      <div 
        className={`lg:hidden absolute top-full left-0 w-full bg-[#06140e]/98 backdrop-blur-2xl border-b border-[#c9a84c]/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-[520px] opacity-100 py-6' : 'max-h-0 opacity-0 py-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col items-center gap-5 px-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="w-full text-center py-3 rounded-xl bg-[#0e2a1d]/60 border border-white/5 text-[#f5f0e8] text-lg font-semibold uppercase tracking-widest hover:text-[#06140e] hover:bg-[#c9a84c] transition-all min-h-[48px] flex items-center justify-center"
            >
              {link.name}
            </a>
          ))}

          {/* Mobile Actions in Drawer */}
          <div className="flex flex-col items-center gap-5 mt-2 pt-5 border-t border-[#c9a84c]/20 w-full">
            
            {/* Mobile Language Selection Segmented Control */}
            <div className="flex items-center bg-[#0e2a1d] border border-[#c9a84c]/40 rounded-full p-1.5 w-full max-w-[300px]">
              {[
                { code: 'ka', label: 'KA' },
                { code: 'en', label: 'EN' },
                { code: 'ru', label: 'RU' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    router.replace(pathname, { locale: lang.code });
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all flex items-center justify-center uppercase min-h-[44px] ${
                    locale === lang.code 
                      ? 'bg-[#c9a84c] text-[#06140e] shadow-md' 
                      : 'text-[#c9a84c] hover:bg-white/5'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center justify-center gap-4">
            <a 
              href="https://www.facebook.com/MtskhetaRiviera" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 bg-[#0e2a1d] border border-[#c9a84c]/40 text-[#c9a84c] rounded-full flex items-center justify-center shadow-lg active:bg-[#c9a84c] active:text-[#06140e]"
              aria-label="Facebook"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            <a 
              href="https://www.instagram.com/mtskhetariviera" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 bg-[#0e2a1d] border border-[#c9a84c]/40 text-[#c9a84c] rounded-full flex items-center justify-center shadow-lg active:bg-[#E4405F] active:text-white"
              aria-label="Instagram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>

            <a 
              href="https://wa.me/995599455353" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 bg-[#0e2a1d] border border-[#c9a84c]/40 text-[#c9a84c] rounded-full flex items-center justify-center shadow-lg active:bg-[#25D366] active:text-[#06140e]"
              aria-label="WhatsApp"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
