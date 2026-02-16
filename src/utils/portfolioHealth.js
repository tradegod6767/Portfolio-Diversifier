/**
 * Portfolio Health Scoring System
 * Calculates comprehensive health metrics with detailed breakdowns
 */

// Factor weights (must sum to 100)
const FACTORS = {
  concentration: { maxPoints: 35, name: 'Concentration Risk', icon: 'concentration' },
  drift: { maxPoints: 30, name: 'Portfolio Drift', icon: 'drift' },
  diversification: { maxPoints: 20, name: 'Diversification', icon: 'diversification' },
  assetClasses: { maxPoints: 15, name: 'Asset Class Mix', icon: 'assetClass' }
};

/**
 * Calculate comprehensive portfolio health with detailed breakdown
 */
export const calculatePortfolioHealth = (positions) => {
  if (!positions || positions.length === 0) {
    return {
      score: 0,
      factors: [],
      actions: [],
      issues: [],
      rating: 'Critical',
      color: 'red',
      summary: 'No positions to evaluate.'
    };
  }

  const factors = [];
  let totalScore = 0;

  // 1. CONCENTRATION RISK (35 points max)
  const concentrationResult = calculateConcentrationFactor(positions);
  factors.push(concentrationResult);
  totalScore += concentrationResult.earned;

  // 2. PORTFOLIO DRIFT (30 points max)
  const driftResult = calculateDriftFactor(positions);
  factors.push(driftResult);
  totalScore += driftResult.earned;

  // 3. DIVERSIFICATION - Number of Holdings (20 points max)
  const diversificationResult = calculateDiversificationFactor(positions);
  factors.push(diversificationResult);
  totalScore += diversificationResult.earned;

  // 4. ASSET CLASS MIX (15 points max)
  const assetClassResult = calculateAssetClassFactor(positions);
  factors.push(assetClassResult);
  totalScore += assetClassResult.earned;

  // Generate prioritized actions
  const actions = generateActions(factors, positions);

  // Legacy issues array for backward compatibility
  const issues = factors
    .filter(f => f.status !== 'good')
    .map(f => f.issue)
    .filter(Boolean);

  return {
    score: Math.round(totalScore),
    factors,
    actions,
    issues,
    rating: getHealthRating(totalScore),
    color: getHealthColor(totalScore),
    summary: generateSummary(totalScore, factors)
  };
};

/**
 * Calculate concentration risk factor
 */
function calculateConcentrationFactor(positions) {
  const { maxPoints, name, icon } = FACTORS.concentration;
  const maxPosition = Math.max(...positions.map(p => p.currentPercent));
  const maxTicker = positions.find(p => p.currentPercent === maxPosition)?.ticker || 'Unknown';

  let earned = maxPoints;
  let status = 'good';
  let severity = 'low';
  let issue = null;
  let recommendation = null;
  let target = 'Keep largest position under 40%';

  if (maxPosition > 70) {
    // Severe concentration
    const penalty = Math.min(maxPoints, (maxPosition - 40) * 0.7);
    earned = Math.max(0, maxPoints - penalty);
    status = 'critical';
    severity = 'critical';
    issue = `${maxPosition.toFixed(1)}% concentrated in ${maxTicker}`;
    recommendation = `Reduce ${maxTicker} position or add to other holdings`;
  } else if (maxPosition > 50) {
    // High concentration
    const penalty = Math.min(20, (maxPosition - 40) * 0.5);
    earned = Math.max(0, maxPoints - penalty);
    status = 'warning';
    severity = 'high';
    issue = `${maxPosition.toFixed(1)}% in ${maxTicker} is above ideal`;
    recommendation = `Consider reducing ${maxTicker} below 50%`;
  } else if (maxPosition > 40) {
    // Moderate concentration
    const penalty = (maxPosition - 40) * 0.3;
    earned = Math.max(0, maxPoints - penalty);
    status = 'caution';
    severity = 'medium';
    issue = `Top position at ${maxPosition.toFixed(1)}%`;
    recommendation = 'Monitor concentration levels';
  }

  return {
    id: 'concentration',
    name,
    icon,
    maxPoints,
    earned: Math.round(earned),
    lost: Math.round(maxPoints - earned),
    status,
    severity,
    issue,
    recommendation,
    target,
    details: {
      current: maxPosition,
      ticker: maxTicker,
      threshold: 40
    }
  };
}

