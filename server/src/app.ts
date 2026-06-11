import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // 👈 CRITICAL: Allows reading secure JWT refresh cookies
import authRouter from './routes/auth.routes';
import listingRouter from './routes/listing.routes';

const app = express();

// ==========================================
// 1. GLOBAL CORE MIDDLEWARES
// ==========================================
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite frontend origin terminal port
  credentials: true                // Required to pass secure HTTP-only cookies back and forth
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // 👈 Parses incoming cookie keys into req.cookies object

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