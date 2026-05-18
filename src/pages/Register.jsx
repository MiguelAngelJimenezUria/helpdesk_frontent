import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined, general: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.username) errs.username = 'El usuario es obligatorio.';
    if (!form.password) errs.password = 'La contraseña es obligatoria.';
    if (form.password !== form.password_confirm)
      errs.password_confirm = 'Las contraseñas no coinciden.';
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
      await register(form);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const data = err.response?.data || {};
      const errs = {};
      Object.entries(data).forEach(([key, val]) => {
        errs[key] = Array.isArray(val) ? val[0] : val;
      });
      if (!Object.keys(errs).length) {
        errs.general = 'Ocurrió un error. Intenta de nuevo.';
      }
      setErrors(errs);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <i className="bi bi-headset" />
          </div>
          <span className="auth-logo-text">HelpDesk</span>
        </div>

        <h1 className="auth-title">Crear cuenta</h1>
        <p className="auth-subtitle">Regístrate para acceder al portal de soporte</p>

        {errors.general && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-circle me-2" />
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label htmlFor="first_name" className="form-label">Nombre</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                className="form-control"
                placeholder="Juan"
                value={form.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="col-6">
              <label htmlFor="last_name" className="form-label">Apellido</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                className="form-control"
                placeholder="Pérez"
                value={form.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Usuario <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className={`form-control${errors.username ? ' is-invalid' : ''}`}
              placeholder="nombre.usuario"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
            />
            {errors.username && (
              <div className="invalid-feedback">{errors.username}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-control${errors.email ? ' is-invalid' : ''}`}
              placeholder="correo@empresa.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Contraseña <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-control${errors.password ? ' is-invalid' : ''}`}
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password}</div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password_confirm" className="form-label">
              Confirmar contraseña <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="password_confirm"
              name="password_confirm"
              type="password"
              className={`form-control${errors.password_confirm ? ' is-invalid' : ''}`}
              placeholder="Repite la contraseña"
              value={form.password_confirm}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.password_confirm && (
              <div className="invalid-feedback">{errors.password_confirm}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        <div className="section-divider" />

        <p className="text-center" style={{ fontSize: 13, color: '#64748b', marginBottom: 0 }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ fontWeight: 500 }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
