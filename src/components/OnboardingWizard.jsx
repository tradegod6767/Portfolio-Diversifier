import { useState, useEffect } from 'react';
import { calculateRebalancing } from '../utils/calculations';
import { setOnboardingCompleted } from '../utils/onboardingStorage';
import SamplePortfolioSelector from './SamplePortfolioSelector';
import './OnboardingWizard.css';

export default function OnboardingWizard({ isOpen, onClose, onComplete, user }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [positions, setPositions] = useState([
    { id: Date.now(), ticker: '', amount: '', targetPercent: '' }
  ]);
  const [mode, setMode] = useState('standard');
  const [modeAmount, setModeAmount] = useState('');
  const [results, setResults] = useState(null);
  const [loadedSample, setLoadedSample] = useState(null);
  const [error, setError] = useState('');
  const [showSampleSelector, setShowSampleSelector] = useState(false);

  // Ticker validation (copied from PortfolioForm)
  const validateTicker = (ticker) => {
    if (!ticker || ticker.trim() === '') return '';
    const cleanTicker = ticker.trim().toUpperCase();
    if (cleanTicker === 'CASH') return cleanTicker;
    const tickerRegex = /^[A-Z]{1,5}$/;
    if (!tickerRegex.test(cleanTicker)) return null;
    return cleanTicker;
  };

  const handleClose = () => {
    setOnboardingCompleted(user?.id || null); // Mark as completed even if skipped
    onClose();
  };

  const goToStep = (step) => {
    setError('');
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    goToStep(currentStep - 1);
  };

  const validateCurrentStep = () => {
    if (currentStep === 2) {
      // Step 2: Must have at least one valid position
      const validPositions = positions.filter(p => p.ticker && p.amount);
      if (validPositions.length === 0) {
        setError('Please add at least one holding');
        return false;
      }
    }

    if (currentStep === 3) {
      // Step 3: Percentages must sum to 100
      const total = positions.reduce((sum, p) => sum + (parseFloat(p.targetPercent) || 0), 0);
      if (Math.abs(total - 100) > 0.01) {
        setError('Target allocations must total 100%');
        return false;
      }
    }

    if (currentStep === 4) {
      // Step 4: Mode selected, amount required for contribution/withdrawal
      if ((mode === 'contribution' || mode === 'withdrawal') && !modeAmount) {
        setError('Please enter an amount');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleLoadSample = (sample) => {
    const positionsWithIds = sample.positions.map((pos, index) => ({
      ...pos,
      id: Date.now() + index
    }));
    setPositions(positionsWithIds);
    setLoadedSample(sample.name);
    setShowSampleSelector(false);
    goToStep(4); // Skip to mode selection
  };

  const handleFinish = () => {
    setOnboardingCompleted(user?.id || null);
    onComplete(positions, mode, modeAmount, results);
  };

  if (!isOpen) return null;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-content">
        {/* Close/Skip button */}
        <button
          onClick={handleClose}
          className="onboarding-close"
          aria-label="Skip tutorial"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} totalSteps={5} loadedSample={loadedSample} />

        {/* Error Message */}
        {error && (
          <div className="onboarding-error">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="onboarding-body">
          {currentStep === 1 && (
            <Step1Welcome
              onStart={() => goToStep(2)}
              onLoadSample={() => setShowSampleSelector(true)}
              showSampleSelector={showSampleSelector}
              onSelectSample={handleLoadSample}
              onCloseSampleSelector={() => setShowSampleSelector(false)}
            />
          )}

          {currentStep === 2 && (
            <Step2AddHoldings
              positions={positions}
              setPositions={setPositions}
              validateTicker={validateTicker}
              setError={setError}
            />
          )}

          {currentStep === 3 && (
            <Step3SetTargets
              positions={positions}
              setPositions={setPositions}
              error={error}
            />
          )}

          {currentStep === 4 && (
            <Step4ChooseMode
              mode={mode}
              setMode={setMode}
              modeAmount={modeAmount}
              setModeAmount={setModeAmount}
            />
          )}

          {currentStep === 5 && (
            <Step5Results
              results={results}
              onFinish={handleFinish}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 5 && (
          <div className="onboarding-nav">
            {currentStep > 1 && currentStep !== 4 - (loadedSample ? 2 : 0) && (
              <button
                onClick={prevStep}
                className="onboarding-btn onboarding-btn-secondary"
              >
                Back
              </button>
            )}
            {currentStep < 4 && (
              <button
                onClick={nextStep}
                className="onboarding-btn onboarding-btn-primary"
              >
                Next
              </button>
            )}
            {currentStep === 4 && (
              <button
                onClick={() => {
                  if (validateCurrentStep()) {
                    const calculatedResults = calculateRebalancing(positions, mode, parseFloat(modeAmount) || 0);
                    setResults(calculatedResults);
                    goToStep(5);
                  }
                }}
                className="onboarding-btn onboarding-btn-primary"
              >
                Calculate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Progress Indicator Component
function ProgressIndicator({ currentStep, totalSteps, loadedSample }) {
  return (
    <div className="progress-indicator">
      <div className="progress-steps">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="progress-step-wrapper">
            <div
              className={`progress-step ${
                step < currentStep ? 'completed' :
                step === currentStep ? 'current' : 'upcoming'
              }`}
            >
              {step < currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span>{step}</span>
              )}
            </div>
            {step < totalSteps && <div className="progress-line" />}
          </div>
        ))}
      </div>
      <div className="progress-label">
        {loadedSample && currentStep === 4 ? (
          <span>Sample: {loadedSample} loaded</span>
        ) : (
          <span>Step {currentStep} of {totalSteps}</span>
        )}
      </div>
    </div>
  );
}

// Step 1: Welcome Screen
function Step1Welcome({ onStart, onLoadSample, showSampleSelector, onSelectSample, onCloseSampleSelector }) {
  return (
    <div className="wizard-step wizard-step-welcome">
      <div className="wizard-step-icon">
        <svg className="w-24 h-24" style={{color: '#0A2540'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="wizard-step-title">Welcome to RebalanceKit!</h2>
      <p className="wizard-step-subtitle">
        Let's set up your first portfolio. This quick tutorial will walk you through the process.
      </p>

      {showSampleSelector ? (
        <div className="sample-selector-wrapper">
          <button
            onClick={onCloseSampleSelector}
            className="mb-4 text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to options
          </button>
          <SamplePortfolioSelector onSelectSample={onSelectSample} />
        </div>
      ) : (
        <div className="welcome-actions">
          <button
            onClick={onStart}
            className="onboarding-btn onboarding-btn-primary onboarding-btn-lg"
          >
            Start with my holdings
          </button>
          <button
            onClick={onLoadSample}
            className="onboarding-btn onboarding-btn-secondary onboarding-btn-lg"
          >
            Load a sample portfolio
          </button>
        </div>
      )}
    </div>
  );
}

// Step 2: Add Holdings
function Step2AddHoldings({ positions, setPositions, validateTicker, setError }) {
  const [currentTicker, setCurrentTicker] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');

  const addPosition = () => {
    const validated = validateTicker(currentTicker);
    if (validated === null) {
      setError('Invalid ticker symbol. Please use 1-5 letters only');
      return;
    }
    if (!validated || !currentAmount) {
      setError('Please enter both ticker and amount');
      return;
    }

    const newPosition = {
      id: Date.now(),
      ticker: validated,
      amount: currentAmount,
      targetPercent: ''
    };

    setPositions([...positions.filter(p => p.ticker || p.amount), newPosition]);
    setCurrentTicker('');
    setCurrentAmount('');
    setError('');
  };

  const removePosition = (id) => {
    setPositions(positions.filter(p => p.id !== id));
  };

  const validPositions = positions.filter(p => p.ticker && p.amount);

  return (
    <div className="wizard-step">
      <h2 className="wizard-step-title">Add Your Holdings</h2>
      <p className="wizard-step-subtitle">
        Enter the investments you currently own. Add them one at a time.
      </p>

      <div className="holdings-form">
        <div className="holdings-input-group">
          <div className="holdings-input-field">
            <label className="holdings-label">Ticker Symbol</label>
            <input
              type="text"
              value={currentTicker}
              onChange={(e) => setCurrentTicker(e.target.value.toUpperCase())}
              placeholder="e.g., VTI, BND, AAPL"
              className="holdings-input"
              maxLength={5}
            />
          </div>
          <div className="holdings-input-field">
            <label className="holdings-label">Current Value ($)</label>
            <input
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="e.g., 10000"
              className="holdings-input"
              min="0"
              step="0.01"
            />
          </div>
          <button
            onClick={addPosition}
            className="holdings-add-btn"
          >
            Add
          </button>
        </div>

        {validPositions.length > 0 && (
          <div className="holdings-list">
            <h3 className="holdings-list-title">Your Holdings ({validPositions.length})</h3>
            {validPositions.map((pos) => (
              <div key={pos.id} className="holdings-item">
                <div className="holdings-item-info">
                  <span className="holdings-item-ticker">{pos.ticker}</span>
                  <span className="holdings-item-amount">
                    ${parseFloat(pos.amount).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => removePosition(pos.id)}
                  className="holdings-item-remove"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Step 3: Set Targets
function Step3SetTargets({ positions, setPositions, error }) {
  const validPositions = positions.filter(p => p.ticker && p.amount);
  const total = validPositions.reduce((sum, p) => sum + (parseFloat(p.targetPercent) || 0), 0);
  const isValid = Math.abs(total - 100) < 0.01;

  const updateTarget = (id, value) => {
    setPositions(positions.map(p =>
      p.id === id ? { ...p, targetPercent: value } : p
    ));
  };

  const distributeEvenly = () => {
    const percent = (100 / validPositions.length).toFixed(2);
    setPositions(positions.map(p =>
      p.ticker && p.amount ? { ...p, targetPercent: percent } : p
    ));
  };

  return (
    <div className="wizard-step">
      <h2 className="wizard-step-title">Set Target Allocations</h2>
      <p className="wizard-step-subtitle">
        How much of your portfolio should each holding represent? Total must equal 100%.
      </p>

      <div className="targets-form">
        {validPositions.map((pos) => (
          <div key={pos.id} className="target-item">
            <div className="target-item-label">
              <span className="target-item-ticker">{pos.ticker}</span>
              <span className="target-item-amount">
                ${parseFloat(pos.amount).toLocaleString()}
              </span>
            </div>
            <div className="target-item-input-group">
              <input
                type="number"
                value={pos.targetPercent}
                onChange={(e) => updateTarget(pos.id, e.target.value)}
                placeholder="0"
                className="target-item-input"
                min="0"
                max="100"
                step="0.1"
              />
              <span className="target-item-percent">%</span>
            </div>
          </div>
        ))}

        <button
          onClick={distributeEvenly}
          className="onboarding-btn onboarding-btn-secondary btn-sm mt-4"
        >
          Distribute Evenly
        </button>

        {/* Visual Progress Bar */}
        <div className="target-progress">
          <div className="target-progress-bar">
            <div
              className={`target-progress-fill ${total > 100 ? 'overfilled' : isValid ? 'valid' : ''}`}
              style={{ width: `${Math.min(total, 100)}%` }}
            />
          </div>
          <div className={`target-progress-label ${isValid ? 'valid' : total > 100 ? 'error' : ''}`}>
            {total.toFixed(1)}% of 100%
            {isValid && (
              <svg className="w-5 h-5 ml-2 inline" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 4: Choose Mode
function Step4ChooseMode({ mode, setMode, modeAmount, setModeAmount }) {
  const modes = [
    {
      id: 'standard',
      name: 'Standard Rebalancing',
      description: 'Buy and sell to reach your target allocations',
      bestFor: 'Regular portfolio rebalancing',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      id: 'contribution',
      name: 'Add Money',
      description: 'Deploy new cash across your holdings',
      bestFor: 'Contributing to your portfolio',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'withdrawal',
      name: 'Withdraw Funds',
      description: 'Sell holdings while maintaining balance',
      bestFor: 'Taking money out of your portfolio',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="wizard-step">
      <h2 className="wizard-step-title">Choose Rebalancing Mode</h2>
      <p className="wizard-step-subtitle">
        Select how you want to rebalance your portfolio
      </p>

      <div className="mode-cards">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`mode-card ${mode === m.id ? 'selected' : ''}`}
          >
            <div className="mode-card-icon">{m.icon}</div>
            <h3 className="mode-card-title">{m.name}</h3>
            <p className="mode-card-description">{m.description}</p>
            <div className="mode-card-bestfor">
              <span className="mode-card-bestfor-label">Best for:</span>
              <span className="mode-card-bestfor-text">{m.bestFor}</span>
            </div>
          </button>
        ))}
      </div>

      {(mode === 'contribution' || mode === 'withdrawal') && (
        <div className="mode-amount-input">
          <label className="mode-amount-label">
            Amount to {mode === 'contribution' ? 'add' : 'withdraw'} ($)
          </label>
          <input
            type="number"
            value={modeAmount}
            onChange={(e) => setModeAmount(e.target.value)}
            placeholder="e.g., 5000"
            className="mode-amount-field"
            min="0"
            step="0.01"
          />
        </div>
      )}
    </div>
  );
}

// Step 5: Results with Celebration
function Step5Results({ results, onFinish }) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!results) return <div>Calculating...</div>;

  const buyActions = results.positions.filter(p => p.action === 'BUY');
  const sellActions = results.positions.filter(p => p.action === 'SELL');
  const totalBuy = buyActions.reduce((sum, p) => sum + p.difference, 0);
  const totalSell = Math.abs(sellActions.reduce((sum, p) => sum + p.difference, 0));

  return (
    <div className="wizard-step wizard-step-results">
      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#0A2540', '#10B981', '#F59E0B', '#0066FF', '#8B5CF6'][i % 5]
              }}
            />
          ))}
        </div>
      )}

      <div className="results-celebration">
        <div className="results-checkmark">
          <svg className="w-20 h-20 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="results-title">Great job! Your first rebalancing is complete!</h2>
        <p className="results-subtitle">
          Here's what you need to do to reach your target allocation:
        </p>
      </div>

      <div className="results-summary">
        <div className="results-summary-card">
          <div className="results-summary-label">Total Portfolio Value</div>
          <div className="results-summary-value">${results.totalValue.toLocaleString()}</div>
        </div>
        {totalBuy > 0 && (
          <div className="results-summary-card buy">
            <div className="results-summary-label">Total to Buy</div>
            <div className="results-summary-value">${totalBuy.toLocaleString()}</div>
          </div>
        )}
        {totalSell > 0 && (
          <div className="results-summary-card sell">
            <div className="results-summary-label">Total to Sell</div>
            <div className="results-summary-value">${totalSell.toLocaleString()}</div>
          </div>
        )}
      </div>

      <div className="results-actions-preview">
        <h3 className="results-actions-title">Recommended Actions:</h3>
        <div className="results-actions-list">
          {results.positions.filter(p => p.action !== 'HOLD').slice(0, 3).map((pos, idx) => (
            <div key={idx} className={`results-action-item ${pos.action.toLowerCase()}`}>
              <span className="results-action-ticker">{pos.ticker}</span>
              <span className="results-action-text">
                {pos.action} ${Math.abs(pos.difference).toLocaleString()}
              </span>
            </div>
          ))}
          {results.positions.filter(p => p.action !== 'HOLD').length > 3 && (
            <div className="results-action-more">
              +{results.positions.filter(p => p.action !== 'HOLD').length - 3} more actions
            </div>
          )}
        </div>
      </div>

      <div className="results-finish">
        <button
          onClick={onFinish}
          className="onboarding-btn onboarding-btn-primary onboarding-btn-lg"
        >
          Finish Tutorial
        </button>
        <p className="results-finish-note">
          You'll see the complete results in the calculator view
        </p>
      </div>
    </div>
  );
}
