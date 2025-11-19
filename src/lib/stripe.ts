/**
 * Stripe configuration and utilities
 */

import Stripe from 'stripe';

// Use a placeholder key for build time if not provided
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_for_build';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
});

/**
 * Check if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder_key_for_build';
}

/**
 * Pricing tiers and Stripe Price IDs
 * Update these with your actual Stripe Price IDs from your Stripe Dashboard
 */
export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    stripePriceId: null,
    features: [
      'Core posture monitoring',
      'Basic analytics (7 days)',
      'Standard break reminders',
      'Up to 2 workstations',
      'Community support',
    ],
    limits: {
      workstations: 2,
      analyticsHistory: 7, // days
      aiInsights: false,
      advancedExercises: false,
      mobileSync: false,
    },
  },
  premium: {
    name: 'Premium',
    price: 9.99, // monthly
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
    features: [
      'Everything in Free',
      'AI-powered insights & recommendations',
      'Advanced analytics (unlimited history)',
      'Personalized exercise routines',
      'Unlimited workstations',
      'Mobile app sync',
      'Export data (PDF, CSV)',
      'Priority support',
      'Ad-free experience',
    ],
    limits: {
      workstations: 999,
      analyticsHistory: 999999,
      aiInsights: true,
      advancedExercises: true,
      mobileSync: true,
    },
  },
};

/**
 * Check if user has access to a premium feature
 */
export function hasFeatureAccess(
  subscriptionTier: string,
  feature: keyof typeof PRICING_PLANS.premium.limits
): boolean {
  if (subscriptionTier === 'premium') {
    return PRICING_PLANS.premium.limits[feature] as boolean;
  }

  // Free tier checks
  const freeLimit = PRICING_PLANS.free.limits[feature];
  if (typeof freeLimit === 'boolean') {
    return freeLimit;
  }

  return true; // For numeric limits, handle separately
}

/**
 * Get user's workstation limit
 */
export function getWorkstationLimit(subscriptionTier: string): number {
  return subscriptionTier === 'premium'
    ? PRICING_PLANS.premium.limits.workstations
    : PRICING_PLANS.free.limits.workstations;
}

/**
 * Get user's analytics history limit (in days)
 */
export function getAnalyticsHistoryLimit(subscriptionTier: string): number {
  return subscriptionTier === 'premium'
    ? PRICING_PLANS.premium.limits.analyticsHistory
    : PRICING_PLANS.free.limits.analyticsHistory;
}

/**
 * Get display name for subscription tier
 */
export function getTierDisplayName(tier: string): string {
  return tier === 'premium' ? 'Premium' : 'Free';
}

/**
 * Calculate trial end date (14 days from now)
 */
export function getTrialEndDate(): Date {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);
  return trialEnd;
}
