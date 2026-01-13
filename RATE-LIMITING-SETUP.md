# Rate Limiting Setup Guide

## Overview

Rate limiting has been implemented across all API endpoints to prevent abuse and cost overruns. The implementation uses Upstash Redis for distributed rate limiting that works seamlessly with Vercel's serverless functions.

## Setup Instructions

### 1. Create Upstash Redis Database

1. Go to [Upstash](https://upstash.com) and create a free account
2. Create a new Redis database
   - Click "Create Database"
   - Choose a name (e.g., "rebalancekit-ratelimit")
   - Select a region close to your Vercel deployment region
   - Choose "Regional" for better latency
   - Click "Create"

### 2. Get Redis Credentials

After creating the database:
1. Go to your database dashboard
2. Scroll to "REST API" section
3. Copy the following values:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 3. Add Environment Variables

#### Local Development (.env file)
```bash
UPSTASH_REDIS_REST_URL=your_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
```

#### Vercel Deployment
1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add the following variables:
   - Variable: `UPSTASH_REDIS_REST_URL`
     - Value: (paste your Redis URL)
     - Environments: Production, Preview, Development
   - Variable: `UPSTASH_REDIS_REST_TOKEN`
     - Value: (paste your Redis token)
     - Environments: Production, Preview, Development

4. Redeploy your application for changes to take effect

## Rate Limit Tiers

### AI Endpoints (api/explain.js)
The most expensive endpoint with the strictest limits:

- **Anonymous Users**: 5 requests per hour per IP
- **Authenticated Users**: 20 requests per hour per user
- **Pro Subscribers**: 100 requests per hour per user

### Payment Endpoints (api/create-checkout-session.js)
Moderate limits to prevent abuse:

- **All Users**: 10 requests per hour per IP

### Email Endpoints (api/send-email.js)
Prevents spam:

- **Authenticated Users**: 5 emails per hour per user
- **Internal Calls**: No rate limit (webhook-triggered emails)

### Webhook Endpoints (api/gumroad-webhook.js, api/stripe-webhook.js)
High limits for legitimate service integrations:

- **All Requests**: 100 requests per hour per IP
- Applied AFTER webhook signature verification

### General Endpoints
Default rate limits for other endpoints:

- **Anonymous Users**: 50 requests per hour per IP
- **Authenticated Users**: 200 requests per hour per user

## How It Works

### 1. Identification
- **Authenticated Users**: Rate limited by user ID
- **Anonymous Users**: Rate limited by IP address

### 2. IP Detection
The middleware checks multiple headers to detect the real client IP:
- `x-real-ip` (Vercel)
- `x-forwarded-for` (CloudFlare, proxies)
- `socket.remoteAddress` (fallback)

### 3. Response Headers
When rate limiting is active, the following headers are included in responses:
- `X-RateLimit-Limit`: Total requests allowed in the window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Timestamp when the limit resets

### 4. Rate Limit Exceeded Response
When a rate limit is exceeded, users receive:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again in 45 minutes.",
  "limit": 5,
  "remaining": 0,
  "resetAt": "2024-01-15T15:30:00.000Z",
  "retryAfter": 2700
}
```
HTTP Status: `429 Too Many Requests`

## Graceful Degradation

The rate limiting implementation includes graceful degradation:

1. **Redis Not Configured**: If Redis environment variables are not set, rate limiting is bypassed with a warning logged
2. **Redis Connection Failure**: If Redis is unreachable, requests are allowed through (fail-open) with error logging
3. **No Disruption**: This ensures your API remains functional even if rate limiting fails

## Monitoring

### View Rate Limit Logs
Check your Vercel function logs for rate limiting activity:

```
[Rate Limit] Check passed: { identifier: 'user:123', tier: 'AI endpoint (Pro subscriber)', remaining: '95/100' }
[Rate Limit] Limit exceeded: { identifier: 'ip:192.168.1.1', tier: 'AI endpoint (anonymous user)', limit: 5 }
```

### Upstash Dashboard
Monitor Redis usage in your Upstash dashboard:
- Request count
- Data size
- Connected clients
- Command statistics

## Testing Rate Limits

### Test in Development
```bash
# Make multiple requests to test rate limiting
curl -X POST http://localhost:5173/api/explain \
  -H "Content-Type: application/json" \
  -d '{"rebalancingData": {...}}'

