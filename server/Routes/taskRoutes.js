// In taskRoutes.js
const express = require('express');
const { 
    createTask,
    getTasks,
    getTaskStats,
    updateTask,
    deleteTask
} = require('../Controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getTasks)
    .post(createTask);

router.get('/stats', getTaskStats);

router.route('/:id')
    .put(updateTask)
    .delete(deleteTask);  // Make sure this is properly set up

module.exports = router;