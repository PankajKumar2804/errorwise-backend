/**
 * Real-World Examples: Enhanced AI Service in Action
 * 
 * This file demonstrates how the enhanced AI service provides
 * accurate solutions across different knowledge domains
 */

const aiService = require('../src/services/aiService');

// Example 1: Algorithm/DSA Problem
async function example1_Algorithm() {
  console.log('\n📚 EXAMPLE 1: Algorithm Optimization\n');
  
  const result = await aiService.analyzeError({
    errorMessage: 'Function times out with large array',
    codeSnippet: `
function findDuplicate(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        return arr[i];
      }
    }
  }
  return null;
}`,
    language: 'javascript',
    subscriptionTier: 'pro'
  });
  
  console.log('🔍 Error Type:', result.errorType);
  console.log('📊 Category:', result.category);
  console.log('\n💡 Explanation:', result.explanation);
  console.log('\n✅ Solution:', result.solution);
  console.log('\n🎓 Domain Knowledge:', result.domainKnowledge);
  console.log('\n⚡ Complexity:', result.complexity);
}

// Example 2: Mathematical Problem
async function example2_Mathematics() {
  console.log('\n\n📐 EXAMPLE 2: Mathematical Precision Error\n');
  
  const result = await aiService.analyzeError({
    errorMessage: 'Assertion failed: expected 0.3 but got 0.30000000000000004',
    codeSnippet: `
function calculateTotal(prices) {
  let total = 0;
  prices.forEach(price => {
    total += price;
  });
  return total;
}

const result = calculateTotal([0.1, 0.2]);
console.assert(result === 0.3, 'Total should be 0.3'); // Fails!`,
    language: 'javascript',
    subscriptionTier: 'pro'
  });
  
  console.log('🔍 Error Type:', result.errorType);
  console.log('\n💡 Explanation:', result.explanation);
  console.log('\n✅ Solution:', result.solution);
  console.log('\n🎓 Domain Knowledge:', result.domainKnowledge);
}

// Example 3: Logic/Reasoning Problem
async function example3_Logic() {
  console.log('\n\n🧠 EXAMPLE 3: Logic Error in Conditional\n');
  
  const result = await aiService.analyzeError({
    errorMessage: 'Function approves ineligible users',
    codeSnippet: `
function canAccessPremiumFeature(user) {
  // BUG: Wrong logic - should be AND, not OR
  if (user.isPremium || user.age >= 18) {
    return true;
  }
  return false;
}

// Test cases failing:
// canAccessPremiumFeature({isPremium: false, age: 16}) → returns true (WRONG!)
// Should return false (not premium AND not 18+)`,
    language: 'javascript',
    subscriptionTier: 'pro'
  });
  
  console.log('🔍 Error Type:', result.errorType);
  console.log('\n💡 Explanation:', result.explanation);
  console.log('\n✅ Solution:', result.solution);
  console.log('\n🎓 Domain Knowledge:', result.domainKnowledge);
}

// Example 4: Quantitative Analysis
async function example4_Quantitative() {
  console.log('\n\n📊 EXAMPLE 4: Statistical Calculation Error\n');
  
  const result = await aiService.analyzeError({
    errorMessage: 'Standard deviation calculation returns NaN',
    codeSnippet: `
function calculateStandardDeviation(numbers) {
  const mean = numbers.reduce((a, b) => a + b) / numbers.length;
  const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0);
  return Math.sqrt(variance); // BUG: Should divide by n-1 or n
}

const data = [2, 4, 4, 4, 5, 5, 7, 9];
console.log(calculateStandardDeviation(data)); // Wrong result`,
    language: 'javascript',
    subscriptionTier: 'pro'
  });
  
  console.log('🔍 Error Type:', result.errorType);
  console.log('\n💡 Explanation:', result.explanation);
  console.log('\n✅ Solution:', result.solution);
  console.log('\n🎓 Domain Knowledge:', result.domainKnowledge);
}

// Example 5: Data Structure Problem
async function example5_DataStructure() {
  console.log('\n\n🗂️ EXAMPLE 5: Data Structure Choice Error\n');
  
  const result = await aiService.analyzeError({
    errorMessage: 'Slow performance when checking for duplicates',
    codeSnippet: `
function hasDuplicates(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        return true;
      }
    }
  }
  return false;
}

// Performance issue with large arrays (10000+ elements)`,
    language: 'javascript',
    subscriptionTier: 'pro'
  });
  
  console.log('🔍 Error Type:', result.errorType);
  console.log('\n💡 Explanation:', result.explanation);
  console.log('\n✅ Solution:', result.solution);
  console.log('\n🎓 Domain Knowledge:', result.domainKnowledge);
  console.log('\n⚡ Complexity:', result.complexity);
}

// Example 6: Recursion Error
async function example6_Recursion() {
  console.log('\n\n🔄 EXAMPLE 6: Recursion Stack Overflow\n');
  
  const result = await aiService.analyzeError({
    errorMessage: 'RangeError: Maximum call stack size exceeded',
    codeSnippet: `
function fibonacci(n) {
  return fibonacci(n - 1) + fibonacci(n - 2);
  // BUG: Missing base case!
}

console.log(fibonacci(10)); // Stack overflow`,
    language: 'javascript',
    subscriptionTier: 'pro'
  });
  
  console.log('🔍 Error Type:', result.errorType);
  console.log('\n💡 Explanation:', result.explanation);
  console.log('\n✅ Solution:', result.solution);
  console.log('\n🎓 Domain Knowledge:', result.domainKnowledge);
}

// Run all examples
async function runAllExamples() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║       Enhanced AI Service - Real World Examples          ║');
  console.log('║   Demonstrating Multi-Domain Expertise in Action         ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  try {
    await example1_Algorithm();
    await example2_Mathematics();
    await example3_Logic();
    await example4_Quantitative();
    await example5_DataStructure();
    await example6_Recursion();
    
    console.log('\n\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                                                          ║');
    console.log('║  ✅ All Examples Completed Successfully!                 ║');
    console.log('║                                                          ║');
    console.log('║  The AI service now provides expert-level analysis       ║');
    console.log('║  across all knowledge domains:                           ║');
    console.log('║                                                          ║');
    console.log('║  • Algorithms & DSA                                      ║');
    console.log('║  • Mathematics & Numerical Analysis                      ║');
    console.log('║  • Logic & Reasoning                                     ║');
    console.log('║  • Quantitative Analysis                                 ║');
    console.log('║  • Data Structures                                       ║');
    console.log('║  • General Programming                                   ║');
    console.log('║                                                          ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    
  } catch (error) {
    console.error('❌ Error running examples:', error.message);
  }
}

// Export for use in other files
module.exports = {
  runAllExamples,
  example1_Algorithm,
  example2_Mathematics,
  example3_Logic,
  example4_Quantitative,
  example5_DataStructure,
  example6_Recursion
};

// Run if executed directly
if (require.main === module) {
  runAllExamples();
}
