// src/services/errorCategorizationService.js
const ERROR_PATTERNS = {
  'Excel': [
    /#ref!/i, /#value!/i, /#name?/i, /#div\/0!/i, /#n\/a/i, /#num!/i,
    /circular reference/i, /formula parse error/i, /excel/i
  ],
  'SQL': [
    /syntax error/i, /table.*doesn't exist/i, /column.*not found/i,
    /duplicate entry/i, /foreign key constraint/i, /mysql/i, /postgresql/i,
    /sqlite/i, /oracle/i, /sql server/i, /select.*from/i
  ],
  'Python': [
    /traceback/i, /syntaxerror/i, /nameerror/i, /typeerror/i, /indexerror/i,
    /keyerror/i, /attributeerror/i, /valueerror/i, /importerror/i, /modulenotfounderror/i,
    /indentationerror/i, /python/i, /\.py/i
  ],
  'JavaScript': [
    /referenceerror/i, /typeerror/i, /syntaxerror/i, /rangeerror/i,
    /cannot read property/i, /undefined is not a function/i, /unexpected token/i,
    /javascript/i, /\.js/i, /node\.js/i, /npm/i
  ],
  'Windows': [
    /windows/i, /system error/i, /blue screen/i, /bsod/i, /registry/i,
    /dll/i, /event id/i, /windows update/i, /access denied/i, /path not found/i
  ],
  'Java': [
    /java/i, /exception in thread/i, /nullpointerexception/i, /classnotfoundexception/i,
    /nosuchmethoderror/i, /outofmemoryerror/i, /stackoverflowerror/i, /\.java/i
  ],
  'Network': [
    /connection refused/i, /timeout/i, /dns/i, /ssl/i, /certificate/i,
    /proxy/i, /firewall/i, /port/i, /socket/i, /http/i, /https/i, /404/i, /500/i
  ],
  'Database': [
    /database/i, /connection string/i, /authentication failed/i, /deadlock/i,
    /transaction/i, /commit/i, /rollback/i, /index/i, /primary key/i
  ]
};

/**
 * Categorizes an error message based on common patterns
 * @param {string} errorMessage - The error message to categorize
 * @returns {string} - The detected category or 'General' if no match
 */
function categorizeError(errorMessage) {
  const lowerError = errorMessage.toLowerCase();
  
  for (const [category, patterns] of Object.entries(ERROR_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerError)) {
        return category;
      }
    }
  }
  
  return 'General';
}

/**
 * Gets category-specific enhancement for the AI prompt
 * @param {string} category - The error category
 * @returns {string} - Additional context for the AI prompt
 */
function getCategoryContext(category) {
  const contexts = {
    'Excel': 'This is an Excel/spreadsheet error. Focus on formula syntax, cell references, and common Excel troubleshooting.',
    'SQL': 'This is a database/SQL error. Focus on query syntax, table structures, and database connection issues.',
    'Python': 'This is a Python programming error. Focus on syntax, imports, and common Python debugging techniques.',
    'JavaScript': 'This is a JavaScript error. Focus on syntax, DOM manipulation, and common JS debugging.',
    'Windows': 'This is a Windows system error. Focus on system troubleshooting, permissions, and Windows-specific solutions.',
    'Java': 'This is a Java programming error. Focus on exceptions, classpath issues, and Java-specific debugging.',
    'Network': 'This is a network/connectivity error. Focus on connection issues, firewall settings, and network troubleshooting.',
    'Database': 'This is a database error. Focus on connection strings, queries, and database administration.'
  };
  
  return contexts[category] || 'Provide general software troubleshooting guidance.';
}

module.exports = {
  categorizeError,
  getCategoryContext,
  ERROR_PATTERNS
};