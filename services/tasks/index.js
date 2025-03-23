import express from 'express';
import dotenv from 'dotenv';
import routes from './routes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use('/tasks', routes);

app.listen(PORT, () => {
  console.log(`✅ Task service running on http://localhost:${PORT}`);
});
