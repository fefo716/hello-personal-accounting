
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
