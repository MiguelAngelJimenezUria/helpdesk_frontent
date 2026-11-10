const ROLE_MAP = {
  admin:      { label: 'Admin',       cls: 'badge-role-admin' },
  agent:      { label: 'Agent',      cls: 'badge-role-agent' },
  client:     { label: 'Client',     cls: 'badge-role-client' },
  supervisor: { label: 'Supervisor',  cls: 'badge-role-supervisor' },
};

export default function RoleBadge({ role }) {
  const { label, cls } = ROLE_MAP[role] || { label: role, cls: '' };
  return <span className={`badge ${cls}`}>{label}</span>;
}
