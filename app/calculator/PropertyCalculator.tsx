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
import { useLanguage } from '@/components/LanguageContext';

const money = new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 });
const formatMoney = (value: number, locale: string = 'en') => {
  const formatted = money.format(Math.round(Number.isFinite(value) ? value : 0));
  return locale === 'ar' ? `${formatted} د.إ` : `AED ${formatted}`;
};
const formatPercent = (value: number) => `${(Number.isFinite(value) ? value : 0).toFixed(2)}%`;
const numeric = (value: string, minimum = 0) => Math.max(minimum, Number(value) || 0);

type Tab = 'costs' | 'mortgage' | 'yield';

const icons = {
  costs: <path d="M4 10h16M6 10V7l6-3 6 3v3M7 10v7m5-7v7m5-7v7M4 20h16M5 17h14v3H5z" />,
  mortgage: <path d="M3 11l9-7 9 7M5 10v10h14V10M9 20v-6h6v6" />,
  yield: <path d="M4 19V5m0 14h16M7 15l4-4 3 2 5-6" />,
};

function Icon({ name }: { name: keyof typeof icons }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  suffix,
  min = 0,
  step = 1,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
  step?: number;
  hint?: string;
}) {
  return (
    <div className="pc-field">
      <label htmlFor={id}>{label}</label>
      <div className="pc-input-wrap">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(numeric(event.target.value, min))}
        />
        {suffix && <span>{suffix}</span>}
      </div>
      {hint && <small>{hint}</small>}
    </div>
  );
}

