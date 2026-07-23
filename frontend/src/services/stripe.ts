/**
 * Stripe Checkout Service
 * Handles multi-currency checkout sessions with local payment methods
 */

import { getPricingForCountry, getPreferredPaymentMethods, type PricingConfig } from '@/utils/geoPricing';

export interface CheckoutSessionParams {
  userId: string;
  userEmail: string;
  countryCode?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  pricing: PricingConfig;
}

/**
 * Create a Stripe checkout session with localized pricing
 * This calls a Supabase Edge Function or serverless API route
 */
export async function createCheckoutSession(
  params: CheckoutSessionParams
): Promise<CheckoutSessionResponse> {
  const { userId, userEmail, countryCode, successUrl, cancelUrl, metadata = {} } = params;

  // Get pricing configuration for user's location
  const { pricing, isRestricted, restrictionReason } = getPricingForCountry(countryCode);

  if (isRestricted) {
    throw new Error(restrictionReason || 'Service not available in your region');
  }

  // Get preferred payment methods for the country
  const paymentMethods = getPreferredPaymentMethods(countryCode || 'US');

  try {
    // Call the Supabase Edge Function for Stripe checkout
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId,
          userEmail,
          currency: pricing.currency,
          amount: pricing.amount,
          paymentMethodTypes: paymentMethods,
          successUrl,
          cancelUrl,
          metadata: {
            ...metadata,
            countryCode,
            originalAmount: pricing.amount,
            currency: pricing.currency,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const data = await response.json();

    return {
      sessionId: data.sessionId,
      checkoutUrl: data.checkoutUrl,
      pricing,
    };
  } catch (error) {
    console.error('Stripe checkout session creation failed:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Unable to initialize payment. Please try again.'
    );
  }
}

/**
 * Create a customer portal session for managing subscriptions
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<{ url: string }> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          customerId,
          returnUrl,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create portal session');
    }

    const data = await response.json();
    return { url: data.url };
  } catch (error) {
    console.error('Customer portal session creation failed:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Unable to open billing portal. Please try again.'
    );
  }
}

/**
 * Validate a checkout session after completion
 */
export async function validateCheckoutSession(sessionId: string): Promise<{
  valid: boolean;
  userId?: string;
  subscriptionId?: string;
  status?: string;
}> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ sessionId }),
      }
    );

    if (!response.ok) {
      return { valid: false };
    }

    const data = await response.json();
    return {
      valid: data.valid || false,
      userId: data.userId,
      subscriptionId: data.subscriptionId,
      status: data.status,
    };
  } catch (error) {
    console.error('Checkout session validation failed:', error);
    return { valid: false };
  }
}

/**
 * Get subscription status for a user
 */
export async function getSubscriptionStatus(userId: string): Promise<{
  isActive: boolean;
  plan?: string;
  currency?: string;
  amount?: number;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string;
}> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription-status`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      return { isActive: false };
    }

    const data = await response.json();
    return {
      isActive: data.isActive || false,
      plan: data.plan,
      currency: data.currency,
      amount: data.amount,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
      currentPeriodEnd: data.currentPeriodEnd,
    };
  } catch (error) {
    console.error('Subscription status fetch failed:', error);
    return { isActive: false };
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(subscriptionId: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ subscriptionId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel subscription');
    }

    return { success: true };
  } catch (error) {
    console.error('Subscription cancellation failed:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Unable to cancel subscription. Please try again.'
    );
  }
}
