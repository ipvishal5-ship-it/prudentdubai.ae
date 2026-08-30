'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CURRENCIES, Currency } from '@/lib/data';
import { useCurrency } from './CurrencyContext';

const links = [
  ['Properties', '/properties'], ['Off-plan', '/off-plan'], ['Communities', '/communities'],
  ['Insights', '/insights'], ['About', '/about'], ['Contact', '/contact'],
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();
  return <header className="site-header">
    <div className="container nav">
      <Link href="/" className="brand" aria-label="Prudent Dubai Properties home">
        <Image src="/brand/prudent-dubai-logo.png" alt="Prudent Dubai" width={189} height={54} priority />
        <span className="brand-word">DUBAI<br />PROPERTIES</span>
      </Link>
      <nav className={`nav-links${open ? ' open' : ''}`} aria-label="Main navigation">
        {links.map(([label, href]) => <Link key={href} className={pathname.startsWith(href) ? 'active' : ''} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
      </nav>
      <div className="nav-tools">
        <select className="currency-select" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} aria-label="Display currency">
          {(Object.keys(CURRENCIES) as Currency[]).map(code => <option key={code}>{code}</option>)}
        </select>
        <Link className="button button-primary" href="/contact">Talk to us</Link>
        <button className="menu-toggle" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
      </div>
    </div>
  </header>;
}
