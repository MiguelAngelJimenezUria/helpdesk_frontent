const PRIORITY_MAP = {
  low:      { label: 'Baja',     cls: 'badge-priority-low' },
  medium:   { label: 'Media',    cls: 'badge-priority-medium' },
  high:     { label: 'Alta',     cls: 'badge-priority-high' },
  critical: { label: 'Crítica',  cls: 'badge-priority-critical' },
};

export default function PriorityBadge({ priority }) {
  const { label, cls } = PRIORITY_MAP[priority] || { label: priority, cls: '' };
  return <span className={`badge ${cls}`}>{label}</span>;
}
