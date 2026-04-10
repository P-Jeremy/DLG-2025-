import { Request, Response, NextFunction } from 'express';
import { errorLogger } from '../../src/infrastructure/http/middlewares/errorLogger';

describe('errorLogger middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = { method: 'GET', path: '/api/songs' };
    mockRes = {};
    mockNext = jest.fn();
  });

  it('should log the error name and message', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const err = new Error('something went wrong');
    err.name = 'TypeError';

    errorLogger(err, mockReq as Request, mockRes as Response, mockNext as unknown as NextFunction);

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('TypeError: something went wrong'));
    spy.mockRestore();
  });

  it('should include method and path in the log', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();

    errorLogger(new Error('oops'), mockReq as Request, mockRes as Response, mockNext as unknown as NextFunction);

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('GET /api/songs'));
    spy.mockRestore();
  });

  it('should call next with the error to preserve default Express error handling', () => {
    jest.spyOn(console, 'error').mockImplementation();
    const err = new Error('oops');

    errorLogger(err, mockReq as Request, mockRes as Response, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledWith(err);
  });
});
