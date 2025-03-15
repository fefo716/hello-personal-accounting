
import { useTransactions } from '@/hooks/useTransactions';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatisticsCardProps {
  className?: string;
}

const StatisticsCard = ({ className }: StatisticsCardProps) => {
  const { transactions, getTotalByType } = useTransactions();
  
  const totalIncome = getTotalByType('income');
  const totalExpense = getTotalByType('expense');
  
  // Calculate percentages
  const totalSum = totalIncome + totalExpense;
  const incomePercentage = totalSum ? Math.round((totalIncome / totalSum) * 100) : 0;
  const expensePercentage = totalSum ? Math.round((totalExpense / totalSum) * 100) : 0;
  
  const data = [
    { name: 'Income', value: totalIncome, color: 'hsl(143, 85%, 40%)' },
    { name: 'Expenses', value: totalExpense, color: 'hsl(355, 78%, 56%)' }
  ];
  
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
            {data.name === 'Income' ? incomePercentage : expensePercentage}% of total
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
  
  return (
    <div className={cn("glass card-shadow rounded-3xl p-6", className)}>
      <h3 className="text-lg font-semibold mb-6">Income vs Expenses</h3>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              {...chartConfig}
              label={false}
            >
              {data.map((entry, index) => (
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
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Income</p>
          <p className="text-lg font-bold text-income">{incomePercentage}%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Expenses</p>
          <p className="text-lg font-bold text-expense">{expensePercentage}%</p>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;
