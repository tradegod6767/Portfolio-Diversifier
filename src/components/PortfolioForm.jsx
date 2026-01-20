import { useState, useEffect, useRef } from 'react';
import { calculateRebalancing } from '../utils/calculations';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { savePortfolio, getSavedPortfolios } from '../utils/portfolioStorage';
import SavePortfolioModal from './SavePortfolioModal';
import Tooltip from './Tooltip';
import { supabase } from '../lib/supabase';
import SamplePortfolioSelector from './SamplePortfolioSelector';
import SamplePortfolioBanner from './SamplePortfolioBanner';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { useToast } from '../context/ToastContext';

import { Button, Card } from "./ui";
import SwipeableItem from "./SwipeableItem";
import "./PortfolioFormStyles.css";

// Market scenario presets with icons and colors
const MARKET_SCENARIOS = [
  { id: 'none', label: 'No change', description: 'Keep current values', icon: '○', color: 'slate' },
  { id: 'up10', label: '+10% all positions', description: 'Moderate growth', icon: '↗', color: 'emerald' },
  { id: 'down10', label: '-10% all positions', description: 'Market correction', icon: '↘', color: 'red' },
  { id: 'up20', label: '+20% all positions', description: 'Strong bull market', icon: '⬆', color: 'emerald' },
  { id: 'down20', label: '-20% all positions', description: 'Bear market', icon: '⬇', color: 'red' },
  { id: 'tech_up', label: 'Tech +20%, others flat', description: 'Tech rally', icon: '💻', color: 'blue' },
  { id: 'tech_down', label: 'Tech -20%, others flat', description: 'Tech selloff', icon: '📉', color: 'orange' },
];

