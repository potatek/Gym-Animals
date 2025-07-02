import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../contexts/CartContext';
import CommentForm from '../components/CommentForm';
import { AuthContext } from '../contexts/AuthContext';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [hasPurchased, setHasPurchased] = useState(false);

  const hasUserComment = comments.some(c => c.userEmail === user?.email);

  const refreshComments = useCallback((q = '') => {
    api
      .get(`/products/${id}/comments`, { params: q ? { q } : {} })
      .then(res => setComments(res.data))
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(console.error);

    refreshComments();
  }, [id, refreshComments]);

  useEffect(() => {
    if (!token) {
      setHasPurchased(false);
      return;
    }
    api.get(`/products/${id}/has-purchased`)
      .then(res => setHasPurchased(res.data.hasPurchased))
      .catch(() => setHasPurchased(false));
  }, [id, token]);

  const handleDelete = async commentId => {
    if (!window.confirm('Na pewno usunąć tę recenzję?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      refreshComments();
    } catch (err) {
      console.error(err);
      alert('Usuwanie nie powiodło się');
    }
  };

  const finishEdit = () => {
    setEditing(null);
    refreshComments(search);
  };

  if (!product) return <div className="container mt-4">Ładowanie…</div>;

  //dostępność dla wybranego rozmiaru
  const sizeEntry = product.stock.find(s => s.size === selectedSize);
  const maxQty = sizeEntry ? sizeEntry.quantity : 1;

  return (
    <div className="container mt-4">
      <h1>{product.name}</h1>

      <div className="row">
        <div className="col-md-6">
          <img src={product.imageUrl} className="img-fluid" alt={product.name} />
        </div>
        <div className="col-md-6">
          <p><strong>Kategoria:</strong> {product.category}</p>
          <p><strong>Cena:</strong> {product.price} PLN</p>
          <p>{product.description}</p>
        </div>
      </div>

      <hr/>

      {/* Wybor rozmiaru */}
      <div className="mt-3">
        <label>Rozmiar:</label>
        <select
          className="form-select d-inline-block w-auto mx-2"
          value={selectedSize}
          onChange={e => {
            setSelectedSize(e.target.value);
            setQty(1);
          }}
        >
          <option value="">Wybierz…</option>
          {product.stock.map(s => (
            <option key={s.size} value={s.size} disabled={s.quantity === 0}>
              {s.size} {s.quantity === 0 && '(brak)'}
            </option>
          ))}
        </select>
      </div>

      {/* Wybór ilosci */}
      <div className="mt-3">
        <label>Ilość:</label>
        <input
          type="number"
          min="1"
          max={maxQty}
          value={qty}
          disabled={!selectedSize}
          onChange={e => setQty(Math.min(Math.max(1, +e.target.value), maxQty))}
          className="form-control w-25 d-inline-block mx-2"
        />
        <button
          className="btn btn-primary"
          disabled={!selectedSize}
          onClick={() => addToCart(product, qty, selectedSize)}
        >
          Dodaj do koszyka
        </button>
      </div>

      <hr/>

      {/* Sekcja komentarzy */}
      <div className="mb-3">
        <h3>Komentarze</h3>
        <label>Wyszukaj w komentarzach:</label>
        <div className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="fraza…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn btn-outline-primary" onClick={() => refreshComments(search)}>
            Szukaj
          </button>
        </div>
      </div>

      <div className="mt-4">
        {comments.length === 0 && <p>Brak opinii.</p>}
        {comments.map(c => (
          <div key={c.id} className="border p-2 mb-2 position-relative">
            <strong>{c.userEmail}</strong> – ⭐ {c.rating}
            {(user?.email === c.userEmail || user?.role === 'admin') && (
              <div style={{ position: 'absolute', top: 8, right: 8 }}>
                {user?.email === c.userEmail && (
                  <button className="btn btn-sm btn-link" onClick={() => setEditing(c.id)}>
                    Edytuj
                  </button>
                )}
                {(user?.email === c.userEmail || user?.role === 'admin') && (
                  <button className="btn btn-sm btn-link text-danger" onClick={() => handleDelete(c.id)}>
                    Usuń
                  </button>
                )}
              </div>//admin moze zawsze usunac
            )}
            <p>{c.text}</p>
            {c.imageUrl && <img src={c.imageUrl} alt="dowód" className="img-fluid" style={{ maxWidth: 200 }} />}
            {editing === c.id && (
              <CommentForm productId={id} existing={c} onComplete={finishEdit} />
            )}
          </div>
        ))}
      </div>

      {hasPurchased && !hasUserComment && (
        <CommentForm productId={id} onComplete={() => refreshComments(search)} />
      )}
    </div>
  );
}
