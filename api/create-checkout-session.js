// Vercel Serverless Function - Create Stripe Checkout Session
// This creates a Stripe checkout session for the $79/year subscription

import Stripe from 'stripe';

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
    console.log('[Checkout] Request received:', {
      userId: req.body?.userId,
      email: req.body?.email,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      hasPriceId: !!process.env.STRIPE_PRICE_ID,
    });

    const { userId, email } = req.body;

    // Validate required fields
    if (!userId || !email) {
      console.error('[Checkout] Missing required fields:', { userId, email });
      return res.status(400).json({ error: 'Missing userId or email' });
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Get the price ID from environment variables
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      console.error('[Checkout] STRIPE_PRICE_ID not configured');
      throw new Error('STRIPE_PRICE_ID not configured');
    }

    console.log('[Checkout] Creating session with priceId:', priceId);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin || 'http://localhost:5176'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5176'}/`,
      metadata: {
        userId: userId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    });

    console.log('[Checkout] Session created successfully:', session.id);

    // Return the checkout URL
    return res.status(200).json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('[Checkout] Error creating checkout session:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack,
    });
    return res.status(500).json({
      error: error.message || 'Failed to create checkout session',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
