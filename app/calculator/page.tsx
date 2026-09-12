import type { Metadata } from 'next';
import PropertyCalculator from './PropertyCalculator';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata('Dubai Property Calculator', 'Estimate Dubai buying costs, mortgage repayments and rental yield using published fee rules and a dated CBUAE EIBOR reference.', '/calculator');

export default function CalculatorPage() {
  return <PropertyCalculator />;
}
