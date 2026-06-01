import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../api/tickets';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

function StatCard({ value, label, iconClass, color }) {
  return (
    <div className="stat-card">
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <div className="stat-card-value">{value}</div>
          <div className="stat-card-label">{label}</div>
        </div>
        <div className="stat-card-icon" style={{ background: color + '18' }}>
          <i className={`bi ${iconClass}`} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTickets()
      .then(({ data }) => setTickets(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    total:       tickets.length,
    open:        tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved:    tickets.filter((t) => t.status === 'resolved').length,
    closed:      tickets.filter((t) => t.status === 'closed').length,
  }), [tickets]);

  const recent = tickets.slice(0, 8);

  const displayName = user?.first_name || user?.username || '';

  return (
    <>
      {/* Page header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="mb-0" style={{ fontSize: 20, fontWeight: 700 }}>
            Bienvenido, {displayName}
          </h2>
          <p className="mb-0" style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
            Resumen de actividad del sistema de soporte
          </p>
        </div>
        {user?.role !== 'client' ? null : (
          <Link to="/tickets/new" className="btn btn-primary btn-sm">
            <i className="bi bi-plus me-1" />
            Abrir Ticket
          </Link>
        )}
        {(user?.role === 'agent' || user?.role === 'admin') && (
          <Link to="/tickets/new" className="btn btn-primary btn-sm">
            <i className="bi bi-plus me-1" />
            Nuevo Ticket
          </Link>
        )}
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="page-loader">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3">
              <StatCard
                value={stats.total}
                label="Total Tickets"
                iconClass="bi-ticket-detailed"
                color="#2563eb"
              />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard
                value={stats.open}
                label="Abiertos"
                iconClass="bi-folder2-open"
                color="#2563eb"
              />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard
                value={stats.in_progress}
                label="En Progreso"
                iconClass="bi-arrow-repeat"
                color="#d97706"
              />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard
                value={stats.resolved}
                label="Resueltos"
                iconClass="bi-check-circle"
                color="#16a34a"
              />
            </div>
          </div>

          {/* Recent tickets */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between">
              <span>Tickets Recientes</span>
              <Link
                to="/tickets"
                style={{ fontSize: 12, fontWeight: 500, color: '#2563eb' }}
              >
                Ver todos <i className="bi bi-arrow-right ms-1" />
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="card-body">
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <i className="bi bi-inbox" />
                  </div>
                  <div className="empty-state-title">Sin tickets</div>
                  <div className="empty-state-desc">
                    No hay tickets registrados todavía.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Título</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>Creado</th>
                      {(user?.role === 'agent' || user?.role === 'admin' || user?.role === 'supervisor') && (
                        <th>Solicitante</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <span className="ticket-id">#{t.id}</span>
                        </td>
                        <td>
                          <Link to={`/tickets/${t.id}`} className="ticket-row-link">
                            {t.title}
                          </Link>
                        </td>
                        <td>
                          <StatusBadge status={t.status} />
                        </td>
                        <td>
                          <PriorityBadge priority={t.priority} />
                        </td>
                        <td style={{ color: '#64748b', fontSize: 12 }}>
                          {formatDate(t.created_at)}
                        </td>
                        {(user?.role === 'agent' || user?.role === 'admin' || user?.role === 'supervisor') && (
                          <td style={{ color: '#64748b', fontSize: 12 }}>
                            {t.created_by?.username || '—'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
