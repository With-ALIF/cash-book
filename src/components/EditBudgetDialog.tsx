import { useState, useEffect } from 'react';
import { Pencil, Calendar } from 'lucide-react';
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

interface BudgetHistoryItem {
  id: string;
  amount: number;
  description: string | null;
  budget_date: string;
}

interface EditBudgetDialogProps {
  budget: BudgetHistoryItem;
  onUpdate: (id: string, data: { amount: number; description?: string; budget_date: string }) => void;
  isUpdating?: boolean;
}

export default function EditBudgetDialog({ budget, onUpdate, isUpdating }: EditBudgetDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(budget.amount));
  const [description, setDescription] = useState(budget.description || '');
  const [budgetDate, setBudgetDate] = useState(budget.budget_date);

  useEffect(() => {
    if (open) {
      setAmount(String(budget.amount));
      setDescription(budget.description || '');
      setBudgetDate(budget.budget_date);
    }
  }, [open, budget]);

  const handleUpdate = () => {
    if (amount && Number(amount) > 0 && budgetDate) {
      onUpdate(budget.id, {
        amount: Number(amount),
        description: description || undefined,
        budget_date: budgetDate,
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>বাজেট সম্পাদনা করুন</DialogTitle>
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
            onClick={handleUpdate}
            disabled={isUpdating || !amount || !budgetDate}
            className="w-full"
          >
            আপডেট করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