/**
 * Calculate portfolio drift factor
 */
function calculateDriftFactor(positions) {
  const { maxPoints, name, icon } = FACTORS.drift;
  const totalDrift = positions.reduce((sum, p) => {
    return sum + Math.abs(p.currentPercent - p.targetPercent);
  }, 0) / 2;

  let earned = maxPoints;
  let status = 'good';
  let severity = 'low';
  let issue = null;
  let recommendation = null;
  let target = 'Keep total drift under 5%';

  if (totalDrift > 20) {
    const penalty = Math.min(maxPoints, totalDrift * 0.8);
    earned = Math.max(0, maxPoints - penalty);
    status = 'critical';
    severity = 'critical';
    issue = `${totalDrift.toFixed(1)}% drift from targets`;
    recommendation = 'Rebalance immediately to realign with targets';
  } else if (totalDrift > 10) {
    const penalty = Math.min(20, totalDrift * 0.6);
    earned = Math.max(0, maxPoints - penalty);
    status = 'warning';
    severity = 'high';
    issue = `${totalDrift.toFixed(1)}% drift - significant misalignment`;
    recommendation = 'Rebalance soon to prevent further drift';
  } else if (totalDrift > 5) {
    const penalty = totalDrift * 0.4;
    earned = Math.max(0, maxPoints - penalty);
    status = 'caution';
    severity = 'medium';
    issue = `${totalDrift.toFixed(1)}% drift from target allocation`;
    recommendation = 'Consider rebalancing when convenient';
  }

  return {
    id: 'drift',
    name,
    icon,
    maxPoints,
    earned: Math.round(earned),
    lost: Math.round(maxPoints - earned),
    status,
    severity,
    issue,
    recommendation,
    target,
    details: {
      current: totalDrift,
      threshold: 5
    }
  };
}

/**
 * Calculate diversification factor (number of holdings)
 */
function calculateDiversificationFactor(positions) {
  const { maxPoints, name, icon } = FACTORS.diversification;
  const numPositions = positions.length;

  let earned = maxPoints;
  let status = 'good';
  let severity = 'low';
  let issue = null;
  let recommendation = null;
  let target = '5-15 holdings for optimal diversification';

  if (numPositions < 3) {
    earned = Math.max(0, numPositions * 5);
    status = 'critical';
    severity = 'critical';
    issue = `Only ${numPositions} holding${numPositions === 1 ? '' : 's'} - very limited diversification`;
    recommendation = 'Add more holdings to spread risk';
  } else if (numPositions < 5) {
    earned = Math.max(0, maxPoints - (5 - numPositions) * 4);
    status = 'warning';
    severity = 'medium';
    issue = `${numPositions} holdings - below recommended minimum`;
    recommendation = 'Consider adding 1-2 more positions';
  } else if (numPositions > 25) {
    earned = Math.max(0, maxPoints - (numPositions - 20) * 0.5);
    status = 'caution';
    severity = 'low';
    issue = `${numPositions} holdings may be over-diversified`;
    recommendation = 'Consider consolidating similar holdings';
  } else if (numPositions > 20) {
    earned = Math.max(0, maxPoints - 3);
    status = 'caution';
    severity = 'low';
    issue = `${numPositions} holdings - on the higher end`;
  }

  return {
    id: 'diversification',
    name,
    icon,
    maxPoints,
    earned: Math.round(earned),
    lost: Math.round(maxPoints - earned),
    status,
    severity,
    issue,
    recommendation,
    target,
    details: {
      current: numPositions,
      idealMin: 5,
      idealMax: 15
    }
  };
}

/**
 * Calculate asset class diversity factor
 */
