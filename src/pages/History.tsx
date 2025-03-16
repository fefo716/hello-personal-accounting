
import { useState } from 'react';
import Header from '@/components/Header';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionType } from '@/types';

const History = () => {
  const { transactions } = useTransactions();
  const [filter, setFilter] = useState<TransactionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter transactions based on search query
  const filteredTransactions = transactions
    .filter(t => 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.payment_method && t.payment_method.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container pt-24 pb-20">
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold animate-slide-up">Transaction History</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between animate-slide-up animate-delay-1">
            <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={(value) => setFilter(value as TransactionType | 'all')}>
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="income" className="data-[state=active]:bg-income-light data-[state=active]:text-income">Income</TabsTrigger>
                <TabsTrigger value="expense" className="data-[state=active]:bg-expense-light data-[state=active]:text-expense">Expenses</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="animate-slide-up animate-delay-2">
            <TransactionList 
              showHeading={false}
              type={filter === 'all' ? undefined : filter}
            />
            
            {filteredTransactions.length === 0 && searchQuery && (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No transactions found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <TransactionForm />
    </div>
  );
};

export default History;
