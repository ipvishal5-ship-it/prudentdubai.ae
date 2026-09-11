'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function MotionProvider() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.remove('motion-ready');
      return;
    }
    document.body.classList.add('motion-ready');
    const targets = document.querySelectorAll<HTMLElement>(
      '.section > .container, .property-card, .article-card, .mini-panel, .process-step, .info-card, [data-reveal]'
    );
    targets.forEach((element, index) => {
      element.classList.add('motion-item');
      element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
    });

    if (!('IntersectionObserver' in window)) {
      targets.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.02, rootMargin: '0px 0px 40px 0px' }
    );
    targets.forEach((element) => observer.observe(element));

    // Fallback: Ensure elements in or near initial viewport are made visible without delay
    const fallbackTimer = setTimeout(() => {
      targets.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100) {
          element.classList.add('is-visible');
        }
      });
    }, 250);

    const onScroll = () => {
      const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      document.documentElement.style.setProperty('--scroll-progress', String(window.scrollY / scrollMax));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);
  return <div className="scroll-progress" aria-hidden="true" />;
}
