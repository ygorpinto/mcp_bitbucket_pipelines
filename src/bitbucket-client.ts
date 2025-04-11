import axios, { AxiosInstance } from 'axios';
import { Config, PipelineRequest } from './types';

export class BitbucketClient {
  private client: AxiosInstance;

  constructor(private config: Config) {
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Accept': 'application/json',
      },
      validateStatus: (status) => {
        return status < 500; // Resolve only if the status code is less than 500
      }
    });

    // Add response interceptor for better error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('Bitbucket API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: {
              ...error.config?.headers,
              Authorization: 'Bearer [REDACTED]' // Don't log the actual token
            }
          }
        });
        throw error;
      }
    );
  }

  private getPipelineUrl(workspace: string, repoSlug: string, path: string = ''): string {
    return `/repositories/${workspace}/${repoSlug}/pipelines/${path}`.replace(/\/+/g, '/');
  }

  async listPipelines(workspace: string, repoSlug: string, sort: string = '-created_on', page: number = 1, pagelen: number = 10) {
    const response = await this.client.get(this.getPipelineUrl(workspace, repoSlug), {
      params: { sort, page, pagelen },
    });
    return response.data;
  }

  async runPipeline(workspace: string, repoSlug: string, request: PipelineRequest) {
    const response = await this.client.post(
      this.getPipelineUrl(workspace, repoSlug),
      request
    );
    return response.data;
  }

  async getPipelineStatus(workspace: string, repoSlug: string, pipelineUuid: string) {
    const response = await this.client.get(
      this.getPipelineUrl(workspace, repoSlug, pipelineUuid)
    );
    return response.data;
  }

  async stopPipeline(workspace: string, repoSlug: string, pipelineUuid: string) {
    const response = await this.client.post(
      this.getPipelineUrl(workspace, repoSlug, `${pipelineUuid}/stopPipeline`)
    );
    return response.data;
  }
} 