import { Bill, BillCreate } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1/bills';

export const BillApi = {
  getBills: async (company_id: string): Promise<Bill[]> => {
    const response = await fetch(`${API_BASE_URL}/?company_id=${company_id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch bills');
    }
    return response.json();
  },

  getBill: async (id: string): Promise<Bill> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch bill details');
    }
    return response.json();
  },

  createBill: async (data: BillCreate): Promise<Bill> => {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to create bill');
    }
    return response.json();
  },

  approveBill: async (id: string): Promise<Bill> => {
    const response = await fetch(`${API_BASE_URL}/${id}/approve`, {
      method: 'POST',
    });
    if (!response.ok) {
        throw new Error('Failed to approve bill');
    }
    return response.json();
  },

  cancelBill: async (id: string): Promise<Bill> => {
    const response = await fetch(`${API_BASE_URL}/${id}/cancel`, {
      method: 'POST',
    });
    if (!response.ok) {
        throw new Error('Failed to cancel bill');
    }
    return response.json();
  }
};
