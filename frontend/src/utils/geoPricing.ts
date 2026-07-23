/**
 * Geo-Location Pricing Utility
 * Handles PPP-based pricing tiers and regional compliance checks
 */

export interface PricingConfig {
  currency: string;
  amount: number;
  currencySymbol: string;
  localizedLabel: string;
}

export interface GeoPricingResult {
  pricing: PricingConfig;
  isRestricted: boolean;
  restrictionReason?: string;
  countryCode: string;
}

// OFAC-sanctioned and restricted countries
const RESTRICTED_COUNTRIES = new Set([
  'CU', // Cuba
  'IR', // Iran
  'KP', // North Korea
  'SY', // Syria
  'RU', // Russia (sanctions)
  'BY', // Belarus
  'MM', // Myanmar
]);

// PPP-based pricing tiers (USD equivalent)
const PRICING_TIERS: Record<string, PricingConfig> = {
  // India - $2 equivalent
  IN: {
    currency: 'INR',
    amount: 165,
    currencySymbol: '₹',
    localizedLabel: '₹165/month',
  },
  // Brazil - $3 equivalent
  BR: {
    currency: 'BRL',
    amount: 15,
    currencySymbol: 'R$',
    localizedLabel: 'R$15/month',
  },
  // Mexico - $3.5 equivalent
  MX: {
    currency: 'MXN',
    amount: 65,
    currencySymbol: '$',
    localizedLabel: '$65 MXN/month',
  },
  // Philippines - $2.5 equivalent
  PH: {
    currency: 'PHP',
    amount: 140,
    currencySymbol: '₱',
    localizedLabel: '₱140/month',
  },
  // Indonesia - $2.5 equivalent
  ID: {
    currency: 'IDR',
    amount: 38000,
    currencySymbol: 'Rp',
    localizedLabel: 'Rp38,000/month',
  },
  // Nigeria - $2.5 equivalent
  NG: {
    currency: 'NGN',
    amount: 3800,
    currencySymbol: '₦',
    localizedLabel: '₦3,800/month',
  },
  // Pakistan - $2 equivalent
  PK: {
    currency: 'PKR',
    amount: 560,
    currencySymbol: '₨',
    localizedLabel: '₨560/month',
  },
  // Bangladesh - $2 equivalent
  BD: {
    currency: 'BDT',
    amount: 220,
    currencySymbol: '৳',
    localizedLabel: '৳220/month',
  },
  // Vietnam - $2.5 equivalent
  VN: {
    currency: 'VND',
    amount: 60000,
    currencySymbol: '₫',
    localizedLabel: '₫60,000/month',
  },
  // Egypt - $2.5 equivalent
  EG: {
    currency: 'EGP',
    amount: 75,
    currencySymbol: 'E£',
    localizedLabel: 'E£75/month',
  },
  // Turkey - $3.5 equivalent
  TR: {
    currency: 'TRY',
    amount: 105,
    currencySymbol: '₺',
    localizedLabel: '₺105/month',
  },
  // Colombia - $3 equivalent
  CO: {
    currency: 'COP',
    amount: 12000,
    currencySymbol: '$',
    localizedLabel: '$12,000 COP/month',
  },
  // Argentina - $3.5 equivalent
  AR: {
    currency: 'ARS',
    amount: 3500,
    currencySymbol: '$',
    localizedLabel: '$3,500 ARS/month',
  },
  // South Africa - $4 equivalent
  ZA: {
    currency: 'ZAR',
    amount: 75,
    currencySymbol: 'R',
    localizedLabel: 'R75/month',
  },
  // Kenya - $3 equivalent
  KE: {
    currency: 'KES',
    amount: 450,
    currencySymbol: 'KSh',
    localizedLabel: 'KSh450/month',
  },
  // Nigeria - already listed above
  // Default global pricing - $5 USD
  DEFAULT: {
    currency: 'USD',
    amount: 5,
    currencySymbol: '$',
    localizedLabel: '$5/month',
  },
};

/**
 * Get country code from Vercel request headers
 * Falls back to client-side detection if headers not available
 */
export function getCountryCode(): string {
  // Server-side: check Vercel headers
  if (typeof window === 'undefined') {
    // This would be used in Edge Functions/Serverless functions
    return 'US';
  }

  // Client-side: try to detect from browser locale
  const locale = navigator.language || 'en-US';
  const countryCode = locale.split('-')[1]?.toUpperCase() || 'US';
  return countryCode;
}

/**
 * Get pricing configuration based on user's location
 */
export function getPricingForCountry(countryCode?: string): GeoPricingResult {
  const code = countryCode?.toUpperCase() || getCountryCode();

  // Check if country is restricted
  if (RESTRICTED_COUNTRIES.has(code)) {
    return {
      pricing: PRICING_TIERS.DEFAULT,
      isRestricted: true,
      restrictionReason: 'Service not available in this region due to trade compliance regulations',
      countryCode: code,
    };
  }

  // Get pricing for country or fall back to default
  const pricing = PRICING_TIERS[code] || PRICING_TIERS.DEFAULT;

  return {
    pricing,
    isRestricted: false,
    countryCode: code,
  };
}

/**
 * Get all available pricing tiers for display
 */
export function getAllPricingTiers(): Array<{
  countryCode: string;
  config: PricingConfig;
  regionName: string;
}> {
  const regionNames: Record<string, string> = {
    IN: 'India',
    BR: 'Brazil',
    MX: 'Mexico',
    PH: 'Philippines',
    ID: 'Indonesia',
    NG: 'Nigeria',
    PK: 'Pakistan',
    BD: 'Bangladesh',
    VN: 'Vietnam',
    EG: 'Egypt',
    TR: 'Turkey',
    CO: 'Colombia',
    AR: 'Argentina',
    ZA: 'South Africa',
    KE: 'Kenya',
    US: 'United States',
  };

  return Object.entries(PRICING_TIERS)
    .filter(([key]) => key !== 'DEFAULT')
    .map(([countryCode, config]) => ({
      countryCode,
      config,
      regionName: regionNames[countryCode] || countryCode,
    }))
    .sort((a, b) => a.regionName.localeCompare(b.regionName));
}

/**
 * Validate if a country code is supported
 */
export function isCountrySupported(countryCode: string): boolean {
  return !RESTRICTED_COUNTRIES.has(countryCode.toUpperCase());
}

/**
 * Get Stripe payment method preferences for a country
 */
export function getPreferredPaymentMethods(countryCode: string): string[] {
  const code = countryCode.toUpperCase();
  
  const paymentMethods: Record<string, string[]> = {
    IN: ['upi', 'card', 'netbanking'],
    BR: ['pix', 'card', 'boleto'],
    MX: ['oxxo', 'card', 'spei'],
    PH: ['gcash', 'maya', 'card'],
    ID: ['gopay', 'ovo', 'dana', 'card'],
    NG: ['card', 'bank_transfer'],
    PK: ['jazzcash', 'easypaisa', 'card'],
    BD: ['bkash', 'card'],
    VN: ['momo', 'zalopay', 'card'],
    EG: ['fawry', 'card'],
    TR: ['card', 'bank_transfer'],
    CO: ['pse', 'card', 'baloto'],
    AR: ['card', 'rapipago', 'pagofacil'],
    ZA: ['card', 'eft'],
    KE: ['mpesa', 'card'],
  };

  return paymentMethods[code] || ['card'];
}
