#!/usr/bin/env node

/**
 * Test script for /api/explain endpoint
 *
 * Usage:
 *   node test-explain-api.js [url]
 *
 * Examples:
 *   node test-explain-api.js                           # Test localhost:5173
 *   node test-explain-api.js http://localhost:3001     # Test local server
 *   node test-explain-api.js https://your-domain.com   # Test production
 */

const testPayload = {
  rebalancingData: {
    totalValue: 50000,
    positions: [
      {
        ticker: 'VTI',
        currentPercent: 60,
        targetPercent: 60,
        action: 'HOLD',
        difference: 0,
        currentAmount: 30000,
        targetAmount: 30000
      },
      {
        ticker: 'BND',
        currentPercent: 30,
        targetPercent: 30,
        action: 'HOLD',
        difference: 0,
        currentAmount: 15000,
        targetAmount: 15000
      },
      {
        ticker: 'CASH',
        currentPercent: 10,
        targetPercent: 10,
        action: 'HOLD',
        difference: 0,
        currentAmount: 5000,
        targetAmount: 5000
      }
    ]
  }
};

const baseUrl = process.argv[2] || 'http://localhost:5173';
const endpoint = `${baseUrl}/api/explain`;

console.log('🧪 Testing /api/explain endpoint...');
console.log(`📍 URL: ${endpoint}`);
console.log('');

async function testEndpoint() {
  try {
    console.log('📤 Sending request...');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': baseUrl
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);
    console.log('');

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('');
      console.log('📄 Response:');
      console.log(JSON.stringify(data, null, 2));

      if (data.explanation) {
        console.log('');
        console.log('📊 Explanation preview:');
        console.log(data.explanation.substring(0, 200) + '...');
        console.log('');
        console.log(`📏 Length: ${data.explanation.length} characters`);
      }
    } else {
      console.log('❌ ERROR!');
      console.log('');
      console.log('📄 Error response:');
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.log('❌ EXCEPTION!');
    console.log('');
    console.log('Error:', error.message);
    console.log('');

    if (error.cause) {
      console.log('Cause:', error.cause);
    }

    console.log('');
    console.log('💡 Possible causes:');
    console.log('   - Server not running');
    console.log('   - Wrong URL');
    console.log('   - Network issue');
    console.log('   - CORS blocking request');
  }
}

testEndpoint();
