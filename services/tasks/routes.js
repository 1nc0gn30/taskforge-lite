import express from 'express';
import { tasks } from './cache.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET all tasks
router.get('/', (req, res) => {
  res.json(tasks);
});

// POST new task
router.post('/', (req, res) => {
  const {
    title,
    description = '',
    userId,
    priority = 'medium',
    dueDate = '',
    completed = false,
    createdAt = new Date().toISOString(),
  } = req.body;

  if (!title || !userId) {
    return res.status(400).json({ error: 'Title and userId are required' });
  }

  const newTask = {
    id: uuidv4(),
    title,
    description,
    userId,
    priority,
    dueDate,
    completed,
    createdAt,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT update a task
router.put('/:id', (req, res) => {
  const taskIndex = tasks.findIndex((t) => t.id === req.params.id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const existing = tasks[taskIndex];

  const updatedTask = {
    ...existing,
    ...req.body, // accept title, description, priority, etc.
  };

  tasks[taskIndex] = updatedTask;
  res.json(updatedTask);
});

// DELETE specific task
router.delete('/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const deleted = tasks.splice(index, 1);
  res.json({ message: 'Task deleted', task: deleted[0] });
});

// DELETE all tasks (used by reset)
router.delete('/', (req, res) => {
  tasks.length = 0;
  res.json({ message: 'All tasks cleared' });
});

export default router;
