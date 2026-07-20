#!/usr/bin/env node

/**
 * One-off setup: register a Gumroad resource_subscription so "cancellation"
 * events are POSTed to our webhook. Without this, Gumroad only sends the
 * sale Ping — cancellations never reach /api/gumroad-webhook at all.
 *
 * SAFE BY DEFAULT: running with no flags is a dry run that prints the exact
 * API call without sending it. Pass --apply to actually register.
 *
 * Usage (PowerShell):
 *   $env:GUMROAD_ACCESS_TOKEN = "..."     # Gumroad > Settings > Advanced > Applications > Generate access token
 *   $env:GUMROAD_WEBHOOK_SECRET = "..."   # same value as the Vercel env var (it's in the Ping URL)
 *   node scripts/register-gumroad-cancellation.js           # dry run — prints the call
 *   node scripts/register-gumroad-cancellation.js --list    # show current cancellation subscriptions
 *   node scripts/register-gumroad-cancellation.js --apply   # actually register
 *
 * The registered post_url includes ?secret= because api/gumroad-webhook.js
 * validates req.query.secret on every request.
 */

const API_BASE = 'https://api.gumroad.com/v2/resource_subscriptions';
const RESOURCE_NAME = 'cancellation';

const accessToken = process.env.GUMROAD_ACCESS_TOKEN?.trim();
const webhookSecret = process.env.GUMROAD_WEBHOOK_SECRET?.trim();
const baseUrl = process.env.WEBHOOK_BASE_URL?.trim() || 'https://rebalancekit.com';

const apply = process.argv.includes('--apply');
const list = process.argv.includes('--list');

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

if (!accessToken) {
  fail(
    'GUMROAD_ACCESS_TOKEN is not set.\n' +
      '   Create one at Gumroad > Settings > Advanced > Applications:\n' +
      '   create an application (any name/URL), then click "Generate access token".'
  );
}
if (!webhookSecret) {
  fail(
    'GUMROAD_WEBHOOK_SECRET is not set.\n' +
      '   Use the same value as the GUMROAD_WEBHOOK_SECRET Vercel env var —\n' +
      '   the webhook rejects any request without ?secret=<that value>.'
  );
}

const postUrl = `${baseUrl}/api/gumroad-webhook?secret=${encodeURIComponent(webhookSecret)}`;
const mask = (s) => (s.length > 8 ? `${s.slice(0, 4)}…${s.slice(-4)}` : '****');

async function listSubscriptions() {
  const url = `${API_BASE}?access_token=${encodeURIComponent(accessToken)}&resource_name=${RESOURCE_NAME}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || data.success === false) {
    fail(`List failed (HTTP ${res.status}): ${JSON.stringify(data)}`);
  }
  const subs = data.resource_subscriptions || [];
  console.log(`\n📋 Active "${RESOURCE_NAME}" resource subscriptions: ${subs.length}`);
  for (const sub of subs) {
    console.log(
      `   • id=${sub.id}  post_url=${sub.post_url.replace(webhookSecret, mask(webhookSecret))}`
    );
  }
  return subs;
}

async function register() {
  const res = await fetch(API_BASE, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      access_token: accessToken,
      resource_name: RESOURCE_NAME,
      post_url: postUrl,
    }),
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    fail(`Registration failed (HTTP ${res.status}): ${JSON.stringify(data)}`);
  }
  console.log('\n✅ Registered:', JSON.stringify(data.resource_subscription, null, 2));
}

(async () => {
  console.log('\n🔔 Gumroad cancellation webhook registration');
  console.log('━'.repeat(60));
  console.log('The API call this script makes:');
  console.log(`   PUT ${API_BASE}`);
  console.log('   Content-Type: application/x-www-form-urlencoded');
  console.log(`   access_token=${mask(accessToken)}`);
  console.log(`   resource_name=${RESOURCE_NAME}`);
  console.log(`   post_url=${postUrl.replace(webhookSecret, mask(webhookSecret))}`);
  console.log('━'.repeat(60));

  if (list) {
    await listSubscriptions();
    return;
  }

  if (!apply) {
    console.log('\n🔍 DRY RUN — nothing was sent. Re-run with --apply to register,');
    console.log('   or --list to see what is already registered.\n');
    return;
  }

  await register();
  await listSubscriptions();
  console.log('\n💡 Cancellations will now POST to the webhook. Test with:');
  console.log('   node test-webhook.js <email> cancellation "<post_url incl. ?secret=>"\n');
})().catch((err) => fail(err.message));
