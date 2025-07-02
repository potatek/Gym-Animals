import React, { useState } from 'react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  //wyslanie maila z linkiem
  const handle = async e => {
    e.preventDefault();
    await api.post('/auth/forgot-password', { email });
    setSent(true);
  };

  return sent
    ? <div className="container mt-4"><p>Jeśli konto istnieje, e-mail wysłany.</p></div>
    : (
      <form onSubmit={handle} className="container mt-4" style={{maxWidth:400}}>
        <h2>Przypomnij hasło</h2>
        <div className="mb-3">
          <label>Email:</label>
          <input
            type="email" required
            className="form-control"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <button className="btn btn-primary">Wyślij link resetujący</button>
      </form>
    );
}
