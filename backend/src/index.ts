import dotenv from 'dotenv';
import fs from 'fs';
if (fs.existsSync('.env')) {
  dotenv.config();
}

import express from 'express';
import helmet from 'helmet';
import songsRouter from './infrastructure/http/routes/songs';
import authRouter from './infrastructure/http/routes/auth';
import usersRouter from './infrastructure/http/routes/users';
import { connectMongo } from './infrastructure/db/mongo';

const app = express();
const port: number = Number(process.env.PORT) || 3000;

const mongoUri: string = process.env.MONGO_URI || '';
void connectMongo(mongoUri);

app.use(helmet());
app.use(express.json());
app.use('/api', songsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

export default app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
