// Define our own Tool interface
export interface ToolDefinition {
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (params: any) => Promise<unknown>;
} 