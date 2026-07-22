// Regression tests for the contribution/withdrawal allocation caps and the
// position-validation filter in calculations.js. These pin the behavior fixed
// after the "over-allocation" bugs: a buy-only contribution must never
// recommend buying more than the contribution, a sell-only withdrawal must
// never recommend selling more than the withdrawal, and modeData totals must
// reflect what was actually allocated rather than the raw input amount.
//
// No test framework is installed on purpose (see CLAUDE.md: no new deps).
// These use Node's built-in runner: `npm test` -> `node --test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateRebalancing } from './calculations.js';

const near = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

test('contribution caps total buys at the contribution amount', () => {
  // AAA is overweight (can't sell in contribution mode); closing BBB's gap
  // alone would need $10,000, but only $1,000 is contributed.
  const positions = [
    { ticker: 'AAA', amount: '19000', targetPercent: '50' },
    { ticker: 'BBB', amount: '0', targetPercent: '50' },
  ];
  const r = calculateRebalancing(positions, 'contribution', 1000);

  const totalBuys = r.positions.reduce((s, p) => s + (p.difference > 0 ? p.difference : 0), 0);
  assert.ok(totalBuys <= 1000 + 1e-6, `buys ${totalBuys} exceed the contribution`);
  assert.ok(near(totalBuys, 1000), `buys ${totalBuys} should use the full contribution`);

  // modeData.totalAllocated must reflect reality, not be hardcoded to the input.
  assert.ok(near(r.modeData.totalAllocated, totalBuys));

  // No position is ever driven above its own current amount by more than its buy.
  for (const p of r.positions) {
    assert.ok(p.difference >= -1e-9, `${p.ticker} should never sell in contribution mode`);
  }
});

test('withdrawal caps total sells at the withdrawal amount', () => {
  // Mirror case: AAA is overweight, trimming it to target would sell $10,000,
  // but only $1,000 is being withdrawn.
  const positions = [
    { ticker: 'AAA', amount: '19000', targetPercent: '50' },
    { ticker: 'BBB', amount: '0', targetPercent: '50' },
  ];
  const r = calculateRebalancing(positions, 'withdrawal', 1000);

  const totalSells = r.positions.reduce((s, p) => s + (p.difference < 0 ? -p.difference : 0), 0);
  assert.ok(totalSells <= 1000 + 1e-6, `sells ${totalSells} exceed the withdrawal`);
  assert.ok(near(totalSells, 1000), `sells ${totalSells} should cover the full withdrawal`);

  // modeData.totalSold must reflect reality, not be hardcoded to the input.
  assert.ok(near(r.modeData.totalSold, totalSells));

  for (const p of r.positions) {
    assert.ok(p.difference <= 1e-9, `${p.ticker} should never buy in withdrawal mode`);
  }
});

test('an under-allocated contribution still distributes the full amount', () => {
  // Targets sum to 90%, so raw gaps fall short of the contribution; the
  // remainder branch should still allocate the whole $1,000.
  const positions = [
    { ticker: 'AAA', amount: '4500', targetPercent: '45' },
    { ticker: 'BBB', amount: '4500', targetPercent: '45' },
  ];
  const r = calculateRebalancing(positions, 'contribution', 1000);
  const totalBuys = r.positions.reduce((s, p) => s + (p.difference > 0 ? p.difference : 0), 0);
  assert.ok(near(totalBuys, 1000), `buys ${totalBuys} should equal the contribution`);
  assert.ok(near(r.modeData.totalAllocated, 1000));
});

test('positions with a non-numeric targetPercent are filtered out', () => {
  const positions = [
    { ticker: 'AAA', amount: '1000', targetPercent: 'abc' },
    { ticker: 'BBB', amount: '1000', targetPercent: '100' },
  ];
  const r = calculateRebalancing(positions, 'standard', 0);
  assert.deepEqual(
    r.positions.map((p) => p.ticker),
    ['BBB'],
    'the NaN-target position should be dropped'
  );
  assert.ok(
    !r.positions.some((p) => Number.isNaN(p.targetPercent)),
    'no NaN targetPercent should reach the output'
  );
});
