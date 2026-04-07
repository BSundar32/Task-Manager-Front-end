import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/dashboard/StatsCard';
import { StatusBarChart, CategoryPieChart, PriorityBarChart } from '../components/dashboard/ProgressChart';
import Badge from '../components/common/Badge';
import { priorityConfig, statusConfig, formatDeadline } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, fetchStats } = useTask();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Good {getGreeting()}, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here's what's happening with your tasks today.
          </p>
        </div>
        <Link
          to="/tasks"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tasks"
          value={stats?.total || 0}
          subtitle="All your tasks"
          color="primary"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatsCard
          title="In Progress"
          value={stats?.inProgress || 0}
          subtitle="Currently working"
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <StatsCard
          title="Completed"
          value={stats?.completed || 0}
          subtitle={`${stats?.completionRate || 0}% completion rate`}
          color="emerald"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Overdue"
          value={stats?.overdue || 0}
          subtitle="Need immediate attention"
          color="red"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      {/* Completion rate bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">Overall Progress</h3>
          <span className="text-lg font-bold text-primary-600">{stats?.completionRate || 0}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${stats?.completionRate || 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>{stats?.completed || 0} completed</span>
          <span>{(stats?.total || 0) - (stats?.completed || 0)} remaining</span>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatusBarChart data={stats} />
        <CategoryPieChart data={stats?.byCategory} />
        <PriorityBarChart data={stats?.byPriority} />
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming deadlines */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Upcoming Deadlines</h3>
            <Link to="/tasks?sortBy=deadline" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              View all →
            </Link>
          </div>
          {!stats?.upcomingDeadlines?.length ? (
            <p className="text-sm text-slate-500 text-center py-6">No upcoming deadlines in the next 7 days</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingDeadlines.map((task) => (
                <Link
                  key={task._id}
                  to={`/tasks/${task._id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${priorityConfig[task.priority]?.dot || 'bg-slate-400'}`} />
                    <p className="text-sm text-slate-800 truncate">{task.title}</p>
                  </div>
                  <span className="text-xs text-amber-600 font-medium shrink-0 ml-2">{formatDeadline(task.deadline)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recently completed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Recently Completed</h3>
            <Link to="/tasks?status=completed" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              View all →
            </Link>
          </div>
          {!stats?.recentCompleted?.length ? (
            <p className="text-sm text-slate-500 text-center py-6">No tasks completed yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentCompleted.map((task) => (
                <Link
                  key={task._id}
                  to={`/tasks/${task._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-600 truncate flex-1">{task.title}</p>
                  <Badge className="bg-emerald-50 text-emerald-700 shrink-0">Done</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

export default Dashboard;
