# RebalanceKit Paywall System - Complete Setup Guide

## 🎉 What's Been Created

Your paywall system is now fully implemented! Here's what we built:

### Core Components
- ✅ **Supabase Auth & Database** - User authentication and subscription tracking
- ✅ **Stripe Integration** - Payment processing for $79/year subscriptions
- ✅ **Paywall Wrapper** - Locks premium features behind authentication
- ✅ **Auth Modal** - Beautiful sign-in/sign-up interface
- ✅ **Webhook Handler** - Automatically activates subscriptions
- ✅ **Success Page** - Post-payment confirmation

### Files Created
```
├── supabase-migration.sql              # Database schema
├── src/
│   ├── lib/
│   │   └── supabase.js                 # Supabase client
│   ├── hooks/
│   │   └── useSubscription.js          # Subscription state management
│   ├── components/
│   │   ├── AuthModal.jsx               # Sign in/up modal
│   │   └── PaywallWrapper.jsx          # Premium feature wrapper
│   └── pages/
│       └── SuccessPage.jsx             # Payment success page
├── api/
│   ├── create-checkout-session.js      # Stripe checkout
│   └── stripe-webhook.js               # Webhook handler
└── .env.example                        # Environment variables template
```

---

## 📋 Step-by-Step Setup

### Step 1: Set Up Supabase

1. **Create a Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Choose a name and password

2. **Run the Database Migration**
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy the contents of `supabase-migration.sql`
   - Paste and click "Run"
   - ✅ This creates the `user_subscriptions` table with RLS

3. **Get Your Supabase Keys**
   - Go to Project Settings → API
   - Copy these values:
     - `Project URL` → `VITE_SUPABASE_URL`
     - `anon public` key → `VITE_SUPABASE_ANON_KEY`
     - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

### Step 2: Set Up Stripe

1. **Create a Stripe Account**
   - Go to https://dashboard.stripe.com
   - Sign up or log in
   - Use **Test Mode** for development

2. **Create a Product**
   - Go to Products → Add Product
   - Name: "RebalanceKit Pro"
   - Description: "Monthly subscription to RebalanceKit premium features"
   - Pricing:
     - Model: **Recurring**
     - Price: **$9.99**
     - Billing period: **Monthly**
   - Click "Save product"
   - **Copy the Price ID** (starts with `price_...`)

3. **Get Your API Keys**
   - Go to Developers → API keys
   - Copy:
     - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `Secret key` → `STRIPE_SECRET_KEY` (keep secret!)

---

### Step 3: Configure Environment Variables

1. **Copy the example file**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your values in `.env`**
   ```env
   # Supabase
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # Stripe
   STRIPE_SECRET_KEY=sk_test_51...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
   STRIPE_PRICE_ID=price_1...

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:5176
   ```

3. **Add to Vercel** (for production)
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add STRIPE_SECRET_KEY
   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   vercel env add STRIPE_WEBHOOK_SECRET
   vercel env add STRIPE_PRICE_ID
   vercel env add NEXT_PUBLIC_APP_URL
   ```

---

### Step 4: Set Up Stripe Webhooks

**Important:** Webhooks are required for subscriptions to activate automatically.

#### For Local Development (using Stripe CLI):

1. **Install Stripe CLI**
   ```bash
   # Mac
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop install stripe

   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login and forward webhooks**
   ```bash
   stripe login
   stripe listen --forward-to localhost:5176/api/stripe-webhook
   ```

3. **Copy the webhook signing secret**
   - The CLI will print: `whsec_...`
   - Add to your `.env`:
     ```env
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```

#### For Production (Vercel):

1. **Deploy your app first**
   ```bash
   vercel --prod
   ```

2. **Create webhook endpoint in Stripe**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "+ Add endpoint"
   - Endpoint URL: `https://your-app.vercel.app/api/stripe-webhook`
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Click "Add endpoint"

3. **Get the signing secret**
   - Click on your new webhook
   - Click "Reveal" under "Signing secret"
   - Copy the `whsec_...` value
   - Add to Vercel:
     ```bash
     vercel env add STRIPE_WEBHOOK_SECRET
     ```

---

### Step 5: Update Your App with Routing

You need to add React Router to handle the success page:

1. **Install React Router** (if not already installed)
   ```bash
   npm install react-router-dom
   ```

2. **Update your main App.jsx** to include routing:
   ```jsx
   import { BrowserRouter, Routes, Route } from 'react-router-dom';
   import SuccessPage from './pages/SuccessPage';

   // In your App component, wrap with router:
   <BrowserRouter>
     <Routes>
       <Route path="/success" element={<SuccessPage />} />
       <Route path="/" element={<YourMainApp />} />
     </Routes>
   </BrowserRouter>
   ```

---

### Step 6: Wrap Premium Features with Paywall

Now protect your premium features! Here's how:

#### Example: Protect the Tax Estimator

**Before:**
```jsx
<RebalancingCostEstimate results={rebalanceResults} />
```

