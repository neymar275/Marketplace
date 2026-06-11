import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Allows reading secure JWT refresh cookies
import authRouter from './routes/auth.routes';
import listingRouter from './routes/listing.routes';

const app = express();

// 🚀 PRODUCTION FIX: Whitelist array containing both your live Vercel domain and local machine
const allowedOrigins = [
  'https://marketplace-client-seven.vercel.app',
  'http://localhost:5173'
];

// ==========================================
// 1. GLOBAL CORE MIDDLEWARES
// ==========================================
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests or tools like Postman (no origin)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true, // Required to pass secure HTTP-only cookies back and forth across domains
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parses incoming cookie keys into req.cookies object

// ==========================================
// 2. STATIC ASSETS ROUTING (FIXED ORDER)
// ==========================================
// Mounted ABOVE routers to prevent application catch-all blocks or 404 handles from hijacking file requests
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// ==========================================
// 3. APPLICATION ROUTING MOUNTS
// ==========================================
app.use('/api/auth', authRouter);
app.use('/api/listings', listingRouter);

// ==========================================
// 4. HEALTH CHECK DIAGNOSTIC ENDPOINT
// ==========================================
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'green', timestamp: new Date() });
});

export default app;