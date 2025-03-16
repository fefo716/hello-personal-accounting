
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import StatisticsCard from '@/components/StatisticsCard';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionType } from '@/types';

const Statistics = () => {
  const { transactions } = useTransactions();
  const [selectedYearMonth, setSelectedYearMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [filter, setFilter] = useState<TransactionType | 'all'>('all');
  
  // Generate list of available months from transactions
  useEffect(() => {
    const months = new Set<string>();
    
    // Add current month and 11 previous months
    let currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      months.add(format(currentDate, 'yyyy-MM'));
      currentDate = subMonths(currentDate, 1);
    }
    
    // Add months from transactions
    transactions.forEach(transaction => {
      months.add(format(transaction.date, 'yyyy-MM'));
    });
    
    // Sort months in descending order (newest first)
    const sortedMonths = Array.from(months).sort((a, b) => b.localeCompare(a));
    
    setAvailableMonths(sortedMonths);
  }, [transactions]);
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container pt-24 pb-20">
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-2xl font-bold animate-slide-up">Statistics</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between animate-slide-up animate-delay-1">
            <div className="space-y-2 w-full sm:w-64">
              <Label htmlFor="month-select">Select Month</Label>
              <Select
                value={selectedYearMonth}
                onValueChange={setSelectedYearMonth}
              >
                <SelectTrigger id="month-select">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {format(new Date(month + '-01'), 'MMMM yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={(value) => setFilter(value as TransactionType | 'all')}>
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="income" className="data-[state=active]:bg-income-light data-[state=active]:text-income">Income</TabsTrigger>
                <TabsTrigger value="expense" className="data-[state=active]:bg-expense-light data-[state=active]:text-expense">Expenses</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up animate-delay-2">
            <div className="lg:col-span-3">
              <StatisticsCard 
                className="w-full" 
                yearMonth={selectedYearMonth}
                type={filter === 'all' ? undefined : filter}
              />
            </div>
            
            <div className="lg:col-span-3">
              <TransactionList 
                yearMonth={selectedYearMonth}
                type={filter === 'all' ? undefined : filter}
              />
            </div>
          </div>
        </div>
      </main>
      
      <TransactionForm />
    </div>
  );
};

export default Statistics;
