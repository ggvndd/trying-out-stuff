export interface Account {
  _id: string;
  company_id: string;
  code: string;
  name: string;
  type: string;
  currency: string;
  parent_account_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AccountCreate {
  company_id: string;
  code: string;
  name: string;
  type: string;
  currency?: string;
  parent_account_id?: string | null;
}

export interface AccountUpdate {
  name?: string;
  is_active?: boolean;
}
