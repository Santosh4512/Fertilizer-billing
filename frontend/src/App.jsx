import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Billing from './pages/Billing';
import Invoices from './pages/Invoices';
import StockReport from './pages/StockReport';
import ChangePassword from './pages/ChangePassword';

const ProtectedRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-secondary flex flex-col">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Navbar />
                <main className="flex-1 p-6">
                  <Dashboard />
                </main>
              </ProtectedRoute>
            } />
            
            <Route path="/products" element={
              <ProtectedRoute>
                <Navbar />
                <main className="flex-1 p-6">
                  <Products />
                </main>
              </ProtectedRoute>
            } />
            
            <Route path="/stock-report" element={
              <ProtectedRoute>
                <Navbar />
                <main className="flex-1 p-6">
                  <StockReport />
                </main>
              </ProtectedRoute>
            } />

            <Route path="/billing" element={
              <ProtectedRoute>
                <Navbar />
                <main className="flex-1 p-6">
                  <Billing />
                </main>
              </ProtectedRoute>
            } />

            <Route path="/invoices" element={
              <ProtectedRoute>
                <Navbar />
                <main className="flex-1 p-6">
                  <Invoices />
                </main>
              </ProtectedRoute>
            } />

            <Route path="/change-password" element={
              <ProtectedRoute>
                <Navbar />
                <main className="flex-1 p-6">
                  <ChangePassword />
                </main>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
