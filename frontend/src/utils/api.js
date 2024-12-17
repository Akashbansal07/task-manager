const BASE_URL = 'http://localhost:5001';

export const fetchTasks = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/tasks`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

export const fetchTaskStats = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/tasks/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch task statistics');
  return response.json();
};

export const createTask = async (taskData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
};

export const updateTask = async (taskId, taskData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
};

// In utils/api.js
export const deleteTask = async (taskId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete task');
    }

    return response.json();
};