import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // dodanwaie okreslonego produktu
  function addToCart(product, quantity, size) {
    setItems(prev => {
      const exists = prev.find(
        i => i.id === product.id && i.size === size
      );
      if (exists) {
        return prev.map(i =>
          i.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            size,
            quantity
          }
        ];
      }
    });
  }

  // aktualizacja ilosci
  function updateQuantity(productId, size, quantity) {
    setItems(prev =>
      prev.map(i =>
        i.id === productId && i.size === size
          ? { ...i, quantity }
          : i
      )
    );
  }

  // usuwanie z koszyczka
  function removeFromCart(productId, size) {
    setItems(prev =>
      prev.filter(i => !(i.id === productId && i.size === size))
    );
  }
  //czysszcenie calego koszyka (po zakupie)
  function clearCart() {
    setItems([]);
    localStorage.removeItem('cart');
  }

  const total = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,         
        updateQuantity,    
        removeFromCart,    
        total,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
