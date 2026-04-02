import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2, Search, AlertCircle } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [baseUnit, setBaseUnit] = useState('kg');
  const [formData, setFormData] = useState({
    name: '', category: 'Fertilizer', brand: '', stockQuantity: 0, unit: '1 kg',
    buyingPrice: 0, sellingPrice: 0, gstPercentage: 5, sku: '', lowStockThreshold: 10
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updates = { [name]: value };
    if (name === 'category') {
      if (value === 'Fertilizer') updates.gstPercentage = 5;
      else if (value === 'Pesticide') updates.gstPercentage = 18;
    }
    setFormData({ ...formData, ...updates });
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingId(product._id);
      setFormData(product);
      
      const u = (product.unit || '').toLowerCase();
      if (u.includes('l') || u.includes('ml')) setBaseUnit('liter');
      else if (u.includes('bag')) setBaseUnit('bag');
      else setBaseUnit('kg');
    } else {
      setEditingId(null);
      setBaseUnit('kg');
      setFormData({
        name: '', category: 'Fertilizer', brand: '', stockQuantity: '', unit: '1 kg',
        buyingPrice: '', sellingPrice: '', gstPercentage: 5, sku: '', lowStockThreshold: 10
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      alert("Error saving product: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    const confirmation = window.prompt("Type DELETE to confirm product deletion. This action cannot be undone.");
    if (confirmation === 'DELETE') {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error(error);
        alert("Error deleting product.");
      }
    } else if (confirmation !== null) {
      alert("Product deletion cancelled.");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus size={20} className="mr-1" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading products...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">SKU/Code</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 mr-2">Stock</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">GST</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-xs">{p.sku || 'N/A'}</td>
                    <td className="p-4 font-medium text-slate-800">{p.name}</td>
                    <td className="p-4">{p.category}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className={`font-semibold ${p.stockQuantity <= p.lowStockThreshold ? 'text-red-600' : 'text-slate-700'}`}>
                          {p.stockQuantity} {p.unit}
                        </span>
                        {p.stockQuantity <= p.lowStockThreshold && (
                          <AlertCircle size={16} className="text-red-500 ml-2" title="Low Stock" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">₹{p.sellingPrice}</td>
                    <td className="p-4">{p.gstPercentage}%</td>
                    <td className="p-4 flex justify-center space-x-3">
                      <button onClick={() => openModal(p)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Name</label><input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border p-2 rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">SKU</label><input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="w-full border p-2 rounded" /></div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border p-2 rounded" required>
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Pesticide">Pesticide</option>
                  <option value="Seeds">Seeds</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1">Brand</label><input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full border p-2 rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">Stock Quantity</label><input required type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} className="w-full border p-2 rounded" /></div>
              <div>
                <label className="block text-sm font-medium mb-1">Base Type</label>
                <select 
                  value={baseUnit} 
                  onChange={(e) => {
                    const bu = e.target.value;
                    setBaseUnit(bu);
                    setFormData({...formData, unit: bu === 'kg' ? '1 kg' : bu === 'liter' ? '1 L' : '1 bag'})
                  }} 
                  className="w-full border p-2 rounded"
                >
                  <option value="kg">Weight (Kg/g)</option>
                  <option value="liter">Volume (L/ml)</option>
                  <option value="bag">Bags</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Package Size</label>
                {baseUnit === 'kg' && (
                  <select name="unit" value={formData.unit} onChange={handleInputChange} className="w-full border p-2 rounded">
                    <option value="1 kg">1 Kg</option>
                    <option value="1/2 kg">1/2 Kg</option>
                    <option value="250 g">250 g</option>
                    <option value="100 g">100 g</option>
                    <option value="5 kg">5 Kg</option>
                    <option value="10 kg">10 Kg</option>
                    <option value="25 kg">25 Kg</option>
                    <option value="50 kg">50 Kg</option>
                  </select>
                )}
                {baseUnit === 'liter' && (
                  <select name="unit" value={formData.unit} onChange={handleInputChange} className="w-full border p-2 rounded">
                    <option value="1 L">1 Liter</option>
                    <option value="1/2 L">1/2 Liter (500ml)</option>
                    <option value="250 ml">250 ml</option>
                    <option value="100 ml">100 ml</option>
                    <option value="5 L">5 Liter</option>
                  </select>
                )}
                {baseUnit === 'bag' && (
                  <select name="unit" value={formData.unit} onChange={handleInputChange} className="w-full border p-2 rounded">
                    <option value="1 bag">1 Bag</option>
                    <option value="50kg bag">50kg Bag</option>
                  </select>
                )}
              </div>
              <div><label className="block text-sm font-medium mb-1">Buying Price (₹)</label><input required type="number" name="buyingPrice" value={formData.buyingPrice} onChange={handleInputChange} className="w-full border p-2 rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">Selling Price (₹)</label><input required type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleInputChange} className="w-full border p-2 rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">GST (%)</label><input required type="number" name="gstPercentage" value={formData.gstPercentage} onChange={handleInputChange} className="w-full border p-2 rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">Alert Threshold</label><input required type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleInputChange} className="w-full border p-2 rounded" /></div>
              
              <div className="md:col-span-2 flex justify-end mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 mr-2 border rounded hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[var(--color-primary)] text-white font-medium rounded hover:bg-[var(--color-primary-dark)]">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
