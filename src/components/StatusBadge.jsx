const STATUS_MAP = {
  open:        { label: 'Abierto',     cls: 'badge-status-open' },
  in_progress: { label: 'En Progreso', cls: 'badge-status-in_progress' },
  resolved:    { label: 'Resuelto',    cls: 'badge-status-resolved' },
  closed:      { label: 'Cerrado',     cls: 'badge-status-closed' },
};

export default function StatusBadge({ status }) {
  const { label, cls } = STATUS_MAP[status] || { label: status, cls: '' };
  return <span className={`badge ${cls}`}>{label}</span>;
}
