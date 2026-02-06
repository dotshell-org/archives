import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import * as path from 'path';
import { ArchiveScanner } from './services/archiveScanner';
import { createArchiveRouter } from './routes/archives';

const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '..', 'data');

// CORS middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Initialize archive scanner
const scanner = new ArchiveScanner(DATA_PATH);

// Routes
app.use('/', createArchiveRouter(scanner));

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Archives API running on http://localhost:${PORT}`);
  console.log(`📁 Serving archives from: ${DATA_PATH}`);
});