function calculateAssetClassFactor(positions) {
  const { maxPoints, name, icon } = FACTORS.assetClasses;

  // Detect asset classes from tickers (simplified detection)
  const assetClasses = new Set();
  positions.forEach(p => {
    const ticker = (p.ticker || '').toUpperCase();
    if (ticker === 'CASH' || ticker.includes('MONEY')) {
      assetClasses.add('cash');
    } else if (['BND', 'AGG', 'TLT', 'VCIT', 'VGIT', 'GOVT', 'TIPS', 'HYG', 'LQD'].some(b => ticker.includes(b))) {
      assetClasses.add('bonds');
    } else if (['GLD', 'IAU', 'SLV', 'PDBC', 'DBC', 'GSG'].some(c => ticker.includes(c))) {
      assetClasses.add('commodities');
    } else if (['VNQ', 'SCHH', 'IYR', 'XLRE', 'REIT'].some(r => ticker.includes(r))) {
      assetClasses.add('realestate');
    } else if (['VXUS', 'VEA', 'VWO', 'IEFA', 'EFA', 'EEM', 'IXUS'].some(i => ticker.includes(i))) {
      assetClasses.add('international');
    } else {
      assetClasses.add('stocks');
    }
  });

  const numClasses = assetClasses.size;
  let earned = maxPoints;
  let status = 'good';
  let severity = 'low';
  let issue = null;
  let recommendation = null;
  let target = '3+ asset classes for balanced portfolio';

  if (numClasses === 1) {
    earned = 3;
    status = 'warning';
    severity = 'high';
    issue = 'Single asset class - no diversification across asset types';
    recommendation = 'Add bonds or international exposure';
  } else if (numClasses === 2) {
    earned = 8;
    status = 'caution';
    severity = 'medium';
    issue = `Only ${numClasses} asset classes represented`;
    recommendation = 'Consider adding a third asset class';
  } else if (numClasses >= 4) {
    earned = maxPoints;
    status = 'good';
  } else {
    earned = 12;
    status = 'good';
  }

  return {
    id: 'assetClass',
    name,
    icon,
    maxPoints,
    earned: Math.round(earned),
    lost: Math.round(maxPoints - earned),
    status,
    severity,
    issue,
    recommendation,
    target,
    details: {
      current: numClasses,
      classes: Array.from(assetClasses),
      threshold: 3
    }
  };
}

/**
 * Generate prioritized action items
 */
function generateActions(factors) {
  const actions = [];

  // Sort factors by severity and points lost
  const sortedFactors = [...factors]
    .filter(f => f.lost > 0)
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.lost - a.lost;
    });

  sortedFactors.forEach(factor => {
    if (factor.recommendation) {
      actions.push({
        priority: factor.severity === 'critical' ? 'critical' : factor.severity === 'high' ? 'high' : 'normal',
        factor: factor.name,
        action: factor.recommendation,
        impact: `+${factor.lost} points potential`,
        factorId: factor.id
      });
    }
  });

  return actions;
}

/**
 * Generate summary text
 */
function generateSummary(score, factors) {
  const criticalCount = factors.filter(f => f.severity === 'critical').length;
  const warningCount = factors.filter(f => f.severity === 'high' || f.severity === 'medium').length;

  if (score >= 90) {
    return 'Excellent portfolio health! Well-diversified and closely aligned with targets.';
  } else if (score >= 70) {
    return 'Good portfolio health with minor areas for improvement.';
  } else if (score >= 50) {
    return `Fair health with ${warningCount} area${warningCount !== 1 ? 's' : ''} needing attention.`;
  } else {
    return `Portfolio needs attention - ${criticalCount} critical issue${criticalCount !== 1 ? 's' : ''} identified.`;
  }
}

/**
 * Calculate drift (exported for backward compatibility)
 */
export const calculateDrift = (positions) => {
  const totalDrift = positions.reduce((sum, p) => {
    return sum + Math.abs(p.currentPercent - p.targetPercent);
  }, 0) / 2;

  return {
    percentage: totalDrift,
    color: getDriftColor(totalDrift),
    status: getDriftStatus(totalDrift)
  };
};

// Helper functions
const getHealthRating = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 30) return 'Needs Improvement';
  return 'Critical';
};

const getHealthColor = (score) => {
  if (score >= 90) return 'green';
  if (score >= 70) return 'blue';
  if (score >= 50) return 'yellow';
  return 'red';
};

const getDriftColor = (drift) => {
  if (drift < 5) return 'green';
  if (drift < 10) return 'yellow';
  return 'red';
};

const getDriftStatus = (drift) => {
  if (drift < 5) return 'Minimal';
  if (drift < 10) return 'Moderate';
  if (drift < 20) return 'Significant';
  return 'High';
};
