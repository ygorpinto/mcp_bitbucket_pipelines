import { jest } from '@jest/globals';
import { mcp_bitbucket_trigger_pipeline } from '../../../src/tools/bitbucket-pipelines.js';
import { postMock, axiosCreateMock } from '../../mocks/axios.js';

// Mock do axios
jest.mock('axios', () => {
  return {
    create: jest.fn().mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    })
  };
});

describe('Bitbucket Pipelines Tools - Trigger Pipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mcp_bitbucket_trigger_pipeline', () => {
    it('should trigger a pipeline with valid target', async () => {
      // Criar um target válido
      const target = {
        ref_type: 'branch',
        type: 'pipeline_ref_target',
        ref_name: 'main'
      };

      // Mock de resposta do axios
      const mockResponse = {
        data: {
          uuid: 'new-pipeline-uuid',
          state: { name: 'PENDING' },
          target: {
            ref_type: 'branch',
            ref_name: 'main'
          }
        }
      };

      // Configuração do mock do axios
      postMock.mockResolvedValueOnce(mockResponse);

      // Chama a função
      const result = await mcp_bitbucket_trigger_pipeline.handler({ target });

      // Verifica o resultado
      expect(result).toEqual(mockResponse.data);

      // Verifica se o axios foi chamado corretamente
      expect(axiosCreateMock).toHaveBeenCalledWith({
        baseURL: 'https://api.bitbucket.org/2.0',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      
      expect(postMock).toHaveBeenCalledWith(
        '/repositories/test-workspace/test-repo/pipelines/',
        {
          target
        }
      );
    });

    it('should trigger a pipeline with target and variables', async () => {
      // Criar um target válido e variáveis
      const target = {
        ref_type: 'branch',
        type: 'pipeline_ref_target',
        ref_name: 'develop'
      };
      
      const variables = [
        { key: 'DEPLOY_ENV', value: 'staging', secured: false },
        { key: 'DEBUG', value: 'true', secured: false }
      ];

      // Mock de resposta do axios
      const mockResponse = {
        data: {
          uuid: 'new-pipeline-uuid',
          state: { name: 'PENDING' },
          target: {
            ref_type: 'branch',
            ref_name: 'develop'
          },
          variables: [
            { key: 'DEPLOY_ENV', value: 'staging' },
            { key: 'DEBUG', value: 'true' }
          ]
        }
      };

      // Configuração do mock do axios
      postMock.mockResolvedValueOnce(mockResponse);

      // Chama a função
      const result = await mcp_bitbucket_trigger_pipeline.handler({ target, variables });

      // Verifica o resultado
      expect(result).toEqual(mockResponse.data);

      // Verifica se o axios foi chamado corretamente
      expect(postMock).toHaveBeenCalledWith(
        '/repositories/test-workspace/test-repo/pipelines/',
        {
          target,
          variables
        }
      );
    });

    it('should validate target parameters', async () => {
      // Target inválido (faltando propriedades obrigatórias)
      const invalidTarget = {
        ref_name: 'main'
        // Faltando ref_type e type
      };

      // Chama a função e espera que lance erro de validação
      await expect(
        mcp_bitbucket_trigger_pipeline.handler({ target: invalidTarget as any })
      ).rejects.toThrow(); // Zod deve lançar erro de validação
    });

    it('should handle API errors', async () => {
      // Mock de erro do axios
      const mockError = {
        response: {
          status: 400,
          data: { error: { message: 'Invalid pipeline target' } }
        }
      };

      const target = {
        ref_type: 'branch',
        type: 'pipeline_ref_target',
        ref_name: 'non-existent-branch'
      };

      // Configuração do mock do axios para falhar
      postMock.mockRejectedValueOnce(mockError);

      // Chama a função e espera que lance erro
      await expect(
        mcp_bitbucket_trigger_pipeline.handler({ target })
      ).rejects.toThrow(
        `Failed to trigger pipeline: 400 - {"error":{"message":"Invalid pipeline target"}}`
      );
    });
  });
}); 