import { Invoice, InvoiceCreate } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1/invoices'; // MVP connection string

export const InvoiceApi = {
  getInvoices: async (company_id: string): Promise<Invoice[]> => {
    const response = await fetch(`${API_BASE_URL}/?company_id=${company_id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.statusText}`);
    }
    return response.json();
  },

  getInvoice: async (id: string): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch invoice details: ${response.statusText}`);
    }
    return response.json();
  },

  createInvoice: async (invoice: InvoiceCreate): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoice),
    });
    
    if (!response.ok) {
       const errorText = await response.text();
       throw new Error(`Failed to create invoice: ${errorText}`);
    }
    return response.json();
  },

  issueInvoice: async (id: string): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/${id}/issue`, {
      method: 'POST',
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to issue invoice: ${errorText}`);
    }
    return response.json();
  },

  cancelInvoice: async (id: string): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/${id}/cancel`, {
      method: 'POST',
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to cancel invoice: ${errorText}`);
    }
    return response.json();
  }
};
