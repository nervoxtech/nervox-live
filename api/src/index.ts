import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 8080;
const ENV = process.env.NODE_ENV || 'development';

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    platform: 'NerVox API',
    environment: ENV,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`NerVox API running on port ${PORT} — ${ENV}`);
});