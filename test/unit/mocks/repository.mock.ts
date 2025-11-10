export const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  increment: jest.fn(),
  softDelete: jest.fn(),
};

export const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

export const mockConfigService = {
  get: jest.fn(),
};
