#!/usr/bin/env node

/**
 * Test /api/explain with authentication
 * This simulates a logged-in user with a valid auth token
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

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
      }
    ]
  }
};

async function testWithAuth() {
  console.log('🔐 Testing /api/explain with authentication...\n');

  // Try to get current user session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    console.log('❌ No active session found');
    console.log('');
    console.log('To test with authentication:');
    console.log('1. Login to your app in a browser');
    console.log('2. Open DevTools → Console');
    console.log('3. Run: (await supabase.auth.getSession()).data.session.access_token');
    console.log('4. Copy the token and set it as TOKEN environment variable:');
    console.log('   TOKEN=your_token node test-with-auth.js');
    console.log('');
    console.log('Or test manually:');
    console.log('');
    console.log('curl -X POST http://localhost:3000/api/explain \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
    console.log('  -d \'{"rebalancingData":{"totalValue":50000,"positions":[...]}}\'');
    return;
  }

  const token = session.access_token;
  console.log(`✅ Found session for user: ${session.user.email}`);
  console.log(`📋 User metadata:`, session.user.user_metadata);
  console.log('');

  const endpoint = 'http://localhost:3000/api/explain';

  try {
    console.log('📤 Sending authenticated request...');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}\n`);

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS!\n');

      const isPro = session.user.user_metadata?.is_pro === true &&
                    session.user.user_metadata?.subscription_status === 'active';

      console.log(`📊 User tier: ${isPro ? 'PRO' : 'FREE'}`);
      console.log(`📏 Response length: ${data.explanation.length} characters`);

      if (data.explanation.includes('Upgrade to Pro')) {
        console.log('💡 Response type: FREE TIER (contains upgrade prompt)');
      } else if (data.explanation.length > 1000) {
        console.log('💡 Response type: PRO TIER (detailed analysis)');
      }

      console.log('\n📄 Explanation preview:');
      console.log(data.explanation.substring(0, 200) + '...');
    } else {
      console.log('❌ ERROR!\n');
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.log('❌ EXCEPTION!\n');
    console.log('Error:', error.message);
  }
}

testWithAuth();
