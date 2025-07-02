import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate }               from 'react-router-dom';
import api                                from '../services/api';
import { AuthContext }                    from '../contexts/AuthContext';
//zarzadanie produktami (tylko dla admina)
export default function AdminProducts() {
  const [prods, setProds] = useState([]);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/products')
      .then(res => setProds(res.data))
      .catch(err => setError(err.response?.data?.error || err.message));
  }, [isAuthenticated]);

  const handleDelete = async id => {
    if (!window.confirm('Na pewno usunąć ten produkt?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProds(ps => ps.filter(p => p.id !== id));
    } catch {
      alert('Nie udało się usunąć produktu');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Panel produktów</h2>
      <div className="mb-3">
        <Link to="/admin/products/new" className="btn btn-success">
          Dodaj nowy produkt
        </Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <table className="table">
        <thead>
          <tr>
            <th>#</th><th>Nazwa</th><th>Kategoria</th><th>Cena</th><th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {prods.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{parseFloat(p.price).toFixed(2)} PLN</td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => navigate(`/admin/products/${p.id}`)}
                >
                  Edytuj
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(p.id)}
                >
                  Usuń
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
