'use client';

import { useMemo, useState } from 'react';
import {
  OFFICIAL_DATA,
  buyingCosts,
  minimumDownPaymentPercent,
  monthlyMortgagePayment,
  rentalYield,
  type BuyerProfile,
  type PropertyStatus,
  type PurchasePurpose,
} from '@/lib/property-calculator';

const money = new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 });
const formatMoney = (value: number) => `AED ${money.format(Math.round(Number.isFinite(value) ? value : 0))}`;
const formatPercent = (value: number) => `${(Number.isFinite(value) ? value : 0).toFixed(2)}%`;
const numeric = (value: string, minimum = 0) => Math.max(minimum, Number(value) || 0);

type Tab = 'costs' | 'mortgage' | 'yield';

const icons = {
  costs: <path d="M4 10h16M6 10V7l6-3 6 3v3M7 10v7m5-7v7m5-7v7M4 20h16M5 17h14v3H5z" />,
  mortgage: <path d="M3 11l9-7 9 7M5 10v10h14V10M9 20v-6h6v6" />,
  yield: <path d="M4 19V5m0 14h16M7 15l4-4 3 2 5-6" />,
};

function Icon({ name }: { name: keyof typeof icons }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}

function NumberField({ id, label, value, onChange, suffix, min = 0, step = 1, hint }: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
  step?: number;
  hint?: string;
}) {
  return <div className="pc-field">
    <label htmlFor={id}>{label}</label>
    <div className="pc-input-wrap">
      <input id={id} type="number" inputMode="decimal" min={min} step={step} value={value} onChange={(event) => onChange(numeric(event.target.value, min))} />
      {suffix && <span>{suffix}</span>}
    </div>
    {hint && <small>{hint}</small>}
  </div>;
}

function Choice<T extends string>({ label, value, onChange, options }: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
}) {
  return <fieldset className="pc-fieldset">
    <legend>{label}</legend>
    <div className="pc-choice">
      {options.map((option) => <button type="button" key={option.value} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}
    </div>
  </fieldset>;
}

function Result({ label, value, detail, primary = false }: { label: string; value: string; detail?: string; primary?: boolean }) {
  return <div className={primary ? 'pc-result pc-result-primary' : 'pc-result'}>
    <span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}
  </div>;
}

function Row({ label, value, total = false }: { label: string; value: string; total?: boolean }) {
  return <div className={total ? 'pc-row pc-row-total' : 'pc-row'}><span>{label}</span><strong>{value}</strong></div>;
}

function ProfileFields({ price, profile, setProfile, purpose, setPurpose, status, setStatus }: {
  price: number;
  profile: BuyerProfile;
  setProfile: (value: BuyerProfile) => void;
  purpose: PurchasePurpose;
  setPurpose: (value: PurchasePurpose) => void;
  status: PropertyStatus;
  setStatus: (value: PropertyStatus) => void;
}) {
  const minimum = minimumDownPaymentPercent(price, profile, purpose, status);
  return <>
    <Choice label="Buyer profile" value={profile} onChange={setProfile} options={[{ value: 'expat', label: 'Expatriate' }, { value: 'national', label: 'UAE national' }]} />
    <Choice label="Purchase purpose" value={purpose} onChange={setPurpose} options={[{ value: 'first-home', label: 'First home' }, { value: 'investment', label: 'Investment / next home' }]} />
    <Choice label="Property status" value={status} onChange={setStatus} options={[{ value: 'ready', label: 'Ready' }, { value: 'off-plan', label: 'Off-plan' }]} />
    <div className="pc-rule-note"><strong>{minimum}% minimum down payment</strong><span>CBUAE maximum LTV. A lender may require more.</span></div>
  </>;
}

