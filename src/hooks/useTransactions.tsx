import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Transaction, TransactionType, PaymentMethod } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

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

const TransactionsContext = createContext<TransactionsContextProps | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user?.id) {
      fetchTransactions();
      fetchPaymentMethods();
    } else {
      setTransactions([]);
      setPaymentMethods([]);
      setLoadingTransactions(false);
      setLoadingPaymentMethods(false);
    }
  }, [session?.user?.id]);

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          payment_methods(name)
        `)
        .eq('user_id', session!.user!.id)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const formattedTransactions = data.map(item => ({
          id: item.id,
          type: item.type as TransactionType,
          amount: Number(item.amount),
          description: item.description,
          category: item.category,
          payment_method_id: item.payment_method_id,
          payment_method: item.payment_methods?.name,
          date: new Date(item.date)
        }));
        setTransactions(formattedTransactions);
      }
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

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', session!.user!.id)
        .order('name');

      if (error) {
        throw error;
      }

      if (data) {
        setPaymentMethods(data as PaymentMethod[]);
      }
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
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const formattedDate = transaction.date.toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: session.user.id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          payment_method_id: transaction.payment_method_id,
          date: formattedDate
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        await supabase
          .from('transaction_logs')
          .insert({
            user_id: session.user.id,
            transaction_id: data.id,
            action: 'create',
            details: { transaction: data }
          });

        const newTransaction: Transaction = {
          id: data.id,
          type: data.type as TransactionType,
          amount: Number(data.amount),
          description: data.description,
          category: data.category,
          payment_method_id: data.payment_method_id,
          date: new Date(data.date)
        };

        if (data.payment_method_id) {
          const paymentMethod = paymentMethods.find(p => p.id === data.payment_method_id);
          if (paymentMethod) {
            newTransaction.payment_method = paymentMethod.name;
          }
        }

        setTransactions(prev => [newTransaction, ...prev]);
        
        toast({
          title: transaction.type === 'income' ? 'Income added' : 'Expense added',
          description: `${transaction.description} - $${transaction.amount.toFixed(2)}`,
          duration: 3000,
        });
      }
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
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data: transactionData } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) {
        throw error;
      }

      if (transactionData) {
        await supabase
          .from('transaction_logs')
          .insert([
            {
              user_id: session.user.id,
              transaction_id: id,
              action: 'delete',
              details: { transaction: transactionData }
            }
          ]);
      }

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
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .insert([
          {
            user_id: session.user.id,
            name
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

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

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};
