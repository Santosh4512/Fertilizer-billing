import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Printer, Eye, Calendar, User, Search, Trash2 } from 'lucide-react';

const Invoices = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const { data } = await api.get('/bills');
        setBills(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async (id) => {
    const confirmation = window.prompt("Type DELETE to confirm invoice deletion. Products will be returned to stock automatically.");
    if (confirmation === 'DELETE') {
      try {
        await api.delete(`/bills/${id}`);
        // Refresh bills list
        setBills(bills.filter(b => b._id !== id));
      } catch (error) {
        alert("Error deleting invoice: " + (error.response?.data?.message || error.message));
      }
    } else if (confirmation !== null) {
      alert("Invoice deletion cancelled.");
    }
  };

  const filteredBills = bills.filter(b => 
    b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.customerPhone && b.customerPhone.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {!selectedBill ? (
        <>
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search by customer name or phone..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading invoices...</div>
            ) : (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center">
                          <Calendar size={16} className="text-slate-400 mr-2" />
                          {new Date(bill.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <User size={16} className="text-slate-400 mr-2" />
                          <div>
                            <p className="font-medium text-slate-800">{bill.customerName}</p>
                            <p className="text-xs text-slate-500">{bill.customerPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{bill.products.reduce((acc, p) => acc + p.quantity, 0)} items</td>
                      <td className="p-4 font-bold text-slate-800">₹{bill.finalTotal.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          bill.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {bill.paymentMethod} - {bill.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <button 
                          onClick={() => setSelectedBill(bill)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-medium inline-flex items-center transition-colors border border-slate-200"
                        >
                          <Eye size={14} className="mr-1" /> View / Print
                        </button>
                        <button 
                          onClick={() => handleDelete(bill._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded text-xs font-medium inline-flex items-center transition-colors border border-red-200"
                        >
                          <Trash2 size={14} className="mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredBills.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">No invoices found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        /* Printable Invoice View */
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print:w-full print:border-none print:shadow-none">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center print:hidden">
            <button onClick={() => setSelectedBill(null)} className="text-slate-600 hover:text-slate-900 border px-3 py-1.5 rounded transition-colors">&larr; Back to Invoices</button>
            <button onClick={handlePrint} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-4 py-2 rounded flex items-center transition-colors">
              <Printer size={18} className="mr-2" /> Print Invoice
            </button>
          </div>
          
          <div className="p-8 print:p-0">
            {/* Invoice Header */}
            <div className="text-center mb-8">
              <h1 className="text-xl font-extrabold text-[#10b981] uppercase tracking-wider">SRI PEDDINTLAMMA FERTILIZERS AND PESTICIDES</h1>
              <p className="text-slate-600 mt-1 font-medium">MAIN ROAD NEAR PEDDINTLAMMA TEMPLE; DN0:26-154</p>
              <p className="text-slate-600 font-medium">Ph: +919866601696 | GSTIN: 37ADTPN0502G1ZL | LICENCE N0: C1/301</p>
            </div>

            <div className="flex justify-between items-start mb-8 border-b-2 border-slate-800 pb-6">
              <div>
                <h3 className="text-slate-500 text-sm font-bold uppercase mb-1">Billed To</h3>
                <p className="font-bold text-slate-800 text-lg">{selectedBill.customerName}</p>
                {selectedBill.customerPhone && <p className="text-slate-600">Ph: {selectedBill.customerPhone}</p>}
              </div>
              <div className="text-right">
                <h3 className="text-slate-500 text-sm font-bold uppercase mb-1">Invoice Details</h3>
                <p className="text-slate-800"><span className="font-semibold text-slate-600">Invoice No:</span> INV-{selectedBill.invoiceNumber || selectedBill._id.substring(selectedBill._id.length - 6).toUpperCase()}</p>
                <p className="text-slate-800"><span className="font-semibold text-slate-600">Date:</span> {new Date(selectedBill.createdAt).toLocaleDateString()}</p>
                <p className="text-slate-800"><span className="font-semibold text-slate-600">Payment:</span> {selectedBill.paymentMethod} ({selectedBill.paymentStatus})</p>
              </div>
            </div>

            <table className="w-full text-left mb-8 border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-800">
                  <th className="py-3 font-bold uppercase text-sm">Description</th>
                  <th className="py-3 text-center font-bold uppercase text-sm">Qty</th>
                  <th className="py-3 text-right font-bold uppercase text-sm">Base Price</th>
                  <th className="py-3 text-right font-bold uppercase text-sm">CGST</th>
                  <th className="py-3 text-right font-bold uppercase text-sm">SGST</th>
                  <th className="py-3 text-right font-bold uppercase text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.products.map((item, index) => {
                  const itemTotal = item.sellingPrice * item.quantity;
                  const itemBase = itemTotal / (1 + (item.gstPercentage / 100));
                  const itemTax = itemTotal - itemBase;
                  return (
                    <tr key={index} className="border-b border-slate-200">
                      <td className="py-3 text-slate-800">{item.name}</td>
                      <td className="py-3 text-center text-slate-800">{item.quantity}</td>
                      <td className="py-3 text-right text-slate-800">₹{(itemBase).toFixed(2)}</td>
                      <td className="py-3 text-right text-slate-800">₹{(itemTax / 2).toFixed(2)} <span className="text-xs text-slate-400">({item.gstPercentage / 2}%)</span></td>
                      <td className="py-3 text-right text-slate-800">₹{(itemTax / 2).toFixed(2)} <span className="text-xs text-slate-400">({item.gstPercentage / 2}%)</span></td>
                      <td className="py-3 text-right font-medium text-slate-800">₹{itemTotal.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Value</span>
                  <span>₹{selectedBill.totalSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total CGST</span>
                  <span>₹{(selectedBill.totalGST / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total SGST</span>
                  <span>₹{(selectedBill.totalGST / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-slate-800 pt-2 border-t-2 border-slate-800 mt-2">
                  <div className="flex flex-col">
                    <span>Grand Total</span>
                    <span className="text-xs font-normal text-slate-500 mt-1">(Inclusive of GST)</span>
                  </div>
                  <span>₹{selectedBill.finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-16 text-center text-slate-500 text-sm border-t border-slate-200 pt-8 print:mt-12">
              <p>Thank you for doing business with us.</p>
              <p>For any queries, contact our support team.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
