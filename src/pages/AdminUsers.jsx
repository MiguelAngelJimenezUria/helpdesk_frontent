import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUsers } from '../api/users';
import { useAuth } from '../context/AuthContext';
import RoleBadge from '../components/RoleBadge';

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const ROLE_OPTIONS = [
  { value: '', label: 'Todos los roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'agent', label: 'Agente' },
  { value: 'client', label: 'Cliente' },
];

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Redirect if not admin or supervisor
  if (me && me.role !== 'admin' && me.role !== 'supervisor') {
    return (
      <div className="alert alert-danger">
        No tienes permisos para acceder a esta sección.
      </div>
    );
  }

  const fetchUsers = (role = '') => {
    setLoading(true);
    setError('');
    const params = role ? { role } : {};
    getUsers(params)
      .then(({ data }) => setUsers(data))
      .catch(() => setError('No se pudieron cargar los usuarios.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers(roleFilter);
  }, [roleFilter]);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="mb-0" style={{ fontSize: 20, fontWeight: 700 }}>
            Usuarios
          </h2>
          <p className="mb-0" style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
            Gestión de cuentas de usuario
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-sm-auto">
              <label className="form-label mb-1" style={{ fontSize: 11 }}>ROL</label>
              <select
                className="form-select form-select-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ minWidth: 160 }}
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="page-loader" style={{ minHeight: 200 }}>
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : error ? (
          <div className="card-body">
            <div className="alert alert-danger mb-0">{error}</div>
          </div>
        ) : users.length === 0 ? (
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="bi bi-people" />
              </div>
              <div className="empty-state-title">Sin usuarios</div>
              <div className="empty-state-desc">No hay usuarios con este filtro.</div>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>ID</th>
                  <th>Usuario</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th style={{ width: 100 }}>Rol</th>
                  <th style={{ width: 90 }}>Estado</th>
                  <th style={{ width: 110 }}>Registro</th>
                  <th style={{ width: 70 }}></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span className="ticket-id">{u.id}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{u.username}</td>
                    <td style={{ color: '#475569' }}>
                      {u.first_name || u.last_name
                        ? `${u.first_name} ${u.last_name}`.trim()
                        : <span style={{ color: '#94a3b8' }}>—</span>}
                    </td>
                    <td style={{ color: '#475569', fontSize: 12 }}>{u.email || '—'}</td>
                    <td>
                      <RoleBadge role={u.role} />
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 12,
                          color: u.is_active ? '#16a34a' : '#94a3b8',
                        }}
                      >
                        <span
                          className={`active-dot ${u.is_active ? 'active' : 'inactive'}`}
                        />
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#64748b' }}>
                      {formatDate(u.date_joined)}
                    </td>
                    <td>
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="btn btn-sm"
                        style={{
                          border: '1px solid #e2e8f0',
                          color: '#475569',
                          padding: '3px 8px',
                          fontSize: 12,
                        }}
                      >
                        {me?.role === 'supervisor' ? 'Ver' : 'Editar'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && users.length > 0 && (
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8, textAlign: 'right' }}>
          {users.length} usuario{users.length !== 1 ? 's' : ''}
        </p>
      )}
    </>
  );
}
