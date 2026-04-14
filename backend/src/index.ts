import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import carbonRouter from './routes/carbon';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cloud-carbon-tracker-backend' });
});

app.use('/api/carbon', carbonRouter);

app.listen(PORT, () => {
  console.log(`Cloud Carbon Tracker backend running on http://localhost:${PORT}`);
});
