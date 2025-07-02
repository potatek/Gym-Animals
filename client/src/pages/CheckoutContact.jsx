import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function CheckoutContact() {
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const navigate = useNavigate();

  const handleChange = e => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // zapis w sessionStorage zeby potem odczytac przy plantosci
    sessionStorage.setItem('contact', JSON.stringify(contact));
    navigate('/checkout/delivery');
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '400px' }}>
      <h2>Dane kontaktowe</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Imię i nazwisko</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={contact.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={contact.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Telefon</label>
          <input
            type="tel"
            name="phone"
            className="form-control"
            value={contact.phone}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Dalej
        </button>
      </form>
    </div>
  );
}
