require('dotenv').config();

const stripeConfig = {
  // Stripe API Keys
  secretKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  
  // Webhook configuration
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  
  // API Version
  apiVersion: '2023-10-16',
  
  // Currency
  currency: 'usd',
  
  // Subscription plans configuration
  plans: {
    free: {
      id: 'free',
      name: 'Free Plan',
      price: 0,
      interval: 'month',
      features: {
        monthlyAnalyses: 10,
        teamMembers: 1,
        supportLevel: 'community',
        advancedFeatures: false,
        apiAccess: false
      }
    },
    
    pro: {
      id: process.env.STRIPE_PRO_PLAN_ID || 'price_pro_monthly',
      name: 'Pro Plan',
      price: 29,
      interval: 'month',
      stripeProductId: process.env.STRIPE_PRO_PRODUCT_ID,
      features: {
        monthlyAnalyses: 1000,
        teamMembers: 5,
        supportLevel: 'email',
        advancedFeatures: true,
        apiAccess: true,
        prioritySupport: false
      }
    },
    
    enterprise: {
      id: process.env.STRIPE_ENTERPRISE_PLAN_ID || 'price_enterprise_monthly',
      name: 'Enterprise Plan',
      price: 99,
      interval: 'month',
      stripeProductId: process.env.STRIPE_ENTERPRISE_PRODUCT_ID,
      features: {
        monthlyAnalyses: -1, // Unlimited
        teamMembers: -1, // Unlimited
        supportLevel: 'priority',
        advancedFeatures: true,
        apiAccess: true,
        prioritySupport: true,
        customIntegrations: true,
        onPremiseOption: true
      }
    }
  },
  
  // Yearly plans (if offered)
  yearlyPlans: {
    pro_yearly: {
      id: process.env.STRIPE_PRO_YEARLY_PLAN_ID || 'price_pro_yearly',
      name: 'Pro Plan (Yearly)',
      price: 290, // 2 months free
      interval: 'year',
      discount: 17 // percentage
    },
    
    enterprise_yearly: {
      id: process.env.STRIPE_ENTERPRISE_YEARLY_PLAN_ID || 'price_enterprise_yearly',
      name: 'Enterprise Plan (Yearly)',
      price: 990, // 2 months free
      interval: 'year',
      discount: 17 // percentage
    }
  },
  
  // Payment method types
  paymentMethods: ['card', 'sepa_debit', 'us_bank_account'],
  
  // Billing configuration
  billing: {
    // Grace period in days for failed payments
    gracePeriod: 7,
    
    // Number of retry attempts for failed payments
    maxRetries: 3,
    
    // Proration behavior
    prorationBehavior: 'create_prorations',
    
    // Collection method
    collectionMethod: 'charge_automatically'
  },
  
  // Tax configuration
  tax: {
    automaticTax: process.env.STRIPE_AUTOMATIC_TAX === 'true',
    taxBehavior: 'exclusive' // or 'inclusive'
  },
  
  // Customer portal configuration
  customerPortal: {
    enabled: true,
    features: {
      customer_update: {
        allowed_updates: ['email', 'tax_id', 'address'],
        enabled: true
      },
      invoice_history: {
        enabled: true
      },
      payment_method_update: {
        enabled: true
      },
      subscription_cancel: {
        enabled: true,
        mode: 'at_period_end',
        cancellation_reason: {
          enabled: true,
          options: [
            'too_expensive',
            'missing_features',
            'switched_service',
            'unused',
            'other'
          ]
        }
      },
      subscription_pause: {
        enabled: false
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['price', 'promotion_code'],
        proration_behavior: 'create_prorations'
      }
    }
  }
};

module.exports = stripeConfig;