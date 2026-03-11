export interface InvoiceItemCreate {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface InvoiceItem extends InvoiceItemCreate {
  id: string;
}

export interface InvoiceCreate {
  company_id: string;
  customer_id: string;
  currency?: string;
  items: InvoiceItemCreate[];
}

export interface Invoice extends InvoiceCreate {
  id: string;
  status: 'draft' | 'issued' | 'cancelled';
  subtotal: number;
  vat_amount: number;
  total: number;
  journal_id?: string;
  created_at: string;
  items: InvoiceItem[];
}
