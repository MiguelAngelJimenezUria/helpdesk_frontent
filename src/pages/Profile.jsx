import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMe, updateMe } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { validateName, validateEmail } from '../utils/validation';

export default function Profile() {
  const { loadUser } = useAuth();
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '' });
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    getMe()
      .then(({ data }) => {
        const init = {
          email: data.email || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        };
        setForm(init);
        setOriginal(data);
      })
      .catch(() => setError('Could not load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setSuccess(false);
    setError('');
  };

  const validate = () => {
    const errs = {};
    errs.first_name = validateName(form.first_name, 'First name');
    errs.last_name = validateName(form.last_name, 'Last name');
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
      await updateMe(form);
      await loadUser();
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data || {};
      const first = Object.values(data)[0];
      setError(Array.isArray(first) ? first[0] : first || 'Error saving.');
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

  return (
    <>
      <div className="mb-4">
        <h2 className="mb-0" style={{ fontSize: 20, fontWeight: 700 }}>
          My Profile
        </h2>
        <p className="mb-0" style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
          Manage your personal information
        </p>
      </div>

      <div className="row g-3">
        {/* Profile form */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">Personal information</div>
            <div className="card-body">
              {success && (
                <div className="alert alert-success py-2 mb-3" style={{ fontSize: 13 }}>
                  <i className="bi bi-check-circle me-1" />
                  Profile updated successfully.
                </div>
              )}
              {error && (
                <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={original?.username || ''}
                    disabled
                    style={{ background: '#f8fafc', color: '#94a3b8' }}
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label htmlFor="first_name" className="form-label">First name</label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      className={`form-control${fieldErrors.first_name ? ' is-invalid' : ''}`}
                      value={form.first_name}
                      onChange={handleChange}
                    />
                    {fieldErrors.first_name && (
                      <div className="invalid-feedback">{fieldErrors.first_name}</div>
                    )}
                  </div>
                  <div className="col-6">
                    <label htmlFor="last_name" className="form-label">Last name</label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      className={`form-control${fieldErrors.last_name ? ' is-invalid' : ''}`}
                      value={form.last_name}
                      onChange={handleChange}
                    />
                    {fieldErrors.last_name && (
                      <div className="invalid-feedback">{fieldErrors.last_name}</div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`form-control${fieldErrors.email ? ' is-invalid' : ''}`}
                    value={form.email}
                    onChange={handleChange}
                  />
                  {fieldErrors.email && (
                    <div className="invalid-feedback">{fieldErrors.email}</div>
                  )}
                </div>

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
                  Save changes
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Account info */}
        <div className="col-lg-6">
          <div className="card mb-3">
            <div className="card-header">Account information</div>
            <div className="card-body">
              <dl style={{ marginBottom: 0 }}>
                <InfoRow label="Role">
                  {original?.role === 'admin'
                    ? 'Administrator'
                    : original?.role === 'agent'
                    ? 'Agent'
                    : 'Client'}
                </InfoRow>
                <InfoRow label="Member since" last>
                  {original?.date_joined
                    ? new Date(original.date_joined).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '—'}
                </InfoRow>
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Security</div>
            <div className="card-body">
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                Change your password regularly to keep your account secure.
              </p>
              <Link to="/profile/change-password" className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-key me-2" />
                Change password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, children, last }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '7px 0',
        borderBottom: last ? 'none' : '1px solid #f1f5f9',
        gap: 8,
      }}
    >
      <dt style={{ fontWeight: 500, fontSize: 12, color: '#64748b', margin: 0 }}>
        {label}
      </dt>
      <dd style={{ fontSize: 13, margin: 0 }}>{children}</dd>
    </div>
  );
}
