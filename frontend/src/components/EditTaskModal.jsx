import React, { useState, useEffect } from 'react';

const EditTaskModal = ({ isOpen, onClose, onUpdate, task }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    priority: '',
    status: '',
    startTime: '',
    endTime: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTaskData({
        title: task.title || '',
        priority: task.priority?.toString() || '',
        status: task.status || 'Pending',
        startTime: task.startTime ? new Date(task.startTime).toISOString().slice(0, 16) : '',
        endTime: task.endTime ? new Date(task.endTime).toISOString().slice(0, 16) : ''
      });
      setError('');
    }
  }, [task]);

  const validateDates = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate <= startDate) {
      setError('End time must be after start time');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate priority if changed
    if (taskData.priority) {
      const priority = parseInt(taskData.priority);
      if (priority < 1 || priority > 5) {
        setError('Priority must be between 1 and 5');
        return;
      }
    }

    // Validate dates if either is changed
    if (taskData.startTime && taskData.endTime) {
      if (!validateDates(taskData.startTime, taskData.endTime)) {
        return;
      }
    }

    const updates = { ...taskData };

    // If marking as finished, set actual end time
    if (taskData.status === 'Finished' && task.status === 'Pending') {
      updates.actualEndTime = new Date().toISOString();
    }

    // Convert priority to number if present
    if (updates.priority) {
      updates.priority = parseInt(updates.priority);
    }

    // Calculate time estimates for pending tasks
    if (updates.status === 'Pending' && (updates.startTime || updates.endTime)) {
      const startTime = new Date(updates.startTime || task.startTime);
      const endTime = new Date(updates.endTime || task.endTime);
      updates.estimatedTime = (endTime - startTime) / (1000 * 60 * 60);
    }

    onUpdate(updates);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">Edit task</h2>
        <p className="text-gray-600 mb-6">Task ID: {task?._id}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={taskData.title}
              onChange={(e) => setTaskData({...taskData, title: e.target.value})}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={task?.title}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority Select */}
            <div>
              <label className="block text-gray-700 mb-2">Priority (1-5)</label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Current ({task?.priority})</option>
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>Priority {num}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-gray-700 mb-2">Status</label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 text-sm">Pending</span>
                <button
                  type="button"
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                    taskData.status === 'Finished' ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  onClick={() => setTaskData({
                    ...taskData,
                    status: taskData.status === 'Pending' ? 'Finished' : 'Pending'
                  })}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${
                    taskData.status === 'Finished' ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
                <span className="text-gray-600 text-sm">Finished</span>
              </div>
            </div>
          </div>

          {/* DateTime Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Start time</label>
              <input
                type="datetime-local"
                value={taskData.startTime}
                onChange={(e) => setTaskData({...taskData, startTime: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                {taskData.status === 'Pending' ? 'Estimated End time' : 'Actual End time'}
              </label>
              <input
                type="datetime-local"
                value={taskData.endTime}
                onChange={(e) => setTaskData({...taskData, endTime: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Update
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-white text-gray-700 py-2 px-4 border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;