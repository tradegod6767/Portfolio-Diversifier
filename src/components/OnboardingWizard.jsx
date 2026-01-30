import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { setOnboardingCompleted, hasCompletedOnboarding } from '../utils/onboardingStorage';

/**
 * Premium Onboarding Experience
 * Compact 3-step intro that only shows once per authenticated user
 */
export default function OnboardingWizard({ isOpen, onClose, onComplete, user, onLoadExample }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Check if onboarding was already completed
  useEffect(() => {
    if (user && isOpen && hasCompletedOnboarding(user.id)) {
      onClose();
    }
  }, [isOpen, user, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen && user) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen, user]);

  // Never show for unauthenticated users
  if (!user) return null;

  const handleClose = () => {
    setIsExiting(true);
    setOnboardingCompleted(user.id);
    setTimeout(() => {
      setIsExiting(false);
      onClose();
    }, 200);
  };

  const handleSkip = () => {
    if (dontShowAgain) {
      setOnboardingCompleted(user.id);
    }
    handleClose();
  };

  const handleGetStarted = () => {
    setOnboardingCompleted(user.id);
    onClose();
  };

  const handleLoadExample = () => {
    setOnboardingCompleted(user.id);
    onClose();
    if (onLoadExample) {
      onLoadExample();
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <path d="M4 16h40" stroke="currentColor" strokeWidth="2.5"/>
          <circle cx="10" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="20" cy="12" r="1.5" fill="currentColor"/>
          <path d="M12 26h8M12 32h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M32 24l4 4 8-8" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'features',
      title: 'Features',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
          <path d="M24 4l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2z" stroke="currentColor" strokeWidth="2.5" fill="none"/>
        </svg>
      )
    },
    {
      id: 'ready',
      title: 'Get Started',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <path d="M16 24l6 6 12-12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  if (!isOpen) return null;

  return createPortal(
    <div className={`onboarding-overlay ${isExiting ? 'exiting' : ''}`}>
      <div className={`onboarding-modal ${isExiting ? 'exiting' : ''}`}>
        {/* Close Button */}
        <button onClick={handleClose} className="onboarding-close" aria-label="Close">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Step Indicators */}
        <div className="onboarding-steps">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={`onboarding-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            >
              <div className="step-dot">
                {index < currentStep ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="step-label">{step.title}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="onboarding-content">
          {/* Step 1: Welcome */}
          {currentStep === 0 && (
            <div className="step-content animate-in">
              <div className="step-icon text-[#0A2540]">
                {steps[0].icon}
              </div>
              <h2 className="step-title">Welcome to RebalanceKit</h2>
              <p className="step-description">
                The smart way to keep your portfolio on target. Calculate rebalancing trades in seconds.
              </p>
              <div className="feature-pills">
                <span className="pill">Tax-efficient</span>
                <span className="pill">No signup required</span>
                <span className="pill">Free to use</span>
              </div>
            </div>
          )}

          {/* Step 2: Key Features */}
          {currentStep === 1 && (
            <div className="step-content animate-in">
              <div className="step-icon text-[#0A2540]">
                {steps[1].icon}
              </div>
              <h2 className="step-title">What You Can Do</h2>
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon buy">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <strong>Add-Only Mode</strong>
                    <span>Invest new cash without selling</span>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon chart">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <strong>Portfolio Health Score</strong>
                    <span>See how balanced you are</span>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon export">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <strong>Export Reports</strong>
                    <span>PDF and CSV downloads</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Get Started */}
          {currentStep === 2 && (
            <div className="step-content animate-in">
              <div className="step-icon text-[#0A2540]">
                {steps[2].icon}
              </div>
              <h2 className="step-title">You're Ready!</h2>
              <p className="step-description">
                Start by entering your holdings or try a sample portfolio to see how it works.
              </p>
              <div className="action-buttons">
                <button onClick={handleGetStarted} className="btn-primary">
                  Enter My Portfolio
                </button>
                <button onClick={handleLoadExample} className="btn-secondary">
                  Try Sample Portfolio
                </button>
              </div>
              <p className="help-note">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Need help? Check the menu for tutorials and tips.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="onboarding-footer">
          <div className="footer-left">
            {currentStep < 2 && (
              <label className="dont-show-checkbox">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                />
                <span>Don't show again</span>
              </label>
            )}
          </div>
          <div className="footer-right">
            {currentStep > 0 && currentStep < 2 && (
              <button onClick={prevStep} className="btn-text">
                Back
              </button>
            )}
            {currentStep < 2 ? (
              <button onClick={nextStep} className="btn-next">
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : null}
            {currentStep === 0 && (
              <button onClick={handleSkip} className="btn-text skip-btn">
                Skip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
