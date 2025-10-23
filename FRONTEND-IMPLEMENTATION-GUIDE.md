# 🎨 **FRONTEND SUBSCRIPTION UPGRADE/DOWNGRADE IMPLEMENTATION GUIDE**

## 📂 **Work in Frontend Repository**
```bash
cd C:\Users\panka\Webprojects\errorwise-frontend
```

## 🔧 **Step 1: Enhanced Subscription Service**

### **Update `src/services/subscription.ts`**
Add these new methods to your existing subscription service:

```typescript
// Add to existing subscription service
export const subscriptionService = {
  // Existing methods...
  getCurrentSubscription,
  getPlans,
  upgradeSubscription,
  // ... other existing methods

  // NEW METHODS FOR UPGRADE/DOWNGRADE:
  
  // Get upgrade/downgrade options based on current plan
  getUpgradeOptions: async () => {
    const response = await api.get('/subscriptions/upgrade-options');
    return response.data;
  },

  // Downgrade subscription with optional reason
  downgradeSubscription: async (data: { plan: string; reason?: string }) => {
    const response = await api.post('/subscriptions/downgrade', data);
    return response.data;
  },

  // Get subscription change history
  getSubscriptionHistory: async () => {
    const response = await api.get('/subscriptions/history');
    return response.data;
  },

  // Enhanced upgrade with better error handling
  upgradeSubscriptionEnhanced: async (data: { 
    plan: string; 
    payment_method_id?: string;
  }) => {
    const response = await api.post('/subscriptions/upgrade', data);
    return response.data;
  },

  // Get usage statistics with plan limits
  getUsageWithLimits: async () => {
    const response = await api.get('/subscriptions/usage');
    return response.data;
  }
};
```

## 🎯 **Step 2: Update TypeScript Interfaces**

### **Update `src/types/index.ts`**
Add these interfaces for the new API responses:

```typescript
// Add to existing types
export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  limits: {
    daily_queries: number;
    team_members: number;
    video_duration: number;
  };
  action?: 'upgrade' | 'downgrade';
  warning?: string;
  savings?: string;
  is_current?: boolean;
}

export interface UpgradeOptions {
  current_plan: Plan & { is_current: true };
  upgrade_options: Plan[];
  downgrade_options: Plan[];
  recommendations: {
    most_popular: string;
    best_value: string | null;
    for_teams: string | null;
  };
}

export interface SubscriptionHistory {
  current_subscription: {
    plan: string;
    status: string;
    start_date: string;
    end_date?: string;
  };
  history: Array<{
    date: string;
    action: string;
    plan: string;
    to_plan?: string;
    reason?: string;
  }>;
  total_changes: number;
}

export interface UsageWithLimits {
  usage: {
    today_queries: number;
    remaining_today: number | null;
    week_queries: number;
    month_queries: number;
  };
  subscription: {
    tier: string;
    plan: string;
  };
}
```

## 🎨 **Step 3: Create Subscription Manager Component**

### **Create `src/components/SubscriptionManager.tsx`**

