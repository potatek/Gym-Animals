import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
//ten sam orderhistory dla admina i klienta kilient widiz tylko swoje a admin moze podejrzec wszytkie
export default function OrderHistory() {
  const { token, user } = useContext(AuthContext);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!token) return;
    api.get('/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setOrders(res.data))
    .catch(err => setError(err.response?.data?.error || err.message))
    .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="container mt-4">Ładowanie…</div>;
  if (error)   return <div className="container mt-4 alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>
        {user?.role === 'admin' ? 'Wszystkie zamówienia' : 'Moje zamówienia'}
      </h2>
      {!orders.length && (
        <p>
          {user?.role === 'admin'
            ? 'Brak żadnych zamówień.'
            : 'Nie masz jeszcze żadnych zamówień.'}
        </p>
      )}
      {orders.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Kwota</th>
              <th>Status</th>
              {user?.role === 'admin' && <th>Klient</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>
                  <Link to={`/orders/${o.id}`}>{o.id}</Link>
                </td>
                <td>{new Date(o.createdAt).toLocaleString('pl-PL')}</td>
                <td>{parseFloat(o.total).toFixed(2)} PLN</td>
                <td>{o.status}</td>
                {user?.role === 'admin' && (
                  <td>{o.userEmail || o.user?.email || '—'}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
