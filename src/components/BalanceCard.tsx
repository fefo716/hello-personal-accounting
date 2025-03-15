
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  className?: string;
}

const BalanceCard = ({ className }: BalanceCardProps) => {
  const { getTotalBalance, getTotalByType } = useTransactions();
  
  const totalBalance = getTotalBalance();
  const totalIncome = getTotalByType('income');
  const totalExpense = getTotalByType('expense');
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={cn("glass card-shadow rounded-3xl overflow-hidden", className)}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Balance</p>
            <h2 className="text-4xl font-bold mt-1">{formatCurrency(totalBalance)}</h2>
          </div>
          <div className="bg-black text-white p-3 rounded-full">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-income-light rounded-2xl p-4">
            <div className="flex items-center mb-2">
              <div className="bg-income/10 p-2 rounded-full mr-3">
                <ArrowUp className="h-5 w-5 text-income" />
              </div>
              <span className="text-sm font-medium">Income</span>
            </div>
            <p className="text-xl font-bold text-income">{formatCurrency(totalIncome)}</p>
          </div>
          
          <div className="bg-expense-light rounded-2xl p-4">
            <div className="flex items-center mb-2">
              <div className="bg-expense/10 p-2 rounded-full mr-3">
                <ArrowDown className="h-5 w-5 text-expense" />
              </div>
              <span className="text-sm font-medium">Expenses</span>
            </div>
            <p className="text-xl font-bold text-expense">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
