
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  payment_method_id?: string;
  payment_method?: string;
  date: Date;
  workspace_id?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  workspace_id?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  user: {
    id: string;
    email?: string;
  } | null;
}

export interface Workspace {
  id: string;
  name: string;
  code: string;
  created_at: string;
  created_by: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
}
