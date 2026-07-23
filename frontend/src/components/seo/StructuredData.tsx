/**
 * Structured Data Component
 * Injects JSON-LD Schema.org markup for SEO and LLM parsing
 * Improves search engine visibility and rich snippets
 */

import { useEffect } from 'react';

interface OrganizationData {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  contactPoint?: {
    telephone?: string;
    email?: string;
    contactType?: string;
  };
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
}

interface CourseData {
  name: string;
  description: string;
  provider: string;
  url: string;
  offers?: {
    price?: string;
    priceCurrency?: string;
    availability?: string;
  };
}

interface PersonData {
  name: string;
  url?: string;
  jobTitle?: string;
  worksFor?: string;
  description?: string;
}

interface WebSiteData {
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    target: string;
    queryInput: string;
  };
}

export function StructuredOrganization({ data }: { data: OrganizationData }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'structured-data-organization';
    
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: data.name,
      url: data.url,
      logo: data.logo,
      description: data.description,
      sameAs: data.sameAs,
      contactPoint: data.contactPoint,
      address: data.address,
    };
    
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    
    return () => {
      const existingScript = document.getElementById('structured-data-organization');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [data]);

  return null;
}

export function StructuredCourse({ data }: { data: CourseData }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'structured-data-course';
    
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: data.name,
      description: data.description,
      provider: {
        '@type': 'Organization',
        name: data.provider,
      },
      url: data.url,
      offers: data.offers,
    };
    
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    
    return () => {
      const existingScript = document.getElementById('structured-data-course');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [data]);

  return null;
}

export function StructuredPerson({ data }: { data: PersonData }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'structured-data-person';
    
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: data.name,
      url: data.url,
      jobTitle: data.jobTitle,
      worksFor: {
        '@type': 'Organization',
        name: data.worksFor,
      },
      description: data.description,
    };
    
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    
    return () => {
      const existingScript = document.getElementById('structured-data-person');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [data]);

  return null;
}

export function StructuredWebSite({ data }: { data: WebSiteData }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'structured-data-website';
    
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: data.name,
      url: data.url,
      description: data.description,
      potentialAction: data.potentialAction ? {
        '@type': 'SearchAction',
        target: data.potentialAction.target,
        'query-input': data.potentialAction.queryInput,
      } : undefined,
    };
    
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    
    return () => {
      const existingScript = document.getElementById('structured-data-website');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [data]);

  return null;
}

// Default organization data for FunFinity Academy
export const defaultOrganizationData: OrganizationData = {
  name: 'FunFinity Academy',
  url: 'https://funfinityacademy.vercel.app',
  description: 'An innovative educational platform providing personalized learning experiences for students worldwide.',
  sameAs: [
    'https://twitter.com/funfinityacademy',
    'https://linkedin.com/company/funfinityacademy',
    'https://facebook.com/funfinityacademy',
  ],
  contactPoint: {
    contactType: 'customer service',
    email: 'support@funfinityacademy.com',
  },
};

// Default website data
export const defaultWebSiteData: WebSiteData = {
  name: 'FunFinity Academy',
  url: 'https://funfinityacademy.vercel.app',
  description: 'Personalized learning platform for students',
  potentialAction: {
    target: 'https://funfinityacademy.vercel.app/search?q={search_term_string}',
    queryInput: 'required name=search_term_string',
  },
};
