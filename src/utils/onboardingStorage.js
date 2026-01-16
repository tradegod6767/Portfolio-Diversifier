/**
 * Onboarding State Management
 * Utilities for managing the onboarding wizard completion state
 */

export const ONBOARDING_KEY = 'hasCompletedOnboarding';

/**
 * Check if user has completed the onboarding wizard
 * @returns {boolean} True if onboarding is complete
 */
export function hasCompletedOnboarding() {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

/**
 * Mark onboarding as completed
 */
export function setOnboardingCompleted() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

/**
 * Reset onboarding state (for "Restart Tutorial" feature)
 */
export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
}
