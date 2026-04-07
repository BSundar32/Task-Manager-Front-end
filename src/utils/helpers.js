import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
};

export const formatRelative = (date) => {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDeadline = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isPast(d)) return `Overdue (${format(d, 'MMM d')})`;
  return format(d, 'MMM d, yyyy');
};

export const priorityConfig = {
  low: {
    label: 'Low',
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  high: {
    label: 'High',
    color: 'text-red-700',
    bg: 'bg-red-100',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
};

export const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    icon: '○',
  },
  'in-progress': {
    label: 'In Progress',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    icon: '◑',
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    icon: '●',
  },
  overdue: {
    label: 'Overdue',
    color: 'text-red-700',
    bg: 'bg-red-100',
    icon: '!',
  },
};

export const categoryConfig = {
  work: { label: 'Work', emoji: '💼', color: 'bg-violet-100 text-violet-700' },
  personal: { label: 'Personal', emoji: '🙋', color: 'bg-pink-100 text-pink-700' },
  projects: { label: 'Projects', emoji: '🚀', color: 'bg-blue-100 text-blue-700' },
  other: { label: 'Other', emoji: '📌', color: 'bg-slate-100 text-slate-700' },
};

export const getAvatarUrl = (avatar, name) => {
  if (avatar) return avatar.startsWith('http') ? avatar : avatar;
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6366f1&color=fff&size=128`;
};

export const getFileIcon = (mimetype) => {
  if (!mimetype) return '📎';
  if (mimetype.startsWith('image/')) return '🖼️';
  if (mimetype === 'application/pdf') return '📄';
  if (mimetype.includes('word')) return '📝';
  if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
  if (mimetype.includes('zip')) return '🗜️';
  return '📎';
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
