import { createContext, useContext, useState, useCallback } from 'react';
import { tasksAPI } from '../services/api';
import toast from 'react-hot-toast';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filters, setFilters] = useState({
    status: '', priority: '', category: '', search: '', sortBy: 'deadline', order: 'asc',
  });

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await tasksAPI.getAll({ ...filters, ...params });
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch (err) {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await tasksAPI.getStats();
      setStats(data.stats);
    } catch {}
  }, []);

  const createTask = async (taskData) => {
    const { data } = await tasksAPI.create(taskData);
    setTasks((prev) => [data.task, ...prev]);
    toast.success('Task created successfully!');
    return data.task;
  };

  const updateTask = async (id, taskData) => {
    const { data } = await tasksAPI.update(id, taskData);
    setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));
    toast.success('Task updated!');
    return data.task;
  };

  const deleteTask = async (id) => {
    await tasksAPI.delete(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
    toast.success('Task deleted');
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <TaskContext.Provider
      value={{
        tasks, stats, loading, pagination, filters,
        fetchTasks, fetchStats, createTask, updateTask, deleteTask, updateFilters,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTask must be used within TaskProvider');
  return ctx;
};
