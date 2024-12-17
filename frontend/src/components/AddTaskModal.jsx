import React, { useState } from 'react';

const AddTaskModal = ({ isOpen, onClose, onAdd }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    priority: '1', // Priority 1-5 only
    status: 'Pending', // Only Pending/Finished allowed
    startTime: '',
    endTime: ''
  });
  const [error, setError] = useState('');

  const validateDates = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();

    if (endDate <= startDate) {
      setError('End time must be after start time');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate priority range
    const priority = parseInt(taskData.priority);
    if (priority < 1 || priority > 5) {
      setError('Priority must be between 1 and 5');
      return;
    }

    // Validate dates
    if (!validateDates(taskData.startTime, taskData.endTime)) {
      return;
    }

    // Create new task
    const newTask = {
      ...taskData,
      priority: parseInt(taskData.priority),
      // Always start as Pending for new tasks
      status: 'Pending',
      // Calculate initial time estimates
      estimatedTime: (new Date(taskData.endTime) - new Date(taskData.startTime)) / (1000 * 60 * 60)
    };

    onAdd(newTask);
    onClose();
  };

  return (
    isOpen ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">Add new task</h2>
          
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
                required
              />
            </div>

            {/* Priority Select */}
            <div>
              <label className="block text-gray-700 mb-2">Priority (1-5)</label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>
                    Priority {num}
                  </option>
                ))}
              </select>
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
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Estimated End time</label>
                <input
                  type="datetime-local"
                  value={taskData.endTime}
                  onChange={(e) => setTaskData({...taskData, endTime: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Add task
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
    ) : null
  );
};

export default AddTaskModal;