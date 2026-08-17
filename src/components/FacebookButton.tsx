'use client';

import React from 'react';

type FacebookButtonProps = {
  variant?: 'full' | 'icon';
  className?: string;
};

export default function FacebookButton({ variant = 'full', className = '' }: FacebookButtonProps) {
  const isIcon = variant === 'icon';

  return (
    <a
      href="https://www.facebook.com/MtskhetaRiviera"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center bg-[#1877F2] text-white border border-[#c9a84c]/40 rounded-full transition-all duration-200 active:scale-95 hover:bg-[#166fe5] shadow-lg min-h-[44px] ${
        isIcon ? 'p-3 w-12 h-12' : 'px-6 py-3 space-x-2.5'
      } ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 drop-shadow"
      >
        <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
      </svg>
      {!isIcon && <span className="font-bold text-sm uppercase tracking-wider font-sans">Facebook</span>}
    </a>
  );
}
