import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

export default function ProductList() {
  const [products, setProducts]       = useState([]);
  const [search,   setSearch]         = useState('');
  const [category, setCategory]       = useState('');
  const [sort,     setSort]           = useState('');
  const [categories, setCategories]   = useState([]);

  
  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(console.error);
  }, []);

  // produkty wg filtrów
  useEffect(() => {
    api.get('/products', { params: { search, category, sort } })
      .then(res => setProducts(res.data))
      .catch(console.error);
  }, [search, category, sort]);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Gym Animals</h1>
      <h3 className="mb-4">Twoje najlepsze ubrania na siłownie</h3>

      {/* Filtry i sortowanie */}
      <div className="filter-bar mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Szukaj po nazwie..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">Wszystkie kategorie</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="">Sortuj</option>
            <option value="price_asc">Cena ↑</option>
            <option value="price_desc">Cena ↓</option>
            <option value="name_asc">Nazwa A–Z</option>
            <option value="name_desc">Nazwa Z–A</option>
          </select>
        </div>
      </div>

      {/*lista produktow */}
      <div className="row gx-4 gy-4">
        {products.map(p => (
          <div key={p.id} className="col-12 col-sm-6 col-md-4">
            <Link
              to={`/product/${p.id}`}
              className="card h-100 text-decoration-none text-dark"
            >
              <div className="product-image-wrapper position-relative">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="card-img-top"
                />
                <div className="image-overlay">Zobacz szczegóły</div>
              </div>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{p.name}</h5>
                <p className="card-text text-muted">{p.category}</p>
                <p className="price">{p.price} PLN</p>
                <p className="rating mt-auto">
                  ⭐ {parseFloat(p.avgRating).toFixed(1)} ({p.reviewCount})
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
