import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { BillCreate, BillItemCreate } from '../types';

interface BillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BillCreate) => void;
}

export const BillFormModal: React.FC<BillFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [vendorId, setVendorId] = useState('');
  const [items, setItems] = useState<BillItemCreate[]>([]);

  useEffect(() => {
    if (isOpen) {
      setVendorId('');
      setItems([{ description: '', quantity: 1, unit_price: 0, amount: 0 }]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof BillItemCreate, value: any) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      const item = { ...newItems[index], [field]: value };
      
      // Auto-calculate amount
      if (field === 'quantity' || field === 'unit_price') {
        const qty = field === 'quantity' ? Number(value) : Number(item.quantity);
        const price = field === 'unit_price' ? Number(value) : Number(item.unit_price);
        item.amount = qty * price;
      }
      
      newItems[index] = item;
      return newItems;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) {
        alert("Please specify a vendor ID");
        return;
    }
    
    // Filter out empty rows
    const validItems = items.filter(i => i.description.trim() !== '' && i.amount > 0);
    if(validItems.length === 0) {
        alert("Please add at least one valid bill item.");
        return;
    }

    onSubmit({
      company_id: 'company_01',
      vendor_id: vendorId,
      currency: 'IDR',
      items: validItems,
    });
  };

  const draftSubtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const draftVat = draftSubtotal * 0.11; // 11% PPN IN
  const draftTotal = draftSubtotal + draftVat;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold dark:text-white">Record Vendor Bill</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6 max-w-sm">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor Name / ID</label>
            <input
              type="text"
              required
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              placeholder="e.g. AWS Web Services"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-emerald-50/10 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Bill Items / Expenses</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-sm font-medium flex items-center gap-1"
              >
                <Plus size={16} /> Add Line
              </button>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">Description</th>
                    <th className="px-4 py-2 font-medium w-24">Qty</th>
                    <th className="px-4 py-2 font-medium w-36 text-right">Unit Price</th>
                    <th className="px-4 py-2 font-medium w-36 text-right">Amount</th>
                    <th className="px-4 py-2 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2">
                         <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Hardware, SaaS license, etc."
                          className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 dark:text-white text-sm focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          required
                          min="0.01" step="0.01"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 dark:text-white text-sm focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          required
                          min="0" step="0.01"
                          value={item.unit_price || ''}
                          onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                          className="w-full px-3 py-1.5 text-right border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 dark:text-white text-sm focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-2 text-right px-4 font-medium dark:text-slate-200">
                         {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-center">
                         <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            disabled={items.length === 1}
                            className="text-slate-400 hover:text-red-500 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="bg-slate-100 dark:bg-slate-800 p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                 <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Subtotal</span>
                        <span className="font-medium dark:text-slate-200">{draftSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>VAT Input (11%)</span>
                        <span className="font-medium dark:text-slate-200">{draftVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-indigo-900 dark:text-indigo-400 font-bold text-base pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span>Total (AP) (IDR)</span>
                        <span>{draftTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
            >
              Save Draft
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
