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
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Journal Entries
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={16} /> New Journal
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID / Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex justify-center items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                        <span>Loading Journals...</span>
                      </div>
                    </td>
                  </tr>
                ) : journals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No journal entries found. Draft one to begin.
                    </td>
                  </tr>
                ) : (
                  journals.map((journal) => (
                    <React.Fragment key={journal.id}>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${expandedJournal === journal.id ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                        onClick={() => loadJournalDetails(journal.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">
                          {journal.id.substring(8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            journal.status === 'posted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            journal.status === 'reversed' ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {journal.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize text-sm dark:text-slate-300">{journal.reference_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-slate-300">
                          {new Date(journal.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {journal.status === 'draft' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handlePostJournal(journal.id); }}
                              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 mr-4"
                            >
                              Post
                            </button>
                          )}
                          {journal.status === 'posted' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleReverseJournal(journal.id); }}
                              className="text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                            >
                              Reverse
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
                            className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-blue-100 dark:border-blue-900/50"
                          >
                            <td colSpan={5} className="px-6 py-4">
                              <div className="overflow-hidden bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                                <table className="w-full text-sm">
                                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    <tr>
                                      <th className="px-4 py-2 text-left font-medium">Account ID</th>
                                      <th className="px-4 py-2 text-left font-medium">Description</th>
                                      <th className="px-4 py-2 text-right font-medium">Debit</th>
                                      <th className="px-4 py-2 text-right font-medium">Credit</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {journalDetails[journal.id].lines.map((line) => (
                                      <tr key={line.id}>
                                        <td className="px-4 py-2 font-mono text-xs text-slate-500 dark:text-slate-400">{line.account_id}</td>
                                        <td className="px-4 py-2 text-slate-600 dark:text-slate-300">{line.description || '-'}</td>
                                        <td className="px-4 py-2 text-right text-slate-800 dark:text-slate-200">
                                          {Number(line.debit) > 0 ? Number(line.debit).toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}
                                        </td>
                                        <td className="px-4 py-2 text-right text-slate-800 dark:text-slate-200">
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
      )}

      <JournalFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateJournal}
      />
    </div>
  );
};
