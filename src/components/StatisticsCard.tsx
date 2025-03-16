
import { useTransactions } from '@/hooks/useTransactions';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TransactionType } from '@/types';

interface StatisticsCardProps {
  className?: string;
  yearMonth?: string;
  type?: TransactionType;
}

const StatisticsCard = ({ className, yearMonth, type }: StatisticsCardProps) => {
  const { getFilteredTransactions, getTotalByType } = useTransactions();
  
  // Get filtered transactions based on year-month and type
  const filteredTransactions = getFilteredTransactions(type, yearMonth);
  
  // Calculate totals for the filtered period
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  
  // Calculate percentages
  const totalSum = totalIncome + totalExpense;
  const incomePercentage = totalSum ? Math.round((totalIncome / totalSum) * 100) : 0;
  const expensePercentage = totalSum ? Math.round((totalExpense / totalSum) * 100) : 0;
  
  // Get category data for the chart
  const getCategoryData = () => {
    const categorySums = new Map();
    
    // If type is specified, only show categories for that type
    const transactionsToCount = type 
      ? filteredTransactions.filter(t => t.type === type)
      : filteredTransactions;
      
    // Sum amounts by category
    transactionsToCount.forEach(transaction => {
      const key = `${transaction.category} (${transaction.type})`;
      const existing = categorySums.get(key) || 0;
      categorySums.set(key, existing + transaction.amount);
    });
    
    // Convert to array for recharts
    return Array.from(categorySums.entries()).map(([name, value]) => ({
      name,
      value,
      color: name.includes('(income)') ? 'hsl(143, 85%, 40%)' : 'hsl(355, 78%, 56%)'
    }));
  };
  
  const categoryData = getCategoryData();
  
  // Main chart data (income vs expense)
  const overviewData = [
    { name: 'Income', value: totalIncome, color: 'hsl(143, 85%, 40%)' },
    { name: 'Expenses', value: totalExpense, color: 'hsl(355, 78%, 56%)' }
  ];
  
  // Use category data if filtering by type, otherwise use overview
  const chartData = type ? categoryData : overviewData;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const renderTooltipContent = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-border/50">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{formatCurrency(data.value)}</p>
          <p className="text-xs text-muted-foreground">
            {Math.round((data.value / totalSum) * 100)}% of total
          </p>
        </div>
      );
    }
    return null;
  };
  
  const chartConfig = {
    cx: "50%",
    cy: "50%",
    outerRadius: 80,
    innerRadius: 55,
    fill: "#8884d8",
    paddingAngle: 5,
    dataKey: "value",
  };
  
  // Get title based on filters
  const getTitle = () => {
    let title = 'Income vs Expenses';
    
    if (yearMonth) {
      title += ` - ${format(new Date(yearMonth + '-01'), 'MMMM yyyy')}`;
    }
    
    if (type) {
      title = type === 'income' ? 'Income' : 'Expenses';
      title += ' by Category';
      
      if (yearMonth) {
        title += ` - ${format(new Date(yearMonth + '-01'), 'MMMM yyyy')}`;
      }
    }
    
    return title;
  };
  
  return (
    <div className={cn("glass card-shadow rounded-3xl p-6", className)}>
      <h3 className="text-lg font-semibold mb-6">{getTitle()}</h3>
      
      {chartData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available for this period</p>
        </div>
      ) : (
        <>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  {...chartConfig}
                  label={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={renderTooltipContent} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value, entry, index) => (
                    <span className="text-sm font-medium">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {!type && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-lg font-bold text-income">{formatCurrency(totalIncome)}</p>
                <p className="text-xs text-muted-foreground">{incomePercentage}% of total</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-lg font-bold text-expense">{formatCurrency(totalExpense)}</p>
                <p className="text-xs text-muted-foreground">{expensePercentage}% of total</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StatisticsCard;