# Repeat 6 times to exceed anonymous limit (5/hour)
```

### Check Rate Limit Headers
```bash
curl -i -X POST https://rebalancekit.com/api/explain \
  -H "Content-Type: application/json" \
  -d '{"rebalancingData": {...}}'

# Look for headers:
# X-RateLimit-Limit: 5
# X-RateLimit-Remaining: 4
# X-RateLimit-Reset: 1705330800000
```

## Customizing Rate Limits

To adjust rate limits, edit `api/_ratelimit.js`:

```javascript
export const RateLimitTiers = {
  AI_ANONYMOUS: {
    requests: 10,      // Change from 5 to 10
    window: '1 h',
    description: 'AI endpoint (anonymous user)'
  },
  // ... other tiers
}
```

After making changes:
1. Commit and push to GitHub
2. Vercel will automatically redeploy
3. New limits take effect immediately

## Cost Considerations

### Upstash Free Tier
- 10,000 commands per day
- 256 MB storage
- Sufficient for most small to medium applications

### Calculating Usage
Each rate limit check uses 2-3 Redis commands:
- GET (check current count)
- INCR (increment counter)
- EXPIRE (set TTL)

**Example**: 1,000 API requests/day = ~3,000 Redis commands/day (well within free tier)

## Troubleshooting

### Rate Limiting Not Working
1. Check environment variables are set in Vercel
2. Verify Upstash Redis is active and not paused
3. Check function logs for rate limit warnings
4. Ensure you redeployed after adding environment variables

### Redis Connection Errors
```
[Rate Limit] Error checking rate limit: Connection timeout
[Rate Limit] Allowing request due to rate limit check failure
```

**Solutions**:
- Verify Redis URL and token are correct
- Check Upstash dashboard for database status
- Ensure Vercel region can reach Upstash region

### Rate Limits Too Strict
If legitimate users are being blocked:
1. Review rate limit tiers in `api/_ratelimit.js`
2. Consider increasing limits for authenticated users
3. Add IP whitelist for known legitimate IPs
4. Monitor Upstash logs to identify patterns

## Security Benefits

1. **Cost Protection**: Prevents expensive API abuse (AI, email)
2. **DDoS Mitigation**: Limits impact of automated attacks
3. **Fair Usage**: Ensures resources are shared fairly
4. **Credential Stuffing Prevention**: Limits login/payment attempts
5. **Webhook Abuse Prevention**: Protects even authenticated endpoints

## Files Modified

- ✅ `api/_ratelimit.js` - Rate limiting middleware (NEW)
- ✅ `api/explain.js` - AI endpoint with tiered limits
- ✅ `api/create-checkout-session.js` - Payment endpoint
- ✅ `api/send-email.js` - Email endpoint
- ✅ `api/gumroad-webhook.js` - Gumroad webhook
- ✅ `api/stripe-webhook.js` - Stripe webhook
- ✅ `package.json` - Added @upstash/ratelimit and @upstash/redis

## Next Steps

1. ✅ Set up Upstash Redis account
2. ✅ Add environment variables to Vercel
3. ✅ Deploy and test rate limiting
4. ✅ Monitor logs for any issues
5. ✅ Adjust rate limits based on actual usage patterns
6. ✅ Set up Upstash alerts for high usage

## Support

If you encounter issues:
- Check Vercel function logs
- Review Upstash dashboard
- Verify environment variables are set correctly
- Test with a simple endpoint first (e.g., payment endpoint)
