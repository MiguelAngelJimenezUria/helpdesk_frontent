import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTicket } from '../api/tickets';
import { validateSafeText } from '../utils/validation';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
];

export default function TicketCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) {
      errs.title = 'El título es obligatorio.';
    } else {
      errs.title = validateSafeText(form.title, 'El título');
    }
    if (!form.description.trim()) {
      errs.description = 'La descripción es obligatoria.';
    } else {
      errs.description = validateSafeText(form.description, 'La descripción');
    }
    Object.keys(errs).forEach((k) => { if (!errs[k]) delete errs[k]; });
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }
    setLoading(true);
    try {
      const { data } = await createTicket(form);
      navigate(`/tickets/${data.id}`);
    } catch (err) {
      const data = err.response?.data || {};
      const errs = {};
      Object.entries(data).forEach(([k, v]) => {
        errs[k] = Array.isArray(v) ? v[0] : v;
      });
      if (!Object.keys(errs).length) errs.general = 'Error al crear el ticket.';
      setErrors(errs);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="d-flex align-items-center mb-4 gap-3">
        <Link
          to="/tickets"
          className="btn btn-sm"
          style={{
            border: '1px solid #e2e8f0',
            color: '#475569',
            padding: '5px 10px',
          }}
        >
          <i className="bi bi-arrow-left me-1" />
          Volver
        </Link>
        <div>
          <h2 className="mb-0" style={{ fontSize: 20, fontWeight: 700 }}>
            Nuevo Ticket
          </h2>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card">
            <div className="card-header">Información del ticket</div>
            <div className="card-body">
              {errors.general && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-circle me-2" />
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Título <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    className={`form-control${errors.title ? ' is-invalid' : ''}`}
                    placeholder="Describe brevemente el problema"
                    value={form.title}
                    onChange={handleChange}
                    maxLength={200}
                    autoFocus
                  />
                  {errors.title && (
                    <div className="invalid-feedback">{errors.title}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="priority" className="form-label">
                    Prioridad
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    className="form-select"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    {PRIORITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="form-label">
                    Descripción <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className={`form-control${errors.description ? ' is-invalid' : ''}`}
                    placeholder="Describe el problema con el mayor detalle posible…"
                    value={form.description}
                    onChange={handleChange}
                    rows={6}
                  />
                  {errors.description && (
                    <div className="invalid-feedback">{errors.description}</div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
                        Enviando…
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2" />
                        Enviar Ticket
                      </>
                    )}
                  </button>
                  <Link to="/tickets" className="btn btn-outline-secondary">
                    Cancelar
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
