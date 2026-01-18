/**
 * Onboarding State Management
 * Tracks tutorial completion per user account
 */

const ONBOARDING_KEY = 'onboarding_completed_users';

/**
 * Get the list of user IDs that have completed onboarding
 * @returns {string[]} Array of user IDs
 */
function getCompletedUsers() {
  try {
    const data = localStorage.getItem(ONBOARDING_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Check if a specific user has completed the onboarding wizard
 * @param {string|null} userId - User ID to check (null for anonymous)
 * @returns {boolean} True if onboarding is complete for this user
 */
export function hasCompletedOnboarding(userId = null) {
  const completedUsers = getCompletedUsers();

  // For anonymous users, check if 'anonymous' is in the list
  const key = userId || 'anonymous';
  return completedUsers.includes(key);
}

/**
 * Mark onboarding as completed for a specific user
 * @param {string|null} userId - User ID (null for anonymous)
 */
export function setOnboardingCompleted(userId = null) {
  const completedUsers = getCompletedUsers();
  const key = userId || 'anonymous';

  if (!completedUsers.includes(key)) {
    completedUsers.push(key);
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(completedUsers));
  }
}

/**
 * Reset onboarding state for a specific user (for "Restart Tutorial" feature)
 * @param {string|null} userId - User ID (null for anonymous)
 */
export function resetOnboarding(userId = null) {
  const completedUsers = getCompletedUsers();
  const key = userId || 'anonymous';

  const filtered = completedUsers.filter(id => id !== key);
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(filtered));
}

/**
 * Check if this is a new signup (user just created account)
 * This is used to trigger onboarding only on first signup, not every login
 * @param {object|null} user - Supabase user object
 * @returns {boolean} True if this appears to be a new signup
 */
export function isNewSignup(user) {
  if (!user) return false;

  // Check if user was created recently (within last 5 minutes)
  const createdAt = new Date(user.created_at);
  const now = new Date();
  const fiveMinutes = 5 * 60 * 1000;

  return (now - createdAt) < fiveMinutes;
}
