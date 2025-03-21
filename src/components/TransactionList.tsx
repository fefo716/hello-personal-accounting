
import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  ArrowUp, 
  ArrowDown,
  MoreVertical,
  Trash2,
  CreditCard
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  limit?: number;
  className?: string;
  showHeading?: boolean;
  type?: 'income' | 'expense';
  yearMonth?: string;
}

const TransactionList = ({ limit, className, showHeading = true, type, yearMonth }: TransactionListProps) => {
  const { getFilteredTransactions, deleteTransaction, loadingTransactions } = useTransactions();
  const [isAnimating, setIsAnimating] = useState<string | null>(null);
  
  // Get filtered transactions
  const filteredTransactions = getFilteredTransactions(type, yearMonth);
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
  
  // Limit the number of transactions to display if specified
  const displayedTransactions = limit ? sortedTransactions.slice(0, limit) : sortedTransactions;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };
  
  const handleDelete = (id: string) => {
    setIsAnimating(id);
    
    // Use setTimeout to give time for the animation to play
    setTimeout(() => {
      deleteTransaction(id);
      setIsAnimating(null);
    }, 300);
  };
  
  // Icons for categories
  const getCategoryIcon = (category: string, type: string) => {
    if (type === 'income') {
      return <ArrowUp className="h-4 w-4 text-income" />;
    } else {
      return <ArrowDown className="h-4 w-4 text-expense" />;
    }
  };
  
  if (loadingTransactions) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }
  
  if (filteredTransactions.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      {showHeading && (
        <h3 className="text-lg font-semibold mb-4">
          {type 
            ? `${type === 'income' ? 'Income' : 'Expense'} Transactions` 
            : yearMonth
              ? `Transactions for ${format(new Date(yearMonth + '-01'), 'MMMM yyyy')}`
              : 'Recent Transactions'
          }
        </h3>
      )}
      
      <div className="space-y-4">
        {displayedTransactions.map((transaction, index) => (
          <div 
            key={transaction.id}
            className={cn(
              "flex justify-between items-center p-4 rounded-xl bg-white border border-border/30 card-shadow",
              "transform transition-all duration-300",
              isAnimating === transaction.id ? "opacity-0 scale-95" : "opacity-100",
              `animate-slide-up animate-delay-${Math.min(index, 4)}`
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                transaction.type === 'income' ? "bg-income-light" : "bg-expense-light"
              )}>
                {getCategoryIcon(transaction.category, transaction.type)}
              </div>
              
              <div>
                <p className="font-medium">{transaction.description}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {transaction.category} • {formatDistanceToNow(transaction.date, { addSuffix: true })}
                  </p>
                  {transaction.payment_method && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="mx-1">•</span>
                      <CreditCard className="h-3 w-3 mr-1" />
                      {transaction.payment_method}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <p className={cn(
                "font-semibold",
                transaction.type === 'income' ? "text-income" : "text-expense"
              )}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </p>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <MoreVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    className="text-expense flex items-center gap-2 cursor-pointer"
                    onClick={() => handleDelete(transaction.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
