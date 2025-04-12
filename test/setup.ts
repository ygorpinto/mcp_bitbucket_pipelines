// Mock do ambiente para os testes
import { jest } from '@jest/globals';

// Mock do process.env
process.env.BITBUCKET_ACCESS_TOKEN = 'test-token';
process.env.BITBUCKET_WORKSPACE = 'test-workspace';
process.env.BITBUCKET_REPO_SLUG = 'test-repo';
process.env.BITBUCKET_API_URL = 'https://api.bitbucket.org/2.0';

// Mock do axios
jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    get: jest.fn(),
    post: jest.fn()
  })
})); 