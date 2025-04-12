import { jest } from '@jest/globals';
import { mcp_bitbucket_list_pipelines } from '../../../src/tools/bitbucket-pipelines.js';
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

describe('Bitbucket Pipelines Tools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mcp_bitbucket_list_pipelines', () => {
    it('should list pipelines with default pagination parameters', async () => {
      // Mock de resposta do axios
      const mockResponse = {
        data: {
          page: 1,
          pagelen: 10,
          size: 2,
          values: [
            { uuid: 'pipeline-1', state: { name: 'COMPLETED' } },
            { uuid: 'pipeline-2', state: { name: 'IN_PROGRESS' } }
          ]
        }
      };

      // Configuração do mock do axios
      getMock.mockResolvedValueOnce(mockResponse);

      // Chama a função
      const result = await mcp_bitbucket_list_pipelines.handler({});

      // Verifica o resultado
      expect(result).toEqual(mockResponse.data);

      // Verifica se o axios foi chamado com os parâmetros corretos
      expect(axiosCreateMock).toHaveBeenCalledWith({
        baseURL: 'https://api.bitbucket.org/2.0',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      
      expect(getMock).toHaveBeenCalledWith(
        '/repositories/test-workspace/test-repo/pipelines/',
        {
          params: { page: 1, pagelen: 10 }
        }
      );
    });

    it('should list pipelines with custom pagination parameters', async () => {
      // Mock de resposta do axios
      const mockResponse = {
        data: {
          page: 2,
          pagelen: 5,
          size: 2,
          values: [
            { uuid: 'pipeline-3', state: { name: 'COMPLETED' } },
            { uuid: 'pipeline-4', state: { name: 'IN_PROGRESS' } }
          ]
        }
      };

      // Configuração do mock do axios
      getMock.mockResolvedValueOnce(mockResponse);

      // Chama a função com parâmetros personalizados
      const result = await mcp_bitbucket_list_pipelines.handler({ page: 2, pagelen: 5 });

      // Verifica o resultado
      expect(result).toEqual(mockResponse.data);

      // Verifica se o axios foi chamado com os parâmetros corretos
      expect(getMock).toHaveBeenCalledWith(
        '/repositories/test-workspace/test-repo/pipelines/',
        {
          params: { page: 2, pagelen: 5 }
        }
      );
    });

    it('should handle errors from the API', async () => {
      // Mock de erro do axios
      const mockError = {
        response: {
          status: 401,
          data: { error: { message: 'Unauthorized' } }
        }
      };

      // Configuração do mock do axios para falhar
      getMock.mockRejectedValueOnce(mockError);

      // Chama a função e espera que lance erro
      await expect(mcp_bitbucket_list_pipelines.handler({})).rejects.toThrow(
        `Failed to list pipelines: 401 - {"error":{"message":"Unauthorized"}}`
      );
    });

    it('should handle network errors', async () => {
      // Mock de erro sem resposta do servidor
      const mockError = new Error('Network Error');

      // Configuração do mock do axios para falhar
      getMock.mockRejectedValueOnce(mockError);

      // Chama a função e espera que lance erro
      await expect(mcp_bitbucket_list_pipelines.handler({})).rejects.toThrow(
        'Failed to list pipelines: Network Error'
      );
    });
  });
}); 