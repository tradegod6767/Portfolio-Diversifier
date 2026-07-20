#!/usr/bin/env node

/**
 * Test script for Gumroad webhook endpoint
 *
 * Usage:
 *   node test-webhook.js [email] [event-type] [url]
 *
 * Examples:
 *   node test-webhook.js user@example.com sale
 *   node test-webhook.js user@example.com cancelled
 *   node test-webhook.js user@example.com cancellation   (real Gumroad resource payload shape)
 *   node test-webhook.js user@example.com refunded https://your-app.vercel.app/api/gumroad-webhook
 *
 * Against production, pass the full URL including the secret:
 *   node test-webhook.js user@example.com cancellation "https://rebalancekit.com/api/gumroad-webhook?secret=YOUR_SECRET"
 */

const email = process.argv[2] || 'test@example.com';
const eventType = process.argv[3] || 'sale';
const webhookUrl = process.argv[4] || 'http://localhost:3000/api/gumroad-webhook';

// Create different payloads based on event type
const payloads = {
  sale: {
    email,
    sale_id: `sale-${Date.now()}`,
    subscription_id: `sub-${Date.now()}`,
    product_name: 'Pro Subscription',
    price: '1000',
    currency: 'usd',
  },
  cancelled: {
    email,
    sale_id: `sale-${Date.now()}`,
    subscription_id: `sub-${Date.now()}`,
    cancelled: true,
    product_name: 'Pro Subscription',
  },
  // Mirrors the REAL Gumroad "cancellation" resource-subscription payload:
  // the buyer's email arrives as user_email (not email), there is no sale_id,
  // and booleans arrive as strings because Gumroad posts form-encoded data
  cancellation: {
    user_email: email,
    // SUB_ID env override lets you pin the subscription_id (e.g. to exercise the
    // webhook's gumroad_subscription_id fallback match); defaults to a random id
    subscription_id: process.env.SUB_ID || `sub-${Date.now()}`,
    product_id: 'test-product-id',
    product_name: 'Pro Subscription',
    cancelled: 'true',
    cancelled_at: new Date().toISOString(),
    cancelled_by_buyer: 'true',
  },
  ended: {
    email,
    sale_id: `sale-${Date.now()}`,
    subscription_id: `sub-${Date.now()}`,
    ended: true,
    product_name: 'Pro Subscription',
  },
  refunded: {
    email,
    sale_id: `sale-${Date.now()}`,
    subscription_id: `sub-${Date.now()}`,
    refunded: true,
    product_name: 'Pro Subscription',
  },
};

const payload = payloads[eventType] || payloads.sale;

console.log('\n🔔 Testing Gumroad Webhook');
console.log('━'.repeat(50));
console.log(`📧 Email: ${email}`);
console.log(`📋 Event Type: ${eventType}`);
console.log(`🌐 URL: ${webhookUrl}`);
console.log('━'.repeat(50));
console.log('\n📦 Payload:');
console.log(JSON.stringify(payload, null, 2));
console.log('\n🚀 Sending request...\n');

fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})
  .then(async (res) => {
    const status = res.status;
    const data = await res.json();

    console.log('━'.repeat(50));
    console.log(`📡 Response Status: ${status}`);
    console.log('━'.repeat(50));
    console.log('📄 Response Body:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n');

    if (status === 200) {
      console.log('✅ SUCCESS! Webhook processed successfully');

      if (['cancelled', 'cancellation', 'ended', 'refunded'].includes(eventType)) {
        console.log('\n⚠️  Pro access should now be REVOKED for:', email);
        console.log('   Check: is_pro = false, subscription_status = cancelled');
      } else {
        console.log('\n✨ Pro access should now be ACTIVE for:', email);
        console.log('   Check: is_pro = true, subscription_status = active');
      }
    } else {
      console.log('❌ ERROR! Webhook returned non-200 status');
    }

    console.log('\n💡 Next steps:');
    console.log('   1. Check Vercel logs: vercel logs --follow');
    console.log('   2. Check Supabase webhook_logs table');
    console.log('   3. Verify user metadata in Supabase Auth');
    console.log('\n');
  })
  .catch((err) => {
    console.error('\n❌ Error sending webhook:');
    console.error(err);
    console.log('\n💡 Make sure:');
    console.log('   1. Server is running (for localhost)');
    console.log('   2. URL is correct');
    console.log('   3. Network connection is working');
    console.log('\n');
    process.exit(1);
  });
