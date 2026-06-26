import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

const app = express();
const PORT = process.env.PORT || 8080;
const ENV = process.env.NODE_ENV || 'development';

// ─────────────────────────────────────────
// CORS
// ─────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://nervox.live',
    'https://www.nervox.live',
    'https://beta.nervox.live',
    'https://nervox-live.vercel.app',
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ─────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    platform: 'NerVox API',
    environment: ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`NerVox API running on port ${PORT} — ${ENV}`);
});