import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/index';

describe('GET /health (acceptance)', () => {
  afterEach(() => {
    delete (mongoose.connection as unknown as Record<string, unknown>)['readyState'];
  });

  it('should return 200 and ok status when MongoDB is connected', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should return 503 and degraded status when MongoDB is disconnected', async () => {
    Object.defineProperty(mongoose.connection, 'readyState', {
      get: () => 0,
      configurable: true,
    });

    const response = await request(app).get('/health');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: 'degraded' });
  });
});
