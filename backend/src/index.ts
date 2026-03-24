import dotenv from 'dotenv';
import fs from 'fs';
if (fs.existsSync('.env')) {
  dotenv.config();
}

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import authRouter from './infrastructure/http/routes/auth';
import usersRouter from './infrastructure/http/routes/users';
import tagsRouter from './infrastructure/http/routes/tags';
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

app.use(helmet());
app.use(express.json());

const socketEventEmitter = new SocketEventEmitter(io);

app.use('/api', createSongsRouter(socketEventEmitter));
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api', tagsRouter);

export default app;
export { server };

if (require.main === module) {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
