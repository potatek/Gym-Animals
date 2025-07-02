import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

const SIZES = ['S','M','L','XL'];
//formularz admina dla tworzenia/edycji produktow
export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    imageUrl: '',
    
    stockBySize: SIZES.reduce((acc, sz) => ({ ...acc, [sz]: 0 }), {})
  });
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //edycja -----> pobiera istniejace dane
  useEffect(() => {
    if (!isEditing) return;
    api.get(`/products/${id}`)
      .then(res => {
        const p = res.data;
        
        const stockMap = SIZES.reduce((acc, sz) => {
          const entry = p.stock.find(s => s.size === sz);
          acc[sz] = entry ? entry.quantity : 0;
          return acc;
        }, {});
        setForm({
          name: p.name,
          description: p.description,
          category: p.category,
          price: p.price,
          imageUrl: p.imageUrl,
          stockBySize: stockMap
        });
        setRemoveImage(false);
        setFile(null);
      })
      .catch(err => setError(err.response?.data?.error || err.message));
  }, [id, isEditing]);

  if (!isAuthenticated) {
    return <p>Brak dostępu. Zaloguj się jako admin.</p>;
  }

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleStockChange = (size, value) => {
    setForm(f => ({
      ...f,
      stockBySize: {
        ...f.stockBySize,
        [size]: Math.max(0, Number(value))
      }
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    
    const stockArray = SIZES.map(size => ({
      size,
      quantity: form.stockBySize[size]
    }));

    try {
      if (file) {
        //dla obrazka multipart/formdata
        const formData = new FormData();
        ['name','description','category','price'].forEach(k => {
          formData.append(k, form[k]);
        });
        formData.append('image', file);
        
        formData.append('stock', JSON.stringify(stockArray));
        
        formData.append('imageUrl', removeImage ? '' : form.imageUrl);

        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
        if (isEditing) {
          await api.put(`/products/${id}`, formData, config);
        } else {
          await api.post('/products', formData, config);
        }
      } else {
        //json
        const payload = {
          name: form.name,
          description: form.description,
          category: form.category,
          price: form.price,
          stock: stockArray,
          imageUrl: removeImage ? null : form.imageUrl
        };
        if (isEditing) {
          await api.put(`/products/${id}`, payload);
        } else {
          await api.post('/products', payload);
        }
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h2>{isEditing ? 'Edytuj produkt' : 'Dodaj nowy produkt'}</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        
        <div className="mb-3">
          <label>Nazwa:</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        
        <div className="mb-3">
          <label>Opis:</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="form-control"
            rows="3"
          />
        </div>

        
        <div className="mb-3">
          <label>Kategoria:</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        
        <div className="mb-3">
          <label>Cena (PLN):</label>
          <input
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        
        <div className="mb-3">
          <label>Stany magazynowe (rozmiary):</label>
          {SIZES.map(sz => (
            <div key={sz} className="input-group mb-1" style={{ width: 200 }}>
              <span className="input-group-text">{sz}</span>
              <input
                type="number"
                min="0"
                value={form.stockBySize[sz]}
                onChange={e => handleStockChange(sz, e.target.value)}
                className="form-control"
                required
              />
            </div>
          ))}
        </div>

        
        {isEditing && form.imageUrl && !removeImage && (
          <div className="mb-3">
            <label>Obecny obrazek:</label><br/>
            <img
              src={form.imageUrl}
              alt="produkt"
              style={{ maxWidth: 200, marginBottom: '0.5rem' }}
            /><br/>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={() => setRemoveImage(true)}
            >
              Usuń obraz
            </button>
          </div>
        )}
        {removeImage && (
          <div className="mb-3 text-danger">
            Obraz zostanie usunięty.
          </div>
        )}

        
        <div className="mb-3">
          <label>Nowy obrazek (opcjonalnie):</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={e => {
              setFile(e.target.files[0]);
              setRemoveImage(false);
            }}
          />
        </div>

        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading
            ? isEditing ? 'Aktualizuję…' : 'Dodaję…'
            : isEditing ? 'Zapisz zmiany' : 'Dodaj produkt'}
        </button>
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Anuluj
        </button>
      </form>
    </div>
  );
}
