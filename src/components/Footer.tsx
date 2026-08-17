'use client';

import { useTranslations, useLocale } from 'next-intl';

// Precision Vector Gold Heart Icon (ZERO emojis)
const GoldHeartIcon = () => (
  <svg className="w-5 h-5 text-[#c9a84c] inline-block mx-1.5 transform hover:scale-125 transition-transform" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  
  return (
    <footer id="contact" className="bg-[#06140e] pt-16 sm:pt-20 pb-12 border-t-2 border-[#c9a84c]/30 relative overflow-hidden text-white/80">
      {/* Decorative radial lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-transparent via-[#0e2a1d]/40 to-[#0e2a1d]/80 pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl relative z-10">
        {/* Generously spaced mobile-first grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 sm:gap-10 lg:gap-8 mb-14">
          
          {/* Brand & Mission Column */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-4">
            <a href="#home" className="flex items-center gap-3 group">
              <img
                src="/photos/555.png"
                alt="Mtskheta Riviera Logo"
                className="w-auto h-8 object-contain group-hover:scale-105 transition-transform select-none"
              />
              <span className="text-xl sm:text-2xl font-bold font-serif tracking-wider text-[#c9a84c] uppercase">
                {locale === 'ka' ? 'მცხეთა რივიერა' : 'MTSKHETA RIVIERA'}
              </span>
            </a>
            <p className="text-sm sm:text-base text-white/70 leading-relaxed font-sans max-w-xs">
              {t('tagline')}
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-2">
            <h4 className="text-[#e5c973] font-serif font-bold text-xl mb-6 pb-2 border-b border-white/10 inline-block w-full">{t('quick_links')}</h4>
            <ul className="flex flex-col gap-3 font-sans">
              {['home', 'about', 'gallery', 'booking', 'location', 'contact'].map((link) => (
                <li key={link}>
                  <a 
                    href={`#${link}`} 
                    className="text-base text-white/75 hover:text-[#e5c973] transition-colors capitalize py-1 block"
                  >
                    {t(`links.${link}` as any)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3">
            <h4 className="text-[#e5c973] font-serif font-bold text-xl mb-6 pb-2 border-b border-white/10 inline-block w-full">{t('contact_us')}</h4>
            <ul className="flex flex-col gap-4 font-sans text-sm sm:text-base">
              <li className="flex items-start gap-3 text-white/75">
                <div className="p-2 rounded-xl bg-[#0e2a1d] text-[#c9a84c] border border-[#c9a84c]/30 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="pt-1 font-medium">Mtskheta, Georgia<br/>Mtkvari River Bank</span>
              </li>
              <li className="flex items-center gap-3 text-white/75">
                <div className="p-2 rounded-xl bg-[#0e2a1d] text-[#c9a84c] border border-[#c9a84c]/30 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <a href="tel:+995599455353" className="hover:text-[#e5c973] transition-colors font-mono font-bold text-base pt-1">
                  +995 599 45 53 53
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/75">
                <div className="p-2 rounded-xl bg-[#0e2a1d] text-[#c9a84c] border border-[#c9a84c]/30 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="pt-1 font-mono">10:00 - 20:00 {t('daily')}</span>
              </li>
            </ul>
          </div>

          {/* Follow Us Column */}
          <div className="lg:col-span-3">
            <h4 className="text-[#e5c973] font-serif font-bold text-xl mb-6 pb-2 border-b border-white/10 inline-block w-full">{t('follow_us')}</h4>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.facebook.com/MtskhetaRiviera" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-14 h-14 bg-[#0e2a1d] border border-[#c9a84c]/50 rounded-2xl flex items-center justify-center text-[#c9a84c] hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-300 shadow-lg active:scale-95"
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
                className="w-14 h-14 bg-[#0e2a1d] border border-[#c9a84c]/50 rounded-2xl flex items-center justify-center text-[#c9a84c] hover:bg-[#E4405F] hover:text-white hover:border-[#E4405F] transition-all duration-300 shadow-lg active:scale-95"
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
                className="w-14 h-14 bg-[#0e2a1d] border border-[#c9a84c]/50 rounded-2xl flex items-center justify-center text-[#c9a84c] hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all duration-300 shadow-lg active:scale-95"
                aria-label="WhatsApp"
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
            <p className="mt-4 text-xs text-white/50 font-sans">
              Connect with us directly on social channels for VIP custom bookings.
            </p>
          </div>
        </div>

        {/* Bottom Bar with Vector Gold Heart (Zero Emojis) */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-white/60 font-sans">
          <p className="text-center sm:text-left">&copy; {new Date().getFullYear()} Mtskheta Riviera. {t('rights_reserved')}</p>
          <p className="flex items-center justify-center text-center sm:text-right font-medium text-[#f5f0e8]">
            <span>Made with</span> <GoldHeartIcon /> <span>in Georgia</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
