import { jest } from '@jest/globals';

const getMock = jest.fn();
const postMock = jest.fn();

const axiosCreateMock = jest.fn().mockReturnValue({
  get: getMock,
  post: postMock,
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
});

const axios = {
  create: axiosCreateMock
};

export { axios, getMock, postMock, axiosCreateMock };
export default axios; 