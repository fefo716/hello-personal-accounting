
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionType, PaymentMethod } from '@/types';

export const fetchTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      payment_methods(name)
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    throw error;
  }

  if (data) {
    return data.map(item => ({
      id: item.id,
      type: item.type as TransactionType,
      amount: Number(item.amount),
      description: item.description,
      category: item.category,
      payment_method_id: item.payment_method_id,
      payment_method: item.payment_methods?.name,
      date: new Date(item.date)
    }));
  }

  return [];
};

export const fetchPaymentMethods = async (userId: string) => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) {
    throw error;
  }

  return data || [];
};

export const addTransaction = async (
  userId: string,
  transaction: Omit<Transaction, 'id'>
) => {
  const formattedDate = transaction.date.toISOString();

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
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
    await logTransactionAction(userId, data.id, 'create', { transaction: data });
    
    return {
      id: data.id,
      type: data.type as TransactionType,
      amount: Number(data.amount),
      description: data.description,
      category: data.category,
      payment_method_id: data.payment_method_id,
      date: new Date(data.date)
    };
  }

  throw new Error('Failed to add transaction');
};

export const deleteTransaction = async (userId: string, id: string) => {
  const { data: transactionData } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  if (transactionData) {
    await logTransactionAction(userId, id, 'delete', { transaction: transactionData });
  }

  return id;
};

export const addPaymentMethod = async (userId: string, name: string) => {
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      user_id: userId,
      name
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

const logTransactionAction = async (
  userId: string,
  transactionId: string,
  action: string,
  details: any
) => {
  return await supabase
    .from('transaction_logs')
    .insert({
      user_id: userId,
      transaction_id: transactionId,
      action,
      details
    });
};
