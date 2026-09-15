export type CountryInfo = {
  code: string;
  name: string;
  nameAr: string;
  dialCode: string;
  flag: string;
  placeholder: string;
  digitsRegex: RegExp;
  minDigits: number;
  maxDigits: number;
};

export const COUNTRIES: CountryInfo[] = [
  {
    code: 'AE',
    name: 'United Arab Emirates',
    nameAr: 'الإمارات العربية المتحدة',
    dialCode: '+971',
    flag: '🇦🇪',
    placeholder: '50 123 4567',
    digitsRegex: /^(?:50|52|54|55|56|58|2|3|4|6|7|9)\d{7}$/,
    minDigits: 8,
    maxDigits: 9,
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    nameAr: 'المملكة المتحدة',
    dialCode: '+44',
    flag: '🇬🇧',
    placeholder: '7123 456789',
    digitsRegex: /^7\d{9}$|^[123789]\d{8,9}$/,
    minDigits: 9,
    maxDigits: 10,
  },
  {
    code: 'US',
    name: 'United States / Canada',
    nameAr: 'الولايات المتحدة / كندا',
    dialCode: '+1',
    flag: '🇺🇸',
    placeholder: '(555) 000-0000',
    digitsRegex: /^[2-9]\d{9}$/,
    minDigits: 10,
    maxDigits: 10,
  },
  {
    code: 'IN',
    name: 'India',
    nameAr: 'الهند',
    dialCode: '+91',
    flag: '🇮🇳',
    placeholder: '98765 43210',
    digitsRegex: /^[6-9]\d{9}$/,
    minDigits: 10,
    maxDigits: 10,
  },
  {
    code: 'RU',
    name: 'Russia',
    nameAr: 'روسيا',
    dialCode: '+7',
    flag: '🇷🇺',
    placeholder: '912 345-67-89',
    digitsRegex: /^9\d{9}$/,
    minDigits: 10,
    maxDigits: 10,
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    nameAr: 'المملكة العربية السعودية',
    dialCode: '+966',
    flag: '🇸🇦',
    placeholder: '50 123 4567',
    digitsRegex: /^5\d{8}$/,
    minDigits: 9,
    maxDigits: 9,
  },
  {
    code: 'QA',
    name: 'Qatar',
    nameAr: 'قطر',
    dialCode: '+974',
    flag: '🇶🇦',
    placeholder: '3312 3456',
    digitsRegex: /^[3567]\d{7}$/,
    minDigits: 8,
    maxDigits: 8,
  },
  {
    code: 'KW',
    name: 'Kuwait',
    nameAr: 'الكويت',
    dialCode: '+965',
    flag: '🇰🇼',
    placeholder: '9123 4567',
    digitsRegex: /^[569]\d{7}$/,
    minDigits: 8,
    maxDigits: 8,
  },
  {
    code: 'OM',
    name: 'Oman',
    nameAr: 'عُمان',
    dialCode: '+968',
    flag: '🇴🇲',
    placeholder: '9123 4567',
    digitsRegex: /^[79]\d{7}$/,
    minDigits: 8,
    maxDigits: 8,
  },
  {
    code: 'BH',
    name: 'Bahrain',
    nameAr: 'البحرين',
    dialCode: '+973',
    flag: '🇧🇭',
    placeholder: '3912 3456',
    digitsRegex: /^[36]\d{7}$/,
    minDigits: 8,
    maxDigits: 8,
  },
  {
    code: 'DE',
    name: 'Germany',
    nameAr: 'ألمانيا',
    dialCode: '+49',
    flag: '🇩🇪',
    placeholder: '151 12345678',
    digitsRegex: /^1[567]\d{8,9}$/,
    minDigits: 9,
    maxDigits: 11,
  },
  {
    code: 'FR',
    name: 'France',
    nameAr: 'فرنسا',
    dialCode: '+33',
    flag: '🇫🇷',
    placeholder: '6 12 34 56 78',
    digitsRegex: /^[67]\d{8}$/,
    minDigits: 9,
    maxDigits: 9,
  },
  {
    code: 'CN',
    name: 'China',
    nameAr: 'الصين',
    dialCode: '+86',
    flag: '🇨🇳',
    placeholder: '138 0000 0000',
    digitsRegex: /^1[3-9]\d{9}$/,
    minDigits: 11,
    maxDigits: 11,
  },
  {
    code: 'SG',
    name: 'Singapore',
    nameAr: 'سنغافورة',
    dialCode: '+65',
    flag: '🇸🇬',
    placeholder: '8123 4567',
    digitsRegex: /^[89]\d{7}$/,
    minDigits: 8,
    maxDigits: 8,
  },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // UAE (+971)

export function findCountry(code: string): CountryInfo {
  return COUNTRIES.find((c) => c.code === code) || DEFAULT_COUNTRY;
}

export function validatePhoneNumber(rawNumber: string, country: CountryInfo): { valid: boolean; formatted: string; error?: string } {
  const digitsOnly = rawNumber.replace(/\D/g, '');
  
  if (!digitsOnly) {
    return { valid: false, formatted: '', error: 'Phone number is required.' };
  }

  // Strip leading zero if user typed national trunk code (e.g. UK 07... or UAE 050...)
  let cleanDigits = digitsOnly;
  if (cleanDigits.startsWith('0') && cleanDigits.length > country.minDigits) {
    cleanDigits = cleanDigits.slice(1);
  }

  if (cleanDigits.length < country.minDigits) {
    return { valid: false, formatted: '', error: `Phone number must be at least ${country.minDigits} digits for ${country.name}.` };
  }

  if (cleanDigits.length > country.maxDigits) {
    return { valid: false, formatted: '', error: `Phone number cannot exceed ${country.maxDigits} digits for ${country.name}.` };
  }

  if (!country.digitsRegex.test(cleanDigits)) {
    return { valid: false, formatted: '', error: `Please enter a valid mobile or landline number for ${country.name}.` };
  }

  const formatted = `${country.dialCode} ${cleanDigits}`;
  return { valid: true, formatted };
}
