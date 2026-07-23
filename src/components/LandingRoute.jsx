import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Guard for the marketing landing route ("/") only.
 *
 * Logged-in visitors are sent to the app shell instead of the marketing page.
 * `replace` keeps "/" out of the history stack so Back doesn't bounce them
 * straight back here and re-trigger the redirect.
 *
 * Deliberately renders the landing page while auth is still resolving rather
 * than holding back a blank screen. Two reasons, both favouring the anonymous
 * majority over the logged-in minority:
 *
 *  1. index.html ships static SEO/no-JS fallback content inside #root, which
 *     React clears on mount. Gating on `loading` would give every anonymous
 *     visitor fallback text, then a blank page, then the real landing page once
 *     the Supabase round-trip finishes — a visible flicker on the highest-
 *     traffic page.
 *  2. Local production builds prerender "/" (see the route list in
 *     vite.config.js). The crawler snapshots the DOM when `prerender-ready`
 *     fires on mount, with auth still pending, so a `loading` gate would bake
 *     an empty <main> into that snapshot. Note this affects local/self-hosted
 *     builds only — prerendering is skipped on Vercel and dist/ is gitignored,
 *     so production SEO rests on the index.html fallback above, not on this.
 *
 * The trade-off is that a logged-in user may see one frame of the landing page
 * before the redirect commits. That is the intended bargain — do not "fix" it
 * by returning null while `loading`.
 */
export default function LandingRoute({ children }) {
  const { user, loading } = useAuth();

  if (!loading && user) return <Navigate to="/app" replace />;

  return children;
}
