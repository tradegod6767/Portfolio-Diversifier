# Quick Start Guide

## Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example env file:
```bash
cp .env.example .env
```

Add your API keys to `.env`:
- Get your Claude API key: https://console.anthropic.com/
- Get your Stripe test key: https://dashboard.stripe.com/test/apikeys

### 3. Run the Development Server
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Test the App

Try these example portfolios:

**Example 1: Simple 3-fund portfolio**
- Position 1: SPY, $30,000, Target 60%
- Position 2: AGG, $20,000, Target 30%
- Position 3: VTI, $10,000, Target 10%

**Example 2: Tech-heavy portfolio**
- Position 1: AAPL, $15,000, Target 25%
- Position 2: MSFT, $12,000, Target 25%
- Position 3: GOOGL, $18,000, Target 25%
- Position 4: AMZN, $10,000, Target 25%

### 5. Test Stripe Payment

Use this test card number: `4242 4242 4242 4242`
- Any future expiry date (e.g., 12/25)
- Any 3-digit CVC (e.g., 123)

## Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add ANTHROPIC_API_KEY
vercel env add STRIPE_SECRET_KEY

# Deploy to production
vercel --prod
```

## Next Steps

- Read the full DEPLOYMENT.md for detailed instructions
- Customize the UI in `src/components/`
- Modify calculation logic in `src/utils/calculations.js`
- Add more features as needed

## Troubleshooting

**API key errors?**
- Check `.env` file exists and has correct keys
- Restart dev server after adding env variables

**Styling issues?**
- Clear browser cache
- Check Tailwind is properly configured

**Build fails?**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

## Support

Questions? Check DEPLOYMENT.md for more detailed documentation.
