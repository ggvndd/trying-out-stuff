import React, { useEffect, useState } from 'react';
import { AccountApi } from '../api/accountApi';
import { Account } from '../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const companyId = 'company_01'; // Mocked to match the MVP spec

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await AccountApi.getAccounts(companyId);
      setAccounts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const dummyCreate = async () => {
    try {
      await AccountApi.createAccount({
        company_id: companyId,
        code: `10${Math.floor(Math.random() * 100)}`,
        name: 'New Asset Account',
        type: 'asset'
      });
      fetchAccounts();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-6">Loading Accounts...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Chart of Accounts</h1>
        <button 
          onClick={dummyCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={16} /> New Account
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {accounts.map(acc => (
              <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">{acc.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-slate-300">{acc.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-slate-300 capitalize">{acc.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                   <button className="text-blue-500 hover:text-blue-700 mr-3"><Edit2 size={16}/></button>
                   <button className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No accounts found. Create one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountsPage;
