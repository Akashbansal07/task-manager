const Task = require('../models/taskModel');
const expressAsyncHandler = require('express-async-handler');

// Create new task
const createTask = expressAsyncHandler(async (req, res) => {
    const { title, startTime, endTime, priority } = req.body;

    if (!title || !startTime || !endTime || !priority) {
        res.status(400);
        throw new Error("All fields are required");
    }

    if (priority < 1 || priority > 5) {
        res.status(400);
        throw new Error("Priority must be between 1 and 5");
    }

    if (new Date(endTime) <= new Date(startTime)) {
        res.status(400);
        throw new Error("End time must be after start time");
    }

    const task = await Task.create({
        title,
        startTime,
        endTime,
        priority,
        user: req.user._id,
        status: 'Pending'
    });

    res.status(201).json(task);
});

// Get all tasks with filters and sorting
const getTasks = expressAsyncHandler(async (req, res) => {
    const { priority, status, sortBy, sortOrder } = req.query;
    
    let query = { user: req.user._id };
    if (priority) query.priority = priority;
    if (status) query.status = status;

    let sort = {};
    if (sortBy) {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const tasks = await Task.find(query).sort(sort);
    res.json(tasks);
});

// Get task statistics
const getTaskStats = expressAsyncHandler(async (req, res) => {
    const now = new Date();
    const tasks = await Task.find({ user: req.user._id });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Finished').length;
    const pendingTasks = totalTasks - completedTasks;

    let totalCompletionTime = 0;
    let completedTaskCount = 0;
    let pendingTimeStats = Array(5).fill().map(() => ({
        timeLapsed: 0,
        timeToFinish: 0,
        count: 0
    }));

    tasks.forEach(task => {
        if (task.status === 'Finished') {
            const completionTime = (new Date(task.actualEndTime || task.updatedAt) - new Date(task.startTime)) / (1000 * 60 * 60);
            totalCompletionTime += completionTime;
            completedTaskCount++;
        } else {
            const priorityIndex = task.priority - 1;
            const timeLapsed = Math.max(0, (now - new Date(task.startTime)) / (1000 * 60 * 60));
            const timeToFinish = Math.max(0, (new Date(task.endTime) - now) / (1000 * 60 * 60));
            
            pendingTimeStats[priorityIndex].timeLapsed += timeLapsed;
            pendingTimeStats[priorityIndex].timeToFinish += timeToFinish;
            pendingTimeStats[priorityIndex].count++;
        }
    });

    res.json({
        totalTasks,
        completedPercentage: (completedTasks / totalTasks) * 100 || 0,
        pendingPercentage: (pendingTasks / totalTasks) * 100 || 0,
        averageCompletionTime: completedTaskCount ? totalCompletionTime / completedTaskCount : 0,
        pendingTimeStats: pendingTimeStats.map((stats, index) => ({
            priority: index + 1,
            averageTimeLapsed: stats.count ? stats.timeLapsed / stats.count : 0,
            averageTimeToFinish: stats.count ? stats.timeToFinish / stats.count : 0,
            pendingCount: stats.count
        }))
    });
});

// Update task
const updateTask = expressAsyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error("Task not found");
    }

    if (task.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to update this task");
    }

    const updates = { ...req.body };
    
    // If marking as finished, set actualEndTime
    if (updates.status === 'Finished' && task.status === 'Pending') {
        updates.actualEndTime = new Date();
    }

    const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
    );

    res.json(updatedTask);
});

// Delete task
// In taskController.js
const deleteTask = expressAsyncHandler(async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            res.status(404);
            throw new Error("Task not found");
        }

        if (task.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error("Not authorized to delete this task");
        }

        // Use findByIdAndDelete instead of remove()
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: "Task deleted successfully", id: req.params.id });
    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
});

module.exports = { 
    createTask,
    getTasks,
    getTaskStats,
    updateTask,
    deleteTask
};