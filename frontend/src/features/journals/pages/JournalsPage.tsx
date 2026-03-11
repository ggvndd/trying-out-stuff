import React, { useEffect, useState } from 'react';
import { Plus, BookOpen, AlertCircle, RefreshCw, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Journal, JournalCreate } from '../types';
import { JournalApi } from '../api/journalApi';
import { JournalFormModal } from '../components/JournalFormModal';

export const JournalsPage: React.FC = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedJournal, setExpandedJournal] = useState<string | null>(null);
  const [journalDetails, setJournalDetails] = useState<Record<string, Journal>>({});

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const data = await JournalApi.getJournals('company_01');
      setJournals(data);
      setError(null);
    } catch (err) {
      setError('Failed to load journal entries. Please ensure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJournal = async (payload: JournalCreate) => {
    try {
      await JournalApi.createJournal(payload);
      setIsModalOpen(false);
      fetchJournals();
    } catch (err: any) {
      alert(`Error creating journal: ${err.message}`);
    }
  };

  const loadJournalDetails = async (id: string) => {
    if (journalDetails[id]) {
      setExpandedJournal(expandedJournal === id ? null : id);
      return;
    }
    
    try {
      const data = await JournalApi.getJournal(id);
      setJournalDetails(prev => ({ ...prev, [id]: data }));
      setExpandedJournal(id);
    } catch (err) {
      console.error("Failed to load details", err);
    }
  };

  const handlePostJournal = async (id: string) => {
    try {
      await JournalApi.postJournal(id);
      fetchJournals();
      if (expandedJournal === id) {
          const data = await JournalApi.getJournal(id);
          setJournalDetails(prev => ({ ...prev, [id]: data }));
      }
    } catch (err: any) {
      alert(`Error posting journal: ${err.message}`);
    }
  };

  const handleReverseJournal = async (id: string) => {
    if(!window.confirm("Are you sure you want to reverse this posted journal? This action will generate a new reversal entry.")) return;
    try {
      await JournalApi.reverseJournal(id);
      fetchJournals();
    } catch (err: any) {
      alert(`Error reversing journal: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Journal Entries
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage and post double-entry financial records.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal</span>
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">ID / Reference</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        <div className="flex justify-center items-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                          <span>Loading Journals...</span>
                        </div>
                      </td>
                    </tr>
                  ) : journals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p>No journal entries found. Draft one to begin.</p>
                      </td>
                    </tr>
                  ) : (
                    journals.map((journal) => (
                      <React.Fragment key={journal.id}>
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`hover:bg-slate-50 transition-colors cursor-pointer ${expandedJournal === journal.id ? 'bg-indigo-50/30' : ''}`}
                          onClick={() => loadJournalDetails(journal.id)}
                        >
                          <td className="px-6 py-4 font-medium text-slate-800">
                            {journal.id.substring(8).toUpperCase()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              journal.status === 'posted' ? 'bg-emerald-100 text-emerald-800' :
                              journal.status === 'reversed' ? 'bg-slate-100 text-slate-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {journal.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 capitalize">{journal.reference_type}</td>
                          <td className="px-6 py-4 text-slate-500">
                            {new Date(journal.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {journal.status === 'draft' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handlePostJournal(journal.id); }}
                                className="text-emerald-600 hover:text-emerald-800 text-xs font-medium bg-emerald-50 px-3 py-1.5 rounded-lg mr-2 transition-colors flex items-center justify-center gap-1 inline-flex"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Post
                              </button>
                            )}
                            {journal.status === 'posted' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleReverseJournal(journal.id); }}
                                className="text-amber-600 hover:text-amber-800 text-xs font-medium bg-amber-50 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 inline-flex"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Reverse
                              </button>
                            )}
                          </td>
                        </motion.tr>
                        
                        {/* Expanded Lines View */}
                        <AnimatePresence>
                          {expandedJournal === journal.id && journalDetails[journal.id] && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-slate-50/80 border-b border-indigo-100"
                            >
                              <td colSpan={5} className="px-6 py-4">
                                <div className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-sm">
                                  <table className="w-full text-sm">
                                    <thead className="bg-slate-100 text-slate-600">
                                      <tr>
                                        <th className="px-4 py-2 text-left font-medium">Account ID</th>
                                        <th className="px-4 py-2 text-left font-medium">Description</th>
                                        <th className="px-4 py-2 text-right font-medium">Debit</th>
                                        <th className="px-4 py-2 text-right font-medium">Credit</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {journalDetails[journal.id].lines.map((line) => (
                                        <tr key={line.id}>
                                          <td className="px-4 py-2 font-mono text-xs text-slate-500">{line.account_id}</td>
                                          <td className="px-4 py-2 text-slate-600">{line.description || '-'}</td>
                                          <td className="px-4 py-2 text-right text-slate-800">
                                            {Number(line.debit) > 0 ? Number(line.debit).toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}
                                          </td>
                                          <td className="px-4 py-2 text-right text-slate-800">
                                            {Number(line.credit) > 0 ? Number(line.credit).toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
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
        </div>
      )}

      <JournalFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateJournal}
      />
    </div>
  );
};
