
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Transaction, TransactionType } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface TransactionsContextProps {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  getFilteredTransactions: (type?: TransactionType) => Transaction[];
  getTotalBalance: () => number;
  getTotalByType: (type: TransactionType) => number;
}

const TransactionsContext = createContext<TransactionsContextProps | undefined>(undefined);

// Initial sample data
const initialTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 3000,
    description: 'Salary',
    category: 'Work',
    date: new Date(2023, 5, 1)
  },
  {
    id: '2',
    type: 'expense',
    amount: 50,
    description: 'Dinner',
    category: 'Food',
    date: new Date(2023, 5, 3)
  },
  {
    id: '3',
    type: 'expense',
    amount: 100,
    description: 'Electricity bill',
    category: 'Utilities',
    date: new Date(2023, 5, 5)
  },
  {
    id: '4',
    type: 'income',
    amount: 500,
    description: 'Freelance project',
    category: 'Extra',
    date: new Date(2023, 5, 10)
  },
  {
    id: '5',
    type: 'expense',
    amount: 30,
    description: 'Books',
    category: 'Entertainment',
    date: new Date(2023, 5, 15)
  }
];

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    if (saved) {
      try {
        // Parse the JSON and convert date strings back to Date objects
        return JSON.parse(saved).map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));
      } catch (e) {
        console.error('Failed to parse transactions from localStorage', e);
        return initialTransactions;
      }
    } else {
      return initialTransactions;
    }
  });
  
  const { toast } = useToast();

  // Save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    
    toast({
      title: transaction.type === 'income' ? 'Income added' : 'Expense added',
      description: `${transaction.description} - $${transaction.amount.toFixed(2)}`,
      duration: 3000,
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      return filtered;
    });
    
    toast({
      title: 'Transaction deleted',
      duration: 3000,
    });
  };

  const getFilteredTransactions = (type?: TransactionType) => {
    if (!type) return transactions;
    return transactions.filter(t => t.type === type);
  };

  const getTotalBalance = () => {
    return transactions.reduce((acc, curr) => {
      return curr.type === 'income' 
        ? acc + curr.amount 
        : acc - curr.amount;
    }, 0);
  };

  const getTotalByType = (type: TransactionType) => {
    return transactions
      .filter(t => t.type === type)
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        getFilteredTransactions,
        getTotalBalance,
        getTotalByType
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};
