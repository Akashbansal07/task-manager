import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Dashboard from './Dashboard';
import TaskList from './TaskList';

function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 px-6 py-4 bg-white">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <ul className="flex space-x-6">
              <li>
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className={`${
                    currentPage === 'dashboard' 
                      ? 'text-indigo-600 font-medium' 
                      : 'text-gray-600 hover:text-gray-900'
                  } transition-colors duration-200`}
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('tasks')}
                  className={`${
                    currentPage === 'tasks' 
                      ? 'text-indigo-600 font-medium' 
                      : 'text-gray-600 hover:text-gray-900'
                  } transition-colors duration-200`}
                >
                  Task list
                </button>
              </li>
            </ul>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-gray-600">
                Welcome, {user.name}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Render either Dashboard or TaskList based on currentPage */}
          {currentPage === 'dashboard' ? (
            <Dashboard />
          ) : (
            <TaskList />
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;