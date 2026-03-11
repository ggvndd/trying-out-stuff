export interface JournalLineCreate {
  account_id: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalLine extends JournalLineCreate {
  id: string;
  company_id: string;
  journal_id: string;
  created_at: string;
}

export interface JournalCreate {
  company_id: string;
  reference_type: string;
  reference_id?: string;
  currency: string;
  status?: string;
  lines: JournalLineCreate[];
}

export interface Journal extends Omit<JournalCreate, 'lines'> {
  id: string;
  status: string;
  created_at: string;
  posted_at?: string;
  created_by: string;
  lines: JournalLine[];
}
