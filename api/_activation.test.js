// Regression tests for F1: the pending-purchase claim upsert used to omit the
// NOT-NULL `id` and `email` columns, so a user claiming a pre-signup purchase
// (no pre-existing user_subscriptions row) hit an INSERT that violated the
// NOT-NULL constraints, 500'd, and — because the client swallowed the error —
// silently never received Pro.
//
// These pin the fix in api/_activation.js (used by api/claim-pending-purchase.js).
// Node's built-in runner, no test framework (see CLAUDE.md: no new deps):
// `npm test` -> `node --test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildActivationRow } from './_activation.js';

// Stand-in for supabaseAdmin.from('user_subscriptions').upsert(row) when NO row
// exists yet for the user (the pre-signup-purchase case). It enforces the same
// NOT-NULL checks the live production database does on the INSERT path: id and
// email are NOT NULL with no default, and Postgres validates the candidate
// INSERT row *before* ON CONFLICT resolution.
function simulateUpsertOnEmptyTable(row) {
  for (const col of ['id', 'email']) {
    if (row[col] === undefined || row[col] === null) {
      return {
        error: {
          code: '23502',
          message: `null value in column "${col}" of relation "user_subscriptions" violates not-null constraint`,
        },
      };
    }
  }
  return { error: null, data: [row] };
}

const pendingPurchase = {
  id: 'pp_1',
  email: 'buyer@example.com',
  sale_id: 'sale_123',
  gumroad_subscription_id: 'sub_123',
  gumroad_product_id: 'prod_123',
};

test('claim with no pre-existing subscription row inserts without violating NOT NULL', () => {
  const row = buildActivationRow({
    userId: 'user-uuid-1',
    authEmail: 'buyer@example.com',
    pendingPurchase,
  });

  // The regression guard: both NOT-NULL columns must be populated.
  assert.equal(row.id, 'user-uuid-1');
  assert.equal(row.user_id, 'user-uuid-1');
  assert.ok(row.email, 'email must be set (NOT NULL in production)');

  // The exact F1 path: upsert -> INSERT on a table with no existing row.
  const { error } = simulateUpsertOnEmptyTable(row);
  assert.equal(error, null, `insert should not violate NOT NULL: ${error?.message}`);
});

test('email is taken from the authenticated user, never the request body', () => {
  // Attacker passes a different email in the body; the handler must ignore it
  // and use the verified JWT email for the NOT-NULL account-email column.
  const row = buildActivationRow({
    userId: 'user-uuid-1',
    authEmail: 'real-owner@example.com',
    pendingPurchase: { ...pendingPurchase, email: 'buyer@example.com' },
  });
  assert.equal(row.email, 'real-owner@example.com');
});

test('activation marks the user Pro and active', () => {
  const row = buildActivationRow({ userId: 'u', authEmail: 'a@b.com', pendingPurchase });
  assert.equal(row.is_pro, true);
  assert.equal(row.subscription_status, 'active');
  assert.equal(row.gumroad_subscription_id, 'sub_123');
  assert.equal(row.gumroad_product_id, 'prod_123');
});

test('falls back to sale_id when no gumroad_subscription_id is present', () => {
  const row = buildActivationRow({
    userId: 'u',
    authEmail: 'a@b.com',
    pendingPurchase: { sale_id: 'sale_only', email: 'a@b.com' },
  });
  assert.equal(row.gumroad_subscription_id, 'sale_only');
});

test('the PRE-FIX payload (only user_id) is rejected by the NOT-NULL constraint', () => {
  // Reproduces the F1 bug directly: the old upsert body.
  const legacyRow = {
    user_id: 'user-uuid-1',
    is_pro: true,
    subscription_status: 'active',
  };
  const { error } = simulateUpsertOnEmptyTable(legacyRow);
  assert.ok(error, 'legacy payload should fail on an empty table');
  assert.equal(error.code, '23502');
});

test('buildActivationRow fails loudly when authEmail is missing (never silent)', () => {
  assert.throws(
    () => buildActivationRow({ userId: 'u', authEmail: '', pendingPurchase }),
    /authEmail is required/
  );
});

test('buildActivationRow fails loudly when userId is missing', () => {
  assert.throws(
    () => buildActivationRow({ userId: '', authEmail: 'a@b.com', pendingPurchase }),
    /userId is required/
  );
});
