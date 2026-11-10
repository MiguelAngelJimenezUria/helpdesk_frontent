const PRIORITY_MAP = {
  low:      { label: 'Low',      cls: 'badge-priority-low' },
  medium:   { label: 'Medium',   cls: 'badge-priority-medium' },
  high:     { label: 'High',     cls: 'badge-priority-high' },
  critical: { label: 'Critical', cls: 'badge-priority-critical' },
};

export default function PriorityBadge({ priority }) {
  const { label, cls } = PRIORITY_MAP[priority] || { label: priority, cls: '' };
  return <span className={`badge ${cls}`}>{label}</span>;
}
