import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function SuccessPage() {
  const navigate = useNavigate();
  const { refetch } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Refetch subscription status to get the updated pro status
    const refreshSubscription = async () => {
      // Wait a bit for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      await refetch();
    };

    refreshSubscription();

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, refetch]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card border border-border rounded-2xl p-12 text-center">
        {/* Success icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-gain-bg border border-gain/30 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gain" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success message */}
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to RebalanceKit Pro!
        </h1>

        <p className="text-xl text-muted-foreground mb-8">
          Thank you for upgrading! You now have access to all premium features.
        </p>

        {/* Features unlocked */}
        <div className="bg-muted border border-border rounded-xl p-6 mb-8">
          <h3 className="font-bold text-foreground mb-4">Features Unlocked:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            {['Tax impact estimates', 'PDF report generation', 'Portfolio health scoring', 'Model portfolio comparison'].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gain flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-redirect message */}
        <p className="text-muted-foreground mb-6">
          Redirecting to your dashboard in <span className="font-bold text-foreground">{countdown}</span> seconds...
        </p>

        <button
          onClick={() => navigate('/')}
          className="bg-primary text-primary-foreground hover:opacity-90 font-bold py-3 px-8 rounded-lg transition-opacity"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
}

export default SuccessPage;
