// app.js (Node + Express, ESM)
// Serves APIs + uploads + React/Vite SPA with history fallback

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// --- Your modules
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listing.js';
import roomRoutes from './routes/room.js';
import verifyEmailRoutes from './routes/verifyEmail.js';
import uploadRoutes from './routes/upload.js';
import kycRoutes from './routes/kyc.js';
import bookingRoutes from './routes/booking.js'
import paymentRoutes from './routes/payment.js';
import ensureDefaultAccounts from './utils/ensureDefaultAccounts.js';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config();

// Initialize express
const app = express();

// --- Database & bootstrap
connectDB()
  .then(() => ensureDefaultAccounts())
  .catch((err) => console.error('Bootstrap error:', err));

// --- CORS (cookies + multiple fronts)
const allowedOrigins = new Set([
  'https://oyo-plus-test-front-end.onrender.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5180',
  'http://127.0.0.1:5180',
  // Common Docker/WSL bridge IPs used by Vite previews
  'http://172.17.0.1:5173',
  'http://172.17.0.1:5180',
]);

// Accept other RFC1918 / loopback hosts for local dev without throwing CORS 500s
const allowPrivateNetwork = (origin) => {
  if (!origin) return false;
  return /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
    origin
  );
};

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // mobile apps / curl
    if (allowedOrigins.has(origin)) return callback(null, true);
    if (/^https?:\/\/(?:.+\.)?onrender\.com$/.test(origin)) return callback(null, true);
    if (allowPrivateNetwork(origin)) return callback(null, true);
    // Reject without throwing to avoid 500 on preflight; browser will block
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// --- Body & cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Static uploads (kept as-is)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API routes
app.use('/api', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/verify-email', verifyEmailRoutes);
app.use('/api/listings/:listingId/rooms', roomRoutes);
app.use('/api/kyc', kycRoutes);
app.use("/api/bookings", bookingRoutes);
app.use('/api/payments', paymentRoutes);


// --- Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

/**
 * === SPA hosting (Vite build) ===
 * Make sure your build outputs to "dist" in this same service.
 * On Render: Build Command: npm ci && npm run build
 *            Start Command: node app.js (or node server.js if you rename)
 *
 * If your client is in a subfolder (e.g., ./frontend/dist), point clientDist there.
 */
const clientDist = process.env.CLIENT_DIST
  ? path.resolve(__dirname, process.env.CLIENT_DIST)
  : path.resolve(__dirname, 'dist');

// Serve static assets (JS/CSS/images) from Vite build
app.use(express.static(clientDist));

/**
 * History API fallback:
 * For any non-API, non-uploads route, send index.html
 * so React Router can render the right page on hard refresh or direct link.
 */
app.get(/^\/(?!api|uploads)(.*)/, (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// --- Global error handler (keep last before listen)
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack || err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? (err.message || 'Internal Error') : undefined
  });
});

// --- Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Serving SPA from: ${clientDist}`);
});
