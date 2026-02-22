/**
 * Local development server for testing API endpoints
 * Runs on port 3001 to match the config.js development URL
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import API handlers
import explainHandler from './api/explain.js';

dotenv.config();

const app = express();
const PORT = 3001;

// Enable CORS for local development
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Parse JSON bodies (except for Stripe webhook which needs raw body)
app.use((req, res, next) => {
  if (req.path === '/api/stripe-webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Mount API endpoints
app.post('/api/explain', explainHandler);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n✅ Development API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   - POST /api/explain`);
  console.log(`   - GET  /api/health\n`);
});
