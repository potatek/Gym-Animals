import React from 'react';
import { useLocation } from 'react-router-dom';

export default function OrderSuccess() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const orderId = params.get('orderId');

  return (
    <div className="container mt-4">
      <h2>Dziękujemy za zakup!</h2>
      <p>Twoje zamówienie <strong>#{orderId}</strong> zostało opłacone.</p>
      <p>Faktura została wysłana na Twój adres e-mail.</p>
      <p>Pamietaj o wystawieniu opini!!!</p>
    </div>
  );
}
