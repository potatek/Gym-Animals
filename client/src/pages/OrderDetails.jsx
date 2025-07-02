import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(err => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!order || order.shipType !== 'pickup') return;

    api.get(`/pickup-locations/${order.shipLocationId}`)
      .then(res => setPickupLocation(res.data))
      .catch(console.error);
  }, [order]);


  if (loading) return <div className="container mt-4">Ładowanie…</div>;
  if (error)   return <div className="container mt-4 alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: 700 }}>
      <h2>Szczegóły zamówienia #{order.id}</h2>
      <p><strong>Data:</strong> {new Date(order.createdAt).toLocaleString()}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <hr/>

      <h4>Pozycje</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Produkt</th>
            <th>Rozmiar</th>
            <th>Ilość</th>
            <th>Cena jedn.</th>
            <th>Suma</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i, idx) => (
            <tr key={`${i.id}-${i.size}-${idx}`}>
              <td>{i.name}</td>
              <td>{i.size}</td>
              <td>{i.quantity}</td>
              <td>{parseFloat(i.price).toFixed(2)} PLN</td>
              <td>{(i.quantity * parseFloat(i.price)).toFixed(2)} PLN</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-end">
        <strong>Razem:</strong> {parseFloat(order.total).toFixed(2)} PLN
      </p>
      <hr/>

      <h4>Dane kontaktowe</h4>
      <p>{order.contactName}</p>
      <p>{order.contactEmail}</p>
      <p>{order.contactPhone}</p>
      <hr/>
      {/* dostawa adres lub paczkomat (nazwa paczkoamtu) */}
      <h4>Dostawa</h4>
      {order.shipType === 'pickup' ? (
        <p>
          Paczkomat:{' '}
          {pickupLocation
            ? pickupLocation.name
            : 'Ładowanie...'}
        </p>
      ) : (
        <p>Adres: {order.shipAddress}</p>
      )}
      <hr/>

      <Link to="/orders" className="btn btn-secondary">← Wróć do historii</Link>
    </div>
  );
}
