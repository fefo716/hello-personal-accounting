import { useState, useEffect } from 'react';
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
import { ArrowUp, ArrowDown, Plus, CreditCard } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useAuth } from '@/hooks/useAuth';
import { TransactionType } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const categories = {
  income: ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Entertainment', 'Housing', 'Utilities', 'Healthcare', 'Shopping', 'Education', 'Sports', 'Gift', 'Loans', 'Other']
};

const TransactionForm = () => {
  const { addTransaction, paymentMethods, loadingPaymentMethods, addPaymentMethod } = useTransactions();
  const { currentWorkspace, createPersonalWorkspace, workspaces, loadingWorkspaces } = useWorkspace();
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [showPaymentMethodForm, setShowPaymentMethodForm] = useState(false);
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  
  useEffect(() => {
    const checkAndCreateWorkspace = async () => {
      if (open && !loadingWorkspaces && workspaces.length === 0 && session && !creatingWorkspace) {
        setCreatingWorkspace(true);
        await createPersonalWorkspace();
        setCreatingWorkspace(false);
      }
    };
    
    checkAndCreateWorkspace();
  }, [open, loadingWorkspaces, workspaces.length, session, creatingWorkspace]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) return;
    
    if (!currentWorkspace) {
      setCreatingWorkspace(true);
      const newWorkspace = await createPersonalWorkspace();
      setCreatingWorkspace(false);
      
      if (!newWorkspace) {
        toast({
          title: 'Error',
          description: 'No se pudo crear un espacio de trabajo. Inténtalo de nuevo.',
          variant: 'destructive',
        });
        return;
      }
      
      await addTransaction({
        type,
        amount: parseFloat(amount),
        description,
        category,
        payment_method_id: paymentMethodId || undefined,
        date: new Date(),
        workspace_id: newWorkspace.id
      });
    } else {
      await addTransaction({
        type,
        amount: parseFloat(amount),
        description,
        category,
        payment_method_id: paymentMethodId || undefined,
        date: new Date(),
        workspace_id: currentWorkspace.id
      });
    }
    
    setAmount('');
    setDescription('');
    setCategory('');
    setPaymentMethodId('');
    setOpen(false);
  };
  
  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentMethod) return;
    
    await addPaymentMethod(newPaymentMethod);
    setNewPaymentMethod('');
    setShowPaymentMethodForm(false);
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
          {creatingWorkspace ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-center text-sm text-muted-foreground">
                Creando tu espacio personal...
              </p>
            </div>
          ) : (
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
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Button 
                      type="button" 
                      variant="link" 
                      size="sm"
                      className="h-auto p-0 text-xs text-blue-500"
                      onClick={() => setShowPaymentMethodForm(true)}
                    >
                      Add New
                    </Button>
                  </div>
                  
                  {showPaymentMethodForm ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter payment method name"
                        value={newPaymentMethod}
                        onChange={(e) => setNewPaymentMethod(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={handleAddPaymentMethod}
                        disabled={!newPaymentMethod}
                      >
                        Add
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setShowPaymentMethodForm(false);
                          setNewPaymentMethod('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value={paymentMethodId}
                      onValueChange={setPaymentMethodId}
                    >
                      <SelectTrigger id="payment-method" className="w-full">
                        <SelectValue placeholder="Select payment method (optional)" />
                      </SelectTrigger>
                     

