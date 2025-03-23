import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import usersProxy from './routes/users.js';
import tasksProxy from './routes/tasks.js';
import commentsProxy from './routes/comments.js';
import resetRoute from './routes/reset.js';

import logger from './utils/logger.js';


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));

// Logger
app.use(logger);

// Proxy routes
app.use('/api/users', usersProxy);
app.use('/api/tasks', tasksProxy);
app.use('/api/comments', commentsProxy);
app.use('/api/reset', resetRoute);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Gateway running ✅' });
});

app.listen(PORT, () => {
  console.log(`🚀 Gateway is live at http://localhost:${PORT}`);
});
