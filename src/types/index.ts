
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: Date;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

// Updated Session interface to match Supabase's Session type
export interface Session {
  user: {
    id: string;
    email?: string; // Made email optional to match Supabase's User type
  } | null;
}
