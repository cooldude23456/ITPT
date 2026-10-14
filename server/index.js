import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import paymentsRouter from './routes/payments.js';
import accessRouter from './routes/access.js';
import { getActiveGateways } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'ITPracticeTests Zero-Trust Payment & Access Security Engine',
    timestamp: new Date().toISOString()
  });
});

// Active Gateways Endpoint (Public configuration only; all secrets stripped)
app.get('/api/gateways', async (req, res) => {
  try {
    const rawGateways = await getActiveGateways();
    const sanitized = rawGateways
      .filter(g => g.is_enabled !== false && g.isEnabled !== false)
      .map(g => ({
        id: g.id,
        name: g.name,
        provider: g.provider,
        keyId: g.key_id || g.keyId || g.clientId,
        clientId: g.clientId || g.key_id || g.keyId,
        merchantEmail: g.merchantEmail || g.merchant_email || 'rath.sanjiv.rath@gmail.com',
        upiVpa: g.upiVpa || g.upi_vpa || 'itpracticetests@okhdfcbank',
        isTestMode: Boolean(g.is_test_mode ?? g.isTestMode),
        supportedMethods: g.supported_methods || g.supportedMethods || ['UPI', 'Debit/Credit Cards', 'NetBanking', 'Wallets'],
        currency: g.currency || (g.provider === 'PayPal' ? 'USD' : 'INR')
      }));

    res.json({ success: true, gateways: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, gateways: [] });
  }
});

// Mount Routes
app.use('/api', paymentsRouter);
app.use('/api', accessRouter);

// Serve static frontend build when running standalone production server
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// For SPA routing fallback in standalone mode
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Standalone execution entrypoint
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test' && process.argv[1] === __filename) {
  app.listen(PORT, () => {
    console.log(`[ITPracticeTests Backend] Running on http://localhost:${PORT}`);
  });
}

export default app;
