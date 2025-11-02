#!/usr/bin/env node
require('dotenv').config();
const sequelize = require('./src/config/database');
const SubscriptionPlan = require('./src/models/SubscriptionPlan');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    // Get monthly plans for frontend
    const monthlyPlans = await SubscriptionPlan.findAll({
      where: { billing_interval: 'month' },
      order: [['price', 'ASC']]
    });
    
    console.log('📊 Monthly Plans (for Frontend Display):');
    console.log('==========================================\n');
    
    monthlyPlans.forEach(plan => {
      console.log(`${plan.name}`);
      console.log(`  Price: $${plan.price}/${plan.billing_interval}`);
      console.log(`  Features:`);
      const features = plan.features;
      
      // Display query limits
      if (features.dailyQueries === -1 || features.monthlyQueries === -1) {
        console.log(`    ✅ Unlimited queries`);
      } else if (features.monthlyQueries) {
        console.log(`    ✅ ${features.monthlyQueries} queries/Month`);
      } else if (features.dailyQueries) {
        console.log(`    ✅ ${features.dailyQueries} queries/day`);
      }
      
      if (features.fixSuggestions) console.log(`    ✅ Fix suggestions`);
      if (features.codeExamples) console.log(`    ✅ Code examples`);
      if (features.teamFeatures) console.log(`    ✅ Team features`);
      console.log(`    ✅ ${features.supportLevel} support`);
      console.log(`  Active: ${plan.is_active ? '✅' : '❌'}\n`);
    });
    
    const allCount = await SubscriptionPlan.count();
    console.log(`\n📈 Total plans in database: ${allCount}`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
