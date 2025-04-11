import { z } from 'zod';

export const ConfigSchema = z.object({
  accessToken: z.string(),
  apiBaseUrl: z.string().default('https://api.bitbucket.org/2.0'),
});

export type Config = z.infer<typeof ConfigSchema>;

export interface PipelineTarget {
  type: 'pipeline_ref_target';
  ref_type?: 'branch';
  ref_name?: string;
  commit?: {
    type: 'commit';
    hash: string;
  };
}

export interface PipelineVariable {
  key: string;
  value: string;
  secured: boolean;
}

export interface PipelineRequest {
  target: PipelineTarget;
  variables?: PipelineVariable[];
} 