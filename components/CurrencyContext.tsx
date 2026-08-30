'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency, CURRENCIES, formatPrice } from '@/lib/data';

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (aed: number) => string;
  currencyData: typeof CURRENCIES[Currency];
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'AED',
  setCurrency: () => {},
  format: (aed) => `AED ${aed.toLocaleString()}`,
  currencyData: CURRENCIES['AED'],
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('AED');

  useEffect(() => {
    const saved = localStorage.getItem('pd_currency') as Currency | null;
    if (!saved || !CURRENCIES[saved]) return;
    const frame = window.requestAnimationFrame(() => setCurrencyState(saved));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('pd_currency', c);
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      format: (aed) => formatPrice(aed, currency),
      currencyData: CURRENCIES[currency],
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
