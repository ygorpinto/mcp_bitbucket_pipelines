import express from 'express';
import { z } from 'zod';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { 
  mcp_bitbucket_list_pipelines,
  mcp_bitbucket_trigger_pipeline,
  mcp_bitbucket_get_pipeline_status,
  mcp_bitbucket_stop_pipeline
} from './tools/bitbucket-pipelines';

// Types for MCP
type MCPTool = {
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: (params: any) => Promise<unknown>;
};

type MCPTools = {
  [key: string]: MCPTool;
};

type MCPRequest = {
  tool: string;
  params?: Record<string, unknown>;
};

// Validate environment variables
const envSchema = z.object({
  BITBUCKET_ACCESS_TOKEN: z.string(),
  BITBUCKET_WORKSPACE: z.string(),
  BITBUCKET_REPO_SLUG: z.string(),
  PORT: z.string().default('3444'),
  BITBUCKET_API_URL: z.string().default('https://api.bitbucket.org/2.0')
});

const env = envSchema.parse(process.env);
const port = parseInt(env.PORT);

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Health check endpoints
app.get('/', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Register MCP Tools
const tools: MCPTools = {
  mcp_bitbucket_list_pipelines,
  mcp_bitbucket_trigger_pipeline,
  mcp_bitbucket_get_pipeline_status,
  mcp_bitbucket_stop_pipeline
};

app.post('/mcp', async (req, res) => {
  const { tool, params }: MCPRequest = req.body;

  if (!tool || !tools[tool]) {
    return res.status(400).json({ error: `Tool '${tool}' not found` });
  }

  try {
    const result = await tools[tool].handler(params || {});
    res.json(result);
  } catch (error: any) {
    console.error(`Error executing tool ${tool}:`, error);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data
    });
  }
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

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
app.listen(port, () => {
  console.log(`MCP Server running on port ${port}`);
  console.log(`Health check available at http://localhost:${port}/health`);
}); 