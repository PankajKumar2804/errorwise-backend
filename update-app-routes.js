/**
 * Update App.tsx to add PricingPage route
 */

const fs = require('fs');
const path = require('path');

const APP_FILE = path.join(__dirname, '..', 'errorwise-frontend', 'src', 'App.tsx');

console.log('📝 Updating App.tsx...\n');

if (!fs.existsSync(APP_FILE)) {
  console.error('❌ App.tsx not found');
  process.exit(1);
}

let content = fs.readFileSync(APP_FILE, 'utf-8');

// Backup
const backupFile = APP_FILE + '.backup-' + Date.now();
fs.writeFileSync(backupFile, content);
console.log(`📦 Backed up to: ${path.basename(backupFile)}\n`);

// Add import for PricingPage
if (!content.includes('PricingPage')) {
  console.log('✅ Adding PricingPage import...');
  
  // Add to imports section
  const importMatch = content.match(/} from '\.\/pages';/);
  if (importMatch) {
    content = content.replace(
      /} from '\.\/pages';/,
      `} from './pages';\nimport { PricingPage } from './pages/PricingPage';`
    );
  }
}

// Add pricing route (before the catch-all route)
if (!content.includes('path="/pricing"')) {
  console.log('✅ Adding /pricing route...');
  
  const catchAllMatch = content.match(/\/\* Catch all - redirect to landing page \*\//);
  if (catchAllMatch) {
    const routeCode = `
          {/* Pricing Page */}
          <Route path="/pricing" element={<PricingPage />} />

          `;
    
    content = content.replace(
      /\/\* Catch all - redirect to landing page \*\//,
      routeCode + '/* Catch all - redirect to landing page */'
    );
  }
}

// Write updated file
fs.writeFileSync(APP_FILE, content);

console.log('\n✅ App.tsx updated successfully!');
console.log('\n📋 Changes made:');
console.log('  • Added PricingPage import');
console.log('  • Added /pricing route');
console.log('\n✨ You can now visit: http://localhost:5173/pricing\n');
