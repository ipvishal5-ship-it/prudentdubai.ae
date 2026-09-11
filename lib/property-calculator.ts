export type BuyerProfile = 'expat' | 'national';
export type PurchasePurpose = 'first-home' | 'investment';
export type PropertyStatus = 'ready' | 'off-plan';

export const OFFICIAL_DATA = {
  eibor3m: 4.12642,
  eiborDate: '9 September 2026',
  dldSaleFeePercent: 4,
  mortgageRegistrationPercent: 0.25,
  verifiedOn: '11 September 2026',
} as const;

export function minimumDownPaymentPercent(
  price: number,
  profile: BuyerProfile,
  purpose: PurchasePurpose,
  status: PropertyStatus,
) {
  if (status === 'off-plan') return 50;
  if (purpose === 'investment') return profile === 'national' ? 35 : 40;
  if (profile === 'national') return price <= 5_000_000 ? 15 : 25;
  return price <= 5_000_000 ? 20 : 30;
}

export function monthlyMortgagePayment(principal: number, annualRate: number, years: number) {
  const months = Math.max(1, years * 12);
  if (annualRate === 0) return principal / months;
  const monthlyRate = annualRate / 100 / 12;
  const growth = (1 + monthlyRate) ** months;
  return (principal * monthlyRate * growth) / (growth - 1);
}

export function buyingCosts({
  price,
  dldBuyerShare,
  includeAgency,
  financed,
  loanAmount,
  bankFee,
  valuationFee,
}: {
  price: number;
  dldBuyerShare: 2 | 4;
  includeAgency: boolean;
  financed: boolean;
  loanAmount: number;
  bankFee: number;
  valuationFee: number;
}) {
  const dldFee = price * dldBuyerShare / 100;
  const saleTrusteeFee = price >= 500_000 ? 4_200 : 2_100;
  const titleAndMapFees = 520;
  const agencyFee = includeAgency ? price * 0.02 * 1.05 : 0;
  const mortgageRegistrationFee = financed ? loanAmount * 0.0025 + 270 : 0;
  const mortgageTrusteeFee = financed ? 4_200 : 0;
  const lenderFees = financed ? bankFee + valuationFee : 0;
  const total = dldFee + saleTrusteeFee + titleAndMapFees + agencyFee + mortgageRegistrationFee + mortgageTrusteeFee + lenderFees;

  return { dldFee, saleTrusteeFee, titleAndMapFees, agencyFee, mortgageRegistrationFee, mortgageTrusteeFee, lenderFees, total };
}

export function rentalYield({
  price,
  annualRent,
  serviceCharges,
  maintenance,
  vacancyPercent,
  managementPercent,
}: {
  price: number;
  annualRent: number;
  serviceCharges: number;
  maintenance: number;
  vacancyPercent: number;
  managementPercent: number;
}) {
  const vacancyCost = annualRent * vacancyPercent / 100;
  const managementCost = annualRent * managementPercent / 100;
  const annualExpenses = serviceCharges + maintenance + vacancyCost + managementCost;
  const netIncome = annualRent - annualExpenses;
  return {
    vacancyCost,
    managementCost,
    annualExpenses,
    netIncome,
    grossYield: price > 0 ? annualRent / price * 100 : 0,
    netYield: price > 0 ? netIncome / price * 100 : 0,
  };
}
