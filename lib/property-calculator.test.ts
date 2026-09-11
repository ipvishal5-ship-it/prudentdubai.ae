import assert from 'node:assert/strict';
import test from 'node:test';
import { buyingCosts, minimumDownPaymentPercent, monthlyMortgagePayment, rentalYield } from './property-calculator.ts';

test('calculator rules and money formulas stay stable', () => {
  assert.equal(minimumDownPaymentPercent(2_000_000, 'expat', 'first-home', 'ready'), 20);
  assert.equal(minimumDownPaymentPercent(2_000_000, 'national', 'investment', 'ready'), 35);
  assert.equal(minimumDownPaymentPercent(2_000_000, 'expat', 'first-home', 'off-plan'), 50);
  assert.equal(Math.round(monthlyMortgagePayment(1_600_000, 5.5, 25)), 9_825);

  const costs = buyingCosts({ price: 1_000_000, dldBuyerShare: 4, includeAgency: false, financed: false, loanAmount: 0, bankFee: 0, valuationFee: 0 });
  assert.equal(costs.total, 44_720);

  const returns = rentalYield({ price: 1_000_000, annualRent: 80_000, serviceCharges: 12_000, maintenance: 4_000, vacancyPercent: 5, managementPercent: 5 });
  assert.equal(returns.netIncome, 56_000);
  assert.ok(Math.abs(returns.netYield - 5.6) < Number.EPSILON * 10);
});
