/**
 * Geo-Routing & Purchasing Power Parity (PPP) Pricing Utility
 * Detects user country and applies localized pricing based on PPP
 */

export interface CountryPricing {
  countryCode: string;
  currency: string;
  priceUSD: number;
  priceLocal: number;
  currencySymbol: string;
  paymentMethods: string[];
}

export interface PricingTier {
  name: string;
  features: string[];
  pricing: CountryPricing;
}

/**
 * OFAC-sanctioned and restricted countries
 * These countries are blocked from accessing the platform
 */
const RESTRICTED_COUNTRIES = [
  'CU', // Cuba
  'IR', // Iran
  'KP', // North Korea
  'SY', // Syria
  'RU', // Russia (sanctions)
  'BY', // Belarus
  'MM', // Myanmar
];

/**
 * PPP-based pricing configuration
 * Prices are adjusted based on purchasing power parity
 */
const PPP_PRICING: Record<string, CountryPricing> = {
  // India - lowest tier due to PPP
  IN: {
    countryCode: 'IN',
    currency: 'INR',
    priceUSD: 2.00,
    priceLocal: 169, // ~$2 USD equivalent
    currencySymbol: '₹',
    paymentMethods: ['card', 'upi', 'netbanking'],
  },
  // Brazil - mid-low tier
  BR: {
    countryCode: 'BR',
    currency: 'BRL',
    priceUSD: 3.00,
    priceLocal: 15.00, // ~$3 USD equivalent
    currencySymbol: 'R$',
    paymentMethods: ['card', 'pix', 'boleto'],
  },
  // Mexico - mid tier
  MX: {
    countryCode: 'MX',
    currency: 'MXN',
    priceUSD: 3.50,
    priceLocal: 60.00, // ~$3.50 USD equivalent
    currencySymbol: '$',
    paymentMethods: ['card', 'oxxo', 'spei'],
  },
  // Philippines - mid-low tier
  PH: {
    countryCode: 'PH',
    currency: 'PHP',
    priceUSD: 2.50,
    priceLocal: 140, // ~$2.50 USD equivalent
    currencySymbol: '₱',
    paymentMethods: ['card', 'gcash', 'maya'],
  },
  // Indonesia - low tier
  ID: {
    countryCode: 'ID',
    currency: 'IDR',
    priceUSD: 2.50,
    priceLocal: 37500, // ~$2.50 USD equivalent
    currencySymbol: 'Rp',
    paymentMethods: ['card', 'gopay', 'ovo', 'dana'],
  },
  // Nigeria - low tier
  NG: {
    countryCode: 'NG',
    currency: 'NGN',
    priceUSD: 2.50,
    priceLocal: 3750, // ~$2.50 USD equivalent
    currencySymbol: '₦',
    paymentMethods: ['card', 'bank_transfer'],
  },
  // Pakistan - lowest tier
  PK: {
    countryCode: 'PK',
    currency: 'PKR',
    priceUSD: 2.00,
    priceLocal: 560, // ~$2 USD equivalent
    currencySymbol: '₨',
    paymentMethods: ['card', 'jazzcash', 'easypaisa'],
  },
  // Bangladesh - lowest tier
  BD: {
    countryCode: 'BD',
    currency: 'BDT',
    priceUSD: 2.00,
    priceLocal: 220, // ~$2 USD equivalent
    currencySymbol: '৳',
    paymentMethods: ['card', 'bkash', 'nagad'],
  },
  // Vietnam - low tier
  VN: {
    countryCode: 'VN',
    currency: 'VND',
    priceUSD: 2.50,
    priceLocal: 60000, // ~$2.50 USD equivalent
    currencySymbol: '₫',
    paymentMethods: ['card', 'momo', 'zalopay'],
  },
  // Egypt - low tier
  EG: {
    countryCode: 'EG',
    currency: 'EGP',
    priceUSD: 2.50,
    priceLocal: 77, // ~$2.50 USD equivalent
    currencySymbol: 'E£',
    paymentMethods: ['card', 'fawry', 'instapay'],
  },
  // Turkey - mid tier
  TR: {
    countryCode: 'TR',
    currency: 'TRY',
    priceUSD: 3.00,
    priceLocal: 90, // ~$3 USD equivalent
    currencySymbol: '₺',
    paymentMethods: ['card', 'bank_transfer'],
  },
  // Argentina - mid tier
  AR: {
    countryCode: 'AR',
    currency: 'ARS',
    priceUSD: 3.50,
    priceLocal: 3500, // ~$3.50 USD equivalent
    currencySymbol: '$',
    paymentMethods: ['card', 'mercado_pago'],
  },
  // Colombia - mid tier
  CO: {
    countryCode: 'CO',
    currency: 'COP',
    priceUSD: 3.00,
    priceLocal: 12000, // ~$3 USD equivalent
    currencySymbol: '$',
    paymentMethods: ['card', 'pse', 'nequi'],
  },
  // Peru - mid tier
  PE: {
    countryCode: 'PE',
    currency: 'PEN',
    priceUSD: 3.00,
    priceLocal: 11, // ~$3 USD equivalent
    currencySymbol: 'S/',
    paymentMethods: ['card', 'yape', 'plin'],
  },
  // Chile - mid tier
  CL: {
    countryCode: 'CL',
    currency: 'CLP',
    priceUSD: 3.50,
    priceLocal: 3200, // ~$3.50 USD equivalent
    currencySymbol: '$',
    paymentMethods: ['card', 'webpay'],
  },
  // Thailand - mid-low tier
  TH: {
    countryCode: 'TH',
    currency: 'THB',
    priceUSD: 3.00,
    priceLocal: 105, // ~$3 USD equivalent
    currencySymbol: '฿',
    paymentMethods: ['card', 'promptpay', 'truemoney'],
  },
  // Malaysia - mid tier
  MY: {
    countryCode: 'MY',
    currency: 'MYR',
    priceUSD: 3.50,
    priceLocal: 16, // ~$3.50 USD equivalent
    currencySymbol: 'RM',
    paymentMethods: ['card', 'fpx', 'grabpay'],
  },
  // Singapore - high tier (developed)
  SG: {
    countryCode: 'SG',
    currency: 'SGD',
    priceUSD: 5.00,
    priceLocal: 6.70, // ~$5 USD equivalent
    currencySymbol: 'S$',
    paymentMethods: ['card', 'grabpay', 'paynow'],
  },
  // United Kingdom - high tier
  GB: {
    countryCode: 'GB',
    currency: 'GBP',
    priceUSD: 5.00,
    priceLocal: 4.00, // ~$5 USD equivalent
    currencySymbol: '£',
    paymentMethods: ['card', 'bacs', 'sepa'],
  },
  // Eurozone - high tier
  DE: {
    countryCode: 'DE',
    currency: 'EUR',
    priceUSD: 5.00,
    priceLocal: 4.60, // ~$5 USD equivalent
    currencySymbol: '€',
    paymentMethods: ['card', 'sofort', 'sepa', 'giropay'],
  },
  FR: {
    countryCode: 'FR',
    currency: 'EUR',
    priceUSD: 5.00,
    priceLocal: 4.60, // ~$5 USD equivalent
    currencySymbol: '€',
    paymentMethods: ['card', 'sepa', 'carte_bancaire'],
  },
  // Canada - high tier
  CA: {
    countryCode: 'CA',
    currency: 'CAD',
    priceUSD: 5.00,
    priceLocal: 6.80, // ~$5 USD equivalent
    currencySymbol: 'C$',
    paymentMethods: ['card', 'interac'],
  },
  // Australia - high tier
  AU: {
    countryCode: 'AU',
    currency: 'AUD',
    priceUSD: 5.00,
    priceLocal: 7.50, // ~$5 USD equivalent
    currencySymbol: 'A$',
    paymentMethods: ['card', 'bpay', 'poli'],
  },
  // Japan - high tier
  JP: {
    countryCode: 'JP',
    currency: 'JPY',
    priceUSD: 5.00,
    priceLocal: 750, // ~$5 USD equivalent
    currencySymbol: '¥',
    paymentMethods: ['card', 'konbini', 'bank_transfer'],
  },
  // South Korea - high tier
  KR: {
    countryCode: 'KR',
    currency: 'KRW',
    priceUSD: 5.00,
    priceLocal: 6800, // ~$5 USD equivalent
    currencySymbol: '₩',
    paymentMethods: ['card', 'kakao_pay', 'naver_pay'],
  },
  // United States - high tier (default)
  US: {
    countryCode: 'US',
    currency: 'USD',
    priceUSD: 5.00,
    priceLocal: 5.00,
    currencySymbol: '$',
    paymentMethods: ['card', 'apple_pay', 'google_pay'],
  },
};

