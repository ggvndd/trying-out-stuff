import { Journal, JournalCreate } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api/v1/journals/';

export const JournalApi = {
  getJournals: async (companyId: string): Promise<Journal[]> => {
    const response = await fetch(`${API_BASE}?company_id=${companyId}`);
    if (!response.ok) throw new Error('Failed to fetch journals');
    return response.json();
  },

  getJournal: async (id: string): Promise<Journal> => {
    const response = await fetch(`${API_BASE}${id}`);
    if (!response.ok) throw new Error('Failed to fetch journal metadata');
    return response.json();
  },

  createJournal: async (journal: JournalCreate): Promise<Journal> => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(journal),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create journal');
    }
    return response.json();
  },

  postJournal: async (id: string): Promise<Journal> => {
    const response = await fetch(`${API_BASE}${id}/post`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to post journal');
    return response.json();
  },

  reverseJournal: async (id: string): Promise<Journal> => {
    const response = await fetch(`${API_BASE}${id}/reverse`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to reverse journal');
    return response.json();
  }
};