function Choice<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
}) {
  return (
    <fieldset className="pc-fieldset">
      <legend>{label}</legend>
      <div className="pc-choice">
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Result({
  label,
  value,
  detail,
  primary = false,
}: {
  label: string;
  value: string;
  detail?: string;
  primary?: boolean;
}) {
  return (
    <div className={primary ? 'pc-result pc-result-primary' : 'pc-result'}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

function Row({ label, value, total = false }: { label: string; value: string; total?: boolean }) {
  return (
    <div className={total ? 'pc-row pc-row-total' : 'pc-row'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProfileFields({
  price,
  profile,
  setProfile,
  purpose,
  setPurpose,
  status,
  setStatus,
}: {
  price: number;
  profile: BuyerProfile;
  setProfile: (value: BuyerProfile) => void;
  purpose: PurchasePurpose;
  setPurpose: (value: PurchasePurpose) => void;
  status: PropertyStatus;
  setStatus: (value: PropertyStatus) => void;
}) {
  const { t } = useLanguage();
  const minimum = minimumDownPaymentPercent(price, profile, purpose, status);
  return (
    <>
      <Choice
        label={t('calc.buyerProfile')}
        value={profile}
        onChange={setProfile}
        options={[
          { value: 'expat', label: t('calc.expat') },
          { value: 'national', label: t('calc.national') },
        ]}
      />
      <Choice
        label={t('calc.purchasePurpose')}
        value={purpose}
        onChange={setPurpose}
        options={[
          { value: 'first-home', label: t('calc.firstHome') },
          { value: 'investment', label: t('calc.investment') },
        ]}
      />
      <Choice
        label={t('calc.propertyStatus')}
        value={status}
        onChange={setStatus}
        options={[
          { value: 'ready', label: t('calc.ready') },
          { value: 'off-plan', label: t('calc.offPlan') },
        ]}
      />
      <div className="pc-rule-note">
        <strong>
          {minimum}% {t('calc.minDownPayment')}
        </strong>
        <span>{t('calc.cbuaeLtv')}</span>
      </div>
    </>
  );
}

function BuyingCosts() {
  const { t, locale } = useLanguage();
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
  const downPayment = (price * downPercent) / 100;
  const loanAmount = financed ? price - downPayment : 0;
  const result = useMemo(
    () => buyingCosts({ price, dldBuyerShare, includeAgency, financed, loanAmount, bankFee, valuationFee, propertyStatus: status }),
    [price, dldBuyerShare, includeAgency, financed, loanAmount, bankFee, valuationFee, status]
  );
  const cashRequired = downPayment + result.total;
  const currencySuffix = locale === 'ar' ? 'د.إ' : 'AED';

  return (
    <div className="pc-workspace">
      <div className="pc-form-panel">
        <div className="pc-panel-heading">
          <span>01</span>
          <div>
            <h2>{t('calc.panelCostsTitle')}</h2>
            <p>{t('calc.panelCostsLede')}</p>
          </div>
        </div>
        <NumberField id="cost-price" label={t('calc.price')} value={price} onChange={setPrice} min={100_000} suffix={currencySuffix} />
        <Choice
          label={t('calc.paymentMethod')}
          value={financed ? 'mortgage' : 'cash'}
          onChange={(value) => setFinanced(value === 'mortgage')}
          options={[
            { value: 'mortgage', label: t('calc.mortgage') },
            { value: 'cash', label: t('calc.cash') },
          ]}
        />
        {financed && (
          <ProfileFields
            price={price}
            profile={profile}
            setProfile={setProfile}
            purpose={purpose}
            setPurpose={setPurpose}
            status={status}
            setStatus={setStatus}
          />
        )}
        <Choice
          label={t('calc.dldFeeShare')}
          value={String(dldBuyerShare) as '2' | '4'}
          onChange={(value) => setDldBuyerShare(Number(value) as 2 | 4)}
          options={[
            { value: '4', label: t('calc.dldFull4') },
            { value: '2', label: t('calc.dldShare2') },
          ]}
        />
        <label className="pc-check">
          <input type="checkbox" checked={includeAgency} onChange={(event) => setIncludeAgency(event.target.checked)} />
          <span>{t('calc.includeAgency')}</span>
        </label>
        {financed && (
          <div className="pc-inline-fields">
            <NumberField
              id="bank-fee"
              label={t('calc.bankFee')}
              value={bankFee}
              onChange={setBankFee}
              suffix={currencySuffix}
              hint={t('calc.bankFeeHint')}
            />
            <NumberField
              id="valuation-fee"
              label={t('calc.valuationFee')}
              value={valuationFee}
              onChange={setValuationFee}
              suffix={currencySuffix}
              hint={t('calc.valuationFeeHint')}
            />
          </div>
        )}
      </div>
      <div className="pc-output-panel" aria-live="polite">
        <Result
          label={t('calc.estimatedCash')}
          value={formatMoney(cashRequired, locale)}
          detail={financed ? `${downPercent}% ${t('calc.cashDetailFinanced')}` : t('calc.cashDetailCash')}
          primary
        />
        <div className="pc-summary-grid">
          <Result label={t('calc.buyingCostsTotal')} value={formatMoney(result.total, locale)} />
          <Result label={financed ? t('calc.downPayment') : t('calc.price')} value={formatMoney(downPayment, locale)} />
        </div>
        <div className="pc-breakdown">
          <h3>{t('calc.costBreakdown')}</h3>
          <Row label={`${t('calc.dldSaleReg')} (${dldBuyerShare}%)`} value={formatMoney(result.dldFee, locale)} />
          <Row label={t('calc.saleTrustee')} value={formatMoney(result.saleTrusteeFee, locale)} />
          <Row label={t('calc.titleMapFees')} value={formatMoney(result.titleAndMapFees, locale)} />
          {result.agencyFee > 0 && <Row label={t('calc.agencyFeeRow')} value={formatMoney(result.agencyFee, locale)} />}
          {result.mortgageRegistrationFee > 0 && (
            <Row label={t('calc.mortgageRegRow')} value={formatMoney(result.mortgageRegistrationFee, locale)} />
          )}
          {result.mortgageTrusteeFee > 0 && (
            <Row label={t('calc.mortgageTrusteeRow')} value={formatMoney(result.mortgageTrusteeFee, locale)} />
          )}
          {result.lenderFees > 0 && <Row label={t('calc.lenderFeesRow')} value={formatMoney(result.lenderFees, locale)} />}
          <Row label={t('calc.totalBuyingCostsRow')} value={formatMoney(result.total, locale)} total />
        </div>
        <a
          className="button button-secondary pc-whatsapp-btn"
          href={`https://wa.me/971555541538?text=${encodeURIComponent(
            locale === 'ar'
              ? `مرحباً، أود استشارة فريق برودنت بخصوص شراء عقار بقيمة ${formatMoney(price, 'ar')}، مع إجمالي تكاليف ورسوم تقدر بـ ${formatMoney(result.total, 'ar')}.`
              : `Hello Prudent Dubai, I am inquiring about purchasing a property of ${formatMoney(price, 'en')}. The estimated total purchase cost with DLD fees is ${formatMoney(result.total, 'en')}. Please advise on options.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ width: '100%', marginTop: 20, marginBottom: 12, justifyContent: 'center', gap: 8, display: 'inline-flex' }}
        >
          <span>💬</span> {t('calc.shareWhatsapp')}
        </a>
        <p className="pc-disclaimer">{t('calc.dldDisclaimer')}</p>
      </div>
    </div>
  );
}

function MortgageCalculator() {
  const { t, locale } = useLanguage();
  const [price, setPrice] = useState(2_000_000);
  const [profile, setProfile] = useState<BuyerProfile>('expat');
  const [purpose, setPurpose] = useState<PurchasePurpose>('first-home');
  const [status, setStatus] = useState<PropertyStatus>('ready');
  const requiredDown = minimumDownPaymentPercent(price, profile, purpose, status);
  const [extraDown, setExtraDown] = useState(0);
  const [margin, setMargin] = useState(1.5);
  const [years, setYears] = useState(25);
  const downPercent = Math.min(90, requiredDown + extraDown);
  const downPayment = (price * downPercent) / 100;
  const principal = price - downPayment;
  const rate = OFFICIAL_DATA.eibor3m + margin;
  const payment = monthlyMortgagePayment(principal, rate, years);
  const totalRepayment = payment * years * 12;

  return (
    <div className="pc-workspace">
      <div className="pc-form-panel">
        <div className="pc-panel-heading">
          <span>02</span>
          <div>
            <h2>{t('calc.mortgageRepayment')}</h2>
            <p>{t('calc.mortgageRepaymentLede')}</p>
          </div>
        </div>
        <NumberField id="mortgage-price" label={t('calc.price')} value={price} onChange={setPrice} min={100_000} suffix={locale === 'ar' ? 'د.إ' : 'AED'} />
        <ProfileFields
          price={price}
          profile={profile}
          setProfile={(value) => {
            setProfile(value);
            setExtraDown(0);
          }}
          purpose={purpose}
          setPurpose={(value) => {
            setPurpose(value);
            setExtraDown(0);
          }}
          status={status}
          setStatus={(value) => {
            setStatus(value);
            setExtraDown(0);
          }}
        />
        <NumberField
          id="extra-down"
          label={t('calc.extraDown')}
          value={extraDown}
          onChange={setExtraDown}
          min={0}
          step={1}
          suffix="%"
        />
        <div className="pc-live-card">
          <span>{t('calc.verifiedEibor')}</span>
          <strong>{OFFICIAL_DATA.eibor3m.toFixed(5)}%</strong>
          <small>{t('calc.fixingDated')} {OFFICIAL_DATA.eiborDate}</small>
        </div>
        <NumberField
          id="bank-margin"
          label={t('calc.bankMargin')}
          value={margin}
          onChange={setMargin}
          min={0}
          step={0.01}
          suffix="%"
          hint={t('calc.bankMarginHint')}
        />
        <NumberField
          id="mortgage-years"
          label={t('calc.loanTerm')}
          value={years}
          onChange={(value) => setYears(Math.min(25, value))}
          min={1}
          step={1}
          suffix={t('calc.years')}
        />
      </div>
      <div className="pc-output-panel" aria-live="polite">
        <Result
          label={t('calc.monthlyPayment')}
          value={formatMoney(payment, locale)}
          detail={locale === 'ar' ? `بفائدة ${rate.toFixed(2)}% على مدى ${years} ${t('calc.years')}` : `at ${rate.toFixed(2)}% over ${years} ${t('calc.years')}`}
          primary
        />
        <div className="pc-summary-grid">
          <Result label={t('calc.downPayment')} value={formatMoney(downPayment, locale)} detail={`${downPercent}%`} />
          <Result label={t('calc.loanAmount')} value={formatMoney(principal, locale)} detail={locale === 'ar' ? `نسبة التمويل ${100 - downPercent}% (LTV)` : `${100 - downPercent}% LTV`} />
          <Result label={t('calc.totalInterest')} value={formatMoney(totalRepayment - principal, locale)} />
          <Result label={t('calc.totalRepayment')} value={formatMoney(totalRepayment, locale)} />
        </div>
        <div className="pc-rate-line">
          <span>
            {t('calc.eibor3m')} <strong>{OFFICIAL_DATA.eibor3m.toFixed(2)}%</strong>
          </span>
          <span>
            {t('calc.bankMarginLabel')} <strong>{margin.toFixed(2)}%</strong>
          </span>
          <span>
            {t('calc.modelledRate')} <strong>{rate.toFixed(2)}%</strong>
          </span>
        </div>
        <a
          className="button button-secondary pc-whatsapp-btn"
          href={`https://wa.me/971555541538?text=${encodeURIComponent(
            locale === 'ar'
              ? `مرحباً، أود مناقشة تمويل عقار بقيمة ${formatMoney(price, 'ar')}، بدفعة أولى ${formatMoney(downPayment, 'ar')} (${downPercent}%)، وقسط شهري متوقع ${formatMoney(payment, 'ar')} على مدى ${years} سنوات.`
              : `Hello Prudent Dubai, I calculated mortgage terms for a property of ${formatMoney(price, 'en')}, Down payment: ${formatMoney(downPayment, 'en')} (${downPercent}%), Estimated monthly payment: ${formatMoney(payment, 'en')} over ${years} years. Please advise on options.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ width: '100%', marginTop: 20, marginBottom: 12, justifyContent: 'center', gap: 8, display: 'inline-flex' }}
        >
          <span>💬</span> {t('calc.shareWhatsapp')}
        </a>
        <p className="pc-disclaimer">{t('calc.mortgageDisclaimer')}</p>
      </div>
    </div>
  );
}

function YieldCalculator() {
  const { t, locale } = useLanguage();
  const [price, setPrice] = useState(1_500_000);
  const [annualRent, setAnnualRent] = useState(90_000);
  const [serviceCharges, setServiceCharges] = useState(0);
  const [maintenance, setMaintenance] = useState(0);
  const [vacancyPercent, setVacancyPercent] = useState(0);
  const [managementPercent, setManagementPercent] = useState(0);
  const result = useMemo(
    () => rentalYield({ price, annualRent, serviceCharges, maintenance, vacancyPercent, managementPercent }),
    [price, annualRent, serviceCharges, maintenance, vacancyPercent, managementPercent]
  );
  const currencySuffix = locale === 'ar' ? 'د.إ' : 'AED';

  return (
    <div className="pc-workspace">
      <div className="pc-form-panel">
        <div className="pc-panel-heading">
          <span>03</span>
          <div>
            <h2>{t('calc.rentalYieldTitle')}</h2>
            <p>{t('calc.rentalYieldLede')}</p>
          </div>
        </div>
        <NumberField id="yield-price" label={t('calc.price')} value={price} onChange={setPrice} min={1} suffix={currencySuffix} />
        <NumberField
          id="annual-rent"
          label={t('calc.annualRent')}
          value={annualRent}
          onChange={setAnnualRent}
          suffix={currencySuffix}
        />
        <NumberField
          id="service-charge"
          label={t('calc.serviceCharges')}
          value={serviceCharges}
          onChange={setServiceCharges}
          suffix={currencySuffix}
          hint={t('calc.serviceChargesHint')}
        />
        <NumberField
          id="maintenance"
          label={t('calc.maintenanceBudget')}
          value={maintenance}
          onChange={setMaintenance}
          suffix={currencySuffix}
        />
        <div className="pc-inline-fields">
          <NumberField
            id="vacancy"
            label={t('calc.vacancyAllowance')}
            value={vacancyPercent}
            onChange={setVacancyPercent}
            min={0}
            step={0.5}
            suffix="%"
          />
          <NumberField
            id="management"
            label={t('calc.managementFee')}
            value={managementPercent}
            onChange={setManagementPercent}
            min={0}
            step={0.5}
            suffix="%"
          />
        </div>
      </div>
      <div className="pc-output-panel" aria-live="polite">
        <Result
          label={t('calc.netYield')}
          value={formatPercent(result.netYield)}
          detail={t('calc.netYieldDetail')}
          primary
        />
        <div className="pc-summary-grid">
          <Result label={t('calc.grossYield')} value={formatPercent(result.grossYield)} />
          <Result label={t('calc.netAnnualIncome')} value={formatMoney(result.netIncome, locale)} />
        </div>
        <div className="pc-breakdown">
          <h3>{t('calc.annualIncomeCosts')}</h3>
          <Row label={t('calc.grossAnnualRent')} value={formatMoney(annualRent, locale)} />
          <Row label={`${t('calc.vacancyAllowance')} (${vacancyPercent}%)`} value={`− ${formatMoney(result.vacancyCost, locale)}`} />
          <Row label={t('calc.serviceCharges')} value={`− ${formatMoney(serviceCharges, locale)}`} />
          <Row label={`${t('calc.managementFee')} (${managementPercent}%)`} value={`− ${formatMoney(result.managementCost, locale)}`} />
          <Row label={t('calc.maintenanceBudget')} value={`− ${formatMoney(maintenance, locale)}`} />
          <Row label={t('calc.netAnnualIncome')} value={formatMoney(result.netIncome, locale)} total />
        </div>
        <a
          className="button button-secondary pc-whatsapp-btn"
          href={`https://wa.me/971555541538?text=${encodeURIComponent(
            locale === 'ar'
              ? `مرحباً، أرغب في تقييم عائد إيجاري لعقار بقيمة ${formatMoney(price, 'ar')} مع إيجار سنوي متوقع ${formatMoney(annualRent, 'ar')} (عائد صافي ${result.netYield.toFixed(2)}%).`
              : `Hello Prudent Dubai, I calculated rental yield for a property of ${formatMoney(price, 'en')} with annual rent of ${formatMoney(annualRent, 'en')} (estimated net yield: ${result.netYield.toFixed(2)}%). Please advise on high-yielding properties.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ width: '100%', marginTop: 20, marginBottom: 12, justifyContent: 'center', gap: 8, display: 'inline-flex' }}
        >
          <span>💬</span> {t('calc.shareWhatsapp')}
        </a>
        <p className="pc-disclaimer">{t('calc.yieldDisclaimer')}</p>
      </div>
    </div>
  );
}

export default function PropertyCalculator() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('costs');

  const tabs: { id: Tab; label: string; description: string }[] = [
    { id: 'costs', label: t('calc.tabCosts'), description: t('calc.tabCostsDesc') },
    { id: 'mortgage', label: t('calc.tabMortgage'), description: t('calc.tabMortgageDesc') },
    { id: 'yield', label: t('calc.tabYield'), description: t('calc.tabYieldDesc') },
  ];

  return (
    <>
      <section className="pc-hero">
        <div className="container pc-hero-grid">
          <div>
            <span className="eyebrow">{t('calc.eyebrow')}</span>
            <h1>{t('calc.heroTitle')}</h1>
            <p>{t('calc.heroLede')}</p>
          </div>
          <div className="pc-data-card">
            <span className="pc-status">
              <i />
              {t('calc.dataChecked')} {OFFICIAL_DATA.verifiedOn}
            </span>
            <strong>
              {t('calc.officialRules')}<br />{t('calc.yourFigures')}
            </strong>
            <p>{t('calc.sourcesShown')}</p>
          </div>
        </div>
      </section>

      <section className="pc-section">
        <div className="container">
          <div className="pc-tabs" role="tablist" aria-label="Property calculators">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon name={tab.id} />
                <span>
                  <strong>{tab.label}</strong>
                  <small>{tab.description}</small>
                </span>
              </button>
            ))}
          </div>

          <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="pc-shell">
            {activeTab === 'costs' && <BuyingCosts />}
            {activeTab === 'mortgage' && <MortgageCalculator />}
            {activeTab === 'yield' && <YieldCalculator />}
          </div>

          <div className="pc-sources">
            <div>
              <span className="eyebrow">{t('calc.sourcesEyebrow')}</span>
              <h2>{t('calc.sourcesTitle')}</h2>
            </div>
            <div className="pc-source-links">
              <a href="https://dubailand.gov.ae/en/eservices/property-sale-registration/" target="_blank" rel="noreferrer">
                <strong>{t('calc.dldSaleRegSource')}</strong>
                <span>{t('calc.dldSaleRegDesc')}</span>
              </a>
              <a href="https://dubailand.gov.ae/en/eservices/request-for-mortgage-registration/" target="_blank" rel="noreferrer">
                <strong>{t('calc.dldMortgageRegSource')}</strong>
                <span>{t('calc.dldMortgageRegDesc')}</span>
              </a>
              <a href="https://rulebook.centralbank.ae/en/entiresection/1793" target="_blank" rel="noreferrer">
                <strong>{t('calc.cbuaeMortgageSource')}</strong>
                <span>{t('calc.cbuaeMortgageDesc')}</span>
              </a>
              <a href="https://centralbank.ae/en/forex-eibor/eibor-rates/" target="_blank" rel="noreferrer">
                <strong>{t('calc.cbuaeEiborSource')}</strong>
                <span>{t('calc.cbuaeEiborDesc')}</span>
              </a>
              <a href="https://mollak.dubailand.gov.ae/" target="_blank" rel="noreferrer">
                <strong>{t('calc.reraSource')}</strong>
                <span>{t('calc.reraDesc')}</span>
              </a>
            </div>
          </div>

          <div className="pc-cta">
            <div>
              <h2>{t('calc.ctaTitle')}</h2>
              <p>{t('calc.ctaLede')}</p>
            </div>
            <a href="/contact" className="button button-primary">
              {t('calc.ctaButton')}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
