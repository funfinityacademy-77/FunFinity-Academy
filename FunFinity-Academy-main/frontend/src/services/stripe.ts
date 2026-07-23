/**
 * Stripe Checkout Service for Multi-Currency Payments
 * Handles server-side checkout session creation with local payment methods
 */

import { supabase } from '@/lib/supabase';
import { getPricingForCountry, getStripePaymentMethods } from '@/utils/geoPricing';

export interface CheckoutSessionRequest {
  userId: string;
  email: string;
  countryCode: string;
  tier: 'monthly' | 'annual';
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

/**
 * Create a Stripe Checkout session with localized pricing
 * This would typically call a Supabase Edge Function or Next.js API route
 */
export const createCheckoutSession = async (
  request: CheckoutSessionRequest
): Promise<CheckoutSessionResponse> => {
  const { userId, email, countryCode, tier, successUrl, cancelUrl } = request;

  // Get pricing configuration for the user's country
  const pricing = getPricingForCountry(countryCode);
  const paymentMethods = getStripePaymentMethods(countryCode);

  // Calculate price based on tier
  const isAnnual = tier === 'annual';
  const amount = isAnnual 
    ? Math.round(pricing.priceLocal * 10) // 10 months = 2 months free
    : pricing.priceLocal;

  try {
    // Call Supabase Edge Function for secure session creation
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        userId,
        email,
        countryCode,
        currency: pricing.currency,
        amount,
        tier,
        paymentMethods,
        successUrl,
        cancelUrl,
      },
    });

    if (error) {
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }

    return {
      sessionId: data.sessionId,
      url: data.url,
    };
  } catch (error) {
    console.error('Checkout session creation error:', error);
    throw error;
  }
};

/**
 * Redirect to Stripe Checkout
 */
export const redirectToCheckout = async (
  request: CheckoutSessionRequest
): Promise<void> => {
  const session = await createCheckoutSession(request);
  window.location.href = session.url;
};

/**
 * Get subscription status for a user
 */
export const getSubscriptionStatus = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No active subscription found
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to get subscription status:', error);
    throw error;
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('cancel-subscription', {
      body: { subscriptionId },
    });

    if (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    throw error;
  }
};

/**
 * Update subscription tier
 */
export const updateSubscriptionTier = async (
  subscriptionId: string,
  newTier: 'monthly' | 'annual'
): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('update-subscription', {
      body: { subscriptionId, newTier },
    });

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  } catch (error) {
    console.error('Subscription update error:', error);
    throw error;
  }
};

/**
 * Get payment history for a user
 */
export const getPaymentHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to get payment history:', error);
    throw error;
  }
};
