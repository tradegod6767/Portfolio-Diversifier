import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Claude API endpoint
app.post('/api/explain', async (req, res) => {
  try {
    const { rebalancingData } = req.body;

    if (!rebalancingData) {
      return res.status(400).json({ error: 'Missing rebalancing data' });
    }

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
});

// Stripe checkout endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Portfolio Rebalancing Analysis',
              description: 'Detailed portfolio rebalancing insights and recommendations',
            },
            unit_amount: 1000, // $10.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/',
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session'
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