**After:**
```jsx
import PaywallWrapper from './PaywallWrapper';

<PaywallWrapper
  featureName="Tax Impact Estimates"
  description="See detailed tax calculations and capital gains estimates"
>
  <RebalancingCostEstimate results={rebalanceResults} />
</PaywallWrapper>
```

#### Features to Lock:

1. **Tax Impact Estimates** (`RebalancingCostEstimate`)
   ```jsx
   <PaywallWrapper
     featureName="Tax Impact Estimates"
     description="Detailed tax calculations and capital gains analysis"
   >
     <RebalancingCostEstimate results={results} />
   </PaywallWrapper>
   ```

2. **PDF Export** (`ExportButtons`)
   ```jsx
   <PaywallWrapper
     featureName="PDF Reports"
     description="Export professional PDF reports with charts and analysis"
   >
     <ExportButtons results={results} />
   </PaywallWrapper>
   ```

3. **Health Score** (`PortfolioHealthScore`)
   ```jsx
   <PaywallWrapper
     featureName="Portfolio Health Score"
     description="Advanced portfolio risk and diversification analysis"
   >
     <PortfolioHealthScore positions={positions} />
   </PaywallWrapper>
   ```

4. **Model Comparison** (`PortfolioComparison`)
   ```jsx
   <PaywallWrapper
     featureName="Model Portfolio Comparison"
     description="Compare your portfolio to proven investment strategies"
   >
     <PortfolioComparison groupedPositions={groupedPositions} />
   </PaywallWrapper>
   ```

---

### Step 7: Add User Menu to Navigation

Add a user menu to your top navigation bar:

```jsx
import { useSubscription } from '../hooks/useSubscription';
import { auth } from '../lib/supabase';
import { useState } from 'react';
import AuthModal from './AuthModal';

function Navigation() {
  const { user, isPro } = useSubscription();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    await auth.signOut();
  };

  return (
    <nav className="flex items-center justify-between p-4">
      <div className="text-xl font-bold">RebalanceKit</div>

      <div className="flex items-center gap-4">
        {!user ? (
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg"
          >
            Sign In
          </button>
        ) : (
          <>
            {!isPro && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                Free
              </span>
            )}
            {isPro && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
                Pro ⭐
              </span>
            )}

            <div className="relative group">
              <button className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  {user.email[0].toUpperCase()}
                </div>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg hidden group-hover:block">
                <div className="p-2">
                  <p className="px-4 py-2 text-sm text-gray-700">{user.email}</p>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </nav>
  );
}
```

---

## 🧪 Testing

### Test the Complete Flow:

1. **Start your dev server**
   ```bash
   npm run dev
   ```

2. **Start Stripe webhook forwarding** (in another terminal)
   ```bash
   stripe listen --forward-to localhost:5176/api/stripe-webhook
   ```

3. **Test the signup and payment flow:**
   - Open http://localhost:5176
   - Try to access a premium feature
   - Click "Sign Up to Upgrade"
   - Create an account
   - Complete checkout with test card: `4242 4242 4242 4242`
   - Verify you're redirected to success page
   - Check that premium features are now unlocked

4. **Test webhook in Stripe Dashboard:**
   - Go to Developers → Webhooks
   - Click your webhook
   - View recent deliveries
   - Should see successful `checkout.session.completed` event

### Stripe Test Cards:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- Use any future expiry date and any CVC

---

## 🚀 Deployment Checklist

Before going live:

- [ ] Run Supabase migration in production database
- [ ] Add all environment variables to Vercel
- [ ] Set up production Stripe webhook
- [ ] Switch Stripe to Live Mode (not Test Mode)
- [ ] Create production Stripe product with real price ID
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Test complete flow in production
- [ ] Enable Stripe email receipts
- [ ] Set up Stripe customer portal (for managing subscriptions)

---

## 🔒 Security Notes

- **NEVER** commit `.env` to git (it's in `.gitignore`)
- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- **NEVER** expose `STRIPE_SECRET_KEY` to the client
- **ALWAYS** verify webhook signatures (already implemented)
- **ALWAYS** use Row Level Security in Supabase (already configured)

---

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Stripe Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhook Testing](https://stripe.com/docs/webhooks/test)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🆘 Troubleshooting

### "Missing environment variables" error
- Check that `.env` file exists and has all required variables
- Restart dev server after adding new env vars

### Webhook not firing
- Make sure `stripe listen` is running for local dev
- Check webhook URL is correct in Stripe dashboard
- Verify webhook secret matches in `.env`

### Subscription not activating
- Check Supabase logs for errors
- Verify service role key is correct
- Check webhook received `checkout.session.completed` event
- Ensure userId is in session metadata

### User can still access premium features
- Check `isPro` logic in `useSubscription` hook
- Verify `current_period_end` is in the future
- Check subscription_status is 'active'

---

## 🎯 Next Steps

1. Customize the pricing and messaging
2. Add more premium features
3. Set up customer portal for subscription management
4. Add analytics to track conversion rates
5. Create email notifications for subscription events

Your paywall system is ready to go! 🚀
