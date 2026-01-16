/**
 * Changelog data for RebalanceKit
 * Add new versions at the top of the array
 */

export const CHANGELOG = [
  {
    version: "1.3.0",
    date: "2025-01-14",
    changes: [
      { type: "feature", text: "What's New changelog to track updates" },
      { type: "feature", text: "How It Works section explaining methodology" },
      { type: "improvement", text: "Better dark mode support for all components" },
    ]
  },
  {
    version: "1.2.0",
    date: "2025-01-13",
    changes: [
      { type: "feature", text: "Dark mode support with system preference detection" },
      { type: "feature", text: "Keyboard shortcuts for power users" },
      { type: "feature", text: "CSV export for holdings and trades" },
      { type: "improvement", text: "Smoother theme transitions" },
    ]
  },
  {
    version: "1.1.0",
    date: "2025-01-12",
    changes: [
      { type: "feature", text: "Undo/redo for portfolio edits" },
      { type: "feature", text: "What-If Simulator for market scenarios" },
      { type: "improvement", text: "Improved chart tooltips" },
      { type: "fix", text: "Fixed mobile layout issues on small screens" },
    ]
  },
  {
    version: "1.0.0",
    date: "2025-01-10",
    changes: [
      { type: "feature", text: "Portfolio rebalancing calculator" },
      { type: "feature", text: "Health score with drift analysis" },
      { type: "feature", text: "AI-powered portfolio insights" },
      { type: "feature", text: "PDF export with charts" },
      { type: "feature", text: "Model portfolio comparisons" },
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
  const lastSeen = localStorage.getItem(LAST_SEEN_VERSION_KEY);
  if (!lastSeen) return true; // First visit, show indicator
  return lastSeen !== CURRENT_VERSION;
}

/**
 * Mark current version as seen
 */
export function markVersionAsSeen() {
  localStorage.setItem(LAST_SEEN_VERSION_KEY, CURRENT_VERSION);
}

/**
 * Get changelog entries since last seen version
 */
export function getUnseenChangelog() {
  const lastSeen = localStorage.getItem(LAST_SEEN_VERSION_KEY);
  if (!lastSeen) return CHANGELOG; // Show all if first visit

  const lastSeenIndex = CHANGELOG.findIndex(entry => entry.version === lastSeen);
  if (lastSeenIndex === -1) return CHANGELOG; // Version not found, show all
  if (lastSeenIndex === 0) return []; // Already on latest

  return CHANGELOG.slice(0, lastSeenIndex);
}
