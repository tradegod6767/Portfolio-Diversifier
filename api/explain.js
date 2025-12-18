import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { rebalancingData } = req.body;

    if (!rebalancingData) {
      return res.status(400).json({ error: 'Missing rebalancing data' });
    }

    // Initialize Anthropic client
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set in environment variables');
      return res.status(500).json({
        error: 'API key not configured',
        explanation: 'Rebalancing your portfolio helps maintain your desired risk level and investment strategy by adjusting positions to match your target allocations.'
      });
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

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

**Paragraph 3 - Tax & Implementation Considerations:**
Briefly mention tax implications of selling positions (capital gains considerations) and suggest whether this rebalancing should be done all at once or gradually. Keep this practical and actionable.

Write in clear, professional language that a non-expert investor can understand. Be specific and reference actual ticker symbols and dollar amounts from the data above.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const explanation = message.content[0].text;

    return res.status(200).json({ explanation });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return res.status(500).json({
      error: 'Failed to generate explanation',
      explanation: 'Rebalancing your portfolio helps maintain your desired risk level and investment strategy by adjusting positions to match your target allocations.'
    });
  }
}
