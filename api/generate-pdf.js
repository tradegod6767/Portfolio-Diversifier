import { authenticateRequest, verifyProStatus } from './_auth.js';
import { handleCors } from './_cors.js';
import { Sentry } from './_sentry.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user, error: authError } = await authenticateRequest(req);
    if (authError || !user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { isPro } = await verifyProStatus(user.id);
    if (!isPro) {
      return res.status(403).json({ error: 'Pro subscription required for PDF export' });
    }

    return res.status(200).json({ authorized: true });
  } catch (error) {
    console.error('[Generate PDF] Error:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
