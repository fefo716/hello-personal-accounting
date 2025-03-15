
import { useMemo } from 'react';
import Header from '@/components/Header';
import TransactionForm from '@/components/TransactionForm';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionType } from '@/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9f7aea', '#ed64a6', '#48bb78', '#38b2ac'];

const Statistics = () => {
  const { transactions } = useTransactions();
  
  // Group by category function
  const groupByCategory = (type: TransactionType) => {
    const filtered = transactions.filter(t => t.type === type);
    
    const grouped = filtered.reduce((acc, curr) => {
      const existingCategory = acc.find(item => item.name === curr.category);
      
      if (existingCategory) {
        existingCategory.value += curr.amount;
      } else {
        acc.push({
          name: curr.category,
          value: curr.amount
        });
      }
      
      return acc;
    }, [] as { name: string; value: number }[]);
    
    return grouped.sort((a, b) => b.value - a.value);
  };
  
  // Monthly data for bar chart
  const monthlyData = useMemo(() => {
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        timestamp: date.getTime(),
        income: 0,
        expenses: 0
      };
    }).reverse();
    
    transactions.forEach(transaction => {
      const transactionMonth = new Date(transaction.date).getMonth();
      const transactionYear = new Date(transaction.date).getFullYear();
      
      lastSixMonths.forEach(monthData => {
        const monthDate = new Date(monthData.timestamp);
        const dataMonth = monthDate.getMonth();
        const dataYear = monthDate.getFullYear();
        
        if (transactionMonth === dataMonth && transactionYear === dataYear) {
          if (transaction.type === 'income') {
            monthData.income += transaction.amount;
          } else {
            monthData.expenses += transaction.amount;
          }
        }
      });
    });
    
    return lastSixMonths;
  }, [transactions]);
  
  // Category data for pie charts
  const incomeByCategory = useMemo(() => groupByCategory('income'), [transactions]);
  const expensesByCategory = useMemo(() => groupByCategory('expense'), [transactions]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-border/50">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container pt-24 pb-20">
        <div className="space-y-10 animate-fade-in">
          <h1 className="text-2xl font-bold animate-slide-up">Statistics</h1>
          
          {/* Monthly Overview */}
          <div className="glass card-shadow rounded-3xl p-6 animate-slide-up animate-delay-1">
            <h2 className="text-lg font-semibold mb-6">Monthly Overview</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`}
                    width={60}
                  />
                  <Tooltip content={renderCustomTooltip} />
                  <Bar dataKey="income" name="Income" fill="hsl(143, 85%, 40%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="hsl(355, 78%, 56%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Category Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Categories */}
            <div className={cn(
              "glass card-shadow rounded-3xl p-6 animate-slide-up animate-delay-2",
              incomeByCategory.length === 0 ? "flex items-center justify-center" : ""
            )}>
              <h2 className="text-lg font-semibold mb-6">Income by Category</h2>
              
              {incomeByCategory.length === 0 ? (
                <p className="text-muted-foreground">No income data available</p>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeByCategory}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${Math.round((entry.value / incomeByCategory.reduce((a, b) => a + b.value, 0)) * 100)}%`}
                        labelLine={false}
                      >
                        {incomeByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            
            {/* Expense Categories */}
            <div className={cn(
              "glass card-shadow rounded-3xl p-6 animate-slide-up animate-delay-3",
              expensesByCategory.length === 0 ? "flex items-center justify-center" : ""
            )}>
              <h2 className="text-lg font-semibold mb-6">Expenses by Category</h2>
              
              {expensesByCategory.length === 0 ? (
                <p className="text-muted-foreground">No expense data available</p>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${Math.round((entry.value / expensesByCategory.reduce((a, b) => a + b.value, 0)) * 100)}%`}
                        labelLine={false}
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <TransactionForm />
    </div>
  );
};

export default Statistics;
