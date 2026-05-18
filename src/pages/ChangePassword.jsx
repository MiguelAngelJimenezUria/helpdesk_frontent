import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { changePassword } from '../api/auth';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined, general: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.current_password) errs.current_password = 'Ingresa tu contraseña actual.';
    if (!form.new_password) errs.new_password = 'Ingresa la nueva contraseña.';
    if (form.new_password !== form.new_password_confirm)
      errs.new_password_confirm = 'Las contraseñas no coinciden.';
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
      await changePassword(form);
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      const data = err.response?.data || {};
      const errs = {};
      Object.entries(data).forEach(([k, v]) => {
        errs[k] = Array.isArray(v) ? v[0] : v;
      });
      if (!Object.keys(errs).length)
        errs.general = 'Error al cambiar la contraseña.';
      setErrors(errs);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center mb-4 gap-3">
        <Link
          to="/profile"
          className="btn btn-sm"
          style={{ border: '1px solid #e2e8f0', color: '#475569', padding: '5px 10px' }}
        >
          <i className="bi bi-arrow-left me-1" />
          Perfil
        </Link>
        <h2 className="mb-0" style={{ fontSize: 20, fontWeight: 700 }}>
          Cambiar Contraseña
        </h2>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-5">
          <div className="card">
            <div className="card-header">Nueva contraseña</div>
            <div className="card-body">
              {success && (
                <div className="alert alert-success" style={{ fontSize: 13 }}>
                  <i className="bi bi-check-circle me-1" />
                  Contraseña actualizada correctamente. Redirigiendo…
                </div>
              )}
              {errors.general && (
                <div className="alert alert-danger" style={{ fontSize: 13 }}>
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="current_password" className="form-label">
                    Contraseña actual
                  </label>
                  <input
                    id="current_password"
                    name="current_password"
                    type="password"
                    className={`form-control${errors.current_password ? ' is-invalid' : ''}`}
                    value={form.current_password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  {errors.current_password && (
                    <div className="invalid-feedback">{errors.current_password}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="new_password" className="form-label">
                    Nueva contraseña
                  </label>
                  <input
                    id="new_password"
                    name="new_password"
                    type="password"
                    className={`form-control${errors.new_password ? ' is-invalid' : ''}`}
                    value={form.new_password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  {errors.new_password && (
                    <div className="invalid-feedback">{errors.new_password}</div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="new_password_confirm" className="form-label">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    id="new_password_confirm"
                    name="new_password_confirm"
                    type="password"
                    className={`form-control${errors.new_password_confirm ? ' is-invalid' : ''}`}
                    value={form.new_password_confirm}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  {errors.new_password_confirm && (
                    <div className="invalid-feedback">{errors.new_password_confirm}</div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || success}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                    ) : (
                      <i className="bi bi-shield-lock me-2" />
                    )}
                    Cambiar contraseña
                  </button>
                  <Link to="/profile" className="btn btn-outline-secondary">
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
