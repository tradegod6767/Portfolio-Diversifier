import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function StripePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create checkout session
      const response = await axios.post(`${API_BASE_URL}/api/create-checkout-session`);

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (err) {
      setError('Failed to initiate payment. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        Enjoyed this analysis?
      </h3>
      <p className="text-gray-700 mb-6 text-lg">
        Support our service with a one-time payment
      </p>

      <div className="bg-gradient-to-r from-slate-500 to-emerald-600 rounded-xl p-8 mb-6 shadow-lg">
        <div className="text-white">
          <p className="text-5xl font-bold mb-2">$10</p>
          <p className="text-lg font-medium">One-time payment</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-slate-50 border-2 border-slate-300 rounded-xl flex items-start gap-2">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-slate-800 font-medium">{error}</p>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-gradient-to-r from-slate-600 to-emerald-600 hover:from-slate-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-lg py-4 px-8 rounded-xl transition duration-200 shadow-lg disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : 'Pay with Stripe'}
      </button>

      <p className="text-sm text-gray-500 mt-4 font-medium">
        Secure payment powered by Stripe (Test Mode)
      </p>
    </div>
  );
}

export default StripePayment;