/**
 * Default pricing for countries not in PPP table
 */
const DEFAULT_PRICING: CountryPricing = {
  countryCode: 'US',
  currency: 'USD',
  priceUSD: 5.00,
  priceLocal: 5.00,
  currencySymbol: '$',
  paymentMethods: ['card'],
};

/**
 * Detect user country from request headers (Vercel)
 * Falls back to client-side IP detection if headers not available
 */
export const detectCountry = async (): Promise<string> => {
  // Try Vercel headers first (server-side)
  if (typeof window === 'undefined') {
    // Server-side: would use request headers in actual implementation
    return 'US'; // Default for server-side
  }

  // Client-side: use IP geolocation API
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_code || 'US';
  } catch (error) {
    console.error('Failed to detect country:', error);
    return 'US'; // Fallback to US
  }
};

/**
 * Check if country is restricted
 */
export const isCountryRestricted = (countryCode: string): boolean => {
  return RESTRICTED_COUNTRIES.includes(countryCode.toUpperCase());
};

/**
 * Get pricing configuration for a country
 */
export const getPricingForCountry = (countryCode: string): CountryPricing => {
  const code = countryCode.toUpperCase();
  return PPP_PRICING[code] || DEFAULT_PRICING;
};

/**
 * Get all available pricing tiers for a country
 */
