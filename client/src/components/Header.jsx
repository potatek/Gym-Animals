import React, { useContext } from 'react';
import { Link,useLocation } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';

export default function Header() {
  const { items,clearCart } = useContext(CartContext);
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const { pathname } = useLocation();

  const isProductList = pathname === '/' || pathname === '/products';
  
  return (
    <nav className="navbar navbar-light sticky-top">
      <Link to="/" className="navbar-brand">
      {isProductList 
          ? 'Gym animals' 
          : 'Strona główna'}
          </Link>

      <div>
        {isAuthenticated ? (
          <>
            <span className="me-3">Witaj, {user.email.split('@')[0]}</span>
            {/* zarzadzeni produktami przez admina*/}
             {user.role === 'admin' && (
               <Link
                 to="/admin/products"
                 className="btn btn-outline-success me-2"
               >
                 Admin: produkty
               </Link>
             )}
            
            <Link to="/orders" className="btn btn-primary me-2"> {user.role === 'admin' ? 'Zamówienia' : 'Moje zamówienia'}</Link>

            <button
                onClick={() => {
                  if (items.length > 0) {
                    const ok = window.confirm(
                      'Wylogowanie spowoduje usunięcie zawartości koszyka. Kontynuować?'
                    );
                    if (!ok) return;
                  }
                  clearCart();
                  logout();
                }}
                className="btn btn-outline-secondary me-2"
                aria-label="Wyloguj"
          >
            Wyloguj
          </button>
          </>
        ) : (
          <>
            <Link to="/login"    className="btn btn-outline-primary me-2">
              Logowanie
            </Link>
            <Link to="/register" className="btn btn-primary me-2">
              Rejestracja
            </Link>
          </>
        )}

        <Link to="/cart" className="btn btn-primary position-relative">
          Koszyk ({items.length})
        </Link>
      </div>
    </nav>
  );
}

