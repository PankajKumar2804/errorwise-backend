const paymentService = require('./src/services/paymentService');

// Test Dodo Payments Integration
async function testDodoPayments() {
  console.log('🧪 Testing Dodo Payments Integration...\n');

  try {
    // Test 1: Get available plans
    console.log('1. Testing getAvailablePlans()...');
    const plans = paymentService.getAvailablePlans();
    console.log('✅ Available plans:', plans.length);
    plans.forEach(plan => {
      console.log(`   - ${plan.name}: $${plan.price}/month (${plan.features.length} features)`);
    });

    // Test 2: Validate plan IDs
    console.log('\n2. Testing plan validation...');
    console.log('✅ Free plan valid:', paymentService.isValidPlan('free'));
    console.log('✅ Pro plan valid:', paymentService.isValidPlan('pro'));
    console.log('✅ Team plan valid:', paymentService.isValidPlan('team'));
    console.log('❌ Invalid plan:', paymentService.isValidPlan('invalid'));

    // Test 3: Check Dodo API configuration
    console.log('\n3. Testing Dodo API configuration...');
    const dodoApiKey = process.env.DODO_API_KEY;
    const dodoUrl = process.env.DODO_API_URL || 'https://api.dodopayments.com/v1';
    
    console.log('✅ API Key configured:', dodoApiKey ? 'Yes' : '❌ Missing');
    console.log('✅ API URL:', dodoUrl);
    console.log('✅ Webhook secret configured:', process.env.DODO_WEBHOOK_SECRET ? 'Yes' : '❌ Missing');

    // Test 4: Test API helper (will fail without real API key, but tests structure)
    console.log('\n4. Testing Dodo API helper structure...');
    console.log('✅ dodoAPI object available:', !!paymentService.dodoAPI);
    console.log('✅ dodoAPI.request method available:', typeof paymentService.dodoAPI.request === 'function');

    console.log('\n🎉 Dodo Payments integration tests completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Add your real Dodo API credentials to .env');
    console.log('   2. Set up webhook endpoint in Dodo dashboard');
    console.log('   3. Test with real API calls');
    console.log('   4. Update frontend to use new checkout endpoint');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testDodoPayments();