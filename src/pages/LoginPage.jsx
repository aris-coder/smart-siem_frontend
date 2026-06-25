import { useState } from 'react';
import { roles } from '../data/siemData';

function LoginPage({ onLogin }) {
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const roleId = String(formData.get('roleId') || 'analyst');

    if (!email || !password) {
      setError('Renseignez votre e-mail et votre mot de passe.');
      return;
    }

    setError('');
    onLogin({ email, roleId });
  }

  return (
    <main className="login-page">
      <div className="container py-5">
        <div className="login-card card shadow-sm mx-auto" aria-label="Connexion Smart SIEM">
          <div className="card-body p-4">
            <div className="login-brand d-flex align-items-center gap-3 mb-4">
              <span className="brand-logo large bg-primary text-white" aria-hidden="true">
                <i className="bi bi-shield-lock-fill" />
              </span>
              <div>
                <h1 className="h4 mb-1">SIEM Intelligent</h1>
                <p className="text-muted mb-0">Connectez-vous à votre espace de supervision</p>
              </div>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
              <div className="mb-3">
                <label className="form-label" htmlFor="email">Adresse e-mail</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-envelope" aria-hidden="true" /></span>
                  <input id="email" name="email" defaultValue="admin@siem.local" type="email" className="form-control" autoComplete="username" required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="password">Mot de passe</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-key" aria-hidden="true" /></span>
                  <input id="password" name="password" type="password" className="form-control" autoComplete="current-password" required minLength="4" />
                </div>
              </div>

              <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between mb-3 gap-2">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" defaultChecked id="rememberMe" />
                  <label className="form-check-label" htmlFor="rememberMe">Se souvenir de moi</label>
                </div>
                <button className="btn btn-link btn-sm p-0" type="button">Mot de passe oublié ?</button>
              </div>
              <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" type="submit">
                <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
                Se connecter
              </button>
            </form>

            <div className="login-meta d-flex justify-content-between text-muted small mt-4">
              <span>API v1.0</span>
              <span>Accès sécurisé</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
