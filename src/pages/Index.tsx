
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import StatisticsCard from '@/components/StatisticsCard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container pt-24 pb-20">
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-2xl font-bold animate-slide-up">Dashboard</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <BalanceCard className="animate-slide-up" />
              <TransactionList limit={5} className="animate-slide-up animate-delay-2" />
            </div>
            
            <div className="lg:col-span-2">
              <StatisticsCard className="animate-slide-up animate-delay-1" />
            </div>
          </div>
        </div>
      </main>
      
      <TransactionForm />
    </div>
  );
};

export default Index;
