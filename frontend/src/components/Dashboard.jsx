import React, { useState, useEffect } from 'react';
import { fetchTaskStats } from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTaskStats();
      
      // Ensure priority stats are sorted and include all priorities 1-5
      const completeStats = Array.from({ length: 5 }, (_, i) => {
        const existingStat = data.pendingTimeStats.find(stat => stat.priority === i + 1);
        return existingStat || {
          priority: i + 1,
          pendingCount: 0,
          averageTimeLapsed: 0,
          averageTimeToFinish: 0
        };
      }).sort((a, b) => a.priority - b.priority);

      setStats({
        ...data,
        pendingTimeStats: completeStats
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeStats = (stats) => {
    const now = new Date();
    return stats.pendingTimeStats.map(stat => ({
      ...stat,
      // Ensure no negative values for time to finish
      adjustedTimeToFinish: Math.max(0, stat.averageTimeToFinish),
      // Calculate total time based on the rules
      totalEstimatedTime: stat.pendingCount * (
        stat.averageTimeLapsed + Math.max(0, stat.averageTimeToFinish)
      )
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-xl text-gray-600">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const timeStats = calculateTimeStats(stats);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Dashboard</h1>

        {/* Summary Section */}
        <div className="mb-12">
          <h2 className="text-xl text-gray-700 mb-6">Summary</h2>
          <div className="grid grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-4xl font-bold text-indigo-600 mb-2">{stats.totalTasks}</p>
              <p className="text-gray-600">Total tasks</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-4xl font-bold text-indigo-600 mb-2">
                {stats.completedPercentage.toFixed(1)}%
              </p>
              <p className="text-gray-600">Tasks completed</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-4xl font-bold text-indigo-600 mb-2">
                {stats.pendingPercentage.toFixed(1)}%
              </p>
              <p className="text-gray-600">Tasks pending</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-4xl font-bold text-indigo-600 mb-2">
                {stats.averageCompletionTime.toFixed(1)} hrs
              </p>
              <p className="text-gray-600">Average completion time</p>
            </div>
          </div>
        </div>

        {/* Pending Tasks by Priority */}
        <div className="mb-12">
          <h2 className="text-xl text-gray-700 mb-6">Pending Tasks by Priority</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-gray-600">Priority Level</th>
                  <th className="px-6 py-3 text-left text-gray-600">Pending Tasks</th>
                  <th className="px-6 py-3 text-left text-gray-600">Time Lapsed (hrs)</th>
                  <th className="px-6 py-3 text-left text-gray-600">Estimated Time Left (hrs)</th>
                  <th className="px-6 py-3 text-left text-gray-600">Total Time (hrs)</th>
                </tr>
              </thead>
              <tbody>
                {timeStats.map((stat) => (
                  <tr key={stat.priority} className="border-b border-gray-200">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        `bg-priority-${stat.priority}`
                      }`}>
                        Priority {stat.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">{stat.pendingCount}</td>
                    <td className="px-6 py-4">{stat.averageTimeLapsed.toFixed(1)}</td>
                    <td className="px-6 py-4">{stat.adjustedTimeToFinish.toFixed(1)}</td>
                    <td className="px-6 py-4">{stat.totalEstimatedTime.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Time Summary */}
        <div>
          <h2 className="text-xl text-gray-700 mb-6">Overall Time Summary</h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-4xl font-bold text-indigo-600 mb-2">
                {timeStats.reduce((total, stat) => 
                  total + (stat.averageTimeLapsed * stat.pendingCount), 0).toFixed(1)} hrs
              </p>
              <p className="text-gray-600">Total Time Lapsed</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-4xl font-bold text-indigo-600 mb-2">
                {timeStats.reduce((total, stat) => 
                  total + (stat.adjustedTimeToFinish * stat.pendingCount), 0).toFixed(1)} hrs
              </p>
              <p className="text-gray-600">Total Time Remaining</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;