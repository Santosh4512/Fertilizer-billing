import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, Search, Printer, AlertTriangle } from 'lucide-react';

const StockReport = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const { data } = await api.get('/products');
        setProducts(data);
      } catch (error) {
        console.error("Error fetching stock:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAssetValue = products.reduce((acc, p) => acc + (p.stockQuantity * p.buyingPrice), 0);
  const totalItemsInStock = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const lowStockItems = products.filter(p => p.stockQuantity <= p.lowStockThreshold).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 print:hidden">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search by name, SKU or category..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
        </div>
        <button 
          onClick={handlePrint}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Printer size={18} className="mr-2" /> Print Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-center">
          <div className="p-4 rounded-lg bg-indigo-500 mr-4 text-white"><Package size={24} /></div>
          <div><p className="text-sm font-medium text-slate-500 mb-1">Total Stock Items</p><h3 className="text-2xl font-bold text-slate-800">{totalItemsInStock}</h3></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-center">
          <div className="p-4 rounded-lg bg-emerald-500 mr-4 text-white"><span className="font-bold text-lg leading-none">₹</span></div>
          <div><p className="text-sm font-medium text-slate-500 mb-1">Total Asset Value</p><h3 className="text-2xl font-bold text-slate-800">₹{totalAssetValue.toLocaleString()}</h3></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-center">
          <div className="p-4 rounded-lg bg-red-500 mr-4 text-white"><AlertTriangle size={24} /></div>
          <div><p className="text-sm font-medium text-slate-500 mb-1">Low Stock Alerts</p><h3 className="text-2xl font-bold text-slate-800">{lowStockItems}</h3></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border-none print:w-full">
        {/* Print Header */}
        <div className="hidden print:block text-center p-6 border-b-2 border-slate-800 mb-6">
          <h1 className="text-2xl font-extrabold text-[#10b981] uppercase tracking-wider">SRI PEDDINTLAMMA FERTILIZERS</h1>
          <h2 className="text-lg font-bold text-slate-800 mt-2">OFFICIAL STOCK REPORT</h2>
          <p className="text-slate-600 mt-1">Date: {new Date().toLocaleDateString()}</p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading stock data...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600 print:text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 print:bg-transparent print:border-b-2 print:border-slate-800">
              <tr>
                <th className="p-4 print:py-2">SKU</th>
                <th className="p-4 print:py-2">Product Name</th>
                <th className="p-4 print:py-2">Category</th>
                <th className="p-4 print:py-2 text-center">Physical Stock</th>
                <th className="p-4 print:py-2 text-right">Buying Price</th>
                <th className="p-4 print:py-2 text-right">Asset Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const isLowStock = p.stockQuantity <= p.lowStockThreshold;
                const assetValue = p.stockQuantity * p.buyingPrice;
                return (
                  <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors print:border-slate-300">
                    <td className="p-4 print:py-2 font-mono text-xs">{p.sku || '---'}</td>
                    <td className="p-4 print:py-2 font-medium text-slate-800">{p.name} {p.brand ? `(${p.brand})` : ''}</td>
                    <td className="p-4 print:py-2">{p.category}</td>
                    <td className="p-4 print:py-2 text-center">
                      <span className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-slate-700'}`}>
                        {p.stockQuantity} {p.unit}
                      </span>
                    </td>
                    <td className="p-4 print:py-2 text-right">₹{p.buyingPrice.toFixed(2)}</td>
                    <td className="p-4 print:py-2 text-right font-bold text-slate-800">₹{assetValue.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            {/* Print Footer Summary */}
            <tfoot className="hidden print:table-footer-group">
              <tr>
                <td colSpan="5" className="p-4 text-right font-bold text-slate-800 uppercase border-t-2 border-slate-800">Total Asset Value:</td>
                <td className="p-4 text-right font-bold text-slate-800 text-lg border-t-2 border-slate-800">₹{totalAssetValue.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
};

export default StockReport;
