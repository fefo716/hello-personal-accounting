
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
