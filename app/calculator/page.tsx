import type { Metadata } from 'next';
import PropertyCalculator from './PropertyCalculator';

export const metadata: Metadata = {
  title: 'Dubai Property Calculator',
  description: 'Calculate Dubai buying costs, mortgage repayments and rental yield using current official fee rules and a dated CBUAE EIBOR reference.',
  alternates: { canonical: '/calculator' },
};

export default function CalculatorPage() {
  return <PropertyCalculator />;
}
