'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  delay?: number;
  duration?: number;
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 1,
  className = '',
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (!elementRef.current) return;

    const el = elementRef.current;

    let x = 0;
    let y = 0;
    
    switch (direction) {
      case 'up': y = 50; break;
      case 'down': y = -50; break;
      case 'left': x = 50; break;
      case 'right': x = -50; break;
      case 'fade': break;
    }

    gsap.fromTo(
      el,
      {
        opacity: 0,
        x,
        y,
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === el) {
          t.kill();
        }
      });
    };
  }, [direction, delay, duration]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.5,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current || !bgRef.current) return;

    const tl = gsap.to(bgRef.current, {
      yPercent: 100 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      tl.kill();
    };
  }, [speed]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div 
        ref={bgRef} 
        className="absolute inset-0 z-0 h-[150%] -top-[25%]"
      >
        {children}
      </div>
    </div>
  );
};
