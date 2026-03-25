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
import { createTagsRouter } from './infrastructure/http/routes/tags';
import { createPlaylistsRouter } from './infrastructure/http/routes/playlists';
import { connectMongo } from './infrastructure/db/mongo';
import { createSongsRouter } from './infrastructure/http/routes/songs';
import { SocketEventEmitter } from './infrastructure/services/SocketEventEmitter';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const port: number = Number(process.env.PORT) || 3000;

const mongoUri: string = process.env.MONGO_URI || '';
void connectMongo(mongoUri);

const allowedOrigin = process.env.ALLOWED_ORIGIN ?? '*';

app.use(cors({ origin: allowedOrigin }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json());

const socketEventEmitter = new SocketEventEmitter(io);

app.use('/api', createSongsRouter(socketEventEmitter));
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api', createTagsRouter());
app.use('/api', createPlaylistsRouter());

export default app;
export { server };

if (require.main === module) {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
