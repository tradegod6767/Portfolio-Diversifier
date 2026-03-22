/**
 * Retry a Supabase query with exponential backoff.
 * Use this in claim-pending-purchase to handle the webhook race condition
 * where a user claims before the webhook has processed.
 *
 * Agent 1: Integrate retryQuery into api/claim-pending-purchase.js when
 * looking up pending purchases by email to handle the race condition.
 */
export async function retryQuery(queryFn, { maxRetries = 3, baseDelayMs = 2000 } = {}) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await queryFn();
    if (result.data) return result;

    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, baseDelayMs * (i + 1)));
    }
  }
  return { data: null, error: new Error('Max retries exceeded') };
}
