import React, { useEffect, useState } from 'react';
import { Plus, Briefcase, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bill } from '../types';
import { BillApi } from '../api/billApi';
import { BillFormModal } from '../components/BillFormModal';

export const BillsPage: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedBill, setExpandedBill] = useState<Bill | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);

  const fetchBills = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await BillApi.getBills('company_01');
      setBills(data);
    } catch (err) {
      setError('Failed to load bills. Ensure backend is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleCreateBill = async (data: any) => {
    try {
      await BillApi.createBill(data);
      setIsModalOpen(false);
      fetchBills();
    } catch (err) {
      console.error("Failed to create bill", err);
      alert("Failed to create bill. See console.");
    }
  };

  const loadBillDetails = async (id: string) => {
    setIsExpanding(true);
    try {
      const details = await BillApi.getBill(id);
      setExpandedBill(details);
    } catch (err) {
      console.error("Failed to fetch bill details", err);
    } finally {
      setIsExpanding(false);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedBill(null);
    } else {
      setExpandedId(id);
      loadBillDetails(id);
    }
  };

  const handleApproveBill = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to approve this bill? This will generate an Accounts Payable Journal Entry.")) return;
    
    try {
      await BillApi.approveBill(id);
      fetchBills();
      if (expandedId === id) loadBillDetails(id);
    } catch (err) {
      console.error("Failed to approve", err);
      alert("Failed to approve bill.");
    }
  };

  const handleCancelBill = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to cancel this bill? This will reverse the associated Journal Entry.")) return;
    
    try {
      await BillApi.cancelBill(id);
      fetchBills();
      if (expandedId === id) loadBillDetails(id);
    } catch (err) {
      console.error("Failed to cancel", err);
      alert("Failed to cancel bill.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">Draft</span>;
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Approved</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Cancelled</span>;
      case 'paid':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">Paid</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="text-orionBlue dark:text-orionYellow" /> Vendor Bills
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage accounts payable, expenses, and vendor drafts.</p>
        </div>
        <div className="flex items-center gap-3">
            <button
                onClick={fetchBills}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="Refresh Bills"
            >
                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </button>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-orionBlue hover:bg-orionBlue/90 dark:bg-orionYellow dark:hover:bg-yellow-400 dark:text-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
                <Plus size={16} /> New Bill
            </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 border border-red-100 dark:border-red-900/50">
          <AlertCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Vendor</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Subtotal</th>
                  <th className="px-6 py-4 font-medium text-right">VAT Input</th>
                  <th className="px-6 py-4 font-medium text-right">Total</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {isLoading && bills.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading bills...</td>
                    </tr>
                ) : bills.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                            <Briefcase size={32} className="mx-auto mb-3 opacity-20" />
                            <p>No bills found.</p>
                        </td>
                    </tr>
                ) : (
                    bills.map((bill) => (
                        <React.Fragment key={bill.id}>
                            <tr 
                                onClick={() => toggleExpand(bill.id)}
                                className={`group cursor-pointer transition-colors ${expandedId === bill.id ? 'bg-slate-50 dark:bg-slate-800/80' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                            >
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                    {bill.vendor_id}
                                </td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                    {new Date(bill.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(bill.status)}
                                </td>
                                <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300">
                                    {bill.subtotal.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400">
                                    {bill.vat_amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">
                                    {bill.currency} {bill.total.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        {bill.status === 'draft' && (
                                            <button 
                                                onClick={(e) => handleApproveBill(e, bill.id)}
                                                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium text-xs bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {bill.status === 'approved' && (
                                            <button 
                                                onClick={(e) => handleCancelBill(e, bill.id)}
                                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-xs bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            <AnimatePresence>
                                {expandedId === bill.id && (
                                    <motion.tr
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-slate-50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800"
                                    >
                                        <td colSpan={7} className="px-6 py-6">
                                            {isExpanding && !expandedBill ? (
                                                <div className="text-center text-slate-500 py-4">Loading details...</div>
                                            ) : expandedBill ? (
                                                <div className="space-y-4 max-w-4xl">
                                                    <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                        <span>Bill ID: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{expandedBill.id}</span></span>
                                                        {expandedBill.linked_journal_id && (
                                                            <span>Linked AP Journal: <span className="font-mono text-orionBlue dark:text-orionYellow">{expandedBill.linked_journal_id}</span></span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                                        <table className="w-full text-sm">
                                                            <thead className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400">
                                                                <tr>
                                                                    <th className="px-4 py-2 font-medium">Description</th>
                                                                    <th className="px-4 py-2 font-medium text-right w-24">Qty</th>
                                                                    <th className="px-4 py-2 font-medium text-right w-32">Unit Price</th>
                                                                    <th className="px-4 py-2 font-medium text-right w-32">Amount</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                                {expandedBill.items.map((item, idx) => (
                                                                    <tr key={idx}>
                                                                        <td className="px-4 py-2 text-slate-900 dark:text-slate-200">{item.description}</td>
                                                                        <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-400">{item.quantity}</td>
                                                                        <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-400">{item.unit_price.toLocaleString()}</td>
                                                                        <td className="px-4 py-2 text-right font-medium text-slate-900 dark:text-slate-200">{item.amount.toLocaleString()}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </td>
                                    </motion.tr>
                                )}
                            </AnimatePresence>
                        </React.Fragment>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BillFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBill}
      />
    </div>
  );
};