function BuyingCosts() {
  const [price, setPrice] = useState(2_000_000);
  const [financed, setFinanced] = useState(true);
  const [profile, setProfile] = useState<BuyerProfile>('expat');
  const [purpose, setPurpose] = useState<PurchasePurpose>('first-home');
  const [status, setStatus] = useState<PropertyStatus>('ready');
  const [dldBuyerShare, setDldBuyerShare] = useState<2 | 4>(4);
  const [includeAgency, setIncludeAgency] = useState(true);
  const [bankFee, setBankFee] = useState(0);
  const [valuationFee, setValuationFee] = useState(0);
  const downPercent = financed ? minimumDownPaymentPercent(price, profile, purpose, status) : 100;
  const downPayment = price * downPercent / 100;
  const loanAmount = financed ? price - downPayment : 0;
  const result = useMemo(() => buyingCosts({ price, dldBuyerShare, includeAgency, financed, loanAmount, bankFee, valuationFee }), [price, dldBuyerShare, includeAgency, financed, loanAmount, bankFee, valuationFee]);
  const cashRequired = downPayment + result.total;

  return <div className="pc-workspace">
    <div className="pc-form-panel">
      <div className="pc-panel-heading"><span>01</span><div><h2>Buying costs</h2><p>Official fees and selected optional costs.</p></div></div>
      <NumberField id="cost-price" label="Purchase price" value={price} onChange={setPrice} min={100_000} suffix="AED" />
      <Choice label="Payment method" value={financed ? 'mortgage' : 'cash'} onChange={(value) => setFinanced(value === 'mortgage')} options={[{ value: 'mortgage', label: 'Mortgage' }, { value: 'cash', label: 'Cash' }]} />
      {financed && <ProfileFields price={price} profile={profile} setProfile={setProfile} purpose={purpose} setPurpose={setPurpose} status={status} setStatus={setStatus} />}
      <Choice label="DLD fee paid by buyer" value={String(dldBuyerShare) as '2' | '4'} onChange={(value) => setDldBuyerShare(Number(value) as 2 | 4)} options={[{ value: '4', label: 'Full 4%' }, { value: '2', label: 'Buyer share 2%' }]} />
      <label className="pc-check"><input type="checkbox" checked={includeAgency} onChange={(event) => setIncludeAgency(event.target.checked)} /><span>Include 2% agency fee + 5% VAT</span></label>
      {financed && <div className="pc-inline-fields">
        <NumberField id="bank-fee" label="Bank fee from quote" value={bankFee} onChange={setBankFee} suffix="AED" hint="Enter the lender's confirmed fee." />
        <NumberField id="valuation-fee" label="Valuation fee from quote" value={valuationFee} onChange={setValuationFee} suffix="AED" hint="Enter the lender's confirmed fee." />
      </div>}
    </div>
    <div className="pc-output-panel" aria-live="polite">
      <Result label="Estimated cash required" value={formatMoney(cashRequired)} detail={financed ? `${downPercent}% down payment plus buying costs` : 'Purchase price plus buying costs'} primary />
      <div className="pc-summary-grid"><Result label="Buying costs" value={formatMoney(result.total)} /><Result label={financed ? 'Down payment' : 'Purchase price'} value={formatMoney(downPayment)} /></div>
      <div className="pc-breakdown"><h3>Cost breakdown</h3><Row label={`DLD sale registration (${dldBuyerShare}%)`} value={formatMoney(result.dldFee)} /><Row label="Sale trustee fee incl. VAT" value={formatMoney(result.saleTrusteeFee)} /><Row label="Title deed, map and government fees" value={formatMoney(result.titleAndMapFees)} />{result.agencyFee > 0 && <Row label="Agency fee incl. VAT" value={formatMoney(result.agencyFee)} />}{result.mortgageRegistrationFee > 0 && <Row label="Mortgage registration and government fees" value={formatMoney(result.mortgageRegistrationFee)} />}{result.mortgageTrusteeFee > 0 && <Row label="Mortgage trustee fee incl. VAT" value={formatMoney(result.mortgageTrusteeFee)} />}{result.lenderFees > 0 && <Row label="Bank and valuation fees entered" value={formatMoney(result.lenderFees)} />}<Row label="Total buying costs" value={formatMoney(result.total)} total /></div>
      <p className="pc-disclaimer">DLD splits the 4% sale fee equally unless the contract states otherwise. Choose 4% only if the buyer will pay it all.</p>
    </div>
  </div>;
}

