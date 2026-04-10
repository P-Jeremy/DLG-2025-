import dotenv from 'dotenv';
import fs from 'fs';
if (fs.existsSync('.env')) {
  dotenv.config();
}

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import authRouter from './infrastructure/http/routes/auth';
import usersRouter from './infrastructure/http/routes/users';
import { createPlaylistsRouter } from './infrastructure/http/routes/playlists';
import { connectMongo } from './infrastructure/db/mongo';
import { createSongsRouter } from './infrastructure/http/routes/songs';
import { SocketEventEmitter } from './infrastructure/services/SocketEventEmitter';
import { requestLogger } from './infrastructure/http/middlewares/requestLogger';
import { errorLogger } from './infrastructure/http/middlewares/errorLogger';
import monitoringRouter from './infrastructure/http/routes/monitoring';

const app = express();
app.set('trust proxy', 1);
const allowedOrigin = process.env.ALLOWED_ORIGIN ?? '*';
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigin },
});

const port: number = Number(process.env.PORT) || 3000;

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('[Config] MONGO_URI is not defined — aborting.');
  process.exit(1);
}
void connectMongo(mongoUri);

app.use(cors({ origin: allowedOrigin }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json());
app.use(requestLogger);
app.use(monitoringRouter);

const socketEventEmitter = new SocketEventEmitter(io);

app.use('/api', createSongsRouter(socketEventEmitter));
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api', createPlaylistsRouter());
app.use(errorLogger);

export default app;
export { server };

if (require.main === module) {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
