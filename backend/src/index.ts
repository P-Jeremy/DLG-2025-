import express from 'express';
import dotenv from 'dotenv';
import songsRouter from './application/routes/songs';
import { connectMongo } from './infrastructure/db/mongo';


// Charge .env uniquement si le fichier existe, sinon ignore silencieusement (utile pour la CI/tests)
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


// Export l'app pour les tests d'acceptance
export default app;

if (require.main === module) {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${port}`);
  });
}
