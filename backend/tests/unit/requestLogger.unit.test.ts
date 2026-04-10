import { Request, Response, NextFunction } from 'express';
import { requestLogger } from '../../src/infrastructure/http/middlewares/requestLogger';

describe('requestLogger middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: { statusCode: number; on: jest.Mock };
  let mockNext: jest.Mock;
  let triggerFinish: () => void;

  beforeEach(() => {
    mockReq = { method: 'GET', path: '/test' };
    mockRes = {
      statusCode: 200,
      on: jest.fn((event: string, listener: () => void) => {
        if (event === 'finish') triggerFinish = listener;
      }),
    };
    mockNext = jest.fn();
  });

  it('should call next()', () => {
    requestLogger(mockReq as Request, mockRes as unknown as Response, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should register a finish listener on the response', () => {
    requestLogger(mockReq as Request, mockRes as unknown as Response, mockNext as unknown as NextFunction);

    expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('should log INFO level for 2xx responses', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    mockRes.statusCode = 200;

    requestLogger(mockReq as Request, mockRes as unknown as Response, mockNext as unknown as NextFunction);
    triggerFinish();

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));
    spy.mockRestore();
  });

  it('should log WARN level for 4xx responses', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    mockRes.statusCode = 404;

    requestLogger(mockReq as Request, mockRes as unknown as Response, mockNext as unknown as NextFunction);
    triggerFinish();

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'));
    spy.mockRestore();
  });

  it('should log ERROR level for 5xx responses', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    mockRes.statusCode = 500;

    requestLogger(mockReq as Request, mockRes as unknown as Response, mockNext as unknown as NextFunction);
    triggerFinish();

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'));
    spy.mockRestore();
  });
});
