import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api.js';
import { getDb } from './db/index.js';
import { getDemoStoreHtml } from './demoStoreHtml.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: '*', // Allows extension popup and localhost dashboard
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Simulated Merchant Lab for testing merchant adapters & checkout extension
app.get('/demo-store', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(getDemoStoreHtml());
});

app.get('/', (_req, res) => {
  res.json({
    name: 'CardWise API & Recommendation Engine',
    version: '1.0.0',
    demoStore: 'http://localhost:3001/demo-store',
    dashboard: 'http://localhost:5173',
    endpoints: [
      '/api/cards',
      '/api/rewards',
      '/api/merchants',
      '/api/recommend',
      '/api/transactions',
      '/api/analytics',
      '/api/health'
    ]
  });
});

async function startServer() {
  try {
    console.log('[CardWise] Initializing database...');
    await getDb();
    app.listen(port, () => {
      console.log(`[CardWise] Server running at http://localhost:${port}`);
      console.log(`[CardWise] Interactive Demo Store: http://localhost:${port}/demo-store`);
    });
  } catch (err) {
    console.error('[CardWise] Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export { app };
