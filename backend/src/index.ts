import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api.js';
import { closeDb, getDb } from './db/index.js';
import { getDemoStoreHtml } from './demoStoreHtml.js';
import { ApiError, requestContext, sendApiError } from './http/errors.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(requestContext);
app.use(cors({
  origin: '*', // Allows extension popup and localhost dashboard
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Request-ID']
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

app.use((_req, res) => sendApiError(res, new ApiError(404, 'NOT_FOUND', 'API route not found')));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => sendApiError(res, error));

export async function startServer() {
  try {
    console.log('[CardWise] Initializing database...');
    await getDb();
    const server = app.listen(port, () => {
      const address = server.address();
      const boundPort = address && typeof address === 'object' ? address.port : port;
      console.log(`[CardWise] Server running at http://localhost:${boundPort}`);
      console.log(`[CardWise] Interactive Demo Store: http://localhost:${boundPort}/demo-store`);
    });
    server.once('error', async error => {
      console.error('[CardWise] HTTP server failed to start:', error);
      try { await closeDb(); } finally { process.exit(1); }
    });
    let shuttingDown = false;
    const shutdown = () => {
      if (shuttingDown) return;
      shuttingDown = true;
      console.log('[CardWise] Closing HTTP server and database...');
      server.close(async () => {
        try {
          await closeDb();
          console.log('[CardWise] Database closed cleanly.');
          process.exit(0);
        } catch (error) {
          console.error('[CardWise] Database shutdown failed:', error);
          process.exit(1);
        }
      });
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
    // The disk-persistence smoke check uses IPC because Windows process.kill()
    // terminates a process rather than delivering a catchable Unix signal.
    if (process.send) process.on('message', message => { if (message === 'shutdown') shutdown(); });
  } catch (err) {
    console.error('[CardWise] Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) startServer();

export { app };
