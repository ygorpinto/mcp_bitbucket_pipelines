import { jest } from '@jest/globals';
import { mcp_bitbucket_get_pipeline_status } from '../../../src/tools/bitbucket-pipelines.js';
import { getMock, axiosCreateMock } from '../../mocks/axios.js';

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

describe('Bitbucket Pipelines Tools - Get Pipeline Status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mcp_bitbucket_get_pipeline_status', () => {
    it('should get pipeline status with valid UUID', async () => {
      const uuid = 'pipeline-uuid-123';

      // Mock de resposta do axios
      const mockResponse = {
        data: {
          uuid: 'pipeline-uuid-123',
          build_number: 42,
          created_on: '2023-04-11T10:00:00Z',
          completed_on: '2023-04-11T10:05:30Z',
          state: {
            name: 'COMPLETED',
            stage: {
              name: 'COMPLETED'
            },
            result: {
              name: 'SUCCESSFUL'
            }
          },
          target: {
            ref_name: 'main',
            ref_type: 'branch',
            type: 'pipeline_ref_target'
          }
        }
      };

      // Configuração do mock do axios
      getMock.mockResolvedValueOnce(mockResponse);

      // Chama a função
      const result = await mcp_bitbucket_get_pipeline_status.handler({ uuid });

      // Verifica o resultado
      expect(result).toEqual(mockResponse.data);

      // Verifica se o axios foi chamado corretamente
      expect(axiosCreateMock).toHaveBeenCalledWith({
        baseURL: 'https://api.bitbucket.org/2.0',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      
      expect(getMock).toHaveBeenCalledWith(
        '/repositories/test-workspace/test-repo/pipelines/pipeline-uuid-123'
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
      getMock.mockRejectedValueOnce(mockError);

      // Chama a função e espera que lance erro
      await expect(
        mcp_bitbucket_get_pipeline_status.handler({ uuid })
      ).rejects.toThrow(
        `Failed to get pipeline status: 404 - {"error":{"message":"Pipeline not found"}}`
      );
    });

    it('should handle network errors', async () => {
      const uuid = 'valid-uuid';

      // Mock de erro sem resposta do servidor
      const mockError = new Error('Network Error');

      // Configuração do mock do axios para falhar
      getMock.mockRejectedValueOnce(mockError);

      // Chama a função e espera que lance erro
      await expect(
        mcp_bitbucket_get_pipeline_status.handler({ uuid })
      ).rejects.toThrow(
        'Failed to get pipeline status: Network Error'
      );
    });

    it('should require UUID parameter', async () => {
      // Não fornecemos o UUID
      // Esperamos que o parâmetro obrigatório seja validado

      // Tentativa de chamar o handler sem uuid deve falhar
      // Isso deve ser verificado durante a definição do parâmetro no esquema Zod
      const schema = mcp_bitbucket_get_pipeline_status.parameters;
      expect(schema.required).toContain('uuid');
    });
  });
}); 