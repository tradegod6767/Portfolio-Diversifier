/**
 * Changelog data for RebalanceKit
 * Add new versions at the top of the array
 */

export const CHANGELOG = [
  {
    version: "1.0.0",
    date: "2026-03-16",
    changes: [
      { type: "feature", text: "Portfolio rebalancing calculator with 5 rebalancing modes" },
      { type: "feature", text: "Portfolio health score with drift and concentration analysis" },
      { type: "feature", text: "AI-powered portfolio analysis via Claude" },
      { type: "feature", text: "PDF report export (Pro)" },
      { type: "feature", text: "Model portfolio comparisons" },
      { type: "feature", text: "CSV export for holdings and trades" },
      { type: "feature", text: "Cloud portfolio storage (Pro) and local storage (Free)" },
    ]
  },
];

// Get the current/latest version
export const CURRENT_VERSION = CHANGELOG[0]?.version || "1.0.0";

// localStorage key for tracking seen version
export const LAST_SEEN_VERSION_KEY = "rebalancekit_lastSeenVersion";

/**
 * Check if there are unseen updates
 */
export function hasUnseenUpdates() {
  try {
    const lastSeen = localStorage.getItem(LAST_SEEN_VERSION_KEY);
    if (!lastSeen) return true; // First visit, show indicator
    return lastSeen !== CURRENT_VERSION;
  } catch {
    return false;
  }
}

/**
 * Mark current version as seen
 */
export function markVersionAsSeen() {
  try {
    localStorage.setItem(LAST_SEEN_VERSION_KEY, CURRENT_VERSION);
  } catch {
    // Ignore - private browsing or storage full
  }
}

/**
 * Get changelog entries since last seen version
 */
export function getUnseenChangelog() {
  let lastSeen;
  try {
    lastSeen = localStorage.getItem(LAST_SEEN_VERSION_KEY);
  } catch {
    return CHANGELOG;
  }
  if (!lastSeen) return CHANGELOG; // Show all if first visit

  const lastSeenIndex = CHANGELOG.findIndex(entry => entry.version === lastSeen);
  if (lastSeenIndex === -1) return CHANGELOG; // Version not found, show all
  if (lastSeenIndex === 0) return []; // Already on latest

  return CHANGELOG.slice(0, lastSeenIndex);
}
