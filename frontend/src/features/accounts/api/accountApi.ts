import { Account, AccountCreate, AccountUpdate } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api/v1/accounts/';

export const AccountApi = {
  getAccounts: async (companyId: string): Promise<Account[]> => {
    const res = await fetch(`${API_BASE}?company_id=${companyId}`);
    if (!res.ok) throw new Error('Failed to fetch accounts');
    return res.json();
  },

  createAccount: async (data: AccountCreate): Promise<Account> => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create account');
    return res.json();
  },

  updateAccount: async (id: string, data: AccountUpdate): Promise<Account> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update account');
    return res.json();
  },

  deleteAccount: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete account');
  }
};
