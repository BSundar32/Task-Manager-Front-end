import Button from '../common/Button';

const FilterSelect = ({ label, value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
  >
    <option value="">{label}</option>
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

const TaskFilters = ({ filters, onFilterChange, onClear }) => {
  const hasActive = Object.values(filters).some((v) => v && v !== 'deadline' && v !== 'asc');

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <FilterSelect
        label="All Status"
        value={filters.status || ''}
        onChange={(v) => onFilterChange({ status: v })}
        options={[
          { value: 'pending', label: 'Pending' },
          { value: 'in-progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
          { value: 'overdue', label: 'Overdue' },
        ]}
      />

      <FilterSelect
        label="All Priority"
        value={filters.priority || ''}
        onChange={(v) => onFilterChange({ priority: v })}
        options={[
          { value: 'high', label: 'High' },
          { value: 'medium', label: 'Medium' },
          { value: 'low', label: 'Low' },
        ]}
      />

      <FilterSelect
        label="All Categories"
        value={filters.category || ''}
        onChange={(v) => onFilterChange({ category: v })}
        options={[
          { value: 'work', label: '💼 Work' },
          { value: 'personal', label: '🙋 Personal' },
          { value: 'projects', label: '🚀 Projects' },
          { value: 'other', label: '📌 Other' },
        ]}
      />

      <FilterSelect
        label="Sort by"
        value={filters.sortBy || 'deadline'}
        onChange={(v) => onFilterChange({ sortBy: v })}
        options={[
          { value: 'deadline', label: 'Deadline' },
          { value: 'priority', label: 'Priority' },
          { value: 'createdAt', label: 'Created' },
          { value: 'title', label: 'Title' },
        ]}
      />

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
};

export default TaskFilters;
