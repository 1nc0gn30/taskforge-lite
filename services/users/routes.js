import express from 'express';
import { users } from './cache.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all users
router.get('/', (req, res) => {
  res.json(users);
});

// Create new user
router.post('/', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const newUser = {
    id: uuidv4(),
    name: name.trim(),
    email: email.trim()
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// Update user
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  users[userIndex] = {
    ...users[userIndex],
    name: name.trim(),
    email: email.trim()
  };

  res.json(users[userIndex]);
});

// Delete user by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const deletedUser = users.splice(index, 1)[0];
  res.json({ message: 'User deleted', user: deletedUser });
});

// Clear all users (dev only)
router.delete('/', (req, res) => {
  users.length = 0;
  res.json({ message: 'All users cleared' });
});

export default router;
