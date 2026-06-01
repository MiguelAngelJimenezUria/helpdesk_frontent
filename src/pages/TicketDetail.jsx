import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTicket, updateTicket, getComments, createComment } from '../api/tickets';
import { getUsers } from '../api/users';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

function formatDateTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Abierto' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'resolved', label: 'Resuelto' },
  { value: 'closed', label: 'Cerrado' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
];

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Update form (agents/admins)
  const [updateForm, setUpdateForm] = useState({ status: '', priority: '', assigned_to: '' });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Comment form
  const [commentBody, setCommentBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');

  const isStaff = user?.role === 'agent' || user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor';
  const canViewAll = isStaff || isSupervisor;  // sees all data (internal notes, assignee, meta)
  const canEdit = isStaff;                      // can modify ticket / post comments

  useEffect(() => {
    Promise.all([
      getTicket(id),
      getComments(id),
      isStaff ? getUsers({ role: 'agent' }) : Promise.resolve({ data: [] }),
      isStaff ? getUsers({ role: 'admin' }) : Promise.resolve({ data: [] }),
    ])
      .then(([ticketRes, commentsRes, agentsRes, adminsRes]) => {
        setTicket(ticketRes.data);
        setComments(commentsRes.data);
        setUpdateForm({
          status: ticketRes.data.status || '',
          priority: ticketRes.data.priority || '',
          assigned_to: ticketRes.data.assigned_to?.id || '',
        });
        setAgents([...agentsRes.data, ...adminsRes.data]);
      })
      .catch(() => setError('No se pudo cargar el ticket.'))
      .finally(() => setLoading(false));
  }, [id, isStaff]);

  const handleUpdateChange = (e) => {
    setUpdateForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setUpdateSuccess(false);
    setUpdateError('');
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateSuccess(false);
    setUpdateError('');
    try {
      const payload = {
        status: updateForm.status,
        priority: updateForm.priority,
        assigned_to: updateForm.assigned_to ? Number(updateForm.assigned_to) : null,
      };
      const { data } = await updateTicket(id, payload);
      setTicket(data);
      setUpdateSuccess(true);
    } catch {
      setUpdateError('Error al actualizar el ticket.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setCommentLoading(true);
    setCommentError('');
    try {
      await createComment(id, { body: commentBody, is_internal: isInternal });
      // Refresh comments
      const { data } = await getComments(id);
      setComments(data);
      setCommentBody('');
      setIsInternal(false);
    } catch {
      setCommentError('No se pudo agregar el comentario.');
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader" style={{ minHeight: 300 }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-circle me-2" />
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="d-flex align-items-center mb-4 gap-3">
        <Link
          to="/tickets"
          className="btn btn-sm"
          style={{ border: '1px solid #e2e8f0', color: '#475569', padding: '5px 10px' }}
        >
          <i className="bi bi-arrow-left me-1" />
          Tickets
        </Link>
        <span className="ticket-id" style={{ fontSize: 14 }}>#{ticket.id}</span>
      </div>

      <div className="row g-3">
        {/* Left: Ticket detail + comments */}
        <div className="col-lg-8">
          {/* Ticket info card */}
          <div className="card mb-3">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <span style={{ flex: 1, minWidth: 0 }}>{ticket.title}</span>
              <div className="d-flex gap-2">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>
            <div className="card-body">
              <p style={{ whiteSpace: 'pre-wrap', color: '#334155', lineHeight: 1.7, marginBottom: 0 }}>
                {ticket.description}
              </p>
            </div>
          </div>

          {/* Comments */}
          <div className="card mb-3">
            <div className="card-header">
              Comentarios
              <span
                style={{
                  marginLeft: 8,
                  background: '#f1f5f9',
                  borderRadius: 10,
                  padding: '1px 8px',
                  fontSize: 11,
                  color: '#64748b',
                  fontWeight: 600,
                }}
              >
                {comments.length}
              </span>
            </div>
            <div className="card-body" style={{ padding: '0 20px !important' }}>
              {comments.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px 0' }}>
                  <div className="empty-state-icon" style={{ fontSize: 28 }}>
                    <i className="bi bi-chat" />
                  </div>
                  <div className="empty-state-desc">Sin comentarios todavía.</div>
                </div>
              ) : (
                <div style={{ padding: '0 4px' }}>
                  {comments.map((c) => (
                    <div key={c.id} className="comment-item">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#475569',
                            flexShrink: 0,
                          }}
                        >
                          {(c.author?.username?.[0] || '?').toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                          {c.author?.username}
                        </span>
                        {c.is_internal && (
                          <span className="comment-internal-badge">Interna</span>
                        )}
                        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>
                          {formatDateTime(c.created_at)}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 13.5,
                          color: c.is_internal ? '#78716c' : '#334155',
                          lineHeight: 1.6,
                          paddingLeft: 36,
                          fontStyle: c.is_internal ? 'italic' : 'normal',
                        }}
                      >
                        {c.body}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment form */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, marginTop: 4 }}>
                {canEdit ? (
                <form onSubmit={handleCommentSubmit}>
                  {commentError && (
                    <div className="alert alert-danger py-2 mb-2">{commentError}</div>
                  )}
                  <textarea
                    className="form-control mb-2"
                    placeholder="Escribe un comentario…"
                    rows={3}
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                  />
                  <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                    {isStaff && (
                      <div className="form-check mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="is_internal"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="is_internal"
                          style={{ fontSize: 12.5 }}
                        >
                          Nota interna (solo staff)
                        </label>
                      </div>
                    )}
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={commentLoading || !commentBody.trim()}
                    >
                      {commentLoading ? (
                        <span className="spinner-border spinner-border-sm" role="status" />
                      ) : (
                        <>
                          <i className="bi bi-send me-1" />
                          Comentar
                        </>
                      )}
                    </button>
                  </div>
                </form>
                ) : (
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, textAlign: 'center' }}>
                    <i className="bi bi-eye me-1" />
                    Modo solo lectura &mdash; los supervisores no pueden agregar comentarios.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Meta + Update panel */}
        <div className="col-lg-4">
          {/* Meta info */}
          <div className="card mb-3">
            <div className="card-header">Detalles</div>
            <div className="card-body">
              <dl style={{ marginBottom: 0 }}>
                <MetaRow label="Estado">
                  <StatusBadge status={ticket.status} />
                </MetaRow>
                <MetaRow label="Prioridad">
                  <PriorityBadge priority={ticket.priority} />
                </MetaRow>
                <MetaRow label="Solicitante">
                  {ticket.created_by?.username || '—'}
                </MetaRow>
                <MetaRow label="Asignado a">
                  {ticket.assigned_to?.username || (
                    <span style={{ color: '#94a3b8' }}>Sin asignar</span>
                  )}
                </MetaRow>
                <MetaRow label="Creado">
                  {formatDateTime(ticket.created_at)}
                </MetaRow>
                <MetaRow label="Actualizado" last>
                  {formatDateTime(ticket.updated_at)}
                </MetaRow>
              </dl>
            </div>
          </div>

          {/* Update panel (agents & admins only) */}
          {canEdit && (
            <div className="card">
              <div className="card-header">Actualizar Ticket</div>
              <div className="card-body">
                {updateSuccess && (
                  <div className="alert alert-success py-2 mb-3" style={{ fontSize: 13 }}>
                    <i className="bi bi-check-circle me-1" />
                    Ticket actualizado correctamente.
                  </div>
                )}
                {updateError && (
                  <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>
                    {updateError}
                  </div>
                )}
                <form onSubmit={handleUpdateSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Estado</label>
                    <select
                      name="status"
                      className="form-select"
                      value={updateForm.status}
                      onChange={handleUpdateChange}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Prioridad</label>
                    <select
                      name="priority"
                      className="form-select"
                      value={updateForm.priority}
                      onChange={handleUpdateChange}
                    >
                      {PRIORITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Asignar a</label>
                    <select
                      name="assigned_to"
                      className="form-select"
                      value={updateForm.assigned_to}
                      onChange={handleUpdateChange}
                    >
                      <option value="">Sin asignar</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.first_name
                            ? `${a.first_name} ${a.last_name}`.trim()
                            : a.username}{' '}
                          ({a.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" />
                    ) : (
                      'Guardar cambios'
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function MetaRow({ label, children, last }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '7px 0',
        borderBottom: last ? 'none' : '1px solid #f1f5f9',
        gap: 8,
      }}
    >
      <dt style={{ fontWeight: 500, fontSize: 12, color: '#64748b', margin: 0 }}>
        {label}
      </dt>
      <dd style={{ fontSize: 13, margin: 0, textAlign: 'right' }}>{children}</dd>
    </div>
  );
}
