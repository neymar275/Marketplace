import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes';
import listingRouter from './routes/listing.routes';

const app = express();

// Updated Allowed Origins
const allowedOrigins = [
  'https://marketplace-client-seven.vercel.app',
  'http://localhost:5173',
  'https://*.vercel.app',           // Safety net for Vercel previews
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.warn(`🚫 Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/listings', listingRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'green', timestamp: new Date().toISOString() });
});

// Catch-all for debugging
app.get('/debug', (req, res) => {
  res.json({
    message: "Backend is alive",
    routes: ["/api/auth", "/api/listings"],
    env: process.env.NODE_ENV || 'development'
  });
});

export default app;