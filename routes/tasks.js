const express = require('express');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Create a task
router.post('/', authenticate, async (req, res) => {
  const { title, description } = req.body;
  const task = new Task({ title, description, user: req.userId });
  await task.save();
  res.status(201).json(task);
});

// Get all tasks for the authenticated user
router.get('/', authenticate, async (req, res) => {
  const tasks = await Task.find({ user: req.userId });
  res.json(tasks);
});

// Update task
router.put('/:taskId', authenticate, async (req, res) => {
  const { taskId } = req.params;
  const { title, description, completed } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: taskId, user: req.userId },
    { title, description, completed },
    { new: true }
  );
  res.json(task);
});

// Delete task
router.delete('/:taskId', authenticate, async (req, res) => {
  const { taskId } = req.params;
  await Task.findOneAndDelete({ _id: taskId, user: req.userId });
  res.status(204).send();
});

module.exports = router;
