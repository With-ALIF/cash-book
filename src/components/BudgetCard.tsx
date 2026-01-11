import { useState } from 'react';
import Layout from '@/components/Layout';
import AddExpenseForm from '@/components/AddExpenseForm';
import RecentExpenses from '@/components/RecentExpenses';
import BudgetHistoryList from '@/components/BudgetHistoryList';
import DailySummary from '@/components/DailySummary';
import { Wallet, TrendingUp, TrendingDown, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useBudget } from '@/hooks/useBudget';
import { useExpenses } from '@/hooks/useExpenses';
import BudgetLimitAlert from '@/components/BudgetLimitAlert';

const MONTHS_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

function getBDDate() {
  const now = new Date();
  const bdTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
  return bdTime.toISOString().split('T')[0];
}

export default function Dashboard() {
  const { budget, setBudget, isSettingBudget, currentMonth, currentYear } = useBudget();
  const { totalExpenses } = useExpenses();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [budgetDate, setBudgetDate] = useState(getBDDate());
  const [open, setOpen] = useState(false);

  const budgetAmount = budget?.amount ? Number(budget.amount) : 0;
  const remaining = budgetAmount - totalExpenses;
  const percentUsed = budgetAmount > 0 ? (totalExpenses / budgetAmount) * 100 : 0;

  const handleAddBudget = () => {
    if (amount && Number(amount) > 0 && budgetDate) {
      setBudget({ 
        amount: Number(amount), 
        description: description || undefined,
        budget_date: budgetDate 
      });
      setAmount('');
      setDescription('');
      setBudgetDate(getBDDate());
      setOpen(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {MONTHS_BN[currentMonth - 1]} {currentYear}
            </h2>
            <div className="flex items-center gap-3">
              <BudgetLimitAlert 
                totalBudget={budgetAmount} 
                totalExpenses={totalExpenses} 
              />
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    বাজেট যোগ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>বাজেট যোগ করুন</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>তারিখ</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                          type="date"
                          value={budgetDate}
                          onChange={(e) => setBudgetDate(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>পরিমাণ</Label>
                      <Input
                        type="number"
                        placeholder="পরিমাণ লিখুন"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>বিবরণ (ঐচ্ছিক)</Label>
                      <Textarea
                        placeholder="যেমন: বেতন, বোনাস, উপহার..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <Button 
                      onClick={handleAddBudget}
                      disabled={isSettingBudget || !amount || !budgetDate}
                      className="w-full"
                    >
                      বাজেট যোগ করুন
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">মাসিক বাজেট</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(budgetAmount)}</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <span className="text-sm text-muted-foreground">মোট খরচ</span>
              </div>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${remaining >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <TrendingUp className={`w-5 h-5 ${remaining >= 0 ? 'text-success' : 'text-destructive'}`} />
                </div>
                <span className="text-sm text-muted-foreground">অবশিষ্ট</span>
              </div>
              <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>

          {budgetAmount > 0 && (
            <div className="stat-card !p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">ব্যয়ের অবস্থা</span>
                <span className="font-medium">{Math.round(percentUsed)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    percentUsed > 100 ? 'bg-destructive' : 
                    percentUsed > 75 ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <AddExpenseForm />
          <RecentExpenses />
        </div>
        
        <div className="stat-card">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">বাজেট রিপোর্ট</h2>
          <BudgetHistoryList />
        </div>
        
        <DailySummary />
      </div>
    </Layout>
  );
}