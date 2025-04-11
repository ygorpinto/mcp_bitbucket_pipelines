import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BitbucketClient } from './bitbucket-client';
import { Config, ConfigSchema } from './types';

export class BitbucketServer {
  private client: BitbucketClient;
  private config: Config;

  constructor(config: Config) {
    ConfigSchema.parse(config); // Validate config
    this.config = config;
    this.client = new BitbucketClient(config);
  }

  private authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    let token: string;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (authHeader.startsWith('Basic ')) {
      const decoded = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
      const [username, password] = decoded.split(':');
      token = password; // In Bitbucket app tokens, username is empty and token is the password
    } else {
      return res.status(401).json({ error: 'Invalid authorization format' });
    }

    if (token !== this.config.accessToken) {
      return res.status(401).json({ error: 'Invalid authorization token' });
    }

    next();
  }

  initializeRoutes(app: express.Application) {
    // Apply auth middleware to all API routes
    app.use('/api', this.authMiddleware.bind(this));

    // List pipelines - GET method since it's a read operation
    app.get('/api/pipelines', async (req: Request, res: Response) => {
      try {
        const schema = z.object({
          workspace: z.string(),
          repo_slug: z.string(),
          sort: z.string().optional(),
          page: z.number().int().positive().optional(),
          pagelen: z.number().int().min(1).max(100).optional(),
        });

        const { workspace, repo_slug, sort, page, pagelen } = schema.parse(req.query);
        const result = await this.client.listPipelines(workspace, repo_slug, sort, page, pagelen);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
      }
    });

    // Run pipeline - POST method for creating a new pipeline
    app.post('/api/pipelines', async (req: Request, res: Response) => {
      try {
        const schema = z.object({
          workspace: z.string(),
          repo_slug: z.string(),
          branch: z.string().optional(),
          commit: z.string().optional(),
          variables: z.record(z.string()).optional(),
        });

        const { workspace, repo_slug, branch, commit, variables } = schema.parse({ 
          workspace: req.query.workspace,
          repo_slug: req.query.repo_slug,
          ...req.body 
        });

        if (!branch && !commit) {
          throw new Error('Either branch or commit must be specified');
        }

        const request = {
          target: {
            type: 'pipeline_ref_target' as const,
            ...(branch ? { ref_type: 'branch' as const, ref_name: branch } : {}),
            ...(commit ? { commit: { type: 'commit' as const, hash: commit } } : {}),
          },
          variables: variables ? Object.entries(variables).map(([key, value]) => ({
            key,
            value: String(value),
            secured: false,
          })) : undefined,
        };

        const result = await this.client.runPipeline(workspace, repo_slug, request);
        res.status(201).json(result);
      } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
      }
    });

    // Get pipeline status - GET method since it's a read operation
    app.get('/api/pipelines/:pipelineUuid', async (req: Request, res: Response) => {
      try {
        const schema = z.object({
          workspace: z.string(),
          repo_slug: z.string(),
          pipelineUuid: z.string(),
        });

        const { workspace, repo_slug } = schema.parse(req.query);
        const { pipelineUuid } = schema.parse({ pipelineUuid: req.params.pipelineUuid });
        
        const result = await this.client.getPipelineStatus(workspace, repo_slug, pipelineUuid);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
      }
    });

    // Stop pipeline - POST method since it's modifying state
    app.post('/api/pipelines/:pipelineUuid/stop', async (req: Request, res: Response) => {
      try {
        const schema = z.object({
          workspace: z.string(),
          repo_slug: z.string(),
          pipelineUuid: z.string(),
        });

        const { workspace, repo_slug } = schema.parse(req.query);
        const { pipelineUuid } = schema.parse({ pipelineUuid: req.params.pipelineUuid });

        const result = await this.client.stopPipeline(workspace, repo_slug, pipelineUuid);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
      }
    });
  }
} 