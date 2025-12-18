// Portfolio health scoring and drift calculation

export const calculatePortfolioHealth = (positions) => {
  let score = 100;
  const issues = [];

  // Check concentration risk (>70% in one position)
  const maxPosition = Math.max(...positions.map(p => p.currentPercent));
  if (maxPosition > 70) {
    const penalty = Math.min(30, (maxPosition - 70) * 2);
    score -= penalty;
    issues.push(`High concentration: ${maxPosition.toFixed(1)}% in one position`);
  } else if (maxPosition > 50) {
    const penalty = Math.min(15, (maxPosition - 50));
    score -= penalty;
    issues.push(`Moderate concentration in top position`);
  }

  // Check drift from target
  const totalDrift = positions.reduce((sum, p) => {
    return sum + Math.abs(p.currentPercent - p.targetPercent);
  }, 0) / 2; // Divide by 2 because each drift is counted twice

  if (totalDrift > 20) {
    score -= 25;
    issues.push(`High portfolio drift: ${totalDrift.toFixed(1)}%`);
  } else if (totalDrift > 10) {
    score -= 15;
    issues.push(`Moderate portfolio drift: ${totalDrift.toFixed(1)}%`);
  } else if (totalDrift > 5) {
    score -= 5;
    issues.push(`Minor portfolio drift: ${totalDrift.toFixed(1)}%`);
  }

  // Check number of positions
  const numPositions = positions.length;
  if (numPositions < 3) {
    score -= 20;
    issues.push(`Low diversification: only ${numPositions} position${numPositions === 1 ? '' : 's'}`);
  } else if (numPositions > 20) {
    score -= 10;
    issues.push(`Over-diversification: ${numPositions} positions`);
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, Math.round(score));

  return {
    score,
    issues,
    rating: getHealthRating(score),
    color: getHealthColor(score)
  };
};

export const calculateDrift = (positions) => {
  const totalDrift = positions.reduce((sum, p) => {
    return sum + Math.abs(p.currentPercent - p.targetPercent);
  }, 0) / 2; // Divide by 2 because each drift is counted twice

  return {
    percentage: totalDrift,
    color: getDriftColor(totalDrift),
    status: getDriftStatus(totalDrift)
  };
};

const getHealthRating = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs Attention';
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
