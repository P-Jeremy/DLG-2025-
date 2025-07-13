import express from 'express';
import dotenv from 'dotenv';
import songsRouter from './application/routes/songs';
import { connectMongo } from './infrastructure/db/mongo';


import fs from 'fs';
if (fs.existsSync('.env')) {
  dotenv.config();
}

const app = express();
const port: number = Number(process.env.PORT) || 3000;

const mongoUri: string = process.env.MONGO_URI || '';
void connectMongo(mongoUri);

app.use(express.json());
app.use('/api', songsRouter);


export default app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
