
import { createContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, TransactionType, PaymentMethod } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { format } from 'date-fns';
import {
  fetchTransactions,
  fetchPaymentMethods,
  addTransaction as apiAddTransaction,
  deleteTransaction as apiDeleteTransaction,
  addPaymentMethod as apiAddPaymentMethod
} from '@/services/transactionService';

interface TransactionsContextProps {
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  loadingTransactions: boolean;
  loadingPaymentMethods: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getFilteredTransactions: (type?: TransactionType, yearMonth?: string) => Transaction[];
  getTotalBalance: () => number;
  getTotalByType: (type: TransactionType) => number;
  addPaymentMethod: (name: string) => Promise<void>;
}

export const TransactionsContext = createContext<TransactionsContextProps | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const { toast } = useToast();
  const { session } = useAuth();
  const { currentWorkspace } = useWorkspace();

  // Actualizar cuando cambia el espacio de trabajo actual
  useEffect(() => {
    if (session?.user?.id && currentWorkspace) {
      fetchUserTransactions();
      fetchUserPaymentMethods();
    } else {
      setTransactions([]);
      setPaymentMethods([]);
      setLoadingTransactions(false);
      setLoadingPaymentMethods(false);
    }
  }, [session?.user?.id, currentWorkspace]);

  const fetchUserTransactions = async () => {
    try {
      if (!session?.user?.id || !currentWorkspace) return;
      
      setLoadingTransactions(true);
      const data = await fetchTransactions(session.user.id, currentWorkspace.id);
      setTransactions(data);
    } catch (error: any) {
      console.error('Error fetching transactions:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive',
      });
    } finally {
      setLoadingTransactions(false);
    }
  };

  const fetchUserPaymentMethods = async () => {
    try {
      if (!session?.user?.id || !currentWorkspace) return;
      
      setLoadingPaymentMethods(true);
      const data = await fetchPaymentMethods(session.user.id, currentWorkspace.id);
      setPaymentMethods(data as PaymentMethod[]);
    } catch (error: any) {
      console.error('Error fetching payment methods:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to load payment methods',
        variant: 'destructive',
      });
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      if (!session?.user?.id || !currentWorkspace) {
        throw new Error('User not authenticated or no workspace selected');
      }

      const newTransaction = await apiAddTransaction(
        session.user.id, 
        { ...transaction, workspace_id: currentWorkspace.id }
      );

      // Fix: Get the payment method name and add it to the transaction object
      if (newTransaction.payment_method_id) {
        const paymentMethod = paymentMethods.find(p => p.id === newTransaction.payment_method_id);
        if (paymentMethod) {
          // Create a new object with the payment_method property
          const transactionWithPaymentMethod = {
            ...newTransaction,
            payment_method: paymentMethod.name
          };
          setTransactions(prev => [transactionWithPaymentMethod, ...prev]);
        } else {
          setTransactions(prev => [newTransaction, ...prev]);
        }
      } else {
        setTransactions(prev => [newTransaction, ...prev]);
      }
      
      toast({
        title: transaction.type === 'income' ? 'Income added' : 'Expense added',
        description: `${transaction.description} - $${transaction.amount.toFixed(2)}`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error adding transaction:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to add transaction',
        variant: 'destructive',
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      if (!session?.user?.id || !currentWorkspace) {
        throw new Error('User not authenticated or no workspace selected');
      }

      await apiDeleteTransaction(session.user.id, id, currentWorkspace.id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: 'Transaction deleted',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error deleting transaction:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      });
    }
  };

  const addPaymentMethod = async (name: string) => {
    try {
      if (!session?.user?.id || !currentWorkspace) {
        throw new Error('User not authenticated or no workspace selected');
      }

      const data = await apiAddPaymentMethod(
        session.user.id, 
        name, 
        currentWorkspace.id
      );

      if (data) {
        setPaymentMethods(prev => [...prev, data as PaymentMethod]);
        
        toast({
          title: 'Payment method added',
          description: name,
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error('Error adding payment method:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to add payment method',
        variant: 'destructive',
      });
    }
  };

  const getFilteredTransactions = (type?: TransactionType, yearMonth?: string) => {
    let filtered = [...transactions];
    
    if (type) {
      filtered = filtered.filter(t => t.type === type);
    }
    
    if (yearMonth) {
      filtered = filtered.filter(t => {
        const transactionYearMonth = format(t.date, 'yyyy-MM');
        return transactionYearMonth === yearMonth;
      });
    }
    
    return filtered;
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
        paymentMethods,
        loadingTransactions,
        loadingPaymentMethods,
        addTransaction,
        deleteTransaction,
        getFilteredTransactions,
        getTotalBalance,
        getTotalByType,
        addPaymentMethod
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};
