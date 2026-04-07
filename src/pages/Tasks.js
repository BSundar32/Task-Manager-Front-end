import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import TaskCard from '../components/tasks/TaskCard';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const Tasks = () => {
  const [searchParams] = useSearchParams();
  const { tasks, loading, pagination, filters, fetchTasks, createTask, updateTask, deleteTask, updateFilters } = useTask();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Sync URL params to filters on mount
  useEffect(() => {
    const urlFilters = {};
    if (searchParams.get('status')) urlFilters.status = searchParams.get('status');
    if (searchParams.get('category')) urlFilters.category = searchParams.get('category');
    if (searchParams.get('priority')) urlFilters.priority = searchParams.get('priority');
    if (searchParams.get('sortBy')) urlFilters.sortBy = searchParams.get('sortBy');
    if (Object.keys(urlFilters).length > 0) updateFilters(urlFilters);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };

  const handleClearFilters = () => {
    updateFilters({ status: '', priority: '', category: '', search: '', sortBy: 'deadline', order: 'asc' });
  };

  const handleCreate = async (data) => {
    setCreating(true);
    try {
      await createTask(data);
      setShowCreateModal(false);
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateTask(id, { status });
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    await deleteTask(id);
  };

  const handlePageChange = (page) => {
    fetchTasks({ page });
  };

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const overdueCount = tasks.filter((t) => t.status === 'overdue').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">
            {pagination.total} task{pagination.total !== 1 ? 's' : ''}
            {overdueCount > 0 && (
              <span className="ml-2 text-red-600 font-medium">· {overdueCount} overdue</span>
            )}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }>
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <TaskFilters filters={filters} onFilterChange={handleFilterChange} onClear={handleClearFilters} />
      </div>

      {/* Task grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No tasks found</h3>
          <p className="text-slate-500 text-sm mb-6">
            {Object.values(filters).some(Boolean)
              ? 'Try adjusting your filters'
              : 'Create your first task to get started'}
          </p>
          {!Object.values(filters).some(Boolean) && (
            <Button onClick={() => setShowCreateModal(true)}>Create Task</Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    p === pagination.page
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
        size="lg"
      >
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          loading={creating}
        />
      </Modal>
    </div>
  );
};

export default Tasks;
