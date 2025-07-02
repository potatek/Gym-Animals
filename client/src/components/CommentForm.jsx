import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

export default function CommentForm({ productId, existing, onComplete }) {
  const { isAuthenticated } = useContext(AuthContext);
  const isEditing = Boolean(existing);

  // stany formulaza
  const [rating,    setRating]    = useState(5);
  const [text,      setText]      = useState('');
  const [imageUrl,  setImageUrl]  = useState('');    // url -> aktualny obrazek
  const [file,      setFile]      = useState(null);  // nowy plik z obrazkiem
  const [remove,    setRemove]    = useState(false); // flaga dla usuniecia starego obrazka
  const [error,     setError]     = useState(null);
  const [loading,   setLoading]   = useState(false);

  // wczytanie aktualnych danych dla edycji
  useEffect(() => {
    if (existing) {
      setRating(existing.rating);
      setText(existing.text || '');
      setImageUrl(existing.imageUrl || '');
      setFile(null);
      setRemove(false);
    }
  }, [existing]);

  if (!isAuthenticated) {
    return <p>Musisz się <a href="/login">zalogować</a>, aby to zrobić.</p>;
  }
  //usuniecie starego
  const handleRemoveImage = () => {
    setRemove(true);
    setImageUrl('');  
    setFile(null);    
  };
  //zapis
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let payload, cfg;

      if (file) {
        
        payload = new FormData();
        payload.append('rating', rating);
        payload.append('text', text);
        payload.append('image', file);
        
        if (remove) payload.append('removeImage', '1');
        cfg = { headers: { 'Content-Type': 'multipart/form-data' } };

      } else {
        
        payload = { rating, text };
        if (isEditing && remove) {
          payload.imageUrl = null;  
        }
        cfg = {};
      }

      if (isEditing) {
        await api.put(`/comments/${existing.id}`, payload, cfg);//nowy
      } else {
        await api.post(`/products/${productId}/comments`, payload, cfg);//edycja
      }

      onComplete();
      setRating(5);
      setText('');
      setImageUrl('');
      setFile(null);
      setRemove(false);

    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border p-3 mb-4">
      <h4>{isEditing ? 'Edytuj opinię' : 'Dodaj opinię'}</h4>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-2">
        <label>Ocena:</label>
        <select
          value={rating}
          onChange={e => setRating(+e.target.value)}
          className="form-select"
        >
          {[5,4,3,2,1].map(n => (
            <option key={n} value={n}>{n} ⭐</option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label>Komentarz (opcjonalnie):</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="form-control"
          rows="3"
        />
      </div>

      {isEditing && imageUrl && !remove && (
        <div className="mb-2">
          <label>Obecne zdjęcie:</label>
          <div className="d-flex align-items-center">
            <img
              src={imageUrl}
              alt="obecne"
              className="img-thumbnail me-2"
              style={{ maxWidth: 120 }}
            />
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleRemoveImage}
            >
              Usuń zdjęcie
            </button>
          </div>
        </div>
      )}

      <div className="mb-2">
        <label>Nowe zdjęcie (opcjonalnie):</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => {
            setFile(e.target.files[0]);
            setRemove(false); 
          }}
          className="form-control"
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading
          ? (isEditing ? 'Aktualizuję…' : 'Wysyłam…')
          : (isEditing ? 'Zaktualizuj opinię' : 'Dodaj opinię')}
      </button>
      {isEditing && (
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={onComplete}
          disabled={loading}
        >
          Anuluj
        </button>
      )}
    </form>
  );
}
