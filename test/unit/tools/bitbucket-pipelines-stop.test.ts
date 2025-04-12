import { jest } from '@jest/globals';
import { mcp_bitbucket_stop_pipeline } from '../../../src/tools/bitbucket-pipelines.js';
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

describe('Bitbucket Pipelines Tools - Stop Pipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mcp_bitbucket_stop_pipeline', () => {
    it('should stop a running pipeline with valid UUID', async () => {
      const uuid = 'running-pipeline-uuid';

      // Mock de resposta do axios
      const mockResponse = {
        data: {
          uuid: 'running-pipeline-uuid',
          state: {
            name: 'HALTED',
            stage: {
              name: 'HALTED'
            },
            result: {
              name: 'STOPPED'
            }
          }
        }
      };

      // Configuração do mock do axios
      postMock.mockResolvedValueOnce(mockResponse);

      // Chama a função
      const result = await mcp_bitbucket_stop_pipeline.handler({ uuid });

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
        '/repositories/test-workspace/test-repo/pipelines/running-pipeline-uuid/stopPipeline'
      );
    });

    it('should handle errors when pipeline is not running', async () => {
      const uuid = 'completed-pipeline-uuid';

      // Mock de erro do axios
      const mockError = {
        response: {
          status: 400,
          data: { error: { message: 'Pipeline is not in a running state' } }
        }
      };

      // Configuração do mock do axios para falhar
      postMock.mockRejectedValueOnce(mockError);

      // Chama a função e espera que lance erro
      await expect(
        mcp_bitbucket_stop_pipeline.handler({ uuid })
      ).rejects.toThrow(
        `Failed to stop pipeline: 400 - {"error":{"message":"Pipeline is not in a running state"}}`
      );
    });

    it('should handle not found pipeline errors', async () => {
      const uuid = 'non-existent-uuid';

      // Mock de erro do axios
      const mockError = {
        response: {
          status: 404,
          data: { error: { message: 'Pipeline not found' } }
        }
      };

      // Configuração do mock do axios para falhar
      postMock.mockRejectedValueOnce(mockError);

      // Chama a função e espera que lance erro
      await expect(
        mcp_bitbucket_stop_pipeline.handler({ uuid })
      ).rejects.toThrow(
        `Failed to stop pipeline: 404 - {"error":{"message":"Pipeline not found"}}`
      );
    });

    it('should handle permission errors', async () => {
      const uuid = 'valid-uuid';

      // Mock de erro do axios
      const mockError = {
        response: {
          status: 403,
          data: { error: { message: 'You do not have permission to stop this pipeline' } }
        }
      };

      // Configuração do mock do axios para falhar
      postMock.mockRejectedValueOnce(mockError);

      // Chama a função e espera que lance erro
      await expect(
        mcp_bitbucket_stop_pipeline.handler({ uuid })
      ).rejects.toThrow(
        `Failed to stop pipeline: 403 - {"error":{"message":"You do not have permission to stop this pipeline"}}`
      );
    });

    it('should require UUID parameter', async () => {
      // Não fornecemos o UUID
      // Esperamos que o parâmetro obrigatório seja validado

      // Isso deve ser verificado durante a definição do parâmetro no esquema Zod
      const schema = mcp_bitbucket_stop_pipeline.parameters;
      expect(schema.required).toContain('uuid');
    });
  });
}); 