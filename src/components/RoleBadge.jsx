const ROLE_MAP = {
  admin:  { label: 'Admin',   cls: 'badge-role-admin' },
  agent:  { label: 'Agente',  cls: 'badge-role-agent' },
  client: { label: 'Cliente', cls: 'badge-role-client' },
};

export default function RoleBadge({ role }) {
  const { label, cls } = ROLE_MAP[role] || { label: role, cls: '' };
  return <span className={`badge ${cls}`}>{label}</span>;
}