function MortgageCalculator() {
  const [price, setPrice] = useState(2_000_000);
  const [profile, setProfile] = useState<BuyerProfile>('expat');
  const [purpose, setPurpose] = useState<PurchasePurpose>('first-home');
  const [status, setStatus] = useState<PropertyStatus>('ready');
  const requiredDown = minimumDownPaymentPercent(price, profile, purpose, status);
  const [extraDown, setExtraDown] = useState(0);
  const [margin, setMargin] = useState(1.5);
  const [years, setYears] = useState(25);
  const downPercent = Math.min(90, requiredDown + extraDown);
  const downPayment = price * downPercent / 100;
  const principal = price - downPayment;
  const rate = OFFICIAL_DATA.eibor3m + margin;
  const payment = monthlyMortgagePayment(principal, rate, years);
  const totalRepayment = payment * years * 12;

  return <div className="pc-workspace">
    <div className="pc-form-panel">
      <div className="pc-panel-heading"><span>02</span><div><h2>Mortgage repayment</h2><p>Uses dated 3-month EIBOR plus your lender margin.</p></div></div>
      <NumberField id="mortgage-price" label="Purchase price" value={price} onChange={setPrice} min={100_000} suffix="AED" />
      <ProfileFields price={price} profile={profile} setProfile={(value) => { setProfile(value); setExtraDown(0); }} purpose={purpose} setPurpose={(value) => { setPurpose(value); setExtraDown(0); }} status={status} setStatus={(value) => { setStatus(value); setExtraDown(0); }} />
      <NumberField id="extra-down" label="Extra down payment above minimum" value={extraDown} onChange={setExtraDown} min={0} step={1} suffix="%" />
      <div className="pc-live-card"><span>Latest verified CBUAE 3-month EIBOR</span><strong>{OFFICIAL_DATA.eibor3m.toFixed(5)}%</strong><small>Fixing dated {OFFICIAL_DATA.eiborDate}</small></div>
      <NumberField id="bank-margin" label="Bank margin above EIBOR" value={margin} onChange={setMargin} min={0} step={0.01} suffix="%" hint="Use the margin in your lender's offer." />
      <NumberField id="mortgage-years" label="Loan term" value={years} onChange={(value) => setYears(Math.min(25, value))} min={1} step={1} suffix="years" />
    </div>
    <div className="pc-output-panel" aria-live="polite">
      <Result label="Estimated monthly payment" value={formatMoney(payment)} detail={`at ${rate.toFixed(2)}% over ${years} years`} primary />
      <div className="pc-summary-grid"><Result label="Down payment" value={formatMoney(downPayment)} detail={`${downPercent}% of price`} /><Result label="Loan amount" value={formatMoney(principal)} detail={`${100 - downPercent}% LTV`} /><Result label="Total interest" value={formatMoney(totalRepayment - principal)} /><Result label="Total repayment" value={formatMoney(totalRepayment)} /></div>
      <div className="pc-rate-line"><span>3M EIBOR <strong>{OFFICIAL_DATA.eibor3m.toFixed(2)}%</strong></span><span>Bank margin <strong>{margin.toFixed(2)}%</strong></span><span>Modelled rate <strong>{rate.toFixed(2)}%</strong></span></div>
      <p className="pc-disclaimer">Estimate only, not a loan offer. Fixed rates and lender checks may change the result.</p>
    </div>
  </div>;
}

function YieldCalculator() {
  const [price, setPrice] = useState(1_500_000);
  const [annualRent, setAnnualRent] = useState(90_000);
  const [serviceCharges, setServiceCharges] = useState(0);
  const [maintenance, setMaintenance] = useState(0);
  const [vacancyPercent, setVacancyPercent] = useState(0);
  const [managementPercent, setManagementPercent] = useState(0);
  const result = useMemo(() => rentalYield({ price, annualRent, serviceCharges, maintenance, vacancyPercent, managementPercent }), [price, annualRent, serviceCharges, maintenance, vacancyPercent, managementPercent]);

  return <div className="pc-workspace">
    <div className="pc-form-panel">
      <div className="pc-panel-heading"><span>03</span><div><h2>Rental yield</h2><p>Use figures for the exact property.</p></div></div>
      <NumberField id="yield-price" label="Purchase price" value={price} onChange={setPrice} min={1} suffix="AED" />
      <NumberField id="annual-rent" label="Contracted or expected annual rent" value={annualRent} onChange={setAnnualRent} suffix="AED" />
      <NumberField id="service-charge" label="RERA-approved annual service charges" value={serviceCharges} onChange={setServiceCharges} suffix="AED" hint="Check the building in DLD's Service Charge Index." />
      <NumberField id="maintenance" label="Annual maintenance budget" value={maintenance} onChange={setMaintenance} suffix="AED" />
      <div className="pc-inline-fields"><NumberField id="vacancy" label="Vacancy allowance" value={vacancyPercent} onChange={setVacancyPercent} min={0} step={0.5} suffix="%" /><NumberField id="management" label="Management fee" value={managementPercent} onChange={setManagementPercent} min={0} step={0.5} suffix="%" /></div>
    </div>
    <div className="pc-output-panel" aria-live="polite">
      <Result label="Net rental yield" value={formatPercent(result.netYield)} detail="Annual net income divided by purchase price" primary />
      <div className="pc-summary-grid"><Result label="Gross rental yield" value={formatPercent(result.grossYield)} /><Result label="Net annual income" value={formatMoney(result.netIncome)} /></div>
      <div className="pc-breakdown"><h3>Annual income and costs</h3><Row label="Gross annual rent" value={formatMoney(annualRent)} /><Row label={`Vacancy allowance (${vacancyPercent}%)`} value={`− ${formatMoney(result.vacancyCost)}`} /><Row label="Service charges" value={`− ${formatMoney(serviceCharges)}`} /><Row label={`Management fee (${managementPercent}%)`} value={`− ${formatMoney(result.managementCost)}`} /><Row label="Maintenance budget" value={`− ${formatMoney(maintenance)}`} /><Row label="Net annual income" value={formatMoney(result.netIncome)} total /></div>
      <p className="pc-disclaimer">Use current rent evidence and the approved building service charge. No future rent or price growth is assumed.</p>
    </div>
  </div>;
}

