/**
 * Calculate portfolio rebalancing
 * @param {Array} positions - Array of position objects with ticker, amount, and targetPercent
 * @param {string} mode - Rebalancing mode: 'standard', 'add-only', 'sell-only', 'contribution', 'withdrawal'
 * @param {number} modeAmount - Amount for contribution or withdrawal modes
 * @returns {Object} Rebalancing data with current and target allocations
 */
export function calculateRebalancing(positions, mode = 'standard', modeAmount = 0) {
  // Calculate total portfolio value
  const totalValue = positions.reduce((sum, pos) => sum + parseFloat(pos.amount), 0);

  // Handle contribution mode
  if (mode === 'contribution' && modeAmount > 0) {
    return calculateContribution(positions, totalValue, modeAmount);
  }

  // Handle withdrawal mode
  if (mode === 'withdrawal' && modeAmount > 0) {
    return calculateWithdrawal(positions, totalValue, modeAmount);
  }

  // Calculate current allocations and rebalancing actions
  const positionsWithCalcs = positions.map(pos => {
    const currentAmount = parseFloat(pos.amount);
    const currentPercent = (currentAmount / totalValue) * 100;
    const targetPercent = parseFloat(pos.targetPercent);
    const targetAmount = (targetPercent / 100) * totalValue;
    const difference = targetAmount - currentAmount;

    let action = difference > 0 ? 'BUY' : difference < 0 ? 'SELL' : 'HOLD';
    let displayDifference = difference;

    // Apply mode-specific logic
    if (mode === 'add-only') {
      // Only show positions that need buying
      if (difference <= 0) {
        action = 'HOLD';
        displayDifference = 0;
      }
    } else if (mode === 'sell-only') {
      // Only show positions that need selling
      if (difference >= 0) {
        action = 'HOLD';
        displayDifference = 0;
      }
    }

    return {
      ticker: pos.ticker,
      currentAmount: currentAmount,
      currentPercent: currentPercent,
      targetPercent: targetPercent,
      targetAmount: targetAmount,
      difference: displayDifference,
      action: action
    };
  });

  // Calculate mode-specific totals
  let modeData = {};
  if (mode === 'add-only') {
    const totalToAdd = positionsWithCalcs.reduce((sum, pos) => {
      return sum + (pos.difference > 0 ? pos.difference : 0);
    }, 0);
    modeData = {
      totalToAdd,
      newTotalValue: totalValue + totalToAdd
    };
  } else if (mode === 'sell-only') {
    const totalToSell = positionsWithCalcs.reduce((sum, pos) => {
      return sum + (pos.difference < 0 ? Math.abs(pos.difference) : 0);
    }, 0);
    modeData = {
      totalToSell,
      newTotalValue: totalValue - totalToSell
    };
  }

  return {
    totalValue,
    positions: positionsWithCalcs,
    mode,
    modeData
  };
}

/**
 * Format currency
 * @param {number} value - Number to format as currency
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format percentage
 * @param {number} value - Number to format as percentage
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}

/**
 * Calculate contribution allocation
 * @param {Array} positions - Array of position objects
 * @param {number} currentTotal - Current portfolio value
 * @param {number} contribution - Amount to contribute
 * @returns {Object} Contribution allocation data
 */
