import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { items, total, updateQuantity, removeFromCart } = useContext(CartContext);

  if (items.length === 0) {
    return (
      <div className="container mt-4">
        <h2>Twój koszyk jest pusty</h2>
        <Link to="/">Wróć na stronę główną</Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Twój koszyk</h2>
      {items.map(i => (
        <div key={`${i.id}-${i.size}`} className="row align-items-center mb-3">
          <div className="col-2">
            <img src={i.imageUrl} alt={i.name} className="img-fluid" />
          </div>
          <div className="col-4">
            {i.name} <small>({i.size})</small>
          </div>
          <div className="col-2">
            <input
              type="number"
              min="1"
              value={i.quantity}
              onChange={e => updateQuantity(i.id, i.size, +e.target.value)}
              className="form-control"
            />
          </div>
          <div className="col-2">{(i.price * i.quantity).toFixed(2)} PLN</div>
          <div className="col-2">
            <button
              className="btn btn-sm btn-danger"
              onClick={() => removeFromCart(i.id, i.size)}
            >
              Usuń
            </button>
          </div>
        </div>
      ))}
      <hr />
      <h4>Łącznie: {total.toFixed(2)} PLN</h4>
      <Link to="/checkout/contact" className="btn btn-success mt-3">
        Przejdź do kasy
      </Link>

      {/* maly druczek :) -> jak starczy czasu TODO wygaszanei sie koszyka po czasie = ksoyk rezerwuje */}
      <div className="d-flex justify-content-end mt-2">
        <p className="text-muted small mb-0">
          Umieszczenie produktów w koszyku nie oznacza ich rezerwacji.
        </p>
      </div>
    </div>
  );
}
