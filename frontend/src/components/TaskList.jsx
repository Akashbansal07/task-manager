import React, { useState, useEffect } from 'react';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import { fetchTasks, createTask, updateTask, deleteTask } from '../utils/api';

const getPriorityColor = (priority, priorities) => {
  const max = Math.max(...priorities);
  const intensity = (priority / max) * 100;
  return `bg-indigo-${Math.round(intensity/10) * 100}`;
};

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [sortConfig, setSortConfig] = useState({ field: 'startTime', direction: 'asc' });
  const [filters, setFilters] = useState({ priority: 'all', status: 'all' });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUniquePriorities = () => {
    const priorities = tasks.map(task => task.priority);
    return [...new Set(priorities)].sort((a, b) => a - b);
  };

  const handleAddTask = async (taskData) => {
    try {
      setError(null);
      const newTask = await createTask(taskData);
      setTasks(prev => [...prev, newTask]);
      setIsAddModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      setError(null);
      const updatedTask = await updateTask(taskId, taskData);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? updatedTask : task
      ));
      setEditingTask(null);
    } catch (err) {
      setError(err.message);
    }
  };

// In TaskList.jsx
const handleDeleteSelected = async () => {
  try {
      setError(null);
      // Add loading state for delete operation
      setLoading(true);

      // Execute deletes one by one and catch any errors
      for (const taskId of selectedTasks) {
          try {
              await deleteTask(taskId);
          } catch (err) {
              console.error(`Failed to delete task ${taskId}:`, err);
              throw new Error(`Failed to delete some tasks. Please try again.`);
          }
      }

      // If all deletes successful, update the UI
      setTasks(prev => prev.filter(task => !selectedTasks.includes(task._id)));
      setSelectedTasks([]);
  } catch (err) {
      setError(err.message);
  } finally {
      setLoading(false);
  }
};

  const handleSort = (field) => {
    const newDirection = 
      field === sortConfig.field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    
    setSortConfig({ field, direction: newDirection });
    
    const sortedTasks = [...tasks].sort((a, b) => {
      if (field === 'startTime' || field === 'endTime') {
        return newDirection === 'asc' 
          ? new Date(a[field]) - new Date(b[field])
          : new Date(b[field]) - new Date(a[field]);
      }
      if (field === 'priority') {
        return newDirection === 'asc'
          ? a.priority - b.priority
          : b.priority - a.priority;
      }
      if (field === 'title') {
        return newDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });
    
    setTasks(sortedTasks);
  };

  const handleCheckbox = (taskId) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      }
      return [...prev, taskId];
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTasks(filteredTasks.map(task => task._id));
    } else {
      setSelectedTasks([]);
    }
  };

  const calculateTimeToFinish = (task) => {
    if (task.status === 'Finished') {
      return ((new Date(task.actualEndTime || task.updatedAt) - new Date(task.startTime)) / (1000 * 60 * 60)).toFixed(1);
    }

    const now = new Date();
    const endTime = new Date(task.endTime);
    const startTime = new Date(task.startTime);

    if (now > endTime) {
      return ((endTime - startTime) / (1000 * 60 * 60)).toFixed(1);
    }

    return ((endTime - startTime) / (1000 * 60 * 60)).toFixed(1);
  };

  const filteredTasks = tasks.filter(task => {
    const priorityMatch = filters.priority === 'all' || task.priority.toString() === filters.priority;
    const statusMatch = filters.status === 'all' || task.status === filters.status;
    return priorityMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-xl text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  const uniquePriorities = getUniquePriorities();

  return (
    <div className="min-h-screen bg-white p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Task list</h1>

        <div className="flex justify-between items-center mb-6">
          <div className="space-x-4">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
            >
              + Add task
            </button>
            <button 
              onClick={handleDeleteSelected}
              disabled={selectedTasks.length === 0}
              className={`px-4 py-2 border border-red-400 text-red-400 rounded-md ${
                selectedTasks.length > 0 ? 'hover:bg-red-50' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              🗑 Delete selected
            </button>
          </div>

          <div className="flex space-x-4">
            <select 
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-4 py-2 border rounded-md bg-white"
            >
              <option value="all">All Priorities</option>
              {uniquePriorities.map(priority => (
                <option key={priority} value={priority}>
                  Priority {priority}
                </option>
              ))}
            </select>

            <select 
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 border rounded-md bg-white"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Finished">Finished</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="w-12 px-4 py-3">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedTasks.length > 0 && selectedTasks.length === filteredTasks.length}
                    className="rounded"
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-gray-600 cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  Title {sortConfig.field === 'title' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </th>
                <th 
                  className="px-4 py-3 text-left text-gray-600 cursor-pointer"
                  onClick={() => handleSort('priority')}
                >
                  Priority {sortConfig.field === 'priority' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </th>
                <th className="px-4 py-3 text-left text-gray-600">Status</th>
                <th 
                  className="px-4 py-3 text-left text-gray-600 cursor-pointer"
                  onClick={() => handleSort('startTime')}
                >
                  Start Time {sortConfig.field === 'startTime' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </th>
                <th 
                  className="px-4 py-3 text-left text-gray-600 cursor-pointer"
                  onClick={() => handleSort('endTime')}
                >
                  End Time {sortConfig.field === 'endTime' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </th>
                <th className="px-4 py-3 text-left text-gray-600">Time (hrs)</th>
                <th className="px-4 py-3 text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox"
                      checked={selectedTasks.includes(task._id)}
                      onChange={() => handleCheckbox(task._id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">{task.title}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-sm ${getPriorityColor(task.priority, uniquePriorities)} text-white`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      task.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(task.startTime).toLocaleString()}</td>
                  <td className="px-4 py-3">{new Date(task.endTime).toLocaleString()}</td>
                  <td className="px-4 py-3">{calculateTimeToFinish(task)}</td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => setEditingTask(task)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTask}
        currentPriorities={uniquePriorities}
      />

      <EditTaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onUpdate={(taskData) => handleUpdateTask(editingTask._id, taskData)}
        task={editingTask}
        currentPriorities={uniquePriorities}
      />
    </div>
  );
};

export default TaskList;