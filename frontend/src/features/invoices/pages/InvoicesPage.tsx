import React, { useEffect, useState } from 'react';
import { Plus, Receipt, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Invoice } from '../types';
import { InvoiceApi } from '../api/invoiceApi';
import { InvoiceFormModal } from '../components/InvoiceFormModal';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<Record<string, Invoice>>({});

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await InvoiceApi.getInvoices('company_01');
      setInvoices(data);
      setError(null);
    } catch (err) {
      setError('Failed to load invoices. Ensure backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoiceDetails = async (id: string) => {
    if (invoiceDetails[id]) {
      setExpandedInvoice(expandedInvoice === id ? null : id);
      return;
    }
    
    try {
      const data = await InvoiceApi.getInvoice(id);
      setInvoiceDetails(prev => ({ ...prev, [id]: data }));
      setExpandedInvoice(id);
    } catch (err) {
      console.error("Failed to load details", err);
    }
  };

  const handleCreateInvoice = async (payload: any) => {
    try {
      await InvoiceApi.createInvoice(payload);
      setIsModalOpen(false);
      fetchInvoices();
    } catch (err: any) {
      alert(`Error creating invoice: ${err.message}`);
    }
  };

  const handleIssueInvoice = async (id: string) => {
    if(!window.confirm("Issuing an invoice locks it and generates a Journal Entry. Proceed?")) return;
    try {
      await InvoiceApi.issueInvoice(id);
      fetchInvoices();
      if (expandedInvoice === id) {
          const data = await InvoiceApi.getInvoice(id);
          setInvoiceDetails(prev => ({ ...prev, [id]: data }));
      }
    } catch (err: any) {
      alert(`Error issuing invoice: ${err.message}`);
    }
  };

  const handleCancelInvoice = async (id: string) => {
    if(!window.confirm("Cancelling this invoice will reverse its associated Journal Entry. Proceed?")) return;
    try {
      await InvoiceApi.cancelInvoice(id);
      fetchInvoices();
    } catch (err: any) {
      alert(`Error cancelling invoice: ${err.message}`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
          <Receipt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Sales Invoices
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={16} /> New Invoice
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex justify-center items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                        <span>Loading Invoices...</span>
                      </div>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No invoices found. Create one to begin billing.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <React.Fragment key={invoice.id}>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${expandedInvoice === invoice.id ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                        onClick={() => loadInvoiceDetails(invoice.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white text-sm">
                          {invoice.id.substring(4).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invoice.status === 'issued' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' :
                            invoice.status === 'cancelled' ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' :
                            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>
                            {invoice.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-slate-300">
                           {invoice.customer_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium dark:text-slate-200">
                          IDR {Number(invoice.total).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {invoice.status === 'draft' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleIssueInvoice(invoice.id); }}
                              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4 font-medium"
                            >
                              Issue
                            </button>
                          )}
                          {invoice.status === 'issued' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCancelInvoice(invoice.id); }}
                              className="text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </motion.tr>
                        
                      {/* Expanded View */}
                      <AnimatePresence>
                        {expandedInvoice === invoice.id && invoiceDetails[invoice.id] && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-indigo-100 dark:border-indigo-900/50"
                          >
                            <td colSpan={5} className="px-6 py-4">
                              <div className="overflow-hidden bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                                
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between text-sm">
                                  <div>
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">Date</span>
                                    <span className="font-medium dark:text-slate-200">{new Date(invoiceDetails[invoice.id].created_at).toLocaleDateString()}</span>
                                  </div>
                                   <div>
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">Journal Ref</span>
                                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{invoiceDetails[invoice.id].journal_id || 'Not Posted'}</span>
                                  </div>
                                </div>

                                <table className="w-full text-sm">
                                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    <tr>
                                      <th className="px-4 py-3 text-left font-medium">Description</th>
                                      <th className="px-4 py-3 text-right font-medium">Qty</th>
                                      <th className="px-4 py-3 text-right font-medium">Unit Price</th>
                                      <th className="px-4 py-3 text-right font-medium">Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {invoiceDetails[invoice.id].items.map((item) => (
                                      <tr key={item.id}>
                                        <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{item.description}</td>
                                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{Number(item.unit_price).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-800 dark:text-slate-200">{Number(item.amount).toLocaleString()}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 font-medium">
                                    <tr>
                                      <td colSpan={3} className="px-4 py-2 text-right text-slate-500 dark:text-slate-400">Subtotal</td>
                                      <td className="px-4 py-2 text-right text-slate-800 dark:text-slate-200">{Number(invoiceDetails[invoice.id].subtotal).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                      <td colSpan={3} className="px-4 py-2 text-right text-slate-500 dark:text-slate-400">VAT (11%)</td>
                                      <td className="px-4 py-2 text-right text-slate-800 dark:text-slate-200">{Number(invoiceDetails[invoice.id].vat_amount).toLocaleString()}</td>
                                    </tr>
                                    <tr className="text-base bg-indigo-50/30 dark:bg-indigo-900/10">
                                      <td colSpan={3} className="px-4 py-3 text-right text-indigo-900 dark:text-indigo-400 font-bold">Total</td>
                                      <td className="px-4 py-3 text-right text-indigo-900 dark:text-indigo-400 font-bold">{Number(invoiceDetails[invoice.id].total).toLocaleString()}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <InvoiceFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateInvoice}
        />
      )}
    </div>
  );
};
