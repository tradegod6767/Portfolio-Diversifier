import { useState, useEffect } from 'react';
import { calculateRebalancing } from '../utils/calculations';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { savePortfolio, getSavedPortfolios } from '../utils/portfolioStorage';
import SavePortfolioModal from './SavePortfolioModal';
import Tooltip from './Tooltip';

function PortfolioForm({ onCalculate, onImportClick, onLoadClick, loadedPositions }) {
  const [positions, setPositions] = useState([
    { id: 1, ticker: '', amount: '', targetPercent: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedPortfolios, setSavedPortfolios] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [rebalancingMode, setRebalancingMode] = useState('standard');
  const [modeAmount, setModeAmount] = useState('');

  useEffect(() => {
    loadSavedPortfolios();
  }, []);

  useEffect(() => {
    if (loadedPositions) {
      setPositions(loadedPositions);
      setError('');
    }
  }, [loadedPositions]);

  const loadSavedPortfolios = () => {
    setSavedPortfolios(getSavedPortfolios());
  };

  const addPosition = () => {
    setPositions([
      ...positions,
      { id: Date.now(), ticker: '', amount: '', targetPercent: '' }
    ]);
  };

  const removePosition = (id) => {
    if (positions.length > 1) {
      setPositions(positions.filter(pos => pos.id !== id));
    }
  };

  const updatePosition = (id, field, value) => {
    setPositions(positions.map(pos =>
      pos.id === id ? { ...pos, [field]: value } : pos
    ));
  };

  const loadExamplePortfolio = () => {
    setPositions([
      { id: 1, ticker: 'VTI', amount: '30000', targetPercent: '60' },
      { id: 2, ticker: 'BND', amount: '15000', targetPercent: '30' },
      { id: 3, ticker: 'CASH', amount: '5000', targetPercent: '10' }
    ]);
    setError('');
  };

  const handleSavePortfolio = (name) => {
    try {
      savePortfolio(name, positions);
      loadSavedPortfolios();
      setShowSaveModal(false);
    } catch (err) {
      throw err;
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const validPositions = positions.filter(p => p.ticker && p.amount && p.targetPercent);

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

    // Validate contribution/withdrawal amount
    if ((rebalancingMode === 'contribution' || rebalancingMode === 'withdrawal') && (!modeAmount || parseFloat(modeAmount) <= 0)) {
      const actionType = rebalancingMode === 'contribution' ? 'contribution' : 'withdrawal';
      setError(`You need to enter how much money you want to ${rebalancingMode === 'contribution' ? 'add to' : 'withdraw from'} your portfolio. Please enter an amount greater than $0.`);
      return;
    }

    // Validate withdrawal doesn't exceed portfolio value
    if (rebalancingMode === 'withdrawal') {
      const totalValue = validPositions.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const withdrawalAmount = parseFloat(modeAmount);
      if (withdrawalAmount >= totalValue) {
        setError(`You're trying to withdraw $${withdrawalAmount.toLocaleString()}, but your total portfolio is only worth $${totalValue.toLocaleString()}. You can't withdraw more than your total portfolio value. Please enter a smaller amount.`);
        return;
      }
    }

    setLoading(true);

    try {
      // Calculate rebalancing with selected mode and amount
      const amount = (rebalancingMode === 'contribution' || rebalancingMode === 'withdrawal')
        ? parseFloat(modeAmount)
        : 0;
      const rebalancingData = calculateRebalancing(validPositions, rebalancingMode, amount);

      // Get AI explanation from Claude
      const aiExplanation = await getAIExplanation(rebalancingData);

      onCalculate({
        ...rebalancingData,
        aiExplanation
      });
    } catch (err) {
      setError('Failed to calculate rebalancing. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAIExplanation = async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/explain`, {
        rebalancingData: data
      });
      return response.data.explanation;
    } catch (err) {
      console.error('Failed to get AI explanation:', err);
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Enter Your Portfolio Positions
            </h2>
            <button
              type="button"
              onClick={loadExamplePortfolio}
              className="w-full px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-xl transition duration-200 shadow-lg mb-4"
            >
              📊 Load Example Portfolio
            </button>
          </div>

          {/* Rebalancing Mode Selector */}
          <div className="mb-6 bg-gradient-to-r from-slate-50 to-slate-100 p-5 rounded-xl border-2 border-slate-300 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-3">
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
                    ? 'bg-slate-900 border-slate-700 text-white shadow-md'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-slate-400 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold mb-1">Rebalance</div>
                <div className={`text-xs ${rebalancingMode === 'standard' ? 'text-slate-100' : 'text-gray-600'}`}>
                  Buy and sell to reach targets
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRebalancingMode('contribution')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  rebalancingMode === 'contribution'
                    ? 'bg-slate-600 border-slate-700 text-white shadow-md'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold mb-1 flex items-center">
                  Add Money
                  <Tooltip text="Only buy positions, never sell. Useful for avoiding capital gains taxes when adding new funds to your portfolio." />
                </div>
                <div className={`text-xs ${rebalancingMode === 'contribution' ? 'text-slate-100' : 'text-gray-600'}`}>
                  Invest new contribution
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRebalancingMode('withdrawal')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  rebalancingMode === 'withdrawal'
                    ? 'bg-slate-600 border-slate-700 text-white shadow-md'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold mb-1">Withdraw</div>
                <div className={`text-xs ${rebalancingMode === 'withdrawal' ? 'text-slate-100' : 'text-gray-600'}`}>
                  Take money out
                </div>
              </button>
            </div>

            {/* Amount Input for Contribution/Withdrawal */}
            {(rebalancingMode === 'contribution' || rebalancingMode === 'withdrawal') && (
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {rebalancingMode === 'contribution' ? 'Contribution Amount ($)' : 'Withdrawal Amount ($)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={rebalancingMode === 'contribution' ? '5000' : '3000'}
                  value={modeAmount}
                  onChange={(e) => setModeAmount(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-slate-800 text-lg font-semibold"
                  required={rebalancingMode === 'contribution' || rebalancingMode === 'withdrawal'}
                />
                <p className="text-xs text-gray-600 mt-2">
                  {rebalancingMode === 'contribution'
                    ? 'Enter the amount you want to invest. We\'ll show you how to allocate it to move toward your target allocations.'
                    : 'Enter the amount you need to withdraw. We\'ll show you what to sell to minimize drift from your targets.'}
                </p>
              </div>
            )}
          </div>

          {/* Save/Load/Import Portfolio Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition duration-200 text-xs shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Portfolio
            </button>

            <button
              type="button"
              onClick={onLoadClick}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition duration-200 text-xs shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Load Portfolio {savedPortfolios.length > 0 && `(${savedPortfolios.length})`}
            </button>

            <button
              type="button"
              onClick={onImportClick}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition duration-200 text-xs shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import Portfolio
            </button>
          </div>

        {positions.map((position, index) => (
          <div key={position.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ticker Symbol
              </label>
              <input
                type="text"
                placeholder="AAPL"
                value={position.ticker}
                onChange={(e) => updatePosition(position.id, 'ticker', e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-slate-800 font-semibold uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Current Value ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="10000"
                value={position.amount}
                onChange={(e) => updatePosition(position.id, 'amount', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Target Allocation (%)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="25"
                value={position.targetPercent}
                onChange={(e) => updatePosition(position.id, 'targetPercent', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-slate-800"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removePosition(position.id)}
                disabled={positions.length === 1}
                className="w-full px-4 py-3 bg-slate-500 hover:bg-slate-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-200 shadow-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addPosition}
          className="mt-4 px-6 py-3 bg-white border-2 border-slate-400 hover:bg-slate-50 hover:border-slate-500 text-slate-700 font-semibold rounded-lg transition duration-200 shadow-sm"
        >
          + Add Position
        </button>
      </div>

      {error && (
        <div className="p-4 bg-slate-50 border-2 border-slate-300 rounded-xl shadow-sm">
          <p className="text-slate-800 font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-slate-600 hover:from-blue-700 hover:to-slate-700 disabled:from-blue-400 disabled:to-slate-400 text-white font-bold text-lg py-4 px-8 rounded-xl transition duration-200 shadow-lg disabled:cursor-not-allowed"
      >
        {loading ? 'Calculating...' : 'Calculate Rebalancing'}
      </button>
      </form>
    </>
  );
}

export default PortfolioForm;
