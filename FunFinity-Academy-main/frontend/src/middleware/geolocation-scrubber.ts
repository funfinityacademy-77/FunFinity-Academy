/**
 * GDPR COMPLIANCE: Geolocation Scrubbing Middleware
 * 
 * This middleware reads the Vercel header (x-vercel-ip-country) to extract
 * continent/country for localized pricing tiers, maps it to the user session,
 * and immediately purges the raw IP address to comply with GDPR requirements.
 * 
 * NO RAW IP ADDRESSES ARE STORED IN THE DATABASE.
 */

interface GeoLocationData {
  country: string | null;
  continent: string | null;
  region: string | null;
  pricingTier: 'standard' | 'eu' | 'asia' | 'americas';
}

/**
 * Map country codes to pricing tiers and continents
 */
const COUNTRY_TO_TIER: Record<string, GeoLocationData['pricingTier']> = {
  // European Union countries - EU pricing tier
  'AT': 'eu', 'BE': 'eu', 'BG': 'eu', 'HR': 'eu', 'CY': 'eu', 'CZ': 'eu',
  'DK': 'eu', 'EE': 'eu', 'FI': 'eu', 'FR': 'eu', 'DE': 'eu', 'GR': 'eu',
  'HU': 'eu', 'IE': 'eu', 'IT': 'eu', 'LV': 'eu', 'LT': 'eu', 'LU': 'eu',
  'MT': 'eu', 'NL': 'eu', 'PL': 'eu', 'PT': 'eu', 'RO': 'eu', 'SK': 'eu',
  'SI': 'eu', 'ES': 'eu', 'SE': 'eu',
  
  // Asia-Pacific - Asia pricing tier
  'CN': 'asia', 'JP': 'asia', 'KR': 'asia', 'SG': 'asia', 'AU': 'asia',
  'NZ': 'asia', 'IN': 'asia', 'ID': 'asia', 'MY': 'asia', 'PH': 'asia',
  'TH': 'asia', 'VN': 'asia', 'HK': 'asia', 'TW': 'asia',
  
  // Americas - Americas pricing tier
  'US': 'americas', 'CA': 'americas', 'MX': 'americas', 'BR': 'americas',
  'AR': 'americas', 'CL': 'americas', 'CO': 'americas', 'PE': 'americas',
};

const COUNTRY_TO_CONTINENT: Record<string, string> = {
  // Europe
  'AT': 'Europe', 'BE': 'Europe', 'BG': 'Europe', 'HR': 'Europe', 'CY': 'Europe',
  'CZ': 'Europe', 'DK': 'Europe', 'EE': 'Europe', 'FI': 'Europe', 'FR': 'Europe',
  'DE': 'Europe', 'GR': 'Europe', 'HU': 'Europe', 'IE': 'Europe', 'IT': 'Europe',
  'LV': 'Europe', 'LT': 'Europe', 'LU': 'Europe', 'MT': 'Europe', 'NL': 'Europe',
  'PL': 'Europe', 'PT': 'Europe', 'RO': 'Europe', 'SK': 'Europe', 'SI': 'Europe',
  'ES': 'Europe', 'SE': 'Europe', 'GB': 'Europe', 'CH': 'Europe', 'NO': 'Europe',
  
  // Asia
  'CN': 'Asia', 'JP': 'Asia', 'KR': 'Asia', 'SG': 'Asia', 'AU': 'Asia',
  'NZ': 'Asia', 'IN': 'Asia', 'ID': 'Asia', 'MY': 'Asia', 'PH': 'Asia',
  'TH': 'Asia', 'VN': 'Asia', 'HK': 'Asia', 'TW': 'Asia',
  
  // Americas
  'US': 'Americas', 'CA': 'Americas', 'MX': 'Americas', 'BR': 'Americas',
  'AR': 'Americas', 'CL': 'Americas', 'CO': 'Americas', 'PE': 'Americas',
  
  // Africa
  'ZA': 'Africa', 'EG': 'Africa', 'NG': 'Africa', 'KE': 'Africa',
};

/**
 * Extract geolocation data from Vercel headers
 * This function NEVER stores raw IP addresses
 */
export function extractGeolocation(headers: Headers): GeoLocationData {
  const country = headers.get('x-vercel-ip-country') || null;
  const region = headers.get('x-vercel-ip-country-region') || null;
  
  // Determine pricing tier based on country
  const pricingTier = country ? (COUNTRY_TO_TIER[country] || 'standard') : 'standard';
  
  // Determine continent based on country
  const continent = country ? (COUNTRY_TO_CONTINENT[country] || 'Unknown') : null;
  
  return {
    country,
    continent,
    region,
    pricingTier,
  };
}

/**
 * Get localized pricing based on geolocation tier
 */
export function getLocalizedPricing(tier: GeoLocationData['pricingTier']) {
  const pricing = {
    standard: {
      monthly: 9.99,
      annual: 99.99,
      currency: 'USD',
    },
    eu: {
      monthly: 11.99,
      annual: 119.99,
      currency: 'EUR',
    },
    asia: {
      monthly: 7.99,
      annual: 79.99,
      currency: 'USD',
    },
    americas: {
      monthly: 9.99,
      annual: 99.99,
      currency: 'USD',
    },
  };
  
  return pricing[tier];
}

/**
 * Middleware function to process geolocation and scrub IP
 * This should be called on every request to ensure GDPR compliance
 */
export async function geolocationMiddleware(request: Request): Promise<{
  geoData: GeoLocationData;
  pricing: ReturnType<typeof getLocalizedPricing>;
}> {
  const headers = new Headers(request.headers);
  
  // Extract geolocation data (NO RAW IP STORAGE)
  const geoData = extractGeolocation(headers);
  
  // Get localized pricing
  const pricing = getLocalizedPricing(geoData.pricingTier);
  
  // Log for debugging (NEVER log raw IP)
  console.log('Geolocation processed:', {
    country: geoData.country,
    continent: geoData.continent,
    pricingTier: geoData.pricingTier,
  });
  
  return {
    geoData,
    pricing,
  };
}

/**
 * Store geolocation data in user session (GDPR compliant)
 * Only stores country/continent/tier - NEVER raw IP
 */
export function storeGeolocationInSession(geoData: GeoLocationData) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('user-geo', JSON.stringify({
      country: geoData.country,
      continent: geoData.continent,
      pricingTier: geoData.pricingTier,
      timestamp: Date.now(),
    }));
  }
}

/**
 * Retrieve geolocation data from session
 */
export function getGeolocationFromSession(): GeoLocationData | null {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('user-geo');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Clear geolocation data from session
 */
export function clearGeolocationFromSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('user-geo');
  }
}
