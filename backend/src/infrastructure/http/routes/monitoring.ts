import { Router } from 'express';
import mongoose from 'mongoose';

const MONGOOSE_READY_STATE_CONNECTED = 1;

const monitoringRouter = Router();

monitoringRouter.get('/health', (_req, res) => {
  const mongoConnected = (mongoose.connection.readyState as number) === MONGOOSE_READY_STATE_CONNECTED;
  const httpStatus = mongoConnected ? 200 : 503;

  res.status(httpStatus).json({
    status: mongoConnected ? 'ok' : 'degraded',
  });
});

export default monitoringRouter;
