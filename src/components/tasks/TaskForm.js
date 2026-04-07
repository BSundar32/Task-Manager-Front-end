import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import Button from '../common/Button';
import { usersAPI } from '../../services/api';

const TaskForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAssignees, setSelectedAssignees] = useState(
    initialData?.assignees || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      deadline: initialData?.deadline
        ? format(new Date(initialData.deadline), 'yyyy-MM-dd')
        : '',
      priority: initialData?.priority || 'medium',
      status: initialData?.status || 'pending',
      category: initialData?.category || 'other',
      tags: initialData?.tags?.join(', ') || '',
    },
  });

  useEffect(() => {
    if (!assigneeSearch.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await usersAPI.search({ search: assigneeSearch });
        setSearchResults(data.users);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [assigneeSearch]);

  const addAssignee = (user) => {
    if (!selectedAssignees.find((a) => (a._id || a) === user._id)) {
      setSelectedAssignees((prev) => [...prev, user]);
    }
    setAssigneeSearch('');
    setSearchResults([]);
  };

  const removeAssignee = (userId) => {
    setSelectedAssignees((prev) => prev.filter((a) => (a._id || a) !== userId));
  };

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      assignees: selectedAssignees.map((a) => a._id || a),
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });
  };

  const inputClass = `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
    errors ? 'border-red-300' : 'border-slate-300'
  }`;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Task Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register('title', { required: 'Title is required' })}
          placeholder="Enter task title..."
          className={inputClass}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Describe the task..."
          className={inputClass + ' resize-none'}
        />
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Deadline <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          {...register('deadline', { required: 'Deadline is required' })}
          className={inputClass}
        />
        {errors.deadline && <p className="mt-1 text-xs text-red-500">{errors.deadline.message}</p>}
      </div>

      {/* Priority + Status row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
          <select {...register('priority')} className={inputClass}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
          <select {...register('status')} className={inputClass}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
        <select {...register('category')} className={inputClass}>
          <option value="work">💼 Work</option>
          <option value="personal">🙋 Personal</option>
          <option value="projects">🚀 Projects</option>
          <option value="other">📌 Other</option>
        </select>
      </div>

      {/* Assignees */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign To</label>
        <div className="relative">
          <input
            type="text"
            value={assigneeSearch}
            onChange={(e) => setAssigneeSearch(e.target.value)}
            placeholder="Search users to assign..."
            className={inputClass}
          />
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
              {searchResults.map((u) => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => addAssignee(u)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 text-left"
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff&size=32`}
                    alt={u.name}
                    className="w-7 h-7 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedAssignees.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedAssignees.map((a) => (
              <span
                key={a._id || a}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
              >
                {a.name || 'User'}
                <button type="button" onClick={() => removeAssignee(a._id || a)} className="hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Tags <span className="text-slate-400 font-normal">(comma separated)</span>
        </label>
        <input
          {...register('tags')}
          placeholder="design, backend, urgent..."
          className={inputClass}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
