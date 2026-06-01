import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUser, updateUser } from '../api/users';
import { useAuth } from '../context/AuthContext';
import RoleBadge from '../components/RoleBadge';
import { validateName, validateEmail } from '../utils/validation';

export default function AdminUserDetail() {
  const { id } = useParams();
  const { user: me } = useAuth();

  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  if (me && me.role !== 'admin' && me.role !== 'supervisor') {
    return (
      <div className="alert alert-danger">
        No tienes permisos para acceder a esta sección.
      </div>
    );
  }

  useEffect(() => {
    getUser(id)
      .then(({ data }) => {
        setUserData(data);
        setForm({
          email: data.email || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          role: data.role || 'client',
          is_active: data.is_active ?? true,
        });
      })
      .catch(() => setError('No se pudo cargar el usuario.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setSuccess(false);
    setError('');
  };

  const validate = () => {
    const errs = {};
    errs.first_name = validateName(form.first_name, 'El nombre');
    errs.last_name = validateName(form.last_name, 'El apellido');
    if (form.email) errs.email = validateEmail(form.email);
    Object.keys(errs).forEach((k) => { if (!errs[k]) delete errs[k]; });
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) {
      setFieldErrors(clientErrors);
      return;
    }
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      const { data } = await updateUser(id, form);
      setUserData(data);
      setSuccess(true);
    } catch (err) {
      const d = err.response?.data || {};
      const first = Object.values(d)[0];
      setError(Array.isArray(first) ? first[0] : first || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (error && !userData) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <>
      <div className="d-flex align-items-center mb-4 gap-3">
        <Link
          to="/admin/users"
          className="btn btn-sm"
          style={{ border: '1px solid #e2e8f0', color: '#475569', padding: '5px 10px' }}
        >
          <i className="bi bi-arrow-left me-1" />
          Usuarios
        </Link>
        <div>
          <h2 className="mb-0" style={{ fontSize: 20, fontWeight: 700 }}>
            {userData?.username}
          </h2>
          <div className="d-flex align-items-center gap-2 mt-1">
            <RoleBadge role={userData?.role} />
            {!userData?.is_active && (
              <span
                style={{
                  fontSize: 11,
                  background: '#f1f5f9',
                  color: '#94a3b8',
                  padding: '2px 7px',
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                INACTIVO
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              {me?.role === 'supervisor' ? 'Ver usuario' : 'Editar usuario'}
            </div>
            <div className="card-body">
              {success && (
                <div className="alert alert-success py-2 mb-3" style={{ fontSize: 13 }}>
                  <i className="bi bi-check-circle me-1" />
                  Usuario actualizado correctamente.
                </div>
              )}
              {error && (
                <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label htmlFor="first_name" className="form-label">Nombre</label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      className={`form-control${fieldErrors.first_name ? ' is-invalid' : ''}`}
                      value={form.first_name}
                      onChange={handleChange}
                      disabled={me?.role === 'supervisor'}
                    />
                    {fieldErrors.first_name && (
                      <div className="invalid-feedback">{fieldErrors.first_name}</div>
                    )}
                  </div>
                  <div className="col-6">
                    <label htmlFor="last_name" className="form-label">Apellido</label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      className={`form-control${fieldErrors.last_name ? ' is-invalid' : ''}`}
                      value={form.last_name}
                      onChange={handleChange}
                      disabled={me?.role === 'supervisor'}
                    />
                    {fieldErrors.last_name && (
                      <div className="invalid-feedback">{fieldErrors.last_name}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Correo electrónico</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`form-control${fieldErrors.email ? ' is-invalid' : ''}`}
                    value={form.email}
                    onChange={handleChange}
                    disabled={me?.role === 'supervisor'}
                  />
                  {fieldErrors.email && (
                    <div className="invalid-feedback">{fieldErrors.email}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Rol</label>
                  <select
                    id="role"
                    name="role"
                    className="form-select"
                    value={form.role}
                    onChange={handleChange}
                    disabled={me?.role === 'supervisor'}
                  >
                    <option value="client">Cliente</option>
                    <option value="agent">Agente</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                      disabled={me?.role === 'supervisor'}
                    />
                    <label className="form-check-label" htmlFor="is_active">
                      Cuenta activa
                    </label>
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, paddingLeft: 24 }}>
                    Desactiva la cuenta para bloquear el acceso sin eliminarla.
                  </div>
                </div>

                {me?.role !== 'supervisor' && (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                  ) : (
                    <i className="bi bi-save me-2" />
                  )}
                  Guardar cambios
                </button>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Read-only info */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">Información de cuenta</div>
            <div className="card-body">
              <dl style={{ marginBottom: 0 }}>
                {[
                  { label: 'ID', value: userData?.id },
                  { label: 'Usuario', value: userData?.username },
                  {
                    label: 'Estado',
                    value: userData?.is_active ? (
                      <span style={{ color: '#16a34a', fontWeight: 500 }}>Activo</span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Inactivo</span>
                    ),
                  },
                ].map(({ label, value }, i, arr) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '7px 0',
                      borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
                    }}
                  >
                    <dt style={{ fontWeight: 500, fontSize: 12, color: '#64748b', margin: 0 }}>
                      {label}
                    </dt>
                    <dd style={{ fontSize: 13, margin: 0 }}>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
