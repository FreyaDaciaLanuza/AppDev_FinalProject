const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); 
const auth = require('../middleware/auth'); 

// @route   GET /api/tasks
// @desc    Get all tasks for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // FIX: Changed 'user' to 'userId' to match Task.js schema
        const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        // FIX: Added priority, category, dueDate to destructuring
        const { title, description, priority, category, dueDate } = req.body;

        const newTask = new Task({
            title,
            description,
            priority,   // Now saving priority
            category,   // Now saving category
            dueDate,    // Now saving due date
            userId: req.userId // FIX: Changed 'user' to 'userId'
        });

        const task = await newTask.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, description, priority, category, dueDate, completed } = req.body;

        // Build a task object with the fields that were sent
        const taskFields = {};
        if (title) taskFields.title = title;
        if (description) taskFields.description = description;
        if (priority) taskFields.priority = priority;
        if (category) taskFields.category = category;
        if (dueDate) taskFields.dueDate = dueDate;
        
        // FIX: Changed 'isCompleted' to 'completed' to match schema and frontend
        if (completed !== undefined) taskFields.completed = completed;
        
        // Update timestamp
        taskFields.updatedAt = Date.now();

        let task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Ensure user owns the task
        // FIX: Changed 'user' to 'userId'
        if (task.userId.toString() !== req.userId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        task = await Task.findByIdAndUpdate(
            req.params.id,
            { $set: taskFields },
            { new: true } 
        );

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Ensure user owns the task
        // FIX: Changed 'user' to 'userId'
        if (task.userId.toString() !== req.userId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Task.findByIdAndDelete(req.params.id);

        res.json({ message: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;