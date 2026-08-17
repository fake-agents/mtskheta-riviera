'use client';

import React from 'react';

export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* Tooltip */}
      <div className="absolute -top-12 right-0 bg-[#0e2a1d] border border-[#c9a84c]/60 text-[#f5f0e8] text-xs font-bold px-3.5 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-2xl">
        Chat directly on WhatsApp
      </div>
      
      {/* Pulsing ring in gold/green */}
      <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-60 duration-1000"></div>
      
      {/* Large Touch-First Action Button */}
      <a
        href="https://wa.me/995599455353"
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366] text-white border-2 border-white/30 rounded-full transition-transform duration-200 active:scale-95 hover:scale-105 shadow-[0_8px_30px_rgba(37,211,102,0.5)]"
        aria-label="Chat on WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-md"
        >
          <path
            fillRule="evenodd"
            d="M12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.44 1.27 4.9L2 22l5.24-1.23A9.957 9.957 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm.05 18c-1.52 0-3-.39-4.32-1.12l-.3-.16-3.21.75.86-3.12-.18-.3A7.95 7.95 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-7.95 8z"
            clipRule="evenodd"
          />
          <path d="M16.54 14.33c-.27-.14-1.61-.79-1.86-.88-.25-.09-.43-.14-.62.14-.18.28-.7 .88-.86 1.06-.16.18-.33.2-.6.07-.27-.14-1.15-.43-2.19-1.35-.81-.72-1.36-1.61-1.52-1.88-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.28.28-.46.09-.18.05-.35-.02-.48-.07-.14-.62-1.5-.85-2.06-.22-.54-.45-.47-.62-.48h-.53c-.18 0-.48.07-.72.35-.25.28-.93.91-.93 2.22 0 1.31.95 2.58 1.08 2.76.14.18 1.88 2.87 4.56 4.02 1.95.84 2.39.9 2.83.85.44-.05 1.61-.66 1.84-1.29.23-.63.23-1.17.16-1.29-.07-.12-.25-.19-.52-.33z" />
        </svg>
      </a>
    </div>
  );
}
