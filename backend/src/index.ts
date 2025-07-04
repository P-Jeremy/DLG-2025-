import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.get('/', (_req, res) => {
  res.send('API DLG Monorepo - OK');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});