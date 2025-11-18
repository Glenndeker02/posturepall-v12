'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/logo';
import { useAuth } from '@/contexts/AuthContext';
import {
  Check,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Smartphone,
  Download,
  HeadphonesIcon
} from 'lucide-react';

const FEATURES = {
  free: [
    { icon: Check, text: 'Core posture monitoring' },
    { icon: Check, text: 'Basic analytics (7 days)' },
    { icon: Check, text: 'Standard break reminders' },
    { icon: Check, text: 'Up to 2 workstations' },
    { icon: Check, text: 'Community support' },
  ],
  premium: [
    { icon: Sparkles, text: 'Everything in Free', highlight: true },
    { icon: Zap, text: 'AI-powered insights & recommendations' },
    { icon: TrendingUp, text: 'Advanced analytics (unlimited history)' },
    { icon: Sparkles, text: 'Personalized exercise routines' },
    { icon: Shield, text: 'Unlimited workstations' },
    { icon: Smartphone, text: 'Mobile app sync' },
    { icon: Download, text: 'Export data (PDF, CSV)' },
    { icon: HeadphonesIcon, text: 'Priority support' },
    { icon: Check, text: 'Ad-free experience' },
  ],
};

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
          successUrl: `${window.location.origin}/dashboard`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/30">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              {user ? (
                <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => router.push('/auth')}>
                    Sign In
                  </Button>
                  <Button onClick={() => router.push('/auth')}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-5xl font-bold mb-4 dark:text-gray-100">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start free, upgrade when you need more. All plans include our core posture monitoring features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Free Plan */}
          <Card className="border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-2xl dark:text-gray-100">Free</CardTitle>
              <CardDescription className="dark:text-gray-400">Perfect to get started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold dark:text-gray-100">$0</span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {FEATURES.free.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <feature.icon className="w-5 h-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(user ? '/dashboard' : '/auth')}
              >
                {user ? 'Current Plan' : 'Get Started Free'}
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-indigo-500 dark:border-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 relative shadow-xl">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 px-4 py-1">
                ⚡ Most Popular
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl dark:text-gray-100">Premium</CardTitle>
              <CardDescription className="dark:text-gray-400">For serious posture improvement</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold dark:text-gray-100">$9.99</span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <Badge variant="secondary" className="mt-2 w-fit bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                14-day free trial
              </Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {FEATURES.premium.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <feature.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      feature.highlight
                        ? 'text-indigo-600 dark:text-indigo-500'
                        : 'text-green-600 dark:text-green-500'
                    }`} />
                    <span className={`${
                      feature.highlight
                        ? 'font-semibold text-indigo-900 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                onClick={handleUpgrade}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : user?.subscriptionTier === 'premium' ? 'Manage Subscription' : 'Start Free Trial'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 dark:text-gray-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg dark:text-gray-100">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg dark:text-gray-100">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg dark:text-gray-100">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes! Premium includes a 14-day free trial. No credit card required for the Free plan, but needed to start Premium trial.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg dark:text-gray-100">Can I switch plans later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Absolutely! You can upgrade or downgrade at any time. Changes take effect immediately, with prorated billing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 text-white max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">Ready to improve your posture?</CardTitle>
              <CardDescription className="text-indigo-100 text-lg">
                Join thousands of users who have transformed their workspace health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100"
                onClick={() => router.push(user ? '/dashboard' : '/auth')}
              >
                Get Started Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
