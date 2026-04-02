import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Package, FileText, Receipt, ClipboardList, Lock } from 'lucide-react';
import logo from '../assets/hero.png';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/products', icon: <Package size={20} /> },
    { name: 'Stock Report', path: '/stock-report', icon: <ClipboardList size={20} /> },
    { name: 'POS Billing', path: '/billing', icon: <FileText size={20} /> },
    { name: 'Invoices', path: '/invoices', icon: <Receipt size={20} /> },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <img src={logo} alt="Fertilizer Billing Logo" className="h-10 w-10 rounded-full mr-2" />
            <span className="text-lg font-bold text-slate-800">Sri Peddintlamma Fertilizers</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-[var(--color-primary)] bg-green-50'
                    : 'text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center">
            <span className="text-sm font-medium text-slate-600 mr-4">Hi, {user?.name}</span>
            <Link
              to="/change-password"
              className="flex items-center text-slate-600 hover:text-[var(--color-primary)] p-2 rounded-md hover:bg-slate-50 transition-colors"
              title="Change Password"
            >
              <Lock size={20} />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
