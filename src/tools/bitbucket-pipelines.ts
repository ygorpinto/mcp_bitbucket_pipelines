import { z } from 'zod';
import axios from 'axios';

// Interfaces for Pipeline types
interface PipelineVariable {
  key: string;
  value: string;
  secured?: boolean;
}

interface PipelineSelector {
  type: string;
  pattern: string;
}

interface PipelineTarget {
  ref_type: string;
  type: string;
  ref_name: string;
  selector?: PipelineSelector;
}

interface TriggerPipelineParams {
  target: PipelineTarget;
  variables?: PipelineVariable[];
}

// Schema for pipeline variables
const PipelineVariableSchema = z.object({
  key: z.string(),
  value: z.string(),
  secured: z.boolean().optional()
});

// Schema for pipeline target
const PipelineTargetSchema = z.object({
  ref_type: z.string(),
  type: z.string(),
  ref_name: z.string(),
  selector: z.object({
    type: z.string(),
    pattern: z.string()
  }).optional()
});

// Tool: List Pipelines
export const mcp_bitbucket_list_pipelines = {
  description: "List Bitbucket Pipelines with pagination support",
  parameters: {
    type: "object",
    properties: {
      page: {
        type: "number",
        description: "Page number for pagination",
        default: 1
      },
      pagelen: {
        type: "number",
        description: "Number of items per page",
        default: 10
      }
    }
  },
  async handler({ page = 1, pagelen = 10 }: { page?: number; pagelen?: number }) {
    const client = axios.create({
      baseURL: process.env.BITBUCKET_API_URL || 'https://api.bitbucket.org/2.0',
      headers: {
        'Authorization': `Bearer ${process.env.BITBUCKET_ACCESS_TOKEN}`
      }
    });

    const response = await client.get(
      `/repositories/${process.env.BITBUCKET_WORKSPACE}/${process.env.BITBUCKET_REPO_SLUG}/pipelines/`,
      {
        params: { page, pagelen }
      }
    );

    return response.data;
  }
};

// Tool: Trigger Pipeline
export const mcp_bitbucket_trigger_pipeline = {
  description: "Trigger a new Bitbucket Pipeline",
  parameters: {
    type: "object",
    properties: {
      target: {
        type: "object",
        description: "Pipeline target configuration",
        required: ["ref_type", "type", "ref_name"]
      },
      variables: {
        type: "array",
        description: "Optional pipeline variables",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            value: { type: "string" },
            secured: { type: "boolean" }
          }
        }
      }
    },
    required: ["target"]
  },
  async handler({ target, variables }: TriggerPipelineParams) {
    const validatedTarget = PipelineTargetSchema.parse(target);
    const validatedVariables = variables ? 
      variables.map((v: PipelineVariable) => PipelineVariableSchema.parse(v)) : 
      undefined;

    const client = axios.create({
      baseURL: process.env.BITBUCKET_API_URL || 'https://api.bitbucket.org/2.0',
      headers: {
        'Authorization': `Bearer ${process.env.BITBUCKET_ACCESS_TOKEN}`
      }
    });

    const response = await client.post(
      `/repositories/${process.env.BITBUCKET_WORKSPACE}/${process.env.BITBUCKET_REPO_SLUG}/pipelines/`,
      {
        target: validatedTarget,
        ...(validatedVariables && { variables: validatedVariables })
      }
    );

    return response.data;
  }
};

// Tool: Get Pipeline Status
export const mcp_bitbucket_get_pipeline_status = {
  description: "Get the status of a specific Bitbucket Pipeline",
  parameters: {
    type: "object",
    properties: {
      uuid: {
        type: "string",
        description: "UUID of the pipeline"
      }
    },
    required: ["uuid"]
  },
  async handler({ uuid }: { uuid: string }) {
    const client = axios.create({
      baseURL: process.env.BITBUCKET_API_URL || 'https://api.bitbucket.org/2.0',
      headers: {
        'Authorization': `Bearer ${process.env.BITBUCKET_ACCESS_TOKEN}`
      }
    });

    const response = await client.get(
      `/repositories/${process.env.BITBUCKET_WORKSPACE}/${process.env.BITBUCKET_REPO_SLUG}/pipelines/${uuid}`
    );

    return response.data;
  }
};

// Tool: Stop Pipeline
export const mcp_bitbucket_stop_pipeline = {
  description: "Stop a running Bitbucket Pipeline",
  parameters: {
    type: "object",
    properties: {
      uuid: {
        type: "string",
        description: "UUID of the pipeline to stop"
      }
    },
    required: ["uuid"]
  },
  async handler({ uuid }: { uuid: string }) {
    const client = axios.create({
      baseURL: process.env.BITBUCKET_API_URL || 'https://api.bitbucket.org/2.0',
      headers: {
        'Authorization': `Bearer ${process.env.BITBUCKET_ACCESS_TOKEN}`
      }
    });

    const response = await client.post(
      `/repositories/${process.env.BITBUCKET_WORKSPACE}/${process.env.BITBUCKET_REPO_SLUG}/pipelines/${uuid}/stopPipeline`
    );

    return response.data;
  }
}; 