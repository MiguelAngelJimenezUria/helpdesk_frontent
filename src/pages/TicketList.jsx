import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../api/tickets';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function TicketList() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '' });

  const fetchTickets = (params = {}) => {
    setLoading(true);
    setError('');
    const query = {};
    if (params.status) query.status = params.status;
    if (params.priority) query.priority = params.priority;
    getTickets(query)
      .then(({ data }) => setTickets(data))
      .catch(() => setError('Tickets could not be loaded.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets(filters);
  }, []);

  const handleFilterChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    fetchTickets(updated);
  };

  const clearFilters = () => {
    const reset = { status: '', priority: '' };
    setFilters(reset);
    fetchTickets(reset);
  };

  const hasFilters = filters.status || filters.priority;

  return (
    <>
      {/* Page header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="mb-0" style={{ fontSize: 20, fontWeight: 700 }}>
            Tickets
          </h2>
          <p className="mb-0" style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
            {user?.role === 'client'
              ? 'Your support requests'
              : 'All support requests'}
          </p>
        </div>
        {user?.role !== 'supervisor' && (
          <Link to="/tickets/new" className="btn btn-primary btn-sm">
            <i className="bi bi-plus me-1" />
            {user?.role === 'client' ? 'Open Ticket' : 'New Ticket'}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body" style={{ padding: '14px 20px !important' }}>
          <div className="row g-2 align-items-end">
            <div className="col-sm-auto">
              <label className="form-label mb-1" style={{ fontSize: 11 }}>
                STATUS
              </label>
              <select
                name="status"
                className="form-select form-select-sm"
                value={filters.status}
                onChange={handleFilterChange}
                style={{ minWidth: 160 }}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-sm-auto">
              <label className="form-label mb-1" style={{ fontSize: 11 }}>
                PRIORITY
              </label>
              <select
                name="priority"
                className="form-select form-select-sm"
                value={filters.priority}
                onChange={handleFilterChange}
                style={{ minWidth: 160 }}
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {hasFilters && (
              <div className="col-sm-auto">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={clearFilters}
                  style={{ marginTop: 20 }}
                >
                  <i className="bi bi-x me-1" />
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="page-loader" style={{ minHeight: 200 }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="card-body">
            <div className="alert alert-danger mb-0">{error}</div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="bi bi-inbox" />
              </div>
              <div className="empty-state-title">No results</div>
              <div className="empty-state-desc">
                {hasFilters
                  ? 'There are no tickets matching these filters.'
                  : 'There are no tickets registered yet.'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th>Title</th>
                  <th style={{ width: 120 }}>Status</th>
                  <th style={{ width: 110 }}>Priority</th>
                  {(user?.role === 'agent' || user?.role === 'admin' || user?.role === 'supervisor') && (
                    <>
                      <th style={{ width: 140 }}>Requester</th>
                      <th style={{ width: 140 }}>Assigned to</th>
                    </>
                  )}
                  <th style={{ width: 110 }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
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
                    {(user?.role === 'agent' || user?.role === 'admin' || user?.role === 'supervisor') && (
                      <>
                        <td style={{ fontSize: 12, color: '#475569' }}>
                          {t.created_by?.username || '—'}
                        </td>
                        <td style={{ fontSize: 12, color: '#475569' }}>
                          {t.assigned_to?.username || (
                            <span style={{ color: '#94a3b8' }}>Unassigned</span>
                          )}
                        </td>
                      </>
                    )}
                    <td style={{ fontSize: 12, color: '#64748b' }}>
                      {formatDate(t.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && tickets.length > 0 && (
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8, textAlign: 'right' }}>
          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
        </p>
      )}
    </>
  );
}
