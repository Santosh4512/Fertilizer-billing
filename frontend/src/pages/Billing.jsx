import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Plus, Trash2, Printer, CreditCard, Wallet, Banknote } from 'lucide-react';

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Cash, UPI, Razorpay
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await api.get('/products');
      setProducts(data.filter(p => p.stockQuantity > 0)); // Only show in-stock products
    };
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(item => item.product._id === product._id);
    if (existing) {
      if (existing.quantity >= product.stockQuantity) {
        alert("Cannot add more than available stock!");
        return;
      }
      setCart(cart.map(item => item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.product._id === id) {
        const newQty = item.quantity + delta;
        if (newQty > item.product.stockQuantity) {
          alert("Exceeds available stock!");
          return item;
        }
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.product._id !== id));
  };

  // Inclusive Math Dynamic
  const finalTotal = cart.reduce((acc, item) => acc + (item.product.sellingPrice * item.quantity), 0);
  const taxableSubtotal = cart.reduce((acc, item) => acc + ((item.product.sellingPrice * item.quantity) / (1 + (item.product.gstPercentage / 100))), 0);
  const totalGST = finalTotal - taxableSubtotal;
  const cgst = totalGST / 2;
  const sgst = totalGST / 2;

  const handleCheckout = async () => {
    if (!customerInfo.name) return alert("Customer name is required!");
    if (cart.length === 0) return alert("Cart is empty!");

    setLoading(true);
    try {
      const payload = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        paymentMethod,
        products: cart.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          sellingPrice: item.product.sellingPrice,
          gstPercentage: item.product.gstPercentage
        }))
      };

      const { data } = await api.post('/bills', payload);

      if (paymentMethod === 'Razorpay') {
        const { data: config } = await api.get('/config/razorpay');
        const options = {
          key: config.keyId,
          amount: data.amount,
          currency: "INR",
          name: "Fertilizer Shop",
          description: "Test Transaction",
          order_id: data.razorpayOrderId,
          handler: async function (response) {
            await api.post('/bills/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              billId: data.bill._id
            });
            alert("Payment Successful!");
            setCart([]);
            setCustomerInfo({ name: '', phone: '' });
          },
          prefill: { name: customerInfo.name, contact: customerInfo.phone },
          theme: { color: "#10b981" }
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } else {
        alert("Bill generated successfully!");
        setCart([]);
        setCustomerInfo({ name: '', phone: '' });
      }
    } catch (error) {
      alert("Error generating bill: " + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Product Selection List */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products to add..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map(p => (
            <div key={p._id} className="border border-slate-200 p-4 rounded-xl cursor-pointer hover:border-[var(--color-primary)] hover:shadow-md transition-all shadow-sm" onClick={() => addToCart(p)}>
              <h3 className="font-semibold text-slate-800 select-none line-clamp-1">{p.name}</h3>
              <p className="text-sm text-slate-500 mb-2 select-none text-xs">{p.sku}</p>
              <div className="flex justify-between items-end">
                <span className="font-bold text-[var(--color-primary)]">₹{p.sellingPrice}</span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Stock: {p.stockQuantity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart & Billing Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-lg text-slate-800">Current Bill</h2>
        </div>
        
        <div className="p-4 border-b border-slate-100 space-y-3">
          <input
            type="text"
            placeholder="Customer Name *"
            className="w-full border border-slate-300 p-2 rounded-lg text-sm"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Phone Number"
            className="w-full border border-slate-300 p-2 rounded-lg text-sm"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">Cart is empty</div>
          ) : (
            cart.map(item => (
              <div key={item.product._id} className="flex justify-between items-center border-b border-slate-50 pb-2">
                <div className="flex-1">
                  <p className="font-medium text-slate-800 text-sm line-clamp-1">{item.product.name}</p>
                  <p className="text-xs text-slate-500">₹{item.product.sellingPrice} (Incl. GST)</p>
                </div>
                <div className="flex items-center space-x-2 w-24">
                  <button onClick={() => updateQuantity(item.product._id, -1)} className="bg-slate-100 px-2 rounded hover:bg-slate-200">-</button>
                  <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product._id, 1)} className="bg-slate-100 px-2 rounded hover:bg-slate-200">+</button>
                </div>
                <button onClick={() => removeFromCart(item.product._id)} className="text-red-400 hover:text-red-600 ml-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <div className="flex justify-between text-sm mb-1 text-slate-600"><span>Taxable Value:</span> <span>₹{taxableSubtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm mb-1 text-slate-600"><span>Total CGST:</span> <span>₹{cgst.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm mb-3 text-slate-600"><span>Total SGST:</span> <span>₹{sgst.toFixed(2)}</span></div>
          <div className="flex justify-between text-xl font-bold text-slate-800 mb-4 border-t border-slate-200 pt-2">
            <span>Total:</span> <span>₹{finalTotal.toFixed(2)}</span>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {['Cash', 'UPI', 'Razorpay'].map(method => (
                <button 
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 text-sm rounded border flex flex-col items-center justify-center transition-colors ${paymentMethod === method ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {method === 'Cash' ? <Banknote size={16} className="mb-1"/> : method === 'UPI' ? <Wallet size={16} className="mb-1"/> : <CreditCard size={16} className="mb-1"/>}
                  {method}
                </button>
              ))}
            </div>
          </div>

          <button 
            disabled={loading || cart.length === 0}
            onClick={handleCheckout}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold flex justify-center items-center hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