const tabs: { id: Tab; label: string; description: string }[] = [
  { id: 'costs', label: 'Buying costs', description: 'Cash needed at transfer' },
  { id: 'mortgage', label: 'Mortgage', description: 'Monthly repayment' },
  { id: 'yield', label: 'Rental yield', description: 'Gross and net return' },
];

export default function PropertyCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>('costs');
  return <>
    <section className="pc-hero">
      <div className="container pc-hero-grid">
        <div><span className="eyebrow">Dubai property calculator</span><h1>Calculate the cost before you buy.</h1><p>Estimate the cash needed to buy, monthly mortgage repayments, and potential rental yield. Official rules are separated from the figures you enter.</p></div>
        <div className="pc-data-card"><span className="pc-status"><i />Data checked {OFFICIAL_DATA.verifiedOn}</span><strong>Official rules.<br />Your figures.</strong><p>Inputs and sources are shown with each result.</p></div>
      </div>
    </section>
    <section className="pc-section">
      <div className="container">
        <div className="pc-tabs" role="tablist" aria-label="Property calculators">
          {tabs.map((tab) => <button key={tab.id} id={`tab-${tab.id}`} role="tab" aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`} onClick={() => setActiveTab(tab.id)}><Icon name={tab.id} /><span><strong>{tab.label}</strong><small>{tab.description}</small></span></button>)}
        </div>
        <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="pc-shell">
          {activeTab === 'costs' && <BuyingCosts />}{activeTab === 'mortgage' && <MortgageCalculator />}{activeTab === 'yield' && <YieldCalculator />}
        </div>
        <div className="pc-sources">
          <div><span className="eyebrow">Sources</span><h2>Check the sources.</h2></div>
          <div className="pc-source-links"><a href="https://dubailand.gov.ae/en/eservices/property-sale-registration/" target="_blank" rel="noreferrer"><strong>DLD sale registration</strong><span>Sale fee, trustee and title charges</span></a><a href="https://dubailand.gov.ae/en/eservices/request-for-mortgage-registration/" target="_blank" rel="noreferrer"><strong>DLD mortgage registration</strong><span>Mortgage and service-partner fees</span></a><a href="https://rulebook.centralbank.ae/en/rulebook/regulations-regarding-mortgage-loans" target="_blank" rel="noreferrer"><strong>CBUAE mortgage rules</strong><span>LTV, tenure and buyer categories</span></a><a href="https://centralbank.ae/en/forex-eibor/eibor-rates/" target="_blank" rel="noreferrer"><strong>CBUAE EIBOR</strong><span>Dated benchmark rate</span></a><a href="https://mollak.dubailand.gov.ae/" target="_blank" rel="noreferrer"><strong>RERA service charge index</strong><span>Property-specific approved charges</span></a></div>
        </div>
        <div className="pc-cta"><div><h2>Want help checking the result?</h2><p>Share the unit price, payment method, and any lender quote.</p></div><a href="/contact" className="button button-primary">Contact us</a></div>
      </div>
    </section>
  </>;
}
