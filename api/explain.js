import Anthropic from '@anthropic-ai/sdk';
import { handleCors } from './_cors.js';
import { applyRateLimit } from './_ratelimit.js';
import { authenticateRequest } from './_auth.js';
import { Sentry } from './_sentry.js';

export default async function handler(req, res) {
  // SECURITY: Apply CORS with origin whitelist (no wildcards)
  if (handleCors(req, res, {
    methods: ['POST', 'OPTIONS']
  })) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // SECURITY: Authenticate request and verify Pro status server-side
  console.log('[AI Explain] Starting request...');
  const { user, isPro, error: authError } = await authenticateRequest(req);
  const isAuthenticated = !authError && user;
  console.log('[AI Explain] Auth result:', { isAuthenticated, isPro, authError: authError?.message });

  try {
    const { rebalancingData } = req.body;

    if (!rebalancingData) {
      console.log('[AI Explain] Missing rebalancing data');
      return res.status(400).json({ error: 'Missing rebalancing data' });
    }

    // SECURITY FIX: Use server-verified Pro status, not client-sent flag
    const isProUser = isPro === true;

    // SECURITY: Apply rate limiting for AI endpoints (5/20/100 requests per hour)
    console.log('[AI Explain] Checking rate limit...');
    if (!await applyRateLimit(req, res, {
      endpointType: 'AI',
      user: user,
      isPro: isProUser
    })) {
      console.log('[AI Explain] Rate limit blocked request');
      return; // Rate limit exceeded, response already sent
    }
    console.log('[AI Explain] Rate limit passed');

    // Initialize Anthropic client
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set in environment variables');
      return res.status(500).json({
        error: 'API key not configured - please set ANTHROPIC_API_KEY in Vercel environment variables',
        explanation: 'AI analysis unavailable - API key not configured.'
      });
    }

    console.log('[AI Explain] API key found, calling Claude API...');

    const anthropic = new Anthropic({
      apiKey: apiKey,
      timeout: 25000,
    });

    // Create conditional tax section based on subscription status
    const taxSection = isProUser
      ? `**Paragraph 3 - Tax & Implementation Considerations:**
Provide COMPREHENSIVE tax analysis including:
- Calculate and specify exact capital gains/losses from any position sales (use the dollar amounts provided)
- Identify specific tax-loss harvesting opportunities if any positions are being sold at a loss
- Discuss wash sale rule considerations if similar securities are involved
- Recommend optimal timing for tax efficiency (end of year considerations, holding period strategies)
- Break down long-term vs short-term capital gains implications based on typical holding periods
- Suggest specific tax optimization strategies relevant to this portfolio
- Provide actionable recommendations for minimizing tax liability

Be detailed and specific - this is a Pro subscriber who paid for comprehensive tax guidance.`
      : `**Paragraph 3 - Tax & Implementation Considerations:**
Provide a brief 2-3 sentence teaser about tax implications. If the rebalancing only involves deploying cash (no selling positions), acknowledge there are no immediate tax implications. If selling positions is required, mention that it may trigger capital gains. Always end with: "Upgrade to Pro for detailed tax optimization strategies including tax-loss harvesting, capital gains minimization, and wash sale rule guidance."`;

    // Create prompt for Claude
    const prompt = `You are an experienced financial advisor providing detailed portfolio rebalancing analysis. Based on the following data, provide a comprehensive 2-3 paragraph analysis that includes:

Portfolio Total Value: $${rebalancingData.totalValue.toFixed(2)}

Positions:
${rebalancingData.positions.map(p =>
  `${p.ticker}: Current ${p.currentPercent.toFixed(2)}% → Target ${p.targetPercent.toFixed(2)}% (${p.action} $${Math.abs(p.difference).toFixed(2)})`
).join('\n')}

Your analysis should include:

**Paragraph 1 - Current Situation & Required Actions:**
Explain the current allocation state and what specific rebalancing actions are needed. Be specific about which positions are overweight/underweight and why.

**Paragraph 2 - Risk Assessment:**
Assess concentration risk and portfolio volatility. Discuss any concerning position sizes or lack of diversification. Mention specific risks related to the holdings (e.g., sector concentration, asset class exposure).

${taxSection}

Write in clear, professional language that a non-expert investor can understand. Be specific and reference actual ticker symbols and dollar amounts from the data above.`;

    // Call Claude API with increased tokens for Pro users
    console.log('[AI Explain] Calling Claude API with model claude-sonnet-4-20250514...');
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: isProUser ? 1500 : 800, // More tokens for detailed Pro analysis
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    console.log('[AI Explain] Claude API response received');

    const explanation = message?.content?.[0]?.text;
    if (!explanation) {
      console.error('[AI Explain] Empty or malformed response from Claude API');
      return res.status(500).json({
        error: 'Empty response from AI',
        explanation: 'Rebalancing your portfolio helps maintain your desired risk level and investment strategy by adjusting positions to match your target allocations.'
      });
    }

    console.log('[AI Explain] Successfully generated explanation, length:', explanation.length);

    return res.status(200).json({ explanation });
  } catch (error) {
    // SECURITY FIX: Log detailed error internally but return sanitized error to client
    console.error('[AI Explain] Error calling Claude API:', {
      message: error.message,
      type: error.type,
      code: error.code
    });
    Sentry.captureException(error);

    return res.status(500).json({
      error: 'Failed to generate AI analysis',
      explanation: 'Rebalancing your portfolio helps maintain your desired risk level and investment strategy by adjusting positions to match your target allocations.',
      // Include error details for debugging (no stack traces)
      debug: { message: error.message?.substring(0, 200), type: error.type, code: error.code }
    });
  }
}