```typescript
import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscription';
import { UpgradeOptions, Plan } from '../types';

const SubscriptionManager: React.FC = () => {
  const [options, setOptions] = useState<UpgradeOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showDowngradeReason, setShowDowngradeReason] = useState(false);
  const [downgradeReason, setDowngradeReason] = useState('');

  useEffect(() => {
    loadUpgradeOptions();
  }, []);

  const loadUpgradeOptions = async () => {
    try {
      const data = await subscriptionService.getUpgradeOptions();
      setOptions(data);
    } catch (error) {
      console.error('Failed to load upgrade options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (planId: string, action: 'upgrade' | 'downgrade') => {
    if (action === 'downgrade') {
      setSelectedPlan(planId);
      setShowDowngradeReason(true);
      return;
    }

    try {
      setProcessing(true);
      
      if (planId === 'free') {
        // Direct cancellation to free
        await subscriptionService.cancelSubscription();
      } else {
        // Paid plan upgrade
        await subscriptionService.upgradeSubscriptionEnhanced({ plan: planId });
      }
      
      await loadUpgradeOptions();
      alert(\`Successfully \${action}d to \${planId} plan!\`);
    } catch (error: any) {
      alert(\`Failed to \${action}: \${error.response?.data?.error || error.message}\`);
    } finally {
      setProcessing(false);
    }
  };

  const confirmDowngrade = async () => {
    try {
      setProcessing(true);
      
      await subscriptionService.downgradeSubscription({
        plan: selectedPlan,
        reason: downgradeReason
      });
      
      setShowDowngradeReason(false);
      setDowngradeReason('');
      setSelectedPlan('');
      await loadUpgradeOptions();
      alert(\`Successfully downgraded to \${selectedPlan} plan!\`);
    } catch (error: any) {
      alert(\`Failed to downgrade: \${error.response?.data?.error || error.message}\`);
    } finally {
      setProcessing(false);
    }
  };

  const renderPlanCard = (plan: Plan, isRecommended: boolean = false) => (
    <div 
      key={plan.id} 
      className={\`border rounded-lg p-6 \${
        plan.is_current ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      } \${isRecommended ? 'ring-2 ring-blue-500' : ''} relative\`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Recommended
          </span>
        </div>
      )}
      
      {plan.savings && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {plan.savings}
          </span>
        </div>
      )}

      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        <div className="mt-2">
          <span className="text-3xl font-extrabold text-gray-900">
            \${plan.price}
          </span>
          {plan.price > 0 && (
            <span className="text-gray-500">/{plan.interval}</span>
          )}
        </div>
        {plan.is_current && (
          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Current Plan
          </span>
        )}
      </div>

      <ul className="space-y-2 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className="flex-shrink-0 w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="ml-2 text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="text-sm text-gray-600 mb-4">
        <div><strong>Daily Queries:</strong> {plan.limits.daily_queries === -1 ? 'Unlimited' : plan.limits.daily_queries}</div>
        <div><strong>Team Members:</strong> {plan.limits.team_members === -1 ? 'Unlimited' : plan.limits.team_members}</div>
        <div><strong>Video Duration:</strong> {plan.limits.video_duration === 0 ? 'Not available' : \`\${plan.limits.video_duration} minutes\`}</div>
      </div>

      {!plan.is_current && (
        <div className="mt-4">
          <button
            onClick={() => handlePlanChange(plan.id, plan.action!)}
            disabled={processing}
            className={\`w-full px-4 py-2 rounded-md font-medium \${
              plan.action === 'upgrade'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed\`}
          >
            {processing ? 'Processing...' : \`\${plan.action === 'upgrade' ? 'Upgrade' : 'Downgrade'} to \${plan.name}\`}
          </button>
          {plan.warning && (
            <p className="text-red-600 text-sm mt-2">{plan.warning}</p>
          )}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!options) {
    return (
      <div className="text-center text-gray-600">
        Failed to load subscription options. Please try again later.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Manage Your Subscription</h1>
        <p className="mt-2 text-gray-600">Choose the perfect plan for your error analysis needs</p>
      </div>

      {/* Current Plan */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Current Plan</h2>
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {renderPlanCard(options.current_plan)}
          </div>
        </div>
      </div>

      {/* Upgrade Options */}
      {options.upgrade_options.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Upgrade Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {options.upgrade_options.map((plan) => 
              renderPlanCard(plan, plan.id === options.recommendations.most_popular)
            )}
          </div>
        </div>
      )}

      {/* Downgrade Options */}
      {options.downgrade_options.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Downgrade Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {options.downgrade_options.map((plan) => renderPlanCard(plan))}
          </div>
        </div>
      )}

      {/* Downgrade Reason Modal */}
      {showDowngradeReason && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Why are you downgrading?</h3>
            <p className="text-gray-600 mb-4">
              Help us improve by letting us know why you're downgrading to the {selectedPlan} plan.
            </p>
            <textarea
              value={downgradeReason}
              onChange={(e) => setDowngradeReason(e.target.value)}
              placeholder="Optional: Tell us your reason..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
              rows={3}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDowngradeReason(false);
                  setSelectedPlan('');
                  setDowngradeReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDowngrade}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm Downgrade'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Need Help Choosing?</h3>
        <div className="space-y-2 text-gray-600">
          {options.recommendations.best_value && (
            <p><strong>Best Value:</strong> {options.recommendations.best_value.toUpperCase()} plan</p>
          )}
          {options.recommendations.for_teams && (
            <p><strong>For Teams:</strong> {options.recommendations.for_teams.toUpperCase()} plan with unlimited collaboration</p>
          )}
          <p>Contact support if you need help deciding on the right plan for your needs.</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
```

## 🔗 **Step 4: Add Routing**

### **Update `src/App.tsx` or your router configuration**
Add a route for the subscription manager:

```typescript
import SubscriptionManager from './components/SubscriptionManager';

// Add to your routes
<Route path="/subscription/manage" element={<SubscriptionManager />} />
```

## 📊 **Step 5: Create Usage Dashboard Component**

### **Create `src/components/UsageDashboard.tsx`**

```typescript
import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscription';
import { UsageWithLimits } from '../types';

const UsageDashboard: React.FC = () => {
  const [usage, setUsage] = useState<UsageWithLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const data = await subscriptionService.getUsageWithLimits();
      setUsage(data);
    } catch (error) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading usage stats...</div>;
  if (!usage) return <div>Failed to load usage stats</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900">Today</h3>
          <p className="text-2xl font-bold text-blue-600">{usage.usage.today_queries}</p>
          {usage.usage.remaining_today !== null && (
            <p className="text-sm text-blue-700">{usage.usage.remaining_today} remaining</p>
          )}
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900">This Week</h3>
          <p className="text-2xl font-bold text-green-600">{usage.usage.week_queries}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-medium text-purple-900">This Month</h3>
          <p className="text-2xl font-bold text-purple-600">{usage.usage.month_queries}</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Current Plan: <span className="font-medium">{usage.subscription.tier}</span>
        </p>
      </div>
    </div>
  );
};

export default UsageDashboard;
```

## 🎯 **Step 6: Integration with Existing Components**

### **Update your Dashboard component**
Add links to subscription management:

```typescript
// In your dashboard component
import { Link } from 'react-router-dom';

// Add this button/link in your dashboard
<Link 
  to="/subscription/manage" 
  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
>
  Manage Subscription
</Link>
```

## 🧪 **Step 7: Testing**

### **Test the Integration:**
1. **Start Frontend Server:**
   ```bash
   cd C:\Users\panka\Webprojects\errorwise-frontend
   npm run dev
   ```

2. **Test Subscription Management:**
   - Navigate to `/subscription/manage`
   - View current plan and available options
   - Test upgrade/downgrade functionality

3. **Backend Connection:**
   - Ensure backend is running on `http://localhost:5000`
   - Check API calls in browser dev tools

## ✅ **Result**
You'll have a complete subscription management system that allows users to:
- View their current plan with features
- See upgrade and downgrade options
- Make plan changes with proper feedback
- Track their usage statistics
- Provide feedback when downgrading

The backend APIs are already ready at `http://localhost:5000/api/subscriptions/` to support all these frontend features!