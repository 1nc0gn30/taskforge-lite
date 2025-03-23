import express from 'express';
import { comments } from './cache.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get comments for a task
router.get('/:taskId', (req, res) => {
  const taskComments = comments.filter(c => c.taskId === req.params.taskId);
  res.json(taskComments);
});

// Create comment for a task
router.post('/', (req, res) => {
  const { text, taskId, userId } = req.body;
  const newComment = { id: uuidv4(), text, taskId, userId };
  comments.push(newComment);
  res.status(201).json(newComment);
});

router.delete('/', (req, res) => {
    comments.length = 0;
    res.json({ message: 'All comments cleared' });
  });
  

export default router;