export const getPricingTiers = (countryCode: string): PricingTier[] => {
  const basePricing = getPricingForCountry(countryCode);
  
  return [
    {
      name: 'Monthly',
      features: [
        'Access to all courses',
        'AI-powered study notes',
        'Live cohort sessions',
        'Community support',
        'Mobile app access',
      ],
      pricing: basePricing,
    },
    {
      name: 'Annual',
      features: [
        'Everything in Monthly',
        '2 months free',
        'Priority support',
        'Advanced AI features',
        'Certificate of completion',
      ],
      pricing: {
        ...basePricing,
        priceLocal: Math.round(basePricing.priceLocal * 10), // 10 months = 2 months free
        priceUSD: basePricing.priceUSD * 10,
      },
    },
  ];
};

/**
 * Format price for display
 */
export const formatPrice = (pricing: CountryPricing): string => {
  return `${pricing.currencySymbol}${pricing.priceLocal.toLocaleString()}`;
};

/**
 * Get Stripe payment method types for a country
 */
export const getStripePaymentMethods = (countryCode: string): string[] => {
  const pricing = getPricingForCountry(countryCode);
  
  // Map local payment methods to Stripe types
  const methodMap: Record<string, string> = {
    card: 'card',
    upi: 'upi',
    pix: 'pix',
    boleto: 'boleto',
    oxxo: 'oxxo',
    spei: 'spei',
    gcash: 'gcash',
    maya: 'maya',
    gopay: 'gopay',
    ovo: 'ovo',
    dana: 'dana',
    jazzcash: 'grabpay', // Fallback
    easypaisa: 'grabpay', // Fallback
    bkash: 'grabpay', // Fallback
    nagad: 'grabpay', // Fallback
    momo: 'grabpay', // Fallback
    zalopay: 'grabpay', // Fallback
    fawry: 'grabpay', // Fallback
    instapay: 'grabpay', // Fallback
    mercado_pago: 'grabpay', // Fallback
    pse: 'pse',
    nequi: 'nequi',
    yape: 'grabpay', // Fallback
    plin: 'grabpay', // Fallback
    webpay: 'webpay',
    promptpay: 'promptpay',
    truemoney: 'grabpay', // Fallback
    fpx: 'fpx',
    grabpay: 'grabpay',
    paynow: 'grabpay', // Fallback
    bacs: 'bacs',
    sepa: 'sepa_debit',
    sofort: 'sofort',
    giropay: 'giropay',
    interac: 'interac',
    bpay: 'bpay',
    poli: 'poli',
    konbini: 'konbini',
    kakao_pay: 'kakao_pay',
    naver_pay: 'naver_pay',
    apple_pay: 'apple_pay',
    google_pay: 'google_pay',
  };

  return pricing.paymentMethods
    .map(method => methodMap[method] || 'card')
    .filter((method, index, self) => self.indexOf(method) === index); // Remove duplicates
};

/**
 * Validate country code format
 */
export const isValidCountryCode = (code: string): boolean => {
  return /^[A-Z]{2}$/i.test(code);
};

/**
 * Main function to get complete pricing configuration
 */
export const getPricingConfig = async (): Promise<{
  countryCode: string;
  isRestricted: boolean;
  pricing: CountryPricing;
  tiers: PricingTier[];
  paymentMethods: string[];
}> => {
  const countryCode = await detectCountry();
  const isRestricted = isCountryRestricted(countryCode);
  const pricing = getPricingForCountry(countryCode);
  const tiers = getPricingTiers(countryCode);
  const paymentMethods = getStripePaymentMethods(countryCode);

  return {
    countryCode,
    isRestricted,
    pricing,
    tiers,
    paymentMethods,
  };
};
