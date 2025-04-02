// don't write test errors to the console
jest.mock('./utils/logger.utils', () => ({
  getLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));
