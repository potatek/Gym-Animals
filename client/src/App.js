import React,{useContext} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Register from './pages/Register';
import Login    from './pages/Login';
import CheckoutDelivery from './pages/CheckoutDelivery';
import CheckoutContact from './pages/CheckoutContact';
import CheckoutPayment from './pages/CheckoutPayment';
import OrderSuccess from './pages/OrderSuccess';
import OrderHistory     from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';
import AdminProducts    from './pages/AdminProducts';
import AdminProductForm from './pages/AdminProductForm';
import { AuthContext } from './contexts/AuthContext';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';

function App() {
  const { user } = useContext(AuthContext);
  return (
    
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/checkout/delivery" element={<CheckoutDelivery />} />
          <Route path="/checkout/contact"  element={<CheckoutContact />} />
          <Route path="/checkout/payment" element={<CheckoutPayment />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id"  element={<OrderDetails />} />
          <Route path="/forgot-password" element={<ForgotPassword/>} />
          <Route path="/reset-password"  element={<ResetPassword/>} />
          {user?.role === 'admin' && (
          <>
            <Route path="/admin/products"        element={<AdminProducts/>} />
            <Route path="/admin/products/new"    element={<AdminProductForm/>} />
            <Route path="/admin/products/:id"    element={<AdminProductForm/>} />
          </>
          )}
          
          
        </Routes>
      </BrowserRouter>
   
  );
}

export default App;
