# 🎨 Frontend Subscription System - Complete Implementation Code

## 📋 Overview

This document contains **production-ready code** for all 8 required frontend subscription components. Copy these files to your frontend repository at `C:\Users\panka\Getgingee\errorwise-frontend`.

---

## 📂 File Structure

```
errorwise-frontend/
├── src/
│   ├── services/
│   │   └── subscription.ts          ← API client for subscription
│   ├── pages/
│   │   ├── PricingPage.tsx          ← Pricing page with plan cards
│   │   └── Dashboard.tsx            ← Update with subscription section
│   ├── components/
│   │   ├── subscription/
│   │   │   ├── SubscriptionCard.tsx    ← Subscription status display
│   │   │   ├── UsageDisplay.tsx        ← Query usage tracker
│   │   │   ├── PlanCard.tsx            ← Individual plan card
│   │   │   ├── UpgradeModal.tsx        ← Upgrade prompt modal
│   │   │   └── FeatureLock.tsx         ← Lock icon for premium features
│   │   └── ...
│   └── ...
```

---

## 1️⃣ Subscription Service (`src/services/subscription.ts`)

```typescript
/**
 * Subscription API Client
 * Handles all subscription-related API calls
 */

import axios, { AxiosError } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Types
export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  trialDays: number;
  features: {
    dailyQueries: number;
    monthlyQueries?: number;
    errorExplanation: boolean;
    fixSuggestions: boolean;
    codeExamples: boolean;
    documentationLinks: boolean;
    errorHistory: string;
    teamFeatures: boolean;
    aiProvider: string;
    maxTokens: number;
    supportLevel: string;
    advancedAnalysis: boolean;
    priorityQueue: boolean;
    multiLanguageSupport?: boolean;
    exportHistory?: boolean;
    apiAccess?: boolean;
    customIntegrations?: boolean;
  };
  popular?: boolean;
  description?: string;
  dodo_plan_id?: string;
}

export interface Subscription {
  tier: 'free' | 'pro' | 'team';
  status: 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due';
  startDate: string;
  endDate: string;
  trialEndsAt?: string;
  isActive: boolean;
  isTrial: boolean;
}

export interface Usage {
  queriesUsed: number;
  queriesRemaining: number | 'unlimited';
  dailyLimit: number | 'unlimited';
  resetTime: string | null;
  planType: string;
  limitReached?: boolean;
}

export interface SubscriptionData {
  user: {
    id: string;
    email: string;
    username: string;
  };
  subscription: Subscription;
  plan: {
    name: string;
    price: number;
    interval: string;
    features: Plan['features'];
  };
  usage: Usage;
  canUpgrade: boolean;
  canDowngrade: boolean;
}

export interface CreateSubscriptionPayload {
  planId: 'pro' | 'team';
  successUrl: string;
  cancelUrl: string;
  skipPayment?: boolean; // For development only
}

export interface CreateSubscriptionResponse {
  message: string;
  sessionId: string;
  sessionUrl: string;
  plan: {
    id: string;
    name: string;
    price: number;
    interval: string;
    trialDays: number;
  };
}

export interface VerifyPaymentResponse {
  success: boolean;
  subscription: Subscription & {
    features: Plan['features'];
  };
}

class SubscriptionService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get all available subscription plans
   */
  async getPlans(): Promise<{ plans: Plan[] }> {
    try {
      const { data } = await axios.get(`${API_BASE}/api/subscriptions/plans`);
      return data;
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get current user's subscription details
   */
  async getSubscription(): Promise<SubscriptionData> {
    try {
      const { data } = await axios.get(`${API_BASE}/api/subscriptions`, {
        headers: this.getAuthHeaders()
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new subscription (upgrade)
   */
  async createSubscription(payload: CreateSubscriptionPayload): Promise<CreateSubscriptionResponse> {
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/subscriptions`,
        payload,
        { headers: this.getAuthHeaders() }
      );
      return data;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Cancel current subscription
   */
  async cancelSubscription(): Promise<{
    message: string;
    subscription: Subscription;
  }> {
    try {
      const { data } = await axios.delete(`${API_BASE}/api/subscriptions`, {
        headers: this.getAuthHeaders()
      });
      return data;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Verify payment after redirect from Dodo
   */
  async verifyPayment(sessionId: string): Promise<VerifyPaymentResponse> {
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/subscriptions/verify-payment`,
        { sessionId },
        { headers: this.getAuthHeaders() }
      );
      return data;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get usage statistics
   */
  async getUsage(): Promise<{
    tier: string;
    usage: Usage;
    features: Plan['features'];
  }> {
    try {
      const { data } = await axios.get(`${API_BASE}/api/subscriptions/usage`, {
        headers: this.getAuthHeaders()
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch usage:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Error handler
   */
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string; message: string }>;
      const message = axiosError.response?.data?.message || 
                     axiosError.response?.data?.error || 
                     axiosError.message;
      return new Error(message);
    }
    return error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
```

---

## 2️⃣ Pricing Page (`src/pages/PricingPage.tsx`)

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService, Plan } from '../services/subscription';
import { PlanCard } from '../components/subscription/PlanCard';
import { Loader2, AlertCircle, Check } from 'lucide-react';

export function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      setLoading(true);
      const response = await subscriptionService.getPlans();
      setPlans(response.plans);
      setError(null);
    } catch (err) {
      console.error('Failed to load plans:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade(planId: string) {
    if (planId === 'free') {
      navigate('/dashboard');
      return;
    }

    try {
      setUpgrading(planId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login?redirect=/pricing');
        return;
      }

      const { sessionUrl } = await subscriptionService.createSubscription({
        planId: planId as 'pro' | 'team',
        successUrl: `${window.location.origin}/dashboard?payment=success`,
        cancelUrl: `${window.location.origin}/pricing?payment=cancelled`
      });

      // Redirect to Dodo checkout
      window.location.href = sessionUrl;
    } catch (err) {
      console.error('Upgrade failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to start upgrade process');
      setUpgrading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Failed to load pricing</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={loadPlans}
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start analyzing errors for free, upgrade for unlimited queries and advanced features
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isPopular={plan.popular}
              isLoading={upgrading === plan.id}
              onSelect={() => handleUpgrade(plan.id)}
            />
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-20 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Feature Comparison
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Free
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Pro
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Team
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <FeatureRow
                  feature="Monthly Queries"
                  free="50"
                  pro="Unlimited"
                  team="Unlimited"
                />
                <FeatureRow
                  feature="Error Explanation"
                  free={true}
                  pro={true}
                  team={true}
                />
                <FeatureRow
                  feature="Fix Suggestions"
                  free={false}
                  pro={true}
                  team={true}
                />
                <FeatureRow
                  feature="Code Examples"
                  free={false}
                  pro={true}
                  team={true}
                />
                <FeatureRow
                  feature="Error History"
                  free="7 days"
                  pro="30 days"
                  team="Unlimited"
                />
                <FeatureRow
                  feature="AI Provider"
                  free="Gemini 2.0"
                  pro="GPT-3.5"
                  team="GPT-4"
                />
                <FeatureRow
                  feature="Team Features"
                  free={false}
                  pro={false}
                  team={true}
                />
                <FeatureRow
                  feature="Support Level"
                  free="Community"
                  pro="Email"
                  team="Priority"
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards through our secure payment processor Dodo Payments."
            />
            <FAQItem
              question="Do you offer refunds?"
              answer="Yes, we offer a 7-day money-back guarantee for all paid plans."
            />
            <FAQItem
              question="Can I upgrade or downgrade my plan?"
              answer="Yes, you can change your plan at any time. Upgrades are immediate, and downgrades take effect at the end of your billing period."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function FeatureRow({ 
  feature, 
  free, 
  pro, 
  team 
}: { 
  feature: string; 
  free: boolean | string; 
  pro: boolean | string; 
  team: boolean | string; 
}) {
  return (
    <tr>
      <td className="px-6 py-4 text-sm text-gray-900">{feature}</td>
      <td className="px-6 py-4 text-center">
        <FeatureCell value={free} />
      </td>
      <td className="px-6 py-4 text-center">
        <FeatureCell value={pro} />
      </td>
      <td className="px-6 py-4 text-center">
        <FeatureCell value={team} />
      </td>
    </tr>
  );
}

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-green-600 mx-auto" />
    ) : (
      <span className="text-gray-400">—</span>
    );
  }
  return <span className="text-sm text-gray-700">{value}</span>;
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}
```

---

## 3️⃣ Plan Card Component (`src/components/subscription/PlanCard.tsx`)

```typescript
import { Plan } from '../../services/subscription';
import { Check, Star, Loader2 } from 'lucide-react';

interface PlanCardProps {
  plan: Plan;
  isPopular?: boolean;
  isLoading?: boolean;
  onSelect: () => void;
}

export function PlanCard({ plan, isPopular, isLoading, onSelect }: PlanCardProps) {
  const isFree = plan.id === 'free';
  
  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
        isPopular ? 'ring-2 ring-blue-600 scale-105' : ''
      }`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg flex items-center gap-1">
          <Star className="w-4 h-4 fill-current" />
          Most Popular
        </div>
      )}

      <div className="p-8">
        {/* Plan Name */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        
        {/* Description */}
        {plan.description && (
          <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
        )}

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold text-gray-900">
              ${plan.price}
            </span>
            <span className="text-gray-600">/{plan.interval}</span>
          </div>
          {plan.trialDays > 0 && (
            <p className="text-sm text-blue-600 mt-2">
              {plan.trialDays}-day free trial
            </p>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={onSelect}
          disabled={isLoading}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            isFree
              ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              : isPopular
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : isFree ? (
            'Get Started'
          ) : (
            'Subscribe Now'
          )}
        </button>

        {/* Features List */}
        <div className="mt-8 space-y-4">
          <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
            What's Included:
          </h4>
          <ul className="space-y-3">
            {/* Queries */}
            <FeatureItem
              text={
                plan.features.dailyQueries === -1
                  ? 'Unlimited queries'
                  : `${plan.features.monthlyQueries || 0} queries/month`
              }
            />
            
            {/* Error Explanation */}
            {plan.features.errorExplanation && (
              <FeatureItem text="AI-powered error explanation" />
            )}
            
            {/* Fix Suggestions */}
            {plan.features.fixSuggestions && (
              <FeatureItem text="Fix suggestions" />
            )}
            
            {/* Code Examples */}
            {plan.features.codeExamples && (
              <FeatureItem text="Code examples" />
            )}
            
            {/* Advanced Analysis */}
            {plan.features.advancedAnalysis && (
              <FeatureItem text="Advanced analysis" />
            )}
            
            {/* Error History */}
            <FeatureItem text={`${plan.features.errorHistory} error history`} />
            
            {/* AI Provider */}
            <FeatureItem text={`${plan.features.aiProvider} AI`} />
            
            {/* Team Features */}
            {plan.features.teamFeatures && (
              <>
                <FeatureItem text="Team collaboration" />
                <FeatureItem text="Shared history" />
                <FeatureItem text="Team dashboard" />
              </>
            )}
            
            {/* Support */}
            <FeatureItem text={`${plan.features.supportLevel} support`} />
          </ul>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      <span className="text-gray-700 text-sm">{text}</span>
    </li>
  );
}
```

---

## 4️⃣ Subscription Card Component (`src/components/subscription/SubscriptionCard.tsx`)

```typescript
import { useState } from 'react';
import { SubscriptionData } from '../../services/subscription';
import { CreditCard, Calendar, AlertCircle, TrendingUp, X } from 'lucide-react';
import { UsageDisplay } from './UsageDisplay';

interface SubscriptionCardProps {
  subscription: SubscriptionData;
  onCancel: () => Promise<void>;
  onUpgrade: () => void;
}

export function SubscriptionCard({ subscription, onCancel, onUpgrade }: SubscriptionCardProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { subscription: sub, plan, usage, canUpgrade, canDowngrade } = subscription;

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    trial: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-red-100 text-red-800',
    past_due: 'bg-orange-100 text-orange-800'
  };

  const handleCancelClick = async () => {
    if (!showCancelConfirm) {
      setShowCancelConfirm(true);
      return;
    }

    try {
      setCancelling(true);
      await onCancel();
      setShowCancelConfirm(false);
    } catch (error) {
      console.error('Cancellation failed:', error);
      alert('Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{plan.name} Plan</h2>
            <p className="text-blue-100">
              {sub.isTrial ? `${plan.trialDays}-day trial` : 'Active subscription'}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              statusColors[sub.status]
            }`}
          >
            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Subscription Details */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Tier */}
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Current Tier</p>
              <p className="font-semibold text-gray-900">{sub.tier.toUpperCase()}</p>
              {plan.price > 0 && (
                <p className="text-sm text-gray-600">${plan.price}/{plan.interval}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">
                {sub.status === 'cancelled' ? 'Access Until' : 'Renewal Date'}
              </p>
              <p className="font-semibold text-gray-900">
                {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}
              </p>
              {sub.isTrial && sub.trialEndsAt && (
                <p className="text-sm text-blue-600">
                  Trial ends {new Date(sub.trialEndsAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Usage Display */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Query Usage</h3>
          <UsageDisplay usage={usage} />
        </div>

        {/* Cancelled Notice */}
        {sub.status === 'cancelled' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">Subscription Cancelled</p>
              <p className="text-sm text-yellow-800 mt-1">
                You will retain access until {new Date(sub.endDate).toLocaleDateString()}.
                After that, your account will be downgraded to the Free plan.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {/* Upgrade Button */}
          {canUpgrade && sub.status !== 'cancelled' && (
            <button
              onClick={onUpgrade}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Upgrade Plan
            </button>
          )}

          {/* Cancel Button */}
          {canDowngrade && sub.status === 'active' && (
            <button
              onClick={handleCancelClick}
              disabled={cancelling}
              className={`flex-1 ${
                showCancelConfirm
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                cancelling ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {cancelling ? (
                <>Processing...</>
              ) : showCancelConfirm ? (
                <>
                  <X className="w-5 h-5" />
                  Confirm Cancel
                </>
              ) : (
                'Cancel Subscription'
              )}
            </button>
          )}

          {showCancelConfirm && !cancelling && (
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="px-4 py-3 text-gray-600 hover:text-gray-800"
            >
              Nevermind
            </button>
          )}
        </div>

        {showCancelConfirm && (
          <p className="text-sm text-gray-600 text-center">
            Are you sure? You'll retain access until the end of your billing period.
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## 5️⃣ Usage Display Component (`src/components/subscription/UsageDisplay.tsx`)

```typescript
import { Usage } from '../../services/subscription';
import { TrendingUp, Infinity } from 'lucide-react';

interface UsageDisplayProps {
  usage: Usage;
}

export function UsageDisplay({ usage }: UsageDisplayProps) {
  const isUnlimited = usage.queriesRemaining === 'unlimited';

  if (isUnlimited) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center gap-3">
          <Infinity className="w-6 h-6 text-blue-600" />
          <div>
            <p className="font-semibold text-gray-900">Unlimited Queries</p>
            <p className="text-sm text-gray-600">No limits on your error analysis</p>
          </div>
        </div>
      </div>
    );
  }

  const queriesUsed = usage.queriesUsed;
  const queriesLimit = typeof usage.dailyLimit === 'number' 
    ? usage.dailyLimit 
    : typeof usage.queriesRemaining === 'number'
    ? queriesUsed + usage.queriesRemaining
    : queriesUsed;
  
  const percentage = queriesLimit > 0 ? (queriesUsed / queriesLimit) * 100 : 0;
  const remaining = typeof usage.queriesRemaining === 'number' ? usage.queriesRemaining : 0;

  const getBarColor = () => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 70) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const getTextColor = () => {
    if (percentage >= 90) return 'text-red-700';
    if (percentage >= 70) return 'text-yellow-700';
    return 'text-green-700';
  };

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm font-medium text-gray-700">
            {queriesUsed} / {queriesLimit} queries used
          </span>
          <span className={`text-sm font-semibold ${getTextColor()}`}>
            {remaining} remaining
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Reset Time */}
      {usage.resetTime && (
        <p className="text-xs text-gray-600">
          Resets on {new Date(usage.resetTime).toLocaleDateString()} at{' '}
          {new Date(usage.resetTime).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      )}

      {/* Limit Reached Warning */}
      {usage.limitReached && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <TrendingUp className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">Monthly limit reached</p>
            <p className="text-xs text-red-700 mt-1">
              Upgrade to Pro for unlimited queries
            </p>
            <a 
              href="/pricing"
              className="inline-block mt-2 text-xs text-red-600 hover:text-red-700 underline font-semibold"
            >
              View Plans →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 6️⃣ Upgrade Modal Component (`src/components/subscription/UpgradeModal.tsx`)

```typescript
import { X, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  requiredTier?: 'pro' | 'team';
  feature?: string;
}

export function UpgradeModal({ 
  isOpen, 
  onClose, 
  reason, 
  requiredTier = 'pro',
  feature 
}: UpgradeModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Upgrade Required</h2>
            </div>
            <p className="text-blue-100">
              {feature || 'This feature'} is only available in the{' '}
              <span className="font-semibold">{requiredTier.toUpperCase()}</span> plan
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {reason && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">{reason}</p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">
                Unlock with {requiredTier === 'pro' ? 'Pro' : 'Team'} Plan:
              </h3>
              <ul className="space-y-2">
                {requiredTier === 'pro' ? (
                  <>
                    <BenefitItem text="Unlimited error queries" />
                    <BenefitItem text="AI-powered fix suggestions" />
                    <BenefitItem text="Code examples & best practices" />
                    <BenefitItem text="GPT-3.5 Turbo AI model" />
                    <BenefitItem text="30-day error history" />
                    <BenefitItem text="Priority email support" />
                  </>
                ) : (
                  <>
                    <BenefitItem text="Everything in Pro, plus..." />
                    <BenefitItem text="Team collaboration features" />
                    <BenefitItem text="Shared error history" />
                    <BenefitItem text="Team dashboard" />
                    <BenefitItem text="GPT-4 AI model" />
                    <BenefitItem text="Priority support" />
                  </>
                )}
              </ul>
            </div>

            <div className="pt-4">
              <button
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                View Pricing Plans
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="w-full mt-3 text-gray-600 hover:text-gray-800 py-2 text-sm"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Zap className="w-3 h-3 text-green-600" />
      </div>
      <span className="text-sm text-gray-700">{text}</span>
    </li>
  );
}
```

---

## 7️⃣ Feature Lock Component (`src/components/subscription/FeatureLock.tsx`)

```typescript
import { Lock } from 'lucide-react';
import { useState } from 'react';
import { UpgradeModal } from './UpgradeModal';

interface FeatureLockProps {
  feature: string;
  requiredTier: 'pro' | 'team';
  children?: React.ReactNode;
  className?: string;
}

export function FeatureLock({ 
  feature, 
  requiredTier, 
  children,
  className = '' 
}: FeatureLockProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div 
        className={`relative ${className}`}
        onClick={() => setShowModal(true)}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center cursor-pointer hover:bg-gray-900/60 transition-colors">
          <div className="bg-white rounded-lg p-4 shadow-lg text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">{feature}</p>
            <p className="text-sm text-gray-600 mb-3">
              Requires {requiredTier.toUpperCase()} plan
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              Unlock Now →
            </button>
          </div>
        </div>

        {/* Content (blurred) */}
        <div className="pointer-events-none opacity-50">
          {children}
        </div>
      </div>

      <UpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        feature={feature}
        requiredTier={requiredTier}
      />
    </>
  );
}

// Usage example:
// <FeatureLock feature="Fix Suggestions" requiredTier="pro">
//   <FixSuggestionsPanel />
// </FeatureLock>
```

---

## 8️⃣ Dashboard Updates (`src/pages/Dashboard.tsx`)

Add this section to your existing Dashboard component:

```typescript
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { subscriptionService, SubscriptionData } from '../services/subscription';
import { SubscriptionCard } from '../components/subscription/SubscriptionCard';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function Dashboard() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadSubscription();
    handlePaymentRedirect();
  }, []);

  async function loadSubscription() {
    try {
      setLoading(true);
      const data = await subscriptionService.getSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePaymentRedirect() {
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    if (!payment) return;

    // Remove query params from URL
    setSearchParams({});

    if (payment === 'success' && sessionId) {
      setVerifying(true);
      try {
        const result = await subscriptionService.verifyPayment(sessionId);
        if (result.success) {
          setPaymentStatus('success');
          await loadSubscription();
          
          // Hide success message after 5 seconds
          setTimeout(() => setPaymentStatus(null), 5000);
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        setPaymentStatus('failed');
      } finally {
        setVerifying(false);
      }
    } else if (payment === 'cancelled') {
      setPaymentStatus('failed');
      setTimeout(() => setPaymentStatus(null), 5000);
    }
  }

  async function handleCancelSubscription() {
    try {
      await subscriptionService.cancelSubscription();
      await loadSubscription();
    } catch (error) {
      console.error('Cancellation failed:', error);
      throw error;
    }
  }

  function handleUpgrade() {
    navigate('/pricing');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Payment Status Toast */}
        {verifying && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-blue-900">Verifying your payment...</p>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Subscription Activated!</p>
              <p className="text-sm text-green-700">
                Your subscription has been successfully activated. Enjoy your new features!
              </p>
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">Payment Cancelled</p>
              <p className="text-sm text-red-700">
                Your payment was cancelled. You can try again from the pricing page.
              </p>
            </div>
          </div>
        )}

        {/* Subscription Card */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : subscription ? (
          <div className="mb-8">
            <SubscriptionCard
              subscription={subscription}
              onCancel={handleCancelSubscription}
              onUpgrade={handleUpgrade}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-gray-600">Failed to load subscription data</p>
            <button 
              onClick={loadSubscription}
              className="mt-4 text-blue-600 hover:text-blue-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Rest of your dashboard content */}
        {/* ... */}
      </div>
    </div>
  );
}
```

---

## 🎨 CSS Additions (Optional)

Add to your `globals.css` or `index.css`:

```css
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
```

---

## 🚀 Usage Instructions

### 1. Copy Files to Frontend

```bash
cd C:\Users\panka\Getgingee\errorwise-frontend

# Create directories
mkdir -p src/services
mkdir -p src/components/subscription

# Copy the files from this document
# - subscription.ts → src/services/
# - PricingPage.tsx → src/pages/
# - PlanCard.tsx → src/components/subscription/
# - SubscriptionCard.tsx → src/components/subscription/
# - UsageDisplay.tsx → src/components/subscription/
# - UpgradeModal.tsx → src/components/subscription/
# - FeatureLock.tsx → src/components/subscription/
# - Update Dashboard.tsx with the new code
```

### 2. Add Routes

Update your `src/App.tsx` or routing file:

```typescript
import { PricingPage } from './pages/PricingPage';

// In your routes:
<Route path="/pricing" element={<PricingPage />} />
```

### 3. Install Dependencies (if needed)

```bash
npm install lucide-react  # For icons (if not already installed)
```

### 4. Environment Variables

Ensure `.env` has:
```
VITE_API_URL=http://localhost:5000
```

### 5. Test the Flow

1. **View Pricing**: Navigate to `/pricing`
2. **Subscribe**: Click "Subscribe Now" on Pro or Team
3. **Payment**: Complete payment on Dodo checkout
4. **Redirect**: Return to dashboard with success message
5. **View Subscription**: See active subscription card
6. **Cancel**: Test cancellation flow

---

## 🎯 Integration with Existing Components

### Show Upgrade Prompt on Limit Error

```typescript
// In your error analysis component
import { UpgradeModal } from '../components/subscription/UpgradeModal';

try {
  const analysis = await analyzeError(errorText);
  // ...
} catch (error) {
  if (error.response?.status === 429) {
    // Show upgrade modal
    setShowUpgradeModal(true);
  }
}
```

### Lock Premium Features

```typescript
// In your features component
import { FeatureLock } from '../components/subscription/FeatureLock';

{user.subscriptionTier === 'free' ? (
  <FeatureLock feature="Fix Suggestions" requiredTier="pro">
    <FixSuggestionsPanel />
  </FeatureLock>
) : (
  <FixSuggestionsPanel />
)}
```

---

## ✅ Checklist

- [ ] Copy all 8 component files to frontend
- [ ] Update Dashboard.tsx with subscription section
- [ ] Add `/pricing` route to router
- [ ] Test pricing page loads plans
- [ ] Test upgrade flow (dev mode with skipPayment)
- [ ] Test payment verification on redirect
- [ ] Test cancellation flow
- [ ] Test usage display updates
- [ ] Test upgrade modal appears on limit errors
- [ ] Test feature locks for free users

---

**All code is production-ready! Copy and customize as needed.** 🚀
