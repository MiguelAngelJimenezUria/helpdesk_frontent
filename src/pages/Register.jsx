import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { validateName, validateUsername, validateEmail } from '../utils/validation';

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

    // Presence
    if (!form.username) errs.username = 'Username is required.';
    if (!form.password) errs.password = 'Password is required.';
    if (form.password !== form.password_confirm)
      errs.password_confirm = 'Passwords do not match.';

    // Format
    if (!errs.username) errs.username = validateUsername(form.username);
    errs.first_name = validateName(form.first_name, 'First name');
    errs.last_name = validateName(form.last_name, 'Last name');
    if (form.email) errs.email = validateEmail(form.email);

    // Remove undefined entries
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
      await register(form);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const data = err.response?.data || {};
      const errs = {};
      Object.entries(data).forEach(([key, val]) => {
        errs[key] = Array.isArray(val) ? val[0] : val;
      });
      if (!Object.keys(errs).length) {
        errs.general = 'An error occurred. Please try again.';
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

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Sign up to access the support portal</p>

        {errors.general && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-circle me-2" />
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label htmlFor="first_name" className="form-label">First name</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                className={`form-control${errors.first_name ? ' is-invalid' : ''}`}
                placeholder="John"
                value={form.first_name}
                onChange={handleChange}
              />
              {errors.first_name && (
                <div className="invalid-feedback">{errors.first_name}</div>
              )}
            </div>
            <div className="col-6">
              <label htmlFor="last_name" className="form-label">Last name</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                className={`form-control${errors.last_name ? ' is-invalid' : ''}`}
                placeholder="Doe"
                value={form.last_name}
                onChange={handleChange}
              />
              {errors.last_name && (
                <div className="invalid-feedback">{errors.last_name}</div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className={`form-control${errors.username ? ' is-invalid' : ''}`}
              placeholder="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
            />
            {errors.username && (
              <div className="invalid-feedback">{errors.username}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-control${errors.email ? ' is-invalid' : ''}`}
              placeholder="name@company.com"
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
              Password <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-control${errors.password ? ' is-invalid' : ''}`}
              placeholder="Minimum 8 characters"
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
              Confirm password <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="password_confirm"
              name="password_confirm"
              type="password"
              className={`form-control${errors.password_confirm ? ' is-invalid' : ''}`}
              placeholder="Repeat password"
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
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <div className="section-divider" />

        <p className="text-center" style={{ fontSize: 13, color: '#64748b', marginBottom: 0 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
