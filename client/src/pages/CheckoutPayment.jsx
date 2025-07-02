import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../contexts/CartContext';

export default function CheckoutPayment() {
  const navigate = useNavigate();
  const { clearCart } = useContext(CartContext);

  const [cartItems, setCartItems] = useState([]);
  const [contact, setContact] = useState(null);
  const [shipping, setShipping] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('simulated');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const storedContact = JSON.parse(sessionStorage.getItem('contact') || 'null');
    const storedShipping = JSON.parse(sessionStorage.getItem('shipping') || 'null');
    setCartItems(storedCart);
    setContact(storedContact);
    setShipping(storedShipping);
  }, []);
  //najpierw pobieramy info o poprzednich krokach zawartosc koszyka,danekontaktowe
  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      
      const resOrder = await api.post('/orders', {
        items: cartItems,
        contact,
        shipping,
        paymentMethod
      });
      const orderId = resOrder.data.orderId;
      await api.post(`/orders/${orderId}/pay`);
      clearCart();
      navigate(`/order-success?orderId=${orderId}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!contact || !shipping) {
    return (
      <div className="container mt-4">
        <p>Brak danych do płatności. Proszę przejść proces zamówienia od nowa.</p>
      </div>
    );
  }

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h2>Płatność</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <h4>Podsumowanie zamówienia</h4>
      <ul className="list-group mb-3">
        {cartItems.map(item => (
          <li
            key={`${item.id}-${item.size}`}
            className="list-group-item d-flex justify-content-between"
          >
            <span>
              {item.name} ({item.size}) × {item.quantity}
            </span>
            <strong>{(item.price * item.quantity).toFixed(2)} PLN</strong>
          </li>
        ))}
        <li className="list-group-item d-flex justify-content-between">
          <strong>Razem:</strong>
          <strong>{total.toFixed(2)} PLN</strong>
        </li>
      </ul>

      <h4>Dane kontaktowe</h4>
      <p>
        <strong>Imię i nazwisko:</strong> {contact.name}
      </p>
      <p>
        <strong>Email:</strong> {contact.email}
      </p>
      <p>
        <strong>Telefon:</strong> {contact.phone}
      </p>

      <h4>Sposób dostawy</h4>
      {shipping.type === 'pickup' ? (
        <p>Punkt odbioru: {shipping.location.name}</p>
      ) : (
        <p>Adres: {shipping.address}</p>
      )}

      <div className="mb-3">
        <label htmlFor="paymentMethod" className="form-label">
          Metoda płatności
        </label>
        <select
          id="paymentMethod"
          className="form-select"
          value={paymentMethod}
          onChange={e => setPaymentMethod(e.target.value)}
        >
          <option value="simulated">Symulacja</option>
        </select>
      </div>

      <button
        className="btn btn-primary mt-3"
        onClick={handlePay}
        disabled={loading}
      >
        {loading ? 'Przetwarzanie…' : 'Zapłać'}
      </button>
    </div>
  );
}
