import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import * as dotenv from 'dotenv';
import { 
  mcp_bitbucket_list_pipelines,
  mcp_bitbucket_trigger_pipeline,
  mcp_bitbucket_get_pipeline_status,
  mcp_bitbucket_stop_pipeline
} from './tools/bitbucket-pipelines.js';

// Carrega as variáveis de ambiente
dotenv.config();

// Validate environment variables
const envSchema = z.object({
  BITBUCKET_ACCESS_TOKEN: z.string(),
  BITBUCKET_WORKSPACE: z.string(),
  BITBUCKET_REPO_SLUG: z.string(),
  BITBUCKET_API_URL: z.string().default('https://api.bitbucket.org/2.0')
});

// Main function to initialize and run the MCP server
async function main() {
  try {
    // Parse and validate environment variables
    const env = envSchema.safeParse(process.env);
    if (!env.success) {
      console.error('Environment validation failed:', env.error.format());
      process.exit(1);
    }

    // Initialize MCP server with StdioServerTransport
    const server = new McpServer({
      name: "Bitbucket Pipelines MCP",
      version: "1.0.0"
    });

    // Register tools
    server.tool('mcp_bitbucket_list_pipelines', 
      "List Bitbucket Pipelines with pagination support",
      async () => {
        try {
          const result = await mcp_bitbucket_list_pipelines.handler({
            page: 1,
            pagelen: 10
          });
          return {
            content: [{
              type: "text",
              text: JSON.stringify(result)
            }]
          };
        } catch (error) {
          return {
            isError: true,
            content: [{
              type: "text",
              text: `Error listing pipelines: ${error instanceof Error ? error.message : String(error)}`
            }]
          };
        }
      }
    );

    server.tool('mcp_bitbucket_trigger_pipeline', 
      "Trigger a new Bitbucket Pipeline",
      async () => {
        try {
          // Hardcoded example for demonstration
          const result = await mcp_bitbucket_trigger_pipeline.handler({
            target: {
              ref_type: "branch",
              type: "pipeline_ref_target",
              ref_name: "main"
            }
          });
          
          return {
            content: [{
              type: "text",
              text: JSON.stringify(result)
            }]
          };
        } catch (error) {
          return {
            isError: true,
            content: [{
              type: "text",
              text: `Error triggering pipeline: ${error instanceof Error ? error.message : String(error)}`
            }]
          };
        }
      }
    );

    server.tool('mcp_bitbucket_get_pipeline_status',
      "Get the status of a specific Bitbucket Pipeline",
      async () => {
        try {
          // This is just a placeholder - in real use you'd want to get the UUID from parameters
          const uuid = "example-pipeline-uuid";
          
          const result = await mcp_bitbucket_get_pipeline_status.handler({
            uuid
          });
          
          return {
            content: [{
              type: "text",
              text: JSON.stringify(result)
            }]
          };
        } catch (error) {
          return {
            isError: true,
            content: [{
              type: "text",
              text: `Error getting pipeline status: ${error instanceof Error ? error.message : String(error)}`
            }]
          };
        }
      }
    );

    server.tool('mcp_bitbucket_stop_pipeline',
      "Stop a running Bitbucket Pipeline",
      async () => {
        try {
          // This is just a placeholder - in real use you'd want to get the UUID from parameters
          const uuid = "example-pipeline-uuid";
          
          const result = await mcp_bitbucket_stop_pipeline.handler({
            uuid
          });
          
          return {
            content: [{
              type: "text",
              text: JSON.stringify(result)
            }]
          };
        } catch (error) {
          return {
            isError: true,
            content: [{
              type: "text",
              text: `Error stopping pipeline: ${error instanceof Error ? error.message : String(error)}`
            }]
          };
        }
      }
    );

    // Connect to the transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.log('MCP Server started successfully');
  } catch (error) {
    console.error('Failed to start MCP server:', error);
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

// Start the server
main(); 