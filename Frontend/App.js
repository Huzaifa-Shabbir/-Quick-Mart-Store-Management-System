import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import backgroundImg from './background.jpg'; // or './assets/background.jpg' if in an assets folder

import CustomerPage from './pages/CustomerPage';
import DeliveryPage from './pages/DeliveryPage';
import EmployeePage from './pages/EmployeePage';
import EmployeeRolePage from './pages/EmployeeRolePage';
import FeedbackPage from './pages/FeedbackPage';
import InventoryPage from './pages/InventoryPage';
import OrderPage from './pages/OrderPage';
import OrderedItemPage from './pages/OrderedItemPage';
import PaymentPage from './pages/PaymentPage';
import SupplierPage from './pages/SupplierPage';
import SuppliedItemPage from './pages/SuppliedItemsPage';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [role, setRole] = useState(null);

  const handleLogin = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleLogout = () => {
    setRole(null);
  };

  const isAdmin = role === 'admin';
  const isCashier = role === 'cashier';
  const isDelivery = role === 'delivery';

  if (!role) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="app-container">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
          <Link to="/" className="navbar-brand">Quick Mart</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item"><Link to="/" className="nav-link">Home</Link></li>
              {(isAdmin || isCashier) && <li className="nav-item"><Link to="/customer" className="nav-link">Customer</Link></li>}
              {(isAdmin || isDelivery) && <li className="nav-item"><Link to="/delivery" className="nav-link">Delivery</Link></li>}
              {isAdmin && <li className="nav-item"><Link to="/employee" className="nav-link">Employee</Link></li>}
              {isAdmin && <li className="nav-item"><Link to="/employee-roles" className="nav-link">Roles</Link></li>}
              {isAdmin && <li className="nav-item"><Link to="/feedback" className="nav-link">Feedback</Link></li>}
              {(isAdmin || isCashier) && <li className="nav-item"><Link to="/inventory" className="nav-link">Inventory</Link></li>}
              {(isAdmin || isCashier) && <li className="nav-item"><Link to="/orders" className="nav-link">Orders</Link></li>}
              {(isAdmin || isCashier) && <li className="nav-item"><Link to="/ordered-items" className="nav-link">Ordered Items</Link></li>}
              {(isAdmin || isCashier) && <li className="nav-item"><Link to="/payments" className="nav-link">Payments</Link></li>}
              {isAdmin && <li className="nav-item"><Link to="/suppliers" className="nav-link">Suppliers</Link></li>}
              {isAdmin && <li className="nav-item"><Link to="/supplied-items" className="nav-link">Supplied Items</Link></li>}
            </ul>
            <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        <div className="container py-4">
          <Routes>
            <Route path="/" element={<Home role={role} />} />
            {(isAdmin || isCashier) && <Route path="/customer" element={<CustomerPage />} />}
            {(isAdmin || isDelivery) && <Route path="/delivery" element={<DeliveryPage />} />}
            {isAdmin && <Route path="/employee" element={<EmployeePage />} />}
            {isAdmin && <Route path="/employee-roles" element={<EmployeeRolePage />} />}
            {isAdmin && <Route path="/feedback" element={<FeedbackPage />} />}
            {(isAdmin || isCashier) && <Route path="/inventory" element={<InventoryPage />} />}
            {(isAdmin || isCashier) && <Route path="/orders" element={<OrderPage />} />}
            {(isAdmin || isCashier) && <Route path="/ordered-items" element={<OrderedItemPage />} />}
            {(isAdmin || isCashier) && <Route path="/payments" element={<PaymentPage />} />}
            {isAdmin && <Route path="/suppliers" element={<SupplierPage />} />}
            {isAdmin && <Route path="/supplied-items" element={<SuppliedItemPage />} />}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

const LoginPage = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const credentials = {
    admin: 'admin123',
    cashier: 'cashier123',
    delivery: 'delivery123',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRole || !password) {
      setError('Please fill out all fields');
      return;
    }
    if (credentials[selectedRole] === password) {
      setError('');
      onLogin(selectedRole);
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div
  className="d-flex flex-column align-items-center justify-content-center vh-100"
  style={{
    backgroundImage: `url(${backgroundImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
>
      <div className="card shadow p-4" style={{ width: 350 }}>
        <h3 className="text-center mb-4 text-primary">Quick Mart Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Select Role</label>
            <select
              className="form-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              required
            >
              <option value="">-- Choose a role --</option>
              <option value="admin">Admin</option>
              <option value="cashier">Cashier</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="alert alert-danger text-center py-1">{error}</div>}
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
};

const Home = ({ role }) => (
  <div className="text-center p-5 bg-white shadow rounded">
    <h1 className="text-primary">Welcome to Quick Mart</h1>
    <p className="lead">You are logged in as <strong>{role}</strong>.</p>
    <p>Please use the navigation menu to manage the system based on your role.</p>
  </div>
);

export default App;
