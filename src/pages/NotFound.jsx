import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div>
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Página no encontrada</h1>
        <p className="not-found-desc">
          La página que buscas no existe o fue movida.
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-2" />
            Volver
          </button>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">
              <i className="bi bi-grid-1x2 me-2" />
              Ir al inicio
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary">
              <i className="bi bi-box-arrow-in-right me-2" />
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
