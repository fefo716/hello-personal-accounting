
import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionType } from '@/types';
import { cn } from '@/lib/utils';

const categories = {
  income: ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Entertainment', 'Housing', 'Utilities', 'Healthcare', 'Shopping', 'Other']
};

const TransactionForm = () => {
  const { addTransaction } = useTransactions();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) return;
    
    addTransaction({
      type,
      amount: parseFloat(amount),
      description,
      category,
      date: new Date()
    });
    
    // Reset form
    setAmount('');
    setDescription('');
    setCategory('');
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 z-10 h-14 w-14 rounded-full shadow-lg" 
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Transaction</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4">
          <Tabs 
            defaultValue="expense" 
            className="w-full" 
            onValueChange={(value) => setType(value as TransactionType)}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger 
                value="expense" 
                className={cn(
                  "data-[state=active]:bg-expense-light data-[state=active]:text-expense data-[state=active]:shadow-none",
                  "flex items-center gap-2"
                )}
              >
                <ArrowDown className="h-4 w-4" />
                Expense
              </TabsTrigger>
              <TabsTrigger 
                value="income" 
                className={cn(
                  "data-[state=active]:bg-income-light data-[state=active]:text-income data-[state=active]:shadow-none",
                  "flex items-center gap-2"
                )}
              >
                <ArrowUp className="h-4 w-4" />
                Income
              </TabsTrigger>
            </TabsList>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="What was this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  required
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[type].map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button 
              type="submit" 
              className={cn(
                "w-full",
                type === 'expense' ? "bg-expense hover:bg-expense/90" : "bg-income hover:bg-income/90"
              )}
            >
              Add {type === 'expense' ? 'Expense' : 'Income'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionForm;
