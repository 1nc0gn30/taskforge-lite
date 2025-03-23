import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const SERVICES = {
  users: process.env.USERS_SERVICE_URL,
  tasks: process.env.TASKS_SERVICE_URL,
  comments: process.env.COMMENTS_SERVICE_URL,
};

router.delete('/', async (req, res) => {
  try {
    const results = await Promise.allSettled([
      axios.delete(`${SERVICES.users}/users`),
      axios.delete(`${SERVICES.tasks}/tasks`),
      axios.delete(`${SERVICES.comments}/comments`),
    ]);

    const response = results.map((r, i) => ({
      service: Object.keys(SERVICES)[i],
      status: r.status,
      result: r.value?.data || r.reason?.message,
    }));

    res.json({ message: 'Reset completed', services: response });
  } catch (err) {
    console.error('[GATEWAY] Reset error:', err.message);
    res.status(500).json({ error: 'Reset failed', details: err.message });
  }
});

export default router;
