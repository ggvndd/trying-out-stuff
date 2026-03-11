export interface BillItemCreate {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface BillItem extends BillItemCreate {
  id: string;
}

export interface BillCreate {
  company_id: string;
  vendor_id: string;
  date?: string;
  due_date?: string;
  currency?: string;
  notes?: string;
  items: BillItemCreate[];
}

export interface Bill extends Omit<BillCreate, 'items'> {
  id: string;
  status: 'draft' | 'approved' | 'paid' | 'cancelled';
  subtotal: number;
  vat_amount: number;
  total: number;
  linked_journal_id?: string;
  items: BillItem[];
  created_at: string;
  updated_at: string;
}
