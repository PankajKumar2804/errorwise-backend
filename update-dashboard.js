/**
 * Update DashboardPage.tsx to add subscription functionality
 */

const fs = require('fs');
const path = require('path');

const DASHBOARD_FILE = path.join(__dirname, '..', 'errorwise-frontend', 'src', 'pages', 'DashboardPage.tsx');

console.log('📝 Updating DashboardPage.tsx...\n');

if (!fs.existsSync(DASHBOARD_FILE)) {
  console.error('❌ DashboardPage.tsx not found');
  process.exit(1);
}

let content = fs.readFileSync(DASHBOARD_FILE, 'utf-8');

// Backup
const backupFile = DASHBOARD_FILE + '.backup-' + Date.now();
fs.writeFileSync(backupFile, content);
console.log(`📦 Backed up to: ${path.basename(backupFile)}\n`);

let updated = false;

// Add imports for subscription components
if (!content.includes('subscriptionService')) {
  console.log('✅ Adding subscription imports...');
  
  // Add after existing imports
  const importSection = `import { subscriptionService, SubscriptionData } from '../services/subscription';
import { SubscriptionCard } from '../components/subscription/SubscriptionCard';
`;
  
  // Find the line after last import
  const lastImportIndex = content.lastIndexOf("from 'react-hot-toast';");
  if (lastImportIndex !== -1) {
    const endOfLine = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLine + 1) + '\n' + importSection + content.slice(endOfLine + 1);
    updated = true;
  }
}

// Add subscription state
if (!content.includes('subscription, setSubscription')) {
  console.log('✅ Adding subscription state...');
  
  // Find after the first useState
  const firstUseState = content.indexOf('const [');
  if (firstUseState !== -1) {
    const endOfLine = content.indexOf('\n', firstUseState);
    const stateCode = `\n  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);`;
    
    content = content.slice(0, endOfLine) + stateCode + content.slice(endOfLine);
    updated = true;
  }
}

// Add loadSubscription function
if (!content.includes('async function loadSubscription')) {
  console.log('✅ Adding loadSubscription function...');
  
  const functionCode = `
  // Load subscription data
  async function loadSubscription() {
    try {
      setSubscriptionLoading(true);
      const data = await subscriptionService.getSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  }

  // Handle payment verification
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const sessionId = params.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      verifyPayment(sessionId);
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled');
    }

    // Clean up URL
    if (paymentStatus) {
      window.history.replaceState({}, '', '/dashboard');
    }

    // Load subscription on mount
    loadSubscription();
  }, []);

  async function verifyPayment(sessionId: string) {
    try {
      toast.loading('Verifying payment...');
      await subscriptionService.verifyPayment(sessionId);
      toast.dismiss();
      toast.success('Subscription activated! 🎉');
      await loadSubscription();
    } catch (error) {
      toast.dismiss();
      toast.error('Payment verification failed');
      console.error('Payment verification error:', error);
    }
  }

  async function handleCancelSubscription() {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      await subscriptionService.cancelSubscription();
      toast.success('Subscription cancelled');
      await loadSubscription();
    } catch (error) {
      toast.error('Failed to cancel subscription');
      console.error('Cancel subscription error:', error);
    }
  }

  async function handleUpgrade() {
    navigate('/pricing');
  }
`;

  // Find a good place to insert (after the component declaration)
  const componentMatch = content.match(/const DashboardPage.*?= \(\) => \{/);
  if (componentMatch) {
    const insertIndex = componentMatch.index + componentMatch[0].length;
    content = content.slice(0, insertIndex) + functionCode + content.slice(insertIndex);
    updated = true;
  }
}

// Add subscription card to the JSX (before the main content area)
if (!content.includes('<SubscriptionCard')) {
  console.log('✅ Adding SubscriptionCard to JSX...');
  
  // Find the main content area (after <Navigation />)
  const navMatch = content.indexOf('<Navigation');
  if (navMatch !== -1) {
    // Find the end of Navigation component
    const navEnd = content.indexOf('/>', navMatch) + 2;
    
    const subscriptionCardJSX = `

      {/* Subscription Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!subscriptionLoading && subscription && (
          <SubscriptionCard
            subscription={subscription}
            onCancel={handleCancelSubscription}
            onUpgrade={handleUpgrade}
          />
        )}
      </div>
`;
    
    content = content.slice(0, navEnd) + subscriptionCardJSX + content.slice(navEnd);
    updated = true;
  }
}

if (updated) {
  // Write updated file
  fs.writeFileSync(DASHBOARD_FILE, content);
  
  console.log('\n✅ DashboardPage.tsx updated successfully!');
  console.log('\n📋 Changes made:');
  console.log('  • Added subscription imports');
  console.log('  • Added subscription state management');
  console.log('  • Added payment verification logic');
  console.log('  • Added SubscriptionCard component');
  console.log('  • Added cancel and upgrade handlers');
  console.log('\n✨ Dashboard now shows subscription status!\n');
} else {
  console.log('\n⚠️  No updates needed - components already added!\n');
}
