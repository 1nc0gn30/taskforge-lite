// services/users/index.js
import express from 'express';
import dotenv from 'dotenv';
import routes from './routes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// THIS MUST BE EXACT
app.use('/users', routes);

app.listen(PORT, () => {
  console.log(`🧑‍💼 User service running on http://localhost:${PORT}`);
});