function calculateContribution(positions, currentTotal, contribution) {
  const newTotal = currentTotal + contribution;

  const positionsWithCalcs = positions.map(pos => {
    const currentAmount = parseFloat(pos.amount);
    const currentPercent = (currentAmount / currentTotal) * 100;
    const targetPercent = parseFloat(pos.targetPercent);

    // Calculate target amount after contribution
    const newTargetAmount = (targetPercent / 100) * newTotal;
    const amountToAdd = newTargetAmount - currentAmount;

    // New allocation after contribution
    const newAmount = currentAmount + (amountToAdd > 0 ? amountToAdd : 0);
    const newPercent = (newAmount / newTotal) * 100;

    return {
      ticker: pos.ticker,
      currentAmount: currentAmount,
      currentPercent: currentPercent,
      targetPercent: targetPercent,
      targetAmount: newTargetAmount,
      difference: amountToAdd > 0 ? amountToAdd : 0,
      action: amountToAdd > 0 ? 'BUY' : 'HOLD',
      newAmount: newAmount,
      newPercent: newPercent
    };
  });

  // Verify total allocation equals contribution
  const totalAllocated = positionsWithCalcs.reduce((sum, pos) => sum + pos.difference, 0);

  // If allocated less than contribution, distribute remainder proportionally to targets
  if (totalAllocated < contribution) {
    const remainder = contribution - totalAllocated;
    const totalTargetPercent = positions.reduce((sum, pos) => sum + parseFloat(pos.targetPercent), 0);

    positionsWithCalcs.forEach(pos => {
      const additionalAllocation = (pos.targetPercent / totalTargetPercent) * remainder;
      pos.difference += additionalAllocation;
      pos.newAmount += additionalAllocation;
      pos.newPercent = (pos.newAmount / newTotal) * 100;
      if (pos.difference > 0) {
        pos.action = 'BUY';
      }
    });
  }

  return {
    totalValue: currentTotal,
    positions: positionsWithCalcs,
    mode: 'contribution',
    modeData: {
      contributionAmount: contribution,
      newTotalValue: newTotal,
      totalAllocated: contribution
    }
  };
}

/**
 * Calculate withdrawal allocation
 * @param {Array} positions - Array of position objects
 * @param {number} currentTotal - Current portfolio value
 * @param {number} withdrawal - Amount to withdraw
 * @returns {Object} Withdrawal allocation data
 */
function calculateWithdrawal(positions, currentTotal, withdrawal) {
  const newTotal = currentTotal - withdrawal;

  const positionsWithCalcs = positions.map(pos => {
    const currentAmount = parseFloat(pos.amount);
    const currentPercent = (currentAmount / currentTotal) * 100;
    const targetPercent = parseFloat(pos.targetPercent);

    // Calculate target amount after withdrawal
    const newTargetAmount = (targetPercent / 100) * newTotal;
    const amountToSell = currentAmount - newTargetAmount;

    // New allocation after withdrawal
    const newAmount = currentAmount - (amountToSell > 0 ? amountToSell : 0);
    const newPercent = (newAmount / newTotal) * 100;

    return {
      ticker: pos.ticker,
      currentAmount: currentAmount,
      currentPercent: currentPercent,
      targetPercent: targetPercent,
      targetAmount: newTargetAmount,
      difference: amountToSell > 0 ? -amountToSell : 0,
      action: amountToSell > 0 ? 'SELL' : 'HOLD',
      newAmount: newAmount,
      newPercent: newPercent
    };
  });

  // Verify total sold equals withdrawal
  const totalSold = positionsWithCalcs.reduce((sum, pos) => sum + Math.abs(pos.difference), 0);

  // If sold less than withdrawal, distribute remainder proportionally
  if (totalSold < withdrawal) {
    const remainder = withdrawal - totalSold;
    const totalCurrentAmount = positions.reduce((sum, pos) => sum + parseFloat(pos.amount), 0);

    positionsWithCalcs.forEach(pos => {
      const additionalSale = (pos.currentAmount / totalCurrentAmount) * remainder;
      pos.difference -= additionalSale;
      pos.newAmount -= additionalSale;
      pos.newPercent = (pos.newAmount / newTotal) * 100;
      if (pos.difference < 0) {
        pos.action = 'SELL';
      }
    });
  }

  return {
    totalValue: currentTotal,
    positions: positionsWithCalcs,
    mode: 'withdrawal',
    modeData: {
      withdrawalAmount: withdrawal,
      newTotalValue: newTotal,
      totalSold: withdrawal
    }
  };
}
