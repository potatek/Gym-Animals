import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { register, loading } = useContext(AuthContext);
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError]     = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await register(email, password);
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd rejestracji');
    }
  };

  return (
    <div className="container mt-4" style={{maxWidth: '400px'}}>
      <h2>Rejestracja</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email" className="form-control"
            value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Hasło</label>
          <input
            type="password" className="form-control"
            value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Ładowanie…' : 'Zarejestruj'}
        </button>
      </form>
      <p className="mt-3">
        Masz konto? <Link to="/login">Zaloguj się</Link>
      </p>
    </div>
  );
}
