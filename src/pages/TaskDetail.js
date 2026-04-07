import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tasksAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import CommentSection from '../components/comments/CommentSection';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import {
  priorityConfig, statusConfig, categoryConfig,
  formatDateTime, formatDeadline, getAvatarUrl, getFileIcon, formatFileSize,
} from '../utils/helpers';
import toast from 'react-hot-toast';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateTask, deleteTask } = useTask();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Share state
  const [shareSearch, setShareSearch] = useState('');
  const [shareResults, setShareResults] = useState([]);
  const [shareSearching, setShareSearching] = useState(false);
  const [shareNoResults, setShareNoResults] = useState(false);
  const [sharePermission, setSharePermission] = useState('view');
  const [sharing, setSharing] = useState(false);

  // Attachment upload
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadTask(); }, [id]);

  const loadTask = async () => {
    try {
      const { data } = await tasksAPI.getById(id);
      setTask(data.task);
    } catch (err) {
      if (err.response?.status === 404) navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    setUpdating(true);
    try {
      const { data } = await tasksAPI.update(id, formData);
      setTask(data.task);
      setShowEditModal(false);
      toast.success('Task updated!');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    await deleteTask(id);
    navigate('/tasks');
  };

  const handleStatusChange = async (status) => {
    const { data } = await tasksAPI.update(id, { status });
    setTask(data.task);
    toast.success(`Status updated to ${status}`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const { data } = await tasksAPI.uploadAttachment(id, fd);
      setTask((prev) => ({ ...prev, attachments: data.attachments }));
      toast.success('File attached');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Remove this attachment?')) return;
    await tasksAPI.deleteAttachment(id, attachmentId);
    setTask((prev) => ({ ...prev, attachments: prev.attachments.filter((a) => a._id !== attachmentId) }));
    toast.success('Attachment removed');
  };

  // Share search
  useEffect(() => {
    if (!shareSearch.trim()) {
      setShareResults([]);
      setShareNoResults(false);
      return;
    }
    setShareSearching(true);
    setShareNoResults(false);
    const t = setTimeout(async () => {
      try {
        const { data } = await usersAPI.search({ search: shareSearch });
        setShareResults(data.users);
        setShareNoResults(data.users.length === 0);
      } catch (err) {
        toast.error(err.response?.data?.message || 'User search failed');
        setShareResults([]);
      } finally {
        setShareSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [shareSearch]);

  const handleShare = async (userId) => {
    setSharing(true);
    try {
      const { data } = await tasksAPI.share(id, { userId, permission: sharePermission });
      setTask(data.task);
      setShareSearch('');
      setShareResults([]);
      toast.success('Task shared successfully');
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!task) return null;

  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const status = statusConfig[task.status] || statusConfig.pending;
  const category = categoryConfig[task.category] || categoryConfig.other;
  const isCreator = task.creator?._id === user?._id;
  const canEdit = isCreator || task.assignees?.some((a) => a._id === user?._id) ||
    task.sharedWith?.some((s) => s.user?._id === user?._id && s.permission === 'edit');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/tasks" className="hover:text-slate-700">Tasks</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate">{task.title}</span>
      </nav>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Priority stripe */}
        <div className={`h-1.5 ${priority.dot}`} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-xl font-bold text-slate-900 flex-1">{task.title}</h1>
            <div className="flex items-center gap-2 shrink-0">
              {canEdit && (
                <Button variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>
                  Edit
                </Button>
              )}
              {isCreator && (
                <>
                  <Button variant="secondary" size="sm" onClick={() => setShowShareModal(true)}>
                    Share
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleDelete}>
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            <Badge className={`${priority.bg} ${priority.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} /> {priority.label}
            </Badge>
            <Badge className={`${status.bg} ${status.color}`}>{status.icon} {status.label}</Badge>
            <Badge className={category.color}>{category.emoji} {category.label}</Badge>
          </div>

          {/* Description */}
          {task.description && (
            <div className="prose prose-sm max-w-none mb-5">
              <p className="text-slate-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Tags */}
          {task.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {task.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl mb-5">
            <div>
              <p className="text-xs text-slate-500 mb-1">Deadline</p>
              <p className={`text-sm font-semibold ${task.status === 'overdue' ? 'text-red-600' : 'text-slate-800'}`}>
                {formatDeadline(task.deadline)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Created by</p>
              <div className="flex items-center gap-1.5">
                <img
                  src={getAvatarUrl(task.creator?.avatar, task.creator?.name)}
                  alt={task.creator?.name}
                  className="w-5 h-5 rounded-full"
                />
                <p className="text-sm font-medium text-slate-800 truncate">{task.creator?.name}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Created</p>
              <p className="text-sm text-slate-700">{formatDateTime(task.createdAt)}</p>
            </div>
          </div>

          {/* Status quick-change */}
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <span className="text-sm font-medium text-slate-700">Quick status:</span>
            {['pending', 'in-progress', 'completed'].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  task.status === s
                    ? `${statusConfig[s].bg} ${statusConfig[s].color} ring-2 ring-offset-1 ring-current`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {statusConfig[s].icon} {statusConfig[s].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: comments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <CommentSection taskId={id} />
        </div>

        {/* Right column: assignees, shared, attachments */}
        <div className="space-y-4">
          {/* Assignees */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Assignees</h3>
            {task.assignees?.length === 0 ? (
              <p className="text-xs text-slate-500">No assignees</p>
            ) : (
              <div className="space-y-2">
                {task.assignees.map((a) => (
                  <div key={a._id} className="flex items-center gap-2">
                    <img src={getAvatarUrl(a.avatar, a.name)} alt={a.name} className="w-7 h-7 rounded-full" />
                    <div>
                      <p className="text-xs font-medium text-slate-800">{a.name}</p>
                      <p className="text-xs text-slate-500">{a.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shared with */}
          {task.sharedWith?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Shared With</h3>
              <div className="space-y-2">
                {task.sharedWith.map((s) => (
                  <div key={s._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={getAvatarUrl(s.user?.avatar, s.user?.name)} alt={s.user?.name} className="w-7 h-7 rounded-full" />
                      <p className="text-xs font-medium text-slate-800">{s.user?.name}</p>
                    </div>
                    <Badge className={s.permission === 'edit' ? 'bg-primary-50 text-primary-700' : 'bg-slate-100 text-slate-600'}>
                      {s.permission}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">Attachments</h3>
              <label className="cursor-pointer">
                <input type="file" className="hidden" onChange={handleFileUpload} />
                <span className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  {uploading ? 'Uploading...' : '+ Add file'}
                </span>
              </label>
            </div>
            {task.attachments?.length === 0 ? (
              <p className="text-xs text-slate-500">No attachments</p>
            ) : (
              <div className="space-y-2">
                {task.attachments.map((a) => (
                  <div key={a._id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">{getFileIcon(a.mimetype)}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 truncate">{a.originalName}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(a.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <a
                        href={`/uploads/${a.filename}`}
                        download={a.originalName}
                        className="p-1 text-slate-400 hover:text-primary-600"
                        title="Download"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                      <button
                        onClick={() => handleDeleteAttachment(a._id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                        title="Remove"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Task" size="lg">
        <TaskForm initialData={task} onSubmit={handleUpdate} onCancel={() => setShowEditModal(false)} loading={updating} />
      </Modal>

      {/* Share Modal */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share Task">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Search user</label>
            <div className="relative">
              <input
                type="text"
                value={shareSearch}
                onChange={(e) => setShareSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
              />
              {shareSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}

              {/* Search results dropdown */}
              {shareSearch.trim() && !shareSearching && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  {shareResults.length > 0 ? (
                    shareResults.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => handleShare(u._id)}
                        disabled={sharing}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 text-left disabled:opacity-50"
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
                        {sharing && <span className="ml-auto text-xs text-slate-400">Sharing...</span>}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-center text-sm text-slate-500">
                      <p className="text-xl mb-1">🔍</p>
                      No users found for <strong>"{shareSearch}"</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Permission</label>
            <select
              value={sharePermission}
              onChange={(e) => setSharePermission(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="view">View only</option>
              <option value="edit">Can edit</option>
            </select>
          </div>
          {task.sharedWith?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Currently shared with</p>
              <div className="space-y-2">
                {task.sharedWith.map((s) => (
                  <div key={s._id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700">{s.user?.name}</p>
                    <Badge className={s.permission === 'edit' ? 'bg-primary-50 text-primary-700' : 'bg-slate-100 text-slate-600'}>
                      {s.permission}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TaskDetail;
