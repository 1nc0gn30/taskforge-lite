import express from 'express';
import dotenv from 'dotenv';
import routes from './routes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use('/comments', routes);

app.listen(PORT, () => {
  console.log(`💬 Comment service running on http://localhost:${PORT}`);
});
