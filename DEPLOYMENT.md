# Portfolio Rebalancing Calculator

A simple, responsive web app that helps investors calculate how to rebalance their portfolio to reach target allocations. Features AI-powered explanations using Claude API and integrated Stripe payment processing.

## Features

- Add/remove portfolio positions with ticker symbols
- Input current dollar amounts and target allocation percentages
- Calculate exact buy/sell amounts needed to reach target allocations
- AI-generated explanations of rebalancing recommendations
- Stripe payment integration (test mode)
- Fully responsive design with Tailwind CSS
- Serverless API deployment on Vercel

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **APIs**: Claude API (Anthropic), Stripe
- **Deployment**: Vercel (serverless functions)

## Local Development

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Claude API key from [Anthropic Console](https://console.anthropic.com/)
- Stripe test API key from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

### Setup

1. **Clone or navigate to the project directory**
   ```bash
   cd portfolio-rebalancer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   STRIPE_SECRET_KEY=sk_test_your_stripe_test_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

   Follow the prompts. For first deployment, answer:
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - Project name? `portfolio-rebalancer` (or your preferred name)
   - Directory? `./` (press Enter)
   - Override settings? `N`

4. **Add environment variables**

   After deployment, add your API keys to Vercel:
   ```bash
   vercel env add ANTHROPIC_API_KEY
   vercel env add STRIPE_SECRET_KEY
   ```

   Select "Production" and "Preview" for both variables.

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/portfolio-rebalancer.git
   git push -u origin main
   ```

2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

3. **Click "Add New Project"**

4. **Import your GitHub repository**

5. **Configure Project**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. **Add Environment Variables**

   In the project settings, add:
   - `ANTHROPIC_API_KEY` - Your Claude API key
   - `STRIPE_SECRET_KEY` - Your Stripe test secret key

7. **Click "Deploy"**

## Environment Variables

The following environment variables are required:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `ANTHROPIC_API_KEY` | Claude API key for AI explanations | [Anthropic Console](https://console.anthropic.com/) |
| `STRIPE_SECRET_KEY` | Stripe secret key (test mode) | [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) |

## Project Structure

```
portfolio-rebalancer/
├── api/                          # Vercel serverless functions
│   ├── explain.js               # Claude API endpoint
│   └── create-checkout-session.js  # Stripe checkout endpoint
├── src/
│   ├── components/
│   │   ├── PortfolioForm.jsx   # Input form for positions
│   │   ├── RebalancingResults.jsx  # Display results
│   │   └── StripePayment.jsx   # Payment button
│   ├── utils/
│   │   └── calculations.js     # Rebalancing logic
│   ├── App.jsx                 # Main app component
│   └── index.css               # Tailwind styles
├── .env.example                # Environment variables template
├── vercel.json                 # Vercel configuration
└── DEPLOYMENT.md               # This file
```

## Usage

1. **Enter Portfolio Positions**
   - Add ticker symbols (e.g., AAPL, SPY, VTSAX)
   - Enter current dollar amount for each position
   - Set target allocation percentage for each

2. **Calculate Rebalancing**
   - Click "Calculate Rebalancing"
   - View current vs. target allocations
   - See exact buy/sell amounts needed
   - Read AI-generated explanation

3. **Optional Payment**
   - Click "Pay with Stripe" to test payment flow
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date and CVC

## API Endpoints

### POST /api/explain
Generates AI explanation for rebalancing recommendations using Claude API.

**Request Body:**
```json
{
  "rebalancingData": {
    "totalValue": 50000,
    "positions": [...]
  }
}
```

**Response:**
```json
{
  "explanation": "Your portfolio rebalancing involves..."
}
```

### POST /api/create-checkout-session
Creates a Stripe checkout session for payment.

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

## Testing Stripe Integration

In test mode, use these test cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`

Use any future expiry date and any 3-digit CVC.

## Troubleshooting

### Build fails on Vercel
- Ensure all dependencies are in `package.json`
- Check that environment variables are set correctly

### Claude API errors
- Verify your API key is correct
- Check your Anthropic account has credits

### Stripe checkout not working
- Ensure you're using test mode key (`sk_test_...`)
- Verify the success/cancel URLs are correct

## Future Enhancements

- Add user accounts and portfolio saving
- Historical tracking of rebalancing actions
- Integration with brokerage APIs for real-time prices
- Tax-loss harvesting suggestions
- Multi-currency support

## License

MIT
