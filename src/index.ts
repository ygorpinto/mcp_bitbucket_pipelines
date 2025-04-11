import express from 'express';
import { z } from 'zod';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { BitbucketServer } from './server';
import { Config } from './types';

const app = express();
const port = process.env.PORT || 3444;

// Security and utility middleware
app.use(helmet()); // Adds various HTTP headers for security
app.use(morgan('combined')); // Request logging
app.use(cors()); // Enable CORS
app.use(express.json());

// Root endpoint for health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

async function main() {
  const config: Config = {
    accessToken: process.env.BITBUCKET_ACCESS_TOKEN || '',
    apiBaseUrl: process.env.BITBUCKET_API_URL || 'https://api.bitbucket.org/2.0',
  };

  if (!config.accessToken) {
    throw new Error('BITBUCKET_ACCESS_TOKEN environment variable is required');
  }

  const server = new BitbucketServer(config);
  
  // Initialize Bitbucket server routes
  server.initializeRoutes(app);

  try {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Health check available at http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 