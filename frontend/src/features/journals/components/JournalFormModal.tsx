import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, AlertCircle } from 'lucide-react';
import { JournalCreate, JournalLineCreate } from '../types';
import { Account } from '../../accounts/types';
import { AccountApi } from '../../accounts/api/accountApi';

interface JournalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (journal: JournalCreate) => void;
}

export const JournalFormModal: React.FC<JournalFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  
  // Form State
  const [referenceType, setReferenceType] = useState('manual');
  const [lines, setLines] = useState<JournalLineCreate[]>([
    { account_id: '', debit: 0, credit: 0, description: '' },
    { account_id: '', debit: 0, credit: 0, description: '' }
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    } else {
      // Reset state on close
      setLines([
        { account_id: '', debit: 0, credit: 0, description: '' },
        { account_id: '', debit: 0, credit: 0, description: '' }
      ]);
      setError(null);
    }
  }, [isOpen]);

  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const data = await AccountApi.getAccounts('company_01');
      setAccounts(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load accounts for selection.');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const addLine = () => {
    setLines([...lines, { account_id: '', debit: 0, credit: 0, description: '' }]);
  };

  const updateLine = (index: number, field: keyof JournalLineCreate, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) {
      setError("A journal must have at least two lines.");
      return;
    }
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines);
    setError(null);
  };

  const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (lines.some(l => !l.account_id)) {
      setError("Please select an account for all lines.");
      return;
    }
    if (!isBalanced) {
      setError(`Journal is unbalanced. Debit (${totalDebit}) !== Credit (${totalCredit})`);
      return;
    }

    const payload: JournalCreate = {
      company_id: 'company_01',
      reference_type: referenceType,
      currency: 'IDR',
      lines: lines.map(line => ({
        ...line,
        debit: Number(line.debit),
        credit: Number(line.credit)
      }))
    };

    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-semibold text-slate-800">New Journal Entry</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form id="journal-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reference Type</label>
                  <select
                    value={referenceType}
                    onChange={(e) => setReferenceType(e.target.value)}
                    className="w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm transition-colors text-sm"
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="opening_balance">Opening Balance</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Account</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Debit</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Credit</th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {lines.map((line, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2">
                          <select
                            required
                            value={line.account_id}
                            onChange={(e) => updateLine(index, 'account_id', e.target.value)}
                            className="w-full text-sm rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                          >
                            <option value="" disabled>Select Account</option>
                            {accounts.map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            placeholder="Line description (optional)"
                            value={line.description || ''}
                            onChange={(e) => updateLine(index, 'description', e.target.value)}
                            className="w-full text-sm rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.debit === 0 ? '' : line.debit}
                            onChange={(e) => {
                                updateLine(index, 'debit', e.target.value === '' ? 0 : parseFloat(e.target.value));
                                if (parseFloat(e.target.value) > 0) updateLine(index, 'credit', 0);
                            }}
                            className="w-full text-sm text-right rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.credit === 0 ? '' : line.credit}
                            onChange={(e) => {
                                updateLine(index, 'credit', e.target.value === '' ? 0 : parseFloat(e.target.value));
                                if (parseFloat(e.target.value) > 0) updateLine(index, 'debit', 0);
                            }}
                            className="w-full text-sm text-right rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeLine(index)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={2} className="px-4 py-3">
                        <button
                          type="button"
                          onClick={addLine}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Add Line
                        </button>
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold text-sm ${totalDebit !== totalCredit ? 'text-red-600' : 'text-slate-800'}`}>
                        {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold text-sm ${totalDebit !== totalCredit ? 'text-red-600' : 'text-slate-800'}`}>
                        {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </form>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="journal-form"
              disabled={!isBalanced || loadingAccounts}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-200"
            >
              Draft Journal
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
