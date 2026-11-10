const STATUS_MAP = {
  open:        { label: 'Open',        cls: 'badge-status-open' },
  in_progress: { label: 'In Progress', cls: 'badge-status-in_progress' },
  resolved:    { label: 'Resolved',    cls: 'badge-status-resolved' },
  closed:      { label: 'Closed',      cls: 'badge-status-closed' },
};

export default function StatusBadge({ status }) {
  const { label, cls } = STATUS_MAP[status] || { label: status, cls: '' };
  return <span className={`badge ${cls}`}>{label}</span>;
}
