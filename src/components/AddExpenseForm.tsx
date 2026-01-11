import { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExpenses, ExpenseCategory, CATEGORY_LABELS } from '@/hooks/useExpenses';

function getTodayBD() {
  const now = new Date();
  const bdTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
  return bdTime.toISOString().split('T')[0];
}

export default function AddExpenseForm() {
  const { addExpense, isAddingExpense } = useExpenses();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayBD());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    addExpense({
      amount: Number(amount),
      category,
      description: description || undefined,
      expense_date: date,
    });

    // Reset form
    setAmount('');
    setDescription('');
    setDate(getTodayBD());
  };

  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold mb-4">খরচ যোগ করুন</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">পরিমাণ (৳)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="০"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">ক্যাটাগরি</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">তারিখ</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">বিবরণ (ঐচ্ছিক)</Label>
          <Textarea
            id="description"
            placeholder="খরচের বিবরণ লিখুন..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full btn-primary"
          disabled={isAddingExpense || !amount}
        >
          <Plus className="w-4 h-4" />
          খরচ যোগ করুন
        </Button>
      </form>
    </div>
  );
}
