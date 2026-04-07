import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import {
  priorityConfig,
  statusConfig,
  categoryConfig,
  formatDeadline,
  getAvatarUrl,
} from '../../utils/helpers';

const TaskCard = ({ task, onDelete, onStatusChange }) => {
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const status = statusConfig[task.status] || statusConfig.pending;
  const category = categoryConfig[task.category] || categoryConfig.other;
  const isOverdue = task.status === 'overdue';

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group
        ${isOverdue ? 'border-red-200' : 'border-slate-200'}`}
    >
      {/* Priority bar */}
      <div className={`h-1 ${priority.dot}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <Link
            to={`/tasks/${task._id}`}
            className="text-sm font-semibold text-slate-800 hover:text-primary-600 transition-colors line-clamp-2 flex-1"
          >
            {task.title}
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            {/* Status change dropdown */}
            <select
              value={task.status}
              onChange={(e) => onStatusChange && onStatusChange(task._id, e.target.value)}
              className="text-xs border-0 bg-transparent text-slate-500 cursor-pointer focus:ring-0 p-0 pr-4"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge className={`${priority.bg} ${priority.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
            {priority.label}
          </Badge>
          <Badge className={status.bg + ' ' + status.color}>
            {status.icon} {status.label}
          </Badge>
          <Badge className={category.color}>
            {category.emoji} {category.label}
          </Badge>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {/* Deadline */}
          <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
            {isOverdue ? '⚠ ' : '📅 '}{formatDeadline(task.deadline)}
          </span>

          {/* Assignees + actions */}
          <div className="flex items-center gap-2">
            {task.assignees && task.assignees.length > 0 && (
              <div className="flex -space-x-1.5">
                {task.assignees.slice(0, 3).map((a) => (
                  <img
                    key={a._id}
                    src={getAvatarUrl(a.avatar, a.name)}
                    alt={a.name}
                    title={a.name}
                    className="w-6 h-6 rounded-full border-2 border-white object-cover"
                  />
                ))}
                {task.assignees.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs text-slate-600 font-medium">
                    +{task.assignees.length - 3}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                to={`/tasks/${task._id}`}
                className="p-1 rounded text-slate-400 hover:text-primary-600 hover:bg-primary-50"
                title="View details"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(task._id)}
                  className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                  title="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
