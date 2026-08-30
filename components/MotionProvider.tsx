'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function MotionProvider() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.body.classList.add('motion-ready');
    const targets = document.querySelectorAll<HTMLElement>('.section > .container, .property-card, .article-card, .mini-panel, .process-step, .info-card, [data-reveal]');
    targets.forEach((element, index) => {
      element.classList.add('motion-item');
      element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
    });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible'); observer.unobserve(entry.target);
    }), { threshold: .08, rootMargin: '0px 0px -45px' });
    targets.forEach((element) => observer.observe(element));
    const onScroll = () => document.documentElement.style.setProperty('--scroll-progress', String(window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)));
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, [pathname]);
  return <div className="scroll-progress" aria-hidden="true" />;
}