// Tickers considered "tech" for scenario purposes
const TECH_TICKERS = ['QQQ', 'VGT', 'XLK', 'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'META', 'NVDA', 'AMZN', 'TSLA'];

function PortfolioForm({ onCalculate, onCalculateStart, onImportClick, onLoadClick, loadedPositions, user, isPro }) {
  // Undo/Redo state for positions
  const {
    state: positions,
    pushState: pushPositions,
    undo,
    redo,
    reset: resetPositions,
    canUndo,
    canRedo,
    lastAction,
  } = useUndoRedo([{ id: 1, ticker: '', amount: '', targetPercent: '' }]);

  // Toast notifications
  const { addToast } = useToast();

  // Track pending edits for blur-based history (field -> { positionId, oldValue })
  const pendingEditRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedPortfolios, setSavedPortfolios] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [rebalancingMode, setRebalancingMode] = useState('standard');
  const [modeAmount, setModeAmount] = useState('');
  const [loadedSample, setLoadedSample] = useState(null);

  // Internal positions state for live editing (synced to undo history on blur)
  const [livePositions, setLivePositions] = useState(positions);

  // Simulator mode state (kept separate from real portfolio)
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);
  const [simMarketScenario, setSimMarketScenario] = useState('none');
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false);

  // Sync livePositions when positions changes (from undo/redo or external load)
  useEffect(() => {
    setLivePositions(positions);
  }, [positions]);

  useEffect(() => {
    loadSavedPortfolios();
  }, [user, isPro]);

  useEffect(() => {
    if (loadedPositions && loadedPositions.length > 0) {
      resetPositions(loadedPositions);
      setError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loadedPositions, resetPositions]);

  // Show toast notification on undo
  useEffect(() => {
    if (lastAction) {
      addToast(`Undid: ${lastAction}`, 'info', 3000);
    }
  }, [lastAction, addToast]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+Z (undo) or Ctrl+Shift+Z (redo)
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
          if (e.shiftKey) {
            // Ctrl+Shift+Z = Redo
            if (canRedo) {
              e.preventDefault();
              redo();
            }
          } else {
            // Ctrl+Z = Undo
            if (canUndo) {
              e.preventDefault();
              undo();
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  const loadSavedPortfolios = async () => {
    const portfolios = await getSavedPortfolios(user, isPro);
    setSavedPortfolios(portfolios);
  };

  const addPosition = () => {
    const newPositions = [
      ...livePositions,
      { id: Date.now(), ticker: '', amount: '', targetPercent: '' }
    ];
    setLivePositions(newPositions);
    pushPositions(newPositions, 'Add holding');
  };

  const removePosition = (id) => {
    if (livePositions.length > 1) {
      const newPositions = livePositions.filter(pos => pos.id !== id);
      setLivePositions(newPositions);
      pushPositions(newPositions, 'Remove holding');
    }
  };

  const validateTicker = (ticker) => {
    if (!ticker || ticker.trim() === '') {
      return '' // Allow empty during typing
    }

    // Clean and uppercase
    const cleanTicker = ticker.trim().toUpperCase()

    // Allow CASH as special case
    if (cleanTicker === 'CASH') {
      return cleanTicker
    }

    // Validate format: 1-5 uppercase letters only
    const tickerRegex = /^[A-Z]{1,5}$/

    if (!tickerRegex.test(cleanTicker)) {
      return null // Invalid ticker
    }

    return cleanTicker
  }

  const updatePosition = (id, field, value) => {
    // Clear sample state when user manually edits
    if (loadedSample) {
      setLoadedSample(null);
    }

    if (field === 'ticker') {
      const validated = validateTicker(value)
      if (validated === null) {
        // Invalid ticker - show error and don't update
        setError('Invalid ticker symbol. Please use 1-5 letters only (e.g., VTI, BND, AAPL)')
        return
      }
      setError('') // Clear error if valid
      value = validated
    }

    // Update livePositions for immediate feedback
    setLivePositions(livePositions.map(pos =>
      pos.id === id ? { ...pos, [field]: value } : pos
    ));
  };

  // Handle field focus - store the current state before editing
  const handleFieldFocus = () => {
    // Store current positions state when user starts editing
    pendingEditRef.current = JSON.stringify(livePositions);
  };

  // Handle field blur - push to history if value changed
  const handleFieldBlur = (field) => {
    if (pendingEditRef.current) {
      const oldPositions = pendingEditRef.current;
      const newPositions = JSON.stringify(livePositions);

      // Only push to history if there was an actual change
      if (oldPositions !== newPositions) {
        const actionName = field === 'ticker' ? 'Edit ticker'
          : field === 'amount' ? 'Edit amount'
          : 'Edit target %';
        pushPositions(livePositions, actionName);
      }
      pendingEditRef.current = null;
    }
  };

  const loadExamplePortfolio = () => {
    const examplePositions = [
      { id: 1, ticker: 'VTI', amount: '30000', targetPercent: '60' },
      { id: 2, ticker: 'BND', amount: '15000', targetPercent: '30' },
      { id: 3, ticker: 'CASH', amount: '5000', targetPercent: '10' }
    ];
    setLivePositions(examplePositions);
    pushPositions(examplePositions, 'Load example portfolio');
    setError('');
  };

  const handleLoadSample = (sample) => {
    const positionsWithIds = sample.positions.map((pos, index) => ({
      ...pos,
      id: Date.now() + index
    }));
    setLivePositions(positionsWithIds);
    pushPositions(positionsWithIds, 'Load sample portfolio');
    setLoadedSample(sample.name);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearSample = () => {
    setLoadedSample(null);
    const emptyPositions = [{ id: Date.now(), ticker: '', amount: '', targetPercent: '' }];
    setLivePositions(emptyPositions);
    pushPositions(emptyPositions, 'Clear portfolio');
    setError('');
  };

  // Apply simulation scenario to a copy of positions
  const applySimulationScenario = (originalPositions) => {
    // Deep copy positions and apply market scenario
    const simPositions = originalPositions.map(p => {
      const amount = parseFloat(p.amount) || 0;
      let multiplier = 1;
      const isTech = TECH_TICKERS.includes(p.ticker.toUpperCase());

      switch (simMarketScenario) {
        case 'up10':
          multiplier = 1.10;
          break;
        case 'down10':
          multiplier = 0.90;
          break;
        case 'up20':
          multiplier = 1.20;
          break;
        case 'down20':
          multiplier = 0.80;
          break;
        case 'tech_up':
          multiplier = isTech ? 1.20 : 1;
          break;
        case 'tech_down':
          multiplier = isTech ? 0.80 : 1;
          break;
        default:
          multiplier = 1;
      }

      return {
        ...p,
        amount: (amount * multiplier).toString()
      };
    });

    return simPositions;
  };

  // Reset simulator inputs
  const resetSimulator = () => {
    setSimMarketScenario('none');
  };

  // Apply simulation results to real portfolio mode
  const applySimulationToReal = (simulatedPositions) => {
    const newPositions = simulatedPositions.map(p => ({
      ...p,
      amount: parseFloat(p.amount).toFixed(2)
    }));
    setLivePositions(newPositions);
    pushPositions(newPositions, 'Apply simulation');
    setIsSimulatorMode(false);
    resetSimulator();
  };

  const handleSavePortfolio = async (name) => {
    try {
      await savePortfolio(name, livePositions, user, isPro);
      await loadSavedPortfolios();
      setShowSaveModal(false);
    } catch (err) {
      throw err;
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Commit any pending field edits before submission
    if (pendingEditRef.current) {
      const oldPositions = pendingEditRef.current;
      const newPositions = JSON.stringify(livePositions);
      if (oldPositions !== newPositions) {
        pushPositions(livePositions, 'Edit field');
      }
      pendingEditRef.current = null;
    }

    // Get positions to use (apply simulation if in simulator mode)
    let positionsToUse = livePositions;
    let simulatedPositions = null;

    if (isSimulatorMode) {
      // Apply scenario to a copy of positions
      simulatedPositions = applySimulationScenario(livePositions);
      positionsToUse = simulatedPositions;
    }

    // Validation
    const validPositions = positionsToUse.filter(p => p.ticker && p.amount && p.targetPercent);

    if (validPositions.length === 0) {
      setError('Please add at least one complete position');
      return;
    }

    const totalTarget = validPositions.reduce((sum, p) => sum + parseFloat(p.targetPercent), 0);
    if (Math.abs(totalTarget - 100) > 0.01) {
      const diff = totalTarget - 100;
      if (diff > 0) {
        setError(`Your target allocations add up to ${totalTarget.toFixed(2)}%, which is ${Math.abs(diff).toFixed(2)}% too high. Please reduce your target percentages so they add up to exactly 100%.`);
      } else {
        setError(`Your target allocations add up to ${totalTarget.toFixed(2)}%, which is ${Math.abs(diff).toFixed(2)}% too low. Please increase your target percentages so they add up to exactly 100%.`);
      }
      return;
    }

    // Validate contribution/withdrawal amount (only in real mode)
    if (!isSimulatorMode && (rebalancingMode === 'contribution' || rebalancingMode === 'withdrawal') && (!modeAmount || parseFloat(modeAmount) <= 0)) {
      const actionType = rebalancingMode === 'contribution' ? 'contribution' : 'withdrawal';
      setError(`You need to enter how much money you want to ${rebalancingMode === 'contribution' ? 'add to' : 'withdraw from'} your portfolio. Please enter an amount greater than $0.`);
      return;
    }

    // Validate withdrawal doesn't exceed portfolio value (only in real mode)
    if (!isSimulatorMode && rebalancingMode === 'withdrawal') {
      const totalValue = validPositions.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const withdrawalAmount = parseFloat(modeAmount);
      if (withdrawalAmount >= totalValue) {
        setError(`You're trying to withdraw $${withdrawalAmount.toLocaleString()}, but your total portfolio is only worth $${totalValue.toLocaleString()}. You can't withdraw more than your total portfolio value. Please enter a smaller amount.`);
        return;
      }
    }

    setLoading(true);
    if (onCalculateStart) {
      onCalculateStart();
    }

    try {
      // Calculate rebalancing with selected mode and amount
      // In simulator mode, always use 'standard' rebalancing
      const mode = isSimulatorMode ? 'standard' : rebalancingMode;
      const amount = (!isSimulatorMode && (rebalancingMode === 'contribution' || rebalancingMode === 'withdrawal'))
        ? parseFloat(modeAmount)
        : 0;
      const rebalancingData = calculateRebalancing(validPositions, mode, amount);

      // Get AI explanation from Claude
      const aiExplanation = await getAIExplanation(rebalancingData);

      // Build scenario description for simulation
      let scenarioDescription = null;
      if (isSimulatorMode) {
        const scenario = MARKET_SCENARIOS.find(s => s.id === simMarketScenario);
        scenarioDescription = scenario && scenario.id !== 'none'
          ? scenario.label
          : 'No changes applied';
      }

      onCalculate({
        ...rebalancingData,
        aiExplanation,
        isSimulation: isSimulatorMode,
        scenarioDescription,
        simulatedPositions: simulatedPositions,
        originalPositions: isSimulatorMode ? positions : null,
        onApplyScenario: isSimulatorMode ? () => applySimulationToReal(simulatedPositions) : null
      });
    } catch {
      setError('Failed to calculate rebalancing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAIExplanation = async (data) => {
    try {
      // SECURITY FIX: Send auth token instead of client-controlled isPro flag
      // The server will verify the actual subscription status from the database
      const headers = {};

      // Get Supabase session token if user is logged in
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/explain`,
        { rebalancingData: data },
        { headers }
      );
      return response.data.explanation;
    } catch {
      return 'Rebalancing your portfolio helps maintain your desired risk level and investment strategy by adjusting positions to match your target allocations.';
    }
  };

  return (
    <>
      <SavePortfolioModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSavePortfolio}
        existingNames={savedPortfolios.map(p => p.name)}
      />

      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
        {loadedSample && (
          <SamplePortfolioBanner
            sampleName={loadedSample}
            onClear={handleClearSample}
          />
        )}

        {/* Mode Toggle: Rebalance Now vs Simulate Scenario */}
        <div className="border-2 rounded-xl p-1.5 flex shadow-sm transition-all duration-300 hover:shadow-md" style={{ backgroundColor: 'var(--bg-card-elevated)', borderColor: 'var(--border-color)' }}>
          <button
            type="button"
            onClick={() => {
              setIsSimulatorMode(false);
              resetSimulator();
            }}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ease-out flex items-center justify-center gap-2 ${
              !isSimulatorMode
                ? 'bg-[#0A2540] text-white shadow-md scale-[1.02]'
                : 'hover:scale-[1.01]'
            }`}
            style={isSimulatorMode ? { color: 'var(--text-secondary)', backgroundColor: 'transparent' } : {}}
          >
            <svg className={`w-5 h-5 transition-transform duration-300 ${!isSimulatorMode ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Rebalance Now
          </button>
          <button
            type="button"
            onClick={() => setIsSimulatorMode(true)}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ease-out flex items-center justify-center gap-2 ${
              isSimulatorMode
                ? 'bg-teal-600 text-white shadow-md scale-[1.02]'
                : 'hover:scale-[1.01]'
            }`}
            style={!isSimulatorMode ? { color: 'var(--text-secondary)', backgroundColor: 'transparent' } : {}}
          >
            <svg className={`w-5 h-5 transition-transform duration-300 ${isSimulatorMode ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            What If Simulator
          </button>
        </div>

        {/* Simulator Mode Inputs */}
        {isSimulatorMode && (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-teal-100 rounded-lg animate-pulse">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-teal-900">Scenario Simulator</h3>
            </div>
            <p className="text-sm text-teal-700 mb-4">
              Test how different scenarios would affect your portfolio rebalancing. Your actual portfolio data remains unchanged.
            </p>

            <div>
              {/* Market Scenario - Custom Dropdown */}
              <div className="bg-white rounded-lg p-4 border border-teal-200 transition-all duration-300 hover:shadow-md hover:border-teal-300">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Market Change
                </label>
                <div className="relative">
                  {/* Dropdown Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsScenarioDropdownOpen(!isScenarioDropdownOpen)}
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      isScenarioDropdownOpen
                        ? 'border-teal-500 ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    style={{ backgroundColor: 'var(--bg-input)' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg ${
                        MARKET_SCENARIOS.find(s => s.id === simMarketScenario)?.color === 'emerald' ? 'text-emerald-500' :
                        MARKET_SCENARIOS.find(s => s.id === simMarketScenario)?.color === 'red' ? 'text-red-500' :
                        MARKET_SCENARIOS.find(s => s.id === simMarketScenario)?.color === 'blue' ? 'text-blue-500' :
                        MARKET_SCENARIOS.find(s => s.id === simMarketScenario)?.color === 'orange' ? 'text-orange-500' :
                        'text-slate-400'
                      }`}>
                        {MARKET_SCENARIOS.find(s => s.id === simMarketScenario)?.icon}
                      </span>
                      <div className="text-left">
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {MARKET_SCENARIOS.find(s => s.id === simMarketScenario)?.label}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {MARKET_SCENARIOS.find(s => s.id === simMarketScenario)?.description}
                        </div>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${isScenarioDropdownOpen ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--text-muted)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu - Opens upward */}
                  {isScenarioDropdownOpen && (
                    <div
                      className="absolute z-50 w-full bottom-full mb-2 rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-200"
                      style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}
                    >
                      <div className="max-h-64 overflow-y-auto">
                        {MARKET_SCENARIOS.map((scenario, index) => (
                          <button
                            key={scenario.id}
                            type="button"
                            onClick={() => {
                              setSimMarketScenario(scenario.id);
                              setIsScenarioDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-150 ${
                              simMarketScenario === scenario.id
                                ? 'bg-teal-50 border-l-4 border-teal-500'
                                : 'hover:bg-slate-50 border-l-4 border-transparent'
                            }`}
                            style={{ borderBottom: index !== MARKET_SCENARIOS.length - 1 ? '1px solid var(--border-color)' : 'none' }}
                          >
                            <span className={`text-xl w-8 h-8 flex items-center justify-center rounded-lg ${
                              scenario.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                              scenario.color === 'red' ? 'bg-red-100 text-red-600' :
                              scenario.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                              scenario.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {scenario.icon}
                            </span>
                            <div className="flex-1 text-left">
                              <div className={`font-semibold text-sm ${
                                simMarketScenario === scenario.id ? 'text-teal-700' : ''
                              }`} style={simMarketScenario !== scenario.id ? { color: 'var(--text-primary)' } : {}}>
                                {scenario.label}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {scenario.description}
                              </div>
                            </div>
                            {simMarketScenario === scenario.id && (
                              <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Click outside to close */}
                  {isScenarioDropdownOpen && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsScenarioDropdownOpen(false)}
                    />
                  )}
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Simulate market moves</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-teal-100/50 rounded-lg border border-teal-200/50 transition-all duration-300 hover:bg-teal-100">
              <p className="text-xs text-teal-800">
                <strong>Tip:</strong> See how market changes affect your rebalancing. For example: "What trades would I need if the market drops 20%?"
              </p>
            </div>
          </div>
        )}

        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Enter Your Portfolio Positions
            </h2>
            <SamplePortfolioSelector onSelectSample={handleLoadSample} />
          </div>

          {/* Rebalancing Mode Selector - Only show in real mode */}
          {!isSimulatorMode && (
          <div className="mb-6 p-6 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--bg-card-elevated)', border: '1px solid var(--border-color)' }}>
            <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>
              Choose Action
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <button
                type="button"
                onClick={() => {
                  setRebalancingMode('standard');
                  setModeAmount('');
                }}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  rebalancingMode === 'standard'
                    ? 'bg-[#0A2540] border-[#0A2540] text-white shadow-md'
                    : 'hover:border-blue-400'
                }`}
                style={rebalancingMode !== 'standard' ? { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color-strong)', color: 'var(--text-primary)' } : {}}
              >
                <div className="font-bold mb-1 flex items-center">
                  Rebalance
                  <Tooltip
                    text="Suggests both buys and sells to perfectly match your targets"
                    position="bottom-end"
                    className={rebalancingMode === 'standard' ? 'text-slate-100 hover:text-white' : ''}
                    style={rebalancingMode !== 'standard' ? { color: 'var(--text-muted)' } : {}}
                  />
                </div>
                <div className={`text-xs ${rebalancingMode === 'standard' ? 'text-slate-100' : ''}`} style={rebalancingMode !== 'standard' ? { color: 'var(--text-secondary)' } : {}}>
                  Buy and sell to reach targets
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRebalancingMode('contribution')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  rebalancingMode === 'contribution'
                    ? 'bg-[#0A2540] border-[#0A2540] text-white shadow-md'
                    : 'hover:border-blue-400'
                }`}
                style={rebalancingMode !== 'contribution' ? { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color-strong)', color: 'var(--text-primary)' } : {}}
              >
                <div className="font-bold mb-1 flex items-center">
                  Add Money
                  <Tooltip
                    text="Tells you how to invest new money optimally"
                    position="bottom-end"
                    className={rebalancingMode === 'contribution' ? 'text-slate-100 hover:text-white' : ''}
                    style={rebalancingMode !== 'contribution' ? { color: 'var(--text-muted)' } : {}}
                  />
                </div>
                <div className={`text-xs ${rebalancingMode === 'contribution' ? 'text-slate-100' : ''}`} style={rebalancingMode !== 'contribution' ? { color: 'var(--text-secondary)' } : {}}>
                  Invest new contribution
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRebalancingMode('withdrawal')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  rebalancingMode === 'withdrawal'
                    ? 'bg-[#0A2540] border-[#0A2540] text-white shadow-md'
                    : 'hover:border-blue-400'
                }`}
                style={rebalancingMode !== 'withdrawal' ? { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color-strong)', color: 'var(--text-primary)' } : {}}
              >
                <div className="font-bold mb-1 flex items-center">
                  Withdraw
                  <Tooltip
                    text="Tells you what to sell when you need cash"
                    position="bottom-end"
                    className={rebalancingMode === 'withdrawal' ? 'text-slate-100 hover:text-white' : ''}
                    style={rebalancingMode !== 'withdrawal' ? { color: 'var(--text-muted)' } : {}}
                  />
                </div>
                <div className={`text-xs ${rebalancingMode === 'withdrawal' ? 'text-slate-100' : ''}`} style={rebalancingMode !== 'withdrawal' ? { color: 'var(--text-secondary)' } : {}}>
                  Take money out
                </div>
              </button>
            </div>

            {/* Amount Input for Contribution/Withdrawal */}
            {(rebalancingMode === 'contribution' || rebalancingMode === 'withdrawal') && (
              <div className="border-2 rounded-lg p-4" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color-strong)' }}>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {rebalancingMode === 'contribution' ? 'Contribution Amount ($)' : 'Withdrawal Amount ($)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={rebalancingMode === 'contribution' ? '5000' : '3000'}
                  value={modeAmount}
                  onChange={(e) => setModeAmount(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-lg font-semibold"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color-strong)', color: 'var(--text-primary)' }}
                  required={rebalancingMode === 'contribution' || rebalancingMode === 'withdrawal'}
                />
                <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {rebalancingMode === 'contribution'
                    ? 'Enter the amount you want to invest. We\'ll show you how to allocate it to move toward your target allocations.'
                    : 'Enter the amount you need to withdraw. We\'ll show you what to sell to minimize drift from your targets.'}
                </p>
              </div>
            )}
          </div>
          )}

          {/* Undo/Redo and Save/Load/Import Portfolio Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Undo Button */}
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className="portfolio-action-btn portfolio-undo-btn"
              title="Undo (Ctrl+Z)"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Undo
            </button>

            {/* Redo Button */}
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className="portfolio-action-btn portfolio-redo-btn"
              title="Redo (Ctrl+Shift+Z)"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
              Redo
            </button>

            {/* Divider */}
            <div className="w-px mx-1 self-stretch" style={{ backgroundColor: 'var(--border-color)' }}></div>

            <button
              type="button"
              onClick={() => setShowSaveModal(true)}
              title="Save portfolio (S)"
              className="portfolio-action-btn portfolio-save-btn"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Portfolio
            </button>

            <button
              type="button"
              onClick={onLoadClick}
              className="portfolio-action-btn portfolio-load-btn"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Load Portfolio {savedPortfolios.length > 0 && `(${savedPortfolios.length})`}
            </button>

            <button
              type="button"
              onClick={onImportClick}
              className="portfolio-action-btn portfolio-import-btn"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import Portfolio
            </button>
          </div>

        {/* Empty holdings guidance */}
        {livePositions.length === 1 && !livePositions[0].ticker && !livePositions[0].amount && !livePositions[0].targetPercent && (
          <div className="mb-6 p-5 rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-card)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--accent-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                  Add your holdings to get started
                </h4>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Enter the tickers and amounts you currently own. For example: VTI for US stocks, BND for bonds, or CASH for cash holdings.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs font-medium rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                    Ticker: VTI, BND, AAPL...
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                    Value: $10,000
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                    Target: 60%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Running Total Display - Shows current allocation total */}
        {(() => {
          const totalTarget = livePositions.reduce((sum, p) => sum + (parseFloat(p.targetPercent) || 0), 0);
          const isValid = Math.abs(totalTarget - 100) < 0.01;
          const hasAnyTarget = livePositions.some(p => p.targetPercent);

          if (!hasAnyTarget) return null;

          return (
            <div className={`mb-4 p-4 rounded-lg border-2 transition-all duration-300 ${
              isValid
                ? 'border-emerald-200 bg-emerald-50 '
                : 'border-amber-300 bg-amber-50 '
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isValid ? (
                    <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={`font-semibold ${isValid ? 'text-emerald-800' : 'text-amber-800'}`}>
                    Total Allocation
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold font-mono ${isValid ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {totalTarget.toFixed(1)}%
                  </span>
                  {!isValid && (
                    <span className="text-sm text-amber-600 font-medium">
                      {totalTarget > 100 ? `${(totalTarget - 100).toFixed(1)}% over` : `${(100 - totalTarget).toFixed(1)}% under`}
                    </span>
                  )}
                </div>
              </div>
              {/* Progress bar visualization */}
              <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${isValid ? 'bg-emerald-500' : totalTarget > 100 ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(100, totalTarget)}%` }}
                />
              </div>
            </div>
          );
        })()}

        {livePositions.map((position, index) => (
          <SwipeableItem
            key={position.id}
            onDelete={() => removePosition(position.id)}
            disabled={livePositions.length === 1}
            confirmDelete={true}
            deleteLabel="Delete"
            className="mb-4"
          >
            <div className="p-4 md:p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--bg-card-elevated)', border: '1px solid var(--border-color)' }}>
              {/* Mobile: Stack vertically, Desktop: Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Ticker Symbol */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Ticker Symbol
                </label>
                <input
                  type="text"
                  placeholder="AAPL"
                  value={position.ticker}
                  onChange={(e) => updatePosition(position.id, 'ticker', e.target.value.toUpperCase())}
                  onFocus={handleFieldFocus}
                  onBlur={() => handleFieldBlur('ticker')}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full px-4 py-3 min-h-[48px] border-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold uppercase text-base"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color-strong)', color: 'var(--text-primary)' }}
                  required
                />
              </div>

              {/* Current Value */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Current Value ($)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*\.?[0-9]*"
                  placeholder="10000"
                  value={position.amount}
                  onChange={(e) => {
                    // Allow only numbers and decimal point
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    updatePosition(position.id, 'amount', value);
                  }}
                  onFocus={handleFieldFocus}
                  onBlur={() => handleFieldBlur('amount')}
                  className="w-full px-4 py-3 min-h-[48px] border-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-base font-mono"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color-strong)', color: 'var(--text-primary)' }}
                  required
                />
              </div>

              {/* Target Allocation with Slider */}
              <div>
                <label className="block text-sm font-bold mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  Target (%)
                  <Tooltip text="Your ideal percentage for this holding. All targets should add up to 100%" />
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    placeholder="25"
                    value={position.targetPercent}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      updatePosition(position.id, 'targetPercent', value);
                    }}
                    onFocus={handleFieldFocus}
                    onBlur={() => handleFieldBlur('targetPercent')}
                    className="w-full px-4 py-3 min-h-[48px] border-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-base font-mono"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color-strong)', color: 'var(--text-primary)' }}
                    required
                  />
                  {/* Slider for quick adjustment - visible on mobile */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={position.targetPercent || 0}
                    onChange={(e) => updatePosition(position.id, 'targetPercent', e.target.value)}
                    onMouseDown={handleFieldFocus}
                    onTouchStart={handleFieldFocus}
                    onMouseUp={() => handleFieldBlur('targetPercent')}
                    onTouchEnd={() => handleFieldBlur('targetPercent')}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer md:hidden"
                    style={{
                      background: `linear-gradient(to right, #0A2540 0%, #0A2540 ${position.targetPercent || 0}%, #e2e8f0 ${position.targetPercent || 0}%, #e2e8f0 100%)`
                    }}
                  />
                </div>
              </div>

              {/* Remove Button - hidden on mobile (use swipe instead) */}
              <div className="hidden md:flex items-end">
                <button
                  type="button"
                  onClick={() => removePosition(position.id)}
                  disabled={livePositions.length === 1}
                  className="w-full px-4 py-3 min-h-[48px] bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-200 shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Remove</span>
                </button>
              </div>

              {/* Mobile swipe hint - only show on first item */}
              {index === 0 && livePositions.length > 1 && (
                <div className="md:hidden col-span-1 flex items-center justify-center text-xs pt-2" style={{ color: 'var(--text-muted)' }}>
                  <svg className="w-4 h-4 mr-1 swipe-hint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Swipe left to delete
                </div>
              )}
              </div>
            </div>
          </SwipeableItem>
        ))}

        {/* Add Position Button - Sticky on mobile, positioned above bottom nav */}
        <div
          className="md:relative fixed left-0 right-0 md:bottom-auto md:left-auto md:right-auto p-4 md:p-0 md:mt-4 z-40 md:z-auto"
          style={{
            bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
            backgroundColor: 'var(--bg-primary)'
          }}
        >
          <div className="md:hidden absolute inset-x-0 -top-4 h-4 bg-gradient-to-t from-[var(--bg-primary)] to-transparent pointer-events-none" />
          <button
            type="button"
            onClick={addPosition}
            title="Add new holding (N)"
            className="w-full md:w-auto px-6 py-4 md:py-3 min-h-[52px] md:min-h-0 border-2 font-semibold rounded-lg transition duration-200 shadow-md md:shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] hover:border-blue-400"
            style={{ backgroundColor: 'var(--bg-card-elevated)', borderColor: 'var(--border-color-strong)', color: 'var(--text-primary)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Holding
          </button>
        </div>

        {/* Spacer for sticky button + bottom nav on mobile */}
        <div className="h-52 md:hidden" />
      </div>

      {error && (
        <div className="p-4 rounded-lg shadow-md md:shadow-sm flex items-start gap-3 md:relative fixed md:bottom-auto bottom-24 left-4 right-4 z-50 md:z-auto animate-in slide-in-from-bottom-2 duration-300" style={{ backgroundColor: 'var(--error-bg)', border: '2px solid var(--error-border)' }}>
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--error)' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="font-semibold text-base" style={{ color: 'var(--error)' }}>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        title={isSimulatorMode ? "Run simulation (R)" : "Calculate rebalancing (R)"}
        className={`w-full font-bold text-lg py-4 px-8 rounded-xl transition-all duration-300 shadow-lg disabled:cursor-not-allowed disabled:opacity-50 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${
          isSimulatorMode
            ? 'bg-teal-600 hover:bg-teal-700 text-white'
            : 'bg-[#0A2540] hover:bg-[#0D2F52] text-white'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Calculating...
          </span>
        ) : isSimulatorMode ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Run Simulation
          </span>
        ) : (
          'Calculate Rebalancing'
        )}
      </button>
      </form>
    </>
  );
}

export default PortfolioForm;
