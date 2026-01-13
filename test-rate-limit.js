/**
 * Rate Limiting Test Script
 *
 * This script tests the rate limiting implementation by making multiple
 * requests to your API endpoints and verifying rate limits are enforced.
 *
 * Usage:
 *   node test-rate-limit.js
 *
 * Requirements:
 *   npm install axios
 */

import axios from 'axios';

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5173';
const TEST_ENDPOINTS = {
  ai: '/api/explain',
  payment: '/api/create-checkout-session',
  email: '/api/send-email',
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test helper to make API requests
async function makeRequest(endpoint, data = {}, headers = {}) {
  try {
    const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      validateStatus: () => true, // Don't throw on any status
    });

    return {
      status: response.status,
      data: response.data,
      headers: response.headers,
    };
  } catch (error) {
    return {
      status: 500,
      error: error.message,
    };
  }
}

// Extract rate limit info from response headers
function getRateLimitInfo(headers) {
  return {
    limit: headers['x-ratelimit-limit'],
    remaining: headers['x-ratelimit-remaining'],
    reset: headers['x-ratelimit-reset']
      ? new Date(parseInt(headers['x-ratelimit-reset']))
      : null,
  };
}

// Test AI endpoint rate limiting
async function testAIEndpoint() {
  log('\n📊 Testing AI Endpoint Rate Limiting...', 'blue');
  log('Expected: 5 requests/hour for anonymous users\n', 'yellow');

  const testData = {
    rebalancingData: {
      totalValue: 10000,
      positions: [
        {
          ticker: 'VTI',
          currentPercent: 60,
          targetPercent: 50,
          action: 'Sell',
          difference: 1000,
        },
      ],
    },
  };

  for (let i = 1; i <= 7; i++) {
    const result = await makeRequest(TEST_ENDPOINTS.ai, testData);
    const rateLimit = getRateLimitInfo(result.headers);

    if (result.status === 200) {
      log(
        `  ✅ Request ${i}: SUCCESS (${rateLimit.remaining}/${rateLimit.limit} remaining)`,
        'green'
      );
    } else if (result.status === 429) {
      log(`  ⛔ Request ${i}: RATE LIMITED (as expected)`, 'red');
      log(`     Message: ${result.data.message}`, 'yellow');
      log(`     Retry After: ${result.data.retryAfter} seconds`, 'yellow');
      break;
    } else {
      log(`  ❌ Request ${i}: Error ${result.status}`, 'red');
      if (result.data?.error) {
        log(`     Error: ${result.data.error}`, 'yellow');
      }
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

// Test payment endpoint rate limiting
async function testPaymentEndpoint() {
  log('\n💳 Testing Payment Endpoint Rate Limiting...', 'blue');
  log('Expected: 10 requests/hour per IP\n', 'yellow');

  const testData = {
    userId: 'test-user-id',
    email: 'test@example.com',
  };

  for (let i = 1; i <= 12; i++) {
    const result = await makeRequest(TEST_ENDPOINTS.payment, testData);
    const rateLimit = getRateLimitInfo(result.headers);

    if (result.status === 200 || result.status === 400) {
      // 400 is ok (missing Stripe config), we just care about rate limiting
      log(
        `  ✅ Request ${i}: ALLOWED (${rateLimit.remaining}/${rateLimit.limit} remaining)`,
        'green'
      );
    } else if (result.status === 429) {
      log(`  ⛔ Request ${i}: RATE LIMITED (as expected)`, 'red');
      log(`     Message: ${result.data.message}`, 'yellow');
      break;
    } else {
      log(`  ❌ Request ${i}: Error ${result.status}`, 'red');
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

// Test rate limit headers presence
async function testRateLimitHeaders() {
  log('\n🔍 Testing Rate Limit Headers...', 'blue');

  const result = await makeRequest(TEST_ENDPOINTS.ai, {
    rebalancingData: {
      totalValue: 10000,
      positions: [],
    },
  });

  const headers = result.headers;

  log('Expected headers:', 'yellow');
  log(`  X-RateLimit-Limit: ${headers['x-ratelimit-limit'] || 'MISSING'}`,
    headers['x-ratelimit-limit'] ? 'green' : 'red'
  );
  log(`  X-RateLimit-Remaining: ${headers['x-ratelimit-remaining'] || 'MISSING'}`,
    headers['x-ratelimit-remaining'] ? 'green' : 'red'
  );
  log(`  X-RateLimit-Reset: ${headers['x-ratelimit-reset'] || 'MISSING'}`,
    headers['x-ratelimit-reset'] ? 'green' : 'red'
  );

  if (
    headers['x-ratelimit-limit'] &&
    headers['x-ratelimit-remaining'] &&
    headers['x-ratelimit-reset']
  ) {
    log('\n✅ All rate limit headers present!', 'green');
    return true;
  } else {
    log('\n⚠️  Some rate limit headers missing. Is Redis configured?', 'yellow');
    return false;
  }
}

// Main test runner
async function runTests() {
  log('\n╔════════════════════════════════════════════╗', 'blue');
  log('║   Rate Limiting Test Suite                ║', 'blue');
  log('╚════════════════════════════════════════════╝', 'blue');
  log(`\nTesting against: ${BASE_URL}`, 'yellow');

  try {
    // Test 1: Check headers
    await testRateLimitHeaders();

    // Test 2: AI endpoint (strictest limits)
    await testAIEndpoint();

    // Test 3: Payment endpoint
    await testPaymentEndpoint();

    log('\n✅ Tests completed!', 'green');
    log('\n💡 Note: Rate limits are per IP/user and persist across test runs.', 'yellow');
    log('   If tests fail immediately, you may have hit the rate limit.', 'yellow');
    log('   Wait 1 hour or use a different IP/user to test again.', 'yellow');
  } catch (error) {
    log(`\n❌ Test error: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run tests
runTests().catch(console.error);
