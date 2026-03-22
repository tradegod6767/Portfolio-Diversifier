import { useEffect, useRef } from 'react';
import { checkIfPro } from '../lib/auth';

/**
 * Only poll for Pro status when user just returned from Gumroad checkout.
 * Agent 1: import this hook into useAuth.js and call it instead of
 * the current 5-second polling for all free users.
 */
export function useProPolling(userId, onProActivated) {
  const pollingRef = useRef(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const justUpgraded = searchParams.get('upgraded') === 'true';

    if (!justUpgraded || !userId) return;

    pollingRef.current = setInterval(async () => {
      const { isPro } = await checkIfPro(userId);
      if (isPro) {
        onProActivated();
        clearInterval(pollingRef.current);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }, 3000);

    const timeout = setTimeout(() => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }, 90000);

    return () => {
      clearInterval(pollingRef.current);
      clearTimeout(timeout);
    };
  }, [userId, onProActivated]);
}
