// Vercel Serverless Function - Stripe Webhook Handler
// Handles subscription events from Stripe and updates Supabase

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Disable body parsing - we need raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to get raw body
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'];

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Initialize Supabase with service role key (for admin access)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;

        if (!userId) {
          console.error('No userId in session metadata');
          return res.status(400).json({ error: 'Missing userId in metadata' });
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        // Calculate subscription end date (1 year from now)
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        // Update user subscription in Supabase
        const { error } = await supabase
          .from('user_subscriptions')
          .upsert({
            id: userId,
            email: session.customer_email,
            subscription_status: 'active',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            current_period_end: currentPeriodEnd.toISOString(),
          });

        if (error) {
          console.error('Error updating subscription:', error);
          throw error;
        }

        console.log(`Subscription activated for user ${userId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.warn('No userId in subscription metadata');
          break;
        }

        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        // Update subscription status
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            subscription_status: subscription.status,
            current_period_end: currentPeriodEnd.toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('Error updating subscription:', error);
          throw error;
        }

        console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.warn('No userId in subscription metadata');
          break;
        }

        // Mark subscription as cancelled
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            subscription_status: 'cancelled',
          })
          .eq('id', userId);

        if (error) {
          console.error('Error cancelling subscription:', error);
          throw error;
        }

        console.log(`Subscription cancelled for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({
      error: 'Webhook handler failed',
      message: error.message,
    });
  }
}
