import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const [qs] = useSearchParams();
  const token = qs.get('token');
  const [pass, setPass] = useState('');
  const [ok, setOk]     = useState(false);
  const [err, setErr]   = useState('');
  const nav = useNavigate();

  const handle = async e => {
    e.preventDefault();
    try {
      await api.post('/auth/reset-password', { token, password: pass });
      setOk(true);
      setTimeout(() => nav('/login'), 2000);
    } catch (e) {
      setErr(e.response?.data?.error || 'Błąd');
    }
  };

  if (!token) return <div className="container mt-4">Brak tokena</div>;

  return ok
    ? <div className="container mt-4"><p>Hasło zresetowane. Przekierowanie…</p></div>
    : (
      <form onSubmit={handle} className="container mt-4" style={{maxWidth:400}}>
        <h2>Nowe hasło</h2>
        {err && <div className="alert alert-danger">{err}</div>}
        <div className="mb-3">
          <label>Hasło:</label>
          <input
            type="password" required
            className="form-control"
            value={pass}
            onChange={e => setPass(e.target.value)}
          />
        </div>
        <button className="btn btn-primary">Zresetuj hasło</button>
      </form>
    );
}
