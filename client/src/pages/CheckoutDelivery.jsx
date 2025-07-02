import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PickupMap from '../components/PickupMap';  

export default function CheckoutDelivery() {
  const navigate = useNavigate();

  // lokalizacja (domyślna: centrum Poznania lub poobierana z geolokalizacji jezeli dostepna)
  const [userPos, setUserPos] = useState({ lat: 52.40833, lng: 16.93361 });
  const [radius, setRadius] = useState(5);
  const [locations, setLocations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [type, setType] = useState('pickup');
  const [address, setAddress] = useState('');

  
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  
  useEffect(() => {
    if (type !== 'pickup') return;
    api.get('/pickup-locations', { params: { ...userPos, radius } })
      .then(res => {
        const locs = res.data;
        setLocations(locs);
        if (locs.length) {
          const nearest = locs.reduce((a, b) => a.distance < b.distance ? a : b);//najblizszy deafultowo wybrany
          setSelectedId(nearest.id);
        }
      })
      .catch(console.error);
  }, [type, userPos, radius]);
  //z wybrana dostawa udajemy sie do platnosci
  const handleNext = () => {
    if (type === 'pickup') {
      const loc = locations.find(l => l.id === selectedId);
      sessionStorage.setItem('shipping', JSON.stringify({
        type: 'pickup',
        location: loc
      }));
    } else {
      sessionStorage.setItem('shipping', JSON.stringify({
        type: 'delivery',
        address,
        lat: null,
        lng: null
      }));
    }
    navigate('/checkout/payment');
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h2>Wybierz sposób dostawy</h2>

      <div className="mb-4">
        <label className="me-3">
          <input
            type="radio"
            name="deliveryType"
            value="pickup"
            checked={type === 'pickup'}
            onChange={() => setType('pickup')}
            className="me-1"
          />
          Odbiór w punkcie
        </label>
        <label>
          <input
            type="radio"
            name="deliveryType"
            value="delivery"
            checked={type === 'delivery'}
            onChange={() => setType('delivery')}
            className="me-1"
          />
          Dostawa pod adres
        </label>
      </div>

      {type === 'pickup' ? (
        <>
          <div className="mb-3">
            <label>Punkt odniesienia (kliknij na mapie):</label>
            <PickupMap
                center={userPos}
                locations={locations}
                selectedId={selectedId}
                onCenterChange={setUserPos}
                onSelect={setSelectedId}
              />
          </div>

          <div className="mb-3">
            <label>Promień wyszukiwania (km):</label>
            <input
              type="number"
              className="form-control w-25"
              value={radius}
              onChange={e => setRadius(+e.target.value)}
            />
          </div>

          <ul className="list-group mb-3">
            {locations.map(loc => (
              <li
                key={loc.id}
                onClick={() => setSelectedId(loc.id)}
                className={`list-group-item d-flex justify-content-between align-items-center ${loc.id === selectedId ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                {loc.name}
                <span className="badge bg-primary rounded-pill">
                  {loc.distance.toFixed(1)} km
                </span>
              </li>
            ))}
            {locations.length === 0 && (
              <li className="list-group-item">Brak punktów w zasięgu.</li>
            )}
          </ul>
        </>
      ) : (
        <div className="mb-3">
          <label>Podaj adres dostawy:</label>
          <input
            type="text"
            className="form-control"
            placeholder="ul. Przykładowa 1, 00-001 Warszawa"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </div>
      )}

      <button
        className="btn btn-success mb-4"
        onClick={handleNext}
        disabled={type === 'pickup' ? !selectedId : address.trim() === ''}
      >
        Dalej do płatności
      </button>
    </div>
  );
}
