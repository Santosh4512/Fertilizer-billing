import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { IndianRupee, Package, AlertTriangle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalSales: 0,
    ordersCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, billsRes] = await Promise.all([
          api.get('/products'),
          api.get('/bills')
        ]);
        
        const products = productsRes.data;
        const bills = billsRes.data;

        const totalProducts = products.length;
        const lowStockCount = products.filter(p => p.stockQuantity <= p.lowStockThreshold).length;
        
        const completedBills = bills.filter(b => b.paymentStatus === 'Completed');
        const ordersCount = completedBills.length;
        const totalSales = completedBills.reduce((acc, bill) => acc + bill.finalTotal, 0);

        setStats({ totalProducts, lowStockCount, totalSales, ordersCount });
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div></div>;
  }

  const statCards = [
    { title: 'Total Sales', value: `₹${stats.totalSales.toLocaleString()}`, icon: <IndianRupee size={24} className="text-white" />, color: 'bg-emerald-500', path: '/invoices' },
    { title: 'Completed Orders', value: stats.ordersCount, icon: <TrendingUp size={24} className="text-white" />, color: 'bg-blue-500', path: '/invoices' },
    { title: 'Total Products', value: stats.totalProducts, icon: <Package size={24} className="text-white" />, color: 'bg-indigo-500', path: '/products' },
    { title: 'Low Stock Alerts', value: stats.lowStockCount, icon: <AlertTriangle size={24} className="text-white" />, color: 'bg-rose-500', path: '/products' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <Link key={idx} to={stat.path} className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-center hover:shadow-md hover:border-slate-300 transition-all cursor-pointer">
            <div className={`p-4 rounded-lg ${stat.color} mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <AlertTriangle className="text-rose-500 mr-2" size={20} /> Action Required
          </h2>
          <p className="text-slate-600">You have {stats.lowStockCount} products running low on stock. Please restock soon to avoid missing out on sales.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
